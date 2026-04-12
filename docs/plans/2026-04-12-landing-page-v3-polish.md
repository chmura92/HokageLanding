# Landing Page V3 Polish — Design Document

**Date:** 2026-04-12
**Status:** Approved via brainstorming session

---

## 1. Hero Animation — Enhanced Particle System

**Current:** 300 particles with mouse repulsion and connection lines (regular pattern feel).
**Target:** Organic molecule/atom system where particles are **attracted to** and **follow** the mouse gesture, forming natural clusters with bond-like connections.

### Changes
- Invert mouse interaction: attraction instead of repulsion within a radius
- Particles drift toward cursor position, forming temporary molecule-like clusters
- Connection lines appear between nearby attracted particles (organic, not grid-like)
- Limit bonds per particle to 3-4 for natural feel
- Distance-based opacity falloff on connection lines
- Particles outside attraction radius continue ambient drift
- Spring-based return when cursor leaves area
- **Mobile:** Reduce to ~150 particles, simplify bonds, use device orientation or touch for interaction

### Visual Feel
Same color palette (#2DD4BF teal, #6366F1 purple, white). Particles should feel alive — gently drifting, clustering around cursor, bonds forming and breaking as distances change. Not a chemistry simulation, just organic interconnected motion.

---

## 2. Tech Stack Section — Technologies + Buzzwords

Split into two distinct visual treatments:

### A) Technologies (with proficiency)
- Radial progress rings (SVG circles + Framer Motion `pathLength`)
- Each technology gets its **logo** inside the ring
- Ring fills on scroll-into-view with spring animation
- Grouped by domain: Backend, Frontend, Cloud & DevOps, Databases, Mobile
- Proficiency shown as ring fill percentage (not dots)
- Subtle glow on hover, ring pulses gently
- .NET/C# group visually prominent (larger rings, first position, accent color)

**Technologies to include:**
- Backend: .NET 8, C#, ASP.NET Core, EF Core, SignalR, GraphQL, Hangfire
- Frontend: Angular, React, RxJS, Blazor
- Cloud & DevOps: Azure, Docker, Kubernetes, Azure Pipelines, Jenkins
- Databases: SQL Server, PostgreSQL, Redis, MongoDB
- Mobile: React Native, Xamarin
- Tooling: Git, Azure DevOps, Jira

### B) Methodologies & Practices (buzzwords)
- Animated scattered tags/pills with visual flair
- No ratings, no hierarchy — just good-looking buzzwords
- Subtle entrance animations (staggered fade-in, slight float)
- Gentle hover effect (lift or glow)
- Tags: DDD, CQRS, Clean Architecture, Event Storming, Microservices, CI/CD, Agile, TDD

---

## 3. Projects — StockTrack Fix

- Remove the URL link from StockTrack
- Add a "Private / Enterprise" badge to the card
- Keep the project description and tech stack tags
- Badge signals confidentiality = credibility

---

## 4. Career Timeline — Fix + Polish

### Bug Fix
- Fix broken scroll-based line animation on re-scroll
- Likely cause: `useSpring` retaining stale target or scroll container offset not recalculated after layout shifts
- Use `useMotionValueEvent` to sync spring target on every scroll tick
- Test thoroughly: scroll down, scroll back up, scroll down again

### Animation Polish
- Git-commit style entry reveals: brief subtle flash on the dot, line draws downward, content fades in
- Per-card scroll progress via `useScroll({ target: cardRef, offset: [...] })` for individual reveal timing
- Current role pulsing ring: keep, it works
- Smooth, not flashy — entries should feel like they're being "committed" to the page

---

## 5. Animations — Tasteful Enhancements

### Hover Effects
- Project cards: enhanced lift + shadow depth on hover
- Tech rings: gentle pulse/glow on hover
- Buttons: subtle magnetic pull (element shifts slightly toward cursor within proximity)
- Buzzword tags: slight lift or glow
- Nav links: subtle underline slide or color shift

### Scroll Animations
- Keep existing staggered entrance animations
- Ensure all entrance animations trigger only once (not on re-scroll)
- Smooth, spring-based — no bouncy or elastic overshots

### Guiding Principle
"Every animation should feel like a system responding, not decorating." Tasteful, polished, not exaggerated.

---

## 6. New Section — Personal Connection (before Contact)

### Purpose
Bridge the gap between "here is my work" and "reach out to me." Create a moment of personal connection.

### Content
- 2-3 sentences about engineering philosophy / what matters when building products
- Personal tone, not corporate
- Exact copy to be written during implementation

### Visual Treatment
- Warmer background tone shift (subtle gradient transition from the timeline section)
- Centered text, generous whitespace
- Subtle entrance animation (fade in on scroll)
- Leads naturally into the Contact section below

---

## Implementation Order

1. Fix timeline scroll bug (regression, highest priority)
2. Remove StockTrack link + add Private badge
3. Rework tech stack section (technologies with rings + buzzword tags)
4. Enhance hero particle system (attraction + organic bonds)
5. Add personal connection section
6. Add hover effects and animation polish throughout
7. Mobile testing and performance verification

---

## Out of Scope
- No GSAP — stick with Framer Motion + Three.js
- No parallax scrolling
- No animations that delay content visibility
- No animations that replay on every scroll pass (entrance = once)
