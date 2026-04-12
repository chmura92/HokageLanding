"use client";

import { useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Git branch tree transition — Canvas 2D
//
// Four bezier branches (main, feature, hotfix, sub-feature) draw left→right
// on first scroll-into-view, then commit nodes pulse indefinitely.
// Background gradient handled by the canvas so SSR shows a plain colour.
// ---------------------------------------------------------------------------

export type TransitionDirection = "dark-to-light" | "light-to-dark";

interface Segment {
  p0: [number, number]; // normalised [0..1] x, y
  p1: [number, number];
  p2: [number, number];
  p3: [number, number];
}

interface Branch {
  color: string;
  lineWidth: number;
  startDelay: number; // ms after animation start before this branch begins drawing
  segments: Segment[];
  commits: [number, number][]; // normalised [x, y] positions
}

// All coordinates normalised: x 0=left 1=right, y 0=top 1=bottom
const BRANCHES: Branch[] = [
  // main — blue, straight horizontal at y=0.33
  {
    color: "#4A9EE5",
    lineWidth: 2,
    startDelay: 0,
    segments: [
      { p0: [0, 0.33], p1: [0.33, 0.33], p2: [0.67, 0.33], p3: [1, 0.33] },
    ],
    commits: [
      [0.15, 0.33],
      [0.50, 0.33],
      [0.82, 0.33],
    ],
  },
  // feature — teal, arcs down from main then merges back
  {
    color: "#2DD4BF",
    lineWidth: 1.5,
    startDelay: 120,
    segments: [
      { p0: [0.22, 0.33], p1: [0.22, 0.55], p2: [0.30, 0.62], p3: [0.38, 0.62] },
      { p0: [0.38, 0.62], p1: [0.45, 0.62], p2: [0.52, 0.62], p3: [0.60, 0.62] },
      { p0: [0.60, 0.62], p1: [0.67, 0.62], p2: [0.72, 0.45], p3: [0.72, 0.33] },
    ],
    commits: [
      [0.44, 0.62],
      [0.56, 0.62],
    ],
  },
  // hotfix — ember, arcs up from main then merges back
  {
    color: "#E85D3A",
    lineWidth: 1.5,
    startDelay: 200,
    segments: [
      { p0: [0.48, 0.33], p1: [0.48, 0.15], p2: [0.56, 0.13], p3: [0.63, 0.13] },
      { p0: [0.63, 0.13], p1: [0.68, 0.13], p2: [0.72, 0.13], p3: [0.77, 0.13] },
      { p0: [0.77, 0.13], p1: [0.83, 0.13], p2: [0.85, 0.22], p3: [0.85, 0.33] },
    ],
    commits: [
      [0.65, 0.13],
    ],
  },
  // sub-feature — teal (abandoned), spawns from feature branch and stops
  {
    color: "#2DD4BF",
    lineWidth: 1.2,
    startDelay: 270,
    segments: [
      { p0: [0.42, 0.62], p1: [0.42, 0.75], p2: [0.48, 0.82], p3: [0.55, 0.82] },
      { p0: [0.55, 0.82], p1: [0.58, 0.82], p2: [0.60, 0.82], p3: [0.63, 0.82] },
    ],
    commits: [
      [0.57, 0.82],
    ],
  },
];

const DRAW_DURATION_MS = 900; // ms for each branch to fully draw once it starts

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function bezierPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  t: number,
): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
    mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function drawPartialBezier(
  ctx: CanvasRenderingContext2D,
  seg: Segment,
  progress: number, // 0..1 — how much of this segment to draw
  W: number,
  H: number,
) {
  if (progress <= 0) return;
  const steps = Math.max(2, Math.ceil(60 * progress));
  const [sx, sy] = bezierPoint(seg.p0, seg.p1, seg.p2, seg.p3, 0);
  ctx.beginPath();
  ctx.moveTo(sx * W, sy * H);
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * progress;
    const [x, y] = bezierPoint(seg.p0, seg.p1, seg.p2, seg.p3, t);
    ctx.lineTo(x * W, y * H);
  }
  ctx.stroke();
}

