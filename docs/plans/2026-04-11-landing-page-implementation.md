# hokage.pl Landing Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a visually stunning Next.js portfolio landing page for hokage.pl with Three.js hero, scroll animations, and contact form.

**Architecture:** Next.js 15 App Router with a single-page layout composed of section components. Three.js mesh gradient lazy-loaded in the hero. Framer Motion for all scroll/entrance animations. Contact form submits to a Next.js API route that sends email via Nodemailer. Dockerized for Railway deployment.

**Tech Stack:** Next.js 15, Tailwind CSS v4, Framer Motion, React Three Fiber, Nodemailer, Docker

**Design document:** `docs/plans/2026-04-11-landing-page-redesign.md`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `public/favicon.ico`, `public/favicon.png` (copy existing)
- Create: `Dockerfile`, `.dockerignore`

**Step 1: Scaffold Next.js 15 project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --turbopack
```

If the directory is not empty, initialize manually or use `--force`. The existing files (favicon, logo, resume HTML, docs) should be preserved.

**Step 2: Install dependencies**

Run:
```bash
npm install framer-motion @react-three/fiber @react-three/drei three nodemailer
npm install -D @types/three @types/nodemailer
```

**Step 3: Set up Tailwind globals and fonts**

Edit `src/app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-space-deep: #0B1221;
  --color-space-lifted: #111827;
  --color-surface-light: #F8FAFC;
  --color-accent-blue: #4A9EE5;
  --color-accent-teal: #2DD4BF;
  --color-ink-heading: #0F1E2B;
  --color-ink-body: #2D3E4D;
  --color-ink-muted: #5C7080;
  --color-glass-border: rgba(255, 255, 255, 0.1);
  --color-glass-bg: rgba(255, 255, 255, 0.05);

  --font-heading: "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
}
```

**Step 4: Set up root layout**

Edit `src/app/layout.tsx`:
- Import Inter from `next/font/google` (weights: 400, 500, 600, 700, 800)
- Set metadata: title "Roman Duzynski | Single Man Army", description, favicon
- Apply font to body with `bg-space-deep text-white`

**Step 5: Create placeholder page**

Edit `src/app/page.tsx`:
- Single `<main>` that renders all section components (placeholders for now)
- Import order: Navbar, Hero, TechStack, FeaturedProject, ProjectGrid, CareerTimeline, Contact, Footer

**Step 6: Copy assets to public/**

```bash
cp favicon.ico public/favicon.ico
cp favicon.png public/favicon.png
cp header_logo_appbar.png public/logo.png
```

**Step 7: Create Dockerfile**

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Create `.dockerignore`:
```
node_modules
.next
.git
docs
*.html
```

Update `next.config.ts` to add `output: "standalone"` for Docker.

**Step 8: Verify dev server starts**

Run: `npm run dev`
Expected: Page loads at localhost:3000 with no errors.

**Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 project with Tailwind, Framer Motion, R3F, Docker"
```

---

## Task 2: Navbar Component

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/HokageLogo.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create SVG logo component**

Create `src/components/HokageLogo.tsx`:
- Rebuild the Hokage hat + "HOKAGE" text as an inline SVG component
- Reference `public/logo.png` for the design — the hat shape with the kanji character and "HOKAGE" text
- Accept a `className` prop for sizing
- The hat portion uses orange/red accent and white/cream, the text is white (adapts to dark backgrounds)

**Step 2: Build the Navbar**

Create `src/components/Navbar.tsx`:
- `"use client"` component
- Sticky (`fixed top-0 w-full z-50`)
- Left: `<HokageLogo />` linked to top of page
- Right: nav links — Stack, Projects, Career, Contact — smooth scroll to section IDs
- Transparent by default, on scroll (> 50px) transitions to `bg-space-deep/90 backdrop-blur-md`
- Use `useState` + `useEffect` with scroll listener for background transition
- Mobile: hamburger button, slide-in menu panel with links
- Transition: 0.3s ease on background
- All text white, nav links have subtle opacity change on hover (0.7 → 1)

**Step 3: Add Navbar to page**

Modify `src/app/page.tsx`: render `<Navbar />` above `<main>`.

**Step 4: Verify in browser**

Run dev server, scroll the page. Navbar should transition from transparent to dark.

**Step 5: Commit**

```bash
git add src/components/Navbar.tsx src/components/HokageLogo.tsx src/app/page.tsx
git commit -m "feat: add sticky navbar with logo and scroll-responsive background"
```

