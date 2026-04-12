"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const DissolveField = dynamic(() => import("./transition/DissolveField"), {
  ssr: false,
});

// Multi-stop S-curve: stays in dark navy, fast crossover through cool pearl,
// settles into surface light. Avoids the dead grey of a linear dark→light mix.
const BACKGROUND_GRADIENT =
  "linear-gradient(to bottom, " +
  "#111827 0%, " +
  "#111827 8%, " +
  "#2A3340 30%, " +
  "#C9D3DE 62%, " +
  "#EEF1F6 82%, " +
  "#F8FAFC 100%)";

// SVG grain: static fractal noise breaks up gradient banding.
const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">' +
      '<filter id="n">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>' +
      '<feColorMatrix type="saturate" values="0"/>' +
      "</filter>" +
      '<rect width="100%" height="100%" filter="url(#n)"/>' +
      "</svg>",
  );

export default function SectionTransition() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { rootMargin: "200px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="relative w-full overflow-hidden h-[200px] md:h-[280px]"
      style={{ background: BACKGROUND_GRADIENT }}
    >
      {/* Particle canvas: mounts only when in view, never in reduced-motion */}
      {inView && !reducedMotion && <DissolveField />}

      {/* Seam line at the crossover (top 62%) */}
      <div
        className="pointer-events-none absolute left-0 right-0 h-px"
        style={{
          top: "62%",
          background:
            "linear-gradient(to right, transparent 0%, rgba(74,158,229,0.35) 50%, transparent 100%)",
        }}
      />

      {/* Static grain overlay — kills gradient banding */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("${GRAIN_SVG}")`,
          backgroundSize: "300px 300px",
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
