import { CanvasElement, AIProviderConfig } from '../types/canvas';
import { ICON_CATALOG } from '../constants/icons';

export interface AIResponse {
  message: string;
  elements?: CanvasElement[];
  docMarkdown?: string;
  actionType?: 'replace' | 'merge' | 'doc_only';
}

export async function processAIPrompt(
  prompt: string,
  currentElements: CanvasElement[],
  currentDoc: string,
  config: AIProviderConfig
): Promise<AIResponse> {
  // If external provider is selected and endpoint is configured, try calling it
  if (config.provider !== 'builtin' && config.endpoint) {
    try {
      const response = await callExternalAI(prompt, currentElements, currentDoc, config);
      if (response) return response;
    } catch (err: any) {
      console.warn('External AI call failed, falling back to local intelligent engine:', err.message);
    }
  }

  // Fallback / Built-in Offline Neural Generator
  return runBuiltinAIEngine(prompt, currentElements, currentDoc);
}

// Call local/remote OpenAI-compatible or Ollama endpoint
async function callExternalAI(
  prompt: string,
  currentElements: CanvasElement[],
  currentDoc: string,
  config: AIProviderConfig
): Promise<AIResponse | null> {
  const systemPrompt = `You are an expert software architect AI for Eraser.io.
The user wants to generate or modify system architecture diagrams and documentation.
Available icons: ${ICON_CATALOG.map(i => i.id).join(', ')}.

Respond ONLY with valid JSON in this format:
{
  "message": "Brief summary of changes made",
  "actionType": "replace" | "merge" | "doc_only",
  "elements": [ ... CanvasElement array with id, type, x, y, width, height, iconName, iconLabel, text, style, fromId, toId, etc. ... ],
  "docMarkdown": "Updated technical markdown documentation"
}`;

  const userContent = `Current elements count: ${currentElements.length}
Current Doc preview: ${currentDoc.slice(0, 300)}
User Request: ${prompt}

If modifying existing elements, keep existing positions and add or update requested nodes and connectors.`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  let body: any;
  let url = config.endpoint;

  if (config.provider === 'ollama' && !url.includes('/v1')) {
    url = url.replace(/\/$/, '') + '/api/generate';
    body = {
      model: config.model || 'llama3',
      prompt: `${systemPrompt}\n\n${userContent}`,
      stream: false,
      format: 'json',
    };
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json();
    return JSON.parse(data.response);
  } else {
    // OpenAI / Antigravity / OpenCode compatible endpoint
    if (!url.endsWith('/chat/completions')) {
      url = url.replace(/\/$/, '') + '/chat/completions';
    }
    body = {
      model: config.model || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
    };
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json();
    const content = data.choices[0]?.message?.content;
    return JSON.parse(content);
  }
}

// Built-in intelligent generator & mutator
function runBuiltinAIEngine(
  prompt: string,
  currentElements: CanvasElement[],
  _currentDoc: string
): AIResponse {
  const p = prompt.toLowerCase();

  // 1. Incremental modifications ("add redis", "add kafka", "add postgres", "add worker", "add s3")
  if (p.includes('add ') || p.includes('connect ') || p.includes('insert ')) {
    return handleIncrementalAdd(p, currentElements);
  }

  // 2. Layout re-arrangement
  if (p.includes('horizontal') || p.includes('vertical') || p.includes('rearrange') || p.includes('align')) {
    return handleLayoutRearrange(p, currentElements);
  }

  // 3. Specific architecture designs
  if (p.includes('waste') || p.includes('verdant') || p.includes('compliance') || p.includes('custody')) {
    return generateWasteTrackingArchitecture();
  }

  if (p.includes('scraper') || p.includes('scrape') || p.includes('crawler') || p.includes('playwright')) {
    return generateScraperArchitecture();
  }

  if (p.includes('rag') || p.includes('ai') || p.includes('llm') || p.includes('vector')) {
    return generateRAGArchitecture();
  }

  if (p.includes('serverless') || p.includes('lambda') || p.includes('s3') || p.includes('aws')) {
    return generateAWSServerlessArchitecture();
  }

  if (p.includes('kubernetes') || p.includes('k8s') || p.includes('cluster') || p.includes('pod') || p.includes('docker')) {
    return generateK8sArchitecture();
  }

  if (p.includes('auth') || p.includes('login') || p.includes('oauth') || p.includes('jwt')) {
    return generateAuthArchitecture();
  }

  if (p.includes('cqrs') || p.includes('event') || p.includes('streaming') || p.includes('kafka')) {
    return generateEventDrivenArchitecture();
  }

  // Generic intelligent synthesis based on extracted keywords
  return generateCustomArchitecture(prompt);
}

// =============================================================================
// REUSABLE BUILDER HELPERS FOR 4-TIER ARCHITECTURES
// =============================================================================

function createMainFrame(title: string): CanvasElement {
  return {
    id: 'frame-main',
    type: 'frame',
    x: 40,
    y: 40,
    width: 1140,
    height: 860,
    frameTitle: title,
    style: {
      fillColor: 'transparent',
      strokeColor: '#CBD5E1',
      strokeWidth: 1.5,
      strokeStyle: 'solid',
      roughness: 0,
      textColor: '#0F172A',
      fontSize: 13,
      fontFamily: 'sans',
      textAlign: 'left',
      opacity: 1,
    },
    zIndex: 1,
  };
}

function createTierFrame(id: string, y: number, title: string, strokeColor: string): CanvasElement {
  return {
    id,
    type: 'frame',
    x: 60,
    y,
    width: 1100,
    height: 155,
    frameTitle: title,
    style: {
      fillColor: 'transparent',
      strokeColor,
      strokeWidth: 1.5,
      strokeStyle: 'solid',
      roughness: 0,
      textColor: strokeColor,
      fontSize: 11,
      fontFamily: 'mono',
      textAlign: 'left',
      opacity: 1,
    },
    zIndex: 2,
  };
}

function createServiceNode(
  id: string,
  colIndex: number,
  tierY: number,
  iconName: string,
  iconLabel: string,
  subtitle: string,
  strokeColor: string
): CanvasElement {
  const colX = [80, 350, 620, 890][colIndex] || 80;
  return {
    id,
    type: 'icon',
    x: colX,
    y: tierY + 45,
    width: 230,
    height: 78,
    iconName,
    iconLabel,
    subtitle,
    style: {
      fillColor: '#FFFFFF',
      strokeColor,
      strokeWidth: 1.5,
      strokeStyle: 'solid',
      roughness: 0,
      textColor: '#0F172A',
      fontSize: 11,
      fontFamily: 'sans',
      textAlign: 'left',
      opacity: 1,
    },
    zIndex: 10,
  };
}

function createConnector(
  id: string,
  fromId: string,
  fromAnchor: 'top' | 'right' | 'bottom' | 'left',
  toId: string,
  toAnchor: 'top' | 'right' | 'bottom' | 'left',
  connectorLabel: string,
  strokeColor: string,
  dashed = false
): CanvasElement {
  return {
    id,
    type: 'connector',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fromId,
    fromAnchor,
    toId,
    toAnchor,
    routing: 'orthogonal',
    arrowEnd: true,
    connectorLabel,
    style: {
      fillColor: 'transparent',
      strokeColor,
      strokeWidth: 1.5,
      strokeStyle: dashed ? 'dashed' : 'solid',
      roughness: 0,
      textColor: strokeColor,
      fontSize: 10,
      fontFamily: 'mono',
      textAlign: 'center',
      opacity: 1,
    },
    zIndex: 5,
  };
}