---

## Task 3: Hero Section with Three.js Mesh Gradient

**Files:**
- Create: `src/components/Hero.tsx`
- Create: `src/components/MeshGradient.tsx`
- Create: `src/components/ScrollChevron.tsx`

**Step 1: Create the Three.js mesh gradient background**

Create `src/components/MeshGradient.tsx`:
- `"use client"` component
- Uses `@react-three/fiber` Canvas and `@react-three/drei`
- Renders a slowly undulating plane geometry (PlaneGeometry, ~50x50 segments)
- Custom shader material:
  - Vertex shader: displaces vertices with sin/cos waves using `uTime` uniform
  - Fragment shader: mixes navy (`#0B1221`), teal (`#2DD4BF`), and purple (`#6366F1`) based on position + time
- Subtle mouse parallax: track mouse position via `onPointerMove`, pass as uniform, shift camera or mesh slightly
- Animation loop via `useFrame`: increment time uniform
- Performance: low segment count, simple shaders, no post-processing
- Wrap Canvas in a div with `absolute inset-0 z-0`
- Lazy load with `dynamic(() => import(...), { ssr: false })`

**Step 2: Build the Hero section**

Create `src/components/Hero.tsx`:
- `"use client"` component
- Full viewport height: `min-h-screen relative flex items-center`
- Background: `<MeshGradient />` positioned absolute behind content
- Content wrapper: `relative z-10`, centered, max-width container
- Layout: photo on left, text on right (flex row, wraps to column on mobile)
- Photo: circular (rounded-full), 160px, subtle ring glow (`ring-2 ring-accent-blue/30`), use `/photo.jpg` placeholder (extract from resume later)
- Tagline "Single Man Army": `text-6xl md:text-7xl font-extrabold tracking-tight`
  - Framer Motion: stagger each word with `variants` and `transition.staggerChildren: 0.1`
  - Each word animates `opacity: 0→1, y: 20→0`
- Subtitle: `text-lg text-gray-400 mt-4`
  - Framer Motion: `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}`
- Location: `text-sm text-gray-500 mt-2` — "Opole, Poland · Remote"
- Tech icons row: simple row of technology SVG icons (use `react-icons` or inline SVGs for .NET, Angular, React, Azure, Docker), `opacity-40`, `mt-6`
  - Framer Motion: fade in with `delay: 1.2`
- CTAs: two buttons, `mt-8`
  - "View Projects": `bg-accent-blue hover:bg-accent-blue/80 text-white px-6 py-3 rounded-lg`
  - "Download CV": `border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5`
  - Framer Motion: fade in with `delay: 1.2`

**Step 3: Create scroll chevron**

Create `src/components/ScrollChevron.tsx`:
- Absolute positioned at bottom center of hero
- Simple down-chevron SVG
- Framer Motion: infinite bounce animation `y: [0, 8, 0]` with `repeat: Infinity, duration: 2`
- Appears after `delay: 1.5`
- `onClick`: smooth scroll to `#stack` section

**Step 4: Extract photo from resume**

The resume HTML contains a base64 photo. Extract it:
```bash
# Extract the base64 image data from the resume HTML and save as photo
node -e "const fs=require('fs'); const html=fs.readFileSync('resume_roman_duzynski_photo.html','utf8'); const m=html.match(/data:image\/(.*?);base64,(.*?)[\"|']/); if(m){fs.writeFileSync('public/photo.'+m[1], Buffer.from(m[2],'base64'));}"
```

**Step 5: Add Hero to page**

Modify `src/app/page.tsx`: render `<Hero />` as first section.

**Step 6: Verify in browser**

- Mesh gradient should render and animate smoothly
- Text should stagger in on load
- Photo should display
- Chevron should bounce
- Mouse movement should subtly affect the mesh

**Step 7: Commit**

```bash
git add src/components/Hero.tsx src/components/MeshGradient.tsx src/components/ScrollChevron.tsx public/photo.* src/app/page.tsx
git commit -m "feat: add hero section with Three.js mesh gradient and entrance animations"
```

---

## Task 4: Tech Stack Section

**Files:**
- Create: `src/components/TechStack.tsx`
- Create: `src/data/skills.ts`

**Step 1: Create skills data**

