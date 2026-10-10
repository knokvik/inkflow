import React, { useState, useEffect } from 'react';
import {
  FileText,
  Columns,
  Square,
  Download,
  Share2,
  Sparkles,
  Code,
  Image as ImageIcon,
  Menu,
  Sun,
  Moon,
  MoreHorizontal,
  Command,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  viewMode: 'both' | 'split' | 'canvas' | 'doc';
  onViewModeChange: (mode: 'both' | 'canvas' | 'doc') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAI: () => void;
  onOpenCodeDSL: () => void;
  onOpenSpotlight: () => void;
  onExportPDF?: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onExportMarkdown: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  aiStatus?: 'idle' | 'building';
}

const ASCII_FRAMES = ['[⠋]', '[⠙]', '[⠹]', '[⠸]', '[⠼]', '[⠴]', '[⠦]', '[⠧]', '[⠇]', '[⠏]'];

export const Header: React.FC<HeaderProps> = ({
  title,
  onTitleChange,
  viewMode,
  onViewModeChange,
  theme,
  onToggleTheme,
  onOpenAI,
  onOpenCodeDSL,
  onOpenSpotlight,
  onExportPDF,
  onExportPNG,
  onExportSVG,
  onExportMarkdown,
  onToggleSidebar,
  isSidebarOpen,
  aiStatus = 'idle',
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [asciiIndex, setAsciiIndex] = useState(0);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (aiStatus !== 'building') return;
    const interval = setInterval(() => {
      setAsciiIndex((prev) => (prev + 1) % ASCII_FRAMES.length);
    }, 90);
    return () => clearInterval(interval);
  }, [aiStatus]);



  return (
    <header
      className={`h-14 border-b px-4 flex items-center justify-between relative z-30 select-none transition-colors ${
        isDark ? 'bg-[#1E1E1E] border-[#2E2E2E]' : 'bg-white border-neutral-200'
      }`}
    >
      {/* Left: Always-visible Menu, Logo & Document Chip */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark
              ? 'text-neutral-400 hover:text-white hover:bg-[#2A2A2A]'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
          }`}
          title="Toggle Documents Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Official Inkflow Logo */}
        <div
          className="flex items-center gap-0.5 cursor-pointer select-none"
          onClick={() => onViewModeChange('canvas')}
          title="Inkflow"
        >
          <img
            src={isDark ? '/inkflow-logo-dark.png' : '/inkflow-logo-light.png'}
            alt="Inkflow"
            className={`h-5 w-5 object-contain shrink-0 transition-transform ${
              isDark
                ? 'hover:scale-105'
                : 'scale-150 hover:scale-[1.575]'
            }`}
          />
          <span
            className={`font-bold text-sm tracking-tight select-none transition-colors ${
              isDark ? 'text-white' : 'text-neutral-900'
            }`}
          >
            inkflow
          </span>
        </div>

        {/* Divider line */}
        <div className={`h-3.5 w-px ${isDark ? 'bg-[#333333]' : 'bg-neutral-200'}`} />

        {/* File Name in Chip Format */}
        {isEditingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsEditingTitle(false);
            }}
            autoFocus
            className={`border rounded-lg px-2.5 py-0.5 text-xs font-medium focus:outline-none ${
              isDark
                ? 'bg-[#2A2A2A] border-neutral-500 text-white'
                : 'bg-white border-neutral-400 text-neutral-900'
            }`}
          />
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors shadow-2xs ${
              isDark
                ? 'bg-[#262626] border-[#383838] text-neutral-200 hover:bg-[#2F2F2F] hover:border-neutral-500'
                : 'bg-neutral-100/90 border-neutral-200 text-neutral-700 hover:bg-neutral-200/80 hover:text-neutral-900'
            }`}
            title="Click to rename document"
          >
            <FileText className="w-3.5 h-3.5 opacity-60" />
            <span className="max-w-[150px] truncate">{title || 'Untitled'}</span>
          </div>
        )}
      </div>

      {/* Center: Exact View Mode Segmented Controls [ Document | Both | Canvas ] - Perfectly Centered */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 flex items-center p-1 rounded-xl border ${
          isDark ? 'bg-[#262626] border-[#383838]' : 'bg-[#F3F4F6] border-neutral-200'
        }`}
      >
        <button
          onClick={() => onViewModeChange('doc')}
          className={`px-3.5 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'doc'
              ? isDark
                ? 'bg-[#333333] text-white border border-white/10 shadow-xs'
                : 'bg-white text-neutral-900 border border-neutral-200/80 shadow-xs'
              : isDark
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Document
        </button>

        <button
          onClick={() => onViewModeChange('both')}
          className={`px-3.5 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'both' || viewMode === 'split'
              ? isDark
                ? 'bg-[#333333] text-white border border-white/10 shadow-xs'
                : 'bg-white text-neutral-900 border border-neutral-200/80 shadow-xs'
              : isDark
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Both
        </button>

        <button
          onClick={() => onViewModeChange('canvas')}
          className={`px-3.5 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'canvas'
              ? isDark
                ? 'bg-[#333333] text-white border border-white/10 shadow-xs'
                : 'bg-white text-neutral-900 border border-neutral-200/80 shadow-xs'
              : isDark
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Canvas
        </button>
      </div>

      {/* Right: Cmd+K, Theme Toggle, Share, AI, Export */}
      <div className="flex items-center gap-2">
        {/* Command Search Shortcut (⌘ K) */}
        <button
          onClick={onOpenSpotlight}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
            isDark
              ? 'bg-[#262626] border-[#383838] text-neutral-300 hover:text-white'
              : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-xs'
          }`}
          title="Spotlight Search & Command Palette (⌘K)"
        >
          <Command className="w-3.5 h-3.5" />
          <span>K</span>
        </button>

        {/* Theme Switcher (Dark / Light Mode) */}
        <button
          onClick={onToggleTheme}
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-[#262626] border-[#383838] text-amber-400 hover:bg-[#333333]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-xs'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Local link copied to clipboard!');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isDark
              ? 'bg-[#262626] border-[#383838] text-neutral-200 hover:bg-[#333333]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-xs'
          }`}
        >
          <span>Share</span>
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Minimalist AI Status Button */}
        <button
          onClick={onOpenAI}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all active:scale-95 ${
            aiStatus === 'building'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20'
              : isDark
              ? 'bg-[#262626] border-[#383838] text-neutral-300 hover:text-white hover:bg-[#333333]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 shadow-xs'
          }`}
          title={aiStatus === 'building' ? 'Inkflow AI is building diagram live in real-time...' : 'Inkflow AI Bridge (Port :5173: Idle)'}
        >
          {aiStatus === 'building' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-emerald-500 font-bold">{ASCII_FRAMES[asciiIndex]}</span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Building...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500" />
              <span className="font-semibold text-xs tracking-tight">AI</span>
            </>
          )}
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isDark
                ? 'bg-[#262626] border-[#383838] text-neutral-200 hover:bg-[#333333]'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-xs'
            }`}
            title="Export Options (PDF, PNG, SVG, Markdown)"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-300" />
            <span>Export</span>
          </button>

          {exportMenuOpen && (
            <div
              className={`absolute right-0 top-10 p-1.5 rounded-xl border shadow-2xl flex flex-col gap-1 min-w-[190px] z-50 animate-in fade-in zoom-in-95 duration-100 ${
                isDark ? 'bg-[#242424] border-[#383838]' : 'bg-white border-neutral-200'
              }`}
            >
              <button
                onClick={() => {
                  if (onExportPDF) onExportPDF();
                  else window.print();
                  setExportMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#333333] hover:text-neutral-900 dark:hover:text-white rounded-lg text-left transition-colors"
              >
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Export PDF Document</span>
              </button>
              <button
                onClick={() => { onExportPNG(); setExportMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#333333] hover:text-neutral-900 dark:hover:text-white rounded-lg text-left transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span>Export PNG Image</span>
              </button>
              <button
                onClick={() => { onExportSVG(); setExportMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#333333] hover:text-neutral-900 dark:hover:text-white rounded-lg text-left transition-colors"
              >
                <Code className="w-4 h-4 text-amber-500" />
                <span>Export SVG Vector</span>
              </button>
              <button
                onClick={() => { onExportMarkdown(); setExportMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#333333] hover:text-neutral-900 dark:hover:text-white rounded-lg text-left transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Export Markdown (.md)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
