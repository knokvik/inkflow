import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JobQueue } from './queue';
import { ScrapeJob, ScrapeRequest, JobProgress, ScrapeResult, ProgressEvent } from '../types/scraper';

const router = Router();
const jobQueue = new JobQueue();

const jobs = new Map<string, ScrapeJob>();
const wsConnections = new Map<string, WebSocket[]>();

function broadcastProgress(jobId: string, event: ProgressEvent) {
  const connections = wsConnections.get(jobId) || [];
  const message = JSON.stringify(event);
  connections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

function updateJob(jobId: string, updates: Partial<ScrapeJob>) {
  const job = jobs.get(jobId);
  if (!job) return;

  const updated = { ...job, ...updates, updatedAt: Date.now() };
  jobs.set(jobId, updated);

  if (updates.status || updates.progress !== undefined || updates.currentStage) {
    broadcastProgress(jobId, {
      type: 'progress',
      percent: updated.progress,
      details: `${updated.currentStage}: ${updated.progress}%`,
    });
  }

  if (updates.status === 'completed' && updated.result) {
    broadcastProgress(jobId, { type: 'complete', result: updated.result });
  }

  if (updates.status === 'failed') {
    broadcastProgress(jobId, { type: 'error', error: updated.error || 'Unknown error', recoverable: true });
  }
}

router.post('/scrape', async (req: Request, res: Response) => {
  try {
    const request = req.body as ScrapeRequest;
    
    if (!request.url || !request.url.startsWith('http')) {
      return res.status(400).json({ message: 'Valid URL is required' });
    }

    const jobId = uuidv4();
    const job: ScrapeJob = {
      id: jobId,
      url: request.url,
      type: request.type || 'auto',
      priority: 'normal',
      config: request.options || {},
      status: 'pending',
      progress: 0,
      currentStage: 'fetching',
      retryCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    jobs.set(jobId, job);
    await jobQueue.add('scrape', { jobId, request });

    res.json({
      jobId,
      status: 'accepted',
      estimatedDuration: 60,
      wsEndpoint: `/api/v1/scrape/${jobId}/stream`,
    });
  } catch (error) {
    console.error('Scrape request failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/scrape/:jobId', (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const { result, ...progress } = job;
  res.json(progress as JobProgress);
});

router.get('/scrape/:jobId/result', (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  if (job.status !== 'completed' || !job.result) {
    return res.status(400).json({ message: 'Result not ready' });
  }

  res.json(job.result);
});

router.get('/scrape/:jobId/stream', (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const job = jobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const ws = req.socket as any;
  const connections = wsConnections.get(jobId) || [];
  connections.push(ws);
  wsConnections.set(jobId, connections);

  ws.on('close', () => {
    const conns = wsConnections.get(jobId) || [];
    const idx = conns.indexOf(ws);
    if (idx > -1) conns.splice(idx, 1);
    wsConnections.set(jobId, conns);
  });

  const event = job.status === 'completed' 
    ? { type: 'complete', result: job.result! } as ProgressEvent
    : job.status === 'failed'
    ? { type: 'error', error: job.error || 'Unknown error', recoverable: true } as ProgressEvent
    : { type: 'progress', percent: job.progress, details: `${job.currentStage}: ${job.progress}%` } as ProgressEvent;
  
  res.write(`data: ${JSON.stringify(event)}\n\n`);
});

router.delete('/scrape/:jobId', (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  if (job.status === 'running') {
    jobQueue.cancel(req.params.jobId);
  }

  jobs.delete(req.params.jobId);
  res.json({ message: 'Job cancelled' });
});

export { router as scraperRouter, jobs, updateJob, broadcastProgress };