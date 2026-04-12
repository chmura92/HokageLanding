# Tech Stack Logo Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace radial ring / proficiency-level cards in `TechStack.tsx` with glass logo cards using `simple-icons`, grouped by category, with text-badge fallback for unmapped techs.

**Architecture:** Three focused changes — (1) update `skills.ts` to remove `level`, expand all 8 groups; (2) create `src/lib/iconMap.ts` mapping tech names to `SimpleIcon` objects; (3) rewrite `TechStack.tsx` replacing `TechRing` with `TechCard` that renders an SVG logo or text badge inside a glass card. CSS custom property `--brand-color` on the card drives the hover fill transition on the SVG.

**Tech Stack:** simple-icons v13+, React, Tailwind CSS v4, Framer Motion

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/data/skills.ts` | Modify | Tech data — remove `level`, expand all groups to 8 |
| `src/lib/iconMap.ts` | Create | Maps tech name → `SimpleIcon` object or null |
| `src/components/TechStack.tsx` | Modify | Replace `TechRing` with `TechCard`, use `getIcon()` |

---

### Task 1: Install simple-icons

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the package**

```bash
cd .worktrees/tech-stack-logos
npm install simple-icons
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Verify exports are accessible**

```bash
node -e "const si = require('simple-icons'); console.log(Object.keys(si).filter(k => ['siReact','siAngular','siDocker','siGit'].includes(k)))"
```

Expected: `[ 'siReact', 'siAngular', 'siDocker', 'siGit' ]` (order may vary).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install simple-icons"
```

---

### Task 2: Update skills.ts — remove level, expand tech groups

**Files:**
- Modify: `src/data/skills.ts`

- [ ] **Step 1: Replace the entire file**

```ts
export interface Technology {
  name: string;
}

export interface TechGroup {
  label: string;
  technologies: Technology[];
}

