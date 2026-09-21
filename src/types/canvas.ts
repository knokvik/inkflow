export type ElementType =
  | 'rectangle'
  | 'rounded-rect'
  | 'circle'
  | 'diamond'
  | 'cylinder'
  | 'cloud'
  | 'capsule'
  | 'actor'
  | 'sticky'
  | 'text'
  | 'icon'
  | 'frame'
  | 'connector'
  | 'pen';

export type FontChoice = 'sans' | 'mono' | 'hand';
export type StrokeStyleChoice = 'solid' | 'dashed' | 'dotted';
export type RoutingChoice = 'orthogonal' | 'curved' | 'straight';
export type AnchorPosition = 'top' | 'right' | 'bottom' | 'left' | 'center';

export interface Point {
  x: number;
  y: number;
}

export interface ElementStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyleChoice;
  roughness: number; // 0: crisp vector, 1: light sketch, 2: rough hand-drawn
  textColor: string;
  fontSize: number;
  fontFamily: FontChoice;
  textAlign: 'left' | 'center' | 'right';
  opacity: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  text?: string;
  style: ElementStyle;
  
  // Subtitle / Specs note (as seen in Eraser boxes)
  subtitle?: string;
  tierTag?: string; // e.g. "01 - CLIENT / USER INTERFACES"
  
  // Sticky Note specific
  stickyColor?: 'yellow' | 'green' | 'pink' | 'purple' | 'blue' | 'orange';
  
  // Icon specific
  iconName?: string;
  iconCategory?: string;
  iconLabel?: string;
  
  // Frame / Group specific
  frameTitle?: string;
  childrenIds?: string[];
  
  // Connector specific
  fromId?: string | null;
  fromAnchor?: AnchorPosition;
  toId?: string | null;
  toAnchor?: AnchorPosition;
  startPoint?: Point;
  endPoint?: Point;
  bendPoint?: Point; // Custom draggable bend waypoint
  routing?: RoutingChoice;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  connectorLabel?: string;
  
  // Pen / Freehand specific
  points?: Point[];
  
  // Grouping & layer
  groupId?: string | null;
  zIndex: number;
  isLocked?: boolean;
  docTag?: string; // Links this node to a section in the document
}

export interface EraserDocument {
  id: string;
  title: string;
  content: string; // Markdown document text
  elements: CanvasElement[];
  viewMode: 'both' | 'split' | 'canvas' | 'doc';
  theme?: 'light' | 'dark';
  canvasSettings: {
    grid: 'dots' | 'grid' | 'none';
    roughStyle: boolean;
    zoom: number;
    pan: Point;
    snapToGrid: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

export type ToolType =
  | 'select'
  | 'hand'
  | 'rectangle'
  | 'rounded-rect'
  | 'circle'
  | 'diamond'
  | 'cylinder'
  | 'cloud'
  | 'capsule'
  | 'actor'
  | 'sticky'
  | 'text'
  | 'icon'
  | 'frame'
  | 'connector'
  | 'pen'
  | 'eraser';

export interface AIProviderConfig {
  provider: 'builtin' | 'ollama' | 'opencode' | 'antigravity' | 'custom' | 'openai' | 'gemini';
  endpoint: string;
  model: string;
  apiKey?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  suggestedAction?: {
    type: 'apply_diagram' | 'append_doc' | 'replace_all';
    label: string;
    elements?: CanvasElement[];
    docUpdate?: string;
  };
}
