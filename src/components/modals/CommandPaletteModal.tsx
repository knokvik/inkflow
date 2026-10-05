import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Square,
  Circle,
  Diamond,
  Layers,
  ArrowUpRight,
  Type,
  StickyNote,
  LayoutGrid,
  Pencil,
  Sun,
  Moon,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  Boxes,
  Sparkles,
  Check,
  Grid,
  Command,
} from 'lucide-react';
import { ICON_CATALOG } from '../../constants/icons';
import { EraserDocument, ToolType } from '../../types/canvas';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolType) => void;
  onPlaceIcon: (iconDef: any) => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onCycleGrid: () => void;
  onToggleRoughStyle: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onExportMarkdown: () => void;
  documents: EraserDocument[];
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onOpenAIBridge: () => void;
}

interface PaletteItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onPlaceIcon,
  onFitToScreen,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  theme,
  onToggleTheme,
  onCycleGrid,
  onToggleRoughStyle,
  onExportPNG,
  onExportSVG,
  onExportMarkdown,
  documents,
  onSelectDoc,
  onCreateDoc,
  onOpenAIBridge,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allItems: PaletteItem[] = useMemo(() => {
    const items: PaletteItem[] = [
      // Tools & Shapes
      {
        id: 'tool-rect',
        category: 'Draw & Shapes',
        title: 'Rectangle',
        subtitle: 'Insert rectangle box',
        shortcut: 'R',
        icon: <Square className="w-4 h-4 text-blue-500" />,
        action: () => onSelectTool('rounded-rect'),
      },
      {
        id: 'tool-circle',
        category: 'Draw & Shapes',
        title: 'Circle',
        subtitle: 'Insert round circle node',
        shortcut: 'O',
        icon: <Circle className="w-4 h-4 text-sky-500" />,
        action: () => onSelectTool('circle'),
      },
      {
        id: 'tool-diamond',
        category: 'Draw & Shapes',
        title: 'Diamond',
        subtitle: 'Decision gateway diamond',
        shortcut: 'D',
        icon: <Diamond className="w-4 h-4 text-purple-500" />,
        action: () => onSelectTool('diamond'),
      },
      {
        id: 'tool-db',
        category: 'Draw & Shapes',
        title: 'Database Cylinder',
        subtitle: 'Storage database container',
        shortcut: 'DB',
        icon: <Layers className="w-4 h-4 text-emerald-500" />,
        action: () => onSelectTool('cylinder'),
      },
      {
        id: 'tool-arrow',
        category: 'Draw & Shapes',
        title: 'Arrow & Connector',
        subtitle: 'Connect nodes with directional arrow',
        shortcut: 'A',
        icon: <ArrowUpRight className="w-4 h-4 text-indigo-500" />,
        action: () => onSelectTool('connector'),
      },
      {
        id: 'tool-text',
        category: 'Draw & Shapes',
        title: 'Text Box',
        subtitle: 'Expandable text element with inline typing',
        shortcut: 'T',
        icon: <Type className="w-4 h-4 text-slate-500" />,
        action: () => onSelectTool('text'),
      },
      {
        id: 'tool-sticky',
        category: 'Draw & Shapes',
        title: 'Sticky Note',
        subtitle: 'Yellow architectural sticky note',
        shortcut: 'S',
        icon: <StickyNote className="w-4 h-4 text-amber-500" />,
        action: () => onSelectTool('sticky'),
      },
      {
        id: 'tool-frame',
        category: 'Draw & Shapes',
        title: 'Frame / Boundary Group',
        subtitle: 'Group elements inside architecture frame',
        shortcut: 'F',
        icon: <LayoutGrid className="w-4 h-4 text-blue-500" />,
        action: () => onSelectTool('frame'),
      },
      {
        id: 'tool-pen',
        category: 'Draw & Shapes',
        title: 'Freehand Draw (Pen)',
        subtitle: 'Draw freehand vector paths',
        shortcut: 'P',
        icon: <Pencil className="w-4 h-4 text-pink-500" />,
        action: () => onSelectTool('pen'),
      },

      // Canvas Actions
      {
        id: 'act-fit',
        category: 'View & Canvas',
        title: 'Fit to Screen',
        subtitle: 'Zoom out to see all elements',
        shortcut: 'Shift+1',
        icon: <Maximize2 className="w-4 h-4 text-blue-500" />,
        action: onFitToScreen,
      },
      {
        id: 'act-zoom100',
        category: 'View & Canvas',
        title: 'Reset Zoom (100%)',
        subtitle: 'Set scale to 100%',
        shortcut: 'Cmd+0',
        icon: <ZoomIn className="w-4 h-4 text-slate-400" />,
        action: onResetZoom,
      },
      {
        id: 'act-theme',
        category: 'View & Canvas',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle interface theme',
        icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />,
        action: onToggleTheme,
      },
      {
        id: 'act-grid',
        category: 'View & Canvas',
        title: 'Cycle Grid Mode',
        subtitle: 'Toggle dots / grid / none',
        icon: <Grid className="w-4 h-4 text-slate-400" />,
        action: onCycleGrid,
      },
      {
        id: 'act-rough',
        category: 'View & Canvas',
        title: 'Toggle Hand-drawn Rough Style',
        subtitle: 'Switch between crisp vector and sketch style',
        icon: <Pencil className="w-4 h-4 text-slate-400" />,
        action: onToggleRoughStyle,
      },

      // Export
      {
        id: 'exp-png',
        category: 'Export',
        title: 'Export PNG Image',
        subtitle: 'High resolution diagram screenshot',
        icon: <Download className="w-4 h-4 text-sky-500" />,
        action: onExportPNG,
      },
      {
        id: 'exp-svg',
        category: 'Export',
        title: 'Export SVG Vector',
        subtitle: 'Scalable vector graphics diagram',
        icon: <Download className="w-4 h-4 text-amber-500" />,
        action: onExportSVG,
      },
      {
        id: 'exp-md',
        category: 'Export',
        title: 'Export Markdown (.md)',
        subtitle: 'Download architecture documentation',
        icon: <FileText className="w-4 h-4 text-emerald-500" />,
        action: onExportMarkdown,
      },

      // Documents
      {
        id: 'doc-new',
        category: 'Documents',
        title: 'Create New Document',
        subtitle: 'Start a blank canvas & specs doc',
        icon: <FileText className="w-4 h-4 text-blue-500" />,
        action: onCreateDoc,
      },
      ...documents.map((d) => ({
        id: `doc-${d.id}`,
        category: 'Documents',
        title: `Open: ${d.title}`,
        subtitle: `${d.elements.length} elements`,
        icon: <FileText className="w-4 h-4 text-slate-400" />,
        action: () => onSelectDoc(d.id),
      })),

      // Local AI Bridge
      {
        id: 'act-ai-bridge',
        category: 'Integrations',
        title: 'Local AI Bridge (OpenCode / Antigravity)',
        subtitle: 'View port 5173 API endpoints and curl examples',
        shortcut: ':5173',
        icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        action: onOpenAIBridge,
      },
    ];

    // Add all official icons from ICON_CATALOG
    ICON_CATALOG.forEach((icon) => {
      items.push({
        id: `icon-${icon.id}`,
        category: `Insert Icon: ${icon.category.toUpperCase()}`,
        title: icon.name,
        subtitle: `Place ${icon.name} vector logo`,
        icon: (
          <div className="w-5 h-5 flex items-center justify-center shrink-0 rounded p-0.5">
            <img
              src={icon.iconUrl || `/icons/${icon.id}.svg`}
              alt={icon.name}
              className="w-4 h-4 object-contain"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        ),
        action: () => onPlaceIcon(icon),
      });
    });

    return items;
  }, [
    onSelectTool,
    onPlaceIcon,
    onFitToScreen,
    onResetZoom,
    theme,
    onToggleTheme,
    onCycleGrid,
    onToggleRoughStyle,
    onExportPNG,
    onExportSVG,
    onExportMarkdown,
    documents,
    onSelectDoc,
    onCreateDoc,
    onOpenAIBridge,
  ]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 15);
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    ).slice(0, 25);
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-100 ${
          isDark
            ? 'bg-[#1E1E1E] border-[#2E2E2E] text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight Search Header */}
        <div
          className={`flex items-center gap-3 px-4 py-3.5 border-b ${
            isDark ? 'border-[#2E2E2E] bg-[#181818]' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, tool, or search 40+ icons (e.g. Lambda, React, Docker)..."
            className={`w-full bg-transparent text-sm focus:outline-none placeholder-neutral-400 font-medium ${
              isDark ? 'text-white' : 'text-neutral-900'
            }`}
          />
          <kbd
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-[#262626] border-[#383838] text-neutral-400'
                : 'bg-white border-neutral-200 text-neutral-500'
            }`}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-400">
              No matching tools, icons, or commands found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? isDark
                        ? 'bg-[#2E2E2E] text-white ring-1 ring-white/10'
                        : 'bg-neutral-800 text-white shadow-xs'
                      : isDark
                      ? 'hover:bg-[#262626] text-neutral-300'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{item.icon}</div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span
                          className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded ${
                            isSelected
                              ? isDark
                                ? 'bg-[#3A3A3A] text-neutral-200'
                                : 'bg-neutral-700 text-neutral-200'
                              : isDark
                              ? 'bg-[#262626] text-neutral-400'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div
                          className={`text-[10.5px] truncate ${
                            isSelected ? (isDark ? 'text-neutral-300' : 'text-neutral-300') : 'text-neutral-400'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.shortcut && (
                    <kbd
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ml-2 shrink-0 ${
                        isSelected
                          ? isDark
                            ? 'bg-[#3A3A3A] border-[#4A4A4A] text-white'
                            : 'bg-neutral-700 border-neutral-600 text-white'
                          : isDark
                          ? 'bg-[#242424] border-[#333333] text-neutral-400'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-500'
                      }`}
                    >
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono select-none ${
            isDark ? 'border-[#2E2E2E] bg-[#181818] text-neutral-500' : 'border-neutral-200 bg-neutral-50 text-neutral-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className={`flex items-center gap-1.5 font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
            <Command className="w-3.5 h-3.5" />
            <span>Inkflow Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
