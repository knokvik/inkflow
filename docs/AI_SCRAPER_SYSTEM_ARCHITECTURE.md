# AI-Based Scraper System Architecture for Inkflow

## Overview

This document describes the system architecture for an AI-powered web scraping system integrated with Inkflow (Eraser alternative). The scraper extracts architectural patterns, tech stacks, and documentation from web sources to auto-generate system architecture diagrams and technical documentation.

---

## High-Level Architecture

```mermaid
flowchart TD
    subgraph Client[Inkflow Frontend]
        UI[AI Assistant Panel]
        Canvas[Infinite Canvas]
        Doc[Doc Editor]
    end

    subgraph Gateway[API Gateway / BFF]
        GW[Gateway :5173/api]
        Auth[Auth & Rate Limit]
    end

    subgraph ScraperCore[Scraper Core Service]
        Orch[Orchestrator]
        Queue[Job Queue]
        Workers[Worker Pool]
    end

    subgraph AI[AI Processing Layer]
        Extractor[Content Extractor]
        Classifier[Tech Stack Classifier]
        DiagramGen[Diagram Generator]
        DocGen[Doc Generator]
    end

    subgraph Storage[Data Layer]
        Redis[(Redis Cache)]
        Postgres[(PostgreSQL)]
        VectorDB[(pgvector / Pinecone)]
        S3[(S3 / MinIO)]
    end

    subgraph External[External Sources]
        Web[Web Targets]
        GitHub[GitHub Repos]
        Docs[Documentation Sites]
        APIs[Public APIs]
    end

    UI --> GW
    GW --> Auth
    Auth --> Orch
    Orch --> Queue
    Queue --> Workers
    Workers --> Extractor
    Workers --> Classifier
    Extractor --> Web
    Extractor --> GitHub
    Extractor --> Docs
    Extractor --> APIs
    Classifier --> VectorDB
    DiagramGen --> Canvas
    DocGen --> Doc
    Orch --> Redis
    Orch --> Postgres
    Workers --> S3
```

---

## Component Details

### 1. API Gateway (Port 5173/api)
- **Technology**: Vite dev server proxy → Node.js/Express or Fastify backend
- **Responsibilities**:
  - Request routing and load balancing
  - Authentication (JWT/OAuth2)
  - Rate limiting (token bucket per user)
  - Request/response transformation
  - WebSocket upgrade for real-time job updates

### 2. Scraper Orchestrator
- **Technology**: Node.js (TypeScript) with BullMQ or Temporal
- **Responsibilities**:
  - Job scheduling and prioritization
  - Deduplication (URL canonicalization + content hash)
  - Retry logic with exponential backoff
  - Dead letter queue handling
  - Progress streaming via WebSocket/SSE

```typescript
interface ScrapeJob {
  id: string;
  url: string;
  type: 'architecture' | 'documentation' | 'github' | 'api';
  priority: 'high' | 'normal' | 'low';
  config: ScrapeConfig;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: ScrapeResult;
  createdAt: number;
  updatedAt: number;
}
```

### 3. Worker Pool (Horizontal Scaling)
- **Technology**: Containerized workers (Docker/K8s) or serverless (AWS Lambda/GCP Cloud Run)
- **Concurrency**: Configurable per worker type
- **Types**:
  - **Static Workers**: Cheerio/Playwright for HTML parsing
  - **Dynamic Workers**: Playwright/Puppeteer for JS-rendered pages
  - **API Workers**: Direct REST/GraphQL clients
  - **Git Workers**: GitHub API / git clone for repos

### 4. AI Processing Layer

#### Content Extractor
- **Input**: Raw HTML, Markdown, OpenAPI specs, README files
- **Output**: Structured content blocks (headers, code blocks, diagrams, tables)
- **Models**: 
  - LayoutLMv3 for document understanding
  - Custom fine-tuned model for architecture pattern recognition

#### Tech Stack Classifier
- **Input**: Extracted text, code snippets, dependency files (package.json, requirements.txt, go.mod, pom.xml)
- **Output**: Normalized tech stack with confidence scores
- **Categories**: Cloud, Database, Messaging, Compute, Auth, Monitoring, Frontend, Backend
- **Vector Search**: pgvector for similarity matching against known tech signatures

#### Diagram Generator
- **Input**: Classified components + relationships
- **Output**: Inkflow CanvasElement[] (compatible with existing types)
- **Approach**: 
  - LLM (GPT-4o / local Llama3) with structured output
  - Few-shot prompting with Eraser DSL examples
  - Post-processing: layout optimization, connector routing

#### Doc Generator
- **Input**: Same as Diagram Generator + extracted prose
- **Output**: Technical Markdown with Mermaid diagrams, callouts, code blocks
- **Templates**: Architecture Decision Records (ADR), System Design Docs, API Specs

