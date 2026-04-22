export interface Project {
  name: string;
  description: string;
  role: string;
  roleType: "professional" | "side-project";
  tech: string[];
  url?: string;
  image?: string;
}

export const projects: Project[] = [
  {
    name: "StockTrack",
    description: "Offshore energy supply chain platform — vessel operations, real-time asset tracking, stock trades, analytics.",
    role: "Senior Engineer",
    roleType: "professional",
    tech: [".NET 8", "Angular", "GraphQL", "Kubernetes"],
    image: "/projects/stocktrack2.png",
  },
  {
    name: "PurpleApp",
    description: "Employee management & operations — task assignment, time tracking, floor plans, ERP integration.",
    role: "Domain Lead",
    roleType: "professional",
    tech: [".NET 6", "React", "React Native"],
    url: "https://portacapena.com/en/projects",
    image: "/projects/purpleapp1.webp",
  },
  {
    name: "Axon",
    description: "Warehouse management system — asset tracking, full traceability, granular role policies.",
    role: "Core Developer",
    roleType: "professional",
    tech: [".NET Core", "Angular", "Xamarin"],
    url: "https://portacapena.com/en/projects",
    image: "/projects/axon1.webp",
  },
  {
    name: "StablyPro",
    description: "Equestrian facility SaaS — scheduling, rider management, horse records, billing, SMS notifications.",
    role: "Solo Project",
    roleType: "side-project",
    tech: ["Scheduling", "SMS", "Analytics"],
    url: "https://stablypro.hokage.pl",
    image: "/projects/stablypro3.png",
  },
  {
    name: "Z Drugiej Bajki",
    description: "Curated second-hand fashion e-commerce — headless architecture with modern stack.",
    role: "Solo Project",
    roleType: "side-project",
    tech: ["Next.js", "Medusa"],
    url: "https://zdrugiejbajki.pl",
    image: "/projects/zdrugiejbajki1.png",
  },
];
