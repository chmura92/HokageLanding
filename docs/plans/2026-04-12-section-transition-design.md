---
date: 2026-04-12
topic: Section transition (dark → light)
status: design
---

# Section Transition — Dark to Light

## Problem

The current `SectionTransition.tsx` is a 200px band with a flat linear gradient from `#111827` to `#F8FAFC`. Two issues:

1. A linear interpolation between these colors lands on a dead cement-grey (~`#858E97`) at the midpoint, producing a muddy Mach band.
2. The transition is disconnected from the page's established visual language — the hero's molecular plasma field ends abruptly at `TechStack`, then a generic gradient, then the light `FeaturedProject` section.

Result: the scroll feels like two websites stitched together.

## Goal

A professional, cohesive transition between the dark chapter (`Hero` + `TechStack`) and the light chapter (`FeaturedProject` onward) that:

- Extends the hero's molecular-particle identity into the transition so the scroll reads as one composed piece.
- Fixes the muddy mid-gradient.
- Adds a deliberate editorial seam so the eye has something crisp to land on.
- Runs cheaply and degrades gracefully.

## Chosen Approach: Particle Dissolution

Particles fall from the top of the band at the hero's baseline flow and dissolve before reaching the bottom. The background S-curves from dark through pearl to light, skipping dead grey. A thin luminous hairline sits at the crossover. Subtle grain breaks up banding.

No mouse interaction in this component — particles only follow the baseline flow.

## Architecture

Replace `src/components/SectionTransition.tsx` with a layered component. Four stacked layers inside one `relative` band:

1. **Background layer** — CSS multi-stop gradient (shaped as an S-curve via stop positions).
2. **Particle layer** — small self-contained R3F `<Canvas>`, mounts only when the band is near the viewport.
3. **Seam layer** — 1px horizontal hairline at the crossover point.
4. **Grain layer** — static SVG `feTurbulence` overlay.

The particle canvas does **not** share state with the hero's `MeshGradient` canvas. It is an independent, small canvas that spawns and dissolves its own particles.

### File structure

```
src/components/SectionTransition.tsx        (orchestrator — rewritten)
src/components/transition/DissolveField.tsx (new — R3F canvas + particles)
```

## Visual Specification

### Band dimensions

- Desktop height: **280px**
- Mobile (`< 768px`) height: **200px**
- Full-bleed width, `overflow: hidden`, `position: relative`

### Background S-curve

A linear gradient uses stop positions (not color math) to bend the curve, extending the dark region, compressing the crossover, and skipping dead grey by passing through a cool pearl:

```css
background: linear-gradient(
  to bottom,
  #111827 0%,
  #111827 8%,
  #2A3340 30%,
  #C9D3DE 62%,
  #EEF1F6 82%,
  #F8FAFC 100%
);
```

Rationale: most of the band stays in extended dark navy, then a fast crossover band (62 → 82%) slides through cool pearl into the surface light. No midtone grey.

### Seam line

- Position: `top: 62%` (exactly at the crossover)
- Height: `1px`, full width, `position: absolute`
- Background: `linear-gradient(to right, transparent 0%, rgba(74, 158, 229, 0.35) 50%, transparent 100%)`
- Ends fade over the outer 20% of the band's width (inherent from the gradient)

### Grain

- Inline SVG with `<feTurbulence baseFrequency="0.9" numOctaves="2" />`
- Rendered as a fullbleed absolute-positioned element
- `opacity: 0.03`
- `mix-blend-mode: overlay`
- `pointer-events: none`
- Static — no animation

## Particle Specification

### Count & spawn

- Desktop: **80 particles**
- Mobile: **40 particles**
- Initial spawn: uniform random across the band's 3D volume
- Respawn: when a particle's local Y reaches the bottom of the band, reposition at the top with randomized X

### Baseline flow (matches hero)

- `FLOW_BASE_Y = -0.010` per frame (reference 60fps)
- `FLOW_BASE_X = -0.0025` per frame
- Per-particle speed multiplier: `0.7 + Math.random() * 0.6` (range 0.7–1.3×)
- Tiny Z jitter each frame for parallax depth
- No damping, no impulse, no mouse input — pure drift

### Dissolve curve

Each particle has a local Y coordinate from `0` (top) to `1` (bottom). Rendered alpha:

```glsl
float alpha = smoothstep(1.0, 0.35, localY) * baseAlpha;
```

- Top third: full opacity
- Middle: linear fade
- Bottom: zero before reaching the floor

### Connection lines (bonds)

- Same hero logic (nearest-neighbor distance-gated bonds)
- Line alpha dissolve curve: `smoothstep(0.95, 0.45, localY)` vs particles' `smoothstep(1.0, 0.35, localY)` — lines start fading sooner and reach zero sooner, so bonds vanish before the dots they connect
- `MAX_BONDS_PER_PARTICLE = 3` (reduced from hero's 4 to save cost)
- `CONNECTION_DISTANCE = 1.6` desktop, `1.2` mobile

### Particle palette

Same colors as hero (`COLOR_WHITE`, `COLOR_LIGHT_BLUE`, `COLOR_TEAL`, `COLOR_PURPLE`). `baseAlpha = 0.6` (absolute), lower than hero so particles don't fight the brightening background in the lower half of the band.

## Performance Strategy

### Mount gating

- `SectionTransition` uses `IntersectionObserver` with `rootMargin: "200px 0px"` on its root element
- R3F `<Canvas>` conditionally renders via a `isInView` state: mounts when the band enters the expanded viewport, unmounts (returns `null`) when it leaves
- R3F tears down WebGL resources on unmount — no manual cleanup required
- CSS layers (background, seam, grain) always render — they are cheap

### Canvas config

```tsx
<Canvas
  dpr={[1, 1.5]}
  gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
  camera={{ position: [0, 0, 6], fov: 50 }}
/>
```

- `antialias: false` — point-sprites don't benefit
- `alpha: true` — canvas transparent, CSS background shows through
- `powerPreference: "low-power"` — hint to GPU scheduler
- `dpr` capped at 1.5 — band is small, higher DPR adds cost without visible gain

### Reduced motion

- `@media (prefers-reduced-motion: reduce)` — canvas does not mount
- Background gradient + seam + grain alone form a complete static transition

### Mobile

- 40 particles (vs 80 desktop)
- `CONNECTION_DISTANCE` reduced to keep bond math cheap
- No touch or pointer input needed

### Budget target

Whole band contributes **< 2ms/frame** on mid-range hardware. Verified with browser Performance panel after implementation.

## Files Touched

- `src/components/SectionTransition.tsx` — rewritten
- `src/components/transition/DissolveField.tsx` — new
- No changes to `MeshGradient.tsx`, `Hero.tsx`, `TechStack.tsx`, `FeaturedProject.tsx`, or `globals.css`

## Out of Scope

- Mouse interaction on transition particles (not needed here; hero canvas retains its own mouse behavior)
- Changes to hero's particle system
- Editorial label / section marker text (can be added later as an A+B hybrid if desired)
- Changing any other section's background
