export interface Skill {
  name: string;
  level: number; // 1-5 stars, 5 = expert
}

export interface SkillGroup {
  label: string;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "Backend",
    skills: [
      { name: ".NET 8", level: 5 },
      { name: "C#", level: 5 },
      { name: "ASP.NET Core", level: 5 },
      { name: "EF Core", level: 4 },
      { name: "GraphQL", level: 3 },
      { name: "SignalR", level: 4 },
      { name: "Hangfire", level: 3 },
    ],
  },
  {
    label: "Architecture",
    skills: [
      { name: "DDD", level: 5 },
      { name: "CQRS", level: 4 },
      { name: "Clean Architecture", level: 5 },
      { name: "Event Storming", level: 4 },
      { name: "Microservices", level: 4 },
    ],
  },
  {
    label: "Frontend",
    skills: [
      { name: "Angular", level: 5 },
      { name: "React", level: 4 },
      { name: "RxJS", level: 4 },
      { name: "NGXS", level: 3 },
      { name: "Blazor", level: 3 },
    ],
  },
  {
    label: "Cloud & DevOps",
    skills: [
      { name: "Azure", level: 4 },
      { name: "Docker", level: 4 },
      { name: "Kubernetes", level: 3 },
      { name: "Azure Pipelines", level: 4 },
      { name: "Jenkins", level: 3 },
    ],
  },
  {
    label: "Databases",
    skills: [
      { name: "SQL Server", level: 5 },
      { name: "PostgreSQL", level: 4 },
      { name: "Redis", level: 3 },
      { name: "MongoDB", level: 3 },
    ],
  },
  {
    label: "Mobile",
    skills: [
      { name: "React Native", level: 4 },
      { name: "Xamarin", level: 3 },
    ],
  },
  {
    label: "Tooling & AI",
    skills: [
      { name: "Claude Code", level: 4 },
      { name: "GitHub Copilot", level: 3 },
      { name: "Git", level: 5 },
      { name: "Jira", level: 4 },
      { name: "Azure DevOps", level: 5 },
    ],
  },
];