---

## Data Flow

### Scraping Pipeline

```mermaid
sequenceDiagram
    participant User
    participant Gateway
    participant Orchestrator
    participant Queue
    participant Worker
    participant AI
    participant Storage
    
    User->>Gateway: POST /api/scrape {url, type}
    Gateway->>Orchestrator: Create job
    Orchestrator->>Queue: Enqueue job
    Queue->>Worker: Dequeue
    Worker->>Worker: Fetch & parse
    Worker->>AI: Extract + Classify
    AI-->>Worker: Structured data
    Worker->>Storage: Persist raw + processed
    Worker->>AI: Generate diagram + doc
    AI-->>Worker: Inkflow elements + markdown
    Worker->>Storage: Save results
    Worker->>Gateway: WebSocket progress
    Gateway-->>User: Real-time updates
    User->>Gateway: GET /api/scrape/:id/result
    Gateway->>Storage: Fetch result
    Storage-->>Gateway: Diagram + Doc
    Gateway-->>User: Apply to canvas
```

### Incremental Updates
- **Change Detection**: Content hash comparison + semantic diff
- **Diagram Diff**: Element-level diff (added/removed/modified nodes)
- **Merge Strategy**: User chooses replace/merge/append per update

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Node.js 20+ / TypeScript | Shared types with Inkflow frontend |
| **Queue** | BullMQ (Redis) | Priority, delayed, repeatable jobs |
| **Orchestration** | Temporal (optional) | Long-running, durable workflows |
| **Browser** | Playwright (Chrome/Firefox) | Reliable JS rendering, stealth mode |
| **Parsing** | Cheerio + Readability | Fast static extraction |
| **Vector DB** | pgvector (PostgreSQL) | Unified with existing PG dependency |
| **LLM** | OpenAI / Ollama / Antigravity | Compatible with existing AI service |
| **Storage** | PostgreSQL + S3 | ACID + blob storage |
| **Cache** | Redis | Rate limiting, job state, deduplication |
| **Monitoring** | OpenTelemetry + Prometheus | Observability |

---

## API Contract

### Scrape Endpoints

```typescript
// POST /api/v1/scrape
interface ScrapeRequest {
  url: string;
  type: 'architecture' | 'documentation' | 'github' | 'api' | 'auto';
  options?: {
    depth?: number;           // Crawl depth for multi-page
    followLinks?: boolean;    // Follow internal links
    extractCode?: boolean;    // Extract code blocks
    generateDiagram?: boolean; // Auto-generate Inkflow diagram
    generateDoc?: boolean;    // Auto-generate technical doc
    provider?: AIProviderConfig; // Override AI provider
  };
}

// Response
interface ScrapeResponse {
  jobId: string;
  status: 'accepted';
  estimatedDuration: number; // seconds
  wsEndpoint: string;        // WebSocket for progress
}

// GET /api/v1/scrape/:jobId
interface JobStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;          // 0-100
  currentStage: 'fetching' | 'parsing' | 'classifying' | 'generating' | 'complete';
  result?: ScrapeResult;
  error?: string;
}

interface ScrapeResult {
  url: string;
  title: string;
  summary: string;
  techStack: TechComponent[];
  architecture: {
    elements: CanvasElement[];  // Inkflow-compatible
    dsl: string;                // Eraser DSL
    mermaid: string;            // Mermaid fallback
  };
  documentation: {
    markdown: string;
    adr: string[];
    apiSpec?: OpenAPISpec;
  };
  metadata: {
    scrapedAt: number;
    contentHash: string;
    sourceType: string;
    confidence: number;
  };
}
```

### Real-time Progress (WebSocket)

```typescript
// WS /api/v1/scrape/:jobId/stream
type ProgressEvent =
  | { type: 'stage'; stage: string; message: string }
  | { type: 'progress'; percent: number; details: string }
  | { type: 'partial'; data: Partial<ScrapeResult> }
  | { type: 'complete'; result: ScrapeResult }
  | { type: 'error'; error: string };
```

---

## Configuration

### Environment Variables