Create `src/data/skills.ts`:
```typescript
export const skillGroups = [
  {
    label: "Backend",
    skills: [".NET 8", "C#", "ASP.NET Core", "EF Core", "GraphQL", "SignalR", "Hangfire"],
  },
  {
    label: "Architecture",
    skills: ["DDD", "CQRS", "Clean Architecture", "Event Storming", "Microservices"],
  },
  {
    label: "Frontend",
    skills: ["Angular", "React", "RxJS", "NGXS", "Blazor"],
  },
  {
    label: "Cloud & DevOps",
    skills: ["Azure", "Docker", "Kubernetes", "Azure Pipelines", "Jenkins"],
  },
  {
    label: "Databases",
    skills: ["SQL Server", "PostgreSQL", "Redis", "MongoDB"],
  },
  {
    label: "Mobile",
    skills: ["React Native", "Xamarin"],
  },
];
```

**Step 2: Build the TechStack component**

Create `src/components/TechStack.tsx`:
- `"use client"` component
- `id="stack"` for nav scrolling
- Background: `bg-space-lifted` (`#111827`)
- Padding: `py-24 px-6`
- Section title: "Stack" — uppercase, `text-sm tracking-widest text-gray-500 mb-12 text-center`
- Grid: each group is a block with label + flex-wrap tags
- Group label: `text-xs uppercase tracking-wider text-gray-500 mb-3`
- Each skill is a glass-morphism tile: `bg-white/5 backdrop-blur border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300`
- Framer Motion: each group uses `whileInView` with staggered children (0.05s per tile)
  - Tiles: `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}`
- Hover: `hover:border-accent-blue/30 transition-colors duration-200`

**Step 3: Add to page**

Modify `src/app/page.tsx`: render `<TechStack />` after Hero.

**Step 4: Verify in browser**

Scroll past hero. Tech stack tiles should stagger in by group. Hover should brighten border.

**Step 5: Commit**

```bash
git add src/components/TechStack.tsx src/data/skills.ts src/app/page.tsx
git commit -m "feat: add tech stack section with glass-morphism tiles and scroll animations"
```

---

## Task 5: Dark-to-Light Transition Divider

**Files:**
- Create: `src/components/SectionTransition.tsx`

**Step 1: Build the transition component**

Create `src/components/SectionTransition.tsx`:
- A 200px tall div that creates the "sunrise" effect
- Background: CSS gradient from `#111827` (top) to `#F8FAFC` (bottom)
- Overlay: a radial gradient centered horizontally — `radial-gradient(ellipse at 50% 0%, rgba(74,158,229,0.08) 0%, transparent 70%)` — subtle blue glow bloom
- Framer Motion: the radial glow fades in (`opacity: 0→0.6`) when it enters the viewport
- No other content — purely visual

**Step 2: Add to page**

Modify `src/app/page.tsx`: render between `<TechStack />` and `<FeaturedProject />`.

**Step 3: Verify in browser**

Scroll through. The transition from dark to light should feel smooth and natural, with a subtle blue glow bloom.

**Step 4: Commit**

```bash
git add src/components/SectionTransition.tsx src/app/page.tsx
git commit -m "feat: add dark-to-light sunrise transition divider"
```

---

## Task 6: Featured Project — Nexus

**Files:**
- Create: `src/components/FeaturedProject.tsx`
- Create: `src/components/CountUpMetric.tsx`

**Step 1: Build the count-up metric component**

Create `src/components/CountUpMetric.tsx`:
- `"use client"` component
- Props: `value: number | string`, `label: string`
- If `value` is a number: animates from 0 to value when in view using `useInView` + `useMotionValue` + `useTransform` from Framer Motion
- If `value` is a string (e.g. "On Time & On Budget"): just fades in
- Display: large number/text on top, small label below
- Number styling: `text-4xl font-extrabold text-ink-heading`
- Label styling: `text-sm text-ink-muted mt-1`

**Step 2: Build the FeaturedProject component**

Create `src/components/FeaturedProject.tsx`:
- `"use client"` component
- Background: `bg-surface-light` (`#F8FAFC`)
- `id="projects"` for nav scrolling
- Padding: `py-24 px-6`
- Layout: max-width container, two columns (text left, screenshot/placeholder right), stacks on mobile
- Badge: `Featured Project · 4 Years` — small pill, `bg-accent-blue/10 text-accent-blue text-xs px-3 py-1 rounded-full`
- Title: "Nexus: Logistics Platform" — `text-4xl font-extrabold text-ink-heading`
- Client: "Ecoson / Darling Ingredients" — `text-sm text-ink-muted`
- Description: 2-3 sentences about the modular monolith — `text-ink-body mt-4 leading-relaxed`
- Metrics row: 4x `<CountUpMetric />` — `5 Modules`, `5 Engineers Led`, `4 Years`, `On Time & On Budget`
  - Displayed in a 4-column grid with subtle borders between
