import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { STARTER_AGENTIC_SCRAPER_DOCUMENT } from './src/constants/starterScraperDoc';

// Initialize live diagram state with starter agentic scraper topology
let currentDiagramState: {
  elements: any[];
  doc: string;
  title: string;
  updatedAt: number;
} = {
  elements: STARTER_AGENTIC_SCRAPER_DOCUMENT.elements || [],
  doc: STARTER_AGENTIC_SCRAPER_DOCUMENT.content || '',
  title: STARTER_AGENTIC_SCRAPER_DOCUMENT.title || 'Autonomous AI Web Scraper & Multi-Agent Intelligence',
  updatedAt: Date.now(),
};

let sseClients: any[] = [];

/**
 * Strict Visual Canvas Sanitizer
 * Ensures incoming AI models can ONLY create/modify visual diagram components
 * and cannot alter source code, execute system scripts, or pollute prototypes.
 */
function sanitizeCanvasElement(el: any) {
  if (!el || typeof el !== 'object') return null;

  const allowedTypes = [
    'icon',
    'frame',
    'connector',
    'rounded-rect',
    'rectangle',
    'circle',
    'diamond',
    'cylinder',
    'text',
    'sticky',
    'pen',
  ];
  const rawType = typeof el.type === 'string' ? el.type.toLowerCase().trim() : 'icon';
  const type = allowedTypes.includes(rawType) ? rawType : 'icon';

  const sanitized: any = {
    id: typeof el.id === 'string' ? el.id.slice(0, 64) : `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    x: typeof el.x === 'number' && !isNaN(el.x) ? Math.round(el.x) : 0,
    y: typeof el.y === 'number' && !isNaN(el.y) ? Math.round(el.y) : 0,
    width: typeof el.width === 'number' && !isNaN(el.width) ? Math.max(10, Math.round(el.width)) : (type === 'icon' ? 230 : 100),
    height: typeof el.height === 'number' && !isNaN(el.height) ? Math.max(10, Math.round(el.height)) : (type === 'icon' ? 78 : 50),
    zIndex: typeof el.zIndex === 'number' ? el.zIndex : (type === 'frame' ? 1 : 10),
  };

  if (typeof el.text === 'string') sanitized.text = el.text.slice(0, 2000);
  if (typeof el.subtitle === 'string') sanitized.subtitle = el.subtitle.slice(0, 500);
  if (typeof el.iconName === 'string') sanitized.iconName = el.iconName.slice(0, 64);
  if (typeof el.iconLabel === 'string') sanitized.iconLabel = el.iconLabel.slice(0, 200);
  if (typeof el.frameTitle === 'string') sanitized.frameTitle = el.frameTitle.slice(0, 200);
  if (typeof el.tierTag === 'string') sanitized.tierTag = el.tierTag.slice(0, 50);
  if (typeof el.stickyColor === 'string') sanitized.stickyColor = el.stickyColor.slice(0, 20);

  // Connector properties
  if (typeof el.fromId === 'string') sanitized.fromId = el.fromId.slice(0, 64);
  if (typeof el.toId === 'string') sanitized.toId = el.toId.slice(0, 64);
  if (typeof el.fromAnchor === 'string') {
    sanitized.fromAnchor = ['top', 'bottom', 'left', 'right'].includes(el.fromAnchor) ? el.fromAnchor : 'right';
  }
  if (typeof el.toAnchor === 'string') {
    sanitized.toAnchor = ['top', 'bottom', 'left', 'right'].includes(el.toAnchor) ? el.toAnchor : 'left';
  }
  if (typeof el.routing === 'string') {
    sanitized.routing = ['orthogonal', 'straight', 'curved'].includes(el.routing) ? el.routing : 'orthogonal';
  }
  if (typeof el.arrowEnd === 'boolean') sanitized.arrowEnd = el.arrowEnd;
  if (typeof el.connectorLabel === 'string') sanitized.connectorLabel = el.connectorLabel.slice(0, 200);

  // Style properties whitelist
  if (el.style && typeof el.style === 'object') {
    sanitized.style = {
      fillColor: typeof el.style.fillColor === 'string' ? el.style.fillColor.slice(0, 50) : '#FFFFFF',
      strokeColor: typeof el.style.strokeColor === 'string' ? el.style.strokeColor.slice(0, 50) : '#525252',
      strokeWidth: typeof el.style.strokeWidth === 'number' ? Math.min(10, Math.max(0.5, el.style.strokeWidth)) : 1.5,
      strokeStyle: typeof el.style.strokeStyle === 'string' ? el.style.strokeStyle : 'solid',
      roughness: typeof el.style.roughness === 'number' ? Math.max(0, Math.min(5, el.style.roughness)) : 0,
      textColor: typeof el.style.textColor === 'string' ? el.style.textColor.slice(0, 50) : '#0F172A',
      fontSize: typeof el.style.fontSize === 'number' ? Math.min(72, Math.max(8, el.style.fontSize)) : 12,
      fontFamily: typeof el.style.fontFamily === 'string' ? el.style.fontFamily : 'sans',
      textAlign: typeof el.style.textAlign === 'string' ? el.style.textAlign : 'left',
      opacity: typeof el.style.opacity === 'number' ? Math.min(1, Math.max(0, el.style.opacity)) : 1,
    };
  } else {
    sanitized.style = {
      fillColor: '#FFFFFF',
      strokeColor: '#525252',
      strokeWidth: 1.5,
      strokeStyle: 'solid',
      roughness: 0,
      textColor: '#0F172A',
      fontSize: 12,
      fontFamily: 'sans',
      textAlign: 'left',
      opacity: 1,
    };
  }

  return sanitized;
}

/**
 * Builds the comprehensive unified AI context payload
 */
function getUnifiedContextPayload() {
  return {
    service: 'Inkflow Visual Architecture Engine',
    version: '1.0.0',
    status: 'online',
    port: 5173,
    timestamp: Date.now(),
    role: 'Visual Architecture & Diagram Designer',
    security_sandbox_boundary: {
      status: 'STRICTLY_ENFORCED',
      boundary_type: 'Visual Canvas & Documentation Sandbox Only',
      allowed_capabilities: [
        'Compose and edit visual architecture components (frames, icon cards, orthogonal connectors, shapes)',
        'Update technical architecture markdown documentation and mermaid topologies',
        'Set high-level architecture diagram titles and tier groupings',
      ],
      strictly_forbidden_actions: [
        'Modifying application source code (*.ts, *.tsx, *.json, configs)',
        'Accessing local filesystem or environment files',
        'Running terminal or operating system commands',
        'Injecting executable scripts or arbitrary code into canvas components',
      ],
      enforcement_details:
        'The POST /api/diagram endpoint strictly validates each element against a visual layout whitelist. Non-visual fields, shell commands, scripts, and prototype chains are discarded.',
    },
    live_diagram_state: {
      title: currentDiagramState.title,
      elementsCount: currentDiagramState.elements.length,
      updatedAt: currentDiagramState.updatedAt,
      elements: currentDiagramState.elements,
      doc: currentDiagramState.doc,
    },
    api_endpoints: {
      unified_context: 'GET http://localhost:5173/api/context',
      read_diagram: 'GET http://localhost:5173/api/diagram',
      write_diagram: 'POST http://localhost:5173/api/diagram',
      read_schema: 'GET http://localhost:5173/api/schema',
      read_prompt: 'GET http://localhost:5173/api/prompt',
      open_chrome: 'POST http://localhost:5173/api/open-chrome',
      live_stream: 'GET http://localhost:5173/api/stream',
    },
    quick_execution_commands: {
      get_context: 'curl http://localhost:5173/api/context',
      read_state: 'curl http://localhost:5173/api/diagram',
      apply_update:
        'curl -X POST http://localhost:5173/api/diagram -H "Content-Type: application/json" -d \'{"title": "...", "doc": "...", "elements": [...]}\'',
    },
    visual_component_contract: {
      node_spec: {
        type: 'icon',
        width: 230,
        height: 78,
        fields: {
          id: 'string (unique identifier, e.g. "node-auth", "node-redis")',
          type: 'icon',
          x: 'number (Col 1: 80, Col 2: 350, Col 3: 620, Col 4: 890)',
          y: 'number (Tier 1: 120, Tier 2: 315, Tier 3: 510, Tier 4: 705)',
          width: 230,
          height: 78,
          iconName:
            'string (tech-docker, tech-python, tech-react, aws-lambda, aws-s3, gcp-cloud-run, tech-redis, tech-kafka, gen-server, gen-database)',
          iconLabel: 'string (Primary title, e.g. "API Gateway")',
          subtitle: 'string (2-line technical details separated by \\n)',
          style: {
            fillColor: 'string (#FFFFFF in Light mode, #242424 in Dark mode)',
            strokeColor: 'string (Tier color: #FB923C, #10B981, #A855F7, or #3B82F6)',
            strokeWidth: 1.5,
            textColor: '#0F172A',
            fontSize: 12,
          },
        },
      },
      frame_spec: {
        type: 'frame',
        width: 1100,
        height: 155,
        x: 60,
        fields: {
          id: 'string (e.g. "tier-01")',
          type: 'frame',
          x: 60,
          y: 'number (Tier 1: 80, Tier 2: 275, Tier 3: 470, Tier 4: 665)',
          width: 1100,
          height: 155,
          frameTitle: 'string (e.g. "01 · CLIENT & INGESTION TIER")',
          style: {
            fillColor: 'soft pastel tint (e.g. rgba(254, 243, 199, 0.22))',
            strokeColor: 'tier color (e.g. #FB923C)',
            strokeWidth: 1.5,
          },
        },
        standard_tiers: [
          { tier: 1, name: 'Client & Ingestion', frame_y: 80, nodes_y: 120, color: '#FB923C', fill: 'rgba(254, 243, 199, 0.22)' },
          { tier: 2, name: 'Processing & Extraction', frame_y: 275, nodes_y: 315, color: '#10B981', fill: 'rgba(209, 250, 229, 0.22)' },
          { tier: 3, name: 'Multi-Agent Logic & Synthesis', frame_y: 470, nodes_y: 510, color: '#A855F7', fill: 'rgba(243, 232, 255, 0.25)' },
          { tier: 4, name: 'Storage, Vector & Gateway', frame_y: 665, nodes_y: 705, color: '#3B82F6', fill: 'rgba(219, 234, 254, 0.25)' },
        ],
      },
      connector_spec: {
        type: 'connector',
        routing: 'orthogonal',
        arrowEnd: true,
        fields: {
          id: 'string (e.g. "c-1")',
          type: 'connector',
          fromId: 'string (source node id)',
          toId: 'string (target node id)',
          fromAnchor: '"right" (intra-tier) | "bottom" (cross-tier)',
          toAnchor: '"left" (intra-tier) | "top" (cross-tier)',
          connectorLabel: 'string (e.g. "HTTPS / JSON", "Kafka Stream", "gRPC")',
          style: {
            strokeColor: 'string (e.g. #3B82F6)',
            strokeWidth: 1.5,
          },
        },
      },
      layout_grid: {
        columns_x: [80, 350, 620, 890],
      },
    },
    dual_theme_design_guidelines: {
      light_theme: {
        canvas_bg: '#FAFAFA with light dot grid',
        cards: { bg: '#FFFFFF', title: '#0F172A', subtitle: '#475569', border: 'solid 1.5px tier color' },
        frames: {
          bg: 'soft pastel tint (opacity 0.20-0.25)',
          border: '1.5px solid tier color',
          badgeBg: '#FFFFFF',
          badgeText: '#0F172A',
        },
        connectors: { defaultStroke: '#4B5563', labelPillBg: '#FFFFFF', labelPillText: '#0F172A', labelPillBorder: '#CBD5E1' },
      },
      dark_theme: {
        canvas_bg: '#121212 with dark dot grid',
        cards: { bg: '#242424', title: '#F8FAFC', subtitle: '#94A3B8', border: 'solid 1.5px tier color' },
        frames: {
          bg: 'rgba(255, 255, 255, 0.02)',
          border: '1.5px solid tier color',
          badgeBg: '#1C1C1E',
          badgeText: '#F8FAFC',
        },
        connectors: { defaultStroke: '#D4D4D8', labelPillBg: '#181818', labelPillText: '#F8FAFC', labelPillBorder: '#383838' },
      },
    },
    supported_icon_catalog: [
      'tech-docker',
      'tech-kubernetes',
      'tech-python',
      'tech-react',
      'tech-node',
      'tech-redis',
      'tech-kafka',
      'tech-postgres',
      'tech-mongo',
      'tech-graphql',
      'aws-lambda',
      'aws-s3',
      'aws-dynamodb',
      'aws-cloudfront',
      'aws-sqs',
      'aws-sns',
      'aws-api-gateway',
      'aws-rds',
      'aws-ecs',
      'gcp-cloud-run',
      'gcp-bigquery',
      'gcp-gcs',
      'gcp-pubsub',
      'gen-server',
      'gen-database',
      'gen-browser',
      'gen-mobile',
      'gen-microservice',
      'gen-queue',
      'gen-cache',
    ],
  };
}

function localAiBridgePlugin(): Plugin {
  return {
    name: 'local-ai-bridge',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '';
        const url = rawUrl.split('?')[0] || '';

        // CORS headers for universal local AI interoperability
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, User-Agent');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        // =========================================================================
        // 1. UNIFIED GET CONTEXT ENDPOINT
        // Available at /api/context, /context, and on / when requested via JSON/curl
        // =========================================================================
        const isUnifiedContextUrl = url === '/api/context' || url === '/context';
        const isRootUrl = url === '/' || url === '';
        const isCurlClient = req.headers['user-agent']?.toLowerCase().includes('curl') || false;
        const isJsonPreferred =
          req.headers.accept?.includes('application/json') ||
          rawUrl.includes('?format=json') ||
          rawUrl.includes('?context=true') ||
          (isCurlClient && !req.headers.accept?.includes('text/html'));

        if (req.method === 'GET' && (isUnifiedContextUrl || (isRootUrl && isJsonPreferred))) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(getUnifiedContextPayload(), null, 2));
          return;
        }

        // Live SSE Stream for real-time canvas updates
        if (url === '/api/stream' && req.method === 'GET') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });
          res.write(`data: ${JSON.stringify({ type: 'init', state: currentDiagramState })}\n\n`);
          sseClients.push(res);
          req.on('close', () => {
            sseClients = sseClients.filter((c) => c !== res);
          });
          return;
        }

        // GET /api/diagram - Read current canvas state
        if (url === '/api/diagram' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(currentDiagramState));
          return;
        }

        // POST /api/diagram - Live edit canvas with strict visual sandboxing
        if (url === '/api/diagram' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 5 * 1024 * 1024) {
              req.destroy();
            }
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');

              // Strict visual component sanitization
              if (Array.isArray(data.elements)) {
                currentDiagramState.elements = data.elements.map(sanitizeCanvasElement).filter(Boolean);
              }
              if (typeof data.doc === 'string') {
                currentDiagramState.doc = data.doc.slice(0, 100000);
              }
              if (typeof data.title === 'string') {
                currentDiagramState.title = data.title.slice(0, 200);
              }
              currentDiagramState.updatedAt = Date.now();

              // Broadcast live to connected canvas web tabs unless it is an internal client sync
              if (!data.clientSyncOnly) {
                const payload = JSON.stringify({
                  type: 'update',
                  data: {
                    title: currentDiagramState.title,
                    doc: currentDiagramState.doc,
                    elements: currentDiagramState.elements,
                  },
                  state: currentDiagramState,
                });
                for (const client of sseClients) {
                  try {
                    client.write(`data: ${payload}\n\n`);
                  } catch (e) {
                    // ignore disconnected
                  }
                }
              }

              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(
                JSON.stringify({
                  success: true,
                  message: data.clientSyncOnly
                    ? 'Diagram state synced from client'
                    : 'Visual architecture canvas updated live. Protected source-code sandbox intact.',
                  sandbox_role: 'Visual Architecture Designer',
                  elementsCount: currentDiagramState.elements.length,
                  timestamp: Date.now(),
                })
              );
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // POST /api/open-chrome - Open app in Google Chrome
        if (url === '/api/open-chrome' && (req.method === 'POST' || req.method === 'GET')) {
          import('child_process').then(({ exec }) => {
            exec('open -a "Google Chrome" http://localhost:5173');
          });
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ success: true, message: 'Opening Google Chrome on http://localhost:5173' }));
          return;
        }

        // GET /api/schema - Machine-readable schema & specification for AI models
        if (url === '/api/schema' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(
            JSON.stringify(
              {
                service: 'Inkflow Architecture Engine',
                version: '1.0.0',
                description:
                  'Exact JSON contract for external AI models, agents, and CLI tools to create or update architecture diagrams on Inkflow canvas.',
                edit_command:
                  'curl -X POST http://localhost:5173/api/diagram -H "Content-Type: application/json" -d \'<JSON_PAYLOAD>\'',
                read_command: 'curl http://localhost:5173/api/diagram',
                payload_contract: {
                  title: 'string (Diagram title)',
                  doc: 'string (Markdown technical architecture specification with mermaid diagram and tier breakdown)',
                  elements: 'CanvasElement[] (Array of frames, nodes, and connectors)',
                },
                node_spec: {
                  type: 'icon',
                  width: 230,
                  height: 78,
                  fields: {
                    id: 'string (e.g. "node-auth", "node-redis")',
                    type: 'icon',
                    x: 'number (column 1: 80, col 2: 350, col 3: 620, col 4: 890)',
                    y: 'number (tier 1: 120, tier 2: 315, tier 3: 510, tier 4: 705)',
                    width: 230,
                    height: 78,
                    iconName:
                      'string (e.g. tech-docker, tech-python, tech-react, aws-lambda, aws-s3, gcp-cloud-run, tech-redis, tech-kafka, gen-server, gen-database)',
                    iconLabel: 'string (Primary title, e.g. "API Gateway")',
                    subtitle: 'string (2-line technical description, e.g. "JWT Auth & Rate-Limiting\\nReverse proxy router")',
                    style: {
                      fillColor: 'string (default "#FFFFFF" light, "#242424" dark)',
                      strokeColor: 'string (tier border color, e.g. "#FB923C", "#10B981", "#A855F7", "#3B82F6")',
                      strokeWidth: 1.5,
                      textColor: '#0F172A',
                      fontSize: 12,
                    },
                  },
                },
                frame_spec: {
                  type: 'frame',
                  description: 'Enclosing boundary for a diagram tier',
                  fields: {
                    id: 'string (e.g. "tier-01")',
                    type: 'frame',
                    x: 60,
                    y: 'number (tier 1: 80, tier 2: 275, tier 3: 470, tier 4: 665)',
                    width: 1100,
                    height: 155,
                    frameTitle: 'string (e.g. "01 · CLIENT & INGESTION TIER")',
                    style: {
                      fillColor: 'string (soft pastel tint, e.g. "rgba(254, 243, 199, 0.22)")',
                      strokeColor: 'string (e.g. "#FB923C")',
                      strokeWidth: 1.5,
                      strokeStyle: 'solid',
                    },
                  },
                },
                connector_spec: {
                  type: 'connector',
                  description: 'Orthogonal wire / arrow connecting two services',
                  fields: {
                    id: 'string (e.g. "c-1")',
                    type: 'connector',
                    fromId: 'string (source node id)',
                    toId: 'string (target node id)',
                    fromAnchor: '"right" | "left" | "bottom" | "top"',
                    toAnchor: '"right" | "left" | "bottom" | "top"',
                    routing: 'orthogonal',
                    arrowEnd: true,
                    connectorLabel: 'string (data or protocol label, e.g. "HTTPS / JSON", "Kafka Stream")',
                    style: {
                      strokeColor: 'string (e.g. "#3B82F6")',
                      strokeWidth: 1.5,
                    },
                  },
                },
                standard_layout: {
                  card_dimensions: { width: 230, height: 78 },
                  columns_x: [80, 350, 620, 890],
                  tiers_y: [
                    { tier: 1, name: 'Client & Ingestion', frame_y: 80, nodes_y: 120, color: '#FB923C' },
                    { tier: 2, name: 'Processing & Extraction', frame_y: 275, nodes_y: 315, color: '#10B981' },
                    { tier: 3, name: 'Multi-Agent Logic & Synthesis', frame_y: 470, nodes_y: 510, color: '#A855F7' },
                    { tier: 4, name: 'Storage, Vector & Gateway', frame_y: 665, nodes_y: 705, color: '#3B82F6' },
                  ],
                },
              },
              null,
              2
            )
          );
          return;
        }

        // GET /api/prompt or /api/system-prompt - System prompt to feed any AI model
        if ((url === '/api/prompt' || url === '/api/system-prompt') && req.method === 'GET') {
          const systemPrompt = `You are an expert system architecture AI for Inkflow.
When asked to create, edit, or modify an architecture diagram, output a valid JSON command or execute this curl command:

curl -X POST http://localhost:5173/api/diagram \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Architecture Title",
    "doc": "# Technical Documentation Markdown...",
    "elements": [
      ...
    ]
  }'

### Rules for Generating High-Fidelity Diagrams:
1. Multi-Tier Organization:
   - Group services into 3 or 4 horizontal tiers using 'frame' elements (width: 1100, height: 155, x: 60).
   - Tier 1 (Amber): y: 80 | stroke: #FB923C | fill: rgba(254, 243, 199, 0.22)
   - Tier 2 (Emerald): y: 275 | stroke: #10B981 | fill: rgba(209, 250, 229, 0.22)
   - Tier 3 (Purple): y: 470 | stroke: #A855F7 | fill: rgba(243, 232, 255, 0.25)
   - Tier 4 (Blue): y: 665 | stroke: #3B82F6 | fill: rgba(219, 234, 254, 0.25)

2. Node Cards:
   - Use type: 'icon', width: 230, height: 78.
   - Column X positions: Col 1: 80, Col 2: 350, Col 3: 620, Col 4: 890.
   - Node Y positions: Tier 1: 120, Tier 2: 315, Tier 3: 510, Tier 4: 705.
   - Provide clean titles in 'iconLabel' and 2-line technical details in 'subtitle'.
   - Available icon prefixes: tech-* (docker, kubernetes, python, react, redis, kafka), aws-* (lambda, s3, dynamodb, cloudfront), gcp-* (cloud-run, bigquery), gen-* (server, database, browser, microservice, mobile).

3. Connectors:
   - Use type: 'connector', routing: 'orthogonal', arrowEnd: true.
   - Inside tiers: horizontal from 'right' to 'left'.
   - Between tiers: straight vertical drop from 'bottom' to 'top'.
   - Always include descriptive 'connectorLabel' (e.g. "JSON / REST", "gRPC Stream", "SQL Read/Write").

Respond ONLY with valid JSON or the exact curl command.`;

          if (req.headers.accept?.includes('application/json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ system_prompt: systemPrompt }));
          } else {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(systemPrompt);
          }
          return;
        }

        // GET /api/status - Local bridge status & OpenAPI guide
        if (url === '/api/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(
            JSON.stringify({
              status: 'online',
              service: 'Inkflow Local AI & OpenCode Bridge',
              port: 5173,
              endpoints: {
                unified_context: 'GET http://localhost:5173/api/context',
                read_canvas: 'GET http://localhost:5173/api/diagram',
                live_edit: 'POST http://localhost:5173/api/diagram',
                get_schema: 'GET http://localhost:5173/api/schema',
                get_prompt: 'GET http://localhost:5173/api/prompt',
                live_stream: 'GET http://localhost:5173/api/stream',
                open_chrome: 'POST http://localhost:5173/api/open-chrome',
              },
              connectedWebTabs: sseClients.length,
            })
          );
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localAiBridgePlugin()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
  },
});