```bash
# Scraper Core
SCRAPER_CONCURRENCY=10
SCRAPER_TIMEOUT_MS=120000
SCRAPER_MAX_DEPTH=3
SCRAPER_USER_AGENT="InkflowBot/1.0 (+https://inkflow.dev)"

# Queue (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/inkflow
VECTOR_DIMENSIONS=1536

# Storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=inkflow-scraper
S3_ACCESS_KEY=
S3_SECRET_KEY=

# AI Providers (inherit from Inkflow AI service)
OPENAI_API_KEY=
OLLAMA_ENDPOINT=http://localhost:11434
ANTIGRAVITY_ENDPOINT=http://localhost:8000/v1

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Monitoring
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

---

## Security Considerations

1. **SSRF Protection**: 
   - Block private IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x, 127.x)
   - DNS rebinding protection
   - Allowlist/denylist for domains

2. **Rate Limiting**:
   - Per-domain courtesy delays (min 1s between requests)
   - Respect robots.txt and crawl-delay
   - User-agent identification

3. **Content Safety**:
   - Sanitize extracted HTML (DOMPurify)
   - Size limits on fetched content (max 10MB)
   - Timeout enforcement (30s per request)

4. **Data Privacy**:
   - No PII storage without consent
   - Encryption at rest for sensitive configs
   - Audit logging for all scrape jobs

---

## Deployment Architecture

### Development (Local)
```
┌─────────────────────────────────────────┐
│  Docker Compose                         │
├─────────────────────────────────────────┤
│  inkflow-frontend  :5173                │
│  inkflow-api       :3001                │
│  scraper-orchestrator                  │
│  scraper-worker-x3                     │
│  redis             :6379                │
│  postgres          :5432 (pgvector)     │
│  minio             :9000                │
│  ollama            :11434 (optional)    │
└─────────────────────────────────────────┘
```

### Production (Kubernetes)
```yaml
# Key deployments
- Deployment: scraper-orchestrator (1 replica, HPA)
- Deployment: scraper-worker-static (3-20 replicas, HPA)
- Deployment: scraper-worker-dynamic (2-10 replicas, HPA)
- Deployment: scraper-worker-api (2-5 replicas)
- StatefulSet: redis-cluster (3 nodes)
- StatefulSet: postgres-primary + replicas
- Ingress: TLS termination, rate limiting
- ConfigMap/Secrets: All configuration
```

---

## Integration with Inkflow

### AI Service Extension

Extend `/src/services/aiService.ts` with scraper capabilities:

```typescript
// New function in aiService.ts
export async function scrapeAndGenerate(
  url: string,
  config: AIProviderConfig,
  options: ScrapeOptions
): Promise<AIResponse> {
  const jobId = await api.post('/scrape', { url, type: 'auto', options });
  const result = await pollJob(jobId);
  return {
    message: `Scraped and generated architecture from ${url}`,
    elements: result.architecture.elements,
    docMarkdown: result.documentation.markdown,
    actionType: 'replace',
  };
}
```

### UI Integration Points

1. **New Toolbar Button**: "🌐 Scrape URL" → Opens modal with URL input + options
2. **Command Palette**: "Scrape Website for Architecture"
3. **AI Assistant**: "Scrape https://example.com and generate diagram"
4. **Import Menu**: "From URL" alongside "From JSON"

---

## Future Enhancements

1. **Multi-modal Scraping**: Screenshot + OCR for image-based diagrams
2. **GitHub Actions Integration**: Auto-scrape on PR for architecture drift detection
3. **Scheduled Scraping**: Monitor docs for changes, update diagrams automatically
4. **Collaborative Scraping**: Team-shared scrape jobs with annotations
5. **Plugin System**: Custom extractors for domain-specific sources (Kubernetes manifests, Terraform, etc.)

---

## File Structure (Proposed)

```
eraser-local/
├── src/
│   ├── services/
│   │   ├── aiService.ts          # Existing
│   │   ├── scraperService.ts     # NEW: Client-side scraper API
│   │   └── scraper/
│   │       ├── api.ts            # Backend API routes
│   │       ├── orchestrator.ts   # Job management
│   │       ├── workers/
│   │       │   ├── static.ts     # Cheerio-based
│   │       │   ├── dynamic.ts    # Playwright-based
│   │       │   ├── github.ts     # GitHub API
│   │       │   └── api.ts        # OpenAPI/REST
│   │       ├── ai/
│   │       │   ├── extractor.ts  # Content extraction
│   │       │   ├── classifier.ts # Tech stack classification
│   │       │   ├── diagramGen.ts # Diagram generation
│   │       │   └── docGen.ts     # Documentation generation
│   │       ├── queue.ts          # BullMQ setup
│   │       ├── storage.ts        # PG + S3 abstraction
│   │       └── config.ts         # Configuration
│   ├── components/
│   │   ├── scraper/
│   │   │   ├── ScrapeModal.tsx
│   │   │   ├── ScrapeProgress.tsx
│   │   │   └── ScrapeResultPanel.tsx
│   │   └── ai/
│   │       └── AIAssistantDrawer.tsx  # Extend with scrape
│   └── types/
│       └── scraper.ts          # NEW: Scraper types
├── docker-compose.yml
├── Dockerfile.scraper
└── docs/
    └── AI_SCRAPER_SYSTEM_ARCHITECTURE.md
```