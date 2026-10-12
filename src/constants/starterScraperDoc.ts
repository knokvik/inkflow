import { EraserDocument } from '../types/canvas';

export const STARTER_AGENTIC_SCRAPER_DOCUMENT: EraserDocument = {
  id: 'starter-agentic-scraper',
  title: 'Autonomous AI Web Scraper & Multi-Agent Intelligence',
  viewMode: 'canvas',
  theme: 'dark',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
  content: `# Autonomous Web Scraping & Multi-Agent Intelligence Architecture

## 1. Executive Summary & Core Value Proposition

Modern web scraping for LLMs must go beyond naive HTML-to-text regex dumps. Modern web applications feature dynamic SPAs, aggressive anti-bot defenses, dynamic DOM hydration, and noisy layout patterns. Furthermore, downstream AI models require **zero-hallucination structured entities**, **precise source attribution**, **confidence metrics**, and **self-healing feedback loops** when DOM targets drift.

This architecture outlines an enterprise, end-to-end autonomous scraping and multi-agent synthesis engine. It converts raw, unstructured internet data into certified, LLM-ready knowledge graphs, while continually improving its own extraction heuristics through downstream AI model feedback.

---

## 2. Six-Tier Architectural Topology

\`\`\`mermaid
flowchart TD
    subgraph T1["01 - DISTRIBUTED CRAWLER & STEALTH INGESTION"]
        Frontier["Adaptive URL Frontier"] --> Proxy["Stealth & Proxy Gateway"]
        Proxy --> Browser["Headless Playwright Cluster"]
        Browser --> Snapshot["DOM Snapshot Cache (S3)"]
    end

    subgraph T2["02 - NORMALIZATION & MULTIMODAL EXTRACTION"]
        Snapshot --> Pruner["DOM Pruner & Cleanser"]
        Pruner --> Markdown["LLM-Ready Markdown Engine"]
        Pruner --> Vision["Vision & Multimodal OCR"]
        Markdown --> Chunker["Hierarchical Semantic Chunker"]
        Vision --> Chunker
    end

    subgraph T3["03 - MULTI-AGENT SYNTHESIS & REASONING"]
        Chunker --> Orchestrator["Agent Orchestrator & Planner"]
        Orchestrator --> Extractor["Entity Extraction Agent"]
        Extractor --> Verifier["Fact-Check & Attribution Agent"]
        Verifier --> Critic["Self-Reflective Critic"]
        Critic -.->|"Confidence < 0.90 (Retry DAG)"| Orchestrator
    end

    subgraph T4["04 - VECTOR KNOWLEDGE & PERSISTENT STORAGE"]
        Critic --> VectorDB["pgvector / Qdrant Embeddings"]
        Critic --> SnapLake["Immutable Snapshot Lake"]
        Critic --> RedisQueue["Redis State & Lock Queue"]
        Critic --> EventStream["Kafka Event Stream"]
    end

    subgraph T5["05 - CONTINUOUS EVALUATION & SELF-IMPROVEMENT"]
        Critic --> EvalBench["Ground-Truth Benchmark Suite"]
        EvalBench --> DriftHealer["Selector Drift Auto-Healer"]
        EvalBench --> PromptOpt["DSPy Prompt & Tool Optimizer"]
        DriftHealer -.->|"Updated DOM Selectors"| Frontier
        PromptOpt -.->|"Refined Few-Shot Prompts"| Extractor
    end

    subgraph T6["06 - AGENTIC API GATEWAY & DOWNSTREAM CONSUMPTION"]
        VectorDB --> APIGateway["Streaming SSE & REST Gateway"]
        Critic --> SchemaFormat["Agentic JSON Formatter"]
        SchemaFormat --> APIGateway
        APIGateway --> Downstream["Downstream AI Models (Claude/GPT/Grok)"]
        Downstream --> Telemetry["Model Satisfaction Telemetry"]
        Telemetry -.->|"Fine-Tuning Dataset"| EvalBench
    end
\`\`\`

---

## 3. Tier-by-Tier Technical Specifications

### Tier 01: Distributed Crawler & Stealth Ingestion
- **Adaptive URL Frontier**: Prioritizes crawling based on page freshness, domain reputation, and robots.txt rate-limits. Backed by token-bucket rate limiters.
- **Stealth & Proxy Gateway**: Rotates residential and mobile IP pools with TLS fingerprint spoofing (JA3/JA4 emulation), canvas noise injection, and dynamic HTTP/2 header ordering.
- **Headless Playwright Cluster**: Autoscaling Chromium container pool that awaits network idle, handles CAPTCHA puzzles, scrolls to trigger lazy loading, and waits for dynamic client hydration.
- **DOM Snapshot Cache**: Stores raw unparsed HTML and full-page WebP screenshots indexed by canonical URL hash for idempotent replay and offline debugging.

### Tier 02: Normalization & Multimodal Extraction
- **DOM Pruner & Cleanser**: Strips script tags, tracking pixels, navigation boilerplate, and cookie banners. Employs Readability algorithms to isolate primary content containers.
- **LLM-Ready Markdown Engine**: Converts tabular data into GFM Markdown tables, preserves nesting hierarchies (H1-H6), code blocks, and list indentations to minimize token footprint.
- **Vision & Multimodal OCR**: Analyzes page screenshots for image-heavy pages, charts, infographics, and pricing matrices where HTML text extraction fails.
- **Hierarchical Semantic Chunker**: Generates multi-scale chunk embeddings (parent-child documents) preserving context boundaries and document breadcrumbs.

### Tier 03: Multi-Agent Synthesis & Reasoning
- **Agent Orchestrator & Planner**: Accepts natural language extraction targets (e.g. *"Extract all pricing tiers, feature matrices, and SLA policies"*), decomposing them into an executable DAG of sub-tasks.
- **Entity Extraction Agent**: Utilizes Pydantic/Zod schemas to extract typed JSON fields with strict validation constraints.
- **Fact-Check & Source Attribution Agent**: Maps every extracted claim to exact byte offsets and DOM XPath locations in the original page source, preventing hallucinations.
- **Self-Reflective Critic Agent**: Evaluates completeness, consistency, and confidence scores. If confidence falls below 0.90, triggers an targeted re-scrape or re-prompts with supplementary context.

### Tier 04: Vector Knowledge & Persistent Storage
- **pgvector / Qdrant Embeddings**: High-dimensional hybrid search (dense embeddings + sparse BM25) for sub-second semantic retrieval.
- **Immutable Snapshot Lake**: S3-compatible content lake storing versioned snapshots for temporal diff analysis (e.g., detecting price changes over time).
- **Redis State & Distributed Locks**: Coordinates worker leases, task deduplication, and rate-limiting counters.
- **Kafka Scrape Event Broker**: Publishes change-data-capture (CDC) events to notify downstream subscriber services in real-time.

### Tier 05: Continuous Evaluation & Self-Improvement Loop
- **Ground-Truth Benchmark Suite**: Automatically scores output accuracy against verified ground-truth test sets using LLM-as-a-Judge, measuring Precision, Recall, and Hallucination Rate.
- **Selector Drift Auto-Healer**: When a website updates its layout and extraction confidence dips, the healer compares visual screenshots with historical DOM trees to synthesize updated selectors automatically.
- **DSPy Prompt & Tool Optimizer**: Uses Bayesian search and bootstrap few-shot teleprompters to continually optimize LLM prompts for lower token cost and higher extraction accuracy.
- **Active Learning Fine-Tuning Loop**: Harvests edge-case scraping failures to fine-tune compact open-weights models (e.g. Qwen-2.5, Llama-3.3) for local, fast extraction.

### Tier 06: Agentic API Gateway & Downstream Consumption
- **Streaming SSE & REST Gateway**: Delivers real-time token streaming and sub-second chunked responses for low latency.
- **Agentic JSON Formatter**: Generates rich standardized payloads including metadata, schemas, confidence scores, and citation breadcrumbs.
- **Model Interoperability Hub**: Universal compatibility layer supporting Model Context Protocol (MCP), OpenAI Function Calling, Anthropic Tool Use, and LangChain/LlamaIndex connectors.

---

## 4. Standardized Agentic Scraped Output Schema

Downstream AI models require structured, predictable responses. Every scraping execution yields the following standardized JSON contract:

\`\`\`json
{
  "$schema": "https://inkflow.ai/schemas/agentic-scrape-v1.json",
  "executionId": "scr_98412_a8f9",
  "source": {
    "url": "https://example-saas.com/pricing",
    "canonicalUrl": "https://example-saas.com/pricing",
    "timestamp": "2026-10-12T20:15:00Z",
    "httpStatus": 200,
    "contentType": "text/html",
    "domHash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
  },
  "extractionQuality": {
    "overallConfidence": 0.982,
    "hallucinationRisk": "negligible",
    "schemaValidationPassed": true,
    "critiqueReview": "All pricing tiers, feature lists, and add-on pricing matched primary DOM nodes with zero conflicting attributes."
  },
  "entities": [
    {
      "tier": "Starter",
      "price": 29.00,
      "billingCycle": "monthly",
      "features": ["Up to 5 Users", "10GB Storage", "Community Support"],
      "sourceAttribution": {
        "xPath": "/html/body/div[1]/main/section[2]/div[1]/div[1]",
        "rawTextSnippet": "Starter Plan: $29/mo billed monthly. Includes up to 5 seats and 10GB storage.",
        "byteOffset": [4120, 4198]
      }
    },
    {
      "tier": "Enterprise",
      "price": "Custom",
      "billingCycle": "annual",
      "features": ["Unlimited Users", "Dedicated Account Manager", "99.99% SLA"],
      "sourceAttribution": {
        "xPath": "/html/body/div[1]/main/section[2]/div[1]/div[3]",
        "rawTextSnippet": "Enterprise: Contact sales for custom SLA and volume pricing.",
        "byteOffset": [4350, 4425]
      }
    }
  ],
  "semanticMarkdown": "# Pricing Plans\\n\\n| Tier | Price | Users | Storage |\\n|---|---|---|---|\\n| Starter | $29/mo | 5 | 10GB |\\n| Enterprise | Custom | Unlimited | Dedicated |",
  "knowledgeGraphTriplets": [
    ["Starter Plan", "hasPrice", "$29/mo"],
    ["Enterprise Plan", "hasSLA", "99.99%"]
  ]
}
\`\`\`

---

## 5. Downstream AI Model Consumption (Python Example)

Other models can query and test this pipeline via standard Python tooling:

\`\`\`python
import requests

def fetch_agentic_data(target_url: str, extraction_goal: str):
    response = requests.post(
        "http://localhost:5173/api/scrape/agentic",
        json={
            "url": target_url,
            "goal": extraction_goal,
            "requireAttribution": True,
            "minConfidence": 0.95
        },
        headers={"Authorization": "Bearer inkflow_local_key"}
    )
    result = response.json()
    
    # Verify confidence before model synthesis
    if result["extractionQuality"]["overallConfidence"] >= 0.95:
        return result["entities"]
    else:
        raise ValueError("Scrape confidence below acceptance threshold")
\`\`\`

> [!TIP]
> This architecture is fully self-healing. When target websites change, the Selector Drift Auto-Healer flags selector divergence and updates the extraction heuristics without manual developer intervention.
`,
  canvasSettings: {
    grid: 'dots',
    roughStyle: false,
    zoom: 0.58,
    pan: { x: 50, y: 30 },
    snapToGrid: true,
  },
  elements: [
    // MAIN ENCLOSING DIAGRAM FRAME
    {
      id: 'frame-scraper-main',
      type: 'frame',
      x: 40,
      y: 40,
      width: 1140,
      height: 860,
      frameTitle: 'Autonomous Web Scraping & Multi-Agent Intelligence Architecture',
      style: {
        fillColor: 'rgba(255, 255, 255, 0.4)',
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
    },

    // =========================================================================
    // TIER 01: DISTRIBUTED CRAWLER & STEALTH INGESTION (Orange / Amber)
    // =========================================================================
    {
      id: 'tier-01',
      type: 'frame',
      x: 60,
      y: 80,
      width: 1100,
      height: 155,
      frameTitle: '01 · DISTRIBUTED CRAWLER & STEALTH INGESTION TIER',
      style: {
        fillColor: 'rgba(254, 243, 199, 0.22)',
        strokeColor: '#FB923C',
        strokeWidth: 1.5,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#C2410C',
        fontSize: 11,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 2,
    },
    {
      id: 'node-crawl-frontier',
      type: 'icon',
      x: 80,
      y: 125,
      width: 230,
      height: 78,
      iconName: 'gen-server',
      iconLabel: 'Adaptive URL Frontier',
      subtitle: 'Priority queue & rate limiting\nRobots.txt & domain cadence',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#FB923C',
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
    },
    {
      id: 'node-crawl-stealth',
      type: 'icon',
      x: 350,
      y: 125,
      width: 230,
      height: 78,
      iconName: 'infra-firewall',
      iconLabel: 'Stealth & Proxy Gateway',
      subtitle: 'Residential IP rotating pool\nTLS fingerprint & UA spoofing',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#FB923C',
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
    },
    {
      id: 'node-crawl-playwright',
      type: 'icon',
      x: 620,
      y: 125,
      width: 230,
      height: 78,
      iconName: 'gen-browser',
      iconLabel: 'Headless Browser Cluster',
      subtitle: 'Playwright / Chromium grid\nDynamic SPA & hydration wait',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#FB923C',
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
    },
    {
      id: 'node-crawl-snapshot',
      type: 'icon',
      x: 890,
      y: 125,
      width: 230,
      height: 78,
      iconName: 'aws-s3',
      iconLabel: 'DOM Snapshot Cache',
      subtitle: 'Raw HTML & WebP snapshots\nSHA-256 deduplication cache',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#FB923C',
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
    },

    // =========================================================================
    // TIER 02: NORMALIZATION & MULTIMODAL EXTRACTION (Emerald / Green)
    // =========================================================================
    {
      id: 'tier-02',
      type: 'frame',
      x: 60,
      y: 275,
      width: 1100,
      height: 155,
      frameTitle: '02 · NORMALIZATION & MULTIMODAL EXTRACTION TIER',
      style: {
        fillColor: 'rgba(220, 252, 231, 0.22)',
        strokeColor: '#22C55E',
        strokeWidth: 1.5,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#15803D',
        fontSize: 11,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 2,
    },
    {
      id: 'node-extract-chunker',
      type: 'icon',
      x: 80,
      y: 320,
      width: 230,
      height: 78,
      iconName: 'db-redis',
      iconLabel: 'Semantic Chunker',
      subtitle: 'Parent-child document chunks\nContext-boundary preservation',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#22C55E',
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
    },
    {
      id: 'node-extract-markdown',
      type: 'icon',
      x: 350,
      y: 320,
      width: 230,
      height: 78,
      iconName: 'tech-python',
      iconLabel: 'LLM Markdown Engine',
      subtitle: 'GFM table converter & headings\nPreserves semantic nesting',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#22C55E',
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
    },
    {
      id: 'node-extract-vision',
      type: 'icon',
      x: 620,
      y: 320,
      width: 230,
      height: 78,
      iconName: 'ai-vision',
      iconLabel: 'Vision & Multimodal OCR',
      subtitle: 'Screenshot visual parser\nCharts, tables & pricing matrices',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#22C55E',
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
    },
    {
      id: 'node-extract-cleaner',
      type: 'icon',
      x: 890,
      y: 320,
      width: 230,
      height: 78,
      iconName: 'gen-microservice',
      iconLabel: 'DOM Pruner & Cleanser',
      subtitle: 'Readability container isolation\nCookie banners & boilerplate removal',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#22C55E',
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
    },

    // =========================================================================
    // TIER 03: MULTI-AGENT SYNTHESIS & REASONING CORE (Purple / Indigo)
    // =========================================================================
    {
      id: 'tier-03',
      type: 'frame',
      x: 60,
      y: 470,
      width: 1100,
      height: 155,
      frameTitle: '03 · MULTI-AGENT SYNTHESIS & REASONING CORE',
      style: {
        fillColor: 'rgba(243, 232, 255, 0.22)',
        strokeColor: '#A855F7',
        strokeWidth: 1.5,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#7E22CE',
        fontSize: 11,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 2,
    },
    {
      id: 'node-agent-orchestrator',
      type: 'icon',
      x: 80,
      y: 515,
      width: 230,
      height: 78,
      iconName: 'ai-anthropic',
      iconLabel: 'Agent Orchestrator & Planner',
      subtitle: 'Decomposes prompt into DAG\nCoordinates agent execution',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#A855F7',
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
    },
    {
      id: 'node-agent-extractor',
      type: 'icon',
      x: 350,
      y: 515,
      width: 230,
      height: 78,
      iconName: 'ai-openai',
      iconLabel: 'Entity Extraction Agent',
      subtitle: 'Pydantic & Zod schemas\nStrict typed validation checks',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#A855F7',
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
    },
    {
      id: 'node-agent-verifier',
      type: 'icon',
      x: 620,
      y: 515,
      width: 230,
      height: 78,
      iconName: 'infra-firewall',
      iconLabel: 'Attribution Verifier Agent',
      subtitle: 'Byte offset & XPath locator\nGuarantees zero hallucinations',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#A855F7',
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
    },
    {
      id: 'node-agent-critic',
      type: 'icon',
      x: 890,
      y: 515,
      width: 230,
      height: 78,
      iconName: 'ai-meta',
      iconLabel: 'Self-Reflective Critic',
      subtitle: 'Confidence threshold scoring\nEvaluates schema completeness',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#A855F7',
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
    },

    // =========================================================================
    // TIER 04: PERSISTENCE, AUTO-HEALING & DOWNSTREAM AI INTEROP (Sky / Blue)
    // =========================================================================
    {
      id: 'tier-04',
      type: 'frame',
      x: 60,
      y: 665,
      width: 1100,
      height: 155,
      frameTitle: '04 · PERSISTENCE, AUTO-HEALING & DOWNSTREAM AI INTEROP',
      style: {
        fillColor: 'rgba(224, 242, 254, 0.22)',
        strokeColor: '#0284C7',
        strokeWidth: 1.5,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#0369A1',
        fontSize: 11,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 2,
    },
    {
      id: 'node-api-models',
      type: 'icon',
      x: 80,
      y: 710,
      width: 230,
      height: 78,
      iconName: 'gen-server',
      iconLabel: 'Downstream AI Models',
      subtitle: 'Claude 3.7, GPT-4o, Grok, Llama\nTool calling & agentic consumption',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#0284C7',
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
    },
    {
      id: 'node-api-gateway',
      type: 'icon',
      x: 350,
      y: 710,
      width: 230,
      height: 78,
      iconName: 'gen-cloud',
      iconLabel: 'Agentic JSON & SSE Gateway',
      subtitle: 'Standardized envelope & metadata\nModel Context Protocol (MCP)',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#0284C7',
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
    },
    {
      id: 'node-eval-drift',
      type: 'icon',
      x: 620,
      y: 710,
      width: 230,
      height: 78,
      iconName: 'tech-docker',
      iconLabel: 'Selector Drift Auto-Healer',
      subtitle: 'Screenshot vs historical DOM\nAuto-synthesizes updated selectors',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#0284C7',
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
    },
    {
      id: 'node-store-vector',
      type: 'icon',
      x: 890,
      y: 710,
      width: 230,
      height: 78,
      iconName: 'db-postgres',
      iconLabel: 'pgvector & Knowledge Lake',
      subtitle: 'Dense & sparse BM25 search\nImmutable temporal snapshot lake',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#0284C7',
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
    },

    // =========================================================================
    // COLOR-CODED ORTHOGONAL CONNECTORS (HIERARCHICAL WATERFALL)
    // =========================================================================
    // TIER 1 FLOW: Col 1 -> Col 2 -> Col 3 -> Col 4
    {
      id: 'c-s1',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-crawl-frontier', fromAnchor: 'right',
      toId: 'node-crawl-stealth', toAnchor: 'left',
      startPoint: { x: 310, y: 164 }, endPoint: { x: 350, y: 164 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'dispatch target URLs',
      style: { fillColor: 'transparent', strokeColor: '#FB923C', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#C2410C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s2',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-crawl-stealth', fromAnchor: 'right',
      toId: 'node-crawl-playwright', toAnchor: 'left',
      startPoint: { x: 580, y: 164 }, endPoint: { x: 620, y: 164 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'stealth residential proxy',
      style: { fillColor: 'transparent', strokeColor: '#FB923C', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#C2410C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s3',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-crawl-playwright', fromAnchor: 'right',
      toId: 'node-crawl-snapshot', toAnchor: 'left',
      startPoint: { x: 850, y: 164 }, endPoint: { x: 890, y: 164 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'store raw DOM & WebP',
      style: { fillColor: 'transparent', strokeColor: '#FB923C', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#C2410C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 1 -> TIER 2 PIPELINE (Clean vertical drop at Column 4)
    {
      id: 'c-s4',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-crawl-snapshot', fromAnchor: 'bottom',
      toId: 'node-extract-cleaner', toAnchor: 'top',
      startPoint: { x: 1005, y: 203 }, endPoint: { x: 1005, y: 320 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'feed unparsed HTML',
      style: { fillColor: 'transparent', strokeColor: '#22C55E', strokeWidth: 1.8, strokeStyle: 'solid', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 2 FLOW: Cleaner -> Vision & Markdown -> Chunker
    {
      id: 'c-s5',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-extract-cleaner', fromAnchor: 'left',
      toId: 'node-extract-vision', toAnchor: 'right',
      startPoint: { x: 890, y: 359 }, endPoint: { x: 850, y: 359 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'screenshot for OCR',
      style: { fillColor: 'transparent', strokeColor: '#22C55E', strokeWidth: 1.5, strokeStyle: 'dashed', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s6',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-extract-cleaner', fromAnchor: 'bottom',
      toId: 'node-extract-markdown', toAnchor: 'bottom',
      startPoint: { x: 950, y: 398 }, endPoint: { x: 465, y: 398 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'pruned clean AST',
      style: { fillColor: 'transparent', strokeColor: '#22C55E', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s7',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-extract-markdown', fromAnchor: 'left',
      toId: 'node-extract-chunker', toAnchor: 'right',
      startPoint: { x: 350, y: 359 }, endPoint: { x: 310, y: 359 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'tokenized markdown',
      style: { fillColor: 'transparent', strokeColor: '#22C55E', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 2 -> TIER 3 PIPELINE (Clean vertical drop at Column 1)
    {
      id: 'c-s8',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-extract-chunker', fromAnchor: 'bottom',
      toId: 'node-agent-orchestrator', toAnchor: 'top',
      startPoint: { x: 195, y: 398 }, endPoint: { x: 195, y: 515 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'structured context blocks',
      style: { fillColor: 'transparent', strokeColor: '#A855F7', strokeWidth: 1.8, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 3 FLOW: Orchestrator -> Extractor -> Verifier -> Critic
    {
      id: 'c-s9',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-orchestrator', fromAnchor: 'right',
      toId: 'node-agent-extractor', toAnchor: 'left',
      startPoint: { x: 310, y: 554 }, endPoint: { x: 350, y: 554 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'assign schema goals',
      style: { fillColor: 'transparent', strokeColor: '#A855F7', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s10',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-extractor', fromAnchor: 'right',
      toId: 'node-agent-verifier', toAnchor: 'left',
      startPoint: { x: 580, y: 554 }, endPoint: { x: 620, y: 554 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'extracted candidates',
      style: { fillColor: 'transparent', strokeColor: '#A855F7', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s11',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-verifier', fromAnchor: 'right',
      toId: 'node-agent-critic', toAnchor: 'left',
      startPoint: { x: 850, y: 554 }, endPoint: { x: 890, y: 554 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'grounded source claims',
      style: { fillColor: 'transparent', strokeColor: '#A855F7', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    // CRITIC RETRY LOOP BACK TO ORCHESTRATOR
    {
      id: 'c-s12',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-critic', fromAnchor: 'top',
      toId: 'node-agent-orchestrator', toAnchor: 'top',
      startPoint: { x: 950, y: 515 }, endPoint: { x: 250, y: 515 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'confidence < 0.90 (retry DAG)',
      style: { fillColor: 'transparent', strokeColor: '#C084FC', strokeWidth: 1.5, strokeStyle: 'dashed', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 3 -> TIER 4 PIPELINE (Clean vertical drop at Column 4)
    {
      id: 'c-s13',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-critic', fromAnchor: 'bottom',
      toId: 'node-store-vector', toAnchor: 'top',
      startPoint: { x: 1005, y: 593 }, endPoint: { x: 1005, y: 710 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'certified knowledge output',
      style: { fillColor: 'transparent', strokeColor: '#0284C7', strokeWidth: 1.8, strokeStyle: 'solid', roughness: 0, textColor: '#0369A1', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 4 FLOW: Vector Store -> Auto-Healer -> Gateway -> Models
    {
      id: 'c-s14',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-store-vector', fromAnchor: 'left',
      toId: 'node-eval-drift', toAnchor: 'right',
      startPoint: { x: 890, y: 749 }, endPoint: { x: 850, y: 749 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'ground-truth benchmarks',
      style: { fillColor: 'transparent', strokeColor: '#0284C7', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#0369A1', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s15',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-eval-drift', fromAnchor: 'left',
      toId: 'node-api-gateway', toAnchor: 'right',
      startPoint: { x: 620, y: 749 }, endPoint: { x: 580, y: 749 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'verified JSON schemas',
      style: { fillColor: 'transparent', strokeColor: '#0284C7', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#0369A1', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s16',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-api-gateway', fromAnchor: 'left',
      toId: 'node-api-models', toAnchor: 'right',
      startPoint: { x: 350, y: 749 }, endPoint: { x: 310, y: 749 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'stream JSON & MCP payload',
      style: { fillColor: 'transparent', strokeColor: '#0284C7', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#0369A1', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // FEEDBACK LOOPS BACK TO INGESTION & ORCHESTRATION
    {
      id: 'c-s17',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-eval-drift', fromAnchor: 'top',
      toId: 'node-crawl-frontier', toAnchor: 'bottom',
      startPoint: { x: 735, y: 710 }, endPoint: { x: 250, y: 203 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'auto-healed DOM selectors',
      style: { fillColor: 'transparent', strokeColor: '#F59E0B', strokeWidth: 1.5, strokeStyle: 'dashed', roughness: 0, textColor: '#B45309', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s18',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-api-models', fromAnchor: 'top',
      toId: 'node-agent-orchestrator', toAnchor: 'bottom',
      startPoint: { x: 135, y: 710 }, endPoint: { x: 135, y: 593 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'model feedback telemetry',
      style: { fillColor: 'transparent', strokeColor: '#38BDF8', strokeWidth: 1.5, strokeStyle: 'dashed', roughness: 0, textColor: '#0284C7', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
  ],
};
