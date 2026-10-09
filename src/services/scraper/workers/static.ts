import { Job } from 'bullmq';
import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { ScrapeJobData, JobQueue, createWorker } from './queue';
import { updateJob, broadcastProgress } from './api';
import { ScrapeJob, ExtractedContent, TechComponent, ScrapeResult, ProgressEvent } from '../types/scraper';
import { classifyContent } from './ai/classifier';
import { generateDiagram } from './ai/diagramGen';
import { generateDocumentation } from './ai/docGen';
import { computeContentHash } from './utils';

const MAX_CONTENT_SIZE = 10 * 1024 * 1024;
const REQUEST_TIMEOUT = 30000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'InkflowBot/1.0 (+https://inkflow.dev)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers,
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

function isAllowedDomain(url: string, allowedDomains?: string[], blockedDomains?: string[]): boolean {
  const hostname = new URL(url).hostname;
  
  if (blockedDomains?.some(d => hostname.includes(d))) return false;
  if (allowedDomains?.length && !allowedDomains.some(d => hostname.includes(d))) return false;
  
  const privateIPs = [
    /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./,
    /^127\./, /^169\.254\./, /^::1$/, /^fe80::/,
  ];
  
  return !privateIPs.some(re => re.test(hostname));
}

async function extractContent(html: string, url: string): Promise<ExtractedContent> {
  const dom = new JSDOM(html, { url });
  const document = dom.window.document;
  
  const reader = new Readability(document);
  const article = reader.parse();
  
  const $ = cheerio.load(html);
  
  const links: ExtractedContent['links'] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      try {
        const absoluteUrl = new URL(href, url).href;
        links.push({
          url: absoluteUrl,
          text: $(el).text().trim(),
          title: $(el).attr('title') || undefined,
          internal: new URL(absoluteUrl).hostname === new URL(url).hostname,
          rel: $(el).attr('rel') || undefined,
        });
      } catch {}
    }
  });

  const codeBlocks: ExtractedContent['codeBlocks'] = [];
  $('pre code, pre').each((_, el) => {
    const $el = $(el);
    const language = $el.attr('class')?.match(/language-(\w+)/)?.[1] || 
                     $el.parent().attr('class')?.match(/language-(\w+)/)?.[1] || 'text';
    codeBlocks.push({
      language,
      code: $el.text(),
      context: $el.closest('section, article, div').find('h1, h2, h3').first().text() || undefined,
    });
  });

  const images: ExtractedContent['images'] = [];
  $('img[src]').each((_, el) => {
    const $el = $(el);
    const src = $el.attr('src');
    if (src) {
      try {
        images.push({
          src: new URL(src, url).href,
          alt: $el.attr('alt') || undefined,
          width: $el.attr('width') ? parseInt($el.attr('width')!) : undefined,
          height: $el.attr('height') ? parseInt($el.attr('height')!) : undefined,
          context: $el.closest('figure, div').find('figcaption, p').first().text() || undefined,
        });
      } catch {}
    }
  });

  const tables: ExtractedContent['tables'] = [];
  $('table').each((_, el) => {
    const $el = $(el);
    const headers: string[] = [];
    $el.find('thead th, thead td').each((_, th) => headers.push($(th).text().trim()));
    const rows: string[][] = [];
    $el.find('tbody tr').each((_, tr) => {
      const row: string[] = [];
      $(tr).find('td, th').each((_, td) => row.push($(td).text().trim()));
      rows.push(row);
    });
    tables.push({
      headers,
      rows,
      caption: $el.find('caption').text().trim() || undefined,
    });
  });

  const headings: ExtractedContent['headings'] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    headings.push({
      level: parseInt(el.tagName[1]),
      text: $(el).text().trim(),
      id: $(el).attr('id') || undefined,
    });
  });

  return {
    url,
    title: article?.title || $('title').text() || 'Untitled',
    html: article?.content || html,
    text: article?.textContent || $('body').text() || '',
    markdown: article?.textContent || '',
    links,
    codeBlocks,
    images,
    tables,
    headings,
    metadata: {
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      ogTitle: $('meta[property="og:title"]').attr('content') || '',
      ogDescription: $('meta[property="og:description"]').attr('content') || '',
      ogImage: $('meta[property="og:image"]').attr('content') || '',
    },
  };
}

