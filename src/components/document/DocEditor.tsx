import React, { useState } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Code as CodeIcon,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { CanvasElement } from '../../types/canvas';

interface DocEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  canvasElements: CanvasElement[];
  onHighlightElement?: (elementId: string) => void;
  onAskAIAboutDoc?: () => void;
  theme?: 'light' | 'dark';
}

export const DocEditor: React.FC<DocEditorProps> = ({
  content,
  onChange,
  onAskAIAboutDoc,
  theme = 'light',
}) => {
  // Default to 'split' so user sees formatted H1/H2 live side-by-side with editor!
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const isDark = theme === 'dark';

  const insertText = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('eraser-doc-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  const insertCallout = (type: 'NOTE' | 'TIP' | 'WARNING') => {
    insertText(`> [!${type}]\n> `);
  };

  const handleToggleCheckbox = (lineIndex: number, currentChecked: boolean) => {
    const lines = content.split('\n');
    if (lines[lineIndex]) {
      if (currentChecked) {
        lines[lineIndex] = lines[lineIndex].replace('- [x] ', '- [ ] ');
      } else {
        lines[lineIndex] = lines[lineIndex].replace('- [ ] ', '- [x] ');
      }
      onChange(lines.join('\n'));
    }
  };

  const copyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Inline formatting helper (**bold**, *italic*, `code`, [link](url))
  const formatInline = (text: string): React.ReactNode => {
    // Regex for bold, italic, code, link
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Simple markdown inline tokenization
    const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-neutral-900 dark:text-white">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={keyIdx++} className="italic text-neutral-700 dark:text-neutral-300">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-neutral-100 dark:bg-[#2A2A2A] text-neutral-800 dark:text-neutral-200 font-semibold border border-neutral-200 dark:border-[#383838]"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('[') && token.includes('](')) {
        const title = token.substring(1, token.indexOf(']('));
        const url = token.substring(token.indexOf('](') + 2, token.length - 1);
        parts.push(
          <a
            key={keyIdx++}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-neutral-800 dark:text-neutral-200 underline hover:opacity-80 font-medium"
          >
            {title}
          </a>
        );
      }
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Convert markdown to rich live rendered HTML preview
  const renderMarkdownPreview = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';
    let codeBlockIdx = 0;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.slice(3).trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const fullCode = codeBuffer.join('\n');
          const currentIdx = codeBlockIdx++;
          elements.push(
            <div
              key={`code-${idx}`}
              className="my-3 rounded-xl overflow-hidden border border-neutral-200 dark:border-[#2E2E2E] bg-neutral-900 dark:bg-[#141414] text-neutral-100 shadow-md"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-mono text-neutral-400">
                <span>{codeLang || 'code'}</span>
                <button
                  onClick={() => copyCode(fullCode, currentIdx)}
                  className="flex items-center gap-1 hover:text-white"
                >
                  {copiedCodeIdx === currentIdx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCodeIdx === currentIdx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 text-xs font-mono overflow-x-auto leading-relaxed">
                <code>{fullCode}</code>
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={idx}
            className="text-2xl font-extrabold mt-6 mb-3 pb-2 border-b border-neutral-200 dark:border-[#2E2E2E] text-neutral-900 dark:text-neutral-100 flex items-center gap-2"
          >
            <span>{formatInline(line.slice(2))}</span>
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={idx}
            className="text-xl font-bold mt-5 mb-2 text-neutral-800 dark:text-neutral-100 flex items-center gap-2"
          >
            <span>{formatInline(line.slice(3))}</span>
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={idx}
            className="text-base font-semibold mt-4 mb-2 text-neutral-800 dark:text-neutral-200"
          >
            {formatInline(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith('---')) {
        elements.push(
          <hr key={idx} className="my-5 border-neutral-200 dark:border-[#2E2E2E]" />
        );
      } else if (line.startsWith('> [!TIP]')) {
        elements.push(
          <div
            key={idx}
            className="my-3 p-3 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-xl text-emerald-800 dark:text-emerald-200 text-xs shadow-xs"
          >
            <span className="font-bold uppercase tracking-wider block mb-1">Tip</span>
            <div>{formatInline(lines[idx + 1]?.replace(/^>\s*/, '') || '')}</div>
          </div>
        );
        idx++; // skip next line if consumed
      } else if (line.startsWith('> [!NOTE]') || line.startsWith('> [!INFO]')) {
        elements.push(
          <div
            key={idx}
            className="my-3 p-3 bg-neutral-500/10 border-l-4 border-neutral-400 dark:border-neutral-500 rounded-r-xl text-neutral-800 dark:text-neutral-200 text-xs shadow-xs"
          >
            <span className="font-bold uppercase tracking-wider block mb-1">Note</span>
            <div>{formatInline(lines[idx + 1]?.replace(/^>\s*/, '') || '')}</div>
          </div>
        );
        idx++;
      } else if (line.startsWith('> [!WARNING]')) {
        elements.push(
          <div
            key={idx}
            className="my-3 p-3 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl text-amber-800 dark:text-amber-200 text-xs shadow-xs"
          >
            <span className="font-bold uppercase tracking-wider block mb-1">Warning</span>
            <div>{formatInline(lines[idx + 1]?.replace(/^>\s*/, '') || '')}</div>
          </div>
        );
        idx++;
      } else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const isChecked = line.startsWith('- [x] ');
        const lineIdx = idx;
        elements.push(
          <div
            key={idx}
            onClick={() => handleToggleCheckbox(lineIdx, isChecked)}
            className="flex items-center gap-2.5 my-1.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={isChecked}
              readOnly
              className="w-4 h-4 rounded text-neutral-800 dark:text-neutral-200 focus:ring-0 cursor-pointer accent-neutral-600"
            />
            <span className={isChecked ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
              {formatInline(line.slice(6))}
            </span>
          </div>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={idx} className="list-disc ml-5 my-1 text-xs text-neutral-700 dark:text-neutral-300">
            {formatInline(line.slice(2))}
          </li>
        );
      } else if (line.match(/^\d+\.\s/)) {
        const textPart = line.replace(/^\d+\.\s/, '');
        elements.push(
          <li key={idx} className="list-decimal ml-5 my-1 text-xs text-neutral-700 dark:text-neutral-300">
            {formatInline(textPart)}
          </li>
        );
      } else if (line.startsWith('|') && line.endsWith('|')) {
        // Table row
        const cells = line
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        if (line.includes('---')) {
          continue; // header divider
        }
        elements.push(
          <div
            key={idx}
            className="grid grid-flow-col auto-cols-fr gap-2 py-1.5 px-3 border-b border-neutral-100 dark:border-[#2E2E2E] text-xs"
          >
            {cells.map((c, i) => (
              <span key={i} className="font-medium text-neutral-700 dark:text-neutral-300">
                {formatInline(c)}
              </span>
            ))}
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-2.5" />);
      } else {
        elements.push(
          <p key={idx} className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 my-1">
            {formatInline(line)}
          </p>
        );
      }
    }

    return elements;
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      className={`h-full flex flex-col border-r select-text transition-colors ${
        isDark ? 'bg-[#1E1E1E] border-[#2E2E2E]' : 'bg-white border-neutral-200'
      }`}
    >
      {/* Document Formatting Toolbar */}
      <div
        className={`flex items-center justify-between p-2 border-b select-none transition-colors ${
          isDark ? 'border-[#2E2E2E] bg-[#181818]' : 'border-neutral-200 bg-neutral-50'
        }`}
      >
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => insertText('# ')}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-[#282828]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('## ')}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-[#282828]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('### ')}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-[#282828]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className={`h-3.5 w-px mx-0.5 ${isDark ? 'bg-[#2E2E2E]' : 'bg-neutral-200'}`} />

          <button
            onClick={() => insertText('**', '**')}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-[#282828]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('*', '*')}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-[#282828]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('`', '`')}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-[#282828]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Inline Code"
          >
            <CodeIcon className="w-3.5 h-3.5" />
          </button>

          <div className={`h-3.5 w-px mx-0.5 ${isDark ? 'bg-[#2E2E2E]' : 'bg-neutral-200'}`} />

          <button
            onClick={() => insertText('- ')}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-[#282828]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('1. ')}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-[#282828]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('- [ ] ')}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-[#282828]' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Task Checklist"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          <div className={`h-3.5 w-px mx-0.5 ${isDark ? 'bg-[#2E2E2E]' : 'bg-neutral-200'}`} />

          <button
            onClick={() => insertCallout('TIP')}
            className={`p-1 rounded text-xs font-semibold transition-colors ${
              isDark ? 'text-neutral-400 hover:text-emerald-400 hover:bg-[#282828]' : 'text-neutral-600 hover:text-emerald-600 hover:bg-neutral-100'
            }`}
            title="Insert Tip Callout"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Way Mode Toggle: Split | Preview | Edit */}
        <div
          className={`flex items-center gap-0.5 p-0.5 rounded-lg border text-xs ${
            isDark ? 'bg-[#242424] border-[#333333]' : 'bg-neutral-100 border-neutral-200'
          }`}
        >
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 font-medium transition-all ${
              viewMode === 'split'
                ? isDark
                  ? 'bg-[#383838] text-white shadow-xs'
                  : 'bg-white text-neutral-900 shadow-xs'
                : isDark
                ? 'text-neutral-400 hover:text-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Split Mode (Live Editor + Rich Preview)"
          >
            <Columns className="w-3 h-3" />
            <span>Split</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 font-medium transition-all ${
              viewMode === 'preview'
                ? isDark
                  ? 'bg-[#383838] text-white shadow-xs'
                  : 'bg-white text-neutral-900 shadow-xs'
                : isDark
                ? 'text-neutral-400 hover:text-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Full Rendered Markdown Preview"
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setViewMode('edit')}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 font-medium transition-all ${
              viewMode === 'edit'
                ? isDark
                  ? 'bg-[#383838] text-white shadow-xs'
                  : 'bg-white text-neutral-900 shadow-xs'
                : isDark
                ? 'text-neutral-400 hover:text-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="Raw Markdown Editor"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Raw Markdown Editor (in Split or Edit mode) */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div
            className={`h-full overflow-y-auto p-4 flex-1 ${
              viewMode === 'split'
                ? isDark
                  ? 'border-r border-[#2E2E2E]'
                  : 'border-r border-neutral-200'
                : ''
            }`}
          >
            <textarea
              id="eraser-doc-textarea"
              className={`w-full h-full bg-transparent font-mono text-xs leading-relaxed resize-none focus:outline-none transition-colors ${
                isDark ? 'text-neutral-100 placeholder-neutral-600' : 'text-neutral-900 placeholder-neutral-400'
              }`}
              placeholder="Type markdown specs here (# Heading, **bold**, - [ ] task)..."
              value={content}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        )}

        {/* Right: Live Rendered Rich Markdown Preview (in Split or Preview mode) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="h-full overflow-y-auto p-5 flex-1">
            <div className="max-w-none">{renderMarkdownPreview(content)}</div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div
        className={`px-3 py-1.5 border-t text-[11px] flex items-center justify-between select-none transition-colors ${
          isDark
            ? 'border-[#2E2E2E] bg-[#181818] text-neutral-400'
            : 'border-neutral-200 bg-neutral-50 text-neutral-600'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span>{wordCount} words</span>
          <span>•</span>
          <span className="text-emerald-500 font-mono text-[10.5px] flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Markdown
          </span>
        </div>

        {onAskAIAboutDoc && (
          <button
            onClick={onAskAIAboutDoc}
            className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
              isDark ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Specs</span>
          </button>
        )}
      </div>
    </div>
  );
};
