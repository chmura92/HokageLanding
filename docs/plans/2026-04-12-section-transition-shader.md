# Section Transition GLSL Shader Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the flat CSS gradient in `SectionTransition.tsx` with a GLSL fragment shader that uses FBM noise to create an organic, animated boundary between the dark (`#111827`) and light (`#F8FAFC`) sections, with a luminous accent glow at the edge.

**Architecture:** Single component rewrite. Same Three.js/React Three Fiber pattern as `MeshGradient.tsx` — an inner `TransitionScene` drives a full-screen quad shader via `useFrame`, wrapped in a `dynamic` import to skip SSR. No new dependencies — `@react-three/fiber` and `three` are already installed.

**Tech Stack:** React Three Fiber, Three.js (`ShaderMaterial`), Next.js `dynamic`, Framer Motion removed from this component (shader handles all motion).

---

### Task 1: Replace `SectionTransition.tsx` with the GLSL shader component

**Files:**
- Modify: `src/components/SectionTransition.tsx` (full rewrite)

**Step 1: Read the current file to confirm its contents**

Read `src/components/SectionTransition.tsx` and confirm it is the 21-line CSS gradient version before touching it.

**Step 2: Rewrite the file with the shader implementation**

Replace the entire file with the following:

```tsx
"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import dynamic from "next/dynamic";

// ---------------------------------------------------------------------------
// Organic noise edge — FBM-based threshold dissolves dark (#111827) into
// light (#F8FAFC) with a luminous cyan/blue glow at the boundary.
// Same shader pattern as MeshGradient for visual continuity.
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    // 30° rotation between octaves breaks up axis-aligned banding
    mat2 rot = mat2(0.8660, 0.5, -0.5, 0.8660);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.1 + vec2(5.2, 1.3);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Slow horizontal drift — keeps the edge alive without being distracting
    float t = uTime * 0.04;
    float n = fbm(vec2(uv.x * 2.5 + t, t * 0.3));

    // Edge position: centered at 0.5, noise displaces ±0.27
    float edge = 0.5 + (n - 0.5) * 0.55;

    // Soft blend width across the edge
    float blend = smoothstep(edge - 0.08, edge + 0.08, uv.y);

    // Section colors
    vec3 dark  = vec3(0.0667, 0.0941, 0.1529); // #111827  (space-lifted)
    vec3 light = vec3(0.9725, 0.9804, 0.9882); // #F8FAFC  (surface-light)
    vec3 color = mix(dark, light, blend);

    // Luminous accent glow at the edge boundary
    float glowStr = exp(-abs(uv.y - edge) * 18.0);
    vec3 accentTeal = vec3(0.176, 0.831, 0.749); // #2DD4BF
    vec3 accentBlue = vec3(0.290, 0.620, 0.898); // #4A9EE5
    vec3 accentCol  = mix(accentTeal, accentBlue, uv.x);
    color += accentCol * glowStr * 0.35;

    // Fine film grain — matches hero texture
    float g = hash(gl_FragCoord.xy * 0.5 + vec2(uTime * 31.0, uTime * 17.0));
    color += (g - 0.5) * 0.018;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ---------------------------------------------------------------------------

function TransitionScene() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------

function SectionTransitionInner() {
  const [visible, setVisible] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? true),
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="relative overflow-hidden h-[240px]">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        frameloop={visible ? "always" : "never"}
      >
        <TransitionScene />
      </Canvas>
    </div>
  );
}

const SectionTransition = dynamic(() => Promise.resolve(SectionTransitionInner), {
  ssr: false,
});

export default SectionTransition;
```

**Step 3: Start the dev server and visually verify**

Run:
```bash
npm run dev
```

Open `http://localhost:3000` and scroll to the transition between TechStack and FeaturedProject. Verify:
- [ ] The edge is an organic, undulating line — not a flat horizontal gradient
- [ ] The boundary animates slowly (drifts left/right over ~25s cycle)
- [ ] A faint cyan/blue luminous glow pulses at the edge
- [ ] Dark section above matches `#111827`, light section below matches `#F8FAFC`
- [ ] No seam or hard horizontal cut at the top or bottom of the 240px band
- [ ] Film grain is visible but subtle

**Step 4: Tweak if needed**

If the edge is too chaotic: lower the `0.55` amplitude multiplier on `edge` toward `0.35`.
If the glow is too bright: lower `0.35` on `color += accentCol * glowStr * 0.35`.
If the animation is too fast: lower `0.04` on `t = uTime * 0.04`.

**Step 5: Commit**

```bash
git add src/components/SectionTransition.tsx
git commit -m "feat(transition): GLSL noise edge with accent glow replaces flat gradient"
```
