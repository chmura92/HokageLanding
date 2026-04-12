# Section Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat dark→light gradient in `SectionTransition.tsx` with a layered, particle-dissolving transition that extends the hero's molecular language into the handoff between `TechStack` and `FeaturedProject`.

**Architecture:** A 280px band (200px on mobile) with four layers: a CSS S-curve gradient background (skips dead grey by passing through cool pearl), an independent R3F canvas rendering ~80 particles that drift downward and dissolve, a 1px luminous seam at the crossover, and a static SVG grain overlay. The canvas is gated by `IntersectionObserver` — mounts only when near-viewport, unmounts entirely when scrolled away. No mouse interaction in this component.

**Tech Stack:** Next.js 16, React 19, `@react-three/fiber` 9, `three` 0.183, Tailwind 4, TypeScript.

**Spec reference:** `docs/plans/2026-04-12-section-transition-design.md`

**Testing note:** This project has no unit-test framework. "Verification" at each task means: `npm run build` passes, `npm run lint` passes, and the band renders correctly in `npm run dev` at `http://localhost:3000`. Visual checks are performed manually in a browser (or via Playwright MCP if available).

---

## File Structure

- **Rewrite:** `src/components/SectionTransition.tsx` — orchestrator, layered band, IntersectionObserver mount gate
- **Create:** `src/components/transition/DissolveField.tsx` — self-contained R3F canvas + particle field + bonds

No other files modified. No changes to `MeshGradient.tsx`, `Hero.tsx`, or globals.

---

## Task 1: Scaffold empty `DissolveField` and swap into `SectionTransition`

**Files:**
- Create: `src/components/transition/DissolveField.tsx`
- Modify: `src/components/SectionTransition.tsx` (full rewrite)

This task gets the new layered structure rendering on the page with the CSS gradient, seam, and grain — but with an **empty** R3F canvas as a placeholder. Particles come in Task 2. This lets us verify the non-particle visuals first.

- [ ] **Step 1: Create `src/components/transition/` directory and empty `DissolveField.tsx`**

Create `src/components/transition/DissolveField.tsx` with this exact content:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";

export default function DissolveField() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* Particles arrive in Task 2 */}
    </Canvas>
  );
}
```

- [ ] **Step 2: Rewrite `src/components/SectionTransition.tsx`**

Replace the entire contents of `src/components/SectionTransition.tsx` with:

```tsx
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
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
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
```

- [ ] **Step 3: Typecheck & build**

Run: `npm run build`
Expected: completes without TypeScript errors. If it fails on `DissolveField` default export, verify Task 1 Step 1 was saved exactly.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors in `SectionTransition.tsx` or `transition/DissolveField.tsx`. Warnings about `any` or unused vars are failures — fix them.

- [ ] **Step 5: Visual check**

Run: `npm run dev`
Open `http://localhost:3000`, scroll to the band between `TechStack` and `FeaturedProject`. Verify:
- Band is 280px tall (desktop) or 200px (mobile ≤ 767px)
- Background smoothly goes dark → pearl → light with no flat grey midband
- A faint blue hairline is visible at ~62% down the band
- Very subtle grain texture visible across the band (look closely)
- No console errors in DevTools

If the band still looks flat/grey at the midpoint, double-check the `BACKGROUND_GRADIENT` stops match the spec exactly.

- [ ] **Step 6: Commit**

```bash
git add src/components/SectionTransition.tsx src/components/transition/DissolveField.tsx
git commit -m "feat(transition): layered band with s-curve gradient and seam"
```

---

## Task 2: Add particle field with baseline flow

**Files:**
- Modify: `src/components/transition/DissolveField.tsx` (full rewrite)

Add 80 desktop / 40 mobile particles that drift downward-diagonal at hero-matching speed. No dissolve yet, no bonds yet — just dots flowing. This isolates particle motion from the fade curve so we can verify each independently.

