import { CanvasElement } from './canvas';

export type ScrapeType = 'architecture' | 'documentation' | 'github' | 'api' | 'auto';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type JobStage = 'fetching' | 'parsing' | 'classifying' | 'generating' | 'complete';

export interface ScrapeRequest {
  url: string;
  type: ScrapeType;
  options?: ScrapeOptions;
}

export interface ScrapeOptions {
  depth?: number;
  followLinks?: boolean;
  extractCode?: boolean;
  generateDiagram?: boolean;
  generateDoc?: boolean;
  provider?: AIProviderConfig;
  customHeaders?: Record<string, string>;
  waitForSelector?: string;
  scrollToBottom?: boolean;
}

export interface ScrapeResponse {
  jobId: string;
  status: 'accepted';
  estimatedDuration: number;
  wsEndpoint: string;
}

export interface JobProgress {
  jobId: string;
  status: JobStatus;
  progress: number;
  currentStage: JobStage;
  message?: string;
  result?: ScrapeResult;
  error?: string;
}

export interface TechComponent {
  name: string;
  category: 'cloud' | 'database' | 'messaging' | 'compute' | 'auth' | 'monitoring' | 'frontend' | 'backend' | 'infrastructure' | 'security' | 'storage' | 'cdn' | 'search' | 'ml' | 'other';
  iconName?: string;
  iconCategory?: string;
  confidence: number;
  version?: string;
  description?: string;
  sourceLocation?: string;
  relationships?: ComponentRelationship[];
}

export interface ComponentRelationship {
  target: string;
  type: 'depends_on' | 'calls' | 'stores_in' | 'publishes_to' | 'consumes_from' | 'authenticates_via' | 'monitors' | 'caches_for';
  protocol?: string;
  description?: string;
}

export interface ScrapeResult {
  url: string;
  title: string;
  summary: string;
  techStack: TechComponent[];
  architecture: ArchitectureResult;
  documentation: DocumentationResult;
  metadata: ScrapeMetadata;
}

export interface ArchitectureResult {
  elements: CanvasElement[];
  dsl: string;
  mermaid: string;
  layout: 'horizontal' | 'vertical' | 'grid' | 'clustered';
}

export interface DocumentationResult {
  markdown: string;
  adr: string[];
  apiSpec?: OpenAPISpec;
  readme?: string;
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, any>;
  components?: Record<string, any>;
}

export interface ScrapeMetadata {
  scrapedAt: number;
  contentHash: string;
  sourceType: 'html' | 'markdown' | 'openapi' | 'github' | 'api' | 'pdf';
  confidence: number;
  crawlDepth: number;
  pagesScraped: number;
  processingTimeMs: number;
  aiProviderUsed: string;
  modelUsed: string;
}

export interface ScrapeJob {
  id: string;
  url: string;
  type: ScrapeType;
  priority: 'high' | 'normal' | 'low';
  config: ScrapeOptions;
  status: JobStatus;
  progress: number;
  currentStage: JobStage;
  result?: ScrapeResult;
  error?: string;
  retryCount: number;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  userId?: string;
}

export interface WorkerConfig {
  type: 'static' | 'dynamic' | 'github' | 'api';
  concurrency: number;
  timeoutMs: number;
  userAgent: string;
  respectRobotsTxt: boolean;
  rateLimitPerDomain: number;
}

export interface ExtractedContent {
  url: string;
  title: string;
  html: string;
  text: string;
  markdown: string;
  links: ExtractedLink[];
  codeBlocks: ExtractedCodeBlock[];
  images: ExtractedImage[];
  tables: ExtractedTable[];
  headings: ExtractedHeading[];
  metadata: Record<string, string>;
}

export interface ExtractedLink {
  url: string;
  text: string;
  title?: string;
  internal: boolean;
  rel?: string;
}

export interface ExtractedCodeBlock {
  language: string;
  code: string;
  filename?: string;
  context?: string;
}

export interface ExtractedImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  context?: string;
}

export interface ExtractedTable {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ExtractedHeading {
  level: number;
  text: string;
  id?: string;
}

export interface ClassifiedContent {
  techStack: TechComponent[];
  architecturePatterns: ArchitecturePattern[];
  apiEndpoints: APIEndpoint[];
  dataModels: DataModel[];
  deploymentInfo: DeploymentInfo[];
}

export interface ArchitecturePattern {
  name: string;
  type: 'microservices' | 'monolith' | 'serverless' | 'event-driven' | 'layered' | 'hexagonal' | 'cqrs' | 'event-sourcing' | 'sidecar' | 'ambassador' | 'adapter';
  confidence: number;
  description: string;
  components: string[];
}

export interface APIEndpoint {
  path: string;
  method: string;
  summary: string;
  parameters?: any[];
  responses?: Record<string, any>;
  authentication?: string;
}

export interface DataModel {
  name: string;
  fields: DataField[];
  relationships?: DataRelationship[];
  source: 'database' | 'api' | 'code' | 'documentation';
}

export interface DataField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  constraints?: string[];
}

export interface DataRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  targetModel: string;
  sourceField: string;
  targetField: string;
}

export interface DeploymentInfo {
  platform: 'aws' | 'gcp' | 'azure' | 'kubernetes' | 'docker' | 'vercel' | 'netlify' | 'heroku' | 'on-premise' | 'unknown';
  services: string[];
  regions?: string[];
  scaling?: string;
  cicd?: string;
}

export type ProgressEvent =
  | { type: 'stage'; stage: JobStage; message: string }
  | { type: 'progress'; percent: number; details: string }
  | { type: 'partial'; data: Partial<ScrapeResult> }
  | { type: 'complete'; result: ScrapeResult }
  | { type: 'error'; error: string; recoverable: boolean };

export interface AIProviderConfig {
  provider: 'builtin' | 'ollama' | 'opencode' | 'antigravity' | 'custom' | 'openai' | 'gemini';
  endpoint: string;
  model: string;
  apiKey?: string;
}