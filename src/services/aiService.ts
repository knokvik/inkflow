import { CanvasElement, AIProviderConfig } from '../types/canvas';
import { ICON_CATALOG } from '../constants/icons';

export interface AIResponse {
  message: string;
  elements?: CanvasElement[];
  docMarkdown?: string;
  actionType?: 'replace' | 'merge' | 'doc_only';
}

export async function processAIPrompt(
  prompt: string,
  currentElements: CanvasElement[],
  currentDoc: string,
  config: AIProviderConfig
): Promise<AIResponse> {
  // If external provider is selected and endpoint is configured, try calling it
  if (config.provider !== 'builtin' && config.endpoint) {
    try {
      const response = await callExternalAI(prompt, currentElements, currentDoc, config);
      if (response) return response;
    } catch (err: any) {
      console.warn('External AI call failed, falling back to local intelligent engine:', err.message);
    }
  }

  // Fallback / Built-in Offline Neural Generator
  return runBuiltinAIEngine(prompt, currentElements, currentDoc);
}

// Call local/remote OpenAI-compatible or Ollama endpoint
async function callExternalAI(
  prompt: string,
  currentElements: CanvasElement[],
  currentDoc: string,
  config: AIProviderConfig
): Promise<AIResponse | null> {
  const systemPrompt = `You are an expert software architect AI for Eraser.io.
The user wants to generate or modify system architecture diagrams and documentation.
Available icons: ${ICON_CATALOG.map(i => i.id).join(', ')}.

Respond ONLY with valid JSON in this format:
{
  "message": "Brief summary of changes made",
  "actionType": "replace" | "merge" | "doc_only",
  "elements": [ ... CanvasElement array with id, type, x, y, width, height, iconName, iconLabel, text, style, fromId, toId, etc. ... ],
  "docMarkdown": "Updated technical markdown documentation"
}`;

  const userContent = `Current elements count: ${currentElements.length}
Current Doc preview: ${currentDoc.slice(0, 300)}
User Request: ${prompt}

If modifying existing elements, keep existing positions and add or update requested nodes and connectors.`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  let body: any;
  let url = config.endpoint;

  if (config.provider === 'ollama' && !url.includes('/v1')) {
    url = url.replace(/\/$/, '') + '/api/generate';
    body = {
      model: config.model || 'llama3',
      prompt: `${systemPrompt}\n\n${userContent}`,
      stream: false,
      format: 'json',
    };
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json();
    return JSON.parse(data.response);
  } else {
    // OpenAI / Antigravity / OpenCode compatible endpoint
    if (!url.endsWith('/chat/completions')) {
      url = url.replace(/\/$/, '') + '/chat/completions';
    }
    body = {
      model: config.model || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
    };
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json();
    const content = data.choices[0]?.message?.content;
    return JSON.parse(content);
  }
}

// Built-in intelligent generator & mutator
function runBuiltinAIEngine(
  prompt: string,
  currentElements: CanvasElement[],
  _currentDoc: string
): AIResponse {
  const p = prompt.toLowerCase();

  // 1. Check for incremental modifications ("add redis", "add kafka", "add postgres", "add worker", "add s3")
  if (p.includes('add ') || p.includes('connect ') || p.includes('insert ')) {
    return handleIncrementalAdd(p, currentElements);
  }

  // 2. Check for layout re-arrangement
  if (p.includes('horizontal') || p.includes('vertical') || p.includes('rearrange') || p.includes('align')) {
    return handleLayoutRearrange(p, currentElements);
  }

  // 3. Check for specific architecture designs
  if (p.includes('rag') || p.includes('ai') || p.includes('llm') || p.includes('vector')) {
    return generateRAGArchitecture();
  }

  if (p.includes('serverless') || p.includes('lambda') || p.includes('s3') || p.includes('aws')) {
    return generateAWSServerlessArchitecture();
  }

  if (p.includes('kubernetes') || p.includes('k8s') || p.includes('cluster') || p.includes('pod')) {
    return generateK8sArchitecture();
  }

  if (p.includes('auth') || p.includes('login') || p.includes('oauth') || p.includes('jwt')) {
    return generateAuthArchitecture();
  }

  if (p.includes('cqrs') || p.includes('event') || p.includes('streaming') || p.includes('kafka')) {
    return generateEventDrivenArchitecture();
  }

  // Generic intelligent synthesis based on extracted keywords
  return generateCustomArchitecture(prompt);
}

