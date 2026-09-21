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
