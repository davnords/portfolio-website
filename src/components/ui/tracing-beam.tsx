"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useTransform,
  useScroll,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The beam is positioned `top-20` and carries a 16px dot above the SVG, so the
 * SVG has to be this much shorter than the content or it overflows the bottom
 * of its container — which turns any ancestor with `overflow-x` set into a
 * scroll container of its own.
 */
const BEAM_TOP_OFFSET = 96;

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  // Images, fonts and the globe all settle after mount, so measure on every
  // resize rather than once — a stale height leaves the beam short or overlong.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () =>
      setSvgHeight(Math.max(0, el.offsetHeight - BEAM_TOP_OFFSET));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]),
    {
      stiffness: 500,
      damping: 90,
    },
  );
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]),
    {
      stiffness: 500,
      damping: 90,
    },
  );

  // Driven as motion values so the dot tracks scroll without re-rendering the
  // whole page on every frame.
  const dotShadow = useTransform(scrollYProgress, (v) =>
    v > 0 ? "none" : "rgba(0, 0, 0, 0.24) 0px 3px 8px",
  );
  const dotFill = useTransform(scrollYProgress, (v) => (v > 0 ? "white" : "#10b981"));
  const dotBorder = useTransform(scrollYProgress, (v) => (v > 0 ? "white" : "#059669"));

  return (
    <motion.div
      ref={ref}
      className={cn("relative mx-auto h-full w-full", className)}
    >
      <div className="pointer-events-none absolute top-20 left-2 md:left-4 z-40 hidden md:block">
        <motion.div
          style={{ boxShadow: dotShadow }}
          className="border-netural-200 ml-[27px] flex h-4 w-4 items-center justify-center rounded-full border shadow-sm"
        >
          <motion.div
            style={{ backgroundColor: dotFill, borderColor: dotBorder }}
            className="h-2 w-2 rounded-full border border-neutral-300 bg-white"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight} // Set the SVG height
          className="ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1} // set y1 for gradient
              y2={y2} // set y2 for gradient
            >
              <stop stopColor="#18CCFC" stopOpacity="0"></stop>
              <stop stopColor="#18CCFC"></stop>
              <stop offset="0.325" stopColor="#6344F5"></stop>
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
};
