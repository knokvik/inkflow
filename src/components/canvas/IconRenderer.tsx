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
  const bg = isDefaultBg
    ? isDark
      ? '#242424'
      : '#FFFFFF'
    : fillColor;

  const titleColor = isDark ? '#F1F5F9' : '#0F172A';
  const subColor = isDark ? '#94A3B8' : '#64748B';

  // Icon dimension proportional to node dimensions
  const iconSize = Math.max(26, Math.min(width - 18, height - 28));
  const iconSrc = iconDef.iconUrl || `/icons/${iconDef.id}.svg`;

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
      {/* Centered Scalable Vector Icon Image with soft colored backdrop */}
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

      {/* Clean Title Below the Icon */}
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
