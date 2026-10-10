import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { processAIPrompt } from './src/services/aiService';
import { CanvasElement, AIProviderConfig } from './src/types/canvas';
import { ICON_CATALOG } from './src/constants/icons';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

interface ScrapeJob {
  id: string;
  url: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  stage: string;
  result?: any;
  error?: string;
  wsConnections: WebSocket[];
  createdAt: number;
}

const jobs = new Map<string, ScrapeJob>();

function broadcast(jobId: string, event: any) {
  const job = jobs.get(jobId);
  if (!job) return;
  const msg = JSON.stringify(event);
  job.wsConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

function updateJob(jobId: string, updates: Partial<ScrapeJob>) {
  const job = jobs.get(jobId);
  if (!job) return;
  Object.assign(job, updates, { updatedAt: Date.now() });
  jobs.set(jobId, job);
}

async function scrapeAndGenerate(jobId: string, url: string, provider: AIProviderConfig) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    updateJob(jobId, { status: 'running', stage: 'fetching', progress: 10 });
    broadcast(jobId, { type: 'stage', stage: 'fetching', message: 'Fetching page content...' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'InkflowBot/1.0 (+https://inkflow.dev)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const html = await response.text();
    const contentType = response.headers.get('content-type') || '';

    updateJob(jobId, { stage: 'parsing', progress: 30 });
    broadcast(jobId, { type: 'stage', stage: 'parsing', message: 'Parsing content...' });

    const extracted = extractContent(html, url);
    const prompt = buildScrapePrompt(extracted, url);

    updateJob(jobId, { stage: 'generating', progress: 50 });
    broadcast(jobId, { type: 'stage', stage: 'generating', message: 'Generating architecture diagram...' });

    const aiResponse = await processAIPrompt(prompt, [], '', provider);

    updateJob(jobId, { stage: 'complete', progress: 90 });
    broadcast(jobId, { type: 'progress', percent: 90, details: 'Finalizing...' });

    const result = {
      url,
      title: extracted.title,
      summary: extracted.text.slice(0, 500),
      techStack: extractTechStack(extracted),
      architecture: {
        elements: aiResponse.elements || [],
        dsl: elementsToDSL(aiResponse.elements || []),
        mermaid: elementsToMermaid(aiResponse.elements || []),
        layout: 'horizontal' as const,
      },
      documentation: {
        markdown: aiResponse.docMarkdown || generateMarkdown(extracted, aiResponse.elements || []),
        adr: [],
      },
      metadata: {
        scrapedAt: Date.now(),
        contentHash: hashContent(extracted.text),
        sourceType: contentType.includes('json') ? 'api' : 'html',
        confidence: 0.85,
        crawlDepth: 0,
        pagesScraped: 1,
        processingTimeMs: Date.now() - job.createdAt,
        aiProviderUsed: provider.provider,
        modelUsed: provider.model,
      },
    };

    updateJob(jobId, { status: 'completed', progress: 100, stage: 'complete', result });
    broadcast(jobId, { type: 'complete', result });

  } catch (err: any) {
    console.error('Scrape error:', err);
    updateJob(jobId, { status: 'failed', error: err.message });
    broadcast(jobId, { type: 'error', error: err.message, recoverable: true });
  }
}

function extractContent(html: string, url: string) {
  const { JSDOM } = require('jsdom');
  const { Readability } = require('@mozilla/readability');
  const cheerio = require('cheerio');

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  const $ = cheerio.load(html);

  const links: any[] = [];
  $('a[href]').each((_: any, el: any) => {
    const href = $(el).attr('href');
    if (href) {
      try {
        links.push({ url: new URL(href, url).href, text: $(el).text().trim(), internal: new URL(href, url).hostname === new URL(url).hostname });
      } catch {}
    }
  });

  const codeBlocks: any[] = [];
  $('pre code, pre').each((_: any, el: any) => {
    const $el = $(el);
    const lang = $el.attr('class')?.match(/language-(\w+)/)?.[1] || 'text';
    codeBlocks.push({ language: lang, code: $el.text() });
  });

  return {
    url,
    title: article?.title || $('title').text() || 'Untitled',
    html: article?.content || html,
    text: article?.textContent || $('body').text() || '',
    links,
    codeBlocks,
    headings: $('h1,h2,h3').map((_: any, el: any) => ({ level: parseInt(el.tagName[1]), text: $(el).text().trim() })).get(),
  };
}

function buildScrapePrompt(extracted: any, url: string): string {
  return `Analyze this web page and generate a system architecture diagram.

URL: ${url}
Title: ${extracted.title}
Content Preview: ${extracted.text.slice(0, 3000)}
Code Blocks Found: ${extracted.codeBlocks.length}
Headings: ${extracted.headings.map((h: any) => `${'#'.repeat(h.level)} ${h.text}`).join('\n')}

Generate an architecture diagram with:
1. Identify all tech components (databases, services, message queues, cloud services, etc.)
2. Determine relationships between components
3. Create a logical layout (horizontal pipeline for request flow, clustered for microservices)
4. Include appropriate icons from the catalog
5. Generate technical documentation in markdown

Available icons: ${ICON_CATALOG.map(i => i.id).join(', ')}`;
}

function extractTechStack(extracted: any) {
  const techKeywords = {
    'postgres': { name: 'PostgreSQL', category: 'database', icon: 'db-postgres' },
    'redis': { name: 'Redis', category: 'database', icon: 'db-redis' },
    'kafka': { name: 'Kafka', category: 'messaging', icon: 'db-kafka' },
    'mongodb': { name: 'MongoDB', category: 'database', icon: 'db-mongodb' },
    'mysql': { name: 'MySQL', category: 'database', icon: 'db-mysql' },
    'elasticsearch': { name: 'Elasticsearch', category: 'search', icon: 'db-elasticsearch' },
    'docker': { name: 'Docker', category: 'compute', icon: 'tech-docker' },
    'kubernetes': { name: 'Kubernetes', category: 'compute', icon: 'tech-k8s' },
    'aws': { name: 'AWS', category: 'cloud', icon: 'aws-ec2' },
    'lambda': { name: 'Lambda', category: 'compute', icon: 'aws-lambda' },
    's3': { name: 'S3', category: 'storage', icon: 'aws-s3' },
    'dynamodb': { name: 'DynamoDB', category: 'database', icon: 'aws-dynamodb' },
    'api gateway': { name: 'API Gateway', category: 'infrastructure', icon: 'aws-api-gateway' },
    'nginx': { name: 'Nginx', category: 'infrastructure', icon: 'infra-nginx' },
    'graphql': { name: 'GraphQL', category: 'backend', icon: 'tech-graphql' },
    'react': { name: 'React', category: 'frontend', icon: 'tech-react' },
    'node': { name: 'Node.js', category: 'backend', icon: 'tech-nodejs' },
    'python': { name: 'Python', category: 'backend', icon: 'tech-python' },
    'go': { name: 'Go', category: 'backend', icon: 'tech-go' },
    'rust': { name: 'Rust', category: 'backend', icon: 'tech-rust' },
  };

  const text = (extracted.text + ' ' + extracted.codeBlocks.map((c: any) => c.code).join(' ')).toLowerCase();
  const found: any[] = [];
  
  for (const [keyword, info] of Object.entries(techKeywords)) {
    if (text.includes(keyword)) {
      found.push({ ...info, confidence: 0.9, iconName: info.icon, iconCategory: info.category });
    }
  }
  return found;
}

function hashContent(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function elementsToDSL(elements: CanvasElement[]): string {
  const nodes = elements.filter(e => e.type === 'icon');
  const conns = elements.filter(e => e.type === 'connector');
  let dsl = nodes.map(n => `${n.iconLabel} [type: "icon", icon: "${n.iconName}", label: "${n.iconLabel}"]`).join('\n');
  dsl += '\n\n' + conns.map(c => `${c.fromId} > ${c.toId} [label: "${c.connectorLabel || 'Data Flow'}"]`).join('\n');
  return dsl;
}

function elementsToMermaid(elements: CanvasElement[]): string {
  const nodes = elements.filter(e => e.type === 'icon');
  const conns = elements.filter(e => e.type === 'connector');
  let mmd = 'graph LR\n';
  nodes.forEach(n => { mmd += `  ${n.id}["${n.iconLabel}"]\n`; });
  conns.forEach(c => { mmd += `  ${c.fromId} -->|${c.connectorLabel || ''}| ${c.toId}\n`; });
  return mmd;
}

function generateMarkdown(extracted: any, elements: CanvasElement[]): string {
  const nodes = elements.filter(e => e.type === 'icon');
  return `# ${extracted.title}\n\n**Source:** ${extracted.url}\n\n## Architecture Overview\n\n${nodes.map(n => `- **${n.iconLabel}** (${n.iconCategory})`).join('\n')}\n\n## Components\n\n${nodes.map(n => `### ${n.iconLabel}\n- **Type:** ${n.iconCategory}\n- **Icon:** ${n.iconName}\n`).join('\n')}\n\n## Mermaid Diagram\n\n\`\`\`mermaid\n${elementsToMermaid(elements)}\n\`\`\``;
}

// API Routes
app.post('/api/v1/scrape', async (req, res) => {
  const { url, type = 'auto', options = {} } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ message: 'Valid URL required' });
  }

  const jobId = uuidv4();
  const provider: AIProviderConfig = options.provider || { 
    provider: 'builtin', 
    endpoint: '', 
    model: 'builtin' 
  };

  const job: ScrapeJob = {
    id: jobId,
    url,
    type,
    status: 'pending',
    progress: 0,
    stage: 'pending',
    wsConnections: [],
    createdAt: Date.now(),
  };
  jobs.set(jobId, job);

  scrapeAndGenerate(jobId, url, provider).catch(console.error);

  res.json({
    jobId,
    status: 'accepted',
    estimatedDuration: 60,
    wsEndpoint: `/api/v1/scrape/${jobId}/stream`,
  });
});

app.get('/api/v1/scrape/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Not found' });
  const { wsConnections, result, ...rest } = job;
  res.json(rest);
});

app.get('/api/v1/scrape/:jobId/result', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job || job.status !== 'completed' || !job.result) {
    return res.status(400).json({ message: 'Not ready' });
  }
  res.json(job.result);
});

// WebSocket
wss.on('connection', (ws, req) => {
  const match = req.url?.match(/\/api\/v1\/scrape\/([^/]+)\/stream/);
  if (!match) return ws.close();
  
  const jobId = match[1];
  const job = jobs.get(jobId);
  if (!job) return ws.close();
  
  job.wsConnections.push(ws);
  
  ws.on('close', () => {
    job.wsConnections = job.wsConnections.filter(c => c !== ws);
  });

  // Send current state
  if (job.status === 'completed' && job.result) {
    ws.send(JSON.stringify({ type: 'complete', result: job.result }));
  } else if (job.status === 'failed') {
    ws.send(JSON.stringify({ type: 'error', error: job.error, recoverable: true }));
  } else {
    ws.send(JSON.stringify({ type: 'progress', percent: job.progress, details: `${job.stage}: ${job.progress}%` }));
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Scraper API running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/api/v1/scrape/:jobId/stream`);
});