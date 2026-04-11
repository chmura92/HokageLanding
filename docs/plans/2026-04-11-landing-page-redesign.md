# hokage.pl Landing Page Redesign

## Purpose

Portfolio landing page attached to resume. Primary audience: technical recruiters / HR who need to assess qualifications in under 30 seconds. Desired impression: reliable professional who delivers, with modern/cutting-edge polish.

## Tech Stack (Site)

- **Next.js 15** — App Router, static generation where possible
- **Tailwind CSS v4** — Styling and responsive design
- **Framer Motion** — Scroll animations, entrance transitions, layout animations
- **Three.js (React Three Fiber)** — Hero mesh gradient background only, lazy-loaded
- **Docker** — Deployment on Railway
- **Nodemailer / Resend** — Contact form email delivery via Next.js API route

## Design System

### Color Journey (top to bottom)

| Section | Background | Text |
|---------|-----------|------|
| Hero | `#0B1221` (deep space) + Three.js mesh glow | White / muted blue |
| Tech Stack | `#111827` (lifted dark) | White / gray |
| Transition | Gradient divider, 200px "sunrise" bloom | — |
| Featured Project | `#F8FAFC` (warm white) | Dark gray / navy |
| Project Grid | `#F8FAFC` | Dark gray / navy |
| Career Timeline | `#F8FAFC` | Dark gray / navy |
| Contact | `#0B1221` (back to dark) | White / muted blue |

### Typography

- **Headlines:** Inter, 800 weight, tight letter-spacing (-0.025em)
- **Body:** Inter, 400 weight, line-height 1.6
- **Labels/accents:** Inter, uppercase, 12px, letter-spacing 0.1em, muted color

### Card Language

Shared DNA across all cards: rounded corners (12px), subtle border.
- Dark sections: glass-morphism (backdrop-blur, semi-transparent bg, soft border glow)
- Light sections: white bg, soft shadow (`0 4px 24px rgba(0,0,0,0.06)`)

### Animation Philosophy

Every animation has a purpose. Nothing moves just to move.

**Scroll-driven (Framer Motion `whileInView`):**
- Enter from below: opacity 0 → 1, translateY 30px → 0, duration 0.6s, ease-out
- Staggered 0.1s between siblings
- Once visible, stays visible (no re-triggering)

**Three wow moments:**
1. Hero mesh gradient — slow undulating 3D mesh, navy/teal/purple color shift, subtle mouse parallax
2. Dark-to-light transition — mesh fades out, radial light blooms, revealing white background (CSS scroll-linked)
3. Timeline drawing — SVG stroke-dashoffset draws the vertical line as you scroll, nodes pulse in (scale 0 → 1)

**Hover states (subtle, functional):**
- Cards: translateY -4px, shadow deepens, 0.2s ease
- Tech tiles: border glow brightens
- Buttons: background color shift, no movement
- Nothing rotates. Nothing bounces. Nothing scales beyond 1.02x.

**Loading sequence (first 1.5s):**
- 0.0s — Dark bg, mesh gradient fades in
- 0.3s — "Single Man Army" letters stagger in left to right
- 0.6s — Subtitle fades up
- 0.9s — Photo fades in with scale 0.95 → 1
- 1.2s — Tech icons and CTAs fade up
- 1.5s — Scroll chevron starts gentle bounce loop

---

## Branding

- **Favicon:** Existing `favicon.png` / `favicon.ico` — Hokage hat with kanji
- **Logo:** Existing `header_logo_appbar.png` — Hokage hat + "HOKAGE" text
- **Navigation bar:** Sticky top nav. Logo (header_logo_appbar.png) on the left, section links on the right (Stack, Projects, Career, Contact). Transparent over the hero with white text, transitions to solid dark (`#0B1221`) background with subtle backdrop-blur on scroll. Smooth 0.3s transition. Mobile: hamburger menu.

---

## Sections

### 1. Hero (viewport height, dark)

- **Background:** Three.js mesh gradient (React Three Fiber), lazy-loaded, subtle mouse parallax
- **Photo:** Circular headshot (from resume for now), subtle border glow, left side
- **Tagline:** "Single Man Army" — large, bold, staggered letter animation on load
- **Subtitle:** `Senior Full-Stack .NET Architect · 10+ Years · Teams, Products & Code — End to End`
- **Location:** `Opole, Poland · Remote`
- **Tech icons row:** .NET, Angular, React, Azure, Docker — faded white, no labels
- **CTAs:** `View Projects` (primary, glow) / `Download CV` (outline)
- **Bottom:** Scroll-down chevron, gentle bounce animation