// =============================================================================
// VERDANT WASTE TRACKING ARCHITECTURE (From User Reference Image)
// =============================================================================
function generateWasteTrackingArchitecture(): AIResponse {
  const elements: CanvasElement[] = [];

  // Main enclosing frame
  elements.push(createMainFrame('Verdant Waste Tracking and Compliance Architecture'));

  // Tier 1: Client / User Interfaces
  elements.push(createTierFrame('tier-w1', 80, '01 · CLIENT / USER INTERFACES', '#FB923C'));
  elements.push(createServiceNode('w-app', 0, 80, 'gen-server', 'Citizen & Picker Mobile App', 'React Native / PWA · QR + photo + GPS\nPera wallet signing · reward balance', '#FB923C'));
  elements.push(createServiceNode('w-dash', 1, 80, 'gen-browser', 'Hub Supervisor Dashboard', 'React · weight logging · independent co-sign\nBatch intake & exception review', '#FB923C'));
  elements.push(createServiceNode('w-mkt', 2, 80, 'gen-cloud', 'Brand / Buyer Marketplace', 'Browse by type, weight & region\nPurchase certificates · download audit trail', '#FB923C'));
  elements.push(createServiceNode('w-map', 3, 80, 'gen-cloud', 'DePIN Waste Map', 'Leaflet / Mapbox · collection hubs\nOrphaned waste pins · live batch flow', '#FB923C'));

  // Tier 2: Physical Edge & Verification
  elements.push(createTierFrame('tier-w2', 275, '02 · PHYSICAL EDGE & VERIFICATION', '#22C55E'));
  elements.push(createServiceNode('w-bag', 0, 275, 'infra-firewall', '1 · QR-Coded Tamper Bag', 'Unique batch identity · sealed waste\nScan QR, upload photo & capture location', '#22C55E'));
  elements.push(createServiceNode('w-dual', 1, 275, 'gen-microservice', '2 · Dual-Signature Verification', 'Picker + independent hub supervisor\n24h co-sign window · reconcile weights', '#22C55E'));
  elements.push(createServiceNode('w-cv', 2, 275, 'ai-vision', '3 · CV Waste Verification', 'CV inference endpoint · trust scores\nLow confidence / mismatch → manual review', '#22C55E'));
  elements.push(createServiceNode('w-rec', 3, 275, 'tech-docker', '4 · Recycler / Processing Plant', 'Intake weight · recycling / composting proof\n72h dispute window · verified closure', '#22C55E'));

  // Tier 3: AWS Cloud — Orchestration, Data & Observability
  elements.push(createTierFrame('tier-w3', 470, '03 · AWS CLOUD — ORCHESTRATION & OBSERVABILITY', '#0284C7'));
  elements.push(createServiceNode('w-cog', 0, 470, 'aws-cognito', 'Amazon Cognito', 'Citizen / Picker / Hub / Recycler auth\nIdentity ↔ wallet signed binding', '#0284C7'));
  elements.push(createServiceNode('w-gw', 1, 470, 'aws-api-gateway', 'API Gateway', 'REST API · role checks\nWallet-signature authentication', '#0284C7'));
  elements.push(createServiceNode('w-lam', 2, 470, 'aws-lambda', 'AWS Lambda Orchestrator', 'Batch orchestration · trust scores\nWeight checks · reward calculation', '#0284C7'));
  elements.push(createServiceNode('w-s3', 3, 470, 'aws-s3', 'Amazon S3 & DynamoDB', 'Audit exports · NFT metadata lake\nTrust-score cache · batch index', '#0284C7'));

  // Tier 4: Algorand — Immutable Custody & Rewards
  elements.push(createTierFrame('tier-w4', 665, '04 · ALGORAND — IMMUTABLE CUSTODY & REWARDS', '#A855F7'));
  elements.push(createServiceNode('w-coc', 0, 665, 'tech-docker', 'Chain-of-Custody ASA', 'ARC-3 NFT · protocol-controlled transfers\nmintBatchId() → transferToProcessor()', '#A855F7'));
  elements.push(createServiceNode('w-trust', 1, 665, 'gen-microservice', 'Trust Score Registry', 'Smart-contract reputation score\nProven fraud → slashing / restrictions', '#A855F7'));
  elements.push(createServiceNode('w-epr', 2, 665, 'gen-cloud', 'EPR Certificate ASA', 'Fractional units · parent NFT lineage\nmintEPRCertificate() after processing', '#A855F7'));
  elements.push(createServiceNode('w-tok', 3, 665, 'db-redis', 'Green Utility Token ASA', 'Revenue-backed fungible rewards\n70% verifier & hub incentive fund', '#A855F7'));

  // Connectors
  elements.push(createConnector('cw-1', 'w-app', 'bottom', 'w-bag', 'top', 'Scan + capture', '#FB923C'));
  elements.push(createConnector('cw-2', 'w-dash', 'bottom', 'w-dual', 'top', 'Weigh + co-sign', '#FB923C'));
  elements.push(createConnector('cw-3', 'w-bag', 'right', 'w-dual', 'left', 'Batch identity', '#22C55E'));
  elements.push(createConnector('cw-4', 'w-dual', 'right', 'w-cv', 'left', 'Verify evidence', '#22C55E'));
  elements.push(createConnector('cw-5', 'w-cv', 'right', 'w-rec', 'left', 'Inference score', '#22C55E'));
  elements.push(createConnector('cw-6', 'w-rec', 'bottom', 'w-s3', 'top', 'Transfer proof', '#22C55E'));
  elements.push(createConnector('cw-7', 'w-dual', 'bottom', 'w-gw', 'top', 'Signed batch proof', '#22C55E'));
  elements.push(createConnector('cw-8', 'w-gw', 'right', 'w-lam', 'left', 'Authorized request', '#0284C7'));
  elements.push(createConnector('cw-9', 'w-lam', 'right', 'w-s3', 'left', 'Metadata persist', '#0284C7'));
  elements.push(createConnector('cw-10', 'w-lam', 'bottom', 'w-coc', 'top', 'Mint NFT batch', '#0284C7'));
  elements.push(createConnector('cw-11', 'w-coc', 'right', 'w-trust', 'left', 'Verified history', '#A855F7'));
  elements.push(createConnector('cw-12', 'w-trust', 'right', 'w-epr', 'left', 'Issuance policy', '#A855F7'));
  elements.push(createConnector('cw-13', 'w-epr', 'right', 'w-tok', 'left', '70% reward pool', '#A855F7'));

  const docMarkdown = `# Verdant Waste Tracking and Compliance Architecture

## Executive Summary
Verdant is an automated, decentralized compliance and chain-of-custody tracking platform designed for end-to-end municipal and industrial waste accountability.

## 4-Tier Topology
\`\`\`mermaid
flowchart TD
  subgraph T1["01 · CLIENT / USER INTERFACES"]
    App["Citizen & Picker Mobile App"]
    Dash["Hub Supervisor Dashboard"]
    Mkt["Brand Marketplace"]
    Map["DePIN Waste Map"]
  end
  subgraph T2["02 · PHYSICAL EDGE & VERIFICATION"]
    Bag["Tamper-Evident Bag"]
    Dual["Dual-Signature Verification"]
    CV["CV Waste Verification"]
    Rec["Recycler Processing Plant"]
  end
  subgraph T3["03 · AWS CLOUD ORCHESTRATION"]
    Cog["Amazon Cognito"]
    GW["API Gateway"]
    Lam["AWS Lambda"]
    S3["Amazon S3 / DynamoDB"]
  end
  subgraph T4["04 · ALGORAND IMMUTABLE CUSTODY"]
    ASA["Chain-of-Custody ASA"]
    Trust["Trust Score Registry"]
    EPR["EPR Certificate ASA"]
    Tok["Green Utility Token"]
  end
  App --> Bag
  Dash --> Dual
  Bag --> Dual --> CV --> Rec
  Dual --> GW --> Lam --> S3
  Lam --> ASA --> Trust --> EPR --> Tok
\`\`\`
`;

  return {
    message: 'Generated **Verdant Waste Tracking & Compliance Architecture** with 4 distinct tiers, 16 services, and orthogonal verification routing.',
    elements,
    docMarkdown,
    actionType: 'replace',
  };
}