- Role: `text-sm text-ink-muted mt-6` — "Solution architect & team lead..."
- Tech tags: flex-wrap row of small pills — `bg-space-deep/5 text-ink-body text-xs px-2 py-1 rounded`
  - Tags: .NET Core 3.1, Angular, RxJS, SignalR, Redis, Docker, Azure CI/CD
  - Framer Motion: stagger in
- Right side: screenshot placeholder — a `rounded-xl bg-gray-200 aspect-video` with a subtle shadow, or use Porta Capena Nexus image if available
- Framer Motion: entire card `initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}`

**Step 3: Add to page**

Modify `src/app/page.tsx`: render after transition divider.

**Step 4: Verify in browser**

Scroll to the section. Card should slide in from left. Metrics should count up. Tech tags should stagger.

**Step 5: Commit**

```bash
git add src/components/FeaturedProject.tsx src/components/CountUpMetric.tsx src/app/page.tsx
git commit -m "feat: add featured project section with count-up metrics"
```

---

## Task 7: Project Grid

**Files:**
- Create: `src/components/ProjectGrid.tsx`
- Create: `src/components/ProjectCard.tsx`
- Create: `src/data/projects.ts`

**Step 1: Create project data**

Create `src/data/projects.ts`:
```typescript
export interface Project {
  name: string;
  description: string;
  role: string;
  roleType: "professional" | "side-project";
  tech: string[];
  url?: string;
  image?: string;
}

export const projects: Project[] = [
  {
    name: "StockTrack",
    description: "Offshore energy logistics platform — inventory tracking, stock trades, real-time analytics.",
    role: "Senior Engineer",
    roleType: "professional",
    tech: [".NET 8", "Angular", "GraphQL", "Kubernetes"],
  },
  {
    name: "PurpleApp",
    description: "Employee management & operations — task assignment, time tracking, floor plans, ERP integration.",
    role: "Domain Lead",
    roleType: "professional",
    tech: [".NET 6", "React", "React Native"],
  },
  {
    name: "Axon",
    description: "Warehouse management system — asset tracking, full traceability, granular role policies.",
    role: "Core Developer",
    roleType: "professional",
    tech: [".NET Core", "Angular", "Xamarin"],
  },
  {
    name: "StablyPro",
    description: "Equestrian facility SaaS — scheduling, rider management, horse records, billing, SMS notifications.",
    role: "Solo Project",
    roleType: "side-project",
    tech: ["Scheduling", "SMS", "Analytics"],
    url: "https://stablypro.hokage.pl",
  },
  {
    name: "Z Drugiej Bajki",
    description: "Curated second-hand fashion e-commerce — headless architecture with modern stack.",
    role: "Solo Project",
    roleType: "side-project",
    tech: ["Next.js", "Medusa"],
    url: "https://zdrugiejbajki.pl",
  },
];
```

**Step 2: Build the ProjectCard component**

Create `src/components/ProjectCard.tsx`:
- Props: `project: Project`, `index: number`
- Card: `bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden`
- Top: image area — `aspect-video bg-gray-100` (placeholder gradient if no image, actual image if provided)
- Body padding: `p-6`
- Name: `text-lg font-bold text-ink-heading`
- Description: `text-sm text-ink-body mt-2 line-clamp-2`
- Role badge:
  - Professional: `bg-space-deep/10 text-space-deep text-xs px-2 py-0.5 rounded`
  - Side project: `bg-accent-teal/10 text-accent-teal text-xs px-2 py-0.5 rounded` with "Side Project" prefix
- Tech tags: flex-wrap, `text-xs text-ink-muted`
- If `url` exists: card links to it (opens new tab)
- Hover: `hover:-translate-y-1 hover:shadow-md transition-all duration-200`
- Framer Motion: `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}`

**Step 3: Build the ProjectGrid component**

