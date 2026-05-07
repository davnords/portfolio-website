"use client";

import { cn } from "@/lib/utils";

type LogoItem = {
  src: string;
  alt: string;
};

const conferences: LogoItem[] = [
  { src: "/logos/cvpr2026.png",  alt: "CVPR" },
  { src: "/logos/icml2025.png",  alt: "ICML" },
];


export function TechMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-12 py-2", className)}>
      {conferences.map((item) => (
        <img
          key={item.alt}
          src={item.src}
          alt={item.alt}
          className="h-16 w-auto object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 hover:scale-110"
        />
      ))}
    </div>
  );
}