async function processScrapeJob(job: Job<ScrapeJobData>): Promise<ScrapeResult> {
  const { jobId, request } = job.data;
  const startTime = Date.now();
  
  const scrapeJob = updateJob(jobId, { status: 'running', startedAt: Date.now() });
  
  broadcastProgress(jobId, { type: 'stage', stage: 'fetching', message: 'Fetching page content...' });
  
  if (!isAllowedDomain(request.url)) {
    throw new Error('Domain not allowed or blocked (private IP)');
  }

  const response = await fetchWithTimeout(request.url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  let html: string;
  let sourceType: ScrapeResult['metadata']['sourceType'] = 'html';

  if (contentType.includes('application/json')) {
    const json = await response.json();
    html = JSON.stringify(json, null, 2);
    sourceType = 'api';
  } else if (contentType.includes('text/markdown') || request.url.endsWith('.md')) {
    html = await response.text();
    sourceType = 'markdown';
  } else {
    html = await response.text();
  }

  if (html.length > MAX_CONTENT_SIZE) {
    html = html.slice(0, MAX_CONTENT_SIZE);
  }

  broadcastProgress(jobId, { type: 'stage', stage: 'parsing', message: 'Parsing and extracting content...' });
  updateJob(jobId, { progress: 20, currentStage: 'parsing' });

  const extracted = await extractContent(html, request.url);
  const contentHash = computeContentHash(extracted.text + JSON.stringify(extracted.codeBlocks));

  broadcastProgress(jobId, { type: 'stage', stage: 'classifying', message: 'Classifying tech stack and architecture...' });
  updateJob(jobId, { progress: 40, currentStage: 'classifying' });

  const classified = await classifyContent(extracted, request.options?.provider);

  broadcastProgress(jobId, { type: 'stage', stage: 'generating', message: 'Generating diagram and documentation...' });
  updateJob(jobId, { progress: 60, currentStage: 'generating' });

  const [architecture, documentation] = await Promise.all([
    generateDiagram(classified, extracted, request.options?.provider),
    generateDocumentation(classified, extracted, request.options?.provider),
  ]);

  broadcastProgress(jobId, { type: 'progress', percent: 90, details: 'Finalizing results...' });
  updateJob(jobId, { progress: 90 });

  const result: ScrapeResult = {
    url: request.url,
    title: extracted.title,
    summary: extracted.text.slice(0, 500) + '...',
    techStack: classified.techStack,
    architecture,
    documentation,
    metadata: {
      scrapedAt: Date.now(),
      contentHash,
      sourceType,
      confidence: computeOverallConfidence(classified),
      crawlDepth: 0,
      pagesScraped: 1,
      processingTimeMs: Date.now() - startTime,
      aiProviderUsed: request.options?.provider?.provider || 'builtin',
      modelUsed: request.options?.provider?.model || 'builtin',
    },
  };

  broadcastProgress(jobId, { type: 'complete', result });
  updateJob(jobId, { 
    status: 'completed', 
    progress: 100, 
    currentStage: 'complete',
    result,
    completedAt: Date.now(),
  });

  return result;
}

function computeOverallConfidence(classified: any): number {
  if (!classified.techStack.length) return 0.3;
  const avg = classified.techStack.reduce((sum: number, t: TechComponent) => sum + t.confidence, 0) / classified.techStack.length;
  return Math.round(avg * 100) / 100;
}

export const staticWorker = createWorker(processScrapeJob, 10);

staticWorker.on('completed', (job) => {
  console.log(`Job ${job.data.jobId} completed`);
});

staticWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.data.jobId} failed:`, err);
  if (job) {
    updateJob(job.data.jobId, { 
      status: 'failed', 
      error: err.message,
      retryCount: job.attemptsMade,
    });
  }
});

staticWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

export { processScrapeJob };