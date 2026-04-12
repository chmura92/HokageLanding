# Hero Animation — Slow Plasma Drift

**Date:** 2026-04-12
**File:** `src/components/MeshGradient.tsx`
**Replaces:** ambient sine-drift + mouse attraction (tuned in 7de3f50)

## Motivation

Current hero particles read as *hectic*: sine ambient drift + home-spring + mouse attraction fight each other and the field never settles. We want the opposite — slow, rich, predictable motion that frames the copy instead of competing with it.

## Concept

Particles drift downward-diagonally at a steady rate (no sine, no home-spring), like ink falling through glycerin or a slow plasma waterfall. The cursor is a soft repulsion "stone in the stream" — particles part around it and close back in below. The hero text area has its own *always-on* repulsion rect so copy sits in a permanent clean void regardless of mouse position.

## Physics

Per-particle state: `position`, `baseVelocity` (fixed, descent + variance), `perturbation` (decaying).

```
position += (baseVelocity + perturbation) * dt60
perturbation += mouseRepulsion + textRepulsion
perturbation *= DAMPING
if position.y < -SPREAD_Y/2 - 1 → respawn at top with new random x, z
```

- No ambient sine.
- No home spring.
- Baseline flow is constant; only perturbations decay.

### Flow

- `FLOW_BASE_Y ≈ -0.012` (downward)
- `FLOW_BASE_X ≈ -0.003` (slight left diagonal)
- Per-particle velocity multiplier `0.7..1.3` for richness.

### Mouse repulsion

- Radius `2.5`, force `0.06`, smooth falloff `(1 - d/r)^2`.
- Push direction = away from cursor in XY.

### Text clearing zone (always on)

- Rounded rect centered at `(0, 0)`, half-width `3.5`, half-height `1.4`, soft band `0.8`.
- Distance from rect edge → smooth repulsion outward.
- Tuned visually via Playwright screenshots.

## Lines

Kept, but uniform color (no mouse-reactive brightness). `CONNECTION_DISTANCE = 1.4`, `MAX_BONDS_PER_PARTICLE = 4`, `MAX_CONNECTIONS = 600`. Alpha slightly reduced.

## Palette

Unchanged: white / light-blue / teal / purple on `#0B1221`. Cool plasma, not warm lava — the rest of the site is cool-toned.

## Validation

Headed Playwright: navigate to dev server, screenshot hero viewport, hover over different regions, confirm text void + mouse parting look right.
