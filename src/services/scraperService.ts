import type {
  ScrapeRequest,
  ScrapeResponse,
  JobProgress,
  ScrapeResult,
  ProgressEvent,
  AIProviderConfig,
} from '../types/scraper';
import { AIProviderConfig as AIProviderConfigType } from '../types/canvas';

const API_BASE = '/api/v1';

class ScraperService {
  private baseUrl: string;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  async scrape(request: ScrapeRequest): Promise<ScrapeResponse> {
    const response = await fetch(`${this.baseUrl}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Scrape request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getJobStatus(jobId: string): Promise<JobProgress> {
    const response = await fetch(`${this.baseUrl}/scrape/${jobId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Job not found');
      }
      throw new Error(`Failed to get job status: ${response.status}`);
    }

    return response.json();
  }

  async getResult(jobId: string): Promise<ScrapeResult> {
    const response = await fetch(`${this.baseUrl}/scrape/${jobId}/result`);
    
    if (!response.ok) {
      throw new Error(`Failed to get result: ${response.status}`);
    }

    return response.json();
  }

  subscribeToProgress(jobId: string, onEvent: (event: ProgressEvent) => void): () => void {
    const controller = new AbortController();
    this.abortControllers.set(jobId, controller);

    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/scrape/${jobId}/stream`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data: ProgressEvent = JSON.parse(event.data);
        onEvent(data);
      } catch (err) {
        console.warn('Failed to parse progress event:', err);
      }
    };

    ws.onerror = (err) => {
      onEvent({ type: 'error', error: 'WebSocket connection failed', recoverable: true });
    };

    ws.onclose = () => {
      this.abortControllers.delete(jobId);
    };

    return () => {
      controller.abort();
      ws.close();
      this.abortControllers.delete(jobId);
    };
  }

  cancelJob(jobId: string): void {
    const controller = this.abortControllers.get(jobId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(jobId);
    }
  }

  async pollJob(
    jobId: string,
    onProgress?: (progress: JobProgress) => void,
    intervalMs: number = 2000
  ): Promise<ScrapeResult> {
    while (true) {
      const status = await this.getJobStatus(jobId);
      
      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed' && status.result) {
        return status.result;
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Scraping job failed');
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  async scrapeAndWait(
    request: ScrapeRequest,
    onProgress?: (progress: JobProgress) => void
  ): Promise<ScrapeResult> {
    const { jobId } = await this.scrape(request);
    return this.pollJob(jobId, onProgress);
  }
}

export const scraperService = new ScraperService();

export async function scrapeAndGenerateDiagram(
  url: string,
  config: AIProviderConfigType,
  options: {
    generateDiagram?: boolean;
    generateDoc?: boolean;
    type?: 'architecture' | 'documentation' | 'github' | 'api' | 'auto';
  } = {}
): Promise<{ elements: any[]; docMarkdown?: string; message: string }> {
  const result = await scraperService.scrapeAndWait({
    url,
    type: options.type || 'auto',
    options: {
      generateDiagram: options.generateDiagram ?? true,
      generateDoc: options.generateDoc ?? true,
      provider: config,
    },
  });

  return {
    message: `Successfully scraped and generated architecture from ${url}`,
    elements: result.architecture.elements,
    docMarkdown: result.documentation.markdown,
  };
}

export function createScrapeProgressHandler(
  onStageChange: (stage: string, message: string) => void,
  onProgress: (percent: number, details: string) => void,
  onPartial: (data: Partial<ScrapeResult>) => void,
  onComplete: (result: ScrapeResult) => void,
  onError: (error: string) => void
): (event: ProgressEvent) => void {
  return (event: ProgressEvent) => {
    switch (event.type) {
      case 'stage':
        onStageChange(event.stage, event.message);
        break;
      case 'progress':
        onProgress(event.percent, event.details);
        break;
      case 'partial':
        onPartial(event.data);
        break;
      case 'complete':
        onComplete(event.result);
        break;
      case 'error':
        onError(event.error);
        break;
    }
  };
}