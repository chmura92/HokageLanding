import type { SimpleIcon } from 'simple-icons';
import {
  siDotnet,
  siElasticsearch,
  siGraphql,
  siRabbitmq,
  siAngular,
  siReact,
  siReactivex,
  siTypescript,
  siTailwindcss,
  siDocker,
  siKubernetes,
  siJenkins,
  siRailway,
  siPostgresql,
  siRedis,
  siMongodb,
  siGit,
  siJira,
  siRider,
  siPostman,
  siSonarqubeserver,
  siClaude,
  siGithubcopilot,
  siNgrx,
  siBlazor,
  siMoq,
} from 'simple-icons';
import { customIcons, type CustomIcon } from './customIcons';

export type IconData =
  | { kind: 'si'; icon: SimpleIcon }
  | { kind: 'custom'; icon: CustomIcon }
  | null;

const siMap: Record<string, SimpleIcon> = {
  '.NET 8':         siDotnet,
  'ASP.NET Core':   siDotnet,   // ASP.NET Core shares .NET visual identity
  'Elasticsearch':  siElasticsearch,
  'GraphQL':        siGraphql,
  'RabbitMQ':       siRabbitmq,
  'Angular':        siAngular,
  'React':          siReact,
  'React Native':   siReact,
  'RxJS':           siReactivex,
  'TypeScript':     siTypescript,
  'Tailwind CSS':   siTailwindcss,
  'Docker':         siDocker,
  'Kubernetes':     siKubernetes,
  'Jenkins':        siJenkins,
  'Railway':        siRailway,
  'PostgreSQL':     siPostgresql,
  'Redis':          siRedis,
  'MongoDB':        siMongodb,
  'Git':            siGit,
  'Jira':           siJira,
  'Rider':          siRider,
  'Postman':        siPostman,
  'SonarQube':      siSonarqubeserver,
  'Claude':         siClaude,
  'GitHub Copilot': siGithubcopilot,
  'NgRx':           siNgrx,
  'Blazor':         siBlazor,
  'Moq':            siMoq,
};

export function getIcon(name: string): IconData {
  if (siMap[name]) return { kind: 'si', icon: siMap[name] };
  if (customIcons[name]) return { kind: 'custom', icon: customIcons[name] };
  return null;  // renders as text badge
}
