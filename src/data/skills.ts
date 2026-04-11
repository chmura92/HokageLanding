export interface Technology {
  name: string;
  level: number; // 1-5, used as ring fill percentage (level/5 * 100)
}

export interface TechGroup {
  label: string;
  technologies: Technology[];
}

export const techGroups: TechGroup[] = [
  {
    label: "Backend",
    technologies: [
      { name: ".NET 8", level: 5 },
      { name: "C#", level: 5 },
      { name: "ASP.NET Core", level: 5 },
      { name: "EF Core", level: 4 },
      { name: "SignalR", level: 4 },
      { name: "GraphQL", level: 3 },
      { name: "Hangfire", level: 3 },
    ],
  },
  {
    label: "Frontend",
    technologies: [
      { name: "Angular", level: 5 },
      { name: "React", level: 4 },
      { name: "RxJS", level: 4 },
      { name: "Blazor", level: 3 },
    ],
  },
  {
    label: "Cloud & DevOps",
    technologies: [
      { name: "Azure", level: 4 },
      { name: "Docker", level: 4 },
      { name: "Kubernetes", level: 3 },
      { name: "Azure Pipelines", level: 4 },
      { name: "Jenkins", level: 3 },
    ],
  },
  {
    label: "Databases",
    technologies: [
      { name: "SQL Server", level: 5 },
      { name: "PostgreSQL", level: 4 },
      { name: "Redis", level: 3 },
      { name: "MongoDB", level: 3 },
    ],
  },
  {
    label: "Mobile",
    technologies: [
      { name: "React Native", level: 4 },
      { name: "Xamarin", level: 3 },
    ],
  },
  {
    label: "Tooling",
    technologies: [
      { name: "Git", level: 5 },
      { name: "Azure DevOps", level: 5 },
      { name: "Jira", level: 4 },
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
