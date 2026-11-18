'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, RotateCcwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { inferno } from './palette'
import { Segmented } from './charts'

/*
 * Interactive viewer for the exported VGGT-μ predictions in
 * public/projects/vggt-mu/data/<scene>/ (cameras.json, thumbs.jpg, points.bin).
 * Ported from the reference viewer that came with the export; the data format
 * is documented in its README. Cameras are OpenCV (x right, y down, z forward),
 * quaternions camera-to-world as [x, y, z, w].
 */

const DATA = '/projects/vggt-mu/data/'

const SCENES = [
  { id: 'cambridge_GreatCourt', label: 'Great Court', sub: '1,500' },
  { id: 'cambridge_StMarysChurch', label: "St Mary's Church", sub: '1,487' },
  { id: 'cambridge_KingsCollege', label: "King's College", sub: '1,220' },
  { id: 'cambridge_OldHospital', label: 'Old Hospital', sub: '895' },
  { id: 'cambridge_ShopFacade', label: 'Shop Facade', sub: '231' },
  { id: 'mixed_7scenes', label: 'Mixed scenes', sub: '7-Scenes' },
  { id: 'visloc_KingsCollege', label: 'Localization', sub: "King's College" },
] as const
type SceneId = (typeof SCENES)[number]['id']

type V3 = [number, number, number]
type Q4 = [number, number, number, number]
type Atlas = { file: string; cols: number; tile: [number, number]; count: number }
type PointsMeta = { file: string; count: number }
type Pose = { center: V3; quat: Q4 }

type Cambridge = {
  kind: 'cambridge'
  frames: number
  runtime_s: number
  peak_gib: number
  input_size: [number, number]
  pred: { centers: V3[]; quats: Q4[]; fov_y_deg: number[] }
  gt: { centers: V3[]; quats: Q4[] }
  error: { t_m: number[]; r_deg: number[]; median_t_m: number; median_r_deg: number }
  uncertainty_deg: number[]
  edges: [number, number, number, number][]
  atlas: Atlas
  points: PointsMeta
}
type Mixed = {
  kind: 'mixed'
  scene_names: string[]
  scene: number[]
  cluster: number[]
  pred: { centers: (V3 | null)[]; quats: (Q4 | null)[] }
  atlas: Atlas
}
type Visloc = {
  kind: 'visloc'
  database: { centers: V3[]; quats: Q4[] }
  queries: ({ refs: number[]; gt: Pose; name: string } & Record<'poses' | 'poses+focals', Pose & { t_err_m: number }>)[]
  atlas: Atlas
  points: PointsMeta
}
type Loaded = (Cambridge | Mixed | Visloc) & { texture: THREE.Texture; atlasImg: HTMLImageElement; radius: number }

const OURS = new THREE.Color('#c93a4c')
const GT = new THREE.Color('#9a9a9a')
const REF = new THREE.Color('#5b7bd0')
const GROUPS = ['#c93a4c', '#5b7bd0', '#3f9a8f', '#c08a3e', '#8c6bb1']

const qv = (q: Q4) => new THREE.Quaternion(q[0], q[1], q[2], q[3])
const v3 = (c: V3) => new THREE.Vector3(c[0], c[1], c[2])
/** green → red, for error and uncertainty */
const heat = (t: number) => new THREE.Color().setHSL(0.33 * (1 - Math.min(1, Math.max(0, t))), 0.8, 0.47)
const byTime = (t: number, dark: boolean) => {
  const [r, g, b] = inferno(dark ? 0.25 + t * 0.72 : 0.1 + t * 0.72)
  return new THREE.Color(r / 255, g / 255, b / 255)
}

/** Image-plane corners in camera coordinates at depth s. */
function corners(fovY: number, aspect: number, s: number) {
  const h = Math.tan(fovY / 2) * s
  const w = h * aspect
  return [
    [-w, -h, s],
    [w, -h, s],
    [w, h, s],
    [-w, h, s],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z))
}