// =============================================================================
// AUTONOMOUS WEB SCRAPER & AGENTIC ARCHITECTURE
// =============================================================================
function generateScraperArchitecture(): AIResponse {
  const elements: CanvasElement[] = [];

  elements.push(createMainFrame('Autonomous Web Scraping & Multi-Agent Intelligence Architecture'));

  elements.push(createTierFrame('tier-s1', 80, '01 · DISTRIBUTED CRAWLER & STEALTH INGESTION TIER', '#FB923C'));
  elements.push(createServiceNode('s-front', 0, 80, 'gen-server', 'Adaptive URL Frontier', 'Priority queue & rate limiting\nRobots.txt & domain cadence', '#FB923C'));
  elements.push(createServiceNode('s-proxy', 1, 80, 'infra-firewall', 'Stealth & Proxy Gateway', 'Residential IP rotating pool\nTLS fingerprint & UA spoofing', '#FB923C'));
  elements.push(createServiceNode('s-play', 2, 80, 'gen-browser', 'Headless Browser Cluster', 'Playwright / Chromium grid\nDynamic SPA & hydration wait', '#FB923C'));
  elements.push(createServiceNode('s-snap', 3, 80, 'aws-s3', 'DOM Snapshot Cache', 'Raw HTML & WebP snapshots\nSHA-256 deduplication cache', '#FB923C'));

  elements.push(createTierFrame('tier-s2', 275, '02 · NORMALIZATION & MULTIMODAL EXTRACTION TIER', '#22C55E'));
  elements.push(createServiceNode('s-chunk', 0, 275, 'db-redis', 'Semantic Chunker', 'Parent-child document chunks\nContext-boundary preservation', '#22C55E'));
  elements.push(createServiceNode('s-md', 1, 275, 'tech-python', 'LLM Markdown Engine', 'GFM table converter & headings\nPreserves semantic nesting', '#22C55E'));
  elements.push(createServiceNode('s-ocr', 2, 275, 'ai-vision', 'Vision & Multimodal OCR', 'Screenshot visual parser\nCharts, tables & pricing matrices', '#22C55E'));
  elements.push(createServiceNode('s-clean', 3, 275, 'gen-microservice', 'DOM Pruner & Cleanser', 'Readability container isolation\nCookie banners & boilerplate removal', '#22C55E'));

  elements.push(createTierFrame('tier-s3', 470, '03 · MULTI-AGENT SYNTHESIS & REASONING CORE', '#A855F7'));
  elements.push(createServiceNode('s-orch', 0, 470, 'ai-anthropic', 'Agent Orchestrator & Planner', 'Decomposes prompt into DAG\nCoordinates agent execution', '#A855F7'));
  elements.push(createServiceNode('s-ext', 1, 470, 'ai-openai', 'Entity Extraction Agent', 'Pydantic & Zod schemas\nStrict typed validation checks', '#A855F7'));
  elements.push(createServiceNode('s-ver', 2, 470, 'infra-firewall', 'Attribution Verifier Agent', 'Byte offset & XPath locator\nGuarantees zero hallucinations', '#A855F7'));
  elements.push(createServiceNode('s-crit', 3, 470, 'ai-meta', 'Self-Reflective Critic', 'Confidence threshold scoring\nEvaluates schema completeness', '#A855F7'));

  elements.push(createTierFrame('tier-s4', 665, '04 · PERSISTENCE, AUTO-HEALING & DOWNSTREAM AI INTEROP', '#0284C7'));
  elements.push(createServiceNode('s-models', 0, 665, 'gen-server', 'Downstream AI Models', 'Claude 3.7, GPT-4o, Grok, Llama\nTool calling & agentic consumption', '#0284C7'));
  elements.push(createServiceNode('s-gw', 1, 665, 'gen-cloud', 'Agentic JSON & SSE Gateway', 'Standardized envelope & metadata\nModel Context Protocol (MCP)', '#0284C7'));
  elements.push(createServiceNode('s-drift', 2, 665, 'tech-docker', 'Selector Drift Auto-Healer', 'Screenshot vs historical DOM\nAuto-synthesizes updated selectors', '#0284C7'));
  elements.push(createServiceNode('s-vec', 3, 665, 'db-postgres', 'pgvector & Knowledge Lake', 'Dense & sparse BM25 search\nImmutable temporal snapshot lake', '#0284C7'));

  // Connectors
  elements.push(createConnector('cs-1', 's-front', 'right', 's-proxy', 'left', 'dispatch target URLs', '#FB923C'));
  elements.push(createConnector('cs-2', 's-proxy', 'right', 's-play', 'left', 'stealth residential proxy', '#FB923C'));
  elements.push(createConnector('cs-3', 's-play', 'right', 's-snap', 'left', 'store raw DOM & WebP', '#FB923C'));
  elements.push(createConnector('cs-4', 's-snap', 'bottom', 's-clean', 'top', 'feed unparsed HTML', '#22C55E'));
  elements.push(createConnector('cs-5', 's-clean', 'left', 's-ocr', 'right', 'screenshot for OCR', '#22C55E', true));
  elements.push(createConnector('cs-6', 's-clean', 'bottom', 's-md', 'bottom', 'pruned clean AST', '#22C55E'));
  elements.push(createConnector('cs-7', 's-md', 'left', 's-chunk', 'right', 'tokenized markdown', '#22C55E'));
  elements.push(createConnector('cs-8', 's-chunk', 'bottom', 's-orch', 'top', 'structured context blocks', '#A855F7'));
  elements.push(createConnector('cs-9', 's-orch', 'right', 's-ext', 'left', 'assign schema goals', '#A855F7'));
  elements.push(createConnector('cs-10', 's-ext', 'right', 's-ver', 'left', 'extracted candidates', '#A855F7'));
  elements.push(createConnector('cs-11', 's-ver', 'right', 's-crit', 'left', 'grounded source claims', '#A855F7'));
  elements.push(createConnector('cs-12', 's-crit', 'top', 's-orch', 'top', 'confidence < 0.90 (retry DAG)', '#C084FC', true));
  elements.push(createConnector('cs-13', 's-crit', 'bottom', 's-vec', 'top', 'certified knowledge output', '#0284C7'));
  elements.push(createConnector('cs-14', 's-vec', 'left', 's-drift', 'right', 'ground-truth benchmarks', '#0284C7'));
  elements.push(createConnector('cs-15', 's-drift', 'left', 's-gw', 'right', 'verified JSON schemas', '#0284C7'));
  elements.push(createConnector('cs-16', 's-gw', 'left', 's-models', 'right', 'stream JSON & MCP payload', '#0284C7'));
  elements.push(createConnector('cs-17', 's-drift', 'top', 's-front', 'bottom', 'auto-healed DOM selectors', '#F59E0B', true));
  elements.push(createConnector('cs-18', 's-models', 'top', 's-orch', 'bottom', 'model feedback telemetry', '#38BDF8', true));

  return {
    message: 'Generated **Autonomous Web Scraping & Multi-Agent Architecture** with 4 tiers, 16 services, and clean vertical transitions.',
    elements,
    actionType: 'replace',
  };
}