export const techGroups: TechGroup[] = [
  {
    label: "Backend",
    technologies: [
      { name: ".NET 8" },
      { name: "C#" },
      { name: "ASP.NET Core" },
      { name: "EF Core" },
      { name: "SignalR" },
      { name: "GraphQL" },
      { name: "Hangfire" },
      { name: "MediatR" },
      { name: "Polly" },
      { name: "AutoMapper" },
      { name: "RabbitMQ" },
      { name: "MassTransit" },
    ],
  },
  {
    label: "Frontend",
    technologies: [
      { name: "Angular" },
      { name: "React" },
      { name: "RxJS" },
      { name: "Blazor" },
      { name: "TypeScript" },
      { name: "NgRx" },
      { name: "SCSS" },
    ],
  },
  {
    label: "Cloud & DevOps",
    technologies: [
      { name: "Azure" },
      { name: "Docker" },
      { name: "Kubernetes" },
      { name: "Azure Pipelines" },
      { name: "Jenkins" },
      { name: "Railway" },
    ],
  },
  {
    label: "Databases",
    technologies: [
      { name: "SQL Server" },
      { name: "PostgreSQL" },
      { name: "Redis" },
      { name: "MongoDB" },
    ],
  },
  {
    label: "Mobile",
    technologies: [
      { name: "React Native" },
      { name: "Xamarin" },
      { name: ".NET MAUI" },
    ],
  },
  {
    label: "Tooling",
    technologies: [
      { name: "Git" },
      { name: "Azure DevOps" },
      { name: "Jira" },
      { name: "Visual Studio" },
      { name: "Rider" },
      { name: "Postman" },
      { name: "Swagger" },
      { name: "SonarQube" },
      { name: "NuGet" },
      { name: "Application Insights" },
    ],
  },
  {
    label: "Testing",
    technologies: [
      { name: "xUnit" },
      { name: "Moq" },
      { name: "Playwright" },
    ],
  },
  {
    label: "AI",
    technologies: [
      { name: "Claude" },
      { name: "OpenAI" },
      { name: "GitHub Copilot" },
      { name: "DALL-E" },
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

- [ ] **Step 2: Check for TS errors from the removed `level` field**

```bash
cd .worktrees/tech-stack-logos && npx tsc --noEmit 2>&1 | head -30
```

Expected errors only in `TechStack.tsx` referencing `tech.level` — those are resolved in Task 4. No errors in `skills.ts` itself.

- [ ] **Step 3: Commit**

```bash
git add src/data/skills.ts
git commit -m "feat: update tech stack data — remove level, expand to 8 groups"
```

---

### Task 3: Create src/lib/iconMap.ts

**Files:**
- Create: `src/lib/iconMap.ts`

- [ ] **Step 1: Verify which uncertain imports exist**

```bash
node -e "const si = require('simple-icons'); ['siCsharp','siAzuredevops','siAzurepipelines','siGithubcopilot','siRider','siNuget','siSonarqube','siXamarin'].forEach(k => console.log(k, k in si))"
```

Note any that print `false` — remove those imports and their map entries in the next step (they'll fall back to text badges).

- [ ] **Step 2: Create the file (adjust based on Step 1 results)**

```ts
import type { SimpleIcon } from 'simple-icons';
import {
  siDotnet,
  siCsharp,
  siGraphql,
  siRabbitmq,
  siAngular,
  siReact,
  siReactivex,
  siTypescript,
  siSass,
  siMicrosoftazure,
  siDocker,
  siKubernetes,
  siAzuredevops,
  siAzurepipelines,
  siJenkins,
  siRailway,
  siMicrosoftsqlserver,
  siPostgresql,
  siRedis,
  siMongodb,
  siXamarin,
  siGit,
  siJira,
  siVisualstudio,
  siRider,
  siPostman,
  siSwagger,
  siSonarqube,
  siNuget,
  siPlaywright,
  siAnthropic,
  siOpenai,
  siGithubcopilot,
} from 'simple-icons';

const iconMap: Record<string, SimpleIcon> = {
  '.NET 8':             siDotnet,
  'C#':                 siCsharp,
  'GraphQL':            siGraphql,
  'RabbitMQ':           siRabbitmq,
  'Angular':            siAngular,
  'React':              siReact,
  'React Native':       siReact,
  'RxJS':               siReactivex,
  'TypeScript':         siTypescript,
  'SCSS':               siSass,
  'Azure':              siMicrosoftazure,
  'Application Insights': siMicrosoftazure,
  'Docker':             siDocker,
  'Kubernetes':         siKubernetes,
  'Azure DevOps':       siAzuredevops,
  'Azure Pipelines':    siAzurepipelines,
  'Jenkins':            siJenkins,
  'Railway':            siRailway,
  'SQL Server':         siMicrosoftsqlserver,
  'PostgreSQL':         siPostgresql,
  'Redis':              siRedis,
  'MongoDB':            siMongodb,
  'Xamarin':            siXamarin,
  'Git':                siGit,
  'Jira':               siJira,
  'Visual Studio':      siVisualstudio,
  'Rider':              siRider,
  'Postman':            siPostman,
  'Swagger':            siSwagger,
  'SonarQube':          siSonarqube,
  'NuGet':              siNuget,
  'Playwright':         siPlaywright,
  'Claude':             siAnthropic,
  'OpenAI':             siOpenai,
  'DALL-E':             siOpenai,
  'GitHub Copilot':     siGithubcopilot,
};

export function getIcon(name: string): SimpleIcon | null {
  return iconMap[name] ?? null;
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit 2>&1 | grep iconMap
```

Expected: no output. If import errors appear, run:
```bash
node -e "const si = require('simple-icons'); console.log(Object.keys(si).filter(k => k.toLowerCase().includes('github')))"
```
to find the correct export name, then update the import.

- [ ] **Step 4: Commit**

```bash
git add src/lib/iconMap.ts
git commit -m "feat: add iconMap — maps tech names to simple-icons SVG data"
```

---

### Task 4: Rewrite TechStack.tsx with TechCard

**Files:**
- Modify: `src/components/TechStack.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { motion } from "framer-motion";
import { techGroups, methodologies } from "../data/skills";
import { getIcon } from "../lib/iconMap";

function TechCard({ name, index }: { name: string; index: number }) {
  const icon = getIcon(name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-3 w-[88px] cursor-default
        hover:border-accent-teal/30 hover:shadow-[0_0_16px_rgba(45,212,191,0.15)] hover:scale-105 transition-all duration-300"
      style={icon ? ({ '--brand-color': `#${icon.hex}` } as React.CSSProperties) : {}}
    >
      {icon ? (
        <svg
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 fill-white/70 group-hover:fill-[var(--brand-color)] transition-[fill] duration-300"
          aria-label={name}
          dangerouslySetInnerHTML={{ __html: icon.svg }}
        />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors duration-300 text-center leading-tight px-1">
          {name.split(/[\s.]+/).map(w => w[0]).filter(Boolean).join('').toUpperCase().slice(0, 4)}
        </div>
      )}
      <span className="text-[10px] uppercase tracking-wide text-gray-400 group-hover:text-gray-200 transition-colors duration-300 text-center leading-tight w-full break-words">
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
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function TechStack() {
  const primaryGroups = new Set(["Backend"]);

  return (
    <section id="stack" className="bg-space-lifted py-24 px-6">
      <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-500 mb-12 text-center">
        Stack
      </h2>

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
              <div className="flex flex-wrap gap-3">
                {group.technologies.map((tech, i) => (
                  <TechCard key={tech.name} name={tech.name} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

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

- [ ] **Step 2: Verify TypeScript compiles with no errors**

```bash
npx tsc --noEmit 2>&1
```

Expected: no output.

- [ ] **Step 3: Start dev server and verify visually**

```bash
npm run dev
```

Open http://localhost:3000, scroll to Stack section. Check:
- Glass cards render in grouped rows under each category header
- Logo SVGs appear white (~40px), text fallback badges appear for EF Core, SignalR, Hangfire, MediatR, Polly, AutoMapper, Blazor, NgRx, MassTransit, .NET MAUI, xUnit, Moq
- Hover: card scales up + teal border glow + logo transitions to brand color
- Methodology tags still appear at the bottom unchanged
- Mobile (narrow viewport): cards wrap cleanly

- [ ] **Step 4: Commit**

```bash
git add src/components/TechStack.tsx
git commit -m "feat: replace tech rings with logo glass cards"
```
