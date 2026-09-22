import { AnchorPosition, CanvasElement, Point } from '../types/canvas';

export function getElementAnchor(element: CanvasElement, anchor: AnchorPosition): Point {
  const { x, y, width, height } = element;
  switch (anchor) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
    case 'center':
    default:
      return { x: x + width / 2, y: y + height / 2 };
  }
}

export function getClosestAnchor(element: CanvasElement, targetPoint: Point): { anchor: AnchorPosition; point: Point } {
  const anchors: AnchorPosition[] = ['top', 'right', 'bottom', 'left'];
  let closestAnchor: AnchorPosition = 'top';
  let minDistance = Infinity;
  let closestPoint = getElementAnchor(element, 'top');

  for (const a of anchors) {
    const pt = getElementAnchor(element, a);
    const dist = Math.hypot(pt.x - targetPoint.x, pt.y - targetPoint.y);
    if (dist < minDistance) {
      minDistance = dist;
      closestAnchor = a;
      closestPoint = pt;
    }
  }

  return { anchor: closestAnchor, point: closestPoint };
}

export function snapToGrid(value: number, gridSize = 16): number {
  return Math.round(value / gridSize) * gridSize;
}

export interface ObstacleBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Extract expanded bounding boxes of obstacle elements on the canvas
 */
export function getObstacleBoxes(elements: CanvasElement[], margin = 18): ObstacleBox[] {
  const boxes: ObstacleBox[] = [];
  for (const el of elements) {
    if (el.type === 'connector' || el.type === 'pen' || el.type === 'frame') continue;
    if (el.width <= 10 || el.height <= 10) continue;
    boxes.push({
      minX: el.x - margin,
      maxX: el.x + el.width + margin,
      minY: el.y - margin,
      maxY: el.y + el.height + margin,
    });
  }
  return mergeOverlappingBoxes(boxes);
}

/**
 * Merge overlapping or contiguous obstacle boxes
 */
export function mergeOverlappingBoxes(boxes: ObstacleBox[]): ObstacleBox[] {
  if (boxes.length <= 1) return boxes;
  const merged: ObstacleBox[] = [];
  const used = new Set<number>();

  for (let i = 0; i < boxes.length; i++) {
    if (used.has(i)) continue;
    const current = { ...boxes[i] };
    let changed = true;

    while (changed) {
      changed = false;
      for (let j = 0; j < boxes.length; j++) {
        if (i === j || used.has(j)) continue;
        const other = boxes[j];
        if (
          current.minX <= other.maxX &&
          current.maxX >= other.minX &&
          current.minY <= other.maxY &&
          current.maxY >= other.minY
        ) {
          current.minX = Math.min(current.minX, other.minX);
          current.maxX = Math.max(current.maxX, other.maxX);
          current.minY = Math.min(current.minY, other.minY);
          current.maxY = Math.max(current.maxY, other.maxY);
          used.add(j);
          changed = true;
        }
      }
    }
    merged.push(current);
  }
  return merged;
}

/**
 * Check if a horizontal or vertical line segment intersects an obstacle box
 */
function segmentIntersectsBox(p1: Point, p2: Point, box: ObstacleBox): boolean {
  if (Math.abs(p1.y - p2.y) < 0.5) {
    const y = p1.y;
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    return y > box.minY && y < box.maxY && minX < box.maxX && maxX > box.minX;
  }
  if (Math.abs(p1.x - p2.x) < 0.5) {
    const x = p1.x;
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    return x > box.minX && x < box.maxX && minY < box.maxY && maxY > box.minY;
  }
  return false;
}

/**
 * Remove duplicate and collinear points
 */
function simplifyPoints(pts: Point[]): Point[] {
  if (pts.length <= 2) return pts;
  const filtered: Point[] = [pts[0]];

  for (let i = 1; i < pts.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = pts[i];
    if (Math.hypot(curr.x - prev.x, curr.y - prev.y) > 0.5) {
      filtered.push(curr);
    }
  }

  if (filtered.length <= 2) return filtered;

  const simplified: Point[] = [filtered[0]];
  for (let i = 1; i < filtered.length - 1; i++) {
    const pPrev = simplified[simplified.length - 1];
    const pCurr = filtered[i];
    const pNext = filtered[i + 1];

    const isHorizontalCollinear =
      Math.abs(pPrev.y - pCurr.y) < 0.5 && Math.abs(pCurr.y - pNext.y) < 0.5;
    const isVerticalCollinear =
      Math.abs(pPrev.x - pCurr.x) < 0.5 && Math.abs(pCurr.x - pNext.x) < 0.5;

    if (!isHorizontalCollinear && !isVerticalCollinear) {
      simplified.push(pCurr);
    }
  }
  simplified.push(filtered[filtered.length - 1]);
  return simplified;
}

