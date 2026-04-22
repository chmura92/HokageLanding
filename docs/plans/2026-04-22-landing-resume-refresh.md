# Landing + Resume Content Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Work directly on `main` in `C:\Repositories\Landing` — no branches, no worktrees (per `feedback_no_worktrees` memory). Resume repo at `C:\Repositories\Resume` is NOT a git repo — commits for its changes happen only in Landing after `public/resume.pdf` is refreshed.

**Goal:** Align landing page and resume artifacts with the user's actual career facts (3 modules / 3 years on Nexus, 3 Xamarin apps, 10+ dev CUBE.ITG team) and apply a soft positioning upgrade (`Developer` → `Engineer` in resume only) while keeping the job-search campaign compatible with feedback rules (no "Lead", no "AI-first" as identity).

**Architecture:** Content-only edits. Landing uses Next.js data files (`src/data/*.ts`) plus minor component strings. Resume repo uses HTML source + Python/JS build scripts; edit source, run builds, then copy the final PDF into Landing/public and commit there.

**Tech Stack:** Next.js 15 (Landing), HTML + Python/JS build scripts (Resume). No new dependencies.

---

## Decisions locked in during brainstorming (do NOT relitigate)

1. **Resume title**: `Senior Full-Stack .NET Developer` → `Senior Full-Stack .NET Engineer`.
2. **Landing Hero subtitle** currently says `Senior Full-Stack .NET Architect`. **Leave as-is** — user did not object when this plan was discussed. Do NOT change it to Engineer.
3. **No "Lead", no "Tech Lead", no "AI-first"** in any headline, tagline, meta, About section. Historical role labels (`Team Lead Software Developer` in Porta Capena career entry, `Domain Lead` in PurpleApp project entry) STAY as historical facts.
4. **AI skills group** (landing `src/data/skills.ts`): replace `[Claude, OpenAI, GitHub Copilot, DALL·E]` with `[Claude, Claude Code, superpowers]`. NO Semantic Kernel, NO Azure OpenAI (user does not use them).
5. **SpecFlow** added to `Tooling & Testing` group (not AI — it's a BDD testing tool).
6. **Nexus facts**: 3 modules, 3 years. Remove any `+ SOO` suffix and any `5 bounded contexts` / `4 years` claims.
7. **Xamarin apps**: 3 total (Porta Capena Wroclaw period).
8. **CUBE.ITG / Santander**: add "10+ developer team with analysts and testers on our side" as a team-scale signal.
9. **StockTrack**: stays qualitative (NDA blocks metrics). Add one AI-adjacent bullet about `Claude + superpowers` accelerating `SpecFlow` BDD step generation — positioned as a workflow modernization, not as "AI-first" identity.
10. **Nexus client**: `Ecoson / Darling Ingredients` can be mentioned explicitly in both landing and resume (user has NDA with Porta Capena only, not with the end client).
11. **Featured Project on landing**: Nexus stays as hero; StockTrack stays in the grid.
12. **Commit policy**: commit per task on `main`. Use imperative commit messages matching the style of recent history (e.g., `skills: ...`, `career: ...`, `docs(resume): ...`).

---

## Phase 1 — Landing content updates

### Task 1: Rewrite AI group and add SpecFlow in `src/data/skills.ts`

**Files:**
- Modify: `src/data/skills.ts` lines 60-84

**Step 1: Read file** to confirm current line numbers.

**Step 2: Edit AI group (current lines 75-83):**

Replace this block:
```ts
  {
    label: "AI",
    technologies: [
      { name: "Claude" },
      { name: "OpenAI" },
      { name: "GitHub Copilot" },
      { name: "DALL·E" },
    ],
  },
```

With:
```ts
  {
    label: "AI",
    technologies: [
      { name: "Claude" },
      { name: "Claude Code" },
      { name: "superpowers" },
    ],
  },
```

**Step 3: Add SpecFlow at the end of `Tooling & Testing` group (current line 72 has `{ name: "Playwright" },`):**

Replace:
```ts
      { name: "Playwright" },
    ],
  },
  {
    label: "AI",
```

With:
```ts
      { name: "Playwright" },
      { name: "SpecFlow" },
    ],
  },
  {
    label: "AI",
```

**Step 4: Commit:**
```bash
git add src/data/skills.ts
git commit -m "skills: align AI group with actual tools, add SpecFlow to testing"
```

---

### Task 2: Fix facts in `src/data/career.ts`

**Files:**
- Modify: `src/data/career.ts`

**Step 1: Edit Yameo highlights (current lines 17-22)** — sharpen StockTrack description, insert AI-workflow bullet at position 3:

Replace:
```ts
    description: "Direct technical contact for energy sector clients. No PM layer.",
    highlights: [
      "Contributing to StockTrack — enterprise offshore logistics on Azure Kubernetes",
      "Delivered Blazor internal tooling app, expanding team capability beyond Angular",
      "Architecture decisions made directly with energy sector stakeholders",
    ],
```

With:
```ts
    description: "Direct technical contact for energy sector clients. No PM layer.",
    highlights: [
      "Contributing to StockTrack — offshore energy supply chain platform on Azure Kubernetes",
      "Delivered Blazor internal tooling app, expanding team capability beyond Angular",
      "Modernized BDD workflow with Claude and superpowers for SpecFlow step generation",
      "Architecture decisions made directly with energy sector stakeholders",
    ],
```

**Step 2: Edit Porta Capena Opole highlights (current line 31)** — remove `+ SOO`:

Replace:
```ts
      "Architected Nexus logistics platform — 3 modules + SOO, 3 years, on time & on budget",
```

With:
```ts
      "Architected Nexus logistics platform — 3 modules, 3 years, on time & on budget",
```

**Step 3: Edit Porta Capena Wroclaw highlights (current line 44)** — add `3` to Xamarin:

Replace:
```ts
      "Built cross-platform mobile apps in Xamarin for iOS and Android",
```

With:
```ts
      "Shipped 3 cross-platform mobile apps in Xamarin for iOS and Android",
```

**Step 4: Edit CUBE.ITG highlights (current lines 54-57)** — enrich both bullets:

Replace:
```ts
    highlights: [
      "Contributed to commercial ASP.NET MVC platform for Santander Group (UK finance)",
      "Learned discipline in a large regulated codebase with strict deadlines",
    ],
```

With:
```ts
    highlights: [
      "Contributed to commercial ASP.NET MVC platform for Santander Group (UK regulated finance market)",
      "Embedded in a 10+ developer team with analysts and testers on a large legacy codebase under strict deadlines",
    ],
```

**Step 5: Commit:**
```bash
git add src/data/career.ts
git commit -m "career: sync facts (3 Xamarin apps, 10+ dev Santander team, 3 modules Nexus)"
```

---

### Task 3: Sharpen StockTrack in `src/data/projects.ts`

**Files:**
- Modify: `src/data/projects.ts` lines 12-19

**Step 1: Edit StockTrack entry:**

Replace:
```ts
  {
    name: "StockTrack",
    description: "Offshore energy logistics platform — inventory tracking, stock trades, real-time analytics.",
    role: "Senior Engineer",
    roleType: "professional",
    tech: [".NET 8", "Angular", "GraphQL", "Kubernetes"],
    image: "/projects/stocktrack2.png",
  },
```

With:
```ts
  {
    name: "StockTrack",
    description: "Offshore energy supply chain platform — vessel operations, real-time asset tracking, stock trades, analytics.",
    role: "Senior Engineer",
    roleType: "professional",
    tech: [".NET 8", "Angular", "GraphQL", "Kubernetes"],
    image: "/projects/stocktrack2.png",
  },
```

**Step 2: Commit:**
```bash
git add src/data/projects.ts
git commit -m "projects: sharpen StockTrack description with offshore energy supply chain terms"
```

---

### Task 4: Fix `Modules` metric in `src/components/FeaturedProject.tsx`

**Files:**
- Modify: `src/components/FeaturedProject.tsx` line 8

**Step 1: Edit the metrics array:**

Replace:
```tsx
const metrics = [
  { value: 4, label: "Modules" },
```

With:
```tsx
const metrics = [
  { value: 3, label: "Modules" },
```

**Step 2: Commit:**
```bash
git add src/components/FeaturedProject.tsx
git commit -m "featured: correct Nexus module count from 4 to 3"
```

---

### Task 5: Smoke test the landing locally

**Step 1: Start dev server (background):**
```bash
npm run dev
```
Use `run_in_background: true`. Wait for "Ready" output.

**Step 2: Visual check in browser** at `http://localhost:3000`:
- Hero subtitle still reads `Senior Full-Stack .NET Architect` (unchanged — that was the decision).
- `#stack` section: AI group has exactly 3 items — `Claude`, `Claude Code`, `superpowers`. Tooling & Testing includes `SpecFlow`.
- `#projects` Featured block: "3 Modules" metric displays (count-up animates to 3).
- `#career` timeline: Nexus highlight reads `3 modules, 3 years`; Xamarin line starts with `Shipped 3`; CUBE.ITG has `10+ developer team`.
- StockTrack card description mentions `vessel operations` and `real-time asset tracking`.

**Step 3: Type check:**
```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 4: Stop dev server.** If anything is off, fix before moving on. No commit if visuals look clean.

---

## Phase 2 — Resume repo updates

> Resume repo at `C:\Repositories\Resume` is NOT a git repo. All git commits happen in Landing after the final PDF is copied to `public/resume.pdf`.

### Task 6: Identify source of truth in Resume repo

**Files to inspect:**
- `C:\Repositories\Resume\package.json`
- `C:\Repositories\Resume\build_resume.py`
- `C:\Repositories\Resume\build_resume_final.py`
- `C:\Repositories\Resume\build_resume_v5.py`
- `C:\Repositories\Resume\build_resume_ats.js`
- `C:\Repositories\Resume\export_pdf.js`
- `C:\Repositories\Resume\build_resume_docx.js`

**Step 1: Read each build script header/top 30 lines** to determine:
- Which script is the primary builder?
- What input file(s) does it read?
- What output files does it produce?

**Step 2: Identify the canonical source HTML or data file** (likely `resume_v5_sky.html` or a template file — whichever the latest `build_resume_final.py` or `build_resume_v5.py` uses as input).

**Step 3: Record findings** in a short note back to the user (no file needed) before editing. Example format:
```
Source of truth: resume_v5_sky.html
Primary build: python build_resume_final.py -> writes photo HTML/PDF/DOCX
ATS build: node build_resume_ats.js -> writes ats DOCX
```

---

### Task 7: Apply content fixes to Resume source file(s)

Apply the same factual corrections as the Landing, plus the title change:

**Replacement rules (search & replace in the identified source file):**

| # | Find | Replace with |
|---|---|---|
| 1 | `Senior Full-Stack .NET Developer` | `Senior Full-Stack .NET Engineer` |
| 2 | `5 bounded contexts` | `3 modules` |
| 3 | `5 DDD bounded contexts` | `3 DDD modules` |
| 4 | `applied DDD across 5 bounded contexts` | `applied DDD across 3 modules` |
| 5 | `shipped in 4 years` | `shipped in 3 years` |
| 6 | `4 years on time and on budget` | `3 years on time and on budget` |
| 7 | `Modular monolith with 5 DDD bounded contexts` | `Modular monolith with 3 DDD modules` |
| 8 | `Built cross-platform mobile apps in Xamarin Native and Xamarin Forms for iOS and Android from a shared C# codebase` | `Shipped 3 cross-platform mobile apps in Xamarin Native and Xamarin Forms for iOS and Android from a shared C# codebase` |
| 9 | `Santander Group (UK finance)` | `Santander Group (UK regulated finance market)` |
| 10 | `Large codebase, strict deadlines, regulatory requirements. A good place to learn discipline.` | `Embedded in a 10+ developer team with analysts and testers on a large regulated codebase. A good place to learn discipline.` |

**Also in skills/tags cluster (AI group):**
- Remove tags: `OpenAI`, `GitHub Copilot`, `DALL·E`
- Add tags: `Claude Code`, `superpowers`
- Keep existing: `Claude`

**Also in Tooling & Testing skills:**
- Add tag: `SpecFlow`

**StockTrack description in the Projects section of resume:**
- Add a sentence that mirrors the Landing sharpening (mention offshore energy supply chain and vessel operations).
- Add one bullet about `Modernized BDD workflow with Claude and superpowers for SpecFlow step generation` (matches Landing career entry).

**Step 1: Grep** each target string in the identified source file to locate it. Handle the HTML files with unique surrounding context (these files are ~500KB — use Edit tool with enough context to ensure uniqueness).

**Step 2: Edit** each occurrence. If a replacement text appears in multiple files (e.g., both `photo` and `nophoto` HTML variants), apply consistently across all source files that feed the build scripts.

**Step 3: Do NOT commit yet.** Resume repo is not git. Commit happens after Task 9 in Landing.

---

### Task 8: Run Resume build scripts

**Step 1: Run the primary build** (identified in Task 6). Typical sequence:
```bash
cd C:/Repositories/Resume
python build_resume_final.py     # or whichever is primary
node build_resume_ats.js
node build_resume_docx.js
node export_pdf.js
```
Run commands in the order dictated by the actual build pipeline found in Task 6.

**Step 2: Verify outputs changed.** Check modification times:
```bash
ls -la C:/Repositories/Resume/resume_roman_duzynski_photo.pdf \
       C:/Repositories/Resume/resume_roman_duzynski_nophoto.pdf \
       C:/Repositories/Resume/resume_roman_duzynski_ats.docx
```
All three should have today's timestamp.

**Step 3: Visual inspection** — open `resume_roman_duzynski_photo.pdf` and confirm:
- Title reads `Senior Full-Stack .NET Engineer`.
- Nexus: `3 modules`, `3 years`.
- Xamarin line: `Shipped 3 cross-platform mobile apps`.
- CUBE.ITG: `10+ developer team with analysts and testers`.
- AI skills: `Claude`, `Claude Code`, `superpowers` only.
- SpecFlow present in testing skills.

**Step 4: If layout broke** (unlikely — only text swaps), iterate on the source or build script. Otherwise proceed.

---

### Task 9: Copy refreshed PDF to Landing and commit

**Step 1: Copy the main PDF:**
```bash
cp "C:/Repositories/Resume/resume_roman_duzynski_photo.pdf" "C:/Repositories/Landing/public/resume.pdf"
```

**Step 2: If Landing root has `resume_roman_duzynski_photo.html`** (it currently does — ~502KB, legacy artifact), sync it too:
```bash
cp "C:/Repositories/Resume/resume_roman_duzynski_photo.html" "C:/Repositories/Landing/resume_roman_duzynski_photo.html"
```

**Step 3: Verify in Landing:**
```bash
git -C "C:/Repositories/Landing" status
```
Expected: `public/resume.pdf` and possibly the HTML file modified.

**Step 4: Commit in Landing:**
```bash
git -C "C:/Repositories/Landing" add public/resume.pdf resume_roman_duzynski_photo.html
git -C "C:/Repositories/Landing" commit -m "docs(resume): refresh artifacts with Engineer title, 3-module Nexus, SpecFlow, actual AI stack"
```
(Drop the HTML from `git add` if it wasn't changed.)

---

## Phase 3 — LinkedIn recommendation (no code)

After Phase 1 and Phase 2 commits are in, write a short text block for the user to paste into LinkedIn. No files, no tooling — just a message at the end of the execution session containing:

1. **Proposed headline** (respecting no-Lead, no-AI-first rule). Example:
   ```
   Senior Full-Stack .NET Engineer · Architecting modular monoliths for energy and logistics · 10+ years · Opole/Remote
   ```
2. **Proposed About section** (3-4 sentences) emphasizing domain (banking at Santander, offshore energy at Yameo, logistics at Porta Capena), architecture (DDD, Clean Architecture, Modular Monolith), and stack (.NET 8, Azure, Angular).
3. **Keywords worth dusting in** (without changing headline): `DDD`, `CQRS`, `Event Storming`, `Clean Architecture`, `Claude Code`, `SpecFlow`, `offshore energy`, `banking`, `regulated finance`.

Do not write any files for Phase 3 — conversation output only.

---

## Verification checklist before declaring done

- [ ] `src/data/skills.ts` AI group = exactly `[Claude, Claude Code, superpowers]`
- [ ] `src/data/skills.ts` Tooling & Testing includes `SpecFlow`
- [ ] `src/data/career.ts` Yameo bullets include the SpecFlow/Claude/superpowers BDD bullet
- [ ] `src/data/career.ts` Porta Capena Opole highlight reads `3 modules, 3 years, on time & on budget` (no `+ SOO`)
- [ ] `src/data/career.ts` Porta Capena Wroclaw highlight starts with `Shipped 3 cross-platform mobile apps`
- [ ] `src/data/career.ts` CUBE.ITG mentions `10+ developer team with analysts and testers`
- [ ] `src/data/projects.ts` StockTrack description uses `vessel operations` and `real-time asset tracking`
- [ ] `src/components/FeaturedProject.tsx` shows `Modules = 3`
- [ ] Resume HTML/PDF/DOCX all say `Senior Full-Stack .NET Engineer` (not Developer)
- [ ] Resume artifacts all show `3 modules` and `3 years` for Nexus (no `5 bounded contexts`, no `4 years`)
- [ ] Resume artifacts all list `SpecFlow` in testing and `Claude / Claude Code / superpowers` in AI
- [ ] `public/resume.pdf` byte-hash differs from pre-change version (and content matches latest Resume build)
- [ ] `npx tsc --noEmit` passes in Landing
- [ ] `npm run dev` serves without console errors; visuals match expectations
- [ ] All commits landed on `main` in Landing (confirm with `git log --oneline -10`)
- [ ] LinkedIn recommendation delivered as a message at session end

---

## Rollback plan

If something goes wrong after commits on `main`:
- `git -C C:/Repositories/Landing log --oneline -10` — find the bad commit SHA(s)
- `git -C C:/Repositories/Landing revert <sha>` — create a revert commit (preserves history)
- **Do NOT** use `git reset --hard` — destructive and hides the mistake.

If Resume build breaks:
- The Resume repo is not git-tracked, so there's no automatic backup. Before editing source files, the executing session should first copy the source file(s) to `*.bak` in the same directory as a manual safety net:
  ```bash
  cp resume_v5_sky.html resume_v5_sky.html.bak  # or whichever is source
  ```
  Restore from `.bak` if build output is unusable.

---

## Out of scope for this plan (explicit non-goals)

- Redesigning any landing section or component
- Moving StockTrack to Featured Project (Nexus stays as hero)
- Adding Semantic Kernel or Azure OpenAI to any artifact
- Changing the Hero subtitle away from `Architect`
- Adding "Lead", "Tech Lead", or "AI-first" anywhere
- Rewriting LinkedIn profile via API (user pastes manually)
- Resume visual redesign or color variant changes (v1-v5 HTML files stay as-is)
