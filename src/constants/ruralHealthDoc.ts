import { EraserDocument, CanvasElement, ElementStyle } from '../types/canvas';

const style = (
  strokeColor: string,
  fillColor: string,
  textColor = '#0F172A',
  fontSize = 14
): ElementStyle => ({
  fillColor,
  strokeColor,
  strokeWidth: 1.5,
  strokeStyle: 'solid',
  roughness: 0,
  textColor,
  fontSize,
  fontFamily: 'sans',
  textAlign: 'left',
  opacity: 1,
});

const card = (
  id: string,
  x: number,
  y: number,
  text: string,
  subtitle: string,
  strokeColor: string,
  fillColor: string,
  width = 250
): CanvasElement => ({
  id,
  type: 'rounded-rect',
  x,
  y,
  width,
  height: 112,
  text,
  subtitle,
  style: style(strokeColor, fillColor),
  zIndex: 10,
});

const frame = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  frameTitle: string,
  strokeColor: string
): CanvasElement => ({
  id,
  type: 'frame',
  x,
  y,
  width,
  height,
  frameTitle,
  style: style(strokeColor, `${strokeColor}0d`, '#0F172A', 12),
  zIndex: 1,
});

const connector = (
  id: string,
  fromId: string,
  toId: string,
  label: string,
  strokeColor: string,
  fromAnchor: 'top' | 'right' | 'bottom' | 'left' = 'right',
  toAnchor: 'top' | 'right' | 'bottom' | 'left' = 'left'
): CanvasElement => ({
  id,
  type: 'connector',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fromId,
  fromAnchor,
  toId,
  toAnchor,
  routing: 'orthogonal',
  arrowEnd: true,
  connectorLabel: label,
  style: style(strokeColor, 'transparent', strokeColor, 10),
  zIndex: 5,
});

const phase0 = '#F97316';
const phase1 = '#16A34A';
const phase2 = '#2563EB';
const phase3 = '#9333EA';
const slate = '#64748B';

