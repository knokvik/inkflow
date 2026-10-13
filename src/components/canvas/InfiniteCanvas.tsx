import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AnchorPosition,
  CanvasElement,
  Point,
  ToolType,
} from '../../types/canvas';
import { ElementRenderer } from './ElementRenderer';
import { ConnectorRenderer } from './ConnectorRenderer';
import {
  snapToGrid,
  getBoundingBox,
  getConnectorPath,
  findNearbyAnchor,
  getElementAnchor,
  getClosestAnchor,
  isPointInElement,
  NearbyAnchorResult,
} from '../../utils/geometry';

interface InfiniteCanvasProps {
  elements: CanvasElement[];
  onElementsChange: (newElements: CanvasElement[], recordHistory?: boolean) => void;
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  pan: Point;
  onPanChange: (newPan: Point) => void;
  gridMode: 'dots' | 'grid' | 'none';
  snapEnabled: boolean;
  roughStyle: boolean;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onOpenIconPicker: () => void;
  theme?: 'light' | 'dark';
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  elements,
  onElementsChange,
  activeTool,
  onSelectTool,
  zoom,
  onZoomChange,
  pan,
  onPanChange,
  gridMode,
  snapEnabled,
  roughStyle,
  selectedIds,
  onSelectedIdsChange,
  onOpenIconPicker,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Moving elements
  const [isDraggingElements, setIsDraggingElements] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [dragInitialPositions, setDragInitialPositions] = useState<Map<string, Point>>(new Map());

  // Resizing element
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const [resizingElement, setResizingElement] = useState<CanvasElement | null>(null);
  const [resizeStartMouse, setResizeStartMouse] = useState<Point>({ x: 0, y: 0 });