/**
 * Convert points to SVG path with smooth rounded corners
 */
export function pointsToSvgPath(points: Point[], cornerRadius = 6): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2 || cornerRadius <= 0) {
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const d2 = Math.hypot(next.x - curr.x, next.y - curr.y);

    const r = Math.min(cornerRadius, d1 / 2, d2 / 2);

    if (r < 1) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const beforeX = curr.x - (curr.x - prev.x) * (r / d1);
    const beforeY = curr.y - (curr.y - prev.y) * (r / d1);
    const afterX = curr.x + (next.x - curr.x) * (r / d2);
    const afterY = curr.y + (next.y - curr.y) * (r / d2);

    d += ` L ${beforeX} ${beforeY} Q ${curr.x} ${curr.y} ${afterX} ${afterY}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

/**
 * Route points around obstacle boxes
 */
function avoidObstacles(points: Point[], obstacleBoxes: ObstacleBox[], targetEnd: Point): Point[] {
  if (obstacleBoxes.length === 0) return points;

  const result: Point[] = [points[0]];

  for (let i = 0; i < points.length - 1; i++) {
    const currentStart = result[result.length - 1];
    const currentEnd = points[i + 1];

    const intersectingBoxes = obstacleBoxes.filter(box =>
      segmentIntersectsBox(currentStart, currentEnd, box)
    );

    if (intersectingBoxes.length === 0) {
      result.push(currentEnd);
      continue;
    }

    const isHorizontal = Math.abs(currentStart.y - currentEnd.y) < 0.5;

    if (isHorizontal) {
      const goingRight = currentStart.x < currentEnd.x;
      intersectingBoxes.sort((a, b) =>
        goingRight ? a.minX - b.minX : b.maxX - a.maxX
      );

      let segStart = currentStart;
      for (const box of intersectingBoxes) {
        const detourTopDist = Math.abs(segStart.y - box.minY);
        const detourBottomDist = Math.abs(segStart.y - box.maxY);
        const detourTopBias = Math.abs(targetEnd.y - box.minY);
        const detourBottomBias = Math.abs(targetEnd.y - box.maxY);

        const preferTop = (detourTopDist + detourTopBias) <= (detourBottomDist + detourBottomBias);
        const detourY = preferTop ? box.minY : box.maxY;

        if (goingRight) {
          result.push({ x: box.minX, y: segStart.y });
          result.push({ x: box.minX, y: detourY });
          result.push({ x: box.maxX, y: detourY });
          result.push({ x: box.maxX, y: segStart.y });
          segStart = { x: box.maxX, y: segStart.y };
        } else {
          result.push({ x: box.maxX, y: segStart.y });
          result.push({ x: box.maxX, y: detourY });
          result.push({ x: box.minX, y: detourY });
          result.push({ x: box.minX, y: segStart.y });
          segStart = { x: box.minX, y: segStart.y };
        }
      }
      result.push(currentEnd);
    } else {
      const goingDown = currentStart.y < currentEnd.y;
      intersectingBoxes.sort((a, b) =>
        goingDown ? a.minY - b.minY : b.maxY - a.maxY
      );

      let segStart = currentStart;
      for (const box of intersectingBoxes) {
        const detourLeftDist = Math.abs(segStart.x - box.minX);
        const detourRightDist = Math.abs(segStart.x - box.maxX);
        const detourLeftBias = Math.abs(targetEnd.x - box.minX);
        const detourRightBias = Math.abs(targetEnd.x - box.maxX);

        const preferLeft = (detourLeftDist + detourLeftBias) <= (detourRightDist + detourRightBias);
        const detourX = preferLeft ? box.minX : box.maxX;

        if (goingDown) {
          result.push({ x: segStart.x, y: box.minY });
          result.push({ x: detourX, y: box.minY });
          result.push({ x: detourX, y: box.maxY });
          result.push({ x: segStart.x, y: box.maxY });
          segStart = { x: segStart.x, y: box.maxY };
        } else {
          result.push({ x: segStart.x, y: box.maxY });
          result.push({ x: detourX, y: box.maxY });
          result.push({ x: detourX, y: box.minY });
          result.push({ x: segStart.x, y: box.minY });
          segStart = { x: segStart.x, y: box.minY };
        }
      }
      result.push(currentEnd);
    }
  }

  return result;
}

export function calculateOrthogonalPath(
  start: Point,
  end: Point,
  fromAnchor?: AnchorPosition,
  toAnchor?: AnchorPosition,
  bendPoint?: Point,
  obstacles?: CanvasElement[]
): string {
  // If points are very close, direct line
  if (Math.hypot(start.x - end.x, start.y - end.y) < 20) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  // If user provided custom bend waypoint, respect their placement
  if (bendPoint) {
    const isHorizontal =
      fromAnchor === 'right' || fromAnchor === 'left' ||
      toAnchor === 'right' || toAnchor === 'left';
    let manualPts: Point[];
    if (isHorizontal) {
      manualPts = [start, { x: bendPoint.x, y: start.y }, { x: bendPoint.x, y: end.y }, end];
    } else {
      manualPts = [start, { x: start.x, y: bendPoint.y }, { x: end.x, y: bendPoint.y }, end];
    }
    return pointsToSvgPath(simplifyPoints(manualPts), 6);
  }

  // Anchor stubs
  const STUB = 16;
  let pStart = { ...start };
  let pEnd = { ...end };

  if (fromAnchor === 'right') pStart = { x: start.x + STUB, y: start.y };
  else if (fromAnchor === 'left') pStart = { x: start.x - STUB, y: start.y };
  else if (fromAnchor === 'top') pStart = { x: start.x, y: start.y - STUB };
  else if (fromAnchor === 'bottom') pStart = { x: start.x, y: start.y + STUB };

  if (toAnchor === 'right') pEnd = { x: end.x + STUB, y: end.y };
  else if (toAnchor === 'left') pEnd = { x: end.x - STUB, y: end.y };
  else if (toAnchor === 'top') pEnd = { x: end.x, y: end.y - STUB };
  else if (toAnchor === 'bottom') pEnd = { x: end.x, y: end.y + STUB };

  const isStartHorizontal = fromAnchor === 'left' || fromAnchor === 'right';
  const isStartVertical = fromAnchor === 'top' || fromAnchor === 'bottom';
  const isEndHorizontal = toAnchor === 'left' || toAnchor === 'right';
  const isEndVertical = toAnchor === 'top' || toAnchor === 'bottom';

  let initialWaypoints: Point[] = [];

  if (fromAnchor && toAnchor) {
    if (isStartHorizontal && isEndHorizontal) {
      if ((fromAnchor === 'right' && toAnchor === 'left' && pStart.x <= pEnd.x) ||
          (fromAnchor === 'left' && toAnchor === 'right' && pStart.x >= pEnd.x)) {
        const midX = (pStart.x + pEnd.x) / 2;
        initialWaypoints = [start, pStart, { x: midX, y: pStart.y }, { x: midX, y: pEnd.y }, pEnd, end];
      } else {
        const midY = (pStart.y + pEnd.y) / 2;
        initialWaypoints = [start, pStart, { x: pStart.x, y: midY }, { x: pEnd.x, y: midY }, pEnd, end];
      }
    } else if (isStartVertical && isEndVertical) {
      if ((fromAnchor === 'bottom' && toAnchor === 'top' && pStart.y <= pEnd.y) ||
          (fromAnchor === 'top' && toAnchor === 'bottom' && pStart.y >= pEnd.y)) {
        const midY = (pStart.y + pEnd.y) / 2;
        initialWaypoints = [start, pStart, { x: pStart.x, y: midY }, { x: pEnd.x, y: midY }, pEnd, end];
      } else {
        const midX = (pStart.x + pEnd.x) / 2;
        initialWaypoints = [start, pStart, { x: midX, y: pStart.y }, { x: midX, y: pEnd.y }, pEnd, end];
      }
    } else if (isStartHorizontal && isEndVertical) {
      initialWaypoints = [start, pStart, { x: pEnd.x, y: pStart.y }, pEnd, end];
    } else if (isStartVertical && isEndHorizontal) {
      initialWaypoints = [start, pStart, { x: pStart.x, y: pEnd.y }, pEnd, end];
    } else {
      const midX = (pStart.x + pEnd.x) / 2;
      initialWaypoints = [start, pStart, { x: midX, y: pStart.y }, { x: midX, y: pEnd.y }, pEnd, end];
    }
  } else {
    const isHorizontal = fromAnchor
      ? fromAnchor === 'right' || fromAnchor === 'left'
      : toAnchor
      ? toAnchor === 'right' || toAnchor === 'left'
      : Math.abs(start.x - end.x) >= Math.abs(start.y - end.y);

    if (isHorizontal) {
      const midX = (start.x + end.x) / 2;
      initialWaypoints = [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
    } else {
      const midY = (start.y + end.y) / 2;
      initialWaypoints = [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
    }
  }

  // Filter obstacle boxes: ignore boxes that directly contain start or end
  const allBoxes = getObstacleBoxes(obstacles || []);
  const validBoxes = allBoxes.filter(
    box => !(start.x >= box.minX && start.x <= box.maxX && start.y >= box.minY && start.y <= box.maxY) &&
           !(end.x >= box.minX && end.x <= box.maxX && end.y >= box.minY && end.y <= box.maxY)
  );

  const cleanInitial = simplifyPoints(initialWaypoints);
  const routedWaypoints = avoidObstacles(cleanInitial, validBoxes, end);
  return pointsToSvgPath(simplifyPoints(routedWaypoints), 6);
}

export function calculateCurvedPath(start: Point, end: Point, bendPoint?: Point): string {
  if (bendPoint) {
    return `M ${start.x} ${start.y} Q ${bendPoint.x} ${bendPoint.y}, ${end.x} ${end.y}`;
  }
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const cx1 = start.x + dx * 0.5;
  const cy1 = start.y;
  const cx2 = start.x + dx * 0.5;
  const cy2 = end.y;

  return `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;
}

