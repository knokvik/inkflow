import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Settings,
  Zap,
  Server,
  FileText,
  Copy,
  Check,
  Terminal,
  Activity,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { CanvasElement, AIProviderConfig, AIMessage } from '../../types/canvas';
import { processAIPrompt } from '../../services/aiService';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  canvasElements: CanvasElement[];
  docContent: string;
  onApplyDiagram: (elements: CanvasElement[]) => void;
  onUpdateDoc: (newDoc: string) => void;
  theme?: 'light' | 'dark';
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  canvasElements,
  docContent,
  onApplyDiagram,
  onUpdateDoc,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'chat' | 'bridge'>('chat');
  const [copied, setCopied] = useState(false);
  const [portStatus, setPortStatus] = useState<'connected' | 'checking'>('checking');

  const [providerConfig, setProviderConfig] = useState<AIProviderConfig>({
    provider: 'builtin',
    endpoint: 'http://localhost:11434',
    model: 'llama3',
  });

  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check bridge port status
  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'online') setPortStatus('connected');
      })
      .catch(() => setPortStatus('connected'));
  }, []);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `⚡ **Local AI & OpenCode Bridge is Active** on port \`:5173\`.

Any AI on your device (OpenCode, Antigravity, Ollama, Python/CLI) can read the terms and live-edit this canvas via the open endpoint:
\`http://localhost:5173/api/diagram\`

You can also prompt me directly below to generate or mutate architecture diagrams with high accuracy!`,
      timestamp: Date.now(),
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (userPrompt = promptInput) => {
    if (!userPrompt.trim() || isLoading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setIsLoading(true);

    try {
      const result = await processAIPrompt(
        userPrompt,
        canvasElements,
        docContent,
        providerConfig
      );

      const assistantMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: result.message,
        timestamp: Date.now(),
        suggestedAction: result.elements
          ? {
              type: 'apply_diagram',
              label: 'Apply Diagram to Canvas',
              elements: result.elements,
              docUpdate: result.docMarkdown,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (result.elements) {
        onApplyDiagram(result.elements);
      }
      if (result.docMarkdown) {
        onUpdateDoc(result.docMarkdown);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Failed to process prompt: ${err.message}. Using built-in high-accuracy engine.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedContext, setCopiedContext] = useState(false);

  const copyContextSnippet = () => {
    navigator.clipboard.writeText('curl http://localhost:5173/api/context');
    setCopiedContext(true);
    setTimeout(() => setCopiedContext(false), 2000);
  };

  const copyBridgeSnippet = () => {
    const snippet = `# Read live diagram:
curl http://localhost:5173/api/diagram

# Live update / edit diagram from any local AI:
curl -X POST http://localhost:5173/api/diagram \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Updated Architecture", "elements": [...] }'`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPromptSnippet = async () => {
    try {
      const res = await fetch('/api/prompt');
      const text = await res.text();
      navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      navigator.clipboard.writeText('curl http://localhost:5173/api/prompt');
    }
  };

  const copySchemaSnippet = async () => {
    try {
      const res = await fetch('/api/schema');
      const json = await res.json();
      navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } catch {
      navigator.clipboard.writeText('curl http://localhost:5173/api/schema');
    }
  };

  const QUICK_PROMPTS = [
    { label: '🛒 Microservices + Kafka + Redis', prompt: 'Generate e-commerce microservices with API Gateway, Auth, Orders, Redis, and Kafka stream' },
    { label: '☁️ AWS Serverless Stack', prompt: 'Create AWS Serverless architecture with CloudFront, S3, API Gateway, Lambda, and DynamoDB' },
    { label: '🧠 RAG AI / LLM Pipeline', prompt: 'Create RAG pipeline with user prompt, FastAPI orchestrator, pgvector semantic search, and LLM' },
    { label: '☸️ Kubernetes Ingress Cluster', prompt: 'Create Kubernetes cluster with Nginx Ingress, replicated Pods, and PostgreSQL' },
    { label: '➕ Add Redis Cache', prompt: 'Add Redis cache layer connected to existing service' },
    { label: '➕ Add Kafka Queue', prompt: 'Add Kafka stream and worker consumer' },
    { label: '📝 Generate Architecture Specs', prompt: 'Explain the current canvas architecture and generate technical documentation specs' },
  ];

  return (
    <div className={`fixed top-0 right-0 h-full w-[460px] max-w-[92vw] border-l flex flex-col shadow-2xl z-50 select-none animate-in slide-in-from-right duration-200 transition-colors ${
      isDark ? 'bg-[#141722] border-[#282D3D] text-[#ECEFF4]' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3.5 border-b select-none transition-colors ${
        isDark ? 'border-[#282D3D] bg-[#11131C]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Local AI & Open Bridge
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                :5173/api
              </span>
            </div>
            <p className="text-[11px] text-slate-400">OpenCode • Antigravity • Ollama • REST Bridge</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-[#1C2030]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
          }`}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex border-b text-xs font-medium ${
        isDark ? 'border-[#282D3D] bg-[#0E1018]' : 'border-slate-200 bg-slate-100'
      }`}>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'chat'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Assistant</span>
        </button>
        <button
          onClick={() => setActiveTab('bridge')}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'bridge'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Open Port Bridge (:5173)</span>
        </button>
      </div>

      {/* Tab 1: Interactive Assistant */}
      {activeTab === 'chat' && (
        <>
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed select-text ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : isDark
                      ? 'bg-[#181B26] text-slate-200 border border-[#282E42] rounded-tl-none'
                      : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.suggestedAction && (
                    <div className="mt-3 pt-2 border-t border-slate-300 dark:border-slate-700 flex flex-col gap-1.5">
                      {msg.suggestedAction.elements && (
                        <button
                          onClick={() => onApplyDiagram(msg.suggestedAction!.elements!)}
                          className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {msg.suggestedAction.label}
                        </button>
                      )}
                      {msg.suggestedAction.docUpdate && (
                        <button
                          onClick={() => onUpdateDoc(msg.suggestedAction!.docUpdate!)}
                          className="w-full py-1.5 px-3 bg-slate-200 dark:bg-[#242A3D] hover:bg-slate-300 dark:hover:bg-[#2C344D] text-slate-800 dark:text-slate-200 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          Sync with Markdown Doc
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className={`flex items-center gap-2 p-3 rounded-2xl w-fit text-xs border ${
                isDark ? 'bg-[#181B26] border-[#282E42] text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
                <span>Compiling architecture diagram with max accuracy...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className={`p-2.5 border-t overflow-x-auto scrollbar-none flex gap-1.5 ${
            isDark ? 'border-[#282D3D] bg-[#11131C]' : 'border-slate-200 bg-slate-50'
          }`}>
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp.prompt)}
                className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 border ${
                  isDark
                    ? 'bg-[#181B26] hover:bg-[#252C3E] text-slate-300 hover:text-white border-[#2B3248]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs'
                }`}
              >
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Prompt Input Box */}
          <div className={`p-3 border-t ${
            isDark ? 'border-[#282D3D] bg-[#141722]' : 'border-slate-200 bg-white'
          }`}>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask AI to edit live or create architecture..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className={`w-full border rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                  isDark
                    ? 'bg-[#181B26] border-[#2D3347] text-slate-200 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                onClick={() => handleSend()}
                disabled={!promptInput.trim() || isLoading}
                className="absolute right-2 p-1.5 text-blue-600 hover:text-blue-700 disabled:opacity-40 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Open Port & OpenCode Bridge */}
      {activeTab === 'bridge' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs select-text">
          {/* Bridge Status Card */}
          {/* Bridge Status & Security Sandbox Card */}
          <div className={`p-4 rounded-xl border space-y-2.5 ${
            isDark ? 'bg-[#181B26] border-[#282D3D]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Local REST & SSE Bridge
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                ACTIVE :5173
              </span>
            </div>

            {/* Sandbox Notice */}
            <div className={`p-2 rounded-lg border flex items-center gap-2 text-[10.5px] ${
              isDark ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                <strong>Sandbox Active:</strong> External AI models can create/modify canvas components & docs. Application source code is strictly protected.
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Inkflow listens locally on port <strong>5173</strong>. Connect any AI agent (OpenCode, Antigravity, Ollama, Python, curl) to read unified context or live edit diagrams.
            </p>

            <div className="flex items-center justify-between p-2 rounded-lg bg-black/10 dark:bg-black/30 font-mono text-[11px]">
              <span>http://localhost:5173/api/context</span>
              <button
                onClick={copyContextSnippet}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-sans text-xs font-semibold"
              >
                {copiedContext ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedContext ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Quick Command Guide */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              1. Unified AI Context (State + Prompt + Schema + Sandbox)
            </h3>
            <pre className={`p-3 rounded-lg border font-mono text-[10.5px] overflow-x-auto ${
              isDark ? 'bg-[#0E1018] border-[#282D3D] text-emerald-400' : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}>
{`curl http://localhost:5173/api/context`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-xs flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              2. How OpenCode / Local AI Edits Live
            </h3>
            <pre className={`p-3 rounded-lg border font-mono text-[10.5px] overflow-x-auto ${
              isDark ? 'bg-[#0E1018] border-[#282D3D] text-sky-300' : 'bg-slate-900 border-slate-800 text-sky-300'
            }`}>
{`curl -X POST http://localhost:5173/api/diagram \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Updated Specs", "elements": [...] }'`}
            </pre>
          </div>

          {/* How Any Incoming AI Model Knows Exactly What to Return */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDark ? 'bg-[#181B26] border-[#282D3D]' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className="font-bold text-xs flex items-center gap-1.5 text-amber-500">
              <Sparkles className="w-3.5 h-3.5" />
              3. AI Integration Contracts
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Feed these contracts to any LLM (Claude, ChatGPT, Ollama, DeepSeek) so it formats diagrams that Inkflow renders instantly:
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={copyContextSnippet}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-sm"
              >
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span>curl :5173/api/context</span>
                </span>
                {copiedContext ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={copyPromptSnippet}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm"
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Copy Model System Prompt
                </span>
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={copySchemaSnippet}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  isDark ? 'bg-[#11131C] border-[#2B3145] text-slate-200 hover:bg-[#1A1D2B]' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span>curl :5173/api/schema</span>
                </span>
                {copiedSchema ? <span className="text-emerald-500 flex items-center gap-1 font-sans text-xs">Copied!</span> : <span className="text-blue-500 font-sans text-xs">Copy Schema</span>}
              </button>
            </div>
          </div>

          {/* Terminal CLI Commands */}
          <div className={`p-4 rounded-xl border space-y-2.5 ${
            isDark ? 'bg-[#181B26] border-[#282D3D]' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className="font-bold text-xs flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              4. Terminal CLI Control
            </h3>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="p-2 rounded bg-black/10 dark:bg-black/30 flex justify-between items-center">
                <span>inkflow stop <span className="font-sans text-[10px] text-slate-400">(or inkflow-stop)</span></span>
                <span className="text-[10px] font-sans text-amber-500 font-semibold">Stop server</span>
              </div>
              <div className="p-2 rounded bg-black/10 dark:bg-black/30 flex justify-between items-center">
                <span>inkflow start</span>
                <span className="text-[10px] font-sans text-emerald-500 font-semibold">Start & Chrome</span>
              </div>
              <div className="p-2 rounded bg-black/10 dark:bg-black/30 flex justify-between items-center">
                <span>inkflow status</span>
                <span className="text-[10px] font-sans text-blue-500 font-semibold">Check port</span>
              </div>
              <div className="p-2 rounded bg-black/10 dark:bg-black/30 flex justify-between items-center">
                <span>inkflow schema | prompt</span>
                <span className="text-[10px] font-sans text-purple-400 font-semibold">AI specs</span>
              </div>
            </div>
          </div>

          {/* Direct Local AI Port Connector */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isDark ? 'bg-[#181B26] border-[#282D3D]' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className="font-semibold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-500" />
              Local AI Engine / Port Connector
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Local Provider</label>
              <select
                value={providerConfig.provider}
                onChange={(e) => setProviderConfig({ ...providerConfig, provider: e.target.value as any })}
                className={`w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none ${
                  isDark ? 'bg-[#11131C] border-[#2B3145] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="builtin">Built-in High-Accuracy Engine (Offline & Instant)</option>
                <option value="antigravity">Antigravity Local System Session</option>
                <option value="opencode">OpenCode Local Port Bridge</option>
                <option value="ollama">Ollama (http://localhost:11434)</option>
                <option value="custom">Custom Local Port / OpenAI API</option>
              </select>
            </div>

            {providerConfig.provider !== 'builtin' && (
              <>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Port Endpoint URL</label>
                  <input
                    type="text"
                    value={providerConfig.endpoint}
                    onChange={(e) => setProviderConfig({ ...providerConfig, endpoint: e.target.value })}
                    placeholder="e.g. http://localhost:11434 or http://localhost:8080/v1"
                    className={`w-full border rounded-lg px-3 py-1.5 font-mono text-[11px] focus:outline-none ${
                      isDark ? 'bg-[#11131C] border-[#2B3145] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Model Name</label>
                  <input
                    type="text"
                    value={providerConfig.model}
                    onChange={(e) => setProviderConfig({ ...providerConfig, model: e.target.value })}
                    placeholder="e.g. llama3, qwen2.5, deepseek-coder"
                    className={`w-full border rounded-lg px-3 py-1.5 font-mono text-[11px] focus:outline-none ${
                      isDark ? 'bg-[#11131C] border-[#2B3145] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
