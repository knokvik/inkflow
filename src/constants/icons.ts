import rawCatalog from './eraser_icons_catalog.json';

export interface IconDefinition {
  id: string;
  name: string;
  category: string;
  categoryLabel?: string;
  tags: string[];
  color: string;
  bgColor: string;
  iconUrl?: string;
  remoteUrl?: string;
  svgPath?: string;
}

export const ICON_CATEGORIES = [
  { id: 'all', label: 'All Icons (3,900+)' },
  { id: 'aws', label: 'AWS Cloud (440)' },
  { id: 'azure', label: 'Microsoft Azure (700)' },
  { id: 'gcp', label: 'Google Cloud (250)' },
  { id: 'tech', label: 'Tech & Languages (660)' },
  { id: 'k8s', label: 'Kubernetes (40)' },
  { id: 'networking', label: 'Networking (80)' },
  { id: 'oracle', label: 'Oracle Cloud (26)' },
  { id: 'general', label: 'General & Architecture' },
] as const;

// Common aliases between legacy or shorthand names and official Eraser IDs
export const ICON_ALIASES: Record<string, string> = {
  // Cloud & Tech
  'tech-react': 'react',
  'tech-nextjs': 'nextjs',
  'tech-tailwind': 'tailwindcss',
  'tech-docker': 'docker',
  'tech-k8s': 'kubernetes',
  'tech-python': 'python',
  'tech-node': 'node',
  'tech-nodejs': 'node',
  'tech-graphql': 'graphql',
  'tech-github': 'github',
  'tech-redis': 'redis',
  'tech-postgres': 'postgres',
  'tech-mongodb': 'mongodb',
  'tech-kafka': 'kafka',
  'tech-vue': 'vue',
  'tech-angular': 'angular',
  'tech-typescript': 'typescript',
  'tech-javascript': 'javascript',
  'tech-rust': 'rust',
  'tech-go': 'go',
  'tech-golang': 'go',
  'tech-java': 'java',
  // AWS shorthands
  'aws-ec2': 'aws-ec2',
  'aws-s3': 'aws-s3',
  'aws-lambda': 'aws-lambda',
  'aws-api-gateway': 'aws-api-gateway',
  'aws-dynamodb': 'aws-dynamodb',
  'aws-rds': 'aws-rds',
  'aws-cloudfront': 'aws-cloudfront',
  'aws-sqs': 'aws-simple-queue-service',
  'aws-sns': 'aws-simple-notification-service',
  'aws-cognito': 'aws-cognito',
  'aws-step-functions': 'aws-step-functions',
  'aws-vpc': 'aws-virtual-private-cloud',
  // DB & Infra
  'db-postgres': 'postgres',
  'db-postgresql': 'postgres',
  'db-redis': 'redis',
  'db-mongodb': 'mongodb',
  'db-mysql': 'mysql',
  'db-kafka': 'kafka',
  'db-elastic': 'elastic',
  'db-elasticsearch': 'elasticsearch',
  'infra-firewall': 'firewall',
  // General
  'gen-mobile': 'aws-front-end-web-mobile',
  'gen-browser': 'azure-browser',
  'gen-microservice': 'aws-microservice-extractor-for-net',
  'gen-server': 'server',
  'gen-database': 'database',
  'gen-cloud': 'cloud',
  'gen-user': 'user',
  'gen-shield': 'shield',
};

export const ICON_CATALOG: IconDefinition[] = (rawCatalog as any[]).map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  categoryLabel: item.categoryLabel,
  tags: item.tags || [item.category, item.id],
  color: item.color || '#525252',
  bgColor: item.bgColor || '#F4F4F5',
  iconUrl: item.iconUrl || `/icons/${item.id}.svg`,
  remoteUrl: item.remoteUrl,
  svgPath: item.svgPath || '',
}));

const catalogMap = new Map<string, IconDefinition>();
for (const icon of ICON_CATALOG) {
  catalogMap.set(icon.id, icon);
}

/**
 * Lookup an icon by its ID, alias, or fuzzy name
 */
export function getIconDefinition(idOrName?: string): IconDefinition {
  if (!idOrName) return ICON_CATALOG[0];

  // 1. Direct match
  const direct = catalogMap.get(idOrName);
  if (direct) return direct;

  // 2. Alias match
  const aliasId = ICON_ALIASES[idOrName];
  if (aliasId) {
    const aliased = catalogMap.get(aliasId);
    if (aliased) return aliased;
  }

  // 3. Lowercase / sanitized match
  const clean = idOrName.toLowerCase().replace(/\s+/g, '-');
  const cleanMatch = catalogMap.get(clean);
  if (cleanMatch) return cleanMatch;

  // 4. Substring or prefix match
  const found = ICON_CATALOG.find(
    (i) => i.id.includes(clean) || clean.includes(i.id) || i.name.toLowerCase().includes(idOrName.toLowerCase())
  );
  if (found) return found;

  // Fallback to default
  return ICON_CATALOG[0];
}

/**
 * Get direct asset URL for an icon
 */
export function getIconUrl(idOrName?: string): string {
  const def = getIconDefinition(idOrName);
  return def.iconUrl || `/icons/${def.id}.svg`;
}
