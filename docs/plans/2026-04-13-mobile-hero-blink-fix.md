# Mobile Hero Blink Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate the flash/blink on the Hero section's initial animation on iOS mobile (iPhone).

**Architecture:** Replace all Framer Motion entrance animations in `Hero` and `ScrollChevron` with native CSS `@keyframes`. CSS animations are processed by the browser rendering engine before any JavaScript runs — `animation-fill-mode: both` guarantees elements remain at `opacity: 0` from the very first paint through each element's delay period, with zero hydration window for a blink to occur. Framer Motion v12 (Motion) uses WAAPI on iOS Safari and clears React-managed inline styles during MotionValue initialization, creating a frame gap where animated elements flash visible — this is undetectable at the React/Framer Motion API level and requires moving to the CSS layer to fix.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, Framer Motion v12, React 18

---

## Root Cause Summary

**SSR + WAAPI hydration blink:**
1. Next.js SSR renders `"use client"` Hero with all elements at full opacity (Framer Motion `initial` props are not applied to server HTML for object-based initials)
2. Browser paints — user sees all content visible
3. JS loads, Framer Motion v12 hydrates — uses WAAPI on iOS Safari, clears React inline styles and replaces with MotionValues
4. In the frame gap between clearing and re-applying, elements flash at opacity 1 → **BLINK**
5. Animation runs from opacity 0 → 1

Previous attempt (`style={{ opacity: 0 }}` on motion elements) failed because Framer Motion v12 takes ownership of animated CSS properties and discards React-managed inline styles during initialization.

---

### Task 1: Add CSS keyframes and animation utilities to globals.css

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add keyframes and `@layer utilities` block**

Add after the existing `@layer base` block:

```css
@keyframes hero-fade-in-up-lg {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes hero-fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes hero-scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes hero-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes hero-fade-in-labels {
  from { opacity: 0; }
  to   { opacity: 0.4; }
}

@keyframes scroll-chevron-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scroll-chevron-bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(8px); }
}

@layer utilities {
  /* Hero words — staggered 0.1s apart, fill:both holds opacity:0 before delay */
  .animate-hero-word-1 { animation: hero-fade-in-up-lg 0.5s ease-out 0.3s both; }
  .animate-hero-word-2 { animation: hero-fade-in-up-lg 0.5s ease-out 0.4s both; }
  .animate-hero-word-3 { animation: hero-fade-in-up-lg 0.5s ease-out 0.5s both; }

  /* Hero supporting elements */
  .animate-hero-subtitle { animation: hero-fade-in-up 0.5s ease-out 0.6s both; }
  .animate-hero-location  { animation: hero-fade-in-up 0.5s ease-out 0.7s both; }
  .animate-hero-photo     { animation: hero-scale-in  0.5s ease-out 0.9s both; }
  .animate-hero-labels    { animation: hero-fade-in-labels 0.5s ease-out 1.2s both; }
  .animate-hero-ctas      { animation: hero-fade-in-up 0.5s ease-out 1.2s both; }

  /* Scroll chevron: fade in then bounce forever */
  .animate-scroll-chevron {
    animation:
      scroll-chevron-fade   0.5s ease-out  1.5s both,
      scroll-chevron-bounce 2s   ease-in-out 2s infinite;
  }
}
```

**Why `animation-fill-mode: both`:** `backwards` applies the `from` keyframe before the delay starts (element invisible from first paint). `forwards` holds the `to` keyframe after the animation ends (element stays visible/at final opacity).

**Step 2: Verify build compiles**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(styles): add CSS keyframe animations for hero entrance and scroll chevron"
```

---

### Task 2: Replace Framer Motion in Hero.tsx with CSS animation classes

**Files:**
- Modify: `src/components/Hero.tsx`

**Step 1: Remove Framer Motion import and variant definitions**

Remove:
```tsx
import { motion } from "framer-motion";

