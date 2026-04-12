# Tech Stack — Logo Grid Redesign

## Goal

Replace the radial ring / proficiency-level display with a logo-based icon grid. Clean, atmospheric, no skill ratings.

---

## Tech Stack (final)

| Group | Technologies |
|---|---|
| **Backend** | .NET 8, C#, ASP.NET Core, EF Core, SignalR, GraphQL, Hangfire, MediatR, Polly, AutoMapper, RabbitMQ, MassTransit |
| **Frontend** | Angular, React, RxJS, Blazor, TypeScript, NgRx, SCSS |
| **Cloud & DevOps** | Azure, Docker, Kubernetes, Azure Pipelines, Jenkins, Railway |
| **Databases** | SQL Server, PostgreSQL, Redis, MongoDB |
| **Mobile** | React Native, Xamarin, .NET MAUI |
| **Tooling** | Git, Azure DevOps, Jira, Visual Studio, Rider, Postman, Swagger, SonarQube, NuGet, Application Insights |
| **Testing** | xUnit, Moq, Playwright |
| **AI** | Claude, OpenAI, GitHub Copilot, DALL-E |

---

## Logo Sourcing

**Primary:** `simple-icons` npm package — ~80% coverage, brand-accurate SVGs, no CDN dependency.

**Fallback:** For technologies without Simple Icons entries (EF Core, SignalR, Hangfire, MediatR, Polly, AutoMapper, NgRx, MassTransit, xUnit, Moq, .NET MAUI, Azure Pipelines) — render a styled text badge using the tech's short name in the same glass card.

**Color strategy:** All logos render `fill-white opacity-70` by default. On hover, transition to the brand's official hex color at `opacity-100`.

---

## Card Design

```
┌─────────────┐
│             │
│   [LOGO]    │  ← 48px SVG, centered
│             │
│  TECH NAME  │  ← text-xs uppercase tracking-wider text-gray-400
│             │
└─────────────┘
~88px × ~96px, rounded-xl
```

- **Base:** `bg-white/5 border border-white/10 rounded-xl`
- **Hover:** `border-accent-teal/30 shadow-[0_0_16px_rgba(45,212,191,0.15)] scale-105`
- **Transition:** `transition-all duration-300`

---

## Layout

- Group headers: keep existing style (teal for Backend, gray for others + gradient underline)
- Cards: `flex flex-wrap gap-3` under each header
- Groups grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10`
- Methodology tags at bottom: unchanged

---

## Animations

- Entrance: stagger `opacity: 0→1, y: 20→0` with 60ms delay per card (same as current)
- Hover logo color reveal: CSS transition on fill + opacity
- No proficiency rings — `level` field removed from `Technology` interface

---

## Data Model Change

`skills.ts` — remove `level` from `Technology`:

```ts
export interface Technology {
  name: string;
  icon?: string; // simple-icons slug, optional — falls back to text badge
}
```