Create `src/components/ProjectGrid.tsx`:
- Section title: "Projects" — same style as Tech Stack title but dark text (`text-ink-heading`)
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Maps over `projects` data, renders `<ProjectCard />` for each
- Background: inherits `bg-surface-light`
- Padding: `py-16 px-6` (less than FeaturedProject since they're visually connected)

**Step 4: Add to page**

Modify `src/app/page.tsx`: render after `<FeaturedProject />`.

**Step 5: Verify in browser**

Scroll to grid. Cards should stagger in. Hover should lift cards. Side project badges should be visually distinct.

**Step 6: Commit**

```bash
git add src/components/ProjectGrid.tsx src/components/ProjectCard.tsx src/data/projects.ts src/app/page.tsx
git commit -m "feat: add project grid with staggered animations and role badges"
```

---

## Task 8: Career Timeline

**Files:**
- Create: `src/components/CareerTimeline.tsx`
- Create: `src/data/career.ts`

**Step 1: Create career data**

Create `src/data/career.ts`:
```typescript
export interface CareerEntry {
  company: string;
  location: string;
  role: string;
  period: string;
  description: string;
}

export const career: CareerEntry[] = [
  {
    company: "Yameo",
    location: "Gdansk",
    role: "Senior Software Engineer",
    period: "2024 – Present",
    description: "Direct technical contact for energy sector clients. No PM layer.",
  },
  {
    company: "Porta Capena",
    location: "Opole",
    role: "Team Lead Software Developer",
    period: "2019 – 2024",
    description: "Built the Opole branch from scratch. Hired 5 engineers. Delivered Nexus.",
  },
  {
    company: "Porta Capena",
    location: "Wroclaw",
    role: "Software Developer",
    period: "2016 – 2019",
    description: "Cross-technology problem solver. Led Angular migration. Go-to for mobile.",
  },
  {
    company: "CUBE.ITG",
    location: "Wroclaw",
    role: "Junior .NET Developer",
    period: "2015 – 2016",
    description: "Santander Group platform. Large codebase, strict deadlines.",
  },
];
```

**Step 2: Build the CareerTimeline component**

Create `src/components/CareerTimeline.tsx`:
- `"use client"` component
- `id="career"` for nav scrolling
- Background: `bg-surface-light`, padding `py-24 px-6`
- Section title: "Career"
- Layout: max-width container, relative positioned for the SVG line
- The vertical line: an SVG with a single `<line>` or `<path>` element
  - Uses `useScroll` + `useTransform` from Framer Motion to animate `strokeDashoffset`
  - `stroke: #E5E7EB`, `strokeWidth: 2`, `strokeDasharray: total length`
  - As section scrolls into view, the dashoffset decreases → line "draws" downward
- Desktop: line is centered (`left-1/2`), entries alternate left/right
- Mobile: line is left-aligned (`left-4`), entries all on the right
- Each entry node:
  - A dot on the timeline: `w-3 h-3 rounded-full bg-accent-blue border-2 border-surface-light`
  - Framer Motion: `scale: 0→1` when the drawing line reaches it
  - Company + Location: `text-lg font-bold text-ink-heading`
  - Role: `text-sm text-ink-muted`
  - Period: pill badge — `text-xs bg-gray-100 text-ink-muted px-2 py-0.5 rounded`
  - Description: `text-sm text-ink-body mt-1`
- Use `useRef` + `useScroll({ target, offset })` to drive the line animation scoped to this section

**Step 3: Add to page**

Modify `src/app/page.tsx`: render after `<ProjectGrid />`.

**Step 4: Verify in browser**

Scroll to career section. Line should draw downward. Nodes should pulse in as the line reaches them. Desktop layout should alternate sides.

**Step 5: Commit**

```bash
git add src/components/CareerTimeline.tsx src/data/career.ts src/app/page.tsx
git commit -m "feat: add career timeline with scroll-driven SVG drawing animation"
```

---

## Task 9: Contact Section + API Route

**Files:**
- Create: `src/components/Contact.tsx`
- Create: `src/components/ContactForm.tsx`
- Create: `src/app/api/contact/route.ts`

**Step 1: Build the contact form component**

Create `src/components/ContactForm.tsx`:
- `"use client"` component
- Glass-morphism card: `bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6`
- Fields: Name (text), Email (email), Message (textarea)
  - Input styling: `bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-accent-blue/50 focus:outline-none transition-colors`
  - Labels: `text-sm text-gray-400 mb-1`
- Submit button: `bg-accent-blue hover:bg-accent-blue/80 text-white px-6 py-3 rounded-lg w-full font-semibold transition-colors`
- State: `useState` for form fields, loading state, success/error message
- On submit: `fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })`
- Success state: show "Message sent!" with a subtle green checkmark
- Error state: show "Something went wrong. Try again." in red
- Basic client-side validation: all fields required, email format check

**Step 2: Build the Contact section**

Create `src/components/Contact.tsx`:
- `"use client"` component
- `id="contact"` for nav scrolling
- Background: `bg-space-deep` (`#0B1221`)
- Padding: `py-24 px-6`
- Transition at top: gradient from `#F8FAFC` to `#0B1221` (reverse sunrise)
- Section title: "Get in Touch" — white text
- Two columns (stack on mobile):
  - Left: availability text + contact links
    - Text: "Available for B2B and contract work. Based in Opole, working remotely." — `text-gray-400`
    - Links: Email (romduz@gmail.com), LinkedIn, hokage.pl — each with an inline SVG icon, `text-gray-300 hover:text-white transition-colors`
  - Right: `<ContactForm />`
- Framer Motion: both columns slide in from their respective sides

**Step 3: Build the API route**

Create `src/app/api/contact/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"hokage.pl Contact" <${process.env.SMTP_USER}>`,
    to: "romduz@gmail.com",
    replyTo: email,
    subject: `[hokage.pl] Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  return NextResponse.json({ success: true });
}
```

Create `.env.local.example`:
```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**Step 4: Build the Footer**

Add a footer at the bottom of the Contact section (or as a separate small component):
- `border-t border-white/10 mt-16 pt-6`
- Left: `© 2026 Roman Duzynski`
- Right: LinkedIn, Email icons (small)
- `text-sm text-gray-500`

**Step 5: Add to page**

Modify `src/app/page.tsx`: render `<Contact />` as the last section.

**Step 6: Verify in browser**

- Form should render with glass-morphism styling
- Submit without SMTP configured should show error gracefully (wrap in try/catch)
- Links should be clickable

**Step 7: Commit**

```bash
git add src/components/Contact.tsx src/components/ContactForm.tsx src/app/api/contact/route.ts .env.local.example src/app/page.tsx
git commit -m "feat: add contact section with form and email API route"
```

---

## Task 10: Responsive Design & Polish

**Files:**
- Modify: all component files

**Step 1: Mobile responsive pass**

Go through each component and verify/fix:
- Hero: stack photo above text on mobile, reduce font sizes (`text-4xl` on mobile vs `text-7xl` desktop)
- Navbar: hamburger menu works, menu panel opens/closes
- Tech Stack: single column groups on mobile
- Featured Project: stack columns, metrics go to 2x2 grid
- Project Grid: single column on mobile
- Career Timeline: left-aligned line, all entries on right
- Contact: stack columns

**Step 2: Accessibility pass**

- All interactive elements have focus states
- Proper heading hierarchy (h1 for hero, h2 for sections)
- Alt text on images
- `aria-label` on icon-only buttons
- Reduce motion: wrap Framer Motion animations in `useReducedMotion()` check — skip animations if user prefers reduced motion
- Three.js: skip mesh gradient if `prefers-reduced-motion` is set, show static gradient instead

**Step 3: Performance check**

- Run Lighthouse in browser
- Ensure Three.js canvas is lazy-loaded (`next/dynamic` with `ssr: false`)
- Images use `next/image` with proper sizing
- Fonts preloaded via `next/font`

**Step 4: Verify full page flow in browser**

- Load page fresh — hero animation sequence plays correctly
- Scroll through entire page — all sections animate in
- All nav links scroll to correct sections
- Hover states work on all interactive elements
- Mobile layout works (use browser dev tools responsive mode)

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: responsive design, accessibility, and performance polish"
```

---

## Task Summary

| # | Task | Key Output |
|---|------|-----------|
| 1 | Project Scaffolding | Next.js + deps + Docker |
| 2 | Navbar | Sticky nav with logo + scroll transition |
| 3 | Hero Section | Three.js mesh + "Single Man Army" + animations |
| 4 | Tech Stack | Glass-morphism skill grid |
| 5 | Transition Divider | Dark-to-light sunrise effect |
| 6 | Featured Project | Nexus card with count-up metrics |
| 7 | Project Grid | 5 project cards with role badges |
| 8 | Career Timeline | SVG drawing animation + entries |
| 9 | Contact + API | Form + Nodemailer + footer |
| 10 | Polish | Responsive + a11y + performance |

Tasks 1-3 are sequential (project setup → core components). Tasks 4-9 can be parallelized as independent section components once the scaffolding is in place. Task 10 is a final pass.
