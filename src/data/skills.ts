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
      { name: "RabbitMQ" },
    ],
  },
  {
    label: "Frontend & Mobile",
    technologies: [
      { name: "Angular" },
      { name: "React" },
      { name: "TypeScript" },
      { name: "RxJS" },
      { name: "NgRx" },
      { name: "Blazor" },
      { name: "Tailwind CSS" },
      { name: "React Native" },
      { name: "Xamarin" },
    ],
  },
  {
    label: "Cloud & DevOps",
    technologies: [
      { name: "Azure" },
      { name: "Docker" },
      { name: "Kubernetes" },
      { name: "Jenkins" },
      { name: "Railway" },
    ],
  },
  {
    label: "Data",
    technologies: [
      { name: "SQL Server" },
      { name: "PostgreSQL" },
      { name: "Redis" },
      { name: "MongoDB" },
      { name: "Elasticsearch" },
    ],
  },
  {
    label: "Tooling & Testing",
    technologies: [
      { name: "Git" },
      { name: "Azure DevOps" },
      { name: "Jira" },
      { name: "Visual Studio" },
      { name: "Rider" },
      { name: "Postman" },
      { name: "SonarQube" },
      { name: "Azure Portal" },
      { name: "xUnit" },
      { name: "Moq" },
      { name: "Playwright" },
      { name: "SpecFlow" },
    ],
  },
  {
    label: "AI",
    technologies: [
      { name: "Claude" },
      { name: "Claude Code" },
      { name: "superpowers" },
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