// =============================================================================
// ENTERPRISE RAG & LLM ORCHESTRATION ARCHITECTURE
// =============================================================================
function generateRAGArchitecture(): AIResponse {
  const elements: CanvasElement[] = [];

  elements.push(createMainFrame('Enterprise RAG & Autonomous Agent Knowledge Pipeline'));

  elements.push(createTierFrame('tier-r1', 80, '01 · CLIENT & INGESTION INTERFACES', '#FB923C'));
  elements.push(createServiceNode('r-client', 0, 80, 'gen-browser', 'Interactive Chat Interface', 'Next.js 15 / React UI · token stream\nMulti-turn conversation history', '#FB923C'));
  elements.push(createServiceNode('r-guard', 1, 80, 'infra-firewall', 'Prompt Injection Guard', 'Llama-Guard / NeMo Rails filter\nPII redaction & jailbreak prevention', '#FB923C'));
  elements.push(createServiceNode('r-router', 2, 80, 'gen-microservice', 'Intent & Semantic Router', 'Semantic cache check · vector vs web\nTask decomposition & prompt planner', '#FB923C'));
  elements.push(createServiceNode('r-docs', 3, 80, 'aws-s3', 'Document Ingestion Worker', 'PDF, Notion, Confluence, GitHub\nAuto-extract & change detection', '#FB923C'));

  elements.push(createTierFrame('tier-r2', 275, '02 · EMBEDDINGS & RETRIEVAL PIPELINE', '#22C55E'));
  elements.push(createServiceNode('r-chunker', 0, 275, 'tech-python', 'Recursive Semantic Chunker', 'Contextual document windowing\n512-token overlap boundaries', '#22C55E'));
  elements.push(createServiceNode('r-embed', 1, 275, 'ai-openai', 'Embedding Model Cluster', 'text-embedding-3-large (3072d)\nBatch embedding queue worker', '#22C55E'));
  elements.push(createServiceNode('r-rerank', 2, 275, 'ai-anthropic', 'Cross-Encoder Re-Ranker', 'Cohere Rerank v3 · top-k scoring\nContextual compression & deduplication', '#22C55E'));
  elements.push(createServiceNode('r-vec', 3, 275, 'db-postgres', 'pgvector & Qdrant Hybrid Index', 'Dense HNSW + sparse BM25 search\nSub-second retrieval over 10M vectors', '#22C55E'));

  elements.push(createTierFrame('tier-r3', 470, '03 · MULTI-AGENT SYNTHESIS & REASONING CORE', '#A855F7'));
  elements.push(createServiceNode('r-orch', 0, 470, 'gen-microservice', 'Agentic Orchestration Engine', 'LangGraph / AutoGen workflow DAG\nTool execution & multi-agent debate', '#A855F7'));
  elements.push(createServiceNode('r-llm', 1, 470, 'ai-openai', 'Primary Reasoning Model', 'Claude 3.7 Sonnet / GPT-4o\nContext window synthesis with citations', '#A855F7'));
  elements.push(createServiceNode('r-tools', 2, 470, 'tech-docker', 'Sandboxed Code & Tool Sandbox', 'E2B secure Python execution sandbox\nSQL query execution & API calls', '#A855F7'));
  elements.push(createServiceNode('r-eval', 3, 470, 'ai-meta', 'Self-Reflective Critic & Verifier', 'Ragas evaluation · Hallucination check\nAnswer relevancy & ground truth metric', '#A855F7'));

  elements.push(createTierFrame('tier-r4', 665, '04 · PERSISTENCE, CACHE & OBSERVABILITY', '#0284C7'));
  elements.push(createServiceNode('r-cache', 0, 665, 'db-redis', 'Redis Semantic Response Cache', 'Cosine similarity prompt match\nInstant responses for recurring queries', '#0284C7'));
  elements.push(createServiceNode('r-sql', 1, 665, 'db-postgres', 'Relational Session Database', 'PostgreSQL · user telemetry & ratings\nFine-tuning ground truth dataset lake', '#0284C7'));
  elements.push(createServiceNode('r-telemetry', 2, 665, 'gen-cloud', 'Langfuse / Arize Observability', 'End-to-end token latency traces\nCost attribution & drift detection', '#0284C7'));
  elements.push(createServiceNode('r-gateway', 3, 665, 'aws-api-gateway', 'Streaming SSE Gateway', 'Chunked transfer encoding\nStandardized OpenAI API compatibility', '#0284C7'));

  // Connectors
  elements.push(createConnector('cr-1', 'r-client', 'right', 'r-guard', 'left', 'user prompt', '#FB923C'));
  elements.push(createConnector('cr-2', 'r-guard', 'right', 'r-router', 'left', 'clean prompt', '#FB923C'));
  elements.push(createConnector('cr-3', 'r-router', 'right', 'r-docs', 'left', 'sync new data', '#FB923C'));
  elements.push(createConnector('cr-4', 'r-docs', 'bottom', 'r-vec', 'top', 'raw document dump', '#22C55E'));
  elements.push(createConnector('cr-5', 'r-vec', 'left', 'r-rerank', 'right', 'top-50 candidates', '#22C55E'));
  elements.push(createConnector('cr-6', 'r-rerank', 'left', 'r-embed', 'right', 're-scored chunks', '#22C55E'));
  elements.push(createConnector('cr-7', 'r-embed', 'left', 'r-chunker', 'right', 'vector embeddings', '#22C55E'));
  elements.push(createConnector('cr-8', 'r-chunker', 'bottom', 'r-orch', 'top', 'ranked context blocks', '#A855F7'));
  elements.push(createConnector('cr-9', 'r-orch', 'right', 'r-llm', 'left', 'context + instruction', '#A855F7'));
  elements.push(createConnector('cr-10', 'r-llm', 'right', 'r-tools', 'left', 'execute tool calls', '#A855F7'));
  elements.push(createConnector('cr-11', 'r-tools', 'right', 'r-eval', 'left', 'tool output data', '#A855F7'));
  elements.push(createConnector('cr-12', 'r-eval', 'bottom', 'r-gateway', 'top', 'certified response', '#0284C7'));
  elements.push(createConnector('cr-13', 'r-gateway', 'left', 'r-telemetry', 'right', 'token latency traces', '#0284C7'));
  elements.push(createConnector('cr-14', 'r-telemetry', 'left', 'r-sql', 'right', 'audit log telemetry', '#0284C7'));
  elements.push(createConnector('cr-15', 'r-sql', 'left', 'r-cache', 'right', 'warm cache key', '#0284C7'));
  elements.push(createConnector('cr-16', 'r-cache', 'top', 'r-client', 'bottom', 'instant cache hits', '#10B981', true));

  return {
    message: 'Generated **Enterprise RAG & AI Agent Architecture** with 4 tiers, 16 services, and orthogonal data flow.',
    elements,
    actionType: 'replace',
  };
}

// =============================================================================
// AWS SERVERLESS ARCHITECTURE (Modeled after Enterprise Cloud Standards)
// =============================================================================
function generateAWSServerlessArchitecture(): AIResponse {
  const elements: CanvasElement[] = [];

  elements.push(createMainFrame('AWS Serverless Enterprise Cloud Architecture'));

  elements.push(createTierFrame('tier-a1', 80, '01 · EDGE & CLIENT INGESTION', '#FB923C'));
  elements.push(createServiceNode('a-web', 0, 80, 'gen-browser', 'Global Web & Mobile App', 'React / Next.js SPA clients\nEnd-user traffic & telemetry', '#FB923C'));
  elements.push(createServiceNode('a-route', 1, 80, 'aws-route53', 'Amazon Route 53 & WAF', 'Latency-based DNS routing\nDDoS protection & rate limiting', '#FB923C'));
  elements.push(createServiceNode('a-cf', 2, 80, 'aws-cloudfront', 'Amazon CloudFront CDN', 'Global Edge caching (300+ PoPs)\nTLS termination & HTTP/3 support', '#FB923C'));
  elements.push(createServiceNode('a-s3static', 3, 80, 'aws-s3', 'S3 Origin Bucket', 'Immutable static web bundle hosting\nVersioning & replication enabled', '#FB923C'));

  elements.push(createTierFrame('tier-a2', 275, '02 · AUTHENTICATION & API ROUTING', '#22C55E'));
  elements.push(createServiceNode('a-cog', 0, 275, 'aws-cognito', 'Amazon Cognito User Pool', 'OAuth2 / OIDC JWT token authority\nMFA & SAML SSO identity federation', '#22C55E'));
  elements.push(createServiceNode('a-gw', 1, 275, 'aws-api-gateway', 'HTTP & WebSocket API Gateway', 'Request validation & throttling\nCustom Lambda authorizer verification', '#22C55E'));
  elements.push(createServiceNode('a-step', 2, 275, 'aws-step-functions', 'AWS Step Functions State Machine', 'Express workflow orchestration\nDistributed saga pattern & error catch', '#22C55E'));
  elements.push(createServiceNode('a-evb', 3, 275, 'aws-eventbridge', 'Amazon EventBridge Event Bus', 'Decoupled domain event routing\nSchema registry & rule filtering', '#22C55E'));

  elements.push(createTierFrame('tier-a3', 470, '03 · SERVERLESS COMPUTE & TASK WORKERS', '#A855F7'));
  elements.push(createServiceNode('a-lam1', 0, 470, 'aws-lambda', 'Order & Cart Microservice', 'ARM64 Graviton3 Lambda functions\nSub-50ms cold start latency', '#A855F7'));
  elements.push(createServiceNode('a-lam2', 1, 470, 'aws-lambda', 'Payment & Checkout Worker', 'PCI-DSS compliant serverless worker\nIdempotent execution with DynamoDB', '#A855F7'));
  elements.push(createServiceNode('a-sqs', 2, 470, 'aws-sqs', 'Amazon SQS FIFO Queues', 'Dead-letter queue (DLQ) support\nBuffer spikes and smooth workloads', '#A855F7'));
  elements.push(createServiceNode('a-sns', 3, 470, 'aws-sns', 'Amazon SNS Notification Hub', 'Fan-out event pub/sub\nSMS, Email & webhook delivery', '#A855F7'));

  elements.push(createTierFrame('tier-a4', 665, '04 · PERSISTENT DATA & OBSERVABILITY', '#0284C7'));
  elements.push(createServiceNode('a-dyn', 0, 665, 'aws-dynamodb', 'Amazon DynamoDB Global Table', 'Single-digit millisecond latency\nPoint-in-time recovery & auto-scale', '#0284C7'));
  elements.push(createServiceNode('a-aur', 1, 665, 'db-postgres', 'Aurora Serverless v2 PostgreSQL', 'ACID financial records store\nZero-to-N auto-scaling compute', '#0284C7'));
  elements.push(createServiceNode('a-s3lake', 2, 665, 'aws-s3', 'Amazon S3 Parquet Lakehouse', 'Athena SQL queries on analytical data\nTiered lifecycle storage rules', '#0284C7'));
  elements.push(createServiceNode('a-cw', 3, 665, 'aws-cloudwatch', 'CloudWatch & X-Ray Distributed Tracing', 'Structured JSON logs & metrics alarms\nEnd-to-end service map visualization', '#0284C7'));

  // Connectors
  elements.push(createConnector('ca-1', 'a-web', 'right', 'a-route', 'left', 'DNS request', '#FB923C'));
  elements.push(createConnector('ca-2', 'a-route', 'right', 'a-cf', 'left', 'route to edge', '#FB923C'));
  elements.push(createConnector('ca-3', 'a-cf', 'right', 'a-s3static', 'left', 'cache static assets', '#FB923C'));
  elements.push(createConnector('ca-4', 'a-s3static', 'bottom', 'a-evb', 'top', 'asset update triggers', '#22C55E'));
  elements.push(createConnector('ca-5', 'a-evb', 'left', 'a-step', 'right', 'publish event', '#22C55E'));
  elements.push(createConnector('ca-6', 'a-step', 'left', 'a-gw', 'right', 'execute workflow', '#22C55E'));
  elements.push(createConnector('ca-7', 'a-gw', 'left', 'a-cog', 'right', 'verify JWT auth', '#22C55E'));
  elements.push(createConnector('ca-8', 'a-cog', 'bottom', 'a-lam1', 'top', 'authorized payload', '#A855F7'));
  elements.push(createConnector('ca-9', 'a-lam1', 'right', 'a-lam2', 'left', 'invoke checkout', '#A855F7'));
  elements.push(createConnector('ca-10', 'a-lam2', 'right', 'a-sqs', 'left', 'enqueue transaction', '#A855F7'));
  elements.push(createConnector('ca-11', 'a-sqs', 'right', 'a-sns', 'left', 'trigger notifications', '#A855F7'));
  elements.push(createConnector('ca-12', 'a-sns', 'bottom', 'a-cw', 'top', 'log event audit', '#0284C7'));
  elements.push(createConnector('ca-13', 'a-cw', 'left', 'a-s3lake', 'right', 'metric alarms', '#0284C7'));
  elements.push(createConnector('ca-14', 'a-s3lake', 'left', 'a-aur', 'right', 'sync analytical data', '#0284C7'));
  elements.push(createConnector('ca-15', 'a-aur', 'left', 'a-dyn', 'right', 'reconcile state', '#0284C7'));

  return {
    message: 'Generated **AWS Serverless Enterprise Cloud Architecture** with 4 tiers, 16 AWS services, and orthogonal routing.',
    elements,
    actionType: 'replace',
  };
}