/** All frustum wireframes in one buffer, 16 vertices per camera so drawRange can reveal a prefix. */
function frustumLines(centers: (V3 | null)[], quats: (Q4 | null)[], fovs: number[], aspect: number, size: number, colors: THREE.Color[], opacity = 1) {
  const pos: number[] = []
  const col: number[] = []
  centers.forEach((c, i) => {
    if (!c) return
    const C = v3(c)
    const Q = qv(quats[i]!)
    const k = corners(fovs[i], aspect, size).map((p) => p.applyQuaternion(Q).add(C))
    const segs = [[C, k[0]], [C, k[1]], [C, k[2]], [C, k[3]], [k[0], k[1]], [k[1], k[2]], [k[2], k[3]], [k[3], k[0]]]
    for (const [a, b] of segs) {
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z)
      col.push(...colors[i].toArray(), ...colors[i].toArray())
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: opacity < 1, opacity }))
}

/** One textured quad per camera on its image plane, UVs into the thumbnail atlas; 6 indices per camera. */
function imagePlanes(centers: (V3 | null)[], quats: (Q4 | null)[], fovs: number[], aspect: number, size: number, atlas: Atlas, texture: THREE.Texture, indices?: number[]) {
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const rows = Math.ceil(atlas.count / atlas.cols)
  let n = 0
  centers.forEach((c, i) => {
    if (!c) return
    const C = v3(c)
    const Q = qv(quats[i]!)
    const k = corners(fovs[i], aspect, size).map((p) => p.applyQuaternion(Q).add(C))
    const a = indices ? indices[i] : i
    const u0 = (a % atlas.cols) / atlas.cols
    const u1 = u0 + 1 / atlas.cols
    const v1 = 1 - Math.floor(a / atlas.cols) / rows
    const v0 = v1 - 1 / rows
    for (const p of k) pos.push(p.x, p.y, p.z)
    uv.push(u0, v1, u1, v1, u1, v0, u0, v0) // y down: top-left, top-right, bottom-right, bottom-left
    idx.push(n, n + 1, n + 2, n, n + 2, n + 3)
    n += 4
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }))
}

async function pointCloud(url: string, meta: PointsMeta, maxDist: number, center: THREE.Vector3) {
  const buf = await (await fetch(url)).arrayBuffer()
  const n = meta.count
  const xyz = new Float32Array(buf, 0, 3 * n)
  const rgb = new Uint8Array(buf, 12 * n, 3 * n)
  const pos: number[] = []
  const col: number[] = []
  const p = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    p.set(xyz[3 * i], xyz[3 * i + 1], xyz[3 * i + 2])
    if (p.distanceTo(center) > maxDist) continue
    pos.push(p.x, p.y, p.z)
    col.push(rgb[3 * i] / 255, rgb[3 * i + 1] / 255, rgb[3 * i + 2] / 255)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return new THREE.Points(g, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.5 }))
}

function dispose(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh
    m.geometry?.dispose()
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
    else mat?.dispose()
  })
}

type Three = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  root: THREE.Group
  layer: THREE.Group
}

