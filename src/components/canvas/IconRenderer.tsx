import React, { useState } from 'react';
import { getIconDefinition } from '../../constants/icons';

interface IconRendererProps {
  iconName?: string;
  label?: string;
  subtitle?: string;
  width: number;
  height: number;
  color?: string;
  fillColor?: string;
  isRough?: boolean;
  theme?: 'light' | 'dark';
  fontSize?: number;
  isEditing?: boolean;
  editingText?: string;
  onEditingTextChange?: (text: string) => void;
  onSaveTextEdit?: () => void;
  onCancelTextEdit?: () => void;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  iconName,
  label,
  subtitle,
  width,
  height,
  color,
  fillColor,
  theme = 'light',
  fontSize,
  isEditing = false,
  editingText,
  onEditingTextChange,
  onSaveTextEdit,
  onCancelTextEdit,
}) => {
  const [imgError, setImgError] = useState(false);
  const isDark = theme === 'dark';
  const isBlue = (col?: string) => {
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
  const isLightColor = (hex?: string) => {
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
  const iconDef = getIconDefinition(iconName);
  const strokeColor = color && color !== '#525252' && color !== '#27272A'
    ? color
    : iconDef.color || (isDark ? '#525252' : '#27272A');

  const isDefaultBg =
    !fillColor ||
    fillColor === 'transparent' ||
    fillColor === '#161924' ||
    fillColor === '#1A1E2C' ||
    fillColor === '#FFFFFF' ||
    fillColor === '#0F1117' ||
    fillColor === '#10121C' ||
    isBlue(fillColor);

  // Subtle clean card or user-chosen background
  const bg = isDark
    ? (isDefaultBg || isLightColor(fillColor) ? '#222224' : fillColor)
    : (isDefaultBg ? '#FFFFFF' : fillColor);

  const titleColor = isDark ? '#F8FAFC' : '#0F172A';
  const subColor = isDark ? '#94A3B8' : '#475569';

  const isWideCard = width >= 160 && height <= 110;
  const iconSize = isWideCard
    ? Math.max(28, Math.min(38, height - 24))
    : Math.max(26, Math.min(width - 18, height - 28));
  const iconSrc = iconDef.iconUrl || `/icons/${iconDef.id}.svg`;

  const iconGraphic = (
    <div
      className="flex items-center justify-center shrink-0 transition-transform p-1 rounded-xl shadow-2xs"
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        backgroundColor: isDark ? `${iconDef.color}1c` : (iconDef.bgColor || `${iconDef.color}15`),
        border: `1px solid ${iconDef.color}30`,
      }}
    >
      {!imgError ? (
        <img
          src={iconSrc}
          alt={label || iconDef.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-xs"
          draggable={false}
        />
      ) : iconDef.svgPath ? (
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full overflow-visible drop-shadow-sm"
          style={{ color: strokeColor }}
          dangerouslySetInnerHTML={{ __html: iconDef.svgPath }}
        />
      ) : (
        <div
          className="w-full h-full rounded flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: iconDef.bgColor, color: strokeColor }}
        >
          {iconDef.name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );

  if (isWideCard) {
    return (
      <div
        className="w-full h-full flex flex-row items-center gap-2.5 px-3 py-2 rounded-xl select-none transition-shadow overflow-hidden"
        style={{
          backgroundColor: bg,
          border: `1.5px solid ${strokeColor}`,
          boxShadow: isDark
            ? '0 4px 12px rgba(0, 0, 0, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        {iconGraphic}

        <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
          {isEditing ? (
            <input
              type="text"
              value={editingText ?? ''}
              onChange={(e) => onEditingTextChange?.(e.target.value)}
              onBlur={onSaveTextEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSaveTextEdit?.();
                } else if (e.key === 'Escape') {
                  onCancelTextEdit?.();
                }
              }}
              autoFocus
              className="bg-transparent border-b border-dashed border-blue-400 outline-none font-semibold text-[11.5px] leading-snug tracking-tight p-0 m-0 w-full"
              style={{
                color: titleColor,
                fontSize: `${fontSize || 12}px`,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="font-semibold truncate text-[11.5px] leading-snug tracking-tight"
              style={{
                color: titleColor,
                fontSize: `${fontSize || 12}px`,
              }}
              title={label || iconDef.name}
            >
              {label || iconDef.name}
            </div>
          )}

          {subtitle && (
            <div
              className="line-clamp-2 text-[10px] leading-tight opacity-85 mt-0.5 whitespace-pre-line"
              style={{
                color: subColor,
                fontSize: `${Math.max(9, Math.round((fontSize || 12) * 0.78))}px`,
              }}
              title={subtitle}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-2 rounded-xl select-none transition-shadow"
      style={{
        backgroundColor: bg,
        border: `1.5px solid ${strokeColor}`,
        boxShadow: isDark
          ? '0 4px 12px rgba(0, 0, 0, 0.35)'
          : '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      {iconGraphic}

      {/* Clean Title Below the Icon */}
      {isEditing ? (
        <input
          type="text"
          value={editingText ?? ''}
          onChange={(e) => onEditingTextChange?.(e.target.value)}
          onBlur={onSaveTextEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSaveTextEdit?.();
            } else if (e.key === 'Escape') {
              onCancelTextEdit?.();
            }
          }}
          autoFocus
          className="bg-transparent border-b border-dashed border-blue-400 outline-none font-semibold text-center max-w-full mt-1.5 leading-tight px-1 tracking-tight p-0 m-0 w-full"
          style={{
            color: titleColor,
            fontSize: `${fontSize || 12}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="font-semibold text-center truncate max-w-full mt-1.5 leading-tight px-1 tracking-tight"
          style={{
            color: titleColor,
            fontSize: `${fontSize || 12}px`,
          }}
          title={label || iconDef.name}
        >
          {label || iconDef.name}
        </div>
      )}

      {subtitle && (
        <div
          className="text-center truncate max-w-full opacity-80 mt-0.5"
          style={{
            color: subColor,
            fontSize: `${Math.max(8.5, Math.round((fontSize || 12) * 0.75))}px`,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
