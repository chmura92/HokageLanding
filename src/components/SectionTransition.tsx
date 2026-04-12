"use client";

import { useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Git graph transition — Canvas 2D
//
// Three horizontal lanes (hotfix / main / feature) connected by 45° diagonal
// segments at branch and merge points. A single left→right sweep draws all
// lines; commit nodes pop as the sweep reaches each one.
// ---------------------------------------------------------------------------

export type TransitionDirection = "dark-to-light" | "light-to-dark";

// Lane Y positions (normalised 0=top 1=bottom)
// MAIN sits exactly at the dark/light boundary (y=0.5)
const HOTFIX = 0.22;
const MAIN   = 0.50;
const FEAT   = 0.78;

// Muted accent colours — desaturated so they read as technical, not decorative
const BLUE  = "#7BADC8";
const TEAL  = "#5BBCAC";
const EMBER = "#C47A5A";

interface Seg {
  x0: number; y0: number;
  x1: number; y1: number;
  color: string;
  lw: number; // line width in px
}

interface Dot {
  x: number; y: number;
  color: string;
  r: number; // radius in px
}

// ---------------------------------------------------------------------------
// Graph definition
// All x/y values are normalised [0..1].
// Segments are drawn in order — overlapping is intentional (nodes draw on top).
// ---------------------------------------------------------------------------
const SEGS: Seg[] = [
  // Main: full width horizontal
  { x0: 0,    y0: MAIN,   x1: 1,    y1: MAIN,   color: BLUE,  lw: 6   },

  // Feature: spawn diagonal from main at x=0.18, lands on FEAT at x=0.26
  { x0: 0.18, y0: MAIN,   x1: 0.26, y1: FEAT,   color: TEAL,  lw: 4 },
  // Feature: horizontal run
  { x0: 0.26, y0: FEAT,   x1: 0.65, y1: FEAT,   color: TEAL,  lw: 4 },
  // Feature: merge diagonal back to main at x=0.73
  { x0: 0.65, y0: FEAT,   x1: 0.73, y1: MAIN,   color: TEAL,  lw: 4 },

  // Hotfix: spawn diagonal from main at x=0.42, rises to HOTFIX at x=0.50
  { x0: 0.42, y0: MAIN,   x1: 0.50, y1: HOTFIX, color: EMBER, lw: 4 },
  // Hotfix: horizontal run
  { x0: 0.50, y0: HOTFIX, x1: 0.75, y1: HOTFIX, color: EMBER, lw: 4 },
  // Hotfix: merge diagonal back to main at x=0.83
  { x0: 0.75, y0: HOTFIX, x1: 0.83, y1: MAIN,   color: EMBER, lw: 4 },
];

const DOTS: Dot[] = [
  // Main commits
  { x: 0.06, y: MAIN,   color: BLUE,  r: 7 },
  { x: 0.18, y: MAIN,   color: BLUE,  r: 7 }, // branch point → feature
  { x: 0.42, y: MAIN,   color: BLUE,  r: 7 }, // branch point → hotfix
  { x: 0.60, y: MAIN,   color: BLUE,  r: 7 }, // regular commit
  { x: 0.73, y: MAIN,   color: BLUE,  r: 8 }, // merge from feature
  { x: 0.83, y: MAIN,   color: BLUE,  r: 8 }, // merge from hotfix
  { x: 0.93, y: MAIN,   color: BLUE,  r: 7 }, // trailing commit

  // Feature commits
  { x: 0.26, y: FEAT,   color: TEAL,  r: 6 }, // branch start
  { x: 0.38, y: FEAT,   color: TEAL,  r: 6 },
  { x: 0.54, y: FEAT,   color: TEAL,  r: 6 },
  { x: 0.65, y: FEAT,   color: TEAL,  r: 6 }, // merge end

  // Hotfix commits
  { x: 0.50, y: HOTFIX, color: EMBER, r: 6 }, // branch start
  { x: 0.62, y: HOTFIX, color: EMBER, r: 6 },
  { x: 0.75, y: HOTFIX, color: EMBER, r: 6 }, // merge end
];

const SWEEP_MS   = 1400; // ms for the sweep to cross the full width
const FADE_MS    = 250;  // ms for a commit node to fade in

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function drawSeg(
  ctx: CanvasRenderingContext2D,
  seg: Seg,
  sweepX: number,
  W: number,
  H: number,
) {
  if (sweepX <= seg.x0) return; // sweep hasn't reached this segment yet

  let ex = seg.x1;
  let ey = seg.y1;

  if (sweepX < seg.x1) {
    // Partially drawn: interpolate endpoint to sweep position
    const t = (sweepX - seg.x0) / (seg.x1 - seg.x0);
    ex = sweepX;
    ey = seg.y0 + t * (seg.y1 - seg.y0);
  }

  ctx.strokeStyle = seg.color;
  ctx.lineWidth   = seg.lw;
  ctx.beginPath();
  ctx.moveTo(seg.x0 * W, seg.y0 * H);
  ctx.lineTo(ex    * W, ey    * H);
  ctx.stroke();
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  dot: Dot,
  alpha: number,
  W: number,
  H: number,
) {
  const x = dot.x * W;
  const y = dot.y * H;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Glow halo
  const glowR = dot.r * 2.4;
  const grd = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  grd.addColorStop(0, dot.color + "60");
  grd.addColorStop(1, dot.color + "00");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Filled circle with white centre
  ctx.fillStyle   = dot.color;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, dot.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  direction?: TransitionDirection;
}

export default function SectionTransition({ direction = "dark-to-light" }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const sizeRef    = useRef({ W: 0, H: 0 });
  const animRef    = useRef({
    startTime: -1,
    rafId:     -1,
    visible:   false,
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas  = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---- Resize ----------------------------------------------------------
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const W   = wrapper!.clientWidth;
      const H   = wrapper!.clientHeight;
      canvas!.width          = Math.round(W * dpr);
      canvas!.height         = Math.round(H * dpr);
      canvas!.style.width    = `${W}px`;
      canvas!.style.height   = `${H}px`;
      ctx!.scale(dpr, dpr); // resets on every canvas.width assignment
      sizeRef.current = { W, H };
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    // ---- Render ----------------------------------------------------------
    function render(timestamp: number) {
      const anim       = animRef.current;
      const { W, H }   = sizeRef.current;
      if (W === 0 || H === 0) {
        anim.rafId = requestAnimationFrame(render);
        return;
      }

      ctx!.clearRect(0, 0, W, H);
      // No background fill — wrapper CSS colour shows through

      if (anim.startTime >= 0) {
        const elapsed = timestamp - anim.startTime;
        const sweepX  = Math.min(elapsed / SWEEP_MS, 1);

        // Draw all line segments clipped to sweep position
        ctx!.lineCap  = "butt";
        ctx!.lineJoin = "miter";
        for (const seg of SEGS) {
          drawSeg(ctx!, seg, sweepX, W, H);
        }

        // Draw commit nodes — pop as sweep reaches each one
        for (const dot of DOTS) {
          if (sweepX < dot.x) continue;
          const dotAge = Math.max(0, elapsed - dot.x * SWEEP_MS); // clamp: float mul may produce tiny negatives at boundary
          const fade   = Math.min(dotAge / FADE_MS, 1);
          // Once faded in, add a gentle idle pulse
          const pulse  = fade < 1 ? fade : 0.75 + 0.25 * Math.sin((elapsed / 1800) * Math.PI);
          drawDot(ctx!, dot, pulse, W, H);
        }
      }

      if (animRef.current.visible) {
        anim.rafId = requestAnimationFrame(render);
      } else {
        anim.rafId = -1;
      }
    }

    // ---- Visibility ------------------------------------------------------
    function startRendering() {
      const anim = animRef.current;
      anim.visible = true;
      if (anim.rafId >= 0) return;
      anim.rafId = requestAnimationFrame((ts) => {
        if (anim.startTime < 0) anim.startTime = ts;
        render(ts);
      });
    }

    function stopRendering() {
      animRef.current.visible = false;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) startRendering();
        else stopRendering();
      },
      { threshold: 0.01 },
    );
    io.observe(wrapper);

    return () => {
      stopRendering();
      io.disconnect();
      ro.disconnect();
    };
  }, [direction]);

  // Hard split at 50%: dark above the main branch line, light below (or vice versa)
  const splitBg = direction === "dark-to-light"
    ? "linear-gradient(to bottom, #111827 50%, #F8FAFC 50%)"
    : "linear-gradient(to bottom, #F8FAFC 50%, #0B1221 50%)";

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden h-[320px]"
      style={{ background: splitBg }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