export function PoseViewer() {
  const mountRef = useRef<HTMLDivElement>(null)
  const three = useRef<Three | null>(null)
  const [sceneId, setSceneId] = useState<SceneId>('cambridge_GreatCourt')
  const [data, setData] = useState<Loaded | null>(null)
  const [error, setError] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const [dark, setDark] = useState(false)

  // cambridge controls
  const [colour, setColour] = useState<'time' | 'error' | 'unc'>('time')
  const [shown, setShown] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [images, setImages] = useState(true)
  const [showGt, setShowGt] = useState(false)
  const [edges, setEdges] = useState(false)
  // visloc controls
  const [qi, setQi] = useState(0)
  const [cond, setCond] = useState<'poses+focals' | 'poses'>('poses+focals')
  const [picked, setPicked] = useState<{ i: number; text: string } | null>(null)
  const thumbRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const read = () => setDark(document.documentElement.classList.contains('dark'))
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  // ---- renderer, once ----
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1e5)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    // wheel-zoom waits for a click, so scrolling the page past the viewer is never captured
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    const root = new THREE.Group()
    const layer = new THREE.Group()
    root.add(layer)
    scene.add(root)
    three.current = { renderer, scene, camera, controls, root, layer }

    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      controls.update()
      renderer.render(scene, camera)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      dispose(scene)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      three.current = null
    }
  }, [])

  useEffect(() => {
    const t = three.current
    if (!t) return
    t.controls.enableZoom = interacted
    t.controls.autoRotate = !interacted
  }, [interacted])

  // ---- load a scene: data, thumbnails, context points, framing ----
  useEffect(() => {
    const t = three.current
    if (!t) return
    let cancelled = false
    setData(null)
    setError(false)
    setPicked(null)
    for (const c of [...t.root.children]) {
      t.root.remove(c)
      dispose(c)
    }
    t.layer = new THREE.Group()
    t.root.add(t.layer)

    const dir = DATA + sceneId + '/'
    const kind = sceneId.startsWith('cambridge') ? 'cambridge' : sceneId.startsWith('mixed') ? 'mixed' : 'visloc'
    ;(async () => {
      const m = await (await fetch(dir + 'cameras.json')).json()
      const texture = await new THREE.TextureLoader().loadAsync(dir + 'thumbs.jpg')
      texture.colorSpace = THREE.SRGBColorSpace
      const atlasImg = await new Promise<HTMLImageElement>((ok, bad) => {
        const im = new Image()
        im.onload = () => ok(im)
        im.onerror = bad
        im.src = dir + 'thumbs.jpg'
      })
      if (cancelled) return texture.dispose()

      // orient: "up" is minus the mean camera y axis, then frame the camera centres
      const quats: (Q4 | null)[] = kind === 'visloc' ? m.database.quats : m.pred.quats
      let centers: (V3 | null)[] = kind === 'visloc' ? m.database.centers : m.pred.centers
      if (kind === 'mixed') centers = mixedLayout(m)
      const up = new THREE.Vector3()
      quats.forEach((q) => q && up.add(new THREE.Vector3(0, -1, 0).applyQuaternion(qv(q))))
      t.root.quaternion.setFromUnitVectors(up.normalize(), new THREE.Vector3(0, 1, 0))
      const box = new THREE.Box3()
      centers.forEach((c) => c && box.expandByPoint(v3(c).applyQuaternion(t.root.quaternion)))
      const mid = box.getCenter(new THREE.Vector3())
      const radius = box.getSize(new THREE.Vector3()).length() / 2 || 1
      t.controls.target.copy(mid)
      t.camera.position.copy(mid).add(new THREE.Vector3(0, 0.95 * radius, 1.15 * radius))
      t.camera.near = radius / 1000
      t.camera.far = radius * 100
      t.camera.updateProjectionMatrix()

      if (m.points) {
        const raw = (kind === 'visloc' ? m.database.centers : m.pred.centers) as V3[]
        const c = new THREE.Box3().setFromPoints(raw.map(v3)).getCenter(new THREE.Vector3())
        const pts = await pointCloud(dir + m.points.file, m.points, 1.6 * radius, c)
        if (cancelled) return dispose(pts)
        t.root.add(pts)
      }
      setData({ ...m, kind, texture, atlasImg, radius })
      if (kind === 'cambridge') {
        setShown(0)
        setPlaying(true)
      }
      setQi(0)
    })().catch(() => !cancelled && setError(true))

    return () => {
      cancelled = true
    }
  }, [sceneId])

  // ---- the parts that change with the controls ----
  useEffect(() => {
    const t = three.current
    if (!t || !data) return
    t.root.remove(t.layer)
    dispose(t.layer)
    const layer = new THREE.Group()
    t.layer = layer
    t.root.add(layer)

    if (data.kind === 'cambridge') {
      const m = data
      const N = m.frames
      const aspect = m.input_size[0] / m.input_size[1]
      const fovs = m.pred.fov_y_deg.map((d) => (d * Math.PI) / 180)
      const size = data.radius * 0.012
      let cols: THREE.Color[]
      if (colour === 'error') cols = m.error.t_m.map((e) => heat(e / 2))
      else if (colour === 'unc') {
        const q95 = [...m.uncertainty_deg].sort((a, b) => a - b)[Math.floor(0.95 * N)]
        cols = m.uncertainty_deg.map((x) => heat(x / q95))
      } else cols = m.pred.centers.map((_, i) => byTime(i / N, dark))
      const k = Math.max(0, Math.min(N, shown))
      const lines = frustumLines(m.pred.centers, m.pred.quats, fovs, aspect, size, cols)
      lines.geometry.setDrawRange(0, k * 16)
      layer.add(lines)
      if (images) {
        const planes = imagePlanes(m.pred.centers, m.pred.quats, fovs, aspect, size, m.atlas, m.texture)
        planes.geometry.setDrawRange(0, k * 6)
        layer.add(planes)
      }
      if (showGt) {
        const gt = frustumLines(m.gt.centers, m.gt.quats, fovs, aspect, size, m.gt.centers.map(() => GT), 0.7)
        gt.geometry.setDrawRange(0, k * 16)
        layer.add(gt)
      }
      if (edges) {
        const pos: number[] = []
        for (const [i, j, c] of m.edges) if (i < k && j < k && c > 0.9) pos.push(...m.pred.centers[i], ...m.pred.centers[j])
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
        // thousands of pairs: keep them faint enough that the cameras still read on top
        layer.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: OURS, transparent: true, opacity: 0.07, depthWrite: false })))
      }
    } else if (data.kind === 'mixed') {
      const m = data
      const centers = mixedLayout(m)
      const sizes = groupSizes(m.cluster)
      const order = groupOrder(m.cluster)
      const col = m.cluster.map((c) => new THREE.Color(sizes[c] > 1 ? GROUPS[order.indexOf(c) % GROUPS.length] : '#999999'))
      const fovs = centers.map(() => 1.0)
      layer.add(frustumLines(centers, m.pred.quats, fovs, 4 / 3, 0.15, col))
      layer.add(imagePlanes(centers, m.pred.quats, fovs, 4 / 3, 0.15, m.atlas, m.texture))
    } else {
      const m = data
      const q = m.queries[qi]
      const size = neighbourhood(m, qi) * 0.09
      const fov = 0.7
      const aspect = 16 / 9
      const nDb = m.database.centers.length
      const db = m.database
      layer.add(frustumLines(db.centers, db.quats, db.centers.map(() => fov), aspect, size * 0.5, db.centers.map(() => new THREE.Color(dark ? '#555555' : '#cfcfcf'))))
      const rc = q.refs.map((i) => db.centers[i])
      const rq = q.refs.map((i) => db.quats[i])
      layer.add(frustumLines(rc, rq, rc.map(() => fov), aspect, size, rc.map(() => REF)))
      layer.add(imagePlanes(rc, rq, rc.map(() => fov), aspect, size, m.atlas, m.texture, q.refs))
      layer.add(frustumLines([q.gt.center], [q.gt.quat], [fov], aspect, size * 1.3, [GT]))
      layer.add(frustumLines([q[cond].center], [q[cond].quat], [fov], aspect, size * 1.3, [OURS]))
      layer.add(imagePlanes([q[cond].center], [q[cond].quat], [fov], aspect, size * 1.3, m.atlas, m.texture, [nDb + qi]))
    }
  }, [data, colour, shown, images, showGt, edges, qi, cond, dark])

  // ---- localization: the whole scene dwarfs one query, so frame its neighbourhood ----
  useEffect(() => {
    const t = three.current
    if (!t || !data || data.kind !== 'visloc') return
    const r = neighbourhood(data, qi)
    const target = v3(data.queries[qi].gt.center).applyQuaternion(t.root.quaternion)
    t.controls.target.copy(target)
    t.camera.position.copy(target).add(new THREE.Vector3(0, 1.1 * r, 1.8 * r))
    t.camera.updateProjectionMatrix()
  }, [data, qi])

  // ---- playback: reveal the cameras in about four seconds, the time the model takes ----
  const shownRef = useRef(0)
  useEffect(() => {
    shownRef.current = shown
  }, [shown])
  useEffect(() => {
    if (!data || data.kind !== 'cambridge' || !playing) return
    const n = data.frames
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      shownRef.current = Math.min(n, shownRef.current + Math.max(1, Math.round((n / 4000) * (now - last))))
      last = now
      setShown(shownRef.current)
      if (shownRef.current < n) raf = requestAnimationFrame(step)
      else setPlaying(false)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [data, playing])

  // ---- click a camera centre to see its image ----
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const t = three.current
    if (!t || !data) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
    const targets: (V3 | null)[] =
      data.kind === 'cambridge' ? data.pred.centers.slice(0, shown) : data.kind === 'mixed' ? mixedLayout(data) : []
    let best = -1
    let bestD = 0.03
    targets.forEach((c, i) => {
      if (!c) return
      const p = v3(c).applyQuaternion(t.root.quaternion).project(t.camera)
      const d = Math.hypot(p.x - ndc.x, p.y - ndc.y)
      if (p.z < 1 && d < bestD) {
        bestD = d
        best = i
      }
    })
    if (best < 0) return
    const text =
      data.kind === 'cambridge'
        ? `image ${best + 1} · error ${data.error.t_m[best].toFixed(2)} m, ${data.error.r_deg[best].toFixed(2)}° · uncertainty ${data.uncertainty_deg[best].toFixed(2)}°`
        : data.kind === 'mixed'
          ? `${data.scene_names[data.scene[best]]} · ${data.pred.centers[best] ? `group ${groupOrder(data.cluster).indexOf(data.cluster[best]) + 1}` : 'no group'}`
          : ''
    setPicked({ i: best, text })
  }

  // draw the picked thumbnail out of the atlas
  useEffect(() => {
    const cv = thumbRef.current
    if (!cv || !picked || !data) return
    const [w, h] = data.atlas.tile
    cv.width = w
    cv.height = h
    cv.getContext('2d')?.drawImage(data.atlasImg, (picked.i % data.atlas.cols) * w, Math.floor(picked.i / data.atlas.cols) * h, w, h, 0, 0, w, h)
  }, [picked, data])

  const cam = data?.kind === 'cambridge' ? data : null
  const n = cam?.frames ?? 0

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted/30 to-background">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setSceneId(s.id)
              setColour('time')
            }}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              i === 5 && 'sm:ml-3',
              s.id === sceneId ? 'border-foreground/20 bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {s.label}
            <span className="ml-1.5 opacity-60">{s.sub}</span>
          </button>
        ))}
      </div>

      <div
        className="relative aspect-[4/3] w-full sm:aspect-[16/9]"
        onPointerDown={() => setInteracted(true)}
        onClick={onClick}
      >
        <div ref={mountRef} className="absolute inset-0" />
        {!data && !error && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground">
            loading…
          </p>
        )}
        {error && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Could not load this scene.</p>
        )}

        {data && (
          <div className="pointer-events-none absolute left-3 top-3 max-w-[300px] rounded-lg border border-border bg-background/85 px-3 py-2 text-[11px] leading-relaxed backdrop-blur">
            {cam && (
              <>
                <p>
                  {cam.frames.toLocaleString('en-US')} images, one forward pass:{' '}
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {cam.runtime_s} s · {cam.peak_gib.toFixed(1)} GiB
                  </span>
                </p>
                <p className="text-muted-foreground">
                  median error {cam.error.median_t_m.toFixed(2)} m, {cam.error.median_r_deg.toFixed(2)}° after Sim(3) alignment
                </p>
                <p className="text-muted-foreground/70">points: the dataset&apos;s SfM model, for context</p>
              </>
            )}
            {data.kind === 'mixed' && (
              <>
                <p>{data.cluster.length} shuffled images of two rooms and three distractors, one forward pass.</p>
                <p className="text-muted-foreground">
                  Colour is the predicted group. The{' '}
                  <span className="font-semibold text-foreground">{data.pred.centers.filter((c) => !c).length}</span>{' '}
                  distractors join no group; each group is reconstructed in its own frame, shown side by side.
                </p>
              </>
            )}
            {data.kind === 'visloc' && (
              <>
                <p>Query localized from its 10 retrieved references (blue), one forward pass, no 3D map.</p>
                <p className="text-muted-foreground">
                  VGGT-μ (red) vs ground truth (grey):{' '}
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {(100 * data.queries[qi][cond].t_err_m).toFixed(0)} cm
                  </span>
                </p>
              </>
            )}
          </div>
        )}

        {picked && (
          <div className="absolute bottom-3 right-3 w-52 overflow-hidden rounded-lg border border-border bg-background/90 backdrop-blur">
            <canvas ref={thumbRef} className="block w-full" />
            <p className="px-2.5 py-1.5 font-mono text-[10px] leading-snug text-muted-foreground">{picked.text}</p>
          </div>
        )}
        {!interacted && data && data.kind !== 'visloc' && (
          <p className="pointer-events-none absolute bottom-3 left-3 text-[11px] text-muted-foreground">
            drag to orbit · click a camera · click, then scroll to zoom
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border px-4 py-3">
        {cam && (
          <>
            <button
              onClick={() => {
                if (shown >= n) setShown(0)
                setPlaying((p) => !p)
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <PauseIcon className="h-3.5 w-3.5" /> : shown >= n ? <RotateCcwIcon className="h-3.5 w-3.5" /> : <PlayIcon className="ml-0.5 h-3.5 w-3.5" />}
            </button>
            <input
              type="range"
              min={1}
              max={n}
              value={Math.max(1, shown)}
              onChange={(e) => {
                setPlaying(false)
                setShown(Number(e.target.value))
              }}
              className="h-1 min-w-[120px] flex-1 cursor-pointer accent-rose-600"
              aria-label="Cameras shown"
            />
            <span className="w-[96px] shrink-0 whitespace-nowrap text-right font-mono text-[11px] tabular-nums text-muted-foreground">
              {shown.toLocaleString('en-US')} / {n.toLocaleString('en-US')}
            </span>
            <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 sm:w-auto">
              <Segmented
                value={colour}
                onChange={setColour}
                options={[
                  { value: 'time', label: 'Capture order' },
                  { value: 'error', label: 'Error' },
                  { value: 'unc', label: 'Uncertainty' },
                ]}
              />
              {(
                [
                  ['images', images, setImages],
                  ['ground truth', showGt, setShowGt],
                  ['confident pairs', edges, setEdges],
                ] as const
              ).map(([label, v, set]) => (
                <label key={label} className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                  <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} className="accent-rose-600" />
                  {label}
                </label>
              ))}
            </div>
          </>
        )}
        {data?.kind === 'visloc' && (
          <>
            <button
              onClick={() => setQi((qi + data.queries.length - 1) % data.queries.length)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              aria-label="Previous query"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              query {qi + 1} / {data.queries.length}
            </span>
            <button
              onClick={() => setQi((qi + 1) % data.queries.length)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              aria-label="Next query"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
            <Segmented
              value={cond}
              onChange={setCond}
              options={[
                { value: 'poses+focals', label: 'Known poses + focals' },
                { value: 'poses', label: 'Known poses only' },
              ]}
            />
          </>
        )}
        {data?.kind === 'mixed' && (
          <p className="text-xs text-muted-foreground">
            Scenes: {data.scene_names.join(', ')}. Click a camera to see its image and its true scene.
          </p>
        )}
        {cam && colour !== 'time' && (
          <p className="w-full text-[11px] text-muted-foreground">
            <span
              className="mr-1.5 inline-block h-2 w-16 rounded-full align-middle"
              style={{ background: 'linear-gradient(90deg, hsl(119 80% 47%), hsl(60 80% 47%), hsl(0 80% 47%))' }}
            />
            {colour === 'error'
              ? 'camera-centre error, 0 to ≥ 2 m'
              : "predicted rotational uncertainty, low to the scene's 95th percentile: red cameras are the ones the model is least sure about"}
          </p>
        )}
      </div>
    </div>
  )
}

/** Distance from a query to its farthest retrieved reference, at least a few metres. */
function neighbourhood(m: Visloc, qi: number) {
  const q = m.queries[qi]
  const c = v3(q.gt.center)
  return Math.max(4, ...q.refs.map((i) => c.distanceTo(v3(m.database.centers[i]))))
}

/** Every predicted group is reconstructed in its own frame, so the groups are laid out side by side. */
function groupSizes(cluster: number[]) {
  const sizes: Record<number, number> = {}
  cluster.forEach((c) => (sizes[c] = (sizes[c] || 0) + 1))
  return sizes
}
function groupOrder(cluster: number[]) {
  const sizes = groupSizes(cluster)
  return [...new Set(cluster)].sort((a, b) => sizes[b] - sizes[a])
}
function mixedLayout(m: Pick<Mixed, 'cluster' | 'pred'>): (V3 | null)[] {
  const sizes = groupSizes(m.cluster)
  const offset: Record<number, number> = {}
  let x = 0
  groupOrder(m.cluster).forEach((c) => {
    offset[c] = x
    x += sizes[c] > 1 ? 4 : 1.5
  })
  return m.pred.centers.map((c, i) => (c ? [c[0] + offset[m.cluster[i]], c[1], c[2]] : null))
}
