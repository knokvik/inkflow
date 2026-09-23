import React from 'react';
import {
  MousePointer,
  Hand,
  Square,
  Circle,
  Diamond,
  Database,
  Type,
  ArrowUpRight,
  Minus,
  Pencil,
  StickyNote,
  LayoutGrid,
  Boxes,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HelpCircle,
} from 'lucide-react';
import { ToolType } from '../../types/canvas';

interface CanvasToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onOpenIconPicker: () => void;
  onOpenAIChat: () => void;
  onOpenCodeDSL: () => void;
  onOpenShortcuts: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  roughStyle: boolean;
  onToggleRoughStyle: () => void;
  gridMode: 'dots' | 'grid' | 'none';
  onCycleGrid: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
  theme?: 'light' | 'dark';
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  activeTool,
  onSelectTool,
  onOpenIconPicker,
  onOpenShortcuts,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  theme = 'light',
  isSidebarOpen = false,
  onToggleSidebar,
}) => {
  const isDark = theme === 'dark';

  const toolItemClass = (isActive: boolean, activeColor: string = 'text-white') =>
    `relative w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer group ${
      isActive
        ? isDark
          ? `bg-[#2E2E2E] ${activeColor} shadow-xs ring-1 ring-white/10`
          : `bg-neutral-800 ${activeColor} shadow-xs ring-1 ring-black/10`
        : isDark
        ? 'text-neutral-400 hover:text-white hover:bg-[#202020]'
        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
    }`;

  return (
    <>
      {/* LEFT VERTICAL PRIMARY TOOLBAR */}
      <aside
        className={`absolute left-4 top-20 flex flex-col items-center gap-1 p-1.5 rounded-2xl border shadow-xl z-30 select-none transition-colors backdrop-blur-md ${
          isDark ? 'bg-[#141414]/95 border-[#262626]' : 'bg-white/95 border-neutral-200 shadow-neutral-200/50'
        }`}
      >
        {/* V (Select Pointer) */}
        <button
          onClick={() => onSelectTool('select')}
          className={toolItemClass(activeTool === 'select', 'text-sky-300')}
          title="Select (V)"
        >
          <MousePointer className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">V</span>
        </button>

        {/* H (Hand / Pan) */}
        <button
          onClick={() => onSelectTool('hand')}
          className={toolItemClass(activeTool === 'hand', 'text-amber-300')}
          title="Hand (H or Space+Drag)"
        >
          <Hand className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">H</span>
        </button>

        <div className={`w-6 h-px my-0.5 ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'}`} />

        {/* R (Rectangle) */}
        <button
          onClick={() => onSelectTool('rounded-rect')}
          className={toolItemClass(activeTool === 'rounded-rect' || activeTool === 'rectangle', 'text-emerald-300')}
          title="Rectangle (R)"
        >
          <Square className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">R</span>
        </button>

        {/* O (Circle) */}
        <button
          onClick={() => onSelectTool('circle')}
          className={toolItemClass(activeTool === 'circle', 'text-cyan-300')}
          title="Circle (O)"
        >
          <Circle className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">O</span>
        </button>

        {/* D (Diamond / Gateway) */}
        <button
          onClick={() => onSelectTool('diamond')}
          className={toolItemClass(activeTool === 'diamond', 'text-purple-300')}
          title="Diamond (D)"
        >
          <Diamond className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">D</span>
        </button>

        {/* B (Database / Cylinder) */}
        <button
          onClick={() => onSelectTool('cylinder')}
          className={toolItemClass(activeTool === 'cylinder', 'text-teal-300')}
          title="Database Cylinder (B)"
        >
          <Database className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">B</span>
        </button>

        {/* T (Text) */}
        <button
          onClick={() => onSelectTool('text')}
          className={toolItemClass(activeTool === 'text', 'text-yellow-200')}
          title="Text Box (T)"
        >
          <Type className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">T</span>
        </button>

        <div className={`w-6 h-px my-0.5 ${isDark ? 'bg-[#333333]' : 'bg-neutral-200'}`} />

        {/* A (Arrow / Connector) */}
        <button
          onClick={() => onSelectTool('connector')}
          className={toolItemClass(activeTool === 'connector', 'text-orange-300')}
          title="Arrow (A) - Snaps & Joins to Blocks"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">A</span>
        </button>

        {/* P (Draw / Pen) */}
        <button
          onClick={() => onSelectTool('pen')}
          className={toolItemClass(activeTool === 'pen', 'text-pink-300')}
          title="Draw / Pen (P)"
        >
          <Pencil className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">P</span>
        </button>

        {/* S (Sticky Note) */}
        <button
          onClick={() => onSelectTool('sticky')}
          className={toolItemClass(activeTool === 'sticky', 'text-amber-300')}
          title="Sticky Note (S)"
        >
          <StickyNote className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">S</span>
        </button>

        {/* F (Frame / Boundary) */}
        <button
          onClick={() => onSelectTool('frame')}
          className={toolItemClass(activeTool === 'frame', 'text-indigo-300')}
          title="Frame / Group (F)"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">F</span>
        </button>

        {/* I (Cloud & Tech Icons) */}
        <button
          onClick={onOpenIconPicker}
          className={toolItemClass(false, 'text-violet-300')}
          title="Inkflow Icon Library (I)"
        >
          <Boxes className="w-4 h-4" />
          <span className="absolute bottom-0.5 right-1 text-[8.5px] font-mono opacity-60">I</span>
        </button>
      </aside>

      {/* TOP RIGHT / BOTTOM RIGHT CANVAS CONTROLS */}
      <div className="absolute top-4 right-5 flex items-center gap-2 z-30 select-none">
        {/* Zoom controls */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-colors ${
            isDark ? 'bg-[#141414] border-[#262626] text-neutral-200' : 'bg-white border-neutral-200 text-neutral-700'
          }`}
        >
          <button onClick={onZoomOut} className="hover:text-neutral-900 dark:hover:text-white p-0.5" title="Zoom Out (Cmd -)">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span onClick={onResetZoom} className="cursor-pointer font-mono px-1" title="Reset Zoom (Cmd 0)">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={onZoomIn} className="hover:text-neutral-900 dark:hover:text-white p-0.5" title="Zoom In (Cmd +)">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fit to screen */}
        <button
          onClick={onFitToScreen}
          className={`p-2 rounded-lg border shadow-xs transition-colors ${
            isDark ? 'bg-[#141414] border-[#262626] text-neutral-300 hover:text-white hover:bg-[#202020]' : 'bg-white border-neutral-200 text-neutral-700 hover:text-neutral-900'
          }`}
          title="Fit diagram to viewport (Shift + 1)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* BOTTOM LEFT: UNDO, REDO & HELP */}
      <div className="absolute bottom-5 left-5 flex items-center gap-2 z-30 select-none">
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border shadow-lg backdrop-blur-md transition-colors ${
            isDark ? 'bg-[#141414]/95 border-[#262626]' : 'bg-white/95 border-neutral-200'
          }`}
        >
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo
                ? isDark ? 'text-neutral-300 hover:bg-[#202020] hover:text-white' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                : 'text-neutral-400/40 cursor-not-allowed'
            }`}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo
                ? isDark ? 'text-neutral-300 hover:bg-[#202020] hover:text-white' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                : 'text-neutral-400/40 cursor-not-allowed'
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onOpenShortcuts}
          className={`p-2 rounded-xl border shadow-lg backdrop-blur-md transition-colors ${
            isDark ? 'bg-[#141414]/95 border-[#262626] text-neutral-400 hover:text-white hover:bg-[#202020]' : 'bg-white/95 border-neutral-200 text-neutral-600 hover:text-neutral-900'
          }`}
          title="Keyboard shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};