// =============================================================================
// CLOUD-NATIVE KUBERNETES ARCHITECTURE
// =============================================================================
function generateK8sArchitecture(): AIResponse {
  const elements: CanvasElement[] = [];

  elements.push(createMainFrame('Cloud-Native Kubernetes Microservices Topology'));

  elements.push(createTierFrame('tier-k1', 80, '01 · INGRESS & EDGE TRAFFIC CONTROL', '#FB923C'));
  elements.push(createServiceNode('k-dns', 0, 80, 'gen-cloud', 'External DNS & Anycast Edge', 'BGP Anycast IP routing\nDDoS scrubbing & global CDN', '#FB923C'));
  elements.push(createServiceNode('k-cert', 1, 80, 'infra-firewall', 'cert-manager (Let\'s Encrypt)', 'Automated ACME TLS certificate lifecycle\nIngress secret rotation', '#FB923C'));
  elements.push(createServiceNode('k-ing', 2, 80, 'tech-docker', 'Nginx Ingress Controller', 'Path & host-based routing\nRate limiting & TLS termination', '#FB923C'));
  elements.push(createServiceNode('k-mesh', 3, 80, 'gen-microservice', 'Istio Service Mesh Gateway', 'mTLS service-to-service encryption\nCanary deployment traffic splitting', '#FB923C'));

  elements.push(createTierFrame('tier-k2', 275, '02 · CORE K8S MICROSERVICES & WORKERS', '#22C55E'));
  elements.push(createServiceNode('k-auth', 0, 275, 'gen-server', 'Auth & Identity Pods (x4)', 'Go microservice with Casbin RBAC\nOAuth2 / OpenID Connect tokens', '#22C55E'));
  elements.push(createServiceNode('k-api', 1, 275, 'tech-python', 'Core Business API Pods (x8)', 'FastAPI / Node.js container fleet\nHorizontal Pod Autoscaler (HPA) attached', '#22C55E'));
  elements.push(createServiceNode('k-worker', 2, 275, 'tech-docker', 'Background Worker DaemonSet', 'Async job processor with Celery\nGPU-accelerated ML task nodes', '#22C55E'));
  elements.push(createServiceNode('k-hpa', 3, 275, 'gen-microservice', 'Cluster Autoscaler & Karpenter', 'Dynamic node provisioning on demand\nSpot instance cost optimization', '#22C55E'));

  elements.push(createTierFrame('tier-k3', 470, '03 · CACHE, QUEUE & STATEFUL OPERATORS', '#A855F7'));
  elements.push(createServiceNode('k-red', 0, 470, 'db-redis', 'Redis Sentinel Cluster (HA)', 'In-memory session state & caching\nAutomatic master failover within 2s', '#A855F7'));
  elements.push(createServiceNode('k-kaf', 1, 470, 'db-kafka', 'Strimzi Kafka Cluster (x3)', 'Event-driven message bus on NVMe\nPersistentVolumeClaim storage bound', '#A855F7'));
  elements.push(createServiceNode('k-pg', 2, 470, 'db-postgres', 'CloudNativePG PostgreSQL (HA)', 'Primary-replica streaming replication\nAutomated wal-g backups to S3', '#A855F7'));
  elements.push(createServiceNode('k-s3', 3, 470, 'aws-s3', 'MinIO Object Storage Operator', 'S3-compatible distributed storage\nHigh-throughput artifact blob store', '#A855F7'));

  elements.push(createTierFrame('tier-k4', 665, '04 · OBSERVABILITY & GITOPs PIPELINE', '#0284C7'));
  elements.push(createServiceNode('k-argo', 0, 665, 'tech-docker', 'ArgoCD GitOps Controller', 'Declarative continuous sync from git\nZero-downtime blue/green rollouts', '#0284C7'));
  elements.push(createServiceNode('k-prom', 1, 665, 'gen-cloud', 'Prometheus & Alertmanager', 'Metrics scraper (cAdvisor, kube-state)\nSLO alerts to PagerDuty & Slack', '#0284C7'));
  elements.push(createServiceNode('k-graf', 2, 665, 'gen-browser', 'Grafana Dashboard Suite', 'Pre-baked Kubernetes monitoring\nPod CPU, memory & network dashboards', '#0284C7'));
  elements.push(createServiceNode('k-loki', 3, 665, 'db-postgres', 'Loki & Tempo Distributed Tracing', 'Log aggregation without full indexing\nOpenTelemetry distributed trace graphs', '#0284C7'));

  // Connectors
  elements.push(createConnector('ck-1', 'k-dns', 'right', 'k-cert', 'left', 'resolve domain', '#FB923C'));
  elements.push(createConnector('ck-2', 'k-cert', 'right', 'k-ing', 'left', 'TLS certificate', '#FB923C'));
  elements.push(createConnector('ck-3', 'k-ing', 'right', 'k-mesh', 'left', 'ingress routing', '#FB923C'));
  elements.push(createConnector('ck-4', 'k-mesh', 'bottom', 'k-hpa', 'top', 'traffic load metrics', '#22C55E'));
  elements.push(createConnector('ck-5', 'k-hpa', 'left', 'k-worker', 'right', 'scale up worker nodes', '#22C55E'));
  elements.push(createConnector('ck-6', 'k-worker', 'left', 'k-api', 'right', 'async jobs', '#22C55E'));
  elements.push(createConnector('ck-7', 'k-api', 'left', 'k-auth', 'right', 'validate auth token', '#22C55E'));
  elements.push(createConnector('ck-8', 'k-auth', 'bottom', 'k-red', 'top', 'session token lookup', '#A855F7'));
  elements.push(createConnector('ck-9', 'k-red', 'right', 'k-kaf', 'left', 'publish change events', '#A855F7'));
  elements.push(createConnector('ck-10', 'k-kaf', 'right', 'k-pg', 'left', 'event stream ingest', '#A855F7'));
  elements.push(createConnector('ck-11', 'k-pg', 'right', 'k-s3', 'left', 'write snapshot dump', '#A855F7'));
  elements.push(createConnector('ck-12', 'k-s3', 'bottom', 'k-loki', 'top', 'persist log chunks', '#0284C7'));
  elements.push(createConnector('ck-13', 'k-loki', 'left', 'k-graf', 'right', 'query log queries', '#0284C7'));
  elements.push(createConnector('ck-14', 'k-graf', 'left', 'k-prom', 'right', 'render metric panels', '#0284C7'));
  elements.push(createConnector('ck-15', 'k-prom', 'left', 'k-argo', 'right', 'health gate status', '#0284C7'));

  return {
    message: 'Generated **Cloud-Native Kubernetes Microservices Topology** with 4 tiers, 16 services, and orthogonal routing.',
    elements,
    actionType: 'replace',
  };
}

