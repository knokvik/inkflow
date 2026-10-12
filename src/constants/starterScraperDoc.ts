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
      height: 1040,
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
      height: 135,
      frameTitle: '01 - DISTRIBUTED CRAWLER & STEALTH INGESTION TIER',
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
      y: 115,
      width: 220,
      height: 80,
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
      y: 115,
      width: 220,
      height: 80,
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
      y: 115,
      width: 230,
      height: 80,
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
      x: 900,
      y: 115,
      width: 230,
      height: 80,
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
      y: 240,
      width: 1100,
      height: 135,
      frameTitle: '02 - NORMALIZATION & MULTIMODAL EXTRACTION TIER',
      style: {
        fillColor: 'rgba(220, 252, 231, 0.22)',
        strokeColor: '#4ADE80',
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
      id: 'node-extract-cleaner',
      type: 'icon',
      x: 80,
      y: 275,
      width: 220,
      height: 80,
      iconName: 'aws-lambda',
      iconLabel: 'DOM Pruner & Cleanser',
      subtitle: 'Strip scripts, ads & boilerplate\nSemantic Readability AST tree',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#4ADE80',
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
      y: 275,
      width: 220,
      height: 80,
      iconName: 'tech-python',
      iconLabel: 'LLM-Ready Markdown Engine',
      subtitle: 'Preserves tables, lists & code\nToken-efficient clean text',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#4ADE80',
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
      y: 275,
      width: 230,
      height: 80,
      iconName: 'tech-docker',
      iconLabel: 'Multimodal Vision & OCR',
      subtitle: 'Visual tables & infographics\nSpatial layout grounding',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#4ADE80',
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
      id: 'node-extract-chunker',
      type: 'icon',
      x: 900,
      y: 275,
      width: 230,
      height: 80,
      iconName: 'tech-kafka',
      iconLabel: 'Hierarchical Chunker',
      subtitle: 'Parent-child semantic chunks\nBoundary-aware token slicer',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#4ADE80',
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
    // TIER 03: MULTI-AGENT SYNTHESIS & REASONING (Violet / Purple)
    // =========================================================================
    {
      id: 'tier-03',
      type: 'frame',
      x: 60,
      y: 400,
      width: 1100,
      height: 145,
      frameTitle: '03 - MULTI-AGENT SYNTHESIS & REASONING TIER',
      style: {
        fillColor: 'rgba(243, 232, 255, 0.22)',
        strokeColor: '#C084FC',
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
      y: 435,
      width: 220,
      height: 85,
      iconName: 'gen-microservice',
      iconLabel: 'Agent Orchestrator',
      subtitle: 'Decomposes user target schemas\nDynamic DAG execution planner',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#C084FC',
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
      y: 435,
      width: 220,
      height: 85,
      iconName: 'tech-typescript',
      iconLabel: 'Entity Extraction Agent',
      subtitle: 'Pydantic/Zod typed parser\nExtracts attributes & relations',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#C084FC',
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
      y: 435,
      width: 230,
      height: 85,
      iconName: 'gen-shield',
      iconLabel: 'Fact-Check & Attribution',
      subtitle: 'Validates claims against raw DOM\nGenerates byte & XPath offsets',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#C084FC',
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
      x: 900,
      y: 435,
      width: 230,
      height: 85,
      iconName: 'aws-step-functions',
      iconLabel: 'Self-Reflective Critic',
      subtitle: 'Confidence threshold scoring\nTriggers retries if score < 0.90',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#C084FC',
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
    // TIER 04: VECTOR KNOWLEDGE & PERSISTENT STORAGE (Cyan / Teal)
    // =========================================================================
    {
      id: 'tier-04',
      type: 'frame',
      x: 60,
      y: 570,
      width: 1100,
      height: 135,
      frameTitle: '04 - VECTOR KNOWLEDGE & PERSISTENT STORAGE TIER',
      style: {
        fillColor: 'rgba(207, 250, 254, 0.22)',
        strokeColor: '#2DD4BF',
        strokeWidth: 1.5,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#0F766E',
        fontSize: 11,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 2,
    },
    {
      id: 'node-db-vector',
      type: 'icon',
      x: 80,
      y: 605,
      width: 220,
      height: 80,
      iconName: 'db-postgres',
      iconLabel: 'pgvector / Qdrant Store',
      subtitle: 'Dense & sparse hybrid search\nSub-second semantic recall',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#2DD4BF',
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
      id: 'node-db-raw',
      type: 'icon',
      x: 350,
      y: 605,
      width: 220,
      height: 80,
      iconName: 'db-mongodb',
      iconLabel: 'Snapshot Content Lake',
      subtitle: 'Immutable revision history\nAudit trace & temporal diffs',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#2DD4BF',
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
      id: 'node-db-redis',
      type: 'icon',
      x: 620,
      y: 605,
      width: 230,
      height: 80,
      iconName: 'db-redis',
      iconLabel: 'Redis State & Task Queue',
      subtitle: 'Worker lease locks & pub/sub\nDistributed token rate-limiting',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#2DD4BF',
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
      id: 'node-db-events',
      type: 'icon',
      x: 900,
      y: 605,
      width: 230,
      height: 80,
      iconName: 'tech-kafka',
      iconLabel: 'Kafka Stream Broker',
      subtitle: 'Real-time scrape event stream\nCDC pub/sub for downstream apps',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#2DD4BF',
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
    // TIER 05: CONTINUOUS EVALUATION & SELF-IMPROVEMENT LOOP (Rose / Pink)
    // =========================================================================
    {
      id: 'tier-05',
      type: 'frame',
      x: 60,
      y: 730,
      width: 1100,
      height: 135,
      frameTitle: '05 - CONTINUOUS EVALUATION & SELF-IMPROVEMENT LOOP',
      style: {
        fillColor: 'rgba(255, 228, 230, 0.22)',
        strokeColor: '#FB7185',
        strokeWidth: 1.5,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#BE123C',
        fontSize: 11,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 2,
    },
    {
      id: 'node-eval-bench',
      type: 'icon',
      x: 80,
      y: 765,
      width: 220,
      height: 80,
      iconName: 'aws-lambda',
      iconLabel: 'Ground-Truth Evaluator',
      subtitle: 'Precision / Recall / Faithfulness\nAutomated eval benchmark suite',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#FB7185',
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
      x: 350,
      y: 765,
      width: 220,
      height: 80,
      iconName: 'infra-firewall',
      iconLabel: 'Drift & Selector Auto-Healer',
      subtitle: 'Detects page layout changes\nSynthesizes new CSS/XPath rules',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#FB7185',
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
      id: 'node-eval-optimizer',
      type: 'icon',
      x: 620,
      y: 765,
      width: 230,
      height: 80,
      iconName: 'tech-python',
      iconLabel: 'DSPy Prompt Optimizer',
      subtitle: 'Self-tuning few-shot prompts\nMinimizes token cost & latency',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#FB7185',
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
      id: 'node-eval-feedback',
      type: 'icon',
      x: 900,
      y: 765,
      width: 230,
      height: 80,
      iconName: 'aws-step-functions',
      iconLabel: 'Active Learning Feedback',
      subtitle: 'Curates hard edge-cases dataset\nContinuous model fine-tuning loop',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#FB7185',
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
    // TIER 06: AGENTIC API GATEWAY & DOWNSTREAM CONSUMPTION (Slate / Zinc)
    // =========================================================================
    {
      id: 'tier-06',
      type: 'frame',
      x: 60,
      y: 890,
      width: 1100,
      height: 135,
      frameTitle: '06 - AGENTIC API GATEWAY & DOWNSTREAM CONSUMPTION TIER',
      style: {
        fillColor: 'rgba(241, 245, 249, 0.22)',
        strokeColor: '#94A3B8',
        strokeWidth: 1.5,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#334155',
        fontSize: 11,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 2,
    },
    {
      id: 'node-api-gateway',
      type: 'icon',
      x: 80,
      y: 925,
      width: 220,
      height: 80,
      iconName: 'aws-api-gateway',
      iconLabel: 'Streaming SSE & REST API',
      subtitle: 'Sub-second chunked streaming\nStandardized OpenAPI endpoints',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#94A3B8',
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
      id: 'node-api-schema',
      type: 'icon',
      x: 350,
      y: 925,
      width: 220,
      height: 80,
      iconName: 'tech-graphql',
      iconLabel: 'Agentic JSON Formatter',
      subtitle: 'JSON Schema + confidence tags\nSource citations & graph triplets',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#94A3B8',
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
      id: 'node-api-models',
      type: 'icon',
      x: 620,
      y: 925,
      width: 230,
      height: 80,
      iconName: 'gen-server',
      iconLabel: 'Downstream AI Models',
      subtitle: 'Claude 3.7, GPT-4o, Grok, Llama\nMCP & tool calling interop',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#94A3B8',
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
      id: 'node-api-telemetry',
      type: 'icon',
      x: 900,
      y: 925,
      width: 230,
      height: 80,
      iconName: 'gen-cloud',
      iconLabel: 'Model Quality Telemetry',
      subtitle: 'Downstream satisfaction rating\nLatency, schema match & hit rates',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#94A3B8',
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
    // COLOR-CODED ORTHOGONAL CONNECTORS
    // =========================================================================
    // TIER 1 FLOW
    {
      id: 'c-s1',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-crawl-frontier', fromAnchor: 'right',
      toId: 'node-crawl-stealth', toAnchor: 'left',
      startPoint: { x: 300, y: 155 }, endPoint: { x: 350, y: 155 },
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
      startPoint: { x: 570, y: 155 }, endPoint: { x: 620, y: 155 },
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
      startPoint: { x: 850, y: 155 }, endPoint: { x: 900, y: 155 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'store raw DOM & WebP',
      style: { fillColor: 'transparent', strokeColor: '#FB923C', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#C2410C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 1 -> TIER 2 PIPELINE
    {
      id: 'c-s4',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-crawl-snapshot', fromAnchor: 'bottom',
      toId: 'node-extract-cleaner', toAnchor: 'top',
      startPoint: { x: 1015, y: 195 }, endPoint: { x: 190, y: 275 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'feed unparsed HTML',
      style: { fillColor: 'transparent', strokeColor: '#4ADE80', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 2 FLOW
    {
      id: 'c-s5',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-extract-cleaner', fromAnchor: 'right',
      toId: 'node-extract-markdown', toAnchor: 'left',
      startPoint: { x: 300, y: 315 }, endPoint: { x: 350, y: 315 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'pruned clean AST',
      style: { fillColor: 'transparent', strokeColor: '#4ADE80', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s6',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-extract-cleaner', fromAnchor: 'right',
      toId: 'node-extract-vision', toAnchor: 'left',
      startPoint: { x: 300, y: 315 }, endPoint: { x: 620, y: 315 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'screenshot for OCR',
      style: { fillColor: 'transparent', strokeColor: '#4ADE80', strokeWidth: 1.5, strokeStyle: 'dashed', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s7',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-extract-markdown', fromAnchor: 'right',
      toId: 'node-extract-chunker', toAnchor: 'left',
      startPoint: { x: 570, y: 315 }, endPoint: { x: 900, y: 315 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'tokenized markdown',
      style: { fillColor: 'transparent', strokeColor: '#4ADE80', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 2 -> TIER 3 PIPELINE
    {
      id: 'c-s8',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-extract-chunker', fromAnchor: 'bottom',
      toId: 'node-agent-orchestrator', toAnchor: 'top',
      startPoint: { x: 1015, y: 355 }, endPoint: { x: 190, y: 435 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'structured context blocks',
      style: { fillColor: 'transparent', strokeColor: '#C084FC', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 3 FLOW
    {
      id: 'c-s9',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-orchestrator', fromAnchor: 'right',
      toId: 'node-agent-extractor', toAnchor: 'left',
      startPoint: { x: 300, y: 477 }, endPoint: { x: 350, y: 477 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'assign schema goals',
      style: { fillColor: 'transparent', strokeColor: '#C084FC', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s10',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-extractor', fromAnchor: 'right',
      toId: 'node-agent-verifier', toAnchor: 'left',
      startPoint: { x: 570, y: 477 }, endPoint: { x: 620, y: 477 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'extracted candidates',
      style: { fillColor: 'transparent', strokeColor: '#C084FC', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s11',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-verifier', fromAnchor: 'right',
      toId: 'node-agent-critic', toAnchor: 'left',
      startPoint: { x: 850, y: 477 }, endPoint: { x: 900, y: 477 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'grounded source claims',
      style: { fillColor: 'transparent', strokeColor: '#C084FC', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    // CRITIC RETRY LOOP BACK TO ORCHESTRATOR
    {
      id: 'c-s12',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-critic', fromAnchor: 'top',
      toId: 'node-agent-orchestrator', toAnchor: 'top',
      startPoint: { x: 1015, y: 435 }, endPoint: { x: 190, y: 435 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'retry if confidence < 0.90',
      style: { fillColor: 'transparent', strokeColor: '#FB7185', strokeWidth: 1.5, strokeStyle: 'dashed', roughness: 0, textColor: '#BE123C', fontSize: 9.5, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 6,
    },

    // TIER 3 -> TIER 4 STORAGE PIPELINE
    {
      id: 'c-s13',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-critic', fromAnchor: 'bottom',
      toId: 'node-db-vector', toAnchor: 'top',
      startPoint: { x: 950, y: 520 }, endPoint: { x: 190, y: 605 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'embed verified entities',
      style: { fillColor: 'transparent', strokeColor: '#2DD4BF', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#0F766E', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s14',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-critic', fromAnchor: 'bottom',
      toId: 'node-db-raw', toAnchor: 'top',
      startPoint: { x: 1015, y: 520 }, endPoint: { x: 460, y: 605 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'persist validated records',
      style: { fillColor: 'transparent', strokeColor: '#2DD4BF', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#0F766E', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s15',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-agent-critic', fromAnchor: 'bottom',
      toId: 'node-db-events', toAnchor: 'top',
      startPoint: { x: 1080, y: 520 }, endPoint: { x: 1015, y: 605 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'emit scrape event CDC',
      style: { fillColor: 'transparent', strokeColor: '#2DD4BF', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#0F766E', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },

    // TIER 4 -> TIER 5 EVALUATION & SELF-IMPROVEMENT LOOP
    {
      id: 'c-s16',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-db-raw', fromAnchor: 'bottom',
      toId: 'node-eval-bench', toAnchor: 'top',
      startPoint: { x: 460, y: 685 }, endPoint: { x: 190, y: 765 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'run eval test suite',
      style: { fillColor: 'transparent', strokeColor: '#FB7185', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#BE123C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s17',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-eval-bench', fromAnchor: 'right',
      toId: 'node-eval-drift', toAnchor: 'left',
      startPoint: { x: 300, y: 805 }, endPoint: { x: 350, y: 805 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'flag selector degradation',
      style: { fillColor: 'transparent', strokeColor: '#FB7185', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#BE123C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s18',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-eval-drift', fromAnchor: 'top',
      toId: 'node-crawl-frontier', toAnchor: 'left',
      startPoint: { x: 460, y: 765 }, endPoint: { x: 80, y: 155 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'auto-healed DOM selectors',
      style: { fillColor: 'transparent', strokeColor: '#FB7185', strokeWidth: 1.5, strokeStyle: 'dashed', roughness: 0, textColor: '#BE123C', fontSize: 9.5, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 6,
    },
    {
      id: 'c-s19',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-eval-bench', fromAnchor: 'right',
      toId: 'node-eval-optimizer', toAnchor: 'left',
      startPoint: { x: 300, y: 805 }, endPoint: { x: 620, y: 805 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'DSPy few-shot feedback',
      style: { fillColor: 'transparent', strokeColor: '#FB7185', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#BE123C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s20',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-eval-optimizer', fromAnchor: 'top',
      toId: 'node-agent-extractor', toAnchor: 'bottom',
      startPoint: { x: 735, y: 765 }, endPoint: { x: 460, y: 520 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'deploy optimized prompts',
      style: { fillColor: 'transparent', strokeColor: '#FB7185', strokeWidth: 1.5, strokeStyle: 'dashed', roughness: 0, textColor: '#BE123C', fontSize: 9.5, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 6,
    },

    // TIER 4/5 -> TIER 6 GATEWAY & DOWNSTREAM CONSUMPTION
    {
      id: 'c-s21',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-db-vector', fromAnchor: 'bottom',
      toId: 'node-api-gateway', toAnchor: 'top',
      startPoint: { x: 190, y: 685 }, endPoint: { x: 190, y: 925 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'hybrid vector search',
      style: { fillColor: 'transparent', strokeColor: '#94A3B8', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#334155', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s22',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-api-gateway', fromAnchor: 'right',
      toId: 'node-api-schema', toAnchor: 'left',
      startPoint: { x: 300, y: 965 }, endPoint: { x: 350, y: 965 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'serialize JSON schema',
      style: { fillColor: 'transparent', strokeColor: '#94A3B8', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#334155', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s23',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-api-schema', fromAnchor: 'right',
      toId: 'node-api-models', toAnchor: 'left',
      startPoint: { x: 570, y: 965 }, endPoint: { x: 620, y: 965 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'stream agentic payload',
      style: { fillColor: 'transparent', strokeColor: '#94A3B8', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#334155', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s24',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-api-models', fromAnchor: 'right',
      toId: 'node-api-telemetry', toAnchor: 'left',
      startPoint: { x: 850, y: 965 }, endPoint: { x: 900, y: 965 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'log model success rating',
      style: { fillColor: 'transparent', strokeColor: '#94A3B8', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#334155', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'c-s25',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'node-api-telemetry', fromAnchor: 'top',
      toId: 'node-eval-feedback', toAnchor: 'bottom',
      startPoint: { x: 1015, y: 925 }, endPoint: { x: 1015, y: 845 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'fine-tuning telemetry',
      style: { fillColor: 'transparent', strokeColor: '#FB7185', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#BE123C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
  ],
};
