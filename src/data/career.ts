export interface CareerEntry {
  company: string;
  location: string;
  role: string;
  period: string;
  description: string;
}

export const career: CareerEntry[] = [
  {
    company: "Yameo",
    location: "Gdansk",
    role: "Senior Software Engineer",
    period: "2024 – Present",
    description: "Direct technical contact for energy sector clients. No PM layer.",
  },
  {
    company: "Porta Capena",
    location: "Opole",
    role: "Team Lead Software Developer",
    period: "2019 – 2024",
    description: "Built the Opole branch from scratch. Hired 5 engineers. Delivered Nexus.",
  },
  {
    company: "Porta Capena",
    location: "Wroclaw",
    role: "Software Developer",
    period: "2016 – 2019",
    description: "Cross-technology problem solver. Led Angular migration. Go-to for mobile.",
  },
  {
    company: "CUBE.ITG",
    location: "Wroclaw",
    role: "Junior .NET Developer",
    period: "2015 – 2016",
    description: "Santander Group platform. Large codebase, strict deadlines.",
  },
];