- [ ] **Step 1: Rewrite `DissolveField.tsx` with particle field**

Replace `src/components/transition/DissolveField.tsx` with:

```tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const IS_MOBILE =
  typeof window !== "undefined" && window.innerWidth < 768;
const PARTICLE_COUNT = IS_MOBILE ? 40 : 80;

// Match hero's flow direction so the continuity reads as one system.
const FLOW_BASE_Y = -0.010;
const FLOW_BASE_X = -0.0025;

// Spawn/respawn volume — tuned to fill the band at camera z=6, fov=50.
const SPREAD_X = 8;
const SPREAD_Y_TOP = 3.0;      // local y for spawn top
const SPREAD_Y_BOTTOM = -3.0;  // local y for respawn trigger
const SPREAD_Z = 2.0;

const COLOR_WHITE = new THREE.Color(0.9, 0.92, 0.95);
const COLOR_LIGHT_BLUE = new THREE.Color(0.7, 0.85, 1.0);
const COLOR_TEAL = new THREE.Color(0.176, 0.831, 0.749);
const COLOR_PURPLE = new THREE.Color(0.388, 0.4, 0.945);

function pickParticleColor(rng: number): THREE.Color {
  if (rng < 0.45) return COLOR_WHITE.clone();
  if (rng < 0.8) return COLOR_LIGHT_BLUE.clone();
  if (rng < 0.92) return COLOR_TEAL.clone();
  return COLOR_PURPLE.clone();
}

const pointVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vLocalY;

  void main() {
    vColor = aColor;
    vLocalY = position.y;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (60.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vLocalY;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float core = 1.0 - smoothstep(0.08, 0.18, dist);
    float halo = (1.0 - smoothstep(0.18, 0.50, dist)) * 0.22;
    float alpha = core + halo;

    gl_FragColor = vec4(vColor, alpha * 0.6);
  }
`;

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const state = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const baseVel = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * SPREAD_X;
      positions[i3 + 1] =
        SPREAD_Y_BOTTOM + Math.random() * (SPREAD_Y_TOP - SPREAD_Y_BOTTOM);
      positions[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z;

      const speedMul = 0.7 + Math.random() * 0.6;
      baseVel[i3] = FLOW_BASE_X * speedMul;
      baseVel[i3 + 1] = FLOW_BASE_Y * speedMul;
      baseVel[i3 + 2] = 0;

      const sizeRng = Math.random();
      if (sizeRng < 0.06) {
        sizes[i] = 2.0 + Math.random() * 1.0;
      } else if (sizeRng < 0.3) {
        sizes[i] = 1.1 + Math.random() * 0.5;
      } else {
        sizes[i] = 0.55 + Math.random() * 0.4;
      }

      const col = pickParticleColor(Math.random());
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    return { positions, baseVel, sizes, colors };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(state.positions, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(state.colors, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(state.sizes, 1));
    return g;
  }, [state]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pointVertexShader,
        fragmentShader: pointFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame(() => {
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] += state.baseVel[i3];
      positions[i3 + 1] += state.baseVel[i3 + 1];

      // Respawn at top when falling off the bottom.
      if (positions[i3 + 1] < SPREAD_Y_BOTTOM) {
        positions[i3] = (Math.random() - 0.5) * SPREAD_X;
        positions[i3 + 1] = SPREAD_Y_TOP;
        positions[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
      }
    }

    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

export default function DissolveField() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ParticleField />
    </Canvas>
  );
}
```

- [ ] **Step 2: Typecheck & build**

Run: `npm run build`
Expected: passes. Common failure: `THREE.BufferAttribute` import missing — three is already in deps, so the import `* as THREE from "three"` should work.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors. If `pointsRef` is flagged as unused, remove it from the component (we don't currently reference it).

- [ ] **Step 4: Visual check**

Run: `npm run dev`
Open `http://localhost:3000`, scroll to the transition band. Verify:
- Particles are visible across the band
- They drift downward-diagonally (not straight down, not up)
- Particles that fall off the bottom reappear at the top — steady flow, no depleted zones
- Motion speed matches the feel of the hero particles (not obviously faster/slower)
- No console errors, no WebGL errors
- Scroll away from the band, then scroll back — it still renders (IntersectionObserver remount works)

