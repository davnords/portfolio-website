"use client";
import React, { useRef, useMemo, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { venueTagColor } from "@/lib/venue";

// ============================================================================
// Types
// ============================================================================

export interface MarkerPaper {
  /** Paper title */
  title: string;
  /** Short author list */
  authors?: string;
  /** Track / distinction, e.g. "Oral", "Workshop", "Spotlight" */
  track?: string;
  /** Link to the paper (arXiv, project page, ...) */
  href?: string;
}

export interface GlobeMarker {
  lat: number;
  lng: number;
  src: string;
  /** Short name shown on hover, e.g. "ECCV 2026" */
  label?: string;
  size?: number;
  /** Full conference name shown in the detail card */
  name?: string;
  /** City / country, e.g. "Malmö, Sweden" */
  location?: string;
  /** When it takes place, e.g. "September 2026" */
  dates?: string;
  /** Papers presented at this venue */
  papers?: MarkerPaper[];
}

/** Whether a marker carries enough data to be worth opening a card for */
function hasDetails(marker: GlobeMarker): boolean {
  return Boolean(marker.name || marker.location || marker.papers?.length);
}

export interface Globe3DConfig {
  /** Globe radius */
  radius?: number;
  /** Globe base color (used as fallback or tint) */
  globeColor?: string;
  /** URL to the Earth texture map */
  textureUrl?: string;
  /** URL to the bump/elevation map for terrain */
  bumpMapUrl?: string;
  /** Whether to show atmosphere glow */
  showAtmosphere?: boolean;
  /** Atmosphere color */
  atmosphereColor?: string;
  /** Atmosphere intensity */
  atmosphereIntensity?: number;
  /** Atmosphere blur/softness (higher = more diffuse, default 3) */
  atmosphereBlur?: number;
  /** Terrain bump scale (0 = flat, higher = more pronounced) */
  bumpScale?: number;
  /** Auto rotate speed (0 = disabled) */
  autoRotateSpeed?: number;
  /** Enable zoom */
  enableZoom?: boolean;
  /** Enable pan */
  enablePan?: boolean;
  /** Min zoom distance */
  minDistance?: number;
  /** Max zoom distance */
  maxDistance?: number;
  /** Initial rotation */
  initialRotation?: { x: number; y: number };
  /** Marker default size */
  markerSize?: number;
  /** Show wireframe overlay */
  showWireframe?: boolean;
  /** Wireframe color */
  wireframeColor?: string;
  /** Ambient light intensity */
  ambientIntensity?: number;
  /** Point light intensity */
  pointLightIntensity?: number;
  /** Background color (null for transparent) */
  backgroundColor?: string | null;
}

interface Globe3DProps {
  /** Array of markers to display on the globe */
  markers?: GlobeMarker[];
  /** Globe configuration */
  config?: Globe3DConfig;
  /** Additional CSS classes */
  className?: string;
  /** Callback when a marker is clicked */
  onMarkerClick?: (marker: GlobeMarker) => void;
  /** Callback when a marker is hovered */
  onMarkerHover?: (marker: GlobeMarker | null) => void;
  /** Classes for the marker detail card — pass placement utilities (e.g.
   *  "left-16 bottom-8"), since the card is absolutely positioned in the
   *  container and the container is often larger than its visible area. */
  cardClassName?: string;
}

// ============================================================================
// Constants - Earth Texture URLs (NASA Blue Marble)
// ============================================================================

const DEFAULT_EARTH_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";
const DEFAULT_BUMP_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png";

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert latitude/longitude to 3D cartesian coordinates
 */
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// ============================================================================
// Marker Component (static - rotation handled by parent group)
// ============================================================================

interface MarkerProps {
  marker: GlobeMarker;
  radius: number;
  defaultSize: number;
  /** Whether this marker's detail card is currently open */
  selected?: boolean;
  onClick?: (marker: GlobeMarker) => void;
  onHover?: (marker: GlobeMarker | null) => void;
}

function Marker({
  marker,
  radius,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultSize,
  selected = false,
  onClick,
  onHover,
}: MarkerProps) {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const groupRef = useRef<THREE.Group>(null);
  const imageGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Surface position (where the line starts)
  const surfacePosition = useMemo(() => {
    return latLngToVector3(marker.lat, marker.lng, radius * 1.001);
  }, [marker.lat, marker.lng, radius]);

  // Top of the line (where the image is) - positioned further out to prevent going inside globe
  const topPosition = useMemo(() => {
    return latLngToVector3(marker.lat, marker.lng, radius * 1.18);
  }, [marker.lat, marker.lng, radius]);

  const lineHeight = topPosition.distanceTo(surfacePosition);

  // Check if marker is facing the camera
  useFrame(() => {
    if (!imageGroupRef.current) return;

    // Get the world position of the image (the positioned element)
    const worldPos = new THREE.Vector3();
    imageGroupRef.current.getWorldPosition(worldPos);

    // Direction from globe center (0,0,0) to marker
    const markerDirection = worldPos.clone().normalize();

    // Direction from globe center to camera
    const cameraDirection = camera.position.clone().normalize();

    // Dot product: positive means facing camera, negative means behind
    const dot = markerDirection.dot(cameraDirection);

    // Show marker only if it's facing the camera (stricter threshold)
    setIsVisible(dot > 0.1);
  });

  const handlePointerEnter = useCallback(() => {
    setHovered(true);
    onHover?.(marker);
  }, [marker, onHover]);

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    onHover?.(null);
  }, [onHover]);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onClick?.(marker);
    },
    [marker, onClick],
  );

  // Calculate line center and orientation
  const { lineCenter, lineQuaternion } = useMemo(() => {
    const center = surfacePosition.clone().lerp(topPosition, 0.5);

    // Calculate rotation to align cylinder with the direction from surface to top
    const direction = topPosition.clone().sub(surfacePosition).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    return { lineCenter: center, lineQuaternion: quaternion };
  }, [surfacePosition, topPosition]);

  return (
    <group ref={groupRef} visible={isVisible}>
      {/* Pin line from surface to image - properly oriented */}
      <mesh position={lineCenter} quaternion={lineQuaternion}>
        <cylinderGeometry args={[0.003, 0.003, lineHeight, 8]} />
        <meshBasicMaterial
          color={hovered || selected ? "#ffffff" : "#94a3b8"}
          transparent
          opacity={hovered || selected ? 0.9 : 0.6}
        />
      </mesh>

      {/* Pin point at the surface */}
      <mesh position={surfacePosition} quaternion={lineQuaternion}>
        <coneGeometry args={[0.015, 0.04, 8]} />
        <meshBasicMaterial
          color={hovered || selected ? "#f97316" : "#ef4444"}
        />
      </mesh>

      {/* Circular image at the top */}
      <group ref={imageGroupRef} position={topPosition}>
        <Html
          center
          style={{
            pointerEvents: isVisible ? "auto" : "none",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.15s ease-out",
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Name label on hover */}
            {marker.label && (
              <div
                className={cn(
                  "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-neutral-900/90 px-2 py-1 text-[11px] font-medium leading-none text-white shadow-lg backdrop-blur-sm transition-all duration-150",
                  hovered || selected
                    ? "translate-y-0 opacity-100"
                    : "translate-y-1 opacity-0",
                )}
              >
                {marker.label}
              </div>
            )}

            <div
              className={cn(
                "cursor-pointer overflow-hidden rounded-full bg-neutral-900 shadow-lg transition-transform duration-200",
                hovered && "scale-125 shadow-xl ring-1 ring-white/50",
                selected && "scale-125 shadow-xl ring-2 ring-orange-400",
              )}
              style={{
                width: "32px",
                height: "32px",
              }}
              onMouseEnter={handlePointerEnter}
              onMouseLeave={handlePointerLeave}
              onClick={handleClick}
            >
              <img
                src={marker.src}
                alt={marker.label || "Marker"}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ============================================================================
// Rotating Globe with Markers (all rotate together)
// ============================================================================

interface RotatingGlobeProps {
  config: Required<Globe3DConfig>;
  markers: GlobeMarker[];
  selectedIndex: number | null;
  onMarkerClick?: (marker: GlobeMarker, index: number) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

function RotatingGlobe({
  config,
  markers,
  selectedIndex,
  onMarkerClick,
  onMarkerHover,
}: RotatingGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Load Earth textures
  const [earthTexture, bumpTexture] = useTexture([
    config.textureUrl,
    config.bumpMapUrl,
  ]);

  // Configure textures
  useMemo(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace;
      earthTexture.anisotropy = 16;
    }
    if (bumpTexture) {
      bumpTexture.anisotropy = 8;
    }
  }, [earthTexture, bumpTexture]);

  // Create geometries
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(config.radius, 64, 64);
  }, [config.radius]);

  const wireframeGeometry = useMemo(() => {
    return new THREE.SphereGeometry(config.radius * 1.002, 32, 16);
  }, [config.radius]);

  return (
    <group ref={groupRef}>
      {/* Main globe mesh with Earth texture */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={config.bumpScale * 0.05}
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Wireframe overlay */}
      {config.showWireframe && (
        <mesh geometry={wireframeGeometry}>
          <meshBasicMaterial
            color={config.wireframeColor}
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
      )}

      {/* Markers - now inside the rotating group */}
      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}-${marker.lat}-${marker.lng}`}
          marker={marker}
          radius={config.radius}
          defaultSize={config.markerSize}
          selected={selectedIndex === index}
          onClick={(m) => onMarkerClick?.(m, index)}
          onHover={onMarkerHover}
        />
      ))}
    </group>
  );
}

// ============================================================================
// Atmosphere Component (stays static - doesn't rotate)
// ============================================================================

interface AtmosphereProps {
  radius: number;
  color: string;
  intensity: number;
  blur: number;
}

function Atmosphere({ radius, color, intensity, blur }: AtmosphereProps) {
  // blur controls the fresnel exponent: lower = more diffuse, higher = sharper edge
  // We invert it so higher blur value = more diffuse (lower exponent)
  const fresnelPower = Math.max(0.5, 5 - blur);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        atmosphereColor: { value: new THREE.Color(color) },
        intensity: { value: intensity },
        fresnelPower: { value: fresnelPower },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 atmosphereColor;
        uniform float intensity;
        uniform float fresnelPower;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, normalize(-vPosition))), fresnelPower);
          gl_FragColor = vec4(atmosphereColor, fresnel * intensity);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, [color, intensity, fresnelPower]);

  return (
    <mesh scale={[1.12, 1.12, 1.12]}>
      <sphereGeometry args={[radius, 64, 32]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
}

// ============================================================================
// Scene Component
// ============================================================================

interface SceneProps {
  markers: GlobeMarker[];
  config: Required<Globe3DConfig>;
  selectedIndex: number | null;
  /** Freeze the auto-rotation (while hovering or reading a marker card) */
  paused?: boolean;
  onMarkerClick?: (marker: GlobeMarker, index: number) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
}

function Scene({
  markers,
  config,
  selectedIndex,
  paused = false,
  onMarkerClick,
  onMarkerHover,
}: SceneProps) {
  const { camera } = useThree();

  // Set initial camera position (pulled back to accommodate markers)
  React.useEffect(() => {
    camera.position.set(0, 0, config.radius * 3.5);
    camera.lookAt(0, 0, 0);
  }, [camera, config.radius]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={[config.radius * 5, config.radius * 2, config.radius * 5]}
        intensity={config.pointLightIntensity}
        color="#ffffff"
      />
      <directionalLight
        position={[-config.radius * 3, config.radius, -config.radius * 2]}
        intensity={config.pointLightIntensity * 0.3}
        color="#88ccff"
      />

      {/* Rotating Globe with Markers */}
      <RotatingGlobe
        config={config}
        markers={markers}
        selectedIndex={selectedIndex}
        onMarkerClick={onMarkerClick}
        onMarkerHover={onMarkerHover}
      />

      {/* Atmosphere (static) */}
      {config.showAtmosphere && (
        <Atmosphere
          radius={config.radius}
          color={config.atmosphereColor}
          intensity={config.atmosphereIntensity}
          blur={config.atmosphereBlur}
        />
      )}

      {/* Controls */}
      <OrbitControls
        makeDefault
        enablePan={config.enablePan}
        enableZoom={config.enableZoom}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
        rotateSpeed={0.4}
        autoRotate={config.autoRotateSpeed > 0 && !paused}
        autoRotateSpeed={config.autoRotateSpeed}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  );
}

// ============================================================================
// Marker Detail Card
// ============================================================================

function MarkerCard({
  marker,
  className,
  onClose,
}: {
  marker: GlobeMarker;
  className?: string;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "absolute w-[320px] max-w-full rounded-xl border bg-background/95 p-4 shadow-xl backdrop-blur-md",
        className,
      )}
      // drei's <Html> markers render at z-index ~16777271, so sit just above them
      style={{ zIndex: 16777280 }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="h-3.5 w-3.5"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 pr-6">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-900">
          <img
            src={marker.src}
            alt={marker.label || "Venue"}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {marker.label ?? marker.name}
          </p>
          {marker.name && marker.label && (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              {marker.name}
            </p>
          )}
          {(marker.location || marker.dates) && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {[marker.location, marker.dates].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Papers */}
      {marker.papers && marker.papers.length > 0 && (
        <div className="mt-3 border-t pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {marker.papers.length === 1 ? "1 paper" : `${marker.papers.length} papers`}
          </p>
          <ul className="space-y-2">
            {marker.papers.map((paper) => {
              const title = (
                <span className="font-medium text-foreground">
                  {paper.title}
                </span>
              );
              return (
                <li key={paper.title} className="text-xs leading-snug">
                  <div className="flex items-start gap-1.5">
                    <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                    <div className="min-w-0">
                      {paper.href ? (
                        <a
                          href={paper.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:decoration-foreground"
                        >
                          {title}
                        </a>
                      ) : (
                        title
                      )}
                      {paper.track && (
                        <span className={cn("ml-1.5 align-middle text-[10px] font-semibold uppercase tracking-wide", venueTagColor(paper.track))}>
                          {paper.track}
                        </span>
                      )}
                      {paper.authors && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {paper.authors}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Loading Fallback
// ============================================================================

function LoadingFallback() {
  return null;
}

// ============================================================================
// Main Globe3D Component
// ============================================================================

const defaultConfig: Required<Globe3DConfig> = {
  radius: 2,
  globeColor: "#1a1a2e",
  textureUrl: DEFAULT_EARTH_TEXTURE,
  bumpMapUrl: DEFAULT_BUMP_TEXTURE,
  showAtmosphere: false,
  atmosphereColor: "#4da6ff",
  atmosphereIntensity: 0.5,
  atmosphereBlur: 2,
  bumpScale: 1,
  autoRotateSpeed: 0.3,
  enableZoom: false,
  enablePan: false,
  minDistance: 5,
  maxDistance: 15,
  initialRotation: { x: 0, y: 0 },
  markerSize: 0.06,
  showWireframe: false,
  wireframeColor: "#4a9eff",
  ambientIntensity: 0.6,
  pointLightIntensity: 1.5,
  backgroundColor: null,
};

export function Globe3D({
  markers = [],
  config = {},
  className,
  onMarkerClick,
  onMarkerHover,
  cardClassName,
}: Globe3DProps) {
  const mergedConfig = useMemo(
    () => ({ ...defaultConfig, ...config }),
    [config],
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMarkerClick = useCallback(
    (marker: GlobeMarker, index: number) => {
      onMarkerClick?.(marker);
      if (!hasDetails(marker)) return;
      setSelectedIndex((current) => (current === index ? null : index));
    },
    [onMarkerClick],
  );

  const handleMarkerHover = useCallback(
    (marker: GlobeMarker | null) => {
      onMarkerHover?.(marker);
      setIsHovering(Boolean(marker));
    },
    [onMarkerHover],
  );

  const closeCard = useCallback(() => setSelectedIndex(null), []);

  const selectedMarker =
    selectedIndex !== null ? markers[selectedIndex] : undefined;

  return (
    <div className={cn("relative h-[500px] w-full", className)}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, mergedConfig.radius * 3.5],
        }}
        style={{
          background: mergedConfig.backgroundColor || "transparent",
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            markers={markers}
            config={mergedConfig}
            selectedIndex={selectedIndex}
            paused={isHovering || selectedIndex !== null}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={handleMarkerHover}
          />
        </Suspense>
      </Canvas>

      {selectedMarker && (
        <MarkerCard
          marker={selectedMarker}
          className={cardClassName}
          onClose={closeCard}
        />
      )}
    </div>
  );
}

export default Globe3D;