// =============================================================================
// AUTHENTICATION & ZERO-TRUST SECURITY ARCHITECTURE
// =============================================================================
function generateAuthArchitecture(): AIResponse {
  const elements: CanvasElement[] = [];

  elements.push(createMainFrame('Zero-Trust Identity & Access Management (IAM) Architecture'));

  elements.push(createTierFrame('tier-au1', 80, '01 · CLIENT & IDENTITY CHALLENGE LAYER', '#FB923C'));
  elements.push(createServiceNode('au-cli', 0, 80, 'gen-browser', 'Client Application (Web/Mobile)', 'SPA / React Native / CLI terminal\nPKCE Authorization Code Flow', '#FB923C'));
  elements.push(createServiceNode('au-waf', 1, 80, 'infra-firewall', 'Web Application Firewall & WAF', 'IP reputation & bot prevention\nCredential stuffing rate-limits', '#FB923C'));
  elements.push(createServiceNode('au-idp', 2, 80, 'gen-server', 'Identity Provider (IdP / Okta)', 'Universal login & OIDC Discovery\nGoogle / GitHub / SAML social federation', '#FB923C'));
  elements.push(createServiceNode('au-mfa', 3, 80, 'gen-cloud', 'WebAuthn / FIDO2 MFA Hub', 'Hardware security keys (YubiKey)\nTOTP & biometric passkey challenge', '#FB923C'));

  elements.push(createTierFrame('tier-au2', 275, '02 · TOKEN AUTHORITY & SESSION ENGINE', '#22C55E'));
  elements.push(createServiceNode('au-jwt', 0, 275, 'gen-microservice', 'JWT Token Minting Authority', 'RS256 asymmetric signature minting\n15-min short-lived access tokens', '#22C55E'));
  elements.push(createServiceNode('au-ref', 1, 275, 'db-redis', 'Redis Refresh Token Store', 'One-time refresh token rotation\nInstant session revocation blacklist', '#22C55E'));
  elements.push(createServiceNode('au-jwks', 2, 275, 'aws-s3', 'Public JWKS Endpoint', 'Cached JSON Web Key Set (.well-known)\nZero-downtime key rotation pair', '#22C55E'));
  elements.push(createServiceNode('au-pdp', 3, 275, 'tech-docker', 'OPA Policy Engine (PDP)', 'Open Policy Agent fine-grained ABAC\nTenancy & permission evaluation', '#22C55E'));

  elements.push(createTierFrame('tier-au3', 470, '03 · PROTECTED MICROSERVICES & GATEWAYS', '#A855F7'));
  elements.push(createServiceNode('au-gw', 0, 470, 'aws-api-gateway', 'Kong API Gateway (PEP)', 'Local JWKS cryptographic validation\nZero database calls on happy paths', '#A855F7'));
  elements.push(createServiceNode('au-srv1', 1, 470, 'gen-microservice', 'Users & Tenant Microservice', 'User profiles, teams & organizations\nRole assignment & SCIM directory sync', '#A855F7'));
  elements.push(createServiceNode('au-srv2', 2, 470, 'gen-microservice', 'Billing & Financial Service', 'Stripe customer binding & tier grants\nStrict scope: billing.admin required', '#A855F7'));
  elements.push(createServiceNode('au-srv3', 3, 470, 'gen-microservice', 'Enterprise Audit Trail Service', 'Immutable tamper-evident event log\nSOC2 / HIPAA compliance records', '#A855F7'));

  elements.push(createTierFrame('tier-au4', 665, '04 · PERSISTENCE & SECURITY OBSERVABILITY', '#0284C7'));
  elements.push(createServiceNode('au-db', 0, 665, 'db-postgres', 'Encrypted Credentials Store', 'Argon2id password hashes with salt\nColumn-level AES-256 GCM encryption', '#0284C7'));
  elements.push(createServiceNode('au-siem', 1, 665, 'gen-cloud', 'Datadog SIEM & Threat Intel', 'Impossible travel anomaly alerts\nBrute-force account lock triggers', '#0284C7'));
  elements.push(createServiceNode('au-kms', 2, 665, 'infra-firewall', 'AWS KMS / HashiCorp Vault', 'Hardware Security Module (HSM) keys\nEnvelope encryption & secret leases', '#0284C7'));
  elements.push(createServiceNode('au-lake', 3, 665, 'aws-s3', 'Long-Term Audit Log Lake', 'S3 Glacier Object Lock compliance lake\n7-year immutable retention policy', '#0284C7'));

  // Connectors
  elements.push(createConnector('cau-1', 'au-cli', 'right', 'au-waf', 'left', 'authorization request', '#FB923C'));
  elements.push(createConnector('cau-2', 'au-waf', 'right', 'au-idp', 'left', 'filtered request', '#FB923C'));
  elements.push(createConnector('cau-3', 'au-idp', 'right', 'au-mfa', 'left', 'trigger FIDO2 passkey', '#FB923C'));
  elements.push(createConnector('cau-4', 'au-mfa', 'bottom', 'au-pdp', 'top', 'MFA verified challenge', '#22C55E'));
  elements.push(createConnector('cau-5', 'au-pdp', 'left', 'au-jwks', 'right', 'evaluate policy', '#22C55E'));
  elements.push(createConnector('cau-6', 'au-jwks', 'left', 'au-ref', 'right', 'publish public keys', '#22C55E'));
  elements.push(createConnector('cau-7', 'au-ref', 'left', 'au-jwt', 'right', 'rotate refresh token', '#22C55E'));
  elements.push(createConnector('cau-8', 'au-jwt', 'bottom', 'au-gw', 'top', 'signed JWT access token', '#A855F7'));
  elements.push(createConnector('cau-9', 'au-gw', 'right', 'au-srv1', 'left', 'route verified call', '#A855F7'));
  elements.push(createConnector('cau-10', 'au-srv1', 'right', 'au-srv2', 'left', 'mTLS downstream call', '#A855F7'));
  elements.push(createConnector('cau-11', 'au-srv2', 'right', 'au-srv3', 'left', 'emit compliance event', '#A855F7'));
  elements.push(createConnector('cau-12', 'au-srv3', 'bottom', 'au-lake', 'top', 'immutable archival', '#0284C7'));
  elements.push(createConnector('cau-13', 'au-lake', 'left', 'au-kms', 'right', 'envelope encryption', '#0284C7'));
  elements.push(createConnector('cau-14', 'au-kms', 'left', 'au-siem', 'right', 'audit key usage', '#0284C7'));
  elements.push(createConnector('cau-15', 'au-siem', 'left', 'au-db', 'right', 'flag anomaly access', '#0284C7'));

  return {
    message: 'Generated **Zero-Trust IAM & Security Architecture** with 4 tiers, 16 services, and orthogonal routing.',
    elements,
    actionType: 'replace',
  };
}