export function getConnectorPath(
  start: Point,
  end: Point,
  routing: 'orthogonal' | 'curved' | 'straight' = 'orthogonal',
  fromAnchor?: AnchorPosition,
  toAnchor?: AnchorPosition,
  bendPoint?: Point,
  obstacles?: CanvasElement[]
): string {
  if (routing === 'straight') {
    if (bendPoint) {
      return `M ${start.x} ${start.y} L ${bendPoint.x} ${bendPoint.y} L ${end.x} ${end.y}`;
    }
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }
  if (routing === 'curved') {
    return calculateCurvedPath(start, end, bendPoint);
  }
  return calculateOrthogonalPath(start, end, fromAnchor, toAnchor, bendPoint, obstacles);
}

export function getMidPoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

export function isPointInElement(pt: Point, el: CanvasElement): boolean {
  return (
    pt.x >= el.x &&
    pt.x <= el.x + el.width &&
    pt.y >= el.y &&
    pt.y <= el.y + el.height
  );
}

export function getBoundingBox(elements: CanvasElement[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    if (el.type === 'connector' && el.startPoint && el.endPoint) {
      minX = Math.min(minX, el.startPoint.x, el.endPoint.x);
      minY = Math.min(minY, el.startPoint.y, el.endPoint.y);
      maxX = Math.max(maxX, el.startPoint.x, el.endPoint.x);
      maxY = Math.max(maxY, el.startPoint.y, el.endPoint.y);
    } else {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export interface NearbyAnchorResult {
  elementId: string;
  anchor: AnchorPosition;
  point: Point;
  element: CanvasElement;
  distance: number;
}

/**
 * Finds the nearest anchor point of any block within threshold distance
 */
export function findNearbyAnchor(
  elements: CanvasElement[],
  point: Point,
  threshold = 36,
  excludeElementId?: string | null
): NearbyAnchorResult | null {
  let closest: NearbyAnchorResult | null = null;
  let minDistance = threshold;

  const validNodes = elements.filter(
    (el) =>
      el.type !== 'connector' &&
      el.type !== 'pen' &&
      (!excludeElementId || el.id !== excludeElementId)
  );

  for (const el of validNodes) {
    const anchors: AnchorPosition[] = ['top', 'right', 'bottom', 'left'];
    for (const a of anchors) {
      const pt = getElementAnchor(el, a);
      const dist = Math.hypot(pt.x - point.x, pt.y - point.y);
      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          elementId: el.id,
          anchor: a,
          point: pt,
          element: el,
          distance: dist,
        };
      }
    }

    // Also check if point is inside the element body
    if (isPointInElement(point, el)) {
      const { anchor: a, point: pt } = getClosestAnchor(el, point);
      const dist = Math.hypot(pt.x - point.x, pt.y - point.y);
      if (!closest || dist < closest.distance) {
        closest = {
          elementId: el.id,
          anchor: a,
          point: pt,
          element: el,
          distance: dist,
        };
      }
    }
  }

  return closest;
}
