"use client";

import { useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Git graph transition — Canvas 2D
//
// Three horizontal lanes connected by 45° diagonals. Lines sit at reduced
// opacity; a gradient-tail signal travels slowly along each branch and
// illuminates commit nodes as it passes through them.
// ---------------------------------------------------------------------------

export type TransitionDirection = "dark-to-light" | "light-to-dark";

const HOTFIX = 0.22;
const MAIN   = 0.50;
const FEAT   = 0.78;

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

const SEGS: Seg[] = [
  { x0: 0,    y0: MAIN,   x1: 1,    y1: MAIN,   color: BLUE,  lw: 6 },
  { x0: 0.18, y0: MAIN,   x1: 0.26, y1: FEAT,   color: TEAL,  lw: 4 },
  { x0: 0.26, y0: FEAT,   x1: 0.65, y1: FEAT,   color: TEAL,  lw: 4 },
  { x0: 0.65, y0: FEAT,   x1: 0.73, y1: MAIN,   color: TEAL,  lw: 4 },
  { x0: 0.42, y0: MAIN,   x1: 0.50, y1: HOTFIX, color: EMBER, lw: 4 },
  { x0: 0.50, y0: HOTFIX, x1: 0.75, y1: HOTFIX, color: EMBER, lw: 4 },
  { x0: 0.75, y0: HOTFIX, x1: 0.83, y1: MAIN,   color: EMBER, lw: 4 },
];

const DOTS: Dot[] = [
  { x: 0.06, y: MAIN,   color: BLUE,  r: 7 },
  { x: 0.18, y: MAIN,   color: BLUE,  r: 7 },
  { x: 0.42, y: MAIN,   color: BLUE,  r: 7 },
  { x: 0.60, y: MAIN,   color: BLUE,  r: 7 },
  { x: 0.73, y: MAIN,   color: BLUE,  r: 8 },
  { x: 0.83, y: MAIN,   color: BLUE,  r: 8 },
  { x: 0.93, y: MAIN,   color: BLUE,  r: 7 },
  { x: 0.26, y: FEAT,   color: TEAL,  r: 6 },
  { x: 0.38, y: FEAT,   color: TEAL,  r: 6 },
  { x: 0.54, y: FEAT,   color: TEAL,  r: 6 },
  { x: 0.65, y: FEAT,   color: TEAL,  r: 6 },
  { x: 0.50, y: HOTFIX, color: EMBER, r: 6 },
  { x: 0.62, y: HOTFIX, color: EMBER, r: 6 },
  { x: 0.75, y: HOTFIX, color: EMBER, r: 6 },
];

// ---------------------------------------------------------------------------
// Signal definition — one per branch, staggered so they never overlap
// ---------------------------------------------------------------------------

interface BranchSignal {
  segs:  Seg[];
  color: string;
  rgb:   [number, number, number]; // pre-parsed for rgba() calls
  phase: number; // 0..1 loop offset
}

// Convert 6-digit hex → [r, g, b]
function hexRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

// canvas widths per second — deliberate, slow
const SIGNAL_SPEED  = 0.07;
// tail length in normalised canvas widths
const TAIL_LEN      = 0.10;
// expanding ring duration when signal touches a node
const PING_DURATION = 900;

const SIGNALS: BranchSignal[] = [
  { segs: [SEGS[0]],                   color: BLUE,  rgb: hexRgb(BLUE),  phase: 0.00 },
  { segs: [SEGS[1], SEGS[2], SEGS[3]], color: TEAL,  rgb: hexRgb(TEAL),  phase: 0.38 },
  { segs: [SEGS[4], SEGS[5], SEGS[6]], color: EMBER, rgb: hexRgb(EMBER), phase: 0.68 },
];

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/** Interpolate y along a straight segment at a given x. */
function segY(seg: Seg, x: number): number {
  if (seg.x1 === seg.x0) return seg.y0;
  const t = (x - seg.x0) / (seg.x1 - seg.x0);
  return seg.y0 + t * (seg.y1 - seg.y0);
}

/**
 * Draw the lit signal segment (gradient tail → bright head) for one branch.
 * headX is normalised [0..1]; we draw the portion of the path in [headX-TAIL, headX].
 */
function drawSignal(
  ctx: CanvasRenderingContext2D,
  signal: BranchSignal,
  headX: number,
  W: number,
  H: number,
) {
  const tailX  = headX - TAIL_LEN;
  const [r, g, b] = signal.rgb;

  for (const seg of signal.segs) {
    // Skip segments outside the signal window
    if (headX <= seg.x0 || tailX >= seg.x1) continue;

    const cx0 = Math.max(seg.x0, tailX);
    const cx1 = Math.min(seg.x1, headX);
    if (cx0 >= cx1) continue;

    const px0 = cx0 * W;
    const py0 = segY(seg, cx0) * H;
    const px1 = cx1 * W;
    const py1 = segY(seg, cx1) * H;

    // Alpha at each end: 0 at the tail tip, 1 at the head
    const a0 = (cx0 - tailX) / TAIL_LEN;
    const a1 = (cx1 - tailX) / TAIL_LEN;

    const grad = ctx.createLinearGradient(px0, py0, px1, py1);
    grad.addColorStop(0, `rgba(${r},${g},${b},${(a0 * 0.95).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${(a1 * 0.95).toFixed(3)})`);

    ctx.strokeStyle = grad;
    ctx.lineWidth   = seg.lw;
    ctx.lineCap     = "butt";
    ctx.beginPath();
    ctx.moveTo(px0, py0);
    ctx.lineTo(px1, py1);
    ctx.stroke();
  }

  // Bright leading dot at the head position — crisp edge
  const headSeg = signal.segs.find(s => headX >= s.x0 && headX <= s.x1 + 0.001);
  if (headSeg) {
    const hx = headX * W;
    const hy = segY(headSeg, headX) * H;
    ctx.save();
    ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
    ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.arc(hx, hy, headSeg.lw * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** Returns which SIGNALS index owns this dot (by lane y). */
function signalIndexForDot(dot: Dot): number {
  if (Math.abs(dot.y - MAIN) < 0.001) return 0;
  if (Math.abs(dot.y - FEAT) < 0.001) return 1;
  return 2;
}

/** Draw a commit node with optional proximity boost and ping ring. */
function drawDot(
  ctx: CanvasRenderingContext2D,
  dot: Dot,
  baseAlpha: number,
  signalHeadX: number | null,
  pingProgress: number, // 0 = inactive, 0→1 = ring expanding
  W: number,
  H: number,
) {
  const x = dot.x * W;
  const y = dot.y * H;
  const [r, g, b] = hexRgb(dot.color);

  // Expanding ping ring — drawn first so the dot sits on top
  if (pingProgress > 0 && pingProgress < 1) {
    const ringR = dot.r * (1 + pingProgress * 3.2);
    const ringA = (1 - pingProgress) * 0.75;
    ctx.save();
    ctx.globalAlpha = ringA;
    ctx.strokeStyle = dot.color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(x, y, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Alpha: base + proximity boost + brief flash at ping start
  let alpha = baseAlpha;
  if (signalHeadX !== null) {
    const proximity = Math.max(0, 1 - Math.abs(dot.x - signalHeadX) / (TAIL_LEN * 0.8));
    alpha = Math.min(1, alpha + (1 - alpha) * proximity);
  }
  if (pingProgress > 0 && pingProgress < 0.25) {
    alpha = Math.min(1, alpha + (1 - alpha) * (1 - pingProgress / 0.25) * 0.6);
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  // Glow
  const glowR = dot.r * 2.2;
  const grd   = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  grd.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Fill + white ring
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
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const sizeRef       = useRef({ W: 0, H: 0 });
  const animRef       = useRef({ rafId: -1, visible: false });
  // pingTimesRef[i] = timestamp when DOTS[i] last received a ping (-Infinity = never)
  const pingTimesRef  = useRef<number[]>(DOTS.map(() => -Infinity));
  // prevHeadsRef[i] = signal head x from the previous frame (for crossing detection)
  const prevHeadsRef  = useRef<number[]>(SIGNALS.map(() => -1));

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas  = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    function render(timestamp: number) {
      const anim     = animRef.current;
      const { W, H } = sizeRef.current;
      if (W === 0 || H === 0) { anim.rafId = requestAnimationFrame(render); return; }

      ctx!.clearRect(0, 0, W, H);

      // ---- Base lines at reduced opacity ---------------------------------
      ctx!.lineCap  = "butt";
      ctx!.lineJoin = "miter";
      ctx!.globalAlpha = 0.35;
      for (const seg of SEGS) {
        ctx!.strokeStyle = seg.color;
        ctx!.lineWidth   = seg.lw;
        ctx!.beginPath();
        ctx!.moveTo(seg.x0 * W, seg.y0 * H);
        ctx!.lineTo(seg.x1 * W, seg.y1 * H);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      // ---- Compute signal head positions ---------------------------------
      const signalHeads: number[] = SIGNALS.map(sig => {
        const xStart = sig.segs[0].x0;
        const xEnd   = sig.segs[sig.segs.length - 1].x1;
        const xRange = xEnd - xStart;
        const t      = ((timestamp / 1000) * SIGNAL_SPEED / xRange + sig.phase) % 1.0;
        return xStart + t * xRange;
      });

      // ---- Ping detection: trigger when a signal head crosses a dot ------
      for (let si = 0; si < SIGNALS.length; si++) {
        const headX = signalHeads[si];
        const prevX = prevHeadsRef.current[si];
        if (prevX >= 0) {
          const looped = headX < prevX - 0.01; // signal wrapped around
          for (let di = 0; di < DOTS.length; di++) {
            if (signalIndexForDot(DOTS[di]) !== si) continue;
            const dx      = DOTS[di].x;
            const crossed = looped ? (dx > prevX || dx <= headX) : (dx > prevX && dx <= headX);
            if (crossed) pingTimesRef.current[di] = timestamp;
          }
        }
        prevHeadsRef.current[si] = headX;
      }

      // ---- Commit nodes — proximity boost + ping ring --------------------
      const baseDotAlpha = 0.55;
      for (let di = 0; di < DOTS.length; di++) {
        const dot = DOTS[di];
        const si  = signalIndexForDot(dot);
        const nearestHead = Math.abs(dot.x - signalHeads[si]) < TAIL_LEN * 1.5
          ? signalHeads[si]
          : null;
        const pingAge      = timestamp - pingTimesRef.current[di];
        const pingProgress = pingAge < PING_DURATION ? pingAge / PING_DURATION : 0;
        drawDot(ctx!, dot, baseDotAlpha, nearestHead, pingProgress, W, H);
      }

      // ---- Signals on top ------------------------------------------------
      for (let i = 0; i < SIGNALS.length; i++) {
        drawSignal(ctx!, SIGNALS[i], signalHeads[i], W, H);
      }

      if (animRef.current.visible) {
        anim.rafId = requestAnimationFrame(render);
      } else {
        anim.rafId = -1;
      }
    }

    function startRendering() {
      const anim = animRef.current;
      anim.visible = true;
      if (anim.rafId >= 0) return;
      anim.rafId = requestAnimationFrame(render);
    }

    function stopRendering() { animRef.current.visible = false; }

    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) startRendering(); else stopRendering(); },
      { threshold: 0.01 },
    );
    io.observe(wrapper);

    return () => { stopRendering(); io.disconnect(); ro.disconnect(); };
  }, [direction]);

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
