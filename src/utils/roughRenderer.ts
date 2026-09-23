import rough from 'roughjs';

// Rough.js generator instance helper
const rc = rough.generator();

export interface RoughShapeConfig {
  roughness: number;
  fill?: string;
  stroke: string;
  strokeWidth: number;
  fillStyle?: 'solid' | 'hachure' | 'zigzag' | 'cross-hatch' | 'dots';
  strokeLineDash?: number[];
}

export function generateRoughRect(
  x: number,
  y: number,
  width: number,
  height: number,
  config: RoughShapeConfig
) {
  return rc.rectangle(x, y, width, height, {
    roughness: config.roughness,
    stroke: config.stroke,
    strokeWidth: config.strokeWidth,
    fill: config.fill && config.fill !== 'transparent' ? config.fill : undefined,
    fillStyle: 'solid',
    strokeLineDash: config.strokeLineDash,
  });
}

export function generateRoughEllipse(
  cx: number,
  cy: number,
  width: number,
  height: number,
  config: RoughShapeConfig
) {
  return rc.ellipse(cx, cy, width, height, {
    roughness: config.roughness,
    stroke: config.stroke,
    strokeWidth: config.strokeWidth,
    fill: config.fill && config.fill !== 'transparent' ? config.fill : undefined,
    fillStyle: 'solid',
    strokeLineDash: config.strokeLineDash,
  });
}

export function generateRoughPolygon(
  points: [number, number][],
  config: RoughShapeConfig
) {
  return rc.polygon(points, {
    roughness: config.roughness,
    stroke: config.stroke,
    strokeWidth: config.strokeWidth,
    fill: config.fill && config.fill !== 'transparent' ? config.fill : undefined,
    fillStyle: 'solid',
    strokeLineDash: config.strokeLineDash,
  });
}

export function generateRoughPath(
  d: string,
  config: RoughShapeConfig
) {
  return rc.path(d, {
    roughness: config.roughness,
    stroke: config.stroke,
    strokeWidth: config.strokeWidth,
    fill: config.fill && config.fill !== 'transparent' ? config.fill : undefined,
    fillStyle: 'solid',
    strokeLineDash: config.strokeLineDash,
  });
}
