"use client";

import { useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Git graph transition — Canvas 2D
//
// Three horizontal lanes (hotfix / main / feature) connected by 45° diagonal
// segments at branch and merge points. Lines are always fully visible; a
// glow pulse travels left→right along each branch continuously.
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
  lw: number;
}

interface Dot {
  x: number; y: number;
  color: string;
  r: number;
}

// ---------------------------------------------------------------------------
// Graph definition — all x/y values normalised [0..1]
// ---------------------------------------------------------------------------
const SEGS: Seg[] = [
  // Main: full width horizontal
  { x0: 0,    y0: MAIN,   x1: 1,    y1: MAIN,   color: BLUE,  lw: 6 },

  // Feature: spawn diagonal → horizontal run → merge diagonal
  { x0: 0.18, y0: MAIN,   x1: 0.26, y1: FEAT,   color: TEAL,  lw: 4 },
  { x0: 0.26, y0: FEAT,   x1: 0.65, y1: FEAT,   color: TEAL,  lw: 4 },
  { x0: 0.65, y0: FEAT,   x1: 0.73, y1: MAIN,   color: TEAL,  lw: 4 },

  // Hotfix: spawn diagonal → horizontal run → merge diagonal
  { x0: 0.42, y0: MAIN,   x1: 0.50, y1: HOTFIX, color: EMBER, lw: 4 },
  { x0: 0.50, y0: HOTFIX, x1: 0.75, y1: HOTFIX, color: EMBER, lw: 4 },
  { x0: 0.75, y0: HOTFIX, x1: 0.83, y1: MAIN,   color: EMBER, lw: 4 },
];

const DOTS: Dot[] = [
  // Main
  { x: 0.06, y: MAIN,   color: BLUE,  r: 7 },
  { x: 0.18, y: MAIN,   color: BLUE,  r: 7 }, // branch → feature
  { x: 0.42, y: MAIN,   color: BLUE,  r: 7 }, // branch → hotfix
  { x: 0.60, y: MAIN,   color: BLUE,  r: 7 },
  { x: 0.73, y: MAIN,   color: BLUE,  r: 8 }, // merge from feature
  { x: 0.83, y: MAIN,   color: BLUE,  r: 8 }, // merge from hotfix
  { x: 0.93, y: MAIN,   color: BLUE,  r: 7 },
  // Feature
  { x: 0.26, y: FEAT,   color: TEAL,  r: 6 },
  { x: 0.38, y: FEAT,   color: TEAL,  r: 6 },
  { x: 0.54, y: FEAT,   color: TEAL,  r: 6 },
  { x: 0.65, y: FEAT,   color: TEAL,  r: 6 },
  // Hotfix
  { x: 0.50, y: HOTFIX, color: EMBER, r: 6 },
  { x: 0.62, y: HOTFIX, color: EMBER, r: 6 },
  { x: 0.75, y: HOTFIX, color: EMBER, r: 6 },
];

// ---------------------------------------------------------------------------
// Traveling pulse — one per branch, loops within branch x-range
// ---------------------------------------------------------------------------
interface BranchPulse {
  segs:  Seg[];
  color: string;
  phase: number; // 0..1 loop offset so pulses aren't in sync
}

// Normalised canvas widths per second — all branches travel at the same speed
const PULSE_SPEED = 0.20;

const PULSES: BranchPulse[] = [
  { segs: [SEGS[0]],                   color: BLUE,  phase: 0.00 },
  { segs: [SEGS[1], SEGS[2], SEGS[3]], color: TEAL,  phase: 0.40 },
  { segs: [SEGS[4], SEGS[5], SEGS[6]], color: EMBER, phase: 0.70 },
];

/** Returns canvas pixel position [x, y] of a pulse along its branch path. */
function getPulsePoint(
  pulse: BranchPulse,
  timestamp: number,
  W: number,
  H: number,
): [number, number] | null {
  const xStart = pulse.segs[0].x0;
  const xEnd   = pulse.segs[pulse.segs.length - 1].x1;
  const xRange = xEnd - xStart;

  // Progress 0→1 within this branch's x range, looping continuously
  const t  = ((timestamp / 1000) * PULSE_SPEED / xRange + pulse.phase) % 1.0;
  const px = xStart + t * xRange;

  for (const seg of pulse.segs) {
    if (px >= seg.x0 && px <= seg.x1 + 0.001) {
      const st = Math.min((px - seg.x0) / (seg.x1 - seg.x0), 1);
      const py = seg.y0 + st * (seg.y1 - seg.y0);
      return [px * W, py * H];
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

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

  const glowR = dot.r * 2.4;
  const grd = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  grd.addColorStop(0, dot.color + "60");
  grd.addColorStop(1, dot.color + "00");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle   = dot.color;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, dot.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawPulse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  const R = 22;
  ctx.save();
  const grd = ctx.createRadialGradient(x, y, 0, x, y, R);
  grd.addColorStop(0.0, color + "CC");
  grd.addColorStop(0.4, color + "55");
  grd.addColorStop(1.0, color + "00");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
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
  const animRef    = useRef({ rafId: -1, visible: false });

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
      canvas!.width        = Math.round(W * dpr);
      canvas!.height       = Math.round(H * dpr);
      canvas!.style.width  = `${W}px`;
      canvas!.style.height = `${H}px`;
      ctx!.scale(dpr, dpr);
      sizeRef.current = { W, H };
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    // ---- Render ----------------------------------------------------------
    function render(timestamp: number) {
      const anim     = animRef.current;
      const { W, H } = sizeRef.current;
      if (W === 0 || H === 0) {
        anim.rafId = requestAnimationFrame(render);
        return;
      }

      ctx!.clearRect(0, 0, W, H);
      // No canvas background — CSS hard-split shows through

      // Draw all segments at full opacity
      ctx!.lineCap  = "butt";
      ctx!.lineJoin = "miter";
      for (const seg of SEGS) {
        ctx!.strokeStyle = seg.color;
        ctx!.lineWidth   = seg.lw;
        ctx!.beginPath();
        ctx!.moveTo(seg.x0 * W, seg.y0 * H);
        ctx!.lineTo(seg.x1 * W, seg.y1 * H);
        ctx!.stroke();
      }

      // Draw commit nodes with gentle continuous pulse
      const dotAlpha = 0.72 + 0.28 * Math.sin((timestamp / 1800) * Math.PI);
      for (const dot of DOTS) {
        drawDot(ctx!, dot, dotAlpha, W, H);
      }

      // Draw traveling pulse glows along each branch
      for (const pulse of PULSES) {
        const pt = getPulsePoint(pulse, timestamp, W, H);
        if (pt) drawPulse(ctx!, pt[0], pt[1], pulse.color);
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
      anim.rafId = requestAnimationFrame(render);
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

  // Hard split at 50%: dark above main branch line, light below (or vice versa)
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
