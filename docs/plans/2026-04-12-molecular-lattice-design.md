# Hero background — Molecular Lattice

Replaces the current "plasma stream" animation in `src/components/MeshGradient.tsx`. The stream reads as motion-heavy and slightly frantic; the new design is a calm, premium molecular lattice that reacts to the cursor.

## Goals

- Premium, slow, "molecule under a microscope" feel
- Every atom bonded to 3–7 neighbors (not density-biased)
- Visibly *thick* bonds (not 1px aliased lines)
- High-refresh mouse tracking; cursor feels *noticed*, not repelled
- 60fps on a mid-range laptop at 1440p

## Motion model — floating lattice

- Each particle has an **anchor** (home position); weak spring (k ≈ 0.015) pulls it home.
- Layered sinusoidal noise makes each particle breathe independently — amplitude ≈ 0.12–0.18 units, period ≈ 6–10s, phase random per particle.
- Whole field drifts horizontally at ~0.0008 units/frame (≈60s full sweep) with gentle Y-axis parallax rotation (≤ 3°).
- No downward stream, no respawn-on-exit logic. Particles stay put.

## Connectivity — kNN, not radius

- Per-particle target `k` chosen at init, uniform in `[3..7]`.
- A kNN pass computes each particle's nearest neighbors; bonds are the union of top-k pairs with de-dup so no bond is drawn twice.
- Pass runs on an interval (≈ every 30 frames ≈ 0.5s), not every frame — particles move slowly enough that this is invisible.
- Between passes, line endpoints are updated from current positions so bonds follow the breathing motion.

## Thick line rendering

- `THREE.Line2` + `LineMaterial` + `LineGeometry` from `three-stdlib`.
- `linewidth`: 1.2 idle, up to 2.4 near the cursor (interpolated per segment).
- Per-vertex RGBA so each bond fades between endpoint hues and alpha reacts to mouse.
- Single draw call — all bonds in one `Line2` instance.

## Mouse interaction — awareness, not repulsion

- Listener on `window` using `pointerrawupdate` (fallback: `pointermove`) — maximum input rate, no React state updates, ref only.
- Mouse projected to world plane at z=0 once per frame in `useFrame`.
- **Influence radius** `R ≈ 2.8`, smooth falloff `f = smoothstep(R, 0, dist)`.
- Per-particle effects inside radius:
  - **Lean toward** cursor by `0.08 * f` units (added to current render position, not base state — purely visual, decays instantly when mouse leaves).
  - Size multiplier `1 + 0.35 * f`.
  - Node color lerped toward warm white by `0.4 * f`.
- Per-bond effects (use max `f` of the two endpoints):
  - Alpha `lerp(0.15, 0.75, f)`.
  - Color lerped from `LINE_COLOR_IDLE` (cool slate-blue) toward `LINE_COLOR_HOT` (warm cyan-white).
  - Linewidth `lerp(1.2, 2.4, f)`.

## Palette

Keep the existing particle colors:
- white (0.9, 0.92, 0.95) — 45%
- light blue (0.7, 0.85, 1.0) — 30%
- teal (0.176, 0.831, 0.749) — 15%
- purple (0.388, 0.4, 0.945) — 10%

Shift idle bond color slightly cooler (`(0.38, 0.52, 0.72)`) so the warm hover highlight (`(0.85, 0.95, 1.0)`) reads clearly.

## Performance

- 180 particles desktop / 100 mobile (unchanged).
- kNN pass is O(n²) but at 2Hz → ~65k ops/sec, negligible.
- `MAX_BONDS = particles * 5` worst case.
- `dpr` capped at `[1, 1.5]` (unchanged).
- `antialias: false` — we rely on shader feathering for atoms; Line2 has its own AA.
- No `requestAnimationFrame` beyond `useFrame`.

## Non-goals

- No post-processing / bloom — keeps perf budget headroom for the fat lines.
- No audio-reactive or scroll-reactive behavior (could come later).
- No click interaction — hover only.

## Files touched

- `src/components/MeshGradient.tsx` — full rewrite of the particle system.
- Possibly new file `src/components/molecular/` if helper code gets large; defer unless needed.

## Verification

- Local dev: hero renders, 60fps in DevTools perf panel, cursor visibly influences nearby bonds.
- Screenshot comparison: idle state + cursor-present state.
- Mobile check: 100 particles, still smooth, no pointer-required behavior broken.