// =============================================================================
// EVENT-DRIVEN STREAMING & CQRS ARCHITECTURE
// =============================================================================
function generateEventDrivenArchitecture(): AIResponse {
  const elements: CanvasElement[] = [];

  elements.push(createMainFrame('Event-Driven Streaming & CQRS Architecture'));

  elements.push(createTierFrame('tier-e1', 80, '01 · EVENT PRODUCERS & COMMAND INGESTION', '#FB923C'));
  elements.push(createServiceNode('e-api', 0, 80, 'gen-server', 'Command REST API Gateway', 'Accepts user commands (POST/PUT)\nValidates schemas & returns 202 Accepted', '#FB923C'));
  elements.push(createServiceNode('e-cdc', 1, 80, 'tech-docker', 'Debezium CDC Connector', 'Postgres write-ahead-log (WAL) capture\nZero-delay database event streaming', '#FB923C'));
  elements.push(createServiceNode('e-iot', 2, 80, 'gen-cloud', 'MQTT / IoT Edge Ingestion', 'High-velocity telemetry streams\n100,000 events/sec message ingress', '#FB923C'));
  elements.push(createServiceNode('e-sch', 3, 80, 'gen-microservice', 'Confluent Schema Registry', 'Avro / Protobuf contract enforcement\nBackward & forward compatibility checks', '#FB923C'));

  elements.push(createTierFrame('tier-e2', 275, '02 · DISTRIBUTED EVENT LOG & BROKER CLUSTER', '#22C55E'));
  elements.push(createServiceNode('e-kaf', 0, 275, 'db-kafka', 'Apache Kafka Broker Cluster', 'Multi-partition append-only commit log\n3x replication with in-sync replicas (ISR)', '#22C55E'));
  elements.push(createServiceNode('e-flink', 1, 275, 'tech-docker', 'Apache Flink Stream Processor', 'Stateful stream analytics & windowing\nTumbling 5-min aggregation calculations', '#22C55E'));
  elements.push(createServiceNode('e-dlq', 2, 275, 'aws-sqs', 'Dead Letter Queue (DLQ) & Retry', 'Failed poison pill message isolation\nExponential backoff retry orchestrator', '#22C55E'));
  elements.push(createServiceNode('e-red', 3, 275, 'db-redis', 'Redis Real-Time State Cache', 'Sub-millisecond sliding window counters\nRate limiting & deduplication keys', '#22C55E'));

  elements.push(createTierFrame('tier-e3', 470, '03 · CONSUMER MICROSERVICES & CQRS READ PROJECTIONS', '#A855F7'));
  elements.push(createServiceNode('e-ord', 0, 470, 'gen-microservice', 'Order Processing Consumer', 'Consumer group with idempotent handler\nUpdates order states & inventory leases', '#A855F7'));
  elements.push(createServiceNode('e-bill', 1, 470, 'gen-microservice', 'Billing & Invoice Worker', 'Stripe payment capture on order.created\nPDF invoice generation & email dispatch', '#A855F7'));
  elements.push(createServiceNode('e-proj', 2, 470, 'tech-python', 'CQRS Read View Projector', 'Builds denormalized materialized views\nOptimized for sub-10ms UI reads', '#A855F7'));
  elements.push(createServiceNode('e-push', 3, 470, 'gen-cloud', 'Real-Time WebSocket Gateway', 'Socket.io / SSE push to connected clients\nInstant frontend order state sync', '#A855F7'));

  elements.push(createTierFrame('tier-e4', 665, '04 · PERSISTENT STORES & ANALYTICS LAKEHOUSE', '#0284C7'));
  elements.push(createServiceNode('e-pg', 0, 665, 'db-postgres', 'PostgreSQL (Write Database)', 'Single source of truth write model\nACID compliance with row-level locks', '#0284C7'));
  elements.push(createServiceNode('e-es', 1, 665, 'db-postgres', 'Elasticsearch / OpenSearch (Read)', 'Full-text faceted search & autocomplete\nDenormalized read-optimized catalog', '#0284C7'));
  elements.push(createServiceNode('e-lake', 2, 665, 'aws-s3', 'Iceberg / Delta Lakehouse on S3', 'Parquet columnar analytical lakehouse\nDuckDB & Trino ad-hoc SQL queries', '#0284C7'));
  elements.push(createServiceNode('e-graf', 3, 665, 'gen-browser', 'Grafana Business Dashboard', 'Real-time GMV, conversion & throughput\nLive stream lag monitoring', '#0284C7'));

  // Connectors
  elements.push(createConnector('ce-1', 'e-api', 'right', 'e-cdc', 'left', 'write command', '#FB923C'));
  elements.push(createConnector('ce-2', 'e-cdc', 'right', 'e-iot', 'left', 'CDC WAL capture', '#FB923C'));
  elements.push(createConnector('ce-3', 'e-iot', 'right', 'e-sch', 'left', 'validate schema', '#FB923C'));
  elements.push(createConnector('ce-4', 'e-sch', 'bottom', 'e-red', 'top', 'validated event', '#22C55E'));
  elements.push(createConnector('ce-5', 'e-red', 'left', 'e-dlq', 'right', 'dedup check', '#22C55E'));
  elements.push(createConnector('ce-6', 'e-dlq', 'left', 'e-flink', 'right', 'unhandled failures', '#22C55E', true));
  elements.push(createConnector('ce-7', 'e-flink', 'left', 'e-kaf', 'right', 'stateful stream join', '#22C55E'));
  elements.push(createConnector('ce-8', 'e-kaf', 'bottom', 'e-ord', 'top', 'consumer group partition', '#A855F7'));
  elements.push(createConnector('ce-9', 'e-ord', 'right', 'e-bill', 'left', 'order.paid event', '#A855F7'));
  elements.push(createConnector('ce-10', 'e-bill', 'right', 'e-proj', 'left', 'invoice.issued event', '#A855F7'));
  elements.push(createConnector('ce-11', 'e-proj', 'right', 'e-push', 'left', 'push live updates', '#A855F7'));
  elements.push(createConnector('ce-12', 'e-push', 'bottom', 'e-graf', 'top', 'live client telemetry', '#0284C7'));
  elements.push(createConnector('ce-13', 'e-graf', 'left', 'e-lake', 'right', 'aggregate metrics', '#0284C7'));
  elements.push(createConnector('ce-14', 'e-lake', 'left', 'e-es', 'right', 'batch index sync', '#0284C7'));
  elements.push(createConnector('ce-15', 'e-es', 'left', 'e-pg', 'right', 'read/write sync', '#0284C7'));

  return {
    message: 'Generated **Event-Driven Streaming & CQRS Architecture** with 4 tiers, 16 services, and orthogonal routing.',
    elements,
    actionType: 'replace',
  };
}