- [ ] **Step 5: Commit**

```bash
git add src/components/transition/DissolveField.tsx
git commit -m "feat(transition): add drifting particle field"
```

---

## Task 3: Add dissolve curve (alpha fade toward bottom)

**Files:**
- Modify: `src/components/transition/DissolveField.tsx:pointFragmentShader`

Particles currently have flat alpha. Add the dissolve: full at top, fading to zero before the bottom, using the local-Y coordinate we already pass to the fragment shader.

- [ ] **Step 1: Update fragment shader with dissolve curve**

In `src/components/transition/DissolveField.tsx`, replace the existing `pointFragmentShader` constant with:

```ts
const pointFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vLocalY;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float core = 1.0 - smoothstep(0.08, 0.18, dist);
    float halo = (1.0 - smoothstep(0.18, 0.50, dist)) * 0.22;
    float shape = core + halo;

    // Normalize local Y from band-bottom (0) to band-top (1).
    // SPREAD_Y is [-3, 3] so we map that to [0, 1].
    float localY01 = clamp((vLocalY + 3.0) / 6.0, 0.0, 1.0);

    // Dissolve: 0 at the bottom third, 1 by the top.
    // smoothstep(low, high, x) — here: fades in as y rises.
    float dissolve = smoothstep(0.0, 0.65, localY01);

    float alpha = shape * dissolve * 0.6;

    gl_FragColor = vec4(vColor, alpha);
  }
`;
```

The key change: `dissolve = smoothstep(0.0, 0.65, localY01)` — particles in the bottom 0% of the band are fully transparent, fading in as they rise, fully opaque by 65% up the band. Since particles *fall*, they appear at the top fully visible and dissolve as they descend.

- [ ] **Step 2: Typecheck & build**

Run: `npm run build`
Expected: passes. Shader code is a string so type errors are unlikely.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Visual check**

Run: `npm run dev`
Open the band. Verify:
- Particles appear fully opaque in the upper ~third of the band
- They visibly fade as they descend
- No particles are visible at the very bottom of the band (they've fully dissolved before reaching it)
- The transition looks like molecules "evaporating" — no hard edge, smooth fade
- Background pearl/light still visible through faded particles

If the fade is too aggressive (particles disappear too quickly): raise `0.65` to `0.75`. If not aggressive enough: lower to `0.55`.

- [ ] **Step 5: Commit**

```bash
git add src/components/transition/DissolveField.tsx
git commit -m "feat(transition): particle dissolve curve toward band bottom"
```

---

## Task 4: Add connection bonds with earlier fade

**Files:**
- Modify: `src/components/transition/DissolveField.tsx` (add line geometry, frame update, shaders)

Add molecular bonds between nearby particles, matching the hero's nearest-neighbor distance-gated bonds. Bonds fade 10% earlier than particles (using `smoothstep(0.1, 0.75, localY01)`) so lines disappear before dots — reads as cohesion breaking down as molecules fall.

- [ ] **Step 1: Add bond constants to the top of `DissolveField.tsx`**

In `src/components/transition/DissolveField.tsx`, just below the existing `SPREAD_Z = 2.0` line, add:

```ts
const CONNECTION_DISTANCE = IS_MOBILE ? 1.2 : 1.6;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_BONDS_PER_PARTICLE = 3;
const MAX_CONNECTIONS = PARTICLE_COUNT * MAX_BONDS_PER_PARTICLE;
```

- [ ] **Step 2: Add line shaders alongside the point shaders**

In `src/components/transition/DissolveField.tsx`, just after the existing `pointFragmentShader` constant, add:

```ts
const lineVertexShader = /* glsl */ `
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vLocalY;

  void main() {
    vColor = aColor;
    vLocalY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vLocalY;

  void main() {
    float localY01 = clamp((vLocalY + 3.0) / 6.0, 0.0, 1.0);
    // Bonds fade earlier than dots: start fading at 0.1, fully opaque only at 0.75.
    float dissolve = smoothstep(0.1, 0.75, localY01);
    float alpha = dissolve * 0.25;
    gl_FragColor = vec4(vColor, alpha);
  }
`;
```

Lines carry their own `vLocalY` varying so each line endpoint fades by its own height — a line stretched from mid-band to lower-band will fade out gracefully at the lower end.

- [ ] **Step 3: Extend `state` to include line buffers**

In `src/components/transition/DissolveField.tsx`, replace the `const state = useMemo(...)` block inside `ParticleField` with:

```tsx
const state = useMemo(() => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const baseVel = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  // Line buffers: each bond = 2 vertices × 3 floats position + 3 floats color
  const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
  const lineColors = new Float32Array(MAX_CONNECTIONS * 2 * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * SPREAD_X;
    positions[i3 + 1] =
      SPREAD_Y_BOTTOM + Math.random() * (SPREAD_Y_TOP - SPREAD_Y_BOTTOM);
    positions[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z;

    const speedMul = 0.7 + Math.random() * 0.6;
    baseVel[i3] = FLOW_BASE_X * speedMul;
    baseVel[i3 + 1] = FLOW_BASE_Y * speedMul;
    baseVel[i3 + 2] = 0;

    const sizeRng = Math.random();
    if (sizeRng < 0.06) {
      sizes[i] = 2.0 + Math.random() * 1.0;
    } else if (sizeRng < 0.3) {
      sizes[i] = 1.1 + Math.random() * 0.5;
    } else {
      sizes[i] = 0.55 + Math.random() * 0.4;
    }

    const col = pickParticleColor(Math.random());
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  return { positions, baseVel, sizes, colors, linePositions, lineColors };
}, []);
```

- [ ] **Step 4: Create line geometry + material alongside points**

In `src/components/transition/DissolveField.tsx`, replace the existing `const material = useMemo(...)` block and the `return <points ... />` block at the bottom of `ParticleField` with:

```tsx
const material = useMemo(
  () =>
    new THREE.ShaderMaterial({
      vertexShader: pointVertexShader,
      fragmentShader: pointFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  [],
);

const lineGeometry = useMemo(() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.BufferAttribute(state.linePositions, 3),
  );
  g.setAttribute("aColor", new THREE.BufferAttribute(state.lineColors, 3));
  g.setDrawRange(0, 0);
  return g;
}, [state]);

const lineMaterial = useMemo(
  () =>
    new THREE.ShaderMaterial({
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  [],
);
```

And replace the existing `return <points ... />` line with:

```tsx
return (
  <>
    <points ref={pointsRef} geometry={geometry} material={material} />
    <lineSegments geometry={lineGeometry} material={lineMaterial} />
  </>
);
```

- [ ] **Step 5: Rebuild bonds every frame inside `useFrame`**

In `src/components/transition/DissolveField.tsx`, replace the existing `useFrame(() => { ... })` block with:

```tsx
const bondCounts = useMemo(
  () => new Uint8Array(PARTICLE_COUNT),
  [],
);

useFrame(() => {
  const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
  const positions = posAttr.array as Float32Array;

  // 1. Advance particles, respawn off-bottom.
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3] += state.baseVel[i3];
    positions[i3 + 1] += state.baseVel[i3 + 1];

    if (positions[i3 + 1] < SPREAD_Y_BOTTOM) {
      positions[i3] = (Math.random() - 0.5) * SPREAD_X;
      positions[i3 + 1] = SPREAD_Y_TOP;
      positions[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
    }
  }
  posAttr.needsUpdate = true;

  // 2. Rebuild bonds — O(n²) is fine at n=80.
  bondCounts.fill(0);
  const linePos = state.linePositions;
  const lineCol = state.lineColors;
  let write = 0;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    if (bondCounts[i] >= MAX_BONDS_PER_PARTICLE) continue;
    const i3 = i * 3;
    const ax = positions[i3];
    const ay = positions[i3 + 1];
    const az = positions[i3 + 2];
    const acR = state.colors[i3];
    const acG = state.colors[i3 + 1];
    const acB = state.colors[i3 + 2];

    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      if (bondCounts[j] >= MAX_BONDS_PER_PARTICLE) continue;
      const j3 = j * 3;
      const dx = ax - positions[j3];
      const dy = ay - positions[j3 + 1];
      const dz = az - positions[j3 + 2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > CONNECTION_DISTANCE_SQ) continue;

      // Write line segment A → B.
      linePos[write * 6 + 0] = ax;
      linePos[write * 6 + 1] = ay;
      linePos[write * 6 + 2] = az;
      linePos[write * 6 + 3] = positions[j3];
      linePos[write * 6 + 4] = positions[j3 + 1];
      linePos[write * 6 + 5] = positions[j3 + 2];

      lineCol[write * 6 + 0] = acR;
      lineCol[write * 6 + 1] = acG;
      lineCol[write * 6 + 2] = acB;
      lineCol[write * 6 + 3] = state.colors[j3];
      lineCol[write * 6 + 4] = state.colors[j3 + 1];
      lineCol[write * 6 + 5] = state.colors[j3 + 2];

      bondCounts[i]++;
      bondCounts[j]++;
      write++;
      if (write >= MAX_CONNECTIONS) break;
      if (bondCounts[i] >= MAX_BONDS_PER_PARTICLE) break;
    }
    if (write >= MAX_CONNECTIONS) break;
  }

  const linePosAttr = lineGeometry.getAttribute(
    "position",
  ) as THREE.BufferAttribute;
  const lineColAttr = lineGeometry.getAttribute(
    "aColor",
  ) as THREE.BufferAttribute;
  linePosAttr.needsUpdate = true;
  lineColAttr.needsUpdate = true;
  lineGeometry.setDrawRange(0, write * 2);
});
```

- [ ] **Step 6: Typecheck & build**

Run: `npm run build`
Expected: passes. If `lineSegments` JSX element errors out, that's because R3F's types need the `three` import — the existing `import * as THREE from "three"` at the top is sufficient; `lineSegments` is auto-registered by R3F.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: no errors. If `pointsRef` is flagged unused and you already kept the ref for Task 2, remove it now — we no longer need it since we access geometry directly.

- [ ] **Step 8: Visual check**

Run: `npm run dev`
Open the transition band. Verify:
- Thin colored lines connect nearby particles (the "molecular bond" look)
- Bonds form/break as particles move — dynamic, not static
- Bonds fade out **before** the dots do as particles descend — look at the lower third of the band: dots should still be faintly visible while bonds are already gone
- No more than ~3 lines emanating from any one particle
- No rendering artifacts (flashing lines, lines shooting off-screen)
- Frame rate stays smooth (no stutter)

- [ ] **Step 9: Commit**

```bash
git add src/components/transition/DissolveField.tsx
git commit -m "feat(transition): molecular bonds with earlier fade curve"
```

---

## Task 5: Performance verification and polish

**Files:**
- Potentially modify: `src/components/SectionTransition.tsx`, `src/components/transition/DissolveField.tsx`

Verify the whole thing meets the < 2ms/frame budget and scroll behavior is clean. Adjust only if measurements require it.

- [ ] **Step 1: Build and serve**

Run: `npm run build && npm run start`
Wait for it to serve at `http://localhost:3000`.