### 2. Tech Stack (dark, `#111827`)

- **Title:** "Stack"
- **Layout:** Grid of glass-morphism tiles, grouped by category
- **Groups:**
  - Backend: .NET 8, C#, ASP.NET Core, EF Core, GraphQL, SignalR, Hangfire
  - Architecture: DDD, CQRS, Clean Architecture, Event Storming, Microservices
  - Frontend: Angular, React, RxJS, NGXS, Blazor
  - Cloud & DevOps: Azure, Docker, Kubernetes, Azure Pipelines, Jenkins
  - Databases: SQL Server, PostgreSQL, Redis, MongoDB
  - Mobile: React Native, Xamarin
- **Animations:** Cards fade/slide in on scroll, staggered by group. Hover: glow brightens.

### 3. Featured Project — Nexus (light, `#F8FAFC`)

- **Transition:** Dark-to-light "sunrise" bloom divider (200px gradient)
- **Layout:** Full-width card, text left / screenshot right
- **Badge:** `Featured Project · 4 Years`
- **Title:** "Nexus: Logistics Platform"
- **Client:** Ecoson / Darling Ingredients
- **Description:** Modular monolith — truck fleet management, route optimization, GPS geofencing, real-time driver tracking, ERP integration (Odoo), automated reporting, trip cost optimization. SSO across web and mobile.
- **Metric cards (count-up animation on scroll):**
  - `5` Modules
  - `5` Engineers Led
  - `4` Years
  - `On Time & On Budget`
- **Role:** Solution architect & team lead. Defined scope, acted as product owner, direct stakeholder communication. Delivered on schedule within budget.
- **Tech tags:** `.NET Core 3.1 · Angular · RxJS · SignalR · Redis · Docker · Azure CI/CD`
- **Animations:** Card slides in from left, metrics count up, tech tags stagger in

### 4. Project Grid (light)

- **Title:** "Projects"
- **Layout:** 3 columns desktop, 2 tablet, 1 mobile
- **Cards:** Screenshot/mockup top, name, one-line description, role badge, tech tags (max 5)
- **Projects:**
  1. **StockTrack** — Offshore energy logistics platform. `Senior Engineer`. `.NET 8 · Angular · GraphQL · Kubernetes`
  2. **PurpleApp** — Employee management & operations. `Domain Lead`. `.NET 6 · React · React Native`. Screenshot from portacapena.com
  3. **Axon** — Warehouse management system. `Core Developer`. `.NET Core · Angular · Xamarin`
  4. **StablyPro** — Equestrian facility SaaS. `Side Project` badge. `Scheduling · SMS · Analytics`
  5. **Z Drugiej Bajki** — Headless e-commerce store. `Side Project` badge. `Next.js · Medusa`
- **Animations:** Cards stagger in on scroll. Hover: lift + shadow deepen.

### 5. Career Timeline (light)

- **Title:** "Career"
- **Layout:** Vertical timeline, center-aligned (desktop), left-aligned (mobile)
- **Drawing animation:** SVG line draws downward on scroll, nodes pulse in as line reaches them

**Entries:**
1. **Yameo · Gdansk** — Senior Software Engineer — 2024 – Present
   - Direct technical contact for energy sector clients. No PM layer.
2. **Porta Capena · Opole** — Team Lead Software Developer — 2019 – 2024
   - Built the Opole branch from scratch. Hired 5 engineers. Delivered Nexus.
3. **Porta Capena · Wroclaw** — Software Developer — 2016 – 2019
   - Cross-technology problem solver. Led Angular migration. Go-to for mobile.
4. **CUBE.ITG · Wroclaw** — Junior .NET Developer — 2015 – 2016
   - Santander Group platform. Large codebase, strict deadlines.

### 6. Contact (dark, `#0B1221`)

- **Title:** "Get in Touch"
- **Layout:** Two columns
- **Left column:**
  - Text: "Available for B2B and contract work. Based in Opole, working remotely."
  - Links with icons: Email, LinkedIn, hokage.pl
- **Right column:**
  - Contact form (glass-morphism card): Name, Email, Message, Send button
  - Submits to Next.js API route → sends email to romduz@gmail.com
- **Footer:** `© 2026 Roman Duzynski` + links

---

## Content to Provide Later

- Higher quality professional headshot (using resume photo for v1)
- Project screenshots: StockTrack, Nexus, Axon (PurpleApp/Enetic/Ecoscada/Proceedix available from portacapena.com, StablyPro/Z Drugiej Bajki can be screenshotted)
- CV/resume PDF for download

## Hosting

- Docker container on Railway
- Domain: hokage.pl
