import React from 'react';
import { CanvasElement, Point } from '../../types/canvas';
import { getConnectorPath, getElementAnchor, getMidPoint } from '../../utils/geometry';

interface ConnectorRendererProps {
  connector: CanvasElement;
  allElements: CanvasElement[];
  isSelected: boolean;
  theme?: 'dark' | 'light';
  onSelect: (e: React.MouseEvent) => void;
  onLabelDoubleClick: (e: React.MouseEvent) => void;
  onStartBendDrag?: (e: React.MouseEvent, connector: CanvasElement) => void;
}

export const ConnectorRenderer: React.FC<ConnectorRendererProps> = ({
  connector,
  allElements,
  isSelected,
  theme = 'dark',
  onSelect,
  onLabelDoubleClick,
  onStartBendDrag,
}) => {
  const { id, fromId, fromAnchor, toId, toAnchor, routing, style, connectorLabel } = connector;

  // Resolve start and end coordinates
  let start: Point = connector.startPoint || { x: 0, y: 0 };
  let end: Point = connector.endPoint || { x: 100, y: 100 };

  if (fromId) {
    const fromEl = allElements.find(e => e.id === fromId);
    if (fromEl) {
      start = getElementAnchor(fromEl, fromAnchor || 'right');
    }
  }

  if (toId) {
    const toEl = allElements.find(e => e.id === toId);
    if (toEl) {
      end = getElementAnchor(toEl, toAnchor || 'left');
    }
  }

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

  const obstacles = allElements.filter(
    (e) => e.id !== fromId && e.id !== toId && e.id !== id && e.type !== 'connector' && e.type !== 'frame'
  );

  const pathD = getConnectorPath(
    start,
    end,
    routing || 'orthogonal',
    fromAnchor,
    toAnchor,
    connector.bendPoint,
    obstacles
  );
  const midPoint = getMidPoint(start, end);
  const bendPoint = connector.bendPoint || midPoint;
  const strokeColor =
    theme === 'dark'
      ? style.strokeColor && !isBlue(style.strokeColor)
        ? style.strokeColor
        : '#D4D4D8'
      : style.strokeColor && !isBlue(style.strokeColor)
        ? style.strokeColor
        : '#4B5563';
  const markerId = `arrowhead-${id}`;

  return (
    <g className="cursor-pointer group" onClick={onSelect}>
      {/* Marker Definition for Arrowhead */}
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill={strokeColor} />
        </marker>
      </defs>

      {/* Invisible wider hit area for easy clicking */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        className="pointer-events-auto"
      />

      {/* Visible line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={style.strokeWidth || 2}
        strokeDasharray={style.strokeStyle === 'dashed' ? '6,4' : undefined}
        markerEnd={connector.arrowEnd !== false ? `url(#${markerId})` : undefined}
        className={`transition-all ${isSelected ? (theme === 'dark' ? 'stroke-neutral-300 stroke-[2.5px]' : 'stroke-neutral-600 stroke-[2.5px]') : ''}`}
      />

      {/* Interactive Bend Point / Waypoint Handle when Arrow is Selected */}
      {isSelected && onStartBendDrag && (
        <g>
          <circle
            cx={bendPoint.x}
            cy={bendPoint.y}
            r={5}
            fill={theme === 'dark' ? '#D4D4D8' : '#52525B'}
            stroke={theme === 'dark' ? '#1E1E1E' : '#FFFFFF'}
            strokeWidth={2}
            className="cursor-move hover:scale-125 transition-transform pointer-events-auto filter drop-shadow-sm"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartBendDrag(e, connector);
            }}
          />
        </g>
      )}

      {/* Label */}
      {connectorLabel && (
        <g
          transform={`translate(${midPoint.x}, ${midPoint.y})`}
          onDoubleClick={onLabelDoubleClick}
          className="cursor-pointer"
        >
          {/* Label Background Pill */}
          <rect
            x={-((connectorLabel.length * 7 + 16) / 2)}
            y={-12}
            width={connectorLabel.length * 7 + 16}
            height={22}
            rx={4}
            fill={theme === 'light' ? '#FFFFFF' : '#1E1E1E'}
            stroke={strokeColor}
            strokeWidth={1}
            className="filter drop-shadow-sm"
          />
          {/* Text */}
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fill={style.textColor || (theme === 'light' ? '#374151' : '#EDEDED')}
            fontSize={style.fontSize || 11}
            fontFamily="monospace"
            className="select-none pointer-events-none"
          >
            {connectorLabel}
          </text>
        </g>
      )}
    </g>
  );
};