- [ ] **Step 2: Chrome DevTools Performance recording**

Open `http://localhost:3000` in Chrome. Open DevTools → Performance panel. Start a recording. Scroll slowly from top of page to the bottom of `FeaturedProject`. Stop recording.

Check:
- When scrolling through the transition band, the main-thread green bars stay lean (no long tasks > 50ms)
- GPU activity is present but bounded — no red flames at the transition
- Main-thread frame time averaged across the scroll through the transition stays under 16.67ms
- The transition's frames (you can identify them by scrubbing) contribute less than 2ms to frame budget when visible

If frame time exceeds budget, the most effective lever is reducing `PARTICLE_COUNT` in `DissolveField.tsx`. Drop desktop from `80` to `60`, rebuild, remeasure.

- [ ] **Step 3: Scroll away / scroll back test**

Scroll to the top of the page (hero fully visible), then scroll back down past the transition, then back up again. Verify:
- No flickering when the canvas mounts/unmounts via IntersectionObserver
- No console warnings about memory leaks, disposed textures, or WebGL context loss
- Particle state is fresh each time the canvas remounts (expected — they're re-seeded)

- [ ] **Step 4: Reduced-motion test**

In Chrome DevTools → Rendering tab → "Emulate CSS media feature `prefers-reduced-motion`" → select "reduce". Reload the page. Verify:
- The transition band still renders correctly
- The background gradient, seam line, and grain are all present
- **No** particles render (the canvas should not mount)
- The band still looks intentional and finished without particles

- [ ] **Step 5: Mobile viewport test**

In Chrome DevTools → device toolbar → select iPhone 14 Pro (or any `< 768px` device). Reload. Verify:
- The band is 200px tall (not 280px)
- Particles still render at the lower count (~40)
- No scroll/layout issues
- Frame rate still smooth on the CPU throttle "Mid-tier mobile" setting

- [ ] **Step 6: Commit any tuning**

If you adjusted particle counts or other values, commit those:

```bash
git add src/components/transition/DissolveField.tsx
git commit -m "perf(transition): tune particle count for frame budget"
```

If nothing needed tuning, skip this step.

---

## Self-Review (already performed by plan author)

**Spec coverage:**
- Background S-curve → Task 1 (step 2, `BACKGROUND_GRADIENT`)
- Seam line at 62% → Task 1 (step 2)
- Grain overlay → Task 1 (step 2)
- IntersectionObserver mount gating → Task 1 (step 2, `inView` state)
- Reduced-motion gating → Task 1 (step 2, `reducedMotion` state)
- Particle field 80/40 desktop/mobile → Task 2
- Hero-matching flow constants (`FLOW_BASE_Y`, `FLOW_BASE_X`) → Task 2
- Respawn at top on fall-off → Task 2 (useFrame loop)
- Dissolve curve `smoothstep(1.0, 0.35, localY)` → Task 3 (adapted as `smoothstep(0.0, 0.65, localY01)` — same curve, opposite direction because particles fall from high-y to low-y)
- Bonds with `MAX_BONDS_PER_PARTICLE = 3` → Task 4
- Bonds fade earlier than dots → Task 4 (shader uses `smoothstep(0.1, 0.75, localY01)` vs dots' `smoothstep(0.0, 0.65, localY01)`)
- `CONNECTION_DISTANCE = 1.6` desktop / `1.2` mobile → Task 4
- Canvas config (dpr, antialias false, low-power, alpha true) → Task 1
- `baseAlpha = 0.6` → Task 2 (point fragment shader `* 0.6`)
- Perf budget verification → Task 5

**Placeholders:** none — all code is complete in each step.

**Type consistency:** `DissolveField` default export used consistently. `state` object shape extended in Task 4 matches what's referenced in `useFrame`. Shader attribute names (`aColor`, `aSize`) match between JS and GLSL.

---

## Out of Scope

- Mouse interaction on transition particles (per spec, explicitly excluded)
- Changes to `MeshGradient.tsx` or the hero
- Editorial label / section marker text
- Any animation on the seam line or grain
- Sharing state with the hero's canvas
