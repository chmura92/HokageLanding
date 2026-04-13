export interface CareerEntry {
  company: string;
  location: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
  isEducation?: boolean;
}

export const career: CareerEntry[] = [
  {
    company: "Yameo",
    location: "Gdansk",
    role: "Senior Software Engineer",
    period: "2024 – Present",
    description: "Direct technical contact for energy sector clients. No PM layer.",
    highlights: [
      "Contributing to StockTrack — enterprise offshore logistics on Azure Kubernetes",
      "Delivered Blazor internal tooling app, expanding team capability beyond Angular",
      "Architecture decisions made directly with energy sector stakeholders",
    ],
  },
  {
    company: "Porta Capena",
    location: "Opole",
    role: "Team Lead Software Developer",
    period: "2019 – 2024",
    description: "Built the Opole branch from scratch. Hired 5 engineers. Delivered Nexus.",
    highlights: [
      "Architected Nexus logistics platform — 3 modules + SOO, 3 years, on time & on budget",
      "Hired and mentored 5 engineers, established code review standards",
      "Owned Azure DevOps CI/CD pipelines across multiple live projects",
    ],
  },
  {
    company: "Porta Capena",
    location: "Wroclaw",
    role: "Software Developer",
    period: "2016 – 2019",
    description: "Cross-technology problem solver. Led Angular migration. Go-to for mobile.",
    highlights: [
      "Led frontend migration from MVC Razor to Angular on two projects",
      "Built cross-platform mobile apps in Xamarin for iOS and Android",
      "Worked across IoT energy, analytics, smart glasses, and logistics projects",
    ],
  },
  {
    company: "CUBE.ITG",
    location: "Wroclaw",
    role: "Junior .NET Developer",
    period: "2015 – 2016",
    description: "Santander Group platform. Large codebase, strict deadlines.",
    highlights: [
      "Contributed to commercial ASP.NET MVC platform for Santander Group (UK finance)",
      "Learned discipline in a large regulated codebase with strict deadlines",
    ],
  },
  {
    company: "Opole University of Technology",
    location: "Opole",
    role: "Engineer in Computer Science",
    period: "2012 – 2016",
    description: "Computer Science degree. Spent a semester abroad on Erasmus at Instituto Politécnico de Bragança, Portugal.",
    highlights: [],
    isEducation: true,
  },
];
