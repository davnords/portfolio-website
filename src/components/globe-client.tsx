"use client";

import dynamic from "next/dynamic";
import type { GlobeMarker, Globe3DConfig } from "@/components/ui/3d-globe";

const Globe3D = dynamic(
  () => import("@/components/ui/3d-globe").then((m) => m.Globe3D),
  { ssr: false }
);

export function GlobeClient({
  markers,
  config,
  className,
  cardClassName,
}: {
  markers: GlobeMarker[];
  config?: Globe3DConfig;
  className?: string;
  cardClassName?: string;
}) {
  return (
    <Globe3D
      markers={markers}
      config={config}
      className={className}
      cardClassName={cardClassName}
    />
  );
}
