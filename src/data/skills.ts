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
  "Clean Architecture",
  "Hexagonal Architecture",
  "Onion Architecture",
  "Vertical Slice Architecture",
  "Modular Monolith",
  "Microservices",
  "DDD",
  "Bounded Contexts",
  "Ubiquitous Language",
  "Event Storming",
  "Domain Events",
  "CQRS",
  "Event Sourcing",
  "Event-Driven Architecture",
  "Outbox Pattern",
  "BFF",
  "SOLID",
  "Repository Pattern",
  "Unit of Work",
  "Caching Strategies",
  "TDD",
  "BDD",
  "Test Pyramid",
  "CI/CD",
  "Blue-Green Deploys",
  "Infrastructure as Code",
  "OpenTelemetry",
  "Reactive Programming",
  "State Management",
  "Agile",
  "Code Reviews",
  "Pair Programming",
];