const containerVariants = { ... };
const wordVariants = { ... };
```

Add word class list (explicit strings so Tailwind JIT always picks them up):
```tsx
const wordClasses = [
  "animate-hero-word-1",
  "animate-hero-word-2",
  "animate-hero-word-3",
] as const;
```

**Step 2: Replace `motion.*` elements**

| Before | After |
|--------|-------|
| `<motion.div initial=... animate=... style={{ opacity: 0 }} className="shrink-0 self-center">` | `<div className="shrink-0 self-center animate-hero-photo">` |
| `<motion.h1 variants={containerVariants} initial="hidden" animate="visible" className="...">` | `<h1 className="...">` (same classes, no motion props) |
| `<motion.span key={i} variants={wordVariants} className="inline-block mr-4" style={{ opacity: 0 }}>` | `<span key={i} className={\`inline-block mr-4 ${wordClasses[i]}\`}>` |
| `<motion.p initial={{ opacity:0, y:10 }} ... className="...text-gray-400 mt-4" style={{ opacity: 0 }}>` | `<p className="...text-gray-400 mt-4 animate-hero-subtitle">` |
| `<motion.p initial={{ opacity:0, y:10 }} ... className="...text-gray-500 mt-2" style={{ opacity: 0 }}>` | `<p className="...text-gray-500 mt-2 animate-hero-location">` |
| `<motion.div initial={{ opacity:0 }} ... className="...gap-3 mt-6" style={{ opacity: 0 }}>` | `<div className="...gap-3 mt-6 animate-hero-labels">` |
| `<motion.div initial={{ opacity:0, y:10 }} ... className="...gap-4 mt-8" style={{ opacity: 0 }}>` | `<div className="...gap-4 mt-8 animate-hero-ctas">` |

**Step 3: Final Hero.tsx should look like:**

```tsx
"use client";

import MeshGradient from "./MeshGradient";
import ScrollChevron from "./ScrollChevron";

const techLabels = [".NET", "Angular", "React", "Azure"];

const wordClasses = [
  "animate-hero-word-1",
  "animate-hero-word-2",
  "animate-hero-word-3",
] as const;

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen relative flex items-center justify-center">
      <MeshGradient />
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="shrink-0 self-center animate-hero-photo">
            <div
              className="relative rounded-full w-32 h-32 md:w-40 md:h-40 ring-2 ring-accent-blue/40 shadow-[0_0_0_5px_rgba(232,93,58,0.15)] overflow-hidden"
              style={{ backgroundImage: "url(/me.jpg)", backgroundSize: "230%", backgroundPosition: "50% 12%", backgroundRepeat: "no-repeat", backgroundColor: "#0B1221" }}
            >
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 50% 38%, transparent 28%, rgba(11,18,33,0.55) 58%, rgba(11,18,33,0.96) 78%)" }} />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white before:absolute before:-inset-x-12 before:-inset-y-6 before:-z-10 before:rounded-full before:bg-accent-ember/30 before:blur-[80px] before:pointer-events-none">
              {["Single", "Man", "Army"].map((word, i) => (
                <span key={i} className={`inline-block mr-4 ${wordClasses[i]}`}>{word}</span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mt-4 animate-hero-subtitle">
              Senior Full-Stack .NET Architect &middot; 10+ Years &middot; Teams, Products &amp; Code &mdash; End to End
            </p>
            <p className="text-sm text-gray-500 mt-2 animate-hero-location">Opole, Poland &middot; Remote</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6 animate-hero-labels">
              {techLabels.map((label) => (
                <span key={label} className="text-xs font-medium text-white border border-white/20 rounded-full px-3 py-1">{label}</span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8 animate-hero-ctas">
              <button onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })} className="bg-accent-blue hover:bg-accent-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer">
                View Projects
              </button>
              <a href="/resume.pdf" download className="bg-accent-ember/15 border border-accent-ember/50 text-accent-ember-soft px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-accent-ember hover:border-accent-ember hover:text-white">
                Download CV
              </a>
            </div>
          </div>
        </div>
      </div>
      <ScrollChevron />
    </section>
  );
}
```

**Step 4: Build and verify**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no TypeScript errors.

**Step 5: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "fix(hero): replace Framer Motion entrance animations with CSS keyframes — eliminates iOS blink"
```

---

### Task 3: Replace Framer Motion in ScrollChevron.tsx with CSS animation

**Files:**
- Modify: `src/components/ScrollChevron.tsx`

**Step 1: Remove Framer Motion, add CSS class**

The `animate-scroll-chevron` class defined in Task 1 handles both:
- Fade-in at 1.5s (opacity 0 → 1, `fill: both` keeps it invisible before delay)
- Infinite bounce starting at 2s

```tsx
export default function ScrollChevron() {
  return (
    <div
      onClick={() => document.getElementById("stack")?.scrollIntoView({ behavior: "smooth" })}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer animate-scroll-chevron"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-50">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
```

**Note:** `"use client"` can be removed — no hooks or browser APIs used directly. The `onClick` with `document.getElementById` requires client JS, but Next.js handles inline event handlers in server components via hydration. Remove `"use client"` directive.

**Step 2: Build and verify**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add src/components/ScrollChevron.tsx
git commit -m "fix(scroll-chevron): replace Framer Motion with CSS animation, remove use-client"
```

---

### Task 4: Manual verification on mobile

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test on iPhone**

Open `http://<your-local-ip>:3000` on the iPhone (ensure it's on the same WiFi network). Or use the deployed version after pushing.

**Checklist:**
- [ ] Hard refresh the page — no flash of visible content before animation starts
- [ ] "Single Man Army" words stagger in smoothly from below (0.3s, 0.4s, 0.5s)
- [ ] Subtitle fades in at 0.6s
- [ ] Location fades in at 0.7s
- [ ] Photo scales in at 0.9s
- [ ] Tech labels fade to 40% opacity at 1.2s
- [ ] CTAs slide up at 1.2s
- [ ] Scroll chevron fades in at 1.5s then bounces infinitely
- [ ] No blink on any element at any point during load

**Step 3: Test on desktop to check no regressions**

- [ ] Same animation sequence plays correctly
- [ ] WebGL mesh gradient still renders on desktop
- [ ] No console errors

**Step 4: Push and deploy**

```bash
git push
```

---

## Status

| Task | Status |
|------|--------|
| Task 1: CSS keyframes in globals.css | ✅ Done — commit `56ec4bd` |
| Task 2: Hero.tsx CSS migration | ✅ Done — commit `56ec4bd` |
| Task 3: ScrollChevron.tsx CSS migration | ✅ Done — commit `56ec4bd` |
| Task 4: Mobile verification | ⏳ Pending — test at `http://localhost:3002` |
