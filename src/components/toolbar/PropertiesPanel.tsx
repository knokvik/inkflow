import React, { useState } from 'react';
import { CanvasElement } from '../../types/canvas';
import {
  Trash2,
  Copy,
  Lock,
  Unlock,
  BringToFront,
  SendToBack,
  CornerDownRight,
  Maximize,
  Split,
  Link,
  Unlink,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Minus,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Boxes,
  Circle as CircleIcon,
  Square as SquareIcon,
  Diamond as DiamondIcon,
  Database as DatabaseIcon,
  Type as TypeIcon,
  StickyNote as StickyIcon,
} from 'lucide-react';
import { findNearbyAnchor } from '../../utils/geometry';

interface PropertiesPanelProps {
  selectedElements: CanvasElement[];
  allElements?: CanvasElement[];
  onUpdateStyle: (updates: Partial<CanvasElement['style']>) => void;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onToggleLock: () => void;
  onOpenIconPicker?: () => void;
  theme?: 'light' | 'dark';
}

const COLOR_PALETTE = [
  { name: 'Monochrome Dark', value: '#18181B' },
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Slate Gray', value: '#71717A' },
  { name: 'Charcoal', value: '#3F3F46' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElements,
  allElements = [],
  onUpdateStyle,
  onUpdateElement,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onOpenIconPicker,
  theme = 'light',
}) => {
  if (selectedElements.length === 0) return null;

  const firstEl = selectedElements[0];
  const type = firstEl.type;
  const isConnector = type === 'connector';
  const isRect = type === 'rectangle' || type === 'rounded-rect';
  const isCircle = type === 'circle';
  const isDiamond = type === 'diamond';
  const isCylinder = type === 'cylinder';
  const isText = type === 'text';
  const isSticky = type === 'sticky';
  const isIcon = type === 'icon';
  const isLocked = firstEl.isLocked || false;
  const isDark = theme === 'dark';
  const hasText = !isConnector;

  const isJoined = Boolean(firstEl.fromId || firstEl.toId);

  // Handle joining a free-floating arrow to nearest blocks
  const handleJoinToNearest = () => {
    if (!firstEl.startPoint || !firstEl.endPoint) return;
    const startAnchor = findNearbyAnchor(allElements, firstEl.startPoint, 80);
    const endAnchor = findNearbyAnchor(allElements, firstEl.endPoint, 80, startAnchor?.elementId);

    onUpdateElement({
      fromId: startAnchor?.elementId || null,
      fromAnchor: startAnchor?.anchor || undefined,
      startPoint: startAnchor?.point || firstEl.startPoint,
      toId: endAnchor?.elementId || null,
      toAnchor: endAnchor?.anchor || undefined,
      endPoint: endAnchor?.point || firstEl.endPoint,
      routing: startAnchor || endAnchor ? 'orthogonal' : firstEl.routing,
    });
  };

  const handleDetachFromBlocks = () => {
    onUpdateElement({
      fromId: null,
      fromAnchor: undefined,
      toId: null,
      toAnchor: undefined,
    });
  };

  const activeBtnClass = (active?: boolean | null) =>
    Boolean(active)
      ? isDark
        ? 'bg-[#383838] text-white font-medium ring-1 ring-white/10 shadow-xs'
        : 'bg-neutral-600 text-white font-medium shadow-xs'
      : isDark
      ? 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100';

  const dividerClass = isDark ? 'bg-[#2E2E2E]' : 'bg-neutral-200';

  return (
    <div
      className={`absolute bottom-5 left-[155px] max-w-[calc(100vw-180px)] overflow-x-auto scrollbar-none flex items-center gap-2 px-3 py-1.5 backdrop-blur-md rounded-xl shadow-xl z-30 select-none animate-in fade-in duration-150 transition-colors border ${
        isDark
          ? 'bg-[#141414]/95 border-[#262626] text-neutral-200 ring-1 ring-white/5'
          : 'bg-white/95 border-neutral-200 text-neutral-800 ring-1 ring-black/5'
      }`}
    >
      {/* SHAPE TYPE BADGE */}
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold font-mono border ${
        isDark ? 'border-[#333333] text-neutral-400 bg-[#252525]' : 'border-neutral-200 text-neutral-600 bg-neutral-50'
      }`}>
        {isRect && <SquareIcon className="w-3.5 h-3.5" />}
        {isCircle && <CircleIcon className="w-3.5 h-3.5" />}
        {isDiamond && <DiamondIcon className="w-3.5 h-3.5" />}
        {isCylinder && <DatabaseIcon className="w-3.5 h-3.5" />}
        {isConnector && <ArrowRight className="w-3.5 h-3.5" />}
        {isText && <TypeIcon className="w-3.5 h-3.5" />}
        {isSticky && <StickyIcon className="w-3.5 h-3.5" />}
        {isIcon && <Boxes className="w-3.5 h-3.5" />}
        <span className="capitalize text-[11px]">
          {type === 'rounded-rect' ? 'Rectangle' : type}
        </span>
      </div>

      <div className={`h-4 w-px ${dividerClass}`} />

      {/* ======================= CONNECTOR / ARROW SPECIFIC CONTROLS ======================= */}
      {isConnector && (
        <>
          {/* JOIN OR FREE-FLOATING ARROW TOGGLE */}
          <div className="flex items-center gap-1.5">
            {isJoined ? (
              <button
                onClick={handleDetachFromBlocks}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                    : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
                title="Click to unbind from blocks and make arrow free-floating"
              >
                <Link className="w-3.5 h-3.5" />
                <span>Joined</span>
                <span className="text-[10px] opacity-75 font-normal">(Detach)</span>
              </button>
            ) : (
              <button
                onClick={handleJoinToNearest}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-white/5 text-neutral-300 border-[#383838] hover:bg-white/10'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                }`}
                title="Click to snap and join start/end of arrow to nearest blocks"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Freeform</span>
                <span className="text-[10px] opacity-75 font-normal">(Join)</span>
              </button>
            )}
          </div>

          <div className={`h-4 w-px ${dividerClass}`} />

          {/* ARROWHEAD CHOICES: End, Start, Both, None */}
          <div className={`flex items-center gap-0.5 border rounded-lg p-0.5 ${isDark ? 'border-[#333333]' : 'border-neutral-200'}`}>
            <button
              onClick={() => onUpdateElement({ arrowStart: false, arrowEnd: true })}
              className={`p-1 rounded text-xs transition-colors ${activeBtnClass(!firstEl.arrowStart && firstEl.arrowEnd !== false)}`}
              title="Arrow End (->)"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement({ arrowStart: true, arrowEnd: false })}
              className={`p-1 rounded text-xs transition-colors ${activeBtnClass(firstEl.arrowStart && !firstEl.arrowEnd)}`}
              title="Arrow Start (<-)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement({ arrowStart: true, arrowEnd: true })}
              className={`p-1 rounded text-xs transition-colors ${activeBtnClass(firstEl.arrowStart && firstEl.arrowEnd)}`}
              title="Double Arrow (<->)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement({ arrowStart: false, arrowEnd: false })}
              className={`p-1 rounded text-xs transition-colors ${activeBtnClass(!firstEl.arrowStart && firstEl.arrowEnd === false)}`}
              title="Straight Line (No arrowheads)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`h-4 w-px ${dividerClass}`} />

          {/* ROUTING CHOICES: Orthogonal, Curved, Straight */}
          <div className={`flex items-center gap-0.5 border rounded-lg p-0.5 ${isDark ? 'border-[#333333]' : 'border-neutral-200'}`}>
            <button
              onClick={() => onUpdateElement({ routing: 'orthogonal' })}
              className={`p-1 rounded text-xs transition-colors ${activeBtnClass(firstEl.routing === 'orthogonal' || !firstEl.routing)}`}
              title="Step / Orthogonal (90° elbow)"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement({ routing: 'curved' })}
              className={`p-1 rounded text-xs transition-colors ${activeBtnClass(firstEl.routing === 'curved')}`}
              title="Curved Bezier"
            >
              <Split className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateElement({ routing: 'straight' })}
              className={`p-1 rounded text-xs transition-colors ${activeBtnClass(firstEl.routing === 'straight')}`}
              title="Straight Euclidean"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* ======================= RECTANGLE SPECIFIC CONTROLS ======================= */}
      {isRect && (
        <>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateElement({ type: 'rounded-rect' })}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${activeBtnClass(firstEl.type === 'rounded-rect')}`}
              title="Smooth rounded corners"
            >
              Rounded
            </button>
            <button
              onClick={() => onUpdateElement({ type: 'rectangle' })}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${activeBtnClass(firstEl.type === 'rectangle')}`}
              title="Sharp box corners"
            >
              Sharp
            </button>
          </div>
        </>
      )}

      {/* ======================= TYPOGRAPHY & FONT SIZE CONTROLS ======================= */}
      {hasText && (
        <>
          <div className="flex items-center gap-1">
            {/* Decrement font size */}
            <button
              onClick={() =>
                onUpdateStyle({ fontSize: Math.max(8, (firstEl.style.fontSize || (isText ? 16 : 14)) - 2) })
              }
              className={`w-5 h-5 flex items-center justify-center rounded border text-xs font-bold transition-colors ${
                isDark
                  ? 'border-[#333333] hover:bg-[#2A2A2A] text-neutral-300'
                  : 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
              }`}
              title="Decrease text size (-2px)"
            >
              -
            </button>

            {/* Direct Number Input */}
            <div
              className={`flex items-center rounded border px-1.5 py-0.5 ${
                isDark ? 'border-[#333333] bg-[#242424]' : 'border-neutral-300 bg-neutral-50'
              }`}
            >
              <TypeIcon className="w-3 h-3 opacity-50 mr-1 shrink-0" />
              <input
                type="number"
                min={8}
                max={72}
                value={firstEl.style.fontSize || (isText ? 16 : 14)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    onUpdateStyle({ fontSize: Math.max(8, Math.min(72, val)) });
                  }
                }}
                className={`w-7 text-center text-xs font-mono font-bold bg-transparent outline-none ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}
                title="Font size in pixels"
              />
              <span className="text-[10px] opacity-40 font-mono">px</span>
            </div>

            {/* Increment font size */}
            <button
              onClick={() =>
                onUpdateStyle({ fontSize: Math.min(72, (firstEl.style.fontSize || (isText ? 16 : 14)) + 2) })
              }
              className={`w-5 h-5 flex items-center justify-center rounded border text-xs font-bold transition-colors ${
                isDark
                  ? 'border-[#333333] hover:bg-[#2A2A2A] text-neutral-300'
                  : 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
              }`}
              title="Increase text size (+2px)"
            >
              +
            </button>

            {/* Quick Presets */}
            <div className="flex items-center gap-0.5 ml-0.5 text-xs font-mono">
              {[12, 14, 18, 24, 32].map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdateStyle({ fontSize: size })}
                  className={`px-1.5 py-0.5 rounded transition-colors ${activeBtnClass(
                    (firstEl.style.fontSize || (isText ? 16 : 14)) === size
                  )}`}
                  title={`${size}px`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className={`h-4 w-px ${dividerClass}`} />

          {/* Text Alignment */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onUpdateStyle({ textAlign: 'left' })}
              className={`p-1 rounded transition-colors ${activeBtnClass(firstEl.style.textAlign === 'left')}`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateStyle({ textAlign: 'center' })}
              className={`p-1 rounded transition-colors ${activeBtnClass(
                !firstEl.style.textAlign || firstEl.style.textAlign === 'center'
              )}`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateStyle({ textAlign: 'right' })}
              className={`p-1 rounded transition-colors ${activeBtnClass(firstEl.style.textAlign === 'right')}`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* ======================= ICON SPECIFIC CONTROLS ======================= */}
      {isIcon && (
        <>
          {onOpenIconPicker && (
            <button
              onClick={onOpenIconPicker}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                isDark ? 'bg-[#383838] text-white hover:bg-[#444444] ring-1 ring-white/10' : 'bg-neutral-600 text-white hover:bg-neutral-700'
              }`}
            >
              Change Icon
            </button>
          )}
        </>
      )}

      {/* ======================= STICKY NOTE SPECIFIC CONTROLS ======================= */}
      {isSticky && (
        <div className="flex items-center gap-1 px-1">
          {(['yellow', 'green', 'pink', 'purple', 'blue', 'orange'] as const).map((sc) => {
            const colors: Record<string, string> = {
              yellow: '#FACC15',
              green: '#4ADE80',
              pink: '#F472B6',
              purple: '#C084FC',
              blue: '#60A5FA',
              orange: '#FB923C',
            };
            return (
              <button
                key={sc}
                onClick={() => onUpdateElement({ stickyColor: sc })}
                className={`w-5 h-5 rounded-md border transition-transform hover:scale-125 ${
                  firstEl.stickyColor === sc ? 'ring-2 ring-white scale-110 shadow' : ''
                }`}
                style={{ backgroundColor: colors[sc] }}
                title={sc}
              />
            );
          })}
        </div>
      )}

      {/* ======================= COMMON STYLING CONTROLS ======================= */}
      {/* Color Swatches */}
      {!isSticky && (
        <>
          <div className={`h-4 w-px ${dividerClass}`} />
          <div className="flex items-center gap-1 px-1">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.value}
                onClick={() => onUpdateStyle({ strokeColor: c.value })}
                className={`w-5 h-5 rounded-full transition-transform hover:scale-125 border ${
                  isDark ? 'border-white/10' : 'border-black/10'
                } ${
                  firstEl.style.strokeColor === c.value ? 'ring-2 ring-neutral-400 dark:ring-white scale-110 shadow' : ''
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </>
      )}

      {/* Line Style: Solid vs Dashed */}
      {!isSticky && !isText && (
        <>
          <div className={`h-4 w-px ${dividerClass}`} />
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateStyle({ strokeStyle: 'solid' })}
              className={`px-2 py-0.5 text-xs rounded-md transition-colors ${activeBtnClass(
                firstEl.style.strokeStyle === 'solid' || !firstEl.style.strokeStyle
              )}`}
            >
              Solid
            </button>
            <button
              onClick={() => onUpdateStyle({ strokeStyle: 'dashed' })}
              className={`px-2 py-0.5 text-xs rounded-md transition-colors ${activeBtnClass(
                firstEl.style.strokeStyle === 'dashed'
              )}`}
            >
              Dashed
            </button>
          </div>
        </>
      )}

      {/* Font Family selector if element has text */}
      {!isConnector && !isIcon && (
        <>
          <div className={`h-4 w-px ${dividerClass}`} />
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => onUpdateStyle({ fontFamily: 'sans' })}
              className={`px-1.5 py-0.5 rounded font-sans transition-colors ${activeBtnClass(
                firstEl.style.fontFamily === 'sans' || !firstEl.style.fontFamily
              )}`}
            >
              Sans
            </button>
            <button
              onClick={() => onUpdateStyle({ fontFamily: 'mono' })}
              className={`px-1.5 py-0.5 rounded font-mono transition-colors ${activeBtnClass(
                firstEl.style.fontFamily === 'mono'
              )}`}
            >
              Mono
            </button>
            <button
              onClick={() => onUpdateStyle({ fontFamily: 'hand' })}
              className={`px-1.5 py-0.5 rounded font-hand text-sm transition-colors ${activeBtnClass(
                firstEl.style.fontFamily === 'hand'
              )}`}
            >
              Hand
            </button>
          </div>
        </>
      )}

      <div className={`h-4 w-px ${dividerClass}`} />

      {/* Layer Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBringToFront}
          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-500/10 rounded-lg transition-colors"
          title="Bring to Front"
        >
          <BringToFront className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onSendToBack}
          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-500/10 rounded-lg transition-colors"
          title="Send to Back"
        >
          <SendToBack className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className={`h-4 w-px ${dividerClass}`} />

      {/* Actions: Duplicate, Lock, Delete */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDuplicate}
          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-500/10 rounded-lg transition-colors"
          title="Duplicate (Ctrl+D)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleLock}
          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-500/10 rounded-lg transition-colors"
          title={isLocked ? 'Unlock' : 'Lock'}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg transition-colors"
          title="Delete (Backspace)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
