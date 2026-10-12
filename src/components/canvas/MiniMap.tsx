import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CanvasElement, Point } from '../../types/canvas';
import { getBoundingBox, getConnectorPath, getElementAnchor } from '../../utils/geometry';
import { getIconDefinition } from '../../constants/icons';
import { Navigation, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';

interface MiniMapProps {
  elements: CanvasElement[];
  pan: Point;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  onPanChange: (newPan: Point) => void;
  theme?: 'light' | 'dark';
}

const STICKY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: '#FEF08A', border: '#FACC15', text: '#713F12' },
  green: { bg: '#BBF7D0', border: '#4ADE80', text: '#14532D' },
  pink: { bg: '#FBCFE8', border: '#F472B6', text: '#831843' },
  purple: { bg: '#E9D5FF', border: '#C084FC', text: '#581C87' },
  blue: { bg: '#BFDBFE', border: '#60A5FA', text: '#1E3A8A' },
  orange: { bg: '#FED7AA', border: '#FB923C', text: '#7C2D12' },
};

export const MiniMap: React.FC<MiniMapProps> = ({
  elements,
  pan,
  zoom,
  canvasWidth,
  canvasHeight,
  onPanChange,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const mapWidth = 220;
  const mapHeight = 145;
  const svgRef = useRef<SVGSVGElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [grabOffset, setGrabOffset] = useState<Point>({ x: 0, y: 0 });

  // Compute world bounds covering all elements plus the visible viewport
  const bbox = getBoundingBox(elements);
  const padding = 250;

  // Viewport in world coordinates
  const viewportWorldX = -pan.x / zoom;
  const viewportWorldY = -pan.y / zoom;
  const viewportWorldW = Math.max(canvasWidth, 300) / zoom;
  const viewportWorldH = Math.max(canvasHeight, 200) / zoom;

  const minX = Math.min(bbox.minX - padding, viewportWorldX - padding);
  const minY = Math.min(bbox.minY - padding, viewportWorldY - padding);
  const maxX = Math.max(bbox.maxX + padding, viewportWorldX + viewportWorldW + padding);
  const maxY = Math.max(bbox.maxY + padding, viewportWorldY + viewportWorldH + padding);

  const worldWidth = Math.max(maxX - minX, 1600);
  const worldHeight = Math.max(maxY - minY, 1100);

  const scale = Math.min(mapWidth / worldWidth, mapHeight / worldHeight);

  // Viewport rect inside minimap
  const viewX = (viewportWorldX - minX) * scale;
  const viewY = (viewportWorldY - minY) * scale;
  const viewW = Math.max(viewportWorldW * scale, 14);
  const viewH = Math.max(viewportWorldH * scale, 12);

  // Mouse Down handler: distinguishes between dragging the viewport box vs clicking canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const insideViewport =
      clickX >= viewX &&
      clickX <= viewX + viewW &&
      clickY >= viewY &&
      clickY <= viewY + viewH;

    if (insideViewport) {
      // Grabbed inside the viewport box: remember offset so dragging doesn't jump!
      setIsDragging(true);
      setGrabOffset({
        x: clickX - viewX,
        y: clickY - viewY,
      });
    } else {
      // Clicked on minimap background: center viewport onto clicked point immediately!
      setIsDragging(true);
      setGrabOffset({
        x: viewW / 2,
        y: viewH / 2,
      });

      const worldTargetX = clickX / scale + minX;
      const worldTargetY = clickY / scale + minY;
      const newPanX = -(worldTargetX - viewportWorldW / 2) * zoom;
      const newPanY = -(worldTargetY - viewportWorldH / 2) * zoom;
      onPanChange({ x: newPanX, y: newPanY });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Position the top-left of the viewport box
      const targetViewX = clickX - grabOffset.x;
      const targetViewY = clickY - grabOffset.y;

      const worldTargetX = targetViewX / scale + minX;
      const worldTargetY = targetViewY / scale + minY;

      const newPanX = -worldTargetX * zoom;
      const newPanY = -worldTargetY * zoom;

      onPanChange({ x: newPanX, y: newPanY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, grabOffset, scale, minX, minY, zoom, onPanChange]);

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPanChange({ x: 50, y: 50 });
  };

  return (
    <div
      className={`absolute bottom-5 right-5 backdrop-blur-md border rounded-2xl overflow-hidden z-30 select-none shadow-2xl transition-all duration-200 ${
        isDark ? 'bg-[#121520]/95 border-[#282D3D]' : 'bg-white/95 border-slate-200 shadow-slate-300/60'
      }`}
      style={{ width: `${mapWidth}px` }}
    >
      {/* Top Header Bar */}
      <div
        className={`flex items-center justify-between px-2.5 py-1.5 border-b text-[10.5px] font-mono select-none ${
          isDark ? 'border-[#24293A] text-slate-400 bg-[#161926]' : 'border-slate-100 text-slate-500 bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-1.5 font-semibold">
          <Navigation className="w-3 h-3 text-blue-500" />
          <span>MAP</span>
          <span className="opacity-60">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRecenter}
            className={`p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors`}
            title="Recenter Canvas"
          >
            <Maximize2 className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors`}
            title={isCollapsed ? 'Expand MiniMap' : 'Collapse MiniMap'}
          >
            {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      {!isCollapsed && (
        <div className="relative w-full" style={{ height: `${mapHeight}px` }}>
          <svg
            ref={svgRef}
            className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            onMouseDown={handleMouseDown}
          >
            <defs>
              {/* Subtle background grid pattern */}
              <pattern id="minimap-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle
                  cx="6"
                  cy="6"
                  r="0.75"
                  fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
                />
              </pattern>
              {/* Arrowhead marker for connectors */}
              <marker
                id="mini-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={isDark ? '#E5E5E5' : '#18181B'} />
              </marker>
            </defs>

            {/* Grid background */}
            <rect width={mapWidth} height={mapHeight} fill="url(#minimap-grid)" />

            {/* Render Frames / Groups first */}
            {elements
              .filter((e) => e.type === 'frame')
              .map((el) => {
                const mx = (el.x - minX) * scale;
                const my = (el.y - minY) * scale;
                const mw = Math.max(el.width * scale, 10);
                const mh = Math.max(el.height * scale, 10);
                return (
                  <g key={el.id}>
                    <rect
                      x={mx}
                      y={my}
                      width={mw}
                      height={mh}
                      rx={3}
                      fill={isDark ? 'rgba(30, 41, 59, 0.25)' : 'rgba(241, 245, 249, 0.5)'}
                      stroke={el.style?.strokeColor || (isDark ? '#525252' : '#CBD5E1')}
                      strokeWidth={1}
                      strokeDasharray="3,2"
                    />
                    {el.frameTitle && (
                      <text
                        x={mx + 3}
                        y={my + 7}
                        fill={isDark ? '#E5E5E5' : '#374151'}
                        fontSize="6"
                        fontWeight="600"
                        fontFamily="sans-serif"
                      >
                        {el.frameTitle.slice(0, 14)}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* Render Live Mini Connectors with Real Bends / Curves */}
            {elements
              .filter((e) => e.type === 'connector')
              .map((conn) => {
                let start = conn.startPoint || { x: 0, y: 0 };
                let end = conn.endPoint || { x: 100, y: 100 };
                if (conn.fromId) {
                  const f = elements.find((el) => el.id === conn.fromId);
                  if (f) start = getElementAnchor(f, conn.fromAnchor || 'right');
                }
                if (conn.toId) {
                  const t = elements.find((el) => el.id === conn.toId);
                  if (t) end = getElementAnchor(t, conn.toAnchor || 'left');
                }

                const miniStart = { x: (start.x - minX) * scale, y: (start.y - minY) * scale };
                const miniEnd = { x: (end.x - minX) * scale, y: (end.y - minY) * scale };
                const miniBend = conn.bendPoint
                  ? { x: (conn.bendPoint.x - minX) * scale, y: (conn.bendPoint.y - minY) * scale }
                  : undefined;
                const pathD = getConnectorPath(
                  miniStart,
                  miniEnd,
                  conn.routing || 'orthogonal',
                  conn.fromAnchor,
                  conn.toAnchor,
                  miniBend
                );

                const strokeCol = conn.style?.strokeColor || (isDark ? '#E5E5E5' : '#18181B');

                return (
                  <path
                    key={conn.id}
                    d={pathD}
                    fill="none"
                    stroke={strokeCol}
                    strokeWidth={1.2}
                    strokeDasharray={conn.style?.strokeStyle === 'dashed' ? '2,2' : undefined}
                    markerEnd={conn.arrowEnd !== false ? 'url(#mini-arrow)' : undefined}
                    opacity={0.85}
                  />
                );
              })}

            {/* Render Freehand Pen Strokes */}
            {elements
              .filter((e) => e.type === 'pen' && e.points && e.points.length > 1)
              .map((pen) => {
                const pathD = `M ${pen.points!
                  .map((p) => `${(p.x - minX) * scale} ${(p.y - minY) * scale}`)
                  .join(' L ')}`;
                return (
                  <path
                    key={pen.id}
                    d={pathD}
                    fill="none"
                    stroke={pen.style?.strokeColor || (isDark ? '#E5E5E5' : '#18181B')}
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.8}
                  />
                );
              })}

            {/* Render Live Mini Shapes (Rect, Rounded, Circle, Diamond, Cylinder, Sticky, Icon, Text) */}
            {elements
              .filter((e) => e.type !== 'connector' && e.type !== 'pen' && e.type !== 'frame')
              .map((el) => {
                const mx = (el.x - minX) * scale;
                const my = (el.y - minY) * scale;
                const mw = Math.max(el.width * scale, 5);
                const mh = Math.max(el.height * scale, 5);

                const hasCustomBg =
                  el.style?.fillColor &&
                  el.style.fillColor !== 'transparent' &&
                  el.style.fillColor !== '#161924' &&
                  el.style.fillColor !== '#FFFFFF';

                const cardBg = hasCustomBg
                  ? el.style.fillColor
                  : isDark
                  ? '#161924'
                  : '#FFFFFF';

                const strokeColor = el.style?.strokeColor || (isDark ? '#525252' : '#27272A');
                const titleColor = isDark ? '#F1F5F9' : '#0F172A';

                // ================= CIRCLE =================
                if (el.type === 'circle') {
                  return (
                    <g key={el.id}>
                      <ellipse
                        cx={mx + mw / 2}
                        cy={my + mh / 2}
                        rx={mw / 2}
                        ry={mh / 2}
                        fill={cardBg}
                        stroke={strokeColor}
                        strokeWidth={1}
                      />
                      {el.text && mw > 18 && (
                        <text
                          x={mx + mw / 2}
                          y={my + mh / 2 + 2}
                          textAnchor="middle"
                          fill={titleColor}
                          fontSize="5.5"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {el.text.slice(0, 8)}
                        </text>
                      )}
                    </g>
                  );
                }

                // ================= DIAMOND =================
                if (el.type === 'diamond') {
                  const cx = mx + mw / 2;
                  const cy = my + mh / 2;
                  return (
                    <g key={el.id}>
                      <polygon
                        points={`${cx},${my} ${mx + mw},${cy} ${cx},${my + mh} ${mx},${cy}`}
                        fill={cardBg}
                        stroke={strokeColor}
                        strokeWidth={1}
                      />
                      {el.text && mw > 18 && (
                        <text
                          x={cx}
                          y={cy + 2}
                          textAnchor="middle"
                          fill={titleColor}
                          fontSize="5.5"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {el.text.slice(0, 8)}
                        </text>
                      )}
                    </g>
                  );
                }

                // ================= CYLINDER (DATABASE) =================
                if (el.type === 'cylinder') {
                  const rx = mw / 2;
                  const ry = Math.min(mh * 0.18, 5);
                  return (
                    <g key={el.id}>
                      {/* Cylinder Body */}
                      <rect
                        x={mx}
                        y={my + ry}
                        width={mw}
                        height={Math.max(mh - ry * 2, 4)}
                        fill={cardBg}
                        stroke={strokeColor}
                        strokeWidth={1}
                      />
                      {/* Bottom curved base */}
                      <ellipse
                        cx={mx + rx}
                        cy={my + mh - ry}
                        rx={rx}
                        ry={ry}
                        fill={cardBg}
                        stroke={strokeColor}
                        strokeWidth={1}
                      />
                      {/* Top rim */}
                      <ellipse
                        cx={mx + rx}
                        cy={my + ry}
                        rx={rx}
                        ry={ry}
                        fill={isDark ? '#202538' : '#F1F5F9'}
                        stroke={strokeColor}
                        strokeWidth={1}
                      />
                      {el.text && mw > 20 && (
                        <text
                          x={mx + rx}
                          y={my + mh / 2 + 2}
                          textAnchor="middle"
                          fill={titleColor}
                          fontSize="5.5"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {el.text.slice(0, 8)}
                        </text>
                      )}
                    </g>
                  );
                }

                // ================= STICKY NOTE =================
                if (el.type === 'sticky') {
                  const sc = STICKY_COLORS[el.stickyColor || 'yellow'] || STICKY_COLORS.yellow;
                  return (
                    <g key={el.id}>
                      <rect
                        x={mx}
                        y={my}
                        width={mw}
                        height={mh}
                        rx={1.5}
                        fill={sc.bg}
                        stroke={sc.border}
                        strokeWidth={1}
                      />
                      {/* Folded bottom-right flap */}
                      <polygon
                        points={`${mx + mw},${my + mh - 4} ${mx + mw - 4},${my + mh} ${mx + mw},${my + mh}`}
                        fill="rgba(0,0,0,0.2)"
                      />
                      {el.text && mw > 16 && (
                        <text
                          x={mx + 3}
                          y={my + 7}
                          fill={sc.text}
                          fontSize="5.5"
                          fontFamily="sans-serif"
                        >
                          {el.text.slice(0, 10)}
                        </text>
                      )}
                    </g>
                  );
                }

                // ================= ICON CARD =================
                if (el.type === 'icon') {
                  const iconDef = getIconDefinition(el.iconName);
                  const iconSrc = iconDef.iconUrl || `/icons/${iconDef.id}.svg`;
                  const iconSide = Math.min(mw * 0.5, mh * 0.5, 14);

                  return (
                    <g key={el.id}>
                      <rect
                        x={mx}
                        y={my}
                        width={mw}
                        height={mh}
                        rx={3}
                        fill={cardBg}
                        stroke={strokeColor}
                        strokeWidth={1}
                      />
                      {/* Actual Scaled Mini Icon Vector */}
                      <image
                        href={iconSrc}
                        x={mx + mw / 2 - iconSide / 2}
                        y={my + 2}
                        width={iconSide}
                        height={iconSide}
                        preserveAspectRatio="xMidYMid meet"
                      />
                      {/* Mini Icon Label */}
                      {(el.iconLabel || el.text) && mw > 18 && (
                        <text
                          x={mx + mw / 2}
                          y={my + mh - 2}
                          textAnchor="middle"
                          fill={titleColor}
                          fontSize="5"
                          fontWeight="600"
                          fontFamily="sans-serif"
                        >
                          {(el.iconLabel || el.text || '').slice(0, 8)}
                        </text>
                      )}
                    </g>
                  );
                }

                // ================= TEXT BLOCK =================
                if (el.type === 'text') {
                  return (
                    <text
                      key={el.id}
                      x={mx}
                      y={my + mh / 2 + 2}
                      fill={el.style?.textColor || titleColor}
                      fontSize={Math.max(6, Math.min(9, (el.style?.fontSize || 16) * scale * 1.5))}
                      fontWeight="600"
                      fontFamily={el.style?.fontFamily === 'mono' ? 'monospace' : 'sans-serif'}
                    >
                      {el.text || 'Text'}
                    </text>
                  );
                }

                // ================= RECTANGLE / ROUNDED-RECT =================
                const isRounded = el.type === 'rounded-rect';
                return (
                  <g key={el.id}>
                    <rect
                      x={mx}
                      y={my}
                      width={mw}
                      height={mh}
                      rx={isRounded ? 3 : 0.5}
                      fill={cardBg}
                      stroke={strokeColor}
                      strokeWidth={1}
                      strokeDasharray={el.style?.strokeStyle === 'dashed' ? '2,2' : undefined}
                    />
                    {/* Tier Tag if present */}
                    {el.tierTag && (
                      <rect
                        x={mx + 2}
                        y={my + 2}
                        width={Math.min(mw - 4, 14)}
                        height={3}
                        rx={0.5}
                        fill={strokeColor}
                        opacity={0.7}
                      />
                    )}
                    {/* Element Label */}
                    {el.text && mw > 18 && (
                      <text
                        x={mx + 3}
                        y={my + mh / 2 + 2}
                        fill={titleColor}
                        fontSize={Math.max(5, Math.min(7.5, (el.style?.fontSize || 14) * scale * 1.2))}
                        fontWeight="600"
                        fontFamily="sans-serif"
                      >
                        {el.text.slice(0, 10)}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* Viewport Boundary Box (Interactive Camera Window) */}
            <g className="cursor-grab active:cursor-grabbing">
              {/* Outer halo */}
              <rect
                x={viewX}
                y={viewY}
                width={viewW}
                height={viewH}
                fill={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
                stroke={isDark ? '#A1A1AA' : '#52525B'}
                strokeWidth={1.5}
                rx={2.5}
                className="transition-none pointer-events-none"
              />

              {/* Viewfinder corner brackets for clear camera metaphor */}
              <path
                d={`M ${viewX} ${viewY + 4} L ${viewX} ${viewY} L ${viewX + 4} ${viewY}`}
                fill="none"
                stroke={isDark ? '#E5E5E5' : '#27272A'}
                strokeWidth={2}
                className="pointer-events-none"
              />
              <path
                d={`M ${viewX + viewW - 4} ${viewY} L ${viewX + viewW} ${viewY} L ${viewX + viewW} ${viewY + 4}`}
                fill="none"
                stroke={isDark ? '#E5E5E5' : '#27272A'}
                strokeWidth={2}
                className="pointer-events-none"
              />
              <path
                d={`M ${viewX} ${viewY + viewH - 4} L ${viewX} ${viewY + viewH} L ${viewX + 4} ${viewY + viewH}`}
                fill="none"
                stroke={isDark ? '#E5E5E5' : '#27272A'}
                strokeWidth={2}
                className="pointer-events-none"
              />
              <path
                d={`M ${viewX + viewW - 4} ${viewY + viewH} L ${viewX + viewW} ${viewY + viewH} L ${viewX + viewW} ${viewY + viewH - 4}`}
                fill="none"
                stroke={isDark ? '#E5E5E5' : '#27272A'}
                strokeWidth={2}
                className="pointer-events-none"
              />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};
