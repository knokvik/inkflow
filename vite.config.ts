import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

let currentDiagramState: {
  elements: any[];
  doc: string;
  title: string;
  updatedAt: number;
} = {
  elements: [],
  doc: '',
  title: 'WeMakeDevs',
  updatedAt: Date.now(),
};

let sseClients: any[] = [];

function localAiBridgePlugin(): Plugin {
  return {
    name: 'local-ai-bridge',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || '';

        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        // Live SSE Stream for real-time canvas updates
        if (url === '/api/stream' && req.method === 'GET') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
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
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(currentDiagramState));
          return;
        }

        // POST /api/diagram - Live edit canvas from OpenCode / local AI / external scripts
        if (url === '/api/diagram' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              if (Array.isArray(data.elements)) currentDiagramState.elements = data.elements;
              if (typeof data.doc === 'string') currentDiagramState.doc = data.doc;
              if (typeof data.title === 'string') currentDiagramState.title = data.title;
              currentDiagramState.updatedAt = Date.now();

              // Broadcast live to connected canvas web tabs unless it is an internal client sync
              if (!data.clientSyncOnly) {
                const payload = JSON.stringify({ type: 'update', data, state: currentDiagramState });
                for (const client of sseClients) {
                  try {
                    client.write(`data: ${payload}\n\n`);
                  } catch (e) {
                    // ignore disconnected
                  }
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  message: data.clientSyncOnly ? 'Diagram state synced from client' : 'Canvas updated live on local Eraser',
                  elementCount: currentDiagramState.elements.length,
                  timestamp: Date.now(),
                })
              );
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
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
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'Opening Google Chrome on http://localhost:5173' }));
          return;
        }

        // GET /api/schema - Machine-readable schema & specification for AI models
        if (url === '/api/schema' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify(
              {
                service: 'Inkflow Architecture Engine',
                version: '1.0.0',
                description: 'Exact JSON contract for external AI models, agents, and CLI tools to create or update architecture diagrams on Inkflow canvas.',
                edit_command: 'curl -X POST http://localhost:5173/api/diagram -H "Content-Type: application/json" -d \'<JSON_PAYLOAD>\'',
                read_command: 'curl http://localhost:5173/api/diagram',
                payload_contract: {
                  title: 'string (Diagram title)',
                  doc: 'string (Markdown technical architecture specification with mermaid diagram and tier breakdown)',
                  elements: 'CanvasElement[] (Array of frames, nodes, and connectors)'
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
                    iconName: 'string (e.g. tech-docker, tech-python, tech-react, aws-lambda, aws-s3, gcp-cloud-run, tech-redis, tech-kafka, gen-server, gen-database)',
                    iconLabel: 'string (Primary title, e.g. "API Gateway")',
                    subtitle: 'string (2-line technical description, e.g. "JWT Auth & Rate-Limiting\\nReverse proxy router")',
                    style: {
                      fillColor: 'string (default "#FFFFFF" light, "#242424" dark)',
                      strokeColor: 'string (tier border color, e.g. "#FB923C", "#10B981", "#A855F7", "#3B82F6")',
                      strokeWidth: 1.5,
                      textColor: '#0F172A',
                      fontSize: 12
                    }
                  }
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
                      strokeStyle: 'solid'
                    }
                  }
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
                      strokeWidth: 1.5
                    }
                  }
                },
                standard_layout: {
                  card_dimensions: { width: 230, height: 78 },
                  columns_x: [80, 350, 620, 890],
                  tiers_y: [
                    { tier: 1, name: 'Client & Ingestion', frame_y: 80, nodes_y: 120, color: '#FB923C' },
                    { tier: 2, name: 'Processing & Extraction', frame_y: 275, nodes_y: 315, color: '#10B981' },
                    { tier: 3, name: 'Multi-Agent Logic & Synthesis', frame_y: 470, nodes_y: 510, color: '#A855F7' },
                    { tier: 4, name: 'Storage, Vector & Gateway', frame_y: 665, nodes_y: 705, color: '#3B82F6' }
                  ]
                }
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
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ system_prompt: systemPrompt }));
          } else {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(systemPrompt);
          }
          return;
        }

        // GET /api/status - Local bridge status & OpenAPI guide
        if (url === '/api/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'online',
              service: 'Inkflow Local AI & OpenCode Bridge',
              port: 5173,
              endpoints: {
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
