import { CanvasElement, ElementStyle } from '../types/canvas';

const DEFAULT_STYLE: ElementStyle = {
  fillColor: '#242424',
  strokeColor: '#71717A',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 0,
  textColor: '#ECEFF4',
  fontSize: 14,
  fontFamily: 'sans',
  textAlign: 'center',
  opacity: 1,
};

export function serializeToEraserDSL(elements: CanvasElement[]): string {
  const lines: string[] = ['// Eraser Diagram-as-Code', ''];
  const nodes = elements.filter(e => e.type !== 'connector');
  const connectors = elements.filter(e => e.type === 'connector');

  // Serialize Nodes
  for (const node of nodes) {
    if (node.type === 'frame') {
      lines.push(`frame "${node.frameTitle || 'Group'}" {`);
      if (node.childrenIds && node.childrenIds.length > 0) {
        for (const childId of node.childrenIds) {
          const child = elements.find(e => e.id === childId);
          if (child) {
            lines.push(`  ${cleanId(child.id)}`);
          }
        }
      }
      lines.push(`}`);
      lines.push('');
      continue;
    }

    const id = cleanId(node.id);
    const attrs: string[] = [];
    if (node.type === 'icon' && node.iconName) {
      attrs.push(`icon: "${node.iconName}"`);
    } else {
      attrs.push(`type: "${node.type}"`);
    }
    const label = node.iconLabel || node.text || id;
    attrs.push(`label: "${label.replace(/"/g, '\\"')}"`);

    lines.push(`${id} [${attrs.join(', ')}]`);
  }

  lines.push('');
  lines.push('// Connections');

  // Serialize Connectors
  for (const conn of connectors) {
    if (conn.fromId && conn.toId) {
      const from = cleanId(conn.fromId);
      const to = cleanId(conn.toId);
      const attrs: string[] = [];
      if (conn.connectorLabel) {
        attrs.push(`label: "${conn.connectorLabel.replace(/"/g, '\\"')}"`);
      }
      if (conn.routing && conn.routing !== 'orthogonal') {
        attrs.push(`style: "${conn.routing}"`);
      }

      const attrStr = attrs.length > 0 ? ` [${attrs.join(', ')}]` : '';
      lines.push(`${from} > ${to}${attrStr}`);
    }
  }

  return lines.join('\n');
}

function cleanId(str: string): string {
  return str.replace(/[^a-zA-Z0-9_]/g, '_');
}

export function parseEraserDSL(dsl: string): CanvasElement[] {
  const elements: CanvasElement[] = [];
  const lines = dsl.split('\n');

  const nodeMap = new Map<string, CanvasElement>();
  let currentX = 100;
  let currentY = 100;
  const colSpacing = 220;
  const rowSpacing = 160;
  let colIndex = 0;
  let rowIndex = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) {
      continue;
    }

    // Connection: A > B [label: "foo"]
    const connMatch = line.match(/^([a-zA-Z0-9_-]+)\s*>\s*([a-zA-Z0-9_-]+)(?:\s*\[(.*)\])?$/);
    if (connMatch) {
      const from = connMatch[1];
      const to = connMatch[2];
      const attrStr = connMatch[3] || '';
      const labelMatch = attrStr.match(/label:\s*"([^"]+)"/);
      const label = labelMatch ? labelMatch[1] : undefined;

      const fromEl = nodeMap.get(from);
      const toEl = nodeMap.get(to);

      elements.push({
        id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: 'connector',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fromId: fromEl ? fromEl.id : from,
        fromAnchor: 'right',
        toId: toEl ? toEl.id : to,
        toAnchor: 'left',
        startPoint: fromEl ? { x: fromEl.x + fromEl.width, y: fromEl.y + fromEl.height / 2 } : { x: 100, y: 100 },
        endPoint: toEl ? { x: toEl.x, y: toEl.y + toEl.height / 2 } : { x: 300, y: 100 },
        routing: 'orthogonal',
        arrowEnd: true,
        connectorLabel: label,
        style: { ...DEFAULT_STYLE, strokeColor: '#71717A', strokeWidth: 2 },
        zIndex: 5,
      });
      continue;
    }

    // Node: ID [attrs...]
    const nodeMatch = line.match(/^([a-zA-Z0-9_-]+)(?:\s*\[(.*)\])?$/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      const attrStr = nodeMatch[2] || '';

      const iconMatch = attrStr.match(/icon:\s*"([^"]+)"/);
      const typeMatch = attrStr.match(/type:\s*"([^"]+)"/);
      const labelMatch = attrStr.match(/label:\s*"([^"]+)"/);

      const label = labelMatch ? labelMatch[1] : id.replace(/_/g, ' ');
      const iconName = iconMatch ? iconMatch[1] : undefined;
      const type = (iconName ? 'icon' : (typeMatch ? typeMatch[1] : 'rounded-rect')) as any;

      const x = currentX + colIndex * colSpacing;
      const y = currentY + rowIndex * rowSpacing;

      colIndex++;
      if (colIndex > 3) {
        colIndex = 0;
        rowIndex++;
      }

      const isIcon = type === 'icon';
      const el: CanvasElement = {
        id,
        type,
        x,
        y,
        width: isIcon ? 110 : 160,
        height: isIcon ? 100 : 70,
        text: isIcon ? undefined : label,
        iconName: iconName,
        iconLabel: isIcon ? label : undefined,
        style: {
          ...DEFAULT_STYLE,
          fillColor: isIcon ? '#242424' : '#262626',
          strokeColor: '#71717A',
        },
        zIndex: 10,
      };

      nodeMap.set(id, el);
      elements.push(el);
    }
  }

  // Update connector start and end points
  for (const el of elements) {
    if (el.type === 'connector' && el.fromId && el.toId) {
      const fromEl = nodeMap.get(el.fromId);
      const toEl = nodeMap.get(el.toId);
      if (fromEl && toEl) {
        el.fromId = fromEl.id;
        el.toId = toEl.id;
        el.startPoint = { x: fromEl.x + fromEl.width, y: fromEl.y + fromEl.height / 2 };
        el.endPoint = { x: toEl.x, y: toEl.y + toEl.height / 2 };
      }
    }
  }

  return elements;
}
