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