// =============================================================================
// DYNAMIC MULTI-TIER CUSTOM ARCHITECTURE (Synthesizes any custom prompt)
// =============================================================================
function generateCustomArchitecture(prompt: string): AIResponse {
  const p = prompt.toLowerCase();
  const elements: CanvasElement[] = [];

  const mainTitle = `${prompt.slice(0, 48).trim().replace(/^./, (c) => c.toUpperCase())} Architecture`;
  elements.push(createMainFrame(mainTitle));

  // Determine domain icons & labels based on prompt keywords
  const isEcommerce = p.includes('shop') || p.includes('cart') || p.includes('pay') || p.includes('order');
  const isFinance = p.includes('bank') || p.includes('fintech') || p.includes('crypto') || p.includes('trade');
  const isMedia = p.includes('video') || p.includes('audio') || p.includes('stream') || p.includes('content');

  // Tier 1
  elements.push(createTierFrame('tier-c1', 80, '01 · CLIENT & INGESTION TIER', '#FB923C'));
  elements.push(createServiceNode('c-node1', 0, 80, 'gen-browser', isEcommerce ? 'Storefront Web App' : isFinance ? 'Trading Web Client' : 'Client Interface', 'React / Next.js SPA\nGlobal CDN edge delivery', '#FB923C'));
  elements.push(createServiceNode('c-node2', 1, 80, 'gen-server', isEcommerce ? 'Mobile Checkout App' : isFinance ? 'Mobile Trader App' : 'Mobile Client', 'iOS & Android Native / PWA\nBiometric authentication', '#FB923C'));
  elements.push(createServiceNode('c-node3', 2, 80, 'infra-firewall', 'API Security & WAF', 'Rate limiting & DDoS shield\nBot detection & IP filtering', '#FB923C'));
  elements.push(createServiceNode('c-node4', 3, 80, 'aws-api-gateway', 'Central API Gateway', 'REST & WebSocket router\nJWT authentication & telemetry', '#FB923C'));

  // Tier 2
  elements.push(createTierFrame('tier-c2', 275, '02 · BUSINESS LOGIC & ORCHESTRATION TIER', '#22C55E'));
  elements.push(createServiceNode('c-node5', 0, 275, 'gen-microservice', isEcommerce ? 'Catalog Service' : isFinance ? 'Order Book Engine' : 'Core Business Service', 'High-throughput microservice\nLow latency execution', '#22C55E'));
  elements.push(createServiceNode('c-node6', 1, 275, 'tech-python', isEcommerce ? 'Checkout & Cart Engine' : isFinance ? 'Matching & Settlement' : 'Processing Engine', 'Domain service container\nIdempotent business transactions', '#22C55E'));
  elements.push(createServiceNode('c-node7', 2, 275, 'tech-docker', isEcommerce ? 'Notification Hub' : isFinance ? 'Compliance & KYC Engine' : 'Integration Worker', 'Async event worker\nThird-party API connectors', '#22C55E'));
  elements.push(createServiceNode('c-node8', 3, 275, 'ai-openai', isEcommerce ? 'Recommendation AI' : isFinance ? 'Fraud Detection AI' : 'AI Reasoning Agent', 'Machine learning inference\nReal-time scoring & predictions', '#22C55E'));

  // Tier 3
  elements.push(createTierFrame('tier-c3', 470, '03 · EVENT LOG, CACHING & QUEUES', '#A855F7'));
  elements.push(createServiceNode('c-node9', 0, 470, 'db-redis', 'Redis Distributed Cache', 'In-memory session state\nHigh-speed read-through cache', '#A855F7'));
  elements.push(createServiceNode('c-node10', 1, 470, 'db-kafka', 'Apache Kafka Event Bus', 'Event streaming backbone\nDecoupled publisher/subscriber', '#A855F7'));
  elements.push(createServiceNode('c-node11', 2, 470, 'aws-sqs', 'Task Queue (SQS / RabbitMQ)', 'Reliable async task delivery\nDead-letter queue handling', '#A855F7'));
  elements.push(createServiceNode('c-node12', 3, 470, 'gen-microservice', 'Event Streaming Consumer', 'Scalable consumer group\nUpdates read models & projections', '#A855F7'));

  // Tier 4
  elements.push(createTierFrame('tier-c4', 665, '04 · PERSISTENCE & ANALYTICS DATA LAKE', '#0284C7'));
  elements.push(createServiceNode('c-node13', 0, 665, 'db-postgres', 'PostgreSQL Primary DB', 'ACID relational database\nAutomated failover & replication', '#0284C7'));
  elements.push(createServiceNode('c-node14', 1, 665, 'db-postgres', 'Vector / Search Index', 'Dense embeddings & full-text\nSub-second complex search', '#0284C7'));
  elements.push(createServiceNode('c-node15', 2, 665, 'aws-s3', 'S3 Object Storage Lake', 'Immutable audit evidence\nMedia assets & historical logs', '#0284C7'));
  elements.push(createServiceNode('c-node16', 3, 665, 'gen-cloud', 'Observability & Metrics Hub', 'Real-time telemetry traces\nService health & alerts', '#0284C7'));

  // Connectors
  elements.push(createConnector('cc-1', 'c-node1', 'right', 'c-node2', 'left', 'user traffic', '#FB923C'));
  elements.push(createConnector('cc-2', 'c-node2', 'right', 'c-node3', 'left', 'HTTPS request', '#FB923C'));
  elements.push(createConnector('cc-3', 'c-node3', 'right', 'c-node4', 'left', 'verified routing', '#FB923C'));
  elements.push(createConnector('cc-4', 'c-node4', 'bottom', 'c-node8', 'top', 'dispatch intent', '#22C55E'));
  elements.push(createConnector('cc-5', 'c-node8', 'left', 'c-node7', 'right', 'feature inference', '#22C55E'));
  elements.push(createConnector('cc-6', 'c-node7', 'left', 'c-node6', 'right', 'execute tasks', '#22C55E'));
  elements.push(createConnector('cc-7', 'c-node6', 'left', 'c-node5', 'right', 'business updates', '#22C55E'));
  elements.push(createConnector('cc-8', 'c-node5', 'bottom', 'c-node9', 'top', 'cache check', '#A855F7'));
  elements.push(createConnector('cc-9', 'c-node9', 'right', 'c-node10', 'left', 'publish events', '#A855F7'));
  elements.push(createConnector('cc-10', 'c-node10', 'right', 'c-node11', 'left', 'fan-out queue', '#A855F7'));
  elements.push(createConnector('cc-11', 'c-node11', 'right', 'c-node12', 'left', 'process task', '#A855F7'));
  elements.push(createConnector('cc-12', 'c-node12', 'bottom', 'c-node16', 'top', 'log telemetry', '#0284C7'));
  elements.push(createConnector('cc-13', 'c-node16', 'left', 'c-node15', 'right', 'archive telemetry', '#0284C7'));
  elements.push(createConnector('cc-14', 'c-node15', 'left', 'c-node14', 'right', 'search sync', '#0284C7'));
  elements.push(createConnector('cc-15', 'c-node14', 'left', 'c-node13', 'right', 'reconcile state', '#0284C7'));

  return {
    message: `Synthesized **${mainTitle}** with 4 distinct tiers, 16 microservices, and orthogonal data pipelines.`,
    elements,
    actionType: 'replace',
  };
}

// =============================================================================
// INCREMENTAL COMPONENT ADD & LAYOUT REARRANGE
// =============================================================================
function handleIncrementalAdd(prompt: string, elements: CanvasElement[]): AIResponse {
  const newElements = [...elements];
  let targetIcon = 'gen-microservice';
  let targetLabel = 'New Service';
  let strokeColor = '#8B5CF6';

  if (prompt.includes('redis') || prompt.includes('cache')) {
    targetIcon = 'db-redis';
    targetLabel = 'Redis Cache';
    strokeColor = '#DC2626';
  } else if (prompt.includes('kafka') || prompt.includes('queue') || prompt.includes('sqs')) {
    targetIcon = 'db-kafka';
    targetLabel = 'Kafka Stream';
    strokeColor = '#F97316';
  } else if (prompt.includes('postgres') || prompt.includes('sql') || prompt.includes('database')) {
    targetIcon = 'db-postgres';
    targetLabel = 'PostgreSQL';
    strokeColor = '#3B82F6';
  } else if (prompt.includes('s3') || prompt.includes('storage') || prompt.includes('bucket')) {
    targetIcon = 'aws-s3';
    targetLabel = 'S3 Object Store';
    strokeColor = '#E05243';
  } else if (prompt.includes('auth') || prompt.includes('security')) {
    targetIcon = 'infra-firewall';
    targetLabel = 'Auth Guard';
    strokeColor = '#EF4444';
  } else if (prompt.includes('docker') || prompt.includes('k8s')) {
    targetIcon = 'tech-docker';
    targetLabel = 'Container Node';
    strokeColor = '#2496ED';
  }

  // Find max X to place it on the right side
  let maxX = 100;
  let avgY = 200;
  for (const el of elements) {
    if (el.type !== 'connector' && el.type !== 'frame') {
      if (el.x > maxX) maxX = el.x;
      avgY = el.y;
    }
  }

  const newNodeId = `node-add-${Date.now()}`;
  const newNode: CanvasElement = {
    id: newNodeId,
    type: 'icon',
    x: maxX + 250,
    y: avgY,
    width: 230,
    height: 78,
    iconName: targetIcon,
    iconLabel: targetLabel,
    subtitle: 'Dynamically added component\nConnected to active pipeline',
    style: {
      fillColor: '#FFFFFF',
      strokeColor: strokeColor,
      strokeWidth: 1.5,
      strokeStyle: 'solid',
      roughness: 0,
      textColor: '#0F172A',
      fontSize: 11,
      fontFamily: 'sans',
      textAlign: 'left',
      opacity: 1,
    },
    zIndex: 10,
  };
  newElements.push(newNode);

  // Connect from nearest or last node
  const lastNode = elements.filter(e => e.type !== 'connector' && e.type !== 'frame').pop();
  if (lastNode) {
    const newConn: CanvasElement = createConnector(
      `conn-${Date.now()}`,
      lastNode.id,
      'right',
      newNodeId,
      'left',
      'Data Flow',
      strokeColor
    );
    newElements.push(newConn);
  }

  return {
    message: `Added **${targetLabel}** to the canvas and established orthogonal connector.`,
    elements: newElements,
    actionType: 'replace',
  };
}

function handleLayoutRearrange(prompt: string, elements: CanvasElement[]): AIResponse {
  const isHorizontal = prompt.includes('horizontal') || !prompt.includes('vertical');
  const nodes = elements.filter(e => e.type !== 'connector' && e.type !== 'frame');
  const otherElements = elements.filter(e => e.type === 'connector' || e.type === 'frame');

  const startX = 80;
  const startY = 150;
  const spacing = 260;

  const updatedNodes = nodes.map((node, idx) => {
    return {
      ...node,
      x: isHorizontal ? startX + idx * spacing : startX + (idx % 4) * spacing,
      y: isHorizontal ? startY + (idx % 2 === 0 ? 0 : 40) : startY + Math.floor(idx / 4) * 140,
    };
  });

  return {
    message: `Rearranged diagram layout to ${isHorizontal ? 'horizontal pipeline' : 'hierarchical grid layout'}.`,
    elements: [...updatedNodes, ...otherElements],
    actionType: 'replace',
  };
}
