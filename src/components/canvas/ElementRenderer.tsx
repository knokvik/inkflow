import React from 'react';
import { AnchorPosition, CanvasElement } from '../../types/canvas';
import { IconRenderer } from './IconRenderer';

interface ElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  isHovered: boolean;
  isConnectorToolActive?: boolean;
  theme?: 'light' | 'dark';
  onSelect: (e: React.MouseEvent) => void;
  onStartResize: (e: React.MouseEvent, handle: string) => void;
  onStartAnchorConnect: (e: React.MouseEvent, anchor: AnchorPosition) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
}

export const isBlueColor = (col?: string) => {
  if (!col) return false;
  const l = col.toLowerCase().trim();
  return (
    l.includes('blue') ||
    [
      '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#60a5fa', '#93c5fd', '#dbeafe',
      '#6366f1', '#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#8b5cf6', '#7c3aed',
      '#38bdf8', '#0ea5e9', '#0284c7', '#326ce5'
    ].includes(l)
  );
};

export const isLightColor = (hex?: string) => {
  if (!hex || hex === 'transparent') return false;
  const l = hex.toLowerCase().trim();
  if (['#fff', '#ffffff', '#f8fafc', '#f1f5f9', '#fef9c3', '#fdfdfe', '#fff7ed', '#f0fdf4', '#eff6ff', '#faf5ff'].includes(l)) return true;
  if (l.startsWith('#') && (l.length === 7 || l.length === 9)) {
    const r = parseInt(l.slice(1, 3), 16);
    const g = parseInt(l.slice(3, 5), 16);
    const b = parseInt(l.slice(5, 7), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return (0.299 * r + 0.587 * g + 0.114 * b) > 175;
    }
  }
  return false;
};

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  isHovered,
  isConnectorToolActive = false,
  theme = 'light',
  onSelect,
  onStartResize,
  onStartAnchorConnect,
  onDoubleClick,
}) => {
  const { id, type, x, y, width, height, style, text, subtitle, tierTag } = element;
  const isDark = theme === 'dark';

  const cleanStroke = isDark
    ? style.strokeColor && !isBlueColor(style.strokeColor)
      ? style.strokeColor
      : '#525252'
    : style.strokeColor && !isBlueColor(style.strokeColor)
      ? style.strokeColor
      : '#27272A';

  // Render shape graphics based on type
  const renderShapeBody = () => {
    switch (type) {
      case 'icon':
        return (
          <IconRenderer
            iconName={element.iconName}
            label={element.iconLabel || text}
            subtitle={subtitle}
            width={width}
            height={height}
            color={cleanStroke}
            fillColor={style.fillColor}
            isRough={style.roughness > 0}
            theme={theme}
            fontSize={style.fontSize}
          />
        );

      case 'sticky':
        const stickyColors: Record<string, { bg: string; border: string; text: string }> = {
          yellow: { bg: isDark ? '#3D3412' : '#FEF9C3', border: '#FACC15', text: isDark ? '#FEF08A' : '#713F12' },
          green: { bg: isDark ? '#143820' : '#DCFCE7', border: '#4ADE80', text: isDark ? '#BBF7D0' : '#14532D' },
          pink: { bg: isDark ? '#3D1528' : '#FCE7F3', border: '#F472B6', text: isDark ? '#FBCFE8' : '#831843' },
          purple: { bg: isDark ? '#2D1445' : '#F3E8FF', border: '#C084FC', text: isDark ? '#E9D5FF' : '#581C87' },
          blue: { bg: isDark ? '#262626' : '#F4F4F5', border: isDark ? '#525252' : '#A1A1AA', text: isDark ? '#E5E5E5' : '#27272A' },
          orange: { bg: isDark ? '#3D2012' : '#FFEDD5', border: '#FB923C', text: isDark ? '#FED7AA' : '#7C2D12' },
        };
        const col = stickyColors[element.stickyColor || 'yellow'];
        return (
          <div
            className="w-full h-full p-3 shadow-md rounded-md relative flex flex-col justify-between"
            style={{
              backgroundColor: col.bg,
              border: `1.5px solid ${col.border}`,
              color: col.text,
              fontFamily: style.fontFamily === 'hand' ? "'Caveat', cursive" : undefined,
              fontSize: `${style.fontSize || 15}px`,
            }}
          >
            <div className="whitespace-pre-wrap break-words leading-tight">
              {text || 'Double click to type note...'}
            </div>
            <div
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-black/10"
              style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
            />
          </div>
        );

      case 'frame':
        // Eraser Tier or Diagram Frame
        const isOuterDiagram =
          element.frameTitle?.includes('Architecture') ||
          element.frameTitle?.includes('Topology') ||
          (width >= 1000 && height >= 700);
        const frameStroke = isDark
          ? style.strokeColor && !isBlueColor(style.strokeColor)
            ? style.strokeColor
            : '#404040'
          : style.strokeColor && !isBlueColor(style.strokeColor)
            ? style.strokeColor
            : '#CBD5E1';

        const frameBg = isOuterDiagram
          ? isDark
            ? 'rgba(255, 255, 255, 0.015)'
            : '#FDFDFE'
          : isDark
          ? `${frameStroke}0f`
          : `${frameStroke}0d`;

        return (
          <div
            className="w-full h-full rounded-2xl relative pointer-events-none transition-colors"
            style={{
              border: `1.5px solid ${frameStroke}`,
              backgroundColor: frameBg,
            }}
          >
            {/* Eraser Tag Badge */}
            {element.frameTitle && (
              <div
                className="absolute top-2 left-3 px-2.5 py-0.5 rounded-md text-[11px] font-mono tracking-tight font-semibold flex items-center gap-1.5"
                style={{
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  color: isOuterDiagram
                    ? (isDark ? '#F1F5F9' : '#0F172A')
                    : (isDark
                      ? (style.strokeColor && !isBlueColor(style.strokeColor) ? style.strokeColor : '#E2E8F0')
                      : (style.strokeColor && !isBlueColor(style.strokeColor) ? style.strokeColor : '#0F172A')),
                  border: `1.2px solid ${frameStroke}`,
                  boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                {isOuterDiagram && <span className="opacity-60 text-xs">⸤L</span>}
                <span>{element.frameTitle}</span>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div
            className={`w-full h-full flex items-center justify-center p-2 break-words text-center ${
              isSelected ? 'border border-dashed border-neutral-400 dark:border-neutral-500 rounded-md' : ''
            }`}
            style={{
              color: isDark && isBlueColor(style.textColor) ? '#E5E5E5' : (style.textColor || (isDark ? '#F1F5F9' : '#0F172A')),
              fontSize: `${style.fontSize || 16}px`,
              fontFamily:
                style.fontFamily === 'mono'
                  ? "'JetBrains Mono', monospace"
                  : style.fontFamily === 'hand'
                  ? "'Caveat', cursive"
                  : 'inherit',
              textAlign: style.textAlign || 'center',
            }}
          >
            {text || (isSelected ? <span className="opacity-40 italic">Type here...</span> : '')}
          </div>
        );

      case 'circle':
        const isDefaultCircleBg =
          !style.fillColor ||
          style.fillColor === 'transparent' ||
          style.fillColor === '#161924' ||
          style.fillColor === '#1A1E2C' ||
          style.fillColor === '#FFFFFF' ||
          style.fillColor === '#0F1117' ||
          style.fillColor === '#10121C' ||
          isBlueColor(style.fillColor);
        const circleBg = isDefaultCircleBg ? (isDark ? '#242424' : '#FFFFFF') : style.fillColor;
        const circleTitleCol = isDark ? '#F1F5F9' : '#0F172A';
        const circleSubCol = isDark ? '#94A3B8' : '#64748B';

        return (
          <div
            className="w-full h-full rounded-full flex flex-col items-center justify-center p-3 text-center"
            style={{
              backgroundColor: circleBg,
              border: `1.5px solid ${cleanStroke}`,
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              className="font-semibold truncate max-w-[90%]"
              style={{
                color: circleTitleCol,
                fontSize: `${style.fontSize || 14}px`,
                fontFamily:
                  style.fontFamily === 'mono'
                    ? "'JetBrains Mono', monospace"
                    : style.fontFamily === 'hand'
                    ? "'Caveat', cursive"
                    : undefined,
                textAlign: style.textAlign || 'center',
              }}
            >
              {text}
            </div>
            {subtitle && (
              <div
                className="opacity-75 mt-0.5 truncate max-w-[85%]"
                style={{
                  color: circleSubCol,
                  fontSize: `${Math.max(8.5, Math.round((style.fontSize || 14) * 0.75))}px`,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        );

      case 'diamond':
        const diamondDefaultBg = isDark ? '#242424' : '#FFFFFF';
        const diamondFill =
          style.fillColor && style.fillColor !== 'transparent' && !isBlueColor(style.fillColor)
            ? style.fillColor
            : diamondDefaultBg;
        const diamondStroke = cleanStroke;
        const diamondTitleCol = isDark ? '#F1F5F9' : '#0F172A';

        return (
          <div className="w-full h-full relative flex items-center justify-center text-center p-3 select-none">
            <svg
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
            >
              <polygon
                points={`${width / 2},2 ${width - 2},${height / 2} ${width / 2},${height - 2} 2,${height / 2}`}
                fill={diamondFill}
                stroke={diamondStroke}
                strokeWidth={style.strokeWidth || 1.8}
                strokeDasharray={style.strokeStyle === 'dashed' ? '4,4' : undefined}
                className={isDark ? 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]' : 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.06)]'}
              />
            </svg>
            <div
              className="relative z-10 font-semibold max-w-[70%] pointer-events-none"
              style={{
                color: diamondTitleCol,
                fontSize: `${style.fontSize || 14}px`,
                fontFamily:
                  style.fontFamily === 'mono'
                    ? "'JetBrains Mono', monospace"
                    : style.fontFamily === 'hand'
                    ? "'Caveat', cursive"
                    : undefined,
                textAlign: style.textAlign || 'center',
              }}
            >
              {text || 'Decision'}
            </div>
          </div>
        );

      case 'cylinder':
        // Eraser Database Canister Box
        const cylBg =
          style.fillColor && style.fillColor !== 'transparent' && !isBlueColor(style.fillColor)
            ? style.fillColor
            : isDark
            ? '#242424'
            : '#FFFFFF';
        const cylTitleColor = isDark ? '#F1F5F9' : '#0F172A';
        const cylSubColor = isDark ? '#94A3B8' : '#64748B';
        return (
          <div
            className="w-full h-full rounded-lg relative flex flex-col justify-between p-2.5 overflow-hidden"
            style={{
              backgroundColor: cylBg,
              border: `1.5px solid ${cleanStroke}`,
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-2 opacity-25"
              style={{ backgroundColor: cleanStroke }}
            />
            <div className="flex items-center gap-1.5 mt-0.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none shrink-0" style={{ color: cleanStroke }}>
                <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="2" />
                <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="currentColor" strokeWidth="2" />
                <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" stroke="currentColor" strokeWidth="2" />
              </svg>
              <div
                className="font-semibold truncate"
                style={{
                  color: cylTitleColor,
                  fontSize: `${style.fontSize || 14}px`,
                  fontFamily:
                    style.fontFamily === 'mono'
                      ? "'JetBrains Mono', monospace"
                      : style.fontFamily === 'hand'
                      ? "'Caveat', cursive"
                      : undefined,
                }}
              >
                {text || 'Database'}
              </div>
            </div>
            {subtitle && (
              <div
                className="leading-tight mt-1 whitespace-pre-line"
                style={{
                  color: cylSubColor,
                  fontSize: `${Math.max(8.5, Math.round((style.fontSize || 14) * 0.75))}px`,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        );

      case 'rectangle':
      case 'rounded-rect':
        const isDefaultShapeBg =
          !style.fillColor ||
          style.fillColor === 'transparent' ||
          style.fillColor === '#161924' ||
          style.fillColor === '#1A1E2C' ||
          style.fillColor === '#FFFFFF' ||
          style.fillColor === '#0F1117' ||
          style.fillColor === '#10121C' ||
          isBlueColor(style.fillColor);
        const defaultCardBg = isDark
          ? (isDefaultShapeBg || isLightColor(style.fillColor) ? '#222224' : style.fillColor)
          : (isDefaultShapeBg ? '#FFFFFF' : style.fillColor);
        const defaultTitleCol = isDark ? '#F8FAFC' : '#0F172A';
        const defaultSubCol = isDark ? '#94A3B8' : '#475569';

        return (
          <div
            className="w-full h-full rounded-lg flex flex-col justify-between p-2.5"
            style={{
              backgroundColor: defaultCardBg,
              border: `1.5px solid ${cleanStroke}`,
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Tier tag if present */}
            {tierTag && (
              <div
                className="text-[9px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded w-fit mb-1"
                style={{
                  backgroundColor: `${cleanStroke}18`,
                  color: cleanStroke,
                }}
              >
                {tierTag}
              </div>
            )}

            <div
              className="font-semibold leading-snug"
              style={{
                color: defaultTitleCol,
                fontSize: `${style.fontSize || 14}px`,
                fontFamily:
                  style.fontFamily === 'mono'
                    ? "'JetBrains Mono', monospace"
                    : style.fontFamily === 'hand'
                    ? "'Caveat', cursive"
                    : undefined,
                textAlign: style.textAlign || 'left',
              }}
            >
              {text}
            </div>

            {subtitle && (
              <div
                className="line-clamp-3 leading-tight mt-1 whitespace-pre-line"
                style={{
                  color: defaultSubCol,
                  fontSize: `${Math.max(8.5, Math.round((style.fontSize || 14) * 0.75))}px`,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div
      id={`canvas-el-${id}`}
      className={`absolute group cursor-move select-none transition-shadow ${
        isSelected ? 'ring-2 ring-neutral-400 dark:ring-neutral-400 ring-offset-2 ring-offset-white dark:ring-offset-[#1E1E1E]' : ''
      }`}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: element.zIndex || 10,
      }}
      onMouseDown={onSelect}
      onDoubleClick={onDoubleClick}
    >
      {/* Shape Body */}
      {renderShapeBody()}

      {/* Magnetic Anchor Points: Only show when arrow tool is near this specific block, or when selected */}
      {((isHovered && isConnectorToolActive) || isSelected) && type !== 'frame' && (
        <>
          {/* Top Anchor */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 cursor-crosshair z-40 group/anchor"
            title="Connect Top"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartAnchorConnect(e, 'top');
            }}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-transform duration-200 group-hover/anchor:scale-125 shadow-xs ${
                isDark
                  ? 'bg-neutral-300 border-[#1E1E1E] ring-2 ring-white/15'
                  : 'bg-neutral-600 border-white ring-2 ring-black/10'
              } animate-subtle-pulse`}
            />
          </div>

          {/* Right Anchor */}
          <div
            className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 p-1 cursor-crosshair z-40 group/anchor"
            title="Connect Right"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartAnchorConnect(e, 'right');
            }}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-transform duration-200 group-hover/anchor:scale-125 shadow-xs ${
                isDark
                  ? 'bg-neutral-300 border-[#1E1E1E] ring-2 ring-white/15'
                  : 'bg-neutral-600 border-white ring-2 ring-black/10'
              } animate-subtle-pulse`}
            />
          </div>

          {/* Bottom Anchor */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 p-1 cursor-crosshair z-40 group/anchor"
            title="Connect Bottom"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartAnchorConnect(e, 'bottom');
            }}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-transform duration-200 group-hover/anchor:scale-125 shadow-xs ${
                isDark
                  ? 'bg-neutral-300 border-[#1E1E1E] ring-2 ring-white/15'
                  : 'bg-neutral-600 border-white ring-2 ring-black/10'
              } animate-subtle-pulse`}
            />
          </div>

          {/* Left Anchor */}
          <div
            className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 p-1 cursor-crosshair z-40 group/anchor"
            title="Connect Left"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartAnchorConnect(e, 'left');
            }}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-transform duration-200 group-hover/anchor:scale-125 shadow-xs ${
                isDark
                  ? 'bg-neutral-300 border-[#1E1E1E] ring-2 ring-white/15'
                  : 'bg-neutral-600 border-white ring-2 ring-black/10'
              } animate-subtle-pulse`}
            />
          </div>

          {/* Center Anchor */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 cursor-crosshair z-40 group/anchor"
            title="Connect Center"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartAnchorConnect(e, 'center');
            }}
          >
            <div
              className={`w-2 h-2 rounded-full border transition-transform duration-200 group-hover/anchor:scale-125 opacity-70 hover:opacity-100 ${
                isDark
                  ? 'bg-neutral-400 border-[#1E1E1E] ring-1 ring-white/15'
                  : 'bg-neutral-500 border-white ring-1 ring-black/10'
              }`}
            />
          </div>
        </>
      )}

      {/* Resize Handles (8 points) when Selected */}
      {isSelected && (
        <>
          <div
            className={`absolute -top-1.5 -left-1.5 w-2.5 h-2.5 rounded-xs cursor-nwse-resize z-50 shadow-xs border ${
              isDark ? 'bg-[#2A2A2A] border-neutral-400' : 'bg-white border-neutral-600'
            }`}
            onMouseDown={(e) => onStartResize(e, 'nw')}
          />
          <div
            className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-xs cursor-ns-resize z-50 shadow-xs border ${
              isDark ? 'bg-[#2A2A2A] border-neutral-400' : 'bg-white border-neutral-600'
            }`}
            onMouseDown={(e) => onStartResize(e, 'n')}
          />
          <div
            className={`absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-xs cursor-nesw-resize z-50 shadow-xs border ${
              isDark ? 'bg-[#2A2A2A] border-neutral-400' : 'bg-white border-neutral-600'
            }`}
            onMouseDown={(e) => onStartResize(e, 'ne')}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 rounded-xs cursor-ew-resize z-50 shadow-xs border ${
              isDark ? 'bg-[#2A2A2A] border-neutral-400' : 'bg-white border-neutral-600'
            }`}
            onMouseDown={(e) => onStartResize(e, 'e')}
          />
          <div
            className={`absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 rounded-xs cursor-nwse-resize z-50 shadow-xs border ${
              isDark ? 'bg-[#2A2A2A] border-neutral-400' : 'bg-white border-neutral-600'
            }`}
            onMouseDown={(e) => onStartResize(e, 'se')}
          />
          <div
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-xs cursor-ns-resize z-50 shadow-xs border ${
              isDark ? 'bg-[#2A2A2A] border-neutral-400' : 'bg-white border-neutral-600'
            }`}
            onMouseDown={(e) => onStartResize(e, 's')}
          />
          <div
            className={`absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 rounded-xs cursor-nesw-resize z-50 shadow-xs border ${
              isDark ? 'bg-[#2A2A2A] border-neutral-400' : 'bg-white border-neutral-600'
            }`}
            onMouseDown={(e) => onStartResize(e, 'sw')}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 rounded-xs cursor-ew-resize z-50 shadow-xs border ${
              isDark ? 'bg-[#2A2A2A] border-neutral-400' : 'bg-white border-neutral-600'
            }`}
            onMouseDown={(e) => onStartResize(e, 'w')}
          />
        </>
      )}
    </div>
  );
};