export const STARTER_RURAL_HEALTH_DOCUMENT: EraserDocument = {
  id: 'starter-rural-health',
  title: 'Rural Health Offline Care — MVP to v2',
  viewMode: 'canvas',
  theme: 'light',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  content: `# Rural Health Offline Care — MVP to v2

## Build order
An offline-first field-care platform for ASHA workers: capture symptoms and vitals without connectivity, apply deterministic IMCI rules, issue a referral ticket, and sync outcomes when connectivity returns.

## Phase 0 — Foundation
- Offline SQLite shell with a RED-priority sync queue.
- DPDP consent in local languages, SQLCipher storage, and a hash-chained audit log.
- WHO IMCI rules for pneumonia/ARI, diarrhea, fever-malaria, malnutrition, and obstetric danger signs.
- Vernacular constrained-vocabulary voice input with icon-tap fallback.

## Phase 1 — Field vitals and referral
ESP32 BLE vitals (SpO2, heart rate, temperature), voice-digitized MUAC with WHO cutoffs, GSM-7 referral tickets, and a PHC priority dashboard with outcome feedback.

## Phase 2 — Navigation and dispatch
Preloaded MBTiles and offline routing, capability-tagged facilities, nearest-capable dispatch, and household coverage radar.

## Phase 3 — AI polish
Cough-sound risk feature as an IMCI augment, template-first referral note generation, and one stretch module such as LoRa, cold-chain monitoring, IVRS, or training mode.

## Demo gate
Airplane mode → worker taps/speaks symptoms → RED/YELLOW/GREEN → consent and audit entry → MUAC referral → SMS gateway → offline route → dashboard sync → doctor acceptance → outcome.

## Safety principles
The rules engine makes the safety call. AI is only a screening or writing aid. Photo-MUAC is explicitly excluded, and real-data collection requires IRB review.
`,
  canvasSettings: {
    grid: 'dots',
    roughStyle: false,
    zoom: 0.7,
    pan: { x: 45, y: 35 },
    snapToGrid: true,
  },
  elements: [
    frame('rh-main', 30, 30, 1780, 1110, 'RURAL HEALTH OFFLINE CARE · 8-WEEK BUILD PLAN', '#CBD5E1'),
    frame('rh-p0', 60, 105, 390, 750, 'PHASE 0 · FOUNDATION · W1–2', phase0),
    frame('rh-p1', 480, 105, 390, 750, 'PHASE 1 · VITALS + REFERRAL · W2–4', phase1),
    frame('rh-p2', 900, 105, 390, 750, 'PHASE 2 · NAVIGATION + DISPATCH · W4–6', phase2),
    frame('rh-p3', 1320, 105, 430, 750, 'PHASE 3 · AI POLISH + STRETCH · W6–8', phase3),

    card('rh-shell', 85, 155, '1 · Offline core app shell', 'Flutter/Kotlin · SQLite · RED-priority sync queue · airplane-mode proof', phase0, '#FFF7ED'),
    card('rh-consent', 85, 295, '2 · DPDP compliance layer', 'Local-language consent · SQLCipher · hash-chained audit log', phase0, '#FFF7ED'),
    card('rh-rules', 85, 435, '3 · IMCI rules engine', 'Five disease clusters · instant-RED safety net · deterministic triage', phase0, '#FFF7ED'),
    card('rh-voice', 85, 575, '4 · Vernacular voice v1', 'Constrained ASR · 10–20 symptoms · icon-tap fallback', phase0, '#FFF7ED'),

    card('rh-vitals', 505, 155, '5 · ESP32 vitals bridge', 'MAX30102 + MLX90614 → BLE → SpO2, HR, temperature', phase1, '#F0FDF4'),
    card('rh-muac', 505, 295, '6 · MUAC voice digitizer', 'ASHA reads tape aloud · WHO cutoff · SAM referral', phase1, '#F0FDF4'),
    card('rh-ticket', 505, 435, '7 · Referral ticket + SMS', 'GSM-7 compressed ticket · gateway phone · ACCEPT/REJECT', phase1, '#F0FDF4'),
    card('rh-dashboard', 505, 575, '8 · PHC dashboard v1', 'Priority queue · acknowledgement · outcome feedback loop', phase1, '#F0FDF4'),

    card('rh-maps', 925, 155, '9 · Offline maps', 'MBTiles for one district · GraphHopper · local-language guidance', phase2, '#EFF6FF'),
    card('rh-facilities', 925, 295, '10 · Capability map', 'PHC/CHC/DH register · delivery · blood bank · NRC · 24×7', phase2, '#EFF6FF'),
    card('rh-dispatch', 925, 435, '11 · Capable dispatch', 'Triage × capability × travel time · PENDING → OUTCOME', phase2, '#EFF6FF'),
    card('rh-coverage', 925, 575, '12 · Household coverage', 'GPS households · visited/unvisited · 2 km cluster radar', phase2, '#EFF6FF'),

    card('rh-cough', 1345, 155, '13 · Cough-sound AI', 'YAMNet + tiny TFLite head · risk feature, never a verdict', phase3, '#FAF5FF'),
    card('rh-notes', 1345, 295, '14 · Referral note generator', 'Template + quantized LLM · local language + English · QR link', phase3, '#FAF5FF'),
    card('rh-stretch', 1345, 435, '15 · Pick one stretch', 'LoRa mesh · cold-chain · IVRS · simulation/training mode', phase3, '#FAF5FF'),

    card('rh-gate', 220, 905, 'PHASE 0 GATE · judge-ready proof', 'Offline symptoms → RED/YELLOW/GREEN → consent → audit tamper-check', slate, '#F8FAFC', 360),
    card('rh-demo', 680, 905, '4-MINUTE DEMO ARC', 'Airplane mode → vitals → MUAC → SMS → map → sync → doctor outcome', slate, '#F8FAFC', 360),
    card('rh-safety', 1140, 905, 'NON-NEGOTIABLES', 'Rules engine calls safety; AI augments. Never photo-MUAC. IRB for real data.', slate, '#F8FAFC', 430),

    connector('rh-c1', 'rh-shell', 'rh-consent', 'secure local state', phase0, 'bottom', 'top'),
    connector('rh-c2', 'rh-consent', 'rh-rules', 'audited triage', phase0, 'bottom', 'top'),
    connector('rh-c3', 'rh-rules', 'rh-voice', 'symptoms → flags', phase0, 'bottom', 'top'),
    connector('rh-c4', 'rh-voice', 'rh-ticket', 'capture referral', phase1),
    connector('rh-c5', 'rh-rules', 'rh-ticket', 'RED/YELLOW/GREEN', phase1),
    connector('rh-c6', 'rh-vitals', 'rh-ticket', 'auto-fill vitals', phase1),
    connector('rh-c7', 'rh-muac', 'rh-ticket', 'SAM referral', phase1),
    connector('rh-c8', 'rh-ticket', 'rh-dashboard', 'SMS + sync', phase1, 'bottom', 'top'),
    connector('rh-c9', 'rh-dashboard', 'rh-dispatch', 'priority queue', phase2),
    connector('rh-c10', 'rh-maps', 'rh-dispatch', 'travel time', phase2, 'bottom', 'top'),
    connector('rh-c11', 'rh-facilities', 'rh-dispatch', 'capability match', phase2, 'bottom', 'top'),
    connector('rh-c12', 'rh-dispatch', 'rh-coverage', 'field outcome', phase2, 'bottom', 'top'),
    connector('rh-c13', 'rh-cough', 'rh-rules', 'risk feature', phase3, 'left', 'right'),
    connector('rh-c14', 'rh-dashboard', 'rh-notes', 'referral context', phase3),
    connector('rh-g1', 'rh-rules', 'rh-gate', 'gate', slate, 'bottom', 'top'),
    connector('rh-g2', 'rh-ticket', 'rh-demo', 'demo path', slate, 'bottom', 'top'),
    connector('rh-g3', 'rh-dispatch', 'rh-safety', 'guardrails', slate, 'bottom', 'top'),
  ],
};
