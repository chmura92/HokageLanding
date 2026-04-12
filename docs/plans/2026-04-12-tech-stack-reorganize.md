# Tech Stack Reorganization

## Changes

### Tech list
- **Remove**: Polly, SCSS, Swagger, NuGet, Application Insights
- **Add**: Tailwind CSS, Azure Portal
- **Groups**: 8 → 6 (merge Mobile into Frontend, merge Testing into Tooling)

### Groups
| Group | Count | Technologies |
|---|---|---|
| Backend | 11 | .NET 8, C#, ASP.NET Core, EF Core, SignalR, GraphQL, Hangfire, MediatR, AutoMapper, RabbitMQ, MassTransit |
| Frontend & Mobile | 10 | Angular, React, TypeScript, RxJS, NgRx, Blazor, Tailwind CSS, React Native, Xamarin, .NET MAUI |
| Cloud & DevOps | 6 | Azure, Docker, Kubernetes, Azure Pipelines, Jenkins, Railway |
| Data | 4 | SQL Server, PostgreSQL, Redis, MongoDB |
| Tooling & Testing | 11 | Git, Azure DevOps, Jira, Visual Studio, Rider, Postman, SonarQube, Azure Portal, xUnit, Moq, Playwright |
| AI | 4 | Claude, OpenAI, GitHub Copilot, DALL-E |

### Visual
- **Colors**: Remove `primaryGroups` — all headers uniform gray (`text-gray-500`, `from-white/10` underline)
- **Animation**: Stagger `0.06 → 0.03`, duration `0.4 → 0.3`

### Icons
- simple-icons: covers ~60% of items
- Custom SVG paths: `src/lib/customIcons.ts` for remaining (Azure, ASP.NET Core, Visual Studio, SQL Server, OpenAI, Playwright, etc.)
- Icon type union: `SimpleIcon | CustomIcon | null` — null renders styled text badge
