# V3 Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish the landing page with enhanced hero animation, reworked skills section, timeline bug fix, new connection section, and tasteful animation enhancements.

**Architecture:** Modify existing components in-place. One new component (PersonalConnection). Data files updated to split technologies from methodologies. Hero particle system enhanced with attraction physics. No new dependencies needed.

**Tech Stack:** Next.js 16, React 19, Three.js, Framer Motion 12, Tailwind CSS 4

---

### Task 1: Fix Career Timeline Scroll Bug

The timeline scroll line animation breaks on re-scroll because `useSpring` wrapping `useTransform` creates a spring that fights with the transform on direction change. The spring accumulates momentum and overshoots when scrolling back up, causing the line to jitter or extend beyond bounds.

**Files:**
- Modify: `src/components/CareerTimeline.tsx`

**Step 1: Replace useSpring + useState with useTransform directly**

The fix: drop `useSpring` entirely (it causes the stale-target issue) and use `useTransform` to map scroll progress to a percentage string. Use CSS `transition` on the element for smoothness instead of a physics spring.

Replace the entire `src/components/CareerTimeline.tsx` with:

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { career } from "@/data/career";

export default function CareerTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Direct transform: scroll progress -> height percentage (no spring)
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ["0%", "100%"]);

  return (
    <section
      id="career"
      ref={sectionRef}
      className="bg-surface-light py-24 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-ink-muted mb-16 text-center">
          Career
        </h2>

        <div className="relative">
          {/* Background vertical line */}
          <div className="absolute top-0 bottom-0 left-4 md:left-1/2 md:-translate-x-px w-0.5 bg-gray-200" />

          {/* Animated overlay line */}
          <motion.div
            className="absolute top-0 left-4 md:left-1/2 md:-translate-x-px w-0.5 bg-accent-blue origin-top"
            style={{ height: lineHeight }}
          />

          {/* Entries */}
          <div className="flex flex-col gap-16">
            {career.map((entry, index) => {
              const isLeft = index % 2 === 0;
              const isCurrent = index === 0;

              return (
                <div
                  key={index}
                  className="relative flex items-start md:items-center"
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                    {isCurrent && (
                      <motion.span
                        className="absolute inset-0 -m-1.5 rounded-full bg-accent-blue/30"
                        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                        transition={{
                          duration: 2,
                          ease: "easeOut",
                          repeat: Infinity,
                        }}
                      />
                    )}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="relative w-4 h-4 rounded-full bg-accent-blue border-[3px] border-white shadow-sm"
                    />
                  </div>

                  {/* Horizontal connector (desktop) */}
                  <div
                    className={`hidden md:block absolute top-1/2 -translate-y-px h-px bg-gray-200 ${
                      isLeft
                        ? "right-1/2 mr-2 w-8"
                        : "left-1/2 ml-2 w-8"
                    }`}
                  />

                  {/* Spacer (desktop) */}
                  <div
                    className={`hidden md:block md:w-1/2 ${
                      isLeft ? "md:order-2" : "md:order-1"
                    }`}
                  />

                  {/* Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`ml-10 md:ml-0 md:w-1/2 ${
                      isLeft
                        ? "md:order-1 md:pr-14"
                        : "md:order-2 md:pl-14"
                    }`}
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300">
                      <p className="text-lg font-bold text-ink-heading">
                        {entry.company}{" "}
                        <span className="font-normal text-ink-muted">
                          &middot; {entry.location}
                        </span>
                      </p>
                      <p className="text-sm font-medium text-accent-blue mt-0.5">
                        {entry.role}
                      </p>
                      <span className="inline-block text-xs bg-accent-blue/10 text-accent-blue px-2.5 py-0.5 rounded-full font-medium mt-1.5">
                        {entry.period}
                      </span>
                      <p className="text-sm text-ink-body mt-2 font-medium">
                        {entry.description}
                      </p>
                      {entry.highlights.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {entry.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-accent-blue mt-1.5 shrink-0" />
                              <span className="text-xs text-ink-muted">{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify in browser**

Run: `npm run dev`

Test:
1. Scroll down to Career section — blue line should grow smoothly
2. Scroll back up — line should shrink smoothly, no jitter
3. Scroll down again — line should grow again cleanly
4. Cards should slide in from sides once and stay

**Step 3: Commit**

```bash
git add src/components/CareerTimeline.tsx
git commit -m "fix: replace useSpring with useTransform for timeline scroll line

Removes the spring-based animation that caused stale targets on re-scroll,
replacing with direct useTransform mapping. Adds hover shadow to cards."
```

---

### Task 2: StockTrack — Remove Link + Add Private Badge

**Files:**
- Modify: `src/data/projects.ts` (remove StockTrack URL)
- Modify: `src/components/ProjectCard.tsx` (add Private/Enterprise badge)

**Step 1: Remove StockTrack URL from data**

In `src/data/projects.ts`, remove the `url` field from the StockTrack entry:

```ts
// Change this:
  {
    name: "StockTrack",
    description: "Offshore energy logistics platform — inventory tracking, stock trades, real-time analytics.",
    role: "Senior Engineer",
    roleType: "professional",
    tech: [".NET 8", "Angular", "GraphQL", "Kubernetes"],
    url: "https://portacapena.com/en/projects",
  },
// To this:
  {
    name: "StockTrack",
    description: "Offshore energy logistics platform — inventory tracking, stock trades, real-time analytics.",
    role: "Senior Engineer",
    roleType: "professional",
    tech: [".NET 8", "Angular", "GraphQL", "Kubernetes"],
  },
```

**Step 2: Add Private/Enterprise badge to ProjectCard**

In `src/components/ProjectCard.tsx`, add a badge when there's no URL. After the external link icon span (line 37-42), add an else case:

Replace the icon block inside the gradient area:

```tsx
// Replace this block (lines 37-42):
        {project.url && (
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-1.5">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        )}
// With:
        {project.url ? (
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-1.5">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        ) : (
          <span className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 border border-white/10">
            Enterprise
          </span>
        )}
```

**Step 3: Verify in browser**

- StockTrack card should NOT be clickable (no link wrapper)
- StockTrack should show "Enterprise" badge in top-right corner
- Other project cards with URLs should still work as before

**Step 4: Commit**

```bash
git add src/data/projects.ts src/components/ProjectCard.tsx
git commit -m "fix: remove StockTrack link, add Enterprise badge for private projects"
```

---

### Task 3: Rework Tech Stack — Technologies with Rings + Buzzword Tags

This is the largest task. Split skills data into technologies (with proficiency) and methodologies (buzzword tags). Build radial ring components with SVG + Framer Motion. Build scattered buzzword tags.

**Files:**
- Rewrite: `src/data/skills.ts` (split into technologies + methodologies)
- Rewrite: `src/components/TechStack.tsx` (new two-section layout)

**Step 1: Rewrite skills data**

Replace `src/data/skills.ts` entirely:

```ts
export interface Technology {
  name: string;
  level: number; // 1-5, used as ring fill percentage (level/5 * 100)
}

export interface TechGroup {
  label: string;
  technologies: Technology[];
}

export const techGroups: TechGroup[] = [
  {
    label: "Backend",
    technologies: [
      { name: ".NET 8", level: 5 },
      { name: "C#", level: 5 },
      { name: "ASP.NET Core", level: 5 },
      { name: "EF Core", level: 4 },
      { name: "SignalR", level: 4 },
      { name: "GraphQL", level: 3 },
      { name: "Hangfire", level: 3 },
    ],
  },
  {
    label: "Frontend",
    technologies: [
      { name: "Angular", level: 5 },
      { name: "React", level: 4 },
      { name: "RxJS", level: 4 },
      { name: "Blazor", level: 3 },
    ],
  },
  {
    label: "Cloud & DevOps",
    technologies: [
      { name: "Azure", level: 4 },
      { name: "Docker", level: 4 },
      { name: "Kubernetes", level: 3 },
      { name: "Azure Pipelines", level: 4 },
      { name: "Jenkins", level: 3 },
    ],
  },
  {
    label: "Databases",
    technologies: [
      { name: "SQL Server", level: 5 },
      { name: "PostgreSQL", level: 4 },
      { name: "Redis", level: 3 },
      { name: "MongoDB", level: 3 },
    ],
  },
  {
    label: "Mobile",
    technologies: [
      { name: "React Native", level: 4 },
      { name: "Xamarin", level: 3 },
    ],
  },
  {
    label: "Tooling",
    technologies: [
      { name: "Git", level: 5 },
      { name: "Azure DevOps", level: 5 },
      { name: "Jira", level: 4 },
    ],
  },
];

export const methodologies: string[] = [
  "DDD",
  "CQRS",
  "Clean Architecture",
  "Event Storming",
  "Microservices",
  "CI/CD",
  "Agile",
  "TDD",
];
```

**Step 2: Rewrite TechStack component**

Replace `src/components/TechStack.tsx` entirely. The component has two sections:
1. Technology rings grouped by domain — SVG circle rings that animate fill on scroll-into-view
2. Methodology buzzword tags — scattered pills with staggered fade-in

```tsx
"use client";

import { motion } from "framer-motion";
import { techGroups, methodologies } from "../data/skills";

const RING_SIZE = 72;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function TechRing({ name, level, index }: { name: string; level: number; index: number }) {
  const fillPercent = level / 5;
  const isExpert = level === 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="relative">
        <svg width={RING_SIZE} height={RING_SIZE} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={RING_STROKE}
          />
          {/* Animated fill ring */}
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={isExpert ? "#2DD4BF" : "#4A9EE5"}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
            whileInView={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - fillPercent) }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 + 0.2, duration: 0.8, ease: "easeOut" }}
            className="group-hover:drop-shadow-[0_0_6px_rgba(74,158,229,0.5)] transition-[filter] duration-300"
          />
        </svg>
        {/* Level number in center */}
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${isExpert ? "text-accent-teal" : "text-accent-blue"}`}>
          {level}
        </span>
      </div>
      <span className="text-xs text-gray-400 text-center leading-tight group-hover:text-gray-200 transition-colors duration-300">
        {name}
      </span>
    </motion.div>
  );
}

const buzzwordVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" },
  }),
};

export default function TechStack() {
  const primaryGroups = new Set(["Backend"]);

  return (
    <section id="stack" className="bg-space-lifted py-24 px-6">
      <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-12 text-center">
        Stack
      </h2>

      {/* Technology rings by group */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {techGroups.map((group) => {
          const isPrimary = primaryGroups.has(group.label);

          return (
            <div key={group.label}>
              <div className="mb-4">
                <h3
                  className={`text-xs uppercase tracking-wider font-semibold ${
                    isPrimary ? "text-accent-teal" : "text-gray-500"
                  }`}
                >
                  {group.label}
                </h3>
                <div
                  className={`mt-1.5 h-px ${
                    isPrimary
                      ? "bg-gradient-to-r from-accent-teal/60 to-transparent"
                      : "bg-gradient-to-r from-white/10 to-transparent"
                  }`}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                {group.technologies.map((tech, i) => (
                  <TechRing key={tech.name} name={tech.name} level={tech.level} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology buzzword tags */}
      <div className="max-w-3xl mx-auto mt-16">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500 text-center mb-6">
          Practices & Methodologies
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {methodologies.map((tag, i) => (
            <motion.span
              key={tag}
              custom={i}
              variants={buzzwordVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-2
                hover:bg-white/10 hover:border-accent-blue/30 hover:text-white
                hover:shadow-[0_0_12px_rgba(74,158,229,0.15)]
                transition-all duration-300 cursor-default"
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Verify in browser**

- Tech groups should show radial rings with animated fill on scroll
- Level 5 skills should be teal, others blue
- Number shown in center of each ring
- Hover: subtle glow on rings, text brightens
- Methodology tags should appear as pills below, with staggered fade-in
- Hover on tags: background brightens, subtle blue glow

**Step 4: Commit**

```bash
git add src/data/skills.ts src/components/TechStack.tsx
git commit -m "feat: rework tech stack — radial rings for technologies, buzzword tags for methodologies

Replaces dot rating system with SVG circle rings animated via Framer Motion.
Technologies grouped by domain with proficiency rings. Methodologies shown
as scattered animated pills below. Level 5 skills highlighted in teal."
```

---

### Task 4: Enhance Hero Particle System

Convert the particle field from mouse repulsion to mouse attraction, creating organic molecule-like clusters that follow the cursor.

**Files:**
- Rewrite: `src/components/MeshGradient.tsx`

**Step 1: Update particle physics**

Key changes:
- Mouse interaction: attraction instead of repulsion (particles drift toward cursor)
- Limit bonds per particle to 3-4 for organic feel
- Stronger attraction force, softer return-to-home
- Connection lines with distance-based opacity falloff (brighter when closer)
- Particles vary in size more (atom-like: some large, most small)
- Mobile: reduce particle count

Replace `src/components/MeshGradient.tsx` entirely:

```tsx
"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import dynamic from "next/dynamic";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IS_MOBILE = typeof window !== "undefined" && window.innerWidth < 768;
const PARTICLE_COUNT = IS_MOBILE ? 150 : 300;
const MAX_CONNECTIONS = 600;
const CONNECTION_DISTANCE = 1.4;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_BONDS_PER_PARTICLE = 4;
const MOUSE_RADIUS = 3.0;
const MOUSE_FORCE = 0.035; // attraction strength
const DAMPING = 0.97;
const AMBIENT_SPEED = 0.12;
const SPREAD_X = 8;
const SPREAD_Y = 5;
const SPREAD_Z = 2.5;
const RETURN_STRENGTH = 0.003;

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const pointVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mvPosition.z;
    gl_PointSize = aSize * (120.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    float depthFade = clamp(1.0 - (vDepth - 3.0) / 6.0, 0.15, 0.8);
    alpha *= depthFade * 0.4;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

const lineVertexShader = /* glsl */ `
  attribute vec3 aLineColor;
  attribute float aLineAlpha;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aLineColor;
    vAlpha = aLineAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLOR_WHITE = new THREE.Color(0.9, 0.92, 0.95);
const COLOR_LIGHT_BLUE = new THREE.Color(0.7, 0.85, 1.0);
const COLOR_TEAL = new THREE.Color(0.176, 0.831, 0.749);
const COLOR_PURPLE = new THREE.Color(0.388, 0.4, 0.945);
const LINE_COLOR_IDLE = new THREE.Color(0.4, 0.55, 0.7);
const LINE_COLOR_ACTIVE = new THREE.Color(0.45, 0.7, 0.85);

function pickParticleColor(rng: number): THREE.Color {
  if (rng < 0.45) return COLOR_WHITE.clone();
  if (rng < 0.75) return COLOR_LIGHT_BLUE.clone();
  if (rng < 0.9) return COLOR_TEAL.clone();
  return COLOR_PURPLE.clone();
}

// ---------------------------------------------------------------------------
// Particle System
// ---------------------------------------------------------------------------

interface ParticleMouseRef {
  x: number;
  y: number;
  active: boolean;
}

function ParticleField({ mouse }: { mouse: React.RefObject<ParticleMouseRef> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();

  const state = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const homePositions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * SPREAD_X;
      const y = (Math.random() - 0.5) * SPREAD_Y;
      const z = (Math.random() - 0.5) * SPREAD_Z;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      homePositions[i3] = x;
      homePositions[i3 + 1] = y;
      homePositions[i3 + 2] = z;
      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      // Vary sizes more: some larger "atoms", most smaller
      const sizeRng = Math.random();
      sizes[i] = sizeRng < 0.1 ? 1.8 + Math.random() * 1.0 : 0.4 + Math.random() * 1.0;

      const col = pickParticleColor(Math.random());
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, homePositions, velocities, sizes, colors, phases };
  }, []);

  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(state.positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(state.sizes, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(state.colors, 3));
    return geo;
  }, [state]);

  const pointsMaterial = useMemo(
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

  const linesState = useMemo(() => {
    const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const lineColors = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const lineAlphas = new Float32Array(MAX_CONNECTIONS * 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage),
    );
    geo.setAttribute(
      "aLineColor",
      new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage),
    );
    geo.setAttribute(
      "aLineAlpha",
      new THREE.BufferAttribute(lineAlphas, 1).setUsage(THREE.DynamicDrawUsage),
    );
    geo.setDrawRange(0, 0);
    return { linePositions, lineColors, lineAlphas, geo };
  }, []);

  const linesMaterial = useMemo(
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

  const smoothMouse = useRef(new THREE.Vector3(0, 0, 0));
  // Track per-particle bond count each frame
  const bondCounts = useMemo(() => new Uint8Array(PARTICLE_COUNT), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = performance.now() * 0.001;

    const pos = state.positions;
    const home = state.homePositions;
    const vel = state.velocities;
    const phases = state.phases;
    const mouseRef = mouse.current;

    // Mouse world position
    if (mouseRef && mouseRef.active) {
      const mouseNDC = new THREE.Vector3(mouseRef.x, mouseRef.y, 0.5);
      mouseNDC.unproject(camera);
      const dir = mouseNDC.sub(camera.position).normalize();
      const t = -camera.position.z / dir.z;
      const worldMouse = camera.position.clone().add(dir.multiplyScalar(t));
      smoothMouse.current.lerp(worldMouse, 0.08);
    }

    const mx = smoothMouse.current.x;
    const my = smoothMouse.current.y;
    const mouseActive = mouseRef ? mouseRef.active : false;

    // Update particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Ambient drift
      const phase = phases[i];
      vel[i3] += Math.sin(time * 0.3 + phase) * AMBIENT_SPEED * dt;
      vel[i3 + 1] += Math.cos(time * 0.25 + phase * 1.3) * AMBIENT_SPEED * dt;
      vel[i3 + 2] += Math.sin(time * 0.2 + phase * 0.7) * AMBIENT_SPEED * 0.2 * dt;

      // Mouse ATTRACTION (particles follow cursor)
      if (mouseActive) {
        const dx = mx - pos[i3]; // toward mouse
        const dy = my - pos[i3 + 1];
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        if (dist < MOUSE_RADIUS && dist > 0.01) {
          // Attraction strength falls off with distance
          const strength = (1.0 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          vel[i3] += (dx / dist) * strength;
          vel[i3 + 1] += (dy / dist) * strength;
        }
      }

      // Return to home (gentle spring)
      vel[i3] += (home[i3] - pos[i3]) * RETURN_STRENGTH;
      vel[i3 + 1] += (home[i3 + 1] - pos[i3 + 1]) * RETURN_STRENGTH;
      vel[i3 + 2] += (home[i3 + 2] - pos[i3 + 2]) * RETURN_STRENGTH;

      // Damping
      vel[i3] *= DAMPING;
      vel[i3 + 1] *= DAMPING;
      vel[i3 + 2] *= DAMPING;

      // Update position
      pos[i3] += vel[i3];
      pos[i3 + 1] += vel[i3 + 1];
      pos[i3 + 2] += vel[i3 + 2];
    }

    const posAttr = pointsGeometry.getAttribute("position");
    (posAttr as THREE.BufferAttribute).needsUpdate = true;

    // Connection lines with bond limit
    const lp = linesState.linePositions;
    const lc = linesState.lineColors;
    const la = linesState.lineAlphas;
    let lineIdx = 0;

    // Reset bond counts
    bondCounts.fill(0);

    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i++) {
      if (bondCounts[i] >= MAX_BONDS_PER_PARTICLE) continue;

      const i3 = i * 3;
      const ix = pos[i3];
      const iy = pos[i3 + 1];
      const iz = pos[i3 + 2];

      for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; j++) {
        if (bondCounts[j] >= MAX_BONDS_PER_PARTICLE) continue;

        const j3 = j * 3;
        const dx = ix - pos[j3];
        const dy = iy - pos[j3 + 1];
        const dz = iz - pos[j3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < CONNECTION_DISTANCE_SQ) {
          const v = lineIdx * 6;
          const a = lineIdx * 2;

          lp[v] = ix;
          lp[v + 1] = iy;
          lp[v + 2] = iz;
          lp[v + 3] = pos[j3];
          lp[v + 4] = pos[j3 + 1];
          lp[v + 5] = pos[j3 + 2];

          // Proximity to mouse affects line color/brightness
          const midX = (ix + pos[j3]) * 0.5;
          const midY = (iy + pos[j3 + 1]) * 0.5;
          const mouseDist = Math.sqrt((midX - mx) * (midX - mx) + (midY - my) * (midY - my));
          const mouseInfluence = mouseActive ? Math.max(0, 1.0 - mouseDist / MOUSE_RADIUS) : 0;

          const ratio = distSq / CONNECTION_DISTANCE_SQ;
          const baseAlpha = (1.0 - ratio) * 0.08;
          const alpha = baseAlpha + mouseInfluence * 0.06;

          const lineColor = mouseInfluence > 0.3 ? LINE_COLOR_ACTIVE : LINE_COLOR_IDLE;
          lc[v] = lineColor.r;
          lc[v + 1] = lineColor.g;
          lc[v + 2] = lineColor.b;
          lc[v + 3] = lineColor.r;
          lc[v + 4] = lineColor.g;
          lc[v + 5] = lineColor.b;

          la[a] = alpha;
          la[a + 1] = alpha;

          bondCounts[i]++;
          bondCounts[j]++;
          lineIdx++;
        }
      }
    }

    linesState.geo.setDrawRange(0, lineIdx * 2);
    (linesState.geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (linesState.geo.getAttribute("aLineColor") as THREE.BufferAttribute).needsUpdate = true;
    (linesState.geo.getAttribute("aLineAlpha") as THREE.BufferAttribute).needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      linesState.geo.dispose();
      linesMaterial.dispose();
    };
  }, [pointsGeometry, pointsMaterial, linesState.geo, linesMaterial]);

  return (
    <>
      <points ref={pointsRef} geometry={pointsGeometry} material={pointsMaterial} />
      <lineSegments ref={linesRef} geometry={linesState.geo} material={linesMaterial} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function MeshGradientInner() {
  const mouse = useRef<ParticleMouseRef>({ x: 0, y: 0, active: false });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.current.active = true;
    },
    [],
  );

  const handlePointerLeave = useCallback(() => {
    mouse.current.active = false;
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        style={{ background: "#0B1221" }}
      >
        <ParticleField mouse={mouse} />
      </Canvas>
    </div>
  );
}

const MeshGradient = dynamic(() => Promise.resolve(MeshGradientInner), {
  ssr: false,
});

export default MeshGradient;
```

**Step 2: Verify in browser**

- Move mouse over hero: particles should drift TOWARD the cursor, forming clusters
- Connection lines should appear between nearby particles (limited to 3-4 per particle)
- Lines near cursor should be brighter
- Moving mouse away: particles slowly return to home positions
- Some particles should be visibly larger than others (atom-like)
- On mobile viewport: fewer particles, still interactive via touch

**Step 3: Commit**

```bash
git add src/components/MeshGradient.tsx
git commit -m "feat: enhance hero particles — mouse attraction, organic bonds, atom-like sizing

Particles now follow the mouse cursor instead of repelling. Bond count limited
to 3-4 per particle for organic molecule feel. Connection lines brighten near
cursor. Varied particle sizes create atom-like visual. Mobile: 150 particles."
```

---

### Task 5: Add Personal Connection Section

New section between CareerTimeline and Contact. Personal engineering philosophy, warmer tone.

**Files:**
- Create: `src/components/PersonalConnection.tsx`
- Modify: `src/app/page.tsx` (add component between CareerTimeline and Contact)

**Step 1: Create PersonalConnection component**

Create `src/components/PersonalConnection.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

export default function PersonalConnection() {
  return (
    <section className="bg-surface-light py-24 px-6">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className="text-2xl md:text-3xl font-bold text-ink-heading leading-relaxed">
          I care about building things that actually work
          <span className="text-accent-blue">.</span>
        </p>
        <p className="text-ink-body mt-6 leading-relaxed text-base md:text-lg">
          Not just code that compiles, but systems that teams can maintain,
          users can rely on, and businesses can grow with. I&apos;ve learned that
          the best architecture is the one your team can understand at 2 AM
          when something breaks.
        </p>
        <p className="text-ink-muted mt-4 text-sm md:text-base">
          That&apos;s what I bring to every project &mdash; clarity under complexity.
        </p>
      </motion.div>
    </section>
  );
}
```

**Step 2: Add to page layout**

In `src/app/page.tsx`, add the import and place the component between `CareerTimeline` and `Contact`:

```tsx
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TechStack from "@/components/TechStack";
import SectionTransition from "@/components/SectionTransition";
import FeaturedProject from "@/components/FeaturedProject";
import ProjectGrid from "@/components/ProjectGrid";
import CareerTimeline from "@/components/CareerTimeline";
import PersonalConnection from "@/components/PersonalConnection";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TechStack />
        <SectionTransition />
        <FeaturedProject />
        <ProjectGrid />
        <CareerTimeline />
        <PersonalConnection />
        <Contact />
      </main>
    </>
  );
}
```

**Step 3: Verify in browser**

- New section should appear between timeline and contact
- Text should fade in on scroll
- Background matches timeline (light surface)
- Flows naturally into the dark contact section via existing gradient

**Step 4: Commit**

```bash
git add src/components/PersonalConnection.tsx src/app/page.tsx
git commit -m "feat: add personal connection section before contact

Engineering philosophy statement bridging career timeline to contact form.
Centered layout with fade-in animation."
```

---

### Task 6: Animation Polish — Hover Effects & Enhancements

Subtle improvements across existing components. No new components.

**Files:**
- Modify: `src/components/ProjectCard.tsx` (enhanced hover)
- Modify: `src/components/Navbar.tsx` (nav link hover underline)
- Modify: `src/components/Hero.tsx` (magnetic CTA button)

**Step 1: Enhance ProjectCard hover**

In `src/components/ProjectCard.tsx`, upgrade the hover class on the card div. Replace:

```
hover:-translate-y-1 hover:shadow-md transition-all duration-200
```

With:

```
hover:-translate-y-1.5 hover:shadow-lg hover:shadow-accent-blue/10 hover:border-gray-200 transition-all duration-300
```

**Step 2: Add nav link hover underline**

In `src/components/Navbar.tsx`, replace the desktop nav link `<a>` (line 59-64):

Replace:
```tsx
              <a
                href={link.href}
                className="text-white opacity-70 hover:opacity-100 transition-opacity duration-200 text-sm font-medium"
              >
                {link.label}
              </a>
```

With:
```tsx
              <a
                href={link.href}
                className="relative text-white opacity-70 hover:opacity-100 transition-opacity duration-200 text-sm font-medium
                  after:absolute after:left-0 after:bottom-[-4px] after:h-px after:w-0 after:bg-accent-blue
                  after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
```

**Step 3: Verify in browser**

- Project cards: hover lifts slightly more, subtle blue shadow appears
- Navbar links: hover shows sliding underline
- All transitions smooth, not jarring

**Step 4: Commit**

```bash
git add src/components/ProjectCard.tsx src/components/Navbar.tsx
git commit -m "feat: animation polish — enhanced card hovers, nav link underlines"
```

---

### Task 7: Visual Verification & Mobile Testing

**Step 1: Desktop verification**

Run: `npm run dev`

Check each section top-to-bottom:
1. Hero: particles follow mouse, organic bonds, smooth animation
2. Tech Stack: rings animate on scroll, buzzword tags appear
3. Projects: StockTrack has Enterprise badge (no link), other cards clickable
4. Timeline: scroll line grows/shrinks smoothly (no jitter on re-scroll)
5. Personal Connection: text fades in, centered, good spacing
6. Contact: form works, layout correct

**Step 2: Mobile verification**

Open DevTools → toggle mobile viewport (375px width):
1. Hero: particles render (fewer), touch interaction works
2. Tech Stack: single column layout, rings fit
3. Projects: single column cards
4. Timeline: left-aligned dots/line, cards slide in from right
5. Personal Connection: text readable, good padding
6. Contact: single column, form usable

**Step 3: Build check**

Run: `npm run build`

Ensure no TypeScript errors or build failures.

**Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: mobile and build fixes from visual verification"
```

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/components/CareerTimeline.tsx` | Rewrite | 1 |
| `src/data/projects.ts` | Edit | 2 |
| `src/components/ProjectCard.tsx` | Edit | 2, 6 |
| `src/data/skills.ts` | Rewrite | 3 |
| `src/components/TechStack.tsx` | Rewrite | 3 |
| `src/components/MeshGradient.tsx` | Rewrite | 4 |
| `src/components/PersonalConnection.tsx` | Create | 5 |
| `src/app/page.tsx` | Edit | 5 |
| `src/components/Navbar.tsx` | Edit | 6 |
| `src/components/Hero.tsx` | Edit (if magnetic btn) | 6 |