  // Anchor connector drawing
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ elementId: string; anchor: AnchorPosition } | null>(null);
  const [currentConnectionPoint, setCurrentConnectionPoint] = useState<Point>({ x: 0, y: 0 });

  // Marquee selection box
  const [isMarquee, setIsMarquee] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<Point>({ x: 0, y: 0 });
  const [marqueeCurrent, setMarqueeCurrent] = useState<Point>({ x: 0, y: 0 });

  // Live element drawing / dragging on canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState<Point>({ x: 0, y: 0 });
  const [drawingCurrent, setDrawingCurrent] = useState<Point>({ x: 0, y: 0 });
  const [penPoints, setPenPoints] = useState<Point[]>([]);

  // Text inline editing inside element (title or subtitle)
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'title' | 'subtitle'>('title');
  const [editingText, setEditingText] = useState('');

  // Track hover
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  // Magnetic snapping state for arrow/connector tool
  const [activeAnchorSnap, setActiveAnchorSnap] = useState<NearbyAnchorResult | null>(null);
  const [connectorStartAnchor, setConnectorStartAnchor] = useState<NearbyAnchorResult | null>(null);
  const [bendingConnectorId, setBendingConnectorId] = useState<string | null>(null);

  // Live Canvas Viewport dimensions
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 800,
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Helper to convert Screen -> Canvas World coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;
      return {
        x: (clientX - pan.x) / zoom,
        y: (clientY - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Spacebar tracking for quick panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !editingElementId && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [editingElementId]);

  // Wheel zoom around cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    if (e.ctrlKey || e.metaKey) {
      // Pinch to zoom
      const zoomFactor = -e.deltaY * 0.005;
      const newZoom = Math.min(Math.max(zoom + zoomFactor, 0.2), 3);
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Adjust pan to zoom into mouse point
      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

      onZoomChange(newZoom);
      onPanChange({ x: newPanX, y: newPanY });
    } else {
      // 2-finger scroll pans the canvas
      onPanChange({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // If middle click or space pressed or hand tool active -> Pan
    if (e.button === 1 || isSpacePressed || activeTool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return; // Only left click for actions

    const worldPoint = screenToWorld(e.clientX, e.clientY);
    const snapX = snapEnabled ? snapToGrid(worldPoint.x) : worldPoint.x;
    const snapY = snapEnabled ? snapToGrid(worldPoint.y) : worldPoint.y;

    // Check if user clicked to close an ongoing text edit
    if (editingElementId) {
      handleSaveTextEdit();
    }

    if (activeTool === 'icon') {
      onOpenIconPicker();
      onSelectTool('select');
      return;
    }

    // Dedicated Connector / Arrow Tool drawing with magnetic anchor snapping
    if (activeTool === 'connector') {
      const startSnap = findNearbyAnchor(elements, worldPoint, 36);
      if (startSnap) {
        setConnectorStartAnchor(startSnap);
        setDrawingStart(startSnap.point);
        setDrawingCurrent(startSnap.point);
      } else {
        setConnectorStartAnchor(null);
        setDrawingStart({ x: snapX, y: snapY });
        setDrawingCurrent({ x: snapX, y: snapY });
      }
      setIsDrawing(true);
      return;
    }

    // Drag-to-Draw for shapes, pen, and text box
    if (
      [
        'rectangle',
        'rounded-rect',
        'circle',
        'diamond',
        'cylinder',
        'sticky',
        'text',
        'frame',
        'pen',
      ].includes(activeTool)
    ) {
      setIsDrawing(true);
      setDrawingStart({ x: snapX, y: snapY });
      setDrawingCurrent({ x: snapX, y: snapY });
      if (activeTool === 'pen') {
        setPenPoints([{ x: worldPoint.x, y: worldPoint.y }]);
      }
      return;
    }

    // Default: Clicked empty canvas in select mode -> start marquee selection
    onSelectedIdsChange([]);
    setIsMarquee(true);
    setMarqueeStart(worldPoint);
    setMarqueeCurrent(worldPoint);
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    // Panning
    if (isPanning) {
      onPanChange({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const worldPoint = screenToWorld(e.clientX, e.clientY);

    // Dragging custom connector bend waypoint
    if (bendingConnectorId) {
      onElementsChange(
        elements.map((el) =>
          el.id === bendingConnectorId ? { ...el, bendPoint: worldPoint } : el
        ),
        false
      );
      return;
    }

    // Live Drawing elements by dragging
    if (isDrawing) {
      if (activeTool === 'connector') {
        let targetSnap = findNearbyAnchor(elements, worldPoint, 45, connectorStartAnchor?.elementId);
        if (!targetSnap) {
          const insideBlock = elements.find(
            (el) =>
              el.type !== 'connector' &&
              el.type !== 'pen' &&
              el.type !== 'frame' &&
              el.id !== connectorStartAnchor?.elementId &&
              isPointInElement(worldPoint, el)
          );
          if (insideBlock) {
            const closest = getClosestAnchor(insideBlock, worldPoint);
            targetSnap = {
              elementId: insideBlock.id,
              anchor: closest.anchor,
              point: closest.point,
              element: insideBlock,
              distance: 0,
            };
          }
        }
        if (targetSnap) {
          setActiveAnchorSnap(targetSnap);
          setHoveredElementId(targetSnap.elementId);
          setDrawingCurrent(targetSnap.point);
        } else {
          setActiveAnchorSnap(null);
          const nearbyNode = elements.find((el) => {
            if (el.type === 'connector' || el.type === 'pen' || el.type === 'frame' || el.id === connectorStartAnchor?.elementId) return false;
            const pad = 45;
            return (
              worldPoint.x >= el.x - pad &&
              worldPoint.x <= el.x + el.width + pad &&
              worldPoint.y >= el.y - pad &&
              worldPoint.y <= el.y + el.height + pad
            );
          });
          setHoveredElementId(nearbyNode ? nearbyNode.id : null);
          const snapX = snapEnabled ? snapToGrid(worldPoint.x) : worldPoint.x;
          const snapY = snapEnabled ? snapToGrid(worldPoint.y) : worldPoint.y;
          setDrawingCurrent({ x: snapX, y: snapY });
        }
        return;
      }

      const snapX = snapEnabled ? snapToGrid(worldPoint.x) : worldPoint.x;
      const snapY = snapEnabled ? snapToGrid(worldPoint.y) : worldPoint.y;
      setDrawingCurrent({ x: snapX, y: snapY });
      if (activeTool === 'pen') {
        setPenPoints((prev) => [...prev, worldPoint]);
      }
      return;
    }

    // Hovering while connector tool is active: only show dots if near a block!
    if (activeTool === 'connector' && !isDrawing) {
      const hoverSnap = findNearbyAnchor(elements, worldPoint, 40);
      setActiveAnchorSnap(hoverSnap);
      const nearbyNode = elements.find((el) => {
        if (el.type === 'connector' || el.type === 'pen' || el.type === 'frame') return false;
        const pad = 45;
        return (
          worldPoint.x >= el.x - pad &&
          worldPoint.x <= el.x + el.width + pad &&
          worldPoint.y >= el.y - pad &&
          worldPoint.y <= el.y + el.height + pad
        );
      });
      setHoveredElementId(nearbyNode ? nearbyNode.id : null);
    } else if (!isDrawing && !isDraggingElements && !isPanning) {
      const hovered = elements.slice().reverse().find((el) => {
        if (el.type === 'connector' || el.type === 'pen') return false;
        return (
          worldPoint.x >= el.x &&
          worldPoint.x <= el.x + el.width &&
          worldPoint.y >= el.y &&
          worldPoint.y <= el.y + el.height
        );
      });
      setHoveredElementId(hovered ? hovered.id : null);
    }

    // Connecting anchor
    if (isConnecting && connectionStart) {
      setCurrentConnectionPoint(worldPoint);
      let targetSnap = findNearbyAnchor(elements, worldPoint, 45, connectionStart.elementId);
      if (!targetSnap) {
        const insideBlock = elements.find(
          (el) =>
            el.type !== 'connector' &&
            el.type !== 'pen' &&
            el.type !== 'frame' &&
            el.id !== connectionStart.elementId &&
            isPointInElement(worldPoint, el)
        );
        if (insideBlock) {
          const closest = getClosestAnchor(insideBlock, worldPoint);
          targetSnap = {
            elementId: insideBlock.id,
            anchor: closest.anchor,
            point: closest.point,
            element: insideBlock,
            distance: 0,
          };
        }
      }
      if (targetSnap) {
        setActiveAnchorSnap(targetSnap);
        setHoveredElementId(targetSnap.elementId);
      } else {
        setActiveAnchorSnap(null);
        setHoveredElementId(null);
      }
      return;
    }

    // Resizing
    if (resizingHandle && resizingElement) {
      const dx = worldPoint.x - resizeStartMouse.x;
      const dy = worldPoint.y - resizeStartMouse.y;
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
      let newW = resizingElement.width;
      let newH = resizingElement.height;
      let newX = resizingElement.x;
      let newY = resizingElement.y;

      if (resizingHandle.includes('e')) newW = Math.max(30, resizingElement.width + dx);
      if (resizingHandle.includes('s')) newH = Math.max(30, resizingElement.height + dy);
      if (resizingHandle.includes('w')) {
        const potentialW = resizingElement.width - dx;
        if (potentialW > 30) {
          newW = potentialW;
          newX = resizingElement.x + dx;
        }
      }
      if (resizingHandle.includes('n')) {
        const potentialH = resizingElement.height - dy;
        if (potentialH > 30) {
          newH = potentialH;
          newY = resizingElement.y + dy;
        }
      }

      onElementsChange(
        elements.map((el) =>
          el.id === resizingElement.id ? { ...el, x: newX, y: newY, width: newW, height: newH } : el
        ),
        false
      );
      return;
    }

    // Dragging selected elements (with dynamic arrow tracking)
    if (isDraggingElements) {
      const dx = worldPoint.x - dragStartPoint.x;
      const dy = worldPoint.y - dragStartPoint.y;

      const movedElements = elements.map((el) => {
        if (dragInitialPositions.has(el.id)) {
          const initPos = dragInitialPositions.get(el.id)!;
          const updatedX = snapEnabled ? snapToGrid(initPos.x + dx) : initPos.x + dx;
          const updatedY = snapEnabled ? snapToGrid(initPos.y + dy) : initPos.y + dy;
          return { ...el, x: updatedX, y: updatedY };
        }
        return el;
      });

      // Update connected arrows attached to moving elements
      const finalElements = movedElements.map((el) => {
        if (el.type === 'connector' && (el.fromId || el.toId)) {
          let s = el.startPoint;
          let e = el.endPoint;
          if (el.fromId && dragInitialPositions.has(el.fromId)) {
            const fromEl = movedElements.find((m) => m.id === el.fromId);
            if (fromEl) s = getElementAnchor(fromEl, el.fromAnchor || 'right');
          }
          if (el.toId && dragInitialPositions.has(el.toId)) {
            const toEl = movedElements.find((m) => m.id === el.toId);
            if (toEl) e = getElementAnchor(toEl, el.toAnchor || 'left');
          }
          return { ...el, startPoint: s, endPoint: e };
        }
        return el;
      });

      onElementsChange(finalElements, false);
      return;
    }

    // Marquee selection
    if (isMarquee) {
      setMarqueeCurrent(worldPoint);
      const minX = Math.min(marqueeStart.x, worldPoint.x);
      const maxX = Math.max(marqueeStart.x, worldPoint.x);
      const minY = Math.min(marqueeStart.y, worldPoint.y);
      const maxY = Math.max(marqueeStart.y, worldPoint.y);

      const capturedNodes = elements
        .filter((el) => el.type !== 'connector' && el.type !== 'pen' && el.type !== 'frame')
        .filter((el) => el.x + el.width >= minX && el.x <= maxX && el.y + el.height >= minY && el.y <= maxY)
        .map((el) => el.id);

      const capturedConnectors = elements
        .filter((el) => el.type === 'connector')
        .filter((conn) => {
          let s = conn.startPoint || { x: conn.x, y: conn.y };
          let e = conn.endPoint || { x: conn.x + conn.width, y: conn.y + conn.height };
          if (conn.fromId) {
            const fromEl = elements.find((m) => m.id === conn.fromId);
            if (fromEl) s = getElementAnchor(fromEl, conn.fromAnchor || 'right');
          }
          if (conn.toId) {
            const toEl = elements.find((m) => m.id === conn.toId);
            if (toEl) e = getElementAnchor(toEl, conn.toAnchor || 'left');
          }
          const sInside = s.x >= minX && s.x <= maxX && s.y >= minY && s.y <= maxY;
          const eInside = e.x >= minX && e.x <= maxX && e.y >= minY && e.y <= maxY;
          if (sInside || eInside) return true;

          const connMinX = Math.min(s.x, e.x);
          const connMaxX = Math.max(s.x, e.x);
          const connMinY = Math.min(s.y, e.y);
          const connMaxY = Math.max(s.y, e.y);
          return connMinX <= maxX && connMaxX >= minX && connMinY <= maxY && connMaxY >= minY;
        })
        .map((conn) => conn.id);

      const capturedPens = elements
        .filter((el) => el.type === 'pen')
        .filter((pen) => pen.x + pen.width >= minX && pen.x <= maxX && pen.y + pen.height >= minY && pen.y <= maxY)
        .map((pen) => pen.id);

      onSelectedIdsChange([...capturedNodes, ...capturedConnectors, ...capturedPens]);
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    // If bending connector was released, commit step
    if (bendingConnectorId) {
      onElementsChange(elements, true);
      setBendingConnectorId(null);
    }

    // If anchor connecting from magnetic dot, commit connector on mouseup
    if (isConnecting && connectionStart) {
      const fromEl = elements.find((e) => e.id === connectionStart.elementId);
      const startPt = fromEl ? getElementAnchor(fromEl, connectionStart.anchor) : { x: 0, y: 0 };
      let toSnap = activeAnchorSnap;

      if (!toSnap) {
        const releasedOnBlock = elements.find(
          (el) =>
            el.type !== 'connector' &&
            el.type !== 'pen' &&
            el.type !== 'frame' &&
            el.id !== connectionStart.elementId &&
            isPointInElement(currentConnectionPoint, el)
        );
        if (releasedOnBlock) {
          const closest = getClosestAnchor(releasedOnBlock, currentConnectionPoint);
          toSnap = {
            elementId: releasedOnBlock.id,
            anchor: closest.anchor,
            point: closest.point,
            element: releasedOnBlock,
            distance: 0,
          };
        }
      }

      const endPt = toSnap ? toSnap.point : currentConnectionPoint;

      if (toSnap || Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y) > 8) {
        const newConnector: CanvasElement = {
          id: `conn_${Date.now()}`,
          type: 'connector',
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          startPoint: startPt,
          endPoint: endPt,
          fromId: connectionStart.elementId,
          fromAnchor: connectionStart.anchor,
          toId: toSnap ? toSnap.elementId : undefined,
          toAnchor: toSnap ? toSnap.anchor : undefined,
          routing: 'orthogonal',
          arrowEnd: true,
          connectorLabel: '',
          style: {
            fillColor: 'transparent',
            strokeColor: isDark ? '#E5E5E5' : '#18181B',
            strokeWidth: 2,
            strokeStyle: 'solid',
            roughness: roughStyle ? 1 : 0,
            textColor: isDark ? '#E5E5E5' : '#18181B',
            fontSize: 11,
            fontFamily: 'sans',
            textAlign: 'center',
            opacity: 1,
          },
          zIndex: 5,
        };
        onElementsChange([...elements, newConnector], true);
        onSelectedIdsChange([newConnector.id]);
      }

      setIsConnecting(false);
      setConnectionStart(null);
      setActiveAnchorSnap(null);
      return;
    }

    // If elements were dragged or resized, commit exactly one undo step
    if (isDraggingElements || resizingHandle) {
      onElementsChange(elements, true);
    }

    // If user was dragging to draw a new element
    if (isDrawing) {
      setIsDrawing(false);
      const minX = Math.min(drawingStart.x, drawingCurrent.x);
      const minY = Math.min(drawingStart.y, drawingCurrent.y);
      let width = Math.abs(drawingCurrent.x - drawingStart.x);
      let height = Math.abs(drawingCurrent.y - drawingStart.y);

      const isClickOnly = width < 10 && height < 10;

      // Handle Connector / Arrow
      if (activeTool === 'connector') {
        const startPt = drawingStart;
        const fromSnap = connectorStartAnchor;
        let toSnap = activeAnchorSnap;

        if (!toSnap) {
          const releasedOnBlock = elements.find(
            (el) =>
              el.type !== 'connector' &&
              el.type !== 'pen' &&
              el.type !== 'frame' &&
              el.id !== fromSnap?.elementId &&
              isPointInElement(drawingCurrent, el)
          );
          if (releasedOnBlock) {
            const closest = getClosestAnchor(releasedOnBlock, drawingCurrent);
            toSnap = {
              elementId: releasedOnBlock.id,
              anchor: closest.anchor,
              point: closest.point,
              element: releasedOnBlock,
              distance: 0,
            };
          }
        }

        const endPt = toSnap ? toSnap.point : (isClickOnly ? { x: drawingStart.x + 140, y: drawingStart.y } : drawingCurrent);

        const newConnector: CanvasElement = {
          id: `conn_${Date.now()}`,
          type: 'connector',
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          startPoint: fromSnap ? fromSnap.point : startPt,
          endPoint: endPt,
          fromId: fromSnap ? fromSnap.elementId : undefined,
          fromAnchor: fromSnap ? fromSnap.anchor : undefined,
          toId: toSnap ? toSnap.elementId : undefined,
          toAnchor: toSnap ? toSnap.anchor : undefined,
          routing: 'orthogonal',
          arrowEnd: true,
          connectorLabel: '',
          style: {
            fillColor: 'transparent',
            strokeColor: isDark ? '#E5E5E5' : '#18181B',
            strokeWidth: 2,
            strokeStyle: 'solid',
            roughness: roughStyle ? 1 : 0,
            textColor: isDark ? '#E5E5E5' : '#18181B',
            fontSize: 11,
            fontFamily: 'sans',
            textAlign: 'center',
            opacity: 1,
          },
          zIndex: 5,
        };
        setConnectorStartAnchor(null);
        setActiveAnchorSnap(null);
        onElementsChange([...elements, newConnector], true);
        onSelectedIdsChange([newConnector.id]);
        onSelectTool('select');
        return;
      }

      // Handle Pen / Freehand
      if (activeTool === 'pen') {
        if (penPoints.length > 1) {
          const newPen: CanvasElement = {
            id: `pen_${Date.now()}`,
            type: 'pen',
            x: minX,
            y: minY,
            width: Math.max(width, 10),
            height: Math.max(height, 10),
            points: penPoints,
            style: {
              fillColor: 'transparent',
              strokeColor: isDark ? '#E5E5E5' : '#18181B',
              strokeWidth: 2.5,
              strokeStyle: 'solid',
              roughness: 0,
              textColor: '#FFFFFF',
              fontSize: 12,
              fontFamily: 'sans',
              textAlign: 'center',
              opacity: 1,
            },
            zIndex: 10,
          };
          onElementsChange([...elements, newPen], true);
          onSelectedIdsChange([newPen.id]);
        }
        setPenPoints([]);
        onSelectTool('select');
        return;
      }

      // Sizing for shapes and text
      if (isClickOnly) {
        if (activeTool === 'circle') {
          width = 100;
          height = 100;
        } else if (activeTool === 'sticky') {
          width = 160;
          height = 140;
        } else if (activeTool === 'cylinder') {
          width = 130;
          height = 90;
        } else if (activeTool === 'diamond') {
          width = 120;
          height = 80;
        } else if (activeTool === 'frame') {
          width = 400;
          height = 300;
        } else if (activeTool === 'text') {
          width = 160;
          height = 50;
        } else {
          width = 160;
          height = 80;
        }
      } else {
        width = Math.max(width, activeTool === 'text' ? 80 : 30);
        height = Math.max(height, activeTool === 'text' ? 36 : 20);
      }

      const posX = isClickOnly ? drawingStart.x - width / 2 : minX;
      const posY = isClickOnly ? drawingStart.y - height / 2 : minY;

      let defaultText = '';
      if (activeTool === 'cylinder') defaultText = 'Database';
      else if (activeTool === 'sticky') defaultText = 'Note...';
      else if (activeTool === 'diamond') defaultText = 'Decision';
      else if (activeTool === 'text') defaultText = '';
      else if (activeTool === 'frame') defaultText = '';
      else if (isClickOnly) defaultText = activeTool === 'circle' ? 'Circle' : 'Rectangle';

      const newEl: CanvasElement = {
        id: `el_${Date.now()}`,
        type: activeTool as any,
        x: posX,
        y: posY,
        width,
        height,
        text: defaultText,
        frameTitle: activeTool === 'frame' ? 'Group Boundary' : undefined,
        stickyColor: activeTool === 'sticky' ? 'yellow' : undefined,
        style: {
          fillColor:
            activeTool === 'frame'
              ? isDark
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(0,0,0,0.02)'
              : activeTool === 'text'
              ? 'transparent'
              : isDark
              ? '#262626'
              : '#FFFFFF',
          strokeColor:
            activeTool === 'frame'
              ? isDark
                ? '#525252'
                : '#A1A1AA'
              : activeTool === 'text'
              ? 'transparent'
              : isDark
              ? '#525252'
              : '#27272A',
          strokeWidth: activeTool === 'text' ? 0 : 2,
          strokeStyle: activeTool === 'frame' ? 'dashed' : 'solid',
          roughness: roughStyle ? 1 : 0,
          textColor: isDark ? '#EDEDED' : '#0F172A',
          fontSize: activeTool === 'text' ? 16 : 14,
          fontFamily: activeTool === 'sticky' ? 'hand' : 'sans',
          textAlign: 'center',
          opacity: 1,
        },
        zIndex: activeTool === 'frame' ? 1 : 10,
      };

      onElementsChange([...elements, newEl], true);
      onSelectedIdsChange([newEl.id]);
      onSelectTool('select');

      // If text tool: IMMEDIATELY focus inline editing right in the center of the expanded box!
      if (activeTool === 'text') {
        setEditingElementId(newEl.id);
        setEditingText('');
      }
      return;
    }

    setIsPanning(false);
    setIsDraggingElements(false);
    setResizingHandle(null);
    setResizingElement(null);
    setIsMarquee(false);

    setIsConnecting(false);
    setConnectionStart(null);
  };

  // Global window mouseup so interactions (drawing, connecting, dragging) always complete reliably
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (
        isDrawing ||
        isConnecting ||
        isDraggingElements ||
        isPanning ||
        isMarquee ||
        resizingHandle ||
        bendingConnectorId
      ) {
        handleMouseUp();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [
    isDrawing,
    isConnecting,
    isDraggingElements,
    isPanning,
    isMarquee,
    resizingHandle,
    bendingConnectorId,
    drawingStart,
    drawingCurrent,
    activeTool,
    elements,
    connectorStartAnchor,
    activeAnchorSnap,
    connectionStart,
    currentConnectionPoint,
  ]);

  // Start dragging an element
  const handleElementMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();

    // If currently editing another element, commit its text changes first
    if (editingElementId && editingElementId !== element.id) {
      handleSaveTextEdit();
    }

    if (activeTool === 'hand' || isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    // If a creation/drawing tool is active, let canvas draw/create the shape even if clicking over an existing element!
    if (activeTool !== 'select' && activeTool !== 'connector') {
      handleMouseDown(e);
      return;
    }

    // If connector tool is active, start drawing connector from this element!
    if (activeTool === 'connector') {
      const worldPoint = screenToWorld(e.clientX, e.clientY);
      const startSnap = findNearbyAnchor(elements, worldPoint, 50) || {
        elementId: element.id,
        anchor: getClosestAnchor(element, worldPoint).anchor,
        point: getClosestAnchor(element, worldPoint).point,
        element,
        distance: 0,
      };
      setConnectorStartAnchor(startSnap);
      setDrawingStart(startSnap.point);
      setDrawingCurrent(startSnap.point);
      setIsDrawing(true);
      return;
    }

    const worldPoint = screenToWorld(e.clientX, e.clientY);

    // Deep / Cycle selection: find all non-connector elements under the cursor
    const hits = elements.filter(
      (el) =>
        el.type !== 'connector' &&
        el.type !== 'pen' &&
        isPointInElement(worldPoint, el)
    );

    let targetElement = element;
    if (hits.length > 1) {
      // Sort hits: non-frames first, then smallest area (deepest child) to largest area (container)
      const sortedHits = [...hits].sort((a, b) => {
        if (a.type !== 'frame' && b.type === 'frame') return -1;
        if (a.type === 'frame' && b.type !== 'frame') return 1;
        const aArea = a.width * a.height;
        const bArea = b.width * b.height;
        return aArea - bArea;
      });

      // If the top hit is already selected and user clicks again, cycle to the next element (outer container)
      const currentIdx = sortedHits.findIndex((h) => selectedIds.includes(h.id));
      if (currentIdx !== -1 && !e.shiftKey) {
        targetElement = sortedHits[(currentIdx + 1) % sortedHits.length];
      } else {
        targetElement = sortedHits[0];
      }
    }

    // Multi-select with Shift
    if (e.shiftKey) {
      if (selectedIds.includes(targetElement.id)) {
        onSelectedIdsChange(selectedIds.filter((id) => id !== targetElement.id));
      } else {
        onSelectedIdsChange([...selectedIds, targetElement.id]);
      }
    } else {
      if (!selectedIds.includes(targetElement.id)) {
        onSelectedIdsChange([targetElement.id]);
      }
    }

    // Record initial drag positions for all selected elements
    setDragStartPoint(worldPoint);
    setIsDraggingElements(true);

    const positions = new Map<string, Point>();
    const effectiveSelected = selectedIds.includes(targetElement.id) ? selectedIds : [targetElement.id];
    for (const el of elements) {
      if (effectiveSelected.includes(el.id)) {
        positions.set(el.id, { x: el.x, y: el.y });
      }
    }

    // If any frame is being dragged, also move all elements completely enclosed inside that frame
    for (const selectedId of effectiveSelected) {
      const frameEl = elements.find((el) => el.id === selectedId && el.type === 'frame');
      if (frameEl) {
        for (const child of elements) {
          if (
            child.id !== frameEl.id &&
            child.x >= frameEl.x &&
            child.x + child.width <= frameEl.x + frameEl.width &&
            child.y >= frameEl.y &&
            child.y + child.height <= frameEl.y + frameEl.height
          ) {
            positions.set(child.id, { x: child.x, y: child.y });
          }
        }
      }
    }

    setDragInitialPositions(positions);
  };

  // Start anchor connection
  const handleStartAnchorConnect = (e: React.MouseEvent, element: CanvasElement, anchor: AnchorPosition) => {
    e.stopPropagation();
    setIsConnecting(true);
    setConnectionStart({ elementId: element.id, anchor });
    const worldPoint = screenToWorld(e.clientX, e.clientY);
    setCurrentConnectionPoint(worldPoint);
  };

  // Finish anchor connection by dropping on target node
  const handleEndAnchorConnect = (targetElement: CanvasElement, targetAnchor: AnchorPosition) => {
    if (!connectionStart || connectionStart.elementId === targetElement.id) {
      setIsConnecting(false);
      setConnectionStart(null);
      return;
    }

    const newConnector: CanvasElement = {
      id: `conn_${Date.now()}`,
      type: 'connector',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      fromId: connectionStart.elementId,
      fromAnchor: connectionStart.anchor,
      toId: targetElement.id,
      toAnchor: targetAnchor,
      routing: 'orthogonal',
      arrowEnd: true,
      connectorLabel: 'Connect',
      style: {
        fillColor: 'transparent',
        strokeColor: isDark ? '#E5E5E5' : '#18181B',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: isDark ? '#E5E5E5' : '#18181B',
        fontSize: 11,
        fontFamily: 'mono',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 5,
    };

    onElementsChange([...elements, newConnector]);
    setIsConnecting(false);
    setConnectionStart(null);
  };

  // Start resize
  const handleStartResize = (e: React.MouseEvent, element: CanvasElement, handle: string) => {
    e.stopPropagation();
    setResizingHandle(handle);
    setResizingElement(element);
    setResizeStartMouse(screenToWorld(e.clientX, e.clientY));
  };

  // Double click to edit text (title or subtitle)
  const handleDoubleClickElement = (element: CanvasElement, field: 'title' | 'subtitle' = 'title') => {
    setEditingElementId(element.id);
    setEditingField(field);
    if (field === 'subtitle') {
      setEditingText(element.subtitle || '');
    } else {
      setEditingText(element.text || element.connectorLabel || element.iconLabel || element.frameTitle || '');
    }
  };

  const handleSaveTextEdit = () => {
    if (!editingElementId) return;
    onElementsChange(
      elements.map((el) => {
        if (el.id === editingElementId) {
          if (editingField === 'subtitle') {
            return { ...el, subtitle: editingText };
          }
          if (el.type === 'connector') return { ...el, connectorLabel: editingText };
          if (el.type === 'frame') return { ...el, frameTitle: editingText };
          if (el.type === 'icon') return { ...el, iconLabel: editingText, text: editingText };
          return { ...el, text: editingText };
        }
        return el;
      }),
      true
    );
    setEditingElementId(null);
    setEditingField('title');
  };

  // Connectors, Pens & Shapes split
  const connectors = elements.filter((e) => e.type === 'connector');
  const pens = elements.filter((e) => e.type === 'pen');
  const nodes = elements
    .filter((e) => e.type !== 'connector' && e.type !== 'pen')
    .slice()
    .sort((a, b) => {
      // Frames are always rendered in the background layer
      if (a.type === 'frame' && b.type !== 'frame') return -1;
      if (b.type === 'frame' && a.type !== 'frame') return 1;

      // Primary: zIndex ascending
      const zA = a.zIndex || 10;
      const zB = b.zIndex || 10;
      if (zA !== zB) return zA - zB;

      // Secondary: larger area rendered first (in background), smaller area rendered in front
      const areaA = a.width * a.height;
      const areaB = b.width * b.height;
      return areaB - areaA;
    });

  // Background class
  const gridClass =
    gridMode === 'dots'
      ? 'canvas-dots'
      : gridMode === 'grid'
      ? 'canvas-grid'
      : isDark
      ? 'bg-[#1E1E1E]'
      : 'bg-white';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${gridClass} ${
        activeTool === 'hand' || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Canvas Viewport Transformation Container */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* SVG Layer for Connectors, Pens & Rubberband Lines */}
        <svg className="absolute inset-0 w-[8000px] h-[8000px] overflow-visible pointer-events-none">
          {connectors.map((conn) => (
            <ConnectorRenderer
              key={conn.id}
              connector={conn}
              allElements={elements}
              isSelected={selectedIds.includes(conn.id)}
              theme={theme}
              isEditing={editingElementId === conn.id}
              editingText={editingText}
              onEditingTextChange={setEditingText}
              onSaveTextEdit={handleSaveTextEdit}
              onCancelTextEdit={() => setEditingElementId(null)}
              onSelect={(e) => {
                e.stopPropagation();
                onSelectedIdsChange([conn.id]);
              }}
              onLabelDoubleClick={(e) => {
                e.stopPropagation();
                handleDoubleClickElement(conn);
              }}
              onStartBendDrag={(e, c) => {
                e.stopPropagation();
                setBendingConnectorId(c.id);
              }}
            />
          ))}

          {/* Freehand Pen elements */}
          {pens.map((pen) => {
            if (!pen.points || pen.points.length < 2) return null;
            const pathD = `M ${pen.points.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
            return (
              <path
                key={pen.id}
                d={pathD}
                fill="none"
                stroke={pen.style.strokeColor || (isDark ? '#E5E5E5' : '#18181B')}
                strokeWidth={pen.style.strokeWidth || 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectedIdsChange([pen.id]);
                }}
              />
            );
          })}

          {/* Live Rubberband connection while dragging from anchor */}
          {isConnecting && connectionStart && (() => {
            const fromEl = elements.find((e) => e.id === connectionStart.elementId);
            const startPt = fromEl ? getElementAnchor(fromEl, connectionStart.anchor) : { x: 0, y: 0 };
            const endPt = activeAnchorSnap ? activeAnchorSnap.point : currentConnectionPoint;
            const obstacles = elements.filter(
              (e) =>
                e.id !== connectionStart.elementId &&
                e.id !== activeAnchorSnap?.elementId &&
                e.type !== 'connector' &&
                e.type !== 'frame'
            );
            const previewPath = getConnectorPath(
              startPt,
              endPt,
              'orthogonal',
              connectionStart.anchor,
              activeAnchorSnap?.anchor,
              undefined,
              obstacles
            );
            const previewColor = isDark ? '#E5E5E5' : '#18181B';
            return (
              <g className="pointer-events-none">
                <defs>
                  <marker
                    id="preview-connecting-arrowhead"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill={previewColor} />
                  </marker>
                </defs>
                <path
                  d={previewPath}
                  fill="none"
                  stroke={previewColor}
                  strokeWidth={2}
                  markerEnd="url(#preview-connecting-arrowhead)"
                />
              </g>
            );
          })()}

          {/* Live Drawing Preview for Connector / Arrow: Real bended orthogonal path while dragging */}
          {isDrawing && activeTool === 'connector' && (() => {
            const startPt = connectorStartAnchor ? connectorStartAnchor.point : drawingStart;
            const endPt = activeAnchorSnap ? activeAnchorSnap.point : drawingCurrent;
            const obstacles = elements.filter(
              (e) =>
                e.id !== connectorStartAnchor?.elementId &&
                e.id !== activeAnchorSnap?.elementId &&
                e.type !== 'connector' &&
                e.type !== 'frame'
            );
            const previewPath = getConnectorPath(
              startPt,
              endPt,
              'orthogonal',
              connectorStartAnchor?.anchor,
              activeAnchorSnap?.anchor,
              undefined,
              obstacles
            );
            const previewColor = isDark ? '#E5E5E5' : '#18181B';

            return (
              <g className="pointer-events-none">
                <defs>
                  <marker
                    id="preview-arrowhead"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill={previewColor} />
                  </marker>
                </defs>
                <path
                  d={previewPath}
                  fill="none"
                  stroke={previewColor}
                  strokeWidth={2}
                  markerEnd="url(#preview-arrowhead)"
                />
              </g>
            );
          })()}

          {/* Magnetic Anchor Snap Rings & Highlights */}
          {activeAnchorSnap && (
            <g className="pointer-events-none">
              <circle
                cx={activeAnchorSnap.point.x}
                cy={activeAnchorSnap.point.y}
                r={10}
                fill="none"
                stroke={isDark ? '#9CA3AF' : '#6B7280'}
                strokeWidth={1.5}
                opacity={0.7}
              />
              <circle
                cx={activeAnchorSnap.point.x}
                cy={activeAnchorSnap.point.y}
                r={3.5}
                fill={isDark ? '#D4D4D8' : '#4B5563'}
                stroke={isDark ? '#1E1E1E' : '#FFFFFF'}
                strokeWidth={1.5}
              />
            </g>
          )}

          {isDrawing && activeTool === 'connector' && connectorStartAnchor && (
            <circle
              cx={connectorStartAnchor.point.x}
              cy={connectorStartAnchor.point.y}
              r={3.5}
              fill={isDark ? '#D4D4D8' : '#4B5563'}
              stroke={isDark ? '#1E1E1E' : '#FFFFFF'}
              strokeWidth={1.5}
            />
          )}

          {/* Live Drawing Preview for Pen */}
          {isDrawing && activeTool === 'pen' && penPoints.length > 1 && (
            <path
              d={`M ${penPoints.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
              fill="none"
              stroke={isDark ? '#E5E5E5' : '#18181B'}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((el) => (
          <ElementRenderer
            key={el.id}
            element={el}
            isSelected={selectedIds.includes(el.id)}
            isHovered={hoveredElementId === el.id}
            theme={theme}
            isConnectorToolActive={activeTool === 'connector'}
            isEditing={editingElementId === el.id}
            editingField={editingField}
            editingText={editingText}
            onEditingTextChange={setEditingText}
            onSaveTextEdit={handleSaveTextEdit}
            onCancelTextEdit={() => setEditingElementId(null)}
            onStartEditSubtitle={() => handleDoubleClickElement(el, 'subtitle')}
            onStartEditTitle={() => handleDoubleClickElement(el, 'title')}
            onSelect={(e) => handleElementMouseDown(e, el)}
            onStartResize={(e, handle) => handleStartResize(e, el, handle)}
            onStartAnchorConnect={(e, anchor) => {
              if (isConnecting) {
                handleEndAnchorConnect(el, anchor);
              } else {
                handleStartAnchorConnect(e, el, anchor);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleDoubleClickElement(el, 'title');
            }}
          />
        ))}

        {/* Live Drawing Ghost Preview for Shapes and Text */}
        {isDrawing && activeTool !== 'connector' && activeTool !== 'pen' && (
          (() => {
            const minX = Math.min(drawingStart.x, drawingCurrent.x);
            const minY = Math.min(drawingStart.y, drawingCurrent.y);
            const w = Math.max(Math.abs(drawingCurrent.x - drawingStart.x), 2);
            const h = Math.max(Math.abs(drawingCurrent.y - drawingStart.y), 2);

            if (activeTool === 'circle') {
              return (
                <div
                  className="absolute border-2 border-neutral-500 dark:border-neutral-400 bg-neutral-500/10 dark:bg-white/5 rounded-full pointer-events-none"
                  style={{
                    left: `${minX}px`,
                    top: `${minY}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                  }}
                />
              );
            }
            if (activeTool === 'diamond') {
              return (
                <div
                  className="absolute border-2 border-neutral-500 dark:border-neutral-400 bg-neutral-500/10 dark:bg-white/5 pointer-events-none"
                  style={{
                    left: `${minX}px`,
                    top: `${minY}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  }}
                />
              );
            }
            if (activeTool === 'text') {
              return (
                <div
                  className="absolute border-2 border-dashed border-neutral-400 dark:border-neutral-500 bg-neutral-500/5 rounded-lg flex items-center justify-center pointer-events-none text-xs font-mono text-neutral-600 dark:text-neutral-400 px-2 text-center"
                  style={{
                    left: `${minX}px`,
                    top: `${minY}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                  }}
                >
                  {w > 60 && h > 24 ? 'Type text...' : ''}
                </div>
              );
            }
            if (activeTool === 'sticky') {
              return (
                <div
                  className="absolute border-2 border-amber-400 bg-amber-200/20 rounded-md pointer-events-none"
                  style={{
                    left: `${minX}px`,
                    top: `${minY}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                  }}
                />
              );
            }
            return (
              <div
                className={`absolute border-2 ${
                  activeTool === 'frame'
                    ? 'border-dashed border-neutral-400 dark:border-neutral-500 bg-neutral-500/5'
                    : 'border-neutral-500 dark:border-neutral-400 bg-neutral-500/10 dark:bg-white/5'
                } rounded-lg pointer-events-none`}
                style={{
                  left: `${minX}px`,
                  top: `${minY}px`,
                  width: `${w}px`,
                  height: `${h}px`,
                }}
              />
            );
          })()
        )}

        {/* Marquee Selection Rectangle */}
        {isMarquee && (
          <div
            className="absolute border border-neutral-500 dark:border-neutral-400 bg-neutral-500/10 dark:bg-white/5 pointer-events-none"
            style={{
              left: `${Math.min(marqueeStart.x, marqueeCurrent.x)}px`,
              top: `${Math.min(marqueeStart.y, marqueeCurrent.y)}px`,
              width: `${Math.abs(marqueeCurrent.x - marqueeStart.x)}px`,
              height: `${Math.abs(marqueeCurrent.y - marqueeStart.y)}px`,
            }}
          />
        )}


      </div>
    </div>
  );
};
