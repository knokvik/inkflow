import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { createRedisClient } from './redis';

export interface ScrapeJobData {
  jobId: string;
  request: any;
}

export class JobQueue {
  private queue: Queue<ScrapeJobData>;
  private worker: Worker<ScrapeJobData> | null = null;
  private queueEvents: QueueEvents;

  constructor() {
    const redis = createRedisClient();
    
    this.queue = new Queue<ScrapeJobData>('scraper', { connection: redis });
    this.queueEvents = new QueueEvents('scraper', { connection: redis });
  }

  async add(name: string, data: ScrapeJobData, opts?: { priority?: number; delay?: number }) {
    return this.queue.add(name, data, {
      priority: opts?.priority || 0,
      delay: opts?.delay || 0,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }

  async cancel(jobId: string) {
    const jobs = await this.queue.getJobs(['active', 'waiting', 'delayed']);
    for (const job of jobs) {
      if (job.data.jobId === jobId) {
        await job.remove();
        break;
      }
    }
  }

  getQueue() {
    return this.queue;
  }

  getEvents() {
    return this.queueEvents;
  }

  async close() {
    await this.queue.close();
    await this.queueEvents.close();
    if (this.worker) {
      await this.worker.close();
    }
  }
}

export function createWorker(
  processor: (job: Job<ScrapeJobData>) => Promise<any>,
  concurrency: number = 5
) {
  const redis = createRedisClient();
  
  return new Worker<ScrapeJobData>('scraper', processor, {
    connection: redis,
    concurrency,
    limiter: { max: concurrency, duration: 1000 },
  });
}

export async function getJobCounts() {
  const queue = new JobQueue().getQueue();
  return {
    waiting: await queue.getWaitingCount(),
    active: await queue.getActiveCount(),
    completed: await queue.getCompletedCount(),
    failed: await queue.getFailedCount(),
    delayed: await queue.getDelayedCount(),
  };
}