function drawCommitNode(
  ctx: CanvasRenderingContext2D,
  nx: number,
  ny: number,
  W: number,
  H: number,
  color: string,
  alpha: number,
) {
  const x = nx * W;
  const y = ny * H;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Glow halo
  const grd = ctx.createRadialGradient(x, y, 0, x, y, 9);
  grd.addColorStop(0, color + "50");
  grd.addColorStop(1, color + "00");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fill();

  // Ring
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.stroke();

  // Centre dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // All mutable animation state lives here — avoids stale closure issues
  const animRef = useRef({
    startTime: -1,   // timestamp of first visibility; -1 = not started
    rafId: -1,       // current RAF handle; -1 = not running
    visible: false,
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---- Resize --------------------------------------------------------
    function resize() {
      const W = wrapper!.clientWidth;
      const H = wrapper!.clientHeight;
      // Re-setting width/height clears the canvas and resets ctx transforms
      canvas!.width = W;
      canvas!.height = H;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    // ---- Render --------------------------------------------------------
    function render(timestamp: number) {
      const anim = animRef.current;

      const W = wrapper!.clientWidth;
      const H = wrapper!.clientHeight;

      ctx!.clearRect(0, 0, W, H);

      // Background gradient
      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      if (direction === "dark-to-light") {
        grad.addColorStop(0, "#111827");
        grad.addColorStop(1, "#F8FAFC");
      } else {
        grad.addColorStop(0, "#F8FAFC");
        grad.addColorStop(1, "#0B1221");
      }
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      if (anim.startTime >= 0) {
        const elapsed = timestamp - anim.startTime;

        for (const branch of BRANCHES) {
          const branchElapsed = elapsed - branch.startDelay;
          if (branchElapsed <= 0) continue;

          ctx!.strokeStyle = branch.color;
          ctx!.lineWidth = branch.lineWidth;
          ctx!.lineCap = "round";
          ctx!.lineJoin = "round";

          const totalProgress = Math.min(branchElapsed / DRAW_DURATION_MS, 1);
          const segCount = branch.segments.length;
          const segShare = 1 / segCount; // each segment owns an equal slice of totalProgress

          for (let si = 0; si < segCount; si++) {
            const segProgress = Math.min(
              Math.max((totalProgress - si * segShare) / segShare, 0),
              1,
            );
            drawPartialBezier(ctx!, branch.segments[si], segProgress, W, H);
          }

          // Commit nodes fade in after branch fully drawn, then pulse
          if (totalProgress >= 1) {
            const nodeAge = branchElapsed - DRAW_DURATION_MS;
            const fadeIn = Math.min(nodeAge / 400, 1);
            const pulse = fadeIn * (0.65 + 0.35 * Math.sin((nodeAge / 1200) * Math.PI));
            for (const [nx, ny] of branch.commits) {
              drawCommitNode(ctx!, nx, ny, W, H, branch.color, pulse);
            }
          }
        }
      }

      // Re-schedule as long as the element is visible
      if (animRef.current.visible) {
        anim.rafId = requestAnimationFrame(render);
      } else {
        anim.rafId = -1;
      }
    }

    // ---- Visibility ----------------------------------------------------
    function startRendering() {
      const anim = animRef.current;
      anim.visible = true;
      if (anim.rafId >= 0) return; // already running
      anim.rafId = requestAnimationFrame((ts) => {
        if (anim.startTime < 0) anim.startTime = ts; // first entry: begin draw-in
        render(ts);
      });
    }

    function stopRendering() {
      animRef.current.visible = false;
      // render() will not re-schedule itself on next frame
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          startRendering();
        } else {
          stopRendering();
        }
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

  // SSR fallback colour matches the gradient start so there is no flash
  const ssrBg = direction === "dark-to-light" ? "#111827" : "#F8FAFC";

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden h-[240px]"
      style={{ background: ssrBg }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