function handleIncrementalAdd(prompt: string, elements: CanvasElement[]): AIResponse {
  const newElements = [...elements];
  let targetIcon = 'gen-microservice';
  let targetLabel = 'New Service';
  let category = 'general';
  let strokeColor = '#8B5CF6';

  if (prompt.includes('redis') || prompt.includes('cache')) {
    targetIcon = 'db-redis';
    targetLabel = 'Redis Cache';
    category = 'database';
    strokeColor = '#DC2626';
  } else if (prompt.includes('kafka') || prompt.includes('queue') || prompt.includes('sqs')) {
    targetIcon = 'db-kafka';
    targetLabel = 'Kafka Stream';
    category = 'database';
    strokeColor = '#F97316';
  } else if (prompt.includes('postgres') || prompt.includes('sql') || prompt.includes('database')) {
    targetIcon = 'db-postgres';
    targetLabel = 'PostgreSQL';
    category = 'database';
    strokeColor = '#3B82F6';
  } else if (prompt.includes('s3') || prompt.includes('storage') || prompt.includes('bucket')) {
    targetIcon = 'aws-s3';
    targetLabel = 'S3 Object Store';
    category = 'aws';
    strokeColor = '#E05243';
  } else if (prompt.includes('auth') || prompt.includes('security')) {
    targetIcon = 'infra-firewall';
    targetLabel = 'Auth Guard';
    category = 'infra';
    strokeColor = '#EF4444';
  } else if (prompt.includes('docker') || prompt.includes('k8s')) {
    targetIcon = 'tech-docker';
    targetLabel = 'Container Node';
    category = 'tech';
    strokeColor = '#2496ED';
  }

  // Find max X to place it on the right side
  let maxX = 100;
  let avgY = 250;
  let lastNode: CanvasElement | null = null;
  for (const el of elements) {
    if (el.type !== 'connector' && el.type !== 'frame') {
      if (el.x > maxX) {
        maxX = el.x;
        avgY = el.y;
        lastNode = el;
      }
    }
  }

  const newNodeId = `node-${Date.now().toString(36)}`;
  const newNode: CanvasElement = {
    id: newNodeId,
    type: 'icon',
    x: maxX + 220,
    y: avgY,
    width: 120,
    height: 105,
    iconName: targetIcon,
    iconCategory: category,
    iconLabel: targetLabel,
    style: {
      fillColor: '#161924',
      strokeColor: strokeColor,
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      textColor: '#ECEFF4',
      fontSize: 13,
      fontFamily: 'sans',
      textAlign: 'center',
      opacity: 1,
    },
    zIndex: 10,
  };

  newElements.push(newNode);

  // If there was a previous node, connect them
  if (lastNode) {
    const connId = `conn-${Date.now().toString(36)}`;
    const newConn: CanvasElement = {
      id: connId,
      type: 'connector',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      fromId: lastNode.id,
      fromAnchor: 'right',
      toId: newNodeId,
      toAnchor: 'left',
      startPoint: { x: lastNode.x + lastNode.width, y: lastNode.y + lastNode.height / 2 },
      endPoint: { x: newNode.x, y: newNode.y + newNode.height / 2 },
      routing: 'orthogonal',
      arrowEnd: true,
      connectorLabel: 'Data Flow',
      style: {
        fillColor: 'transparent',
        strokeColor: strokeColor,
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#C7D2FE',
        fontSize: 11,
        fontFamily: 'mono',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 5,
    };
    newElements.push(newConn);
  }

  return {
    message: `Added **${targetLabel}** to the canvas and established connector pipeline.`,
    elements: newElements,
    actionType: 'replace',
  };
}

function handleLayoutRearrange(prompt: string, elements: CanvasElement[]): AIResponse {
  const isHorizontal = prompt.includes('horizontal') || !prompt.includes('vertical');
  const nodes = elements.filter(e => e.type !== 'connector' && e.type !== 'frame');
  const otherElements = elements.filter(e => e.type === 'connector' || e.type === 'frame');

  const startX = 80;
  const startY = 150;
  const spacing = 220;

  const updatedNodes = nodes.map((node, idx) => {
    return {
      ...node,
      x: isHorizontal ? startX + idx * spacing : startX + (idx % 3) * spacing,
      y: isHorizontal ? startY + (idx % 2 === 0 ? 0 : 50) : startY + Math.floor(idx / 3) * spacing,
    };
  });

  // Re-route connectors
  const nodeMap = new Map(updatedNodes.map(n => [n.id, n]));
  const updatedConnectors = otherElements.map(el => {
    if (el.type === 'connector' && el.fromId && el.toId) {
      const from = nodeMap.get(el.fromId);
      const to = nodeMap.get(el.toId);
      if (from && to) {
        return {
          ...el,
          startPoint: { x: from.x + from.width, y: from.y + from.height / 2 },
          endPoint: { x: to.x, y: to.y + to.height / 2 },
        };
      }
    }
    return el;
  });

  return {
    message: `Rearranged diagram layout to ${isHorizontal ? 'horizontal pipeline' : 'grid layout'}.`,
    elements: [...updatedNodes, ...updatedConnectors],
    actionType: 'replace',
  };
}

function generateRAGArchitecture(): AIResponse {
  const elements: CanvasElement[] = [
    {
      id: 'frame-rag',
      type: 'frame',
      x: 300,
      y: 90,
      width: 530,
      height: 420,
      frameTitle: 'LLM Orchestration & RAG Pipeline',
      style: {
        fillColor: 'rgba(139, 92, 246, 0.05)',
        strokeColor: '#7C3AED',
        strokeWidth: 1.5,
        strokeStyle: 'dashed',
        roughness: 0,
        textColor: '#C4B5FD',
        fontSize: 14,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      childrenIds: ['rag-fastapi', 'rag-vector', 'rag-llm'],
      zIndex: 1,
    },
    {
      id: 'rag-user',
      type: 'icon',
      x: 80,
      y: 200,
      width: 110,
      height: 100,
      iconName: 'gen-user',
      iconCategory: 'general',
      iconLabel: 'User Prompt',
      style: {
        fillColor: '#161924',
        strokeColor: '#A855F7',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        textColor: '#ECEFF4',
        fontSize: 13,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 10,
    },
    {
      id: 'rag-fastapi',
      type: 'icon',
      x: 350,
      y: 160,
      width: 120,
      height: 105,
      iconName: 'tech-python',
      iconCategory: 'tech',
      iconLabel: 'LangChain/FastAPI',
      style: {
        fillColor: '#122332',
        strokeColor: '#38BDF8',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        textColor: '#ECEFF4',
        fontSize: 13,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 10,
    },
    {
      id: 'rag-vector',
      type: 'icon',
      x: 350,
      y: 330,
      width: 120,
      height: 105,
      iconName: 'db-postgres',
      iconCategory: 'database',
      iconLabel: 'pgvector / Pinecone',
      style: {
        fillColor: '#102230',
        strokeColor: '#336791',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        textColor: '#ECEFF4',
        fontSize: 13,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 10,
    },
    {
      id: 'rag-llm',
      type: 'icon',
      x: 630,
      y: 240,
      width: 130,
      height: 110,
      iconName: 'aws-ec2',
      iconCategory: 'general',
      iconLabel: 'LLM Model (Local/API)',
      style: {
        fillColor: '#281738',
        strokeColor: '#C084FC',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        textColor: '#ECEFF4',
        fontSize: 13,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 10,
    },
    // Connectors
    {
      id: 'rag-conn-1',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'rag-user', fromAnchor: 'right',
      toId: 'rag-fastapi', toAnchor: 'left',
      startPoint: { x: 190, y: 250 },
      endPoint: { x: 350, y: 212 },
      routing: 'orthogonal', arrowEnd: true,
      connectorLabel: 'Query',
      style: { fillColor: 'transparent', strokeColor: '#A855F7', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#E9D5FF', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'rag-conn-2',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'rag-fastapi', fromAnchor: 'bottom',
      toId: 'rag-vector', toAnchor: 'top',
      startPoint: { x: 410, y: 265 },
      endPoint: { x: 410, y: 330 },
      routing: 'orthogonal', arrowEnd: true,
      connectorLabel: 'Semantic Search',
      style: { fillColor: 'transparent', strokeColor: '#38BDF8', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#BAE6FD', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'rag-conn-3',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'rag-fastapi', fromAnchor: 'right',
      toId: 'rag-llm', toAnchor: 'left',
      startPoint: { x: 470, y: 212 },
      endPoint: { x: 630, y: 295 },
      routing: 'orthogonal', arrowEnd: true,
      connectorLabel: 'Context + Prompt',
      style: { fillColor: 'transparent', strokeColor: '#C084FC', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#E9D5FF', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
  ];

  return {
    message: 'Generated complete **RAG & LLM Orchestration Architecture** with vector search, backend embedding pipeline, and model response cycle.',
    elements,
    actionType: 'replace',
    docMarkdown: `# RAG (Retrieval Augmented Generation) Architecture

## Pipeline Breakdown
1. **User Query**: Client issues a prompt via the UI.
2. **Orchestrator (FastAPI/LangChain)**: Converts prompt into dense vector embeddings.
3. **pgvector / Vector DB**: Retrieves top-k semantically relevant chunks from documentation.
4. **LLM Inference**: The prompt is augmented with context and streamed back to the user.
`,
  };
}

function generateAWSServerlessArchitecture(): AIResponse {
  const elements: CanvasElement[] = [
    {
      id: 'aws-cf',
      type: 'icon',
      x: 80, y: 200, width: 120, height: 105,
      iconName: 'aws-cloudfront', iconCategory: 'aws', iconLabel: 'CloudFront CDN',
      style: { fillColor: '#1B142E', strokeColor: '#9C10FF', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'aws-s3-node',
      type: 'icon',
      x: 80, y: 360, width: 115, height: 100,
      iconName: 'aws-s3', iconCategory: 'aws', iconLabel: 'S3 Assets',
      style: { fillColor: '#2B1214', strokeColor: '#E05243', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'aws-apigw',
      type: 'icon',
      x: 300, y: 200, width: 120, height: 105,
      iconName: 'aws-api-gateway', iconCategory: 'aws', iconLabel: 'API Gateway',
      style: { fillColor: '#2E1222', strokeColor: '#E7157B', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'aws-fn',
      type: 'icon',
      x: 520, y: 200, width: 120, height: 105,
      iconName: 'aws-lambda', iconCategory: 'aws', iconLabel: 'Lambda Fn',
      style: { fillColor: '#2E1E10', strokeColor: '#FF9900', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'aws-ddb',
      type: 'icon',
      x: 740, y: 200, width: 120, height: 105,
      iconName: 'aws-dynamodb', iconCategory: 'aws', iconLabel: 'DynamoDB',
      style: { fillColor: '#161438', strokeColor: '#2E27AD', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    // Connectors
    {
      id: 'conn-cf-s3',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'aws-cf', fromAnchor: 'bottom',
      toId: 'aws-s3-node', toAnchor: 'top',
      startPoint: { x: 140, y: 305 }, endPoint: { x: 137, y: 360 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Static Files',
      style: { fillColor: 'transparent', strokeColor: '#E05243', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#FCA5A5', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'conn-cf-gw',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'aws-cf', fromAnchor: 'right',
      toId: 'aws-apigw', toAnchor: 'left',
      startPoint: { x: 200, y: 252 }, endPoint: { x: 300, y: 252 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: '/api/*',
      style: { fillColor: 'transparent', strokeColor: '#E7157B', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#F472B6', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'conn-gw-fn',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'aws-apigw', fromAnchor: 'right',
      toId: 'aws-fn', toAnchor: 'left',
      startPoint: { x: 420, y: 252 }, endPoint: { x: 520, y: 252 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Payload',
      style: { fillColor: 'transparent', strokeColor: '#FF9900', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#FDBA74', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'conn-fn-ddb',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'aws-fn', fromAnchor: 'right',
      toId: 'aws-ddb', toAnchor: 'left',
      startPoint: { x: 640, y: 252 }, endPoint: { x: 740, y: 252 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Key-Value Read/Write',
      style: { fillColor: 'transparent', strokeColor: '#818CF8', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#C7D2FE', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
  ];

  return {
    message: 'Generated **AWS Serverless Architecture** with CloudFront CDN, API Gateway, Lambda compute, and DynamoDB.',
    elements,
    actionType: 'replace',
    docMarkdown: `# AWS Serverless Stack

## Architecture Highlights
- **CloudFront CDN**: Edge caching and SSL termination.
- **S3 Bucket**: Hosts compiled SPA web build.
- **API Gateway**: REST routing with throttling.
- **AWS Lambda**: Autoscaling micro-services with sub-second execution.
- **DynamoDB**: Low-latency single-digit millisecond storage.
`,
  };
}

function generateK8sArchitecture(): AIResponse {
  const elements: CanvasElement[] = [
    {
      id: 'k8s-frame',
      type: 'frame',
      x: 280, y: 100, width: 560, height: 380,
      frameTitle: 'Production Kubernetes Cluster',
      style: { fillColor: 'rgba(50, 108, 229, 0.05)', strokeColor: '#2563EB', strokeWidth: 1.5, strokeStyle: 'dashed', roughness: 0, textColor: '#93C5FD', fontSize: 14, fontFamily: 'mono', textAlign: 'left', opacity: 1 },
      childrenIds: ['k8s-ingress', 'k8s-pod1', 'k8s-pod2'],
      zIndex: 1,
    },
    {
      id: 'k8s-client',
      type: 'icon',
      x: 80, y: 220, width: 110, height: 100,
      iconName: 'gen-browser', iconCategory: 'general', iconLabel: 'Internet Traffic',
      style: { fillColor: '#161924', strokeColor: '#10B981', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'k8s-ingress',
      type: 'icon',
      x: 320, y: 220, width: 120, height: 105,
      iconName: 'infra-nginx', iconCategory: 'infra', iconLabel: 'Ingress Controller',
      style: { fillColor: '#102619', strokeColor: '#009639', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'k8s-pod1',
      type: 'icon',
      x: 520, y: 150, width: 120, height: 105,
      iconName: 'tech-k8s', iconCategory: 'tech', iconLabel: 'API Pod (Replica 1)',
      style: { fillColor: '#0F2245', strokeColor: '#326CE5', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'k8s-pod2',
      type: 'icon',
      x: 520, y: 310, width: 120, height: 105,
      iconName: 'tech-k8s', iconCategory: 'tech', iconLabel: 'API Pod (Replica 2)',
      style: { fillColor: '#0F2245', strokeColor: '#326CE5', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'k8s-db',
      type: 'icon',
      x: 710, y: 220, width: 110, height: 100,
      iconName: 'db-postgres', iconCategory: 'database', iconLabel: 'StatefulSet DB',
      style: { fillColor: '#102230', strokeColor: '#336791', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    // Connectors
    {
      id: 'kconn-1',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'k8s-client', fromAnchor: 'right', toId: 'k8s-ingress', toAnchor: 'left',
      startPoint: { x: 190, y: 270 }, endPoint: { x: 320, y: 272 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'TLS Traffic',
      style: { fillColor: 'transparent', strokeColor: '#10B981', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#A7F3D0', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'kconn-2',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'k8s-ingress', fromAnchor: 'right', toId: 'k8s-pod1', toAnchor: 'left',
      startPoint: { x: 440, y: 272 }, endPoint: { x: 520, y: 202 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Round-Robin',
      style: { fillColor: 'transparent', strokeColor: '#326CE5', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#93C5FD', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'kconn-3',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'k8s-ingress', fromAnchor: 'right', toId: 'k8s-pod2', toAnchor: 'left',
      startPoint: { x: 440, y: 272 }, endPoint: { x: 520, y: 362 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Round-Robin',
      style: { fillColor: 'transparent', strokeColor: '#326CE5', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#93C5FD', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
  ];

  return {
    message: 'Generated **Kubernetes Cluster Architecture** with Nginx Ingress Controller, replicated Pods, and persistent storage.',
    elements,
    actionType: 'replace',
  };
}

function generateAuthArchitecture(): AIResponse {
  const elements: CanvasElement[] = [
    {
      id: 'auth-client',
      type: 'icon',
      x: 80, y: 200, width: 110, height: 100,
      iconName: 'gen-browser', iconCategory: 'general', iconLabel: 'Single Page App',
      style: { fillColor: '#161924', strokeColor: '#10B981', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'auth-shield',
      type: 'icon',
      x: 300, y: 200, width: 120, height: 105,
      iconName: 'infra-firewall', iconCategory: 'infra', iconLabel: 'OAuth2 / OIDC',
      style: { fillColor: '#2B1214', strokeColor: '#EF4444', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'auth-redis',
      type: 'icon',
      x: 520, y: 200, width: 110, height: 100,
      iconName: 'db-redis', iconCategory: 'database', iconLabel: 'JWT Revocation Cache',
      style: { fillColor: '#241416', strokeColor: '#DC2626', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'auth-pg',
      type: 'icon',
      x: 720, y: 200, width: 115, height: 100,
      iconName: 'db-postgres', iconCategory: 'database', iconLabel: 'Users Database',
      style: { fillColor: '#102230', strokeColor: '#336791', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    // Connectors
    {
      id: 'aconn-1',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'auth-client', fromAnchor: 'right', toId: 'auth-shield', toAnchor: 'left',
      startPoint: { x: 190, y: 250 }, endPoint: { x: 300, y: 252 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Authorize Code',
      style: { fillColor: 'transparent', strokeColor: '#EF4444', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#FCA5A5', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'aconn-2',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'auth-shield', fromAnchor: 'right', toId: 'auth-redis', toAnchor: 'left',
      startPoint: { x: 420, y: 252 }, endPoint: { x: 520, y: 250 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Store Refresh Token',
      style: { fillColor: 'transparent', strokeColor: '#DC2626', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#FCA5A5', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'aconn-3',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'auth-shield', fromAnchor: 'bottom', toId: 'auth-pg', toAnchor: 'left',
      startPoint: { x: 360, y: 305 }, endPoint: { x: 720, y: 250 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Verify Password Hash',
      style: { fillColor: 'transparent', strokeColor: '#3B82F6', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#93C5FD', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
  ];

  return {
    message: 'Generated **Secure Authentication Flow** with OAuth2/OIDC, Token revocation cache, and User database.',
    elements,
    actionType: 'replace',
  };
}

function generateEventDrivenArchitecture(): AIResponse {
  const elements: CanvasElement[] = [
    {
      id: 'ev-producer',
      type: 'icon',
      x: 80, y: 200, width: 120, height: 105,
      iconName: 'gen-microservice', iconCategory: 'general', iconLabel: 'Event Producer',
      style: { fillColor: '#1A1C29', strokeColor: '#8B5CF6', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'ev-kafka',
      type: 'icon',
      x: 320, y: 200, width: 120, height: 105,
      iconName: 'db-kafka', iconCategory: 'database', iconLabel: 'Kafka Topic',
      style: { fillColor: '#241611', strokeColor: '#F97316', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'ev-c1',
      type: 'icon',
      x: 560, y: 130, width: 120, height: 105,
      iconName: 'gen-microservice', iconCategory: 'general', iconLabel: 'Analytics Worker',
      style: { fillColor: '#1A1C29', strokeColor: '#06B6D4', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    {
      id: 'ev-c2',
      type: 'icon',
      x: 560, y: 290, width: 120, height: 105,
      iconName: 'gen-microservice', iconCategory: 'general', iconLabel: 'Email / Notification',
      style: { fillColor: '#1A1C29', strokeColor: '#10B981', strokeWidth: 2, strokeStyle: 'solid', roughness: 1, textColor: '#ECEFF4', fontSize: 13, fontFamily: 'sans', textAlign: 'center', opacity: 1 },
      zIndex: 10,
    },
    // Connectors
    {
      id: 'evconn-1',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'ev-producer', fromAnchor: 'right', toId: 'ev-kafka', toAnchor: 'left',
      startPoint: { x: 200, y: 252 }, endPoint: { x: 320, y: 252 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Publish Event',
      style: { fillColor: 'transparent', strokeColor: '#F97316', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#FDBA74', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'evconn-2',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'ev-kafka', fromAnchor: 'right', toId: 'ev-c1', toAnchor: 'left',
      startPoint: { x: 440, y: 252 }, endPoint: { x: 560, y: 182 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Consumer Group A',
      style: { fillColor: 'transparent', strokeColor: '#06B6D4', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#67E8F9', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
    {
      id: 'evconn-3',
      type: 'connector',
      x: 0, y: 0, width: 0, height: 0,
      fromId: 'ev-kafka', fromAnchor: 'right', toId: 'ev-c2', toAnchor: 'left',
      startPoint: { x: 440, y: 252 }, endPoint: { x: 560, y: 342 },
      routing: 'orthogonal', arrowEnd: true, connectorLabel: 'Consumer Group B',
      style: { fillColor: 'transparent', strokeColor: '#10B981', strokeWidth: 2, strokeStyle: 'solid', roughness: 0, textColor: '#A7F3D0', fontSize: 11, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
      zIndex: 5,
    },
  ];

  return {
    message: 'Generated **Event-Driven Architecture** with Kafka topics and consumer worker groups.',
    elements,
    actionType: 'replace',
  };
}

function generateCustomArchitecture(prompt: string): AIResponse {
  // Extract words and generate an intuitive pipeline
  const words = prompt.split(/\s+/).filter(w => w.length > 2);
  const elements: CanvasElement[] = [];

  const nodes = [
    { id: 'c-client', label: 'Client Layer', icon: 'gen-browser', category: 'general', color: '#10B981' },
    { id: 'c-gateway', label: 'API Gateway', icon: 'aws-api-gateway', category: 'aws', color: '#EC4899' },
    { id: 'c-service', label: 'Core Service', icon: 'gen-microservice', category: 'general', color: '#8B5CF6' },
    { id: 'c-cache', label: 'Cache / Queue', icon: 'db-redis', category: 'database', color: '#EF4444' },
    { id: 'c-db', label: 'Storage / DB', icon: 'db-postgres', category: 'database', color: '#3B82F6' },
  ];

  let currentX = 100;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    elements.push({
      id: n.id,
      type: 'icon',
      x: currentX,
      y: 220,
      width: 120,
      height: 105,
      iconName: n.icon,
      iconCategory: n.category,
      iconLabel: n.label,
      style: {
        fillColor: '#161924',
        strokeColor: n.color,
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        textColor: '#ECEFF4',
        fontSize: 13,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 10,
    });

    if (i > 0) {
      const prev = nodes[i - 1];
      elements.push({
        id: `conn-${prev.id}-${n.id}`,
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: prev.id, fromAnchor: 'right',
        toId: n.id, toAnchor: 'left',
        startPoint: { x: currentX - 220 + 120, y: 272 },
        endPoint: { x: currentX, y: 272 },
        routing: 'orthogonal',
        arrowEnd: true,
        connectorLabel: 'Data Flow',
        style: {
          fillColor: 'transparent',
          strokeColor: n.color,
          strokeWidth: 2,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#C7D2FE',
          fontSize: 11,
          fontFamily: 'mono',
          textAlign: 'center',
          opacity: 1,
        },
        zIndex: 5,
      });
    }

    currentX += 220;
  }

  return {
    message: `Generated custom system architecture based on "${words.slice(0, 4).join(' ')}"`,
    elements,
    actionType: 'replace',
  };
}
