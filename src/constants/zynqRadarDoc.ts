import { EraserDocument, CanvasElement, ElementStyle } from '../types/canvas';

const style = (
  strokeColor: string,
  fillColor: string,
  textColor = '#0F172A',
  fontSize = 13,
  strokeStyle: 'solid' | 'dashed' = 'solid'
): ElementStyle => ({
  fillColor,
  strokeColor,
  strokeWidth: 1.8,
  strokeStyle,
  roughness: 0,
  textColor,
  fontSize,
  fontFamily: 'sans',
  textAlign: 'center',
  opacity: 1,
});

const node = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  subtitle: string,
  strokeColor: string,
  fillColor: string,
  textColor = '#0F172A',
  fontSize = 13,
  strokeStyle: 'solid' | 'dashed' = 'solid'
): CanvasElement => ({
  id,
  type: 'rounded-rect',
  x,
  y,
  width,
  height,
  text,
  subtitle,
  style: style(strokeColor, fillColor, textColor, fontSize, strokeStyle),
  zIndex: 10,
});

const conn = (
  id: string,
  fromId: string | undefined,
  toId: string | undefined,
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number },
  label = '',
  strokeStyle: 'solid' | 'dashed' = 'solid',
  strokeColor = '#0F275E'
): CanvasElement => ({
  id,
  type: 'connector',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fromId,
  toId,
  startPoint,
  endPoint,
  routing: 'orthogonal',
  arrowEnd: true,
  connectorLabel: label,
  style: {
    fillColor: 'transparent',
    strokeColor,
    strokeWidth: strokeStyle === 'dashed' ? 1.8 : 2,
    strokeStyle,
    roughness: 0,
    textColor: '#1E293B',
    fontSize: 10.5,
    fontFamily: 'sans',
    textAlign: 'center',
    opacity: 1,
  },
  zIndex: 5,
});

export const STARTER_ZYNQ_RADAR_DOCUMENT: EraserDocument = {
  id: 'starter-zynq-radar',
  title: 'Zynq FPGA Radar Signal Processor System',
  viewMode: 'both',
  theme: 'light',
  createdAt: Date.now() - 1200000,
  updatedAt: Date.now(),
  canvasSettings: {
    grid: 'dots',
    roughStyle: false,
    zoom: 0.85,
    pan: { x: 40, y: 20 },
    snapToGrid: true,
  },
  content: `# Zynq FPGA Radar Signal Processor System

## 1. System Architecture Overview

This document specifies an enterprise real-time Radar Signal Processor implemented on the **AMD / Xilinx Zynq-7000 SoC (XC7Z020)**. The architecture partitions workloads across:
- **Processing System (PS)**: Dual-core ARM Cortex-A9 running embedded Linux/FreeRTOS with lightweight IP (\`lwIP\`) network stack, circular DMA memory management, and final target parameter extraction.
- **Programmable Logic (PL)**: Hardware DSP pipeline implementing high-throughput pulse detection, windowing, 1024-point complex FFT, and peak bin isolation.

\`\`\`mermaid
flowchart LR
    subgraph Host["Host PC & RF Front-End"]
        PC["PC streamer.py\n(Synthetic / ADALM-Pluto)"]
    end

    subgraph PS["Zynq PS (ARM Processing System)"]
        UDP["lwIP UDP Receiver\n(Port 5000)"]
        DDR["Circular DDR Buffer\n(DDR3 RAM)"]
        DMA["AXI DMA MM2S\n(Memory to Stream)"]
        Calc["Result Calculation\n(freq, λ, PW, PRI, PRF, dist)"]
    end

    subgraph PL["Zynq PL (Programmable Logic DSP)"]
        In["AXI-Stream Input\n(From PS DMA)"]
        Pulse["Pulse Detector\n(mag² > threshold)"]
        Hann["Hann Window Generator\n(1024-pt Coefficients)"]
        FFT["Xilinx FFT Core\n(1024-pt Radix-2 Burst)"]
        Peak["Peak Detector\n(Magnitude & Bin)"]
        Regs["AXI-Lite Control & Status\n(Registers, CFG, IRQ)"]
    end

    PC -->|UDP / Ethernet| UDP
    UDP -->|AXI-Stream| DDR
    DDR -->|AXI-MM| DMA
    DDR -.->|AXI-Stream| Pulse
    DMA -->|AXI-Stream| Hann
    Pulse -->|Thresholded Stream| Hann
    Pulse -->|Bypass Stream| Peak
    Hann -->|Windowed I/Q| FFT
    FFT -->|Frequency Spectrum| Peak
    Peak -.->|Extracted Bins| Regs
    Regs <==>|AXI-Lite Bus| Calc
\`\`\`

---

## 2. Signal Processing Pipeline & Mathematics

### 2.1 RF Data Ingestion & Framing
Raw radar I/Q samples are generated either by synthetic test waveforms or an **Analog Devices ADALM-Pluto SDR**, framed into UDP datagrams, and transmitted via Gigabit Ethernet. The ARM core runs an \`lwIP\` zero-copy socket listener binding to port 5000:
$$\\text{Sample Rate } F_s = 20\\text{ MSPS}, \\quad \\text{Dynamic Range} = 12\\text{-bit ADC I/Q}$$

### 2.2 Pulse Detection & Energy Thresholding
To isolate radar echo pulses from thermal noise, the PL pulse detector computes instantaneous power:
$$P(n) = I(n)^2 + Q(n)^2$$
A detection occurs when $P(n) > V_{\\text{threshold}}$. Samples exceeding the threshold trigger the windowing and FFT engine, discarding inter-pulse noise to conserve BRAM bandwidth.

### 2.3 Hann Windowing
Prior to spectral transformation, samples are weighted by a 1024-point symmetric Hann window to suppress spectral leakage and sidelobes:
$$w(n) = 0.5 \\left(1 - \\cos\\left(\\frac{2\\pi n}{N-1}\\right)\\right), \\quad 0 \\le n \\le N-1, \\quad N = 1024$$

### 2.4 1024-Point Radix-2 Complex FFT
The windowed time-domain complex signal $x(n) = I(n) + j Q(n)$ is processed by the Xilinx LogiCORE IP Fast Fourier Transform:
$$X(k) = \\sum_{n=0}^{N-1} x(n) e^{-j \\frac{2\\pi}{N} n k}, \\quad k = 0, 1, \\dots, N-1$$

### 2.5 Peak Frequency & Target Parameter Calculation
The peak detector identifies the maximum spectral bin $k_{\\text{peak}}$ and its magnitude $|X(k_{\\text{peak}})|$. The PS extracts:
- **Doppler Shift**: $f_d = \\frac{k_{\\text{peak}} \\cdot F_s}{N}$
- **Target Velocity**: $v = \\frac{c \\cdot f_d}{2 f_0}$
- **Target Range**: $R = \\frac{c \\cdot \\Delta t}{2}$
- **Pulse Repetition Frequency (PRF)**: $\\text{PRF} = \\frac{1}{\\text{PRI}}$

---

## 3. Bus Interfaces & Interconnect Matrix

| Bus Type | Protocol | Bit Width | Source | Destination | Throughput |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Data Stream** | AXI4-Stream | 32-bit (16b I + 16b Q) | AXI DMA MM2S | PL DSP Pipeline | 320 MB/s @ 80 MHz |
| **Memory Bus** | AXI4-MM | 64-bit HP Port | DDR Controller | AXI DMA | 640 MB/s Burst |
| **Control Bus** | AXI4-Lite | 32-bit GP0 Port | ARM Cortex-A9 | PL Registers | Single-cycle Access |
| **Network** | UDP / IP | Ethernet 1GbE | Host PC | lwIP Stack | ~950 Mbps Wire Rate |

---

## 4. Hardware Resource Utilization (XC7Z020)

| Resource | Used | Available | Utilization |
| :--- | :--- | :--- | :--- |
| **LUTs** | 14,820 | 53,200 | 27.8% |
| **Flip-Flops (FF)** | 18,450 | 106,400 | 17.3% |
| **BRAM (36Kb blocks)** | 42 | 140 | 30.0% |
| **DSP48E1 Slices** | 48 | 220 | 21.8% |
| **Global Clock Buffers** | 4 | 32 | 12.5% |
`,
  elements: [
    // 1. Overall System Title Header (Centered at top)
    {
      id: 'title-banner',
      type: 'text',
      x: 320,
      y: 20,
      width: 580,
      height: 44,
      text: 'Zynq FPGA Radar Signal Processor System',
      style: {
        fillColor: 'transparent',
        strokeColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#0B2545',
        fontSize: 24,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 20,
    },

    // 2. Main Outer Container: Zynq SoC Frame
    {
      id: 'frame-zynq-soc',
      type: 'frame',
      x: 270,
      y: 75,
      width: 820,
      height: 640,
      frameTitle: 'Zynq SoC',
      style: {
        fillColor: 'rgba(240, 246, 255, 0.4)',
        strokeColor: '#3B82F6',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#0F275E',
        fontSize: 16,
        fontFamily: 'sans',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 1,
    },

    // 3. PS Column Title Badge
    {
      id: 'badge-ps-header',
      type: 'text',
      x: 320,
      y: 95,
      width: 240,
      height: 32,
      text: 'PS – Processing System',
      style: {
        fillColor: 'transparent',
        strokeColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#0284C7',
        fontSize: 16,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 15,
    },

    // 4. PL Column Title Badge
    {
      id: 'badge-pl-header',
      type: 'text',
      x: 720,
      y: 95,
      width: 250,
      height: 32,
      text: 'PL – Programmable Logic',
      style: {
        fillColor: 'transparent',
        strokeColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#0D9488',
        fontSize: 16,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 15,
    },

    // 5. Vertical Dashed Divider between PS and PL
    {
      id: 'divider-ps-pl',
      type: 'pen',
      x: 650,
      y: 95,
      width: 2,
      height: 600,
      points: [
        { x: 650, y: 95 },
        { x: 650, y: 700 },
      ],
      style: {
        fillColor: 'transparent',
        strokeColor: '#64748B',
        strokeWidth: 1.8,
        strokeStyle: 'dashed',
        roughness: 0,
        textColor: '#64748B',
        fontSize: 10,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 0.8,
      },
      zIndex: 4,
    },

    // ==========================================
    // EXTERNAL BLOCK (LEFT): PC – streamer.py
    // ==========================================
    {
      id: 'node-pc-streamer',
      type: 'rounded-rect',
      x: 30,
      y: 270,
      width: 190,
      height: 125,
      text: 'PC – streamer.py',
      subtitle: 'Pre-recorded file / Synth /\nADALM-Pluto',
      style: {
        fillColor: '#0B2545',
        strokeColor: '#1E3A8A',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'sans',
        textAlign: 'center',
        opacity: 1,
      },
      zIndex: 12,
    },

    // ==========================================
    // PS (PROCESSING SYSTEM) NODES (LEFT SIDE)
    // ==========================================
    // PS-1: lwIP UDP Receive
    node(
      'node-ps-lwip',
      320,
      145,
      200,
      60,
      'lwIP UDP Receive',
      'Port 5000 Listener',
      '#0284C7',
      '#FFFFFF',
      '#0F172A',
      13
    ),

    // PS-2: Circular DDR Buffer
    node(
      'node-ps-ddr',
      320,
      265,
      200,
      65,
      'Circular DDR Buffer',
      '(DDR Memory)',
      '#0284C7',
      '#FFFFFF',
      '#0F172A',
      13
    ),

    // PS-3: AXI DMA MM2S
    node(
      'node-ps-dma',
      320,
      395,
      200,
      65,
      'AXI DMA MM2S',
      '(Memory to Stream)',
      '#0284C7',
      '#FFFFFF',
      '#0F172A',
      13
    ),

    // PS-4: Result Calculation (Bottom Left)
    node(
      'node-ps-calc',
      300,
      545,
      210,
      75,
      'Result Calculation',
      '(freq, λ, PW, PRI, PRF, distance)',
      '#0284C7',
      '#FFFFFF',
      '#0F172A',
      13
    ),

    // Interface Block: AXI-Lite Control (Registers & Status)
    node(
      'node-axi-lite-ctrl',
      565,
      550,
      135,
      65,
      'AXI-Lite Control',
      '(Registers & Status)',
      '#0284C7',
      '#FFFFFF',
      '#0F172A',
      12
    ),

    // ==========================================
    // PL (PROGRAMMABLE LOGIC) NODES (RIGHT SIDE)
    // ==========================================
    // PL-1: AXI-Stream Input
    node(
      'node-pl-stream-input',
      710,
      145,
      190,
      60,
      'AXI-Stream Input',
      '(From PS DMA)',
      '#0D9488',
      '#FFFFFF',
      '#0F172A',
      13
    ),

    // PL-2: Pulse Detector
    node(
      'node-pl-pulse-det',
      720,
      265,
      180,
      65,
      'Pulse Detector',
      '(mag² > threshold)',
      '#0D9488',
      '#FFFFFF',
      '#0F172A',
      13
    ),

    // PL-3: Hann Window
    node(
      'node-pl-hann',
      690,
      385,
      145,
      55,
      'Hann Window',
      '(1024-pt Weights)',
      '#0D9488',
      '#FFFFFF',
      '#0F172A',
      13
    ),

    // PL-4: Xilinx FFT 1024-pt
    node(
      'node-pl-fft',
      685,
      485,
      155,
      65,
      'Xilinx FFT 1024-pt',
      '(Radix-2 Burst)',
      '#0D9488',
      '#FFFFFF',
      '#0F172A',
      13
    ),

    // PL-5: Peak Detector
    node(
      'node-pl-peak-det',
      870,
      485,
      175,
      65,
      'Peak Detector',
      '(Magnitude Peak & Bin)',
      '#0D9488',
      '#FFFFFF',
      '#0F172A',
      13
    ),

    // PL-6: AXI-Lite Registers & Status (Dashed border box)
    node(
      'node-pl-regs-status',
      715,
      610,
      245,
      68,
      'AXI-Lite Registers & Status',
      '(Threshold, FFT Config, Status)',
      '#0F275E',
      '#F8FAFC',
      '#0F172A',
      12.5,
      'dashed'
    ),

    // ==========================================
    // LEGEND CARD (BOTTOM RIGHT)
    // ==========================================
    {
      id: 'node-legend-box',
      type: 'rounded-rect',
      x: 790,
      y: 735,
      width: 280,
      height: 120,
      text: '',
      subtitle: '',
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#94A3B8',
        strokeWidth: 1.5,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#0F172A',
        fontSize: 12,
        fontFamily: 'sans',
        textAlign: 'left',
        opacity: 0.95,
      },
      zIndex: 10,
    },
    // Legend Item 1: Data / Stream Flow
    {
      id: 'legend-item-1',
      type: 'text',
      x: 805,
      y: 745,
      width: 250,
      height: 25,
      text: '───►  Data / Stream Flow',
      style: {
        fillColor: 'transparent',
        strokeColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#0B2545',
        fontSize: 12,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 15,
    },
    // Legend Item 2: Control / AXI-Lite
    {
      id: 'legend-item-2',
      type: 'text',
      x: 805,
      y: 775,
      width: 250,
      height: 25,
      text: '- - -►  Control / AXI-Lite',
      style: {
        fillColor: 'transparent',
        strokeColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#1E293B',
        fontSize: 12,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 15,
    },
    // Legend Item 3: Results / Output
    {
      id: 'legend-item-3',
      type: 'text',
      x: 805,
      y: 805,
      width: 250,
      height: 25,
      text: '───►  Results / Output',
      style: {
        fillColor: 'transparent',
        strokeColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        roughness: 0,
        textColor: '#0D9488',
        fontSize: 12,
        fontFamily: 'mono',
        textAlign: 'left',
        opacity: 1,
      },
      zIndex: 15,
    },

    // ==========================================
    // CONNECTORS (DATA FLOW, CONTROL & BUSES)
    // ==========================================

    // C1: PC -> SoC (Ethernet / UDP Packets port 5000)
    conn(
      'conn-pc-to-soc',
      'node-pc-streamer',
      'node-ps-ddr',
      { x: 220, y: 330 },
      { x: 320, y: 295 },
      'UDP Packets (port 5000)\nEthernet',
      'solid',
      '#0B2545'
    ),

    // C2: lwIP -> Circular DDR Buffer (AXI-Stream)
    conn(
      'conn-lwip-to-ddr',
      'node-ps-lwip',
      'node-ps-ddr',
      { x: 420, y: 205 },
      { x: 420, y: 265 },
      'AXI-Stream',
      'solid',
      '#0B2545'
    ),

    // C3: Circular DDR Buffer -> AXI DMA MM2S (AXI-MM)
    conn(
      'conn-ddr-to-dma',
      'node-ps-ddr',
      'node-ps-dma',
      { x: 420, y: 330 },
      { x: 420, y: 395 },
      'AXI-MM',
      'solid',
      '#0B2545'
    ),

    // C4: Circular DDR Buffer -> Pulse Detector (AXI-Stream to PL)
    conn(
      'conn-ddr-to-pulse',
      'node-ps-ddr',
      'node-pl-pulse-det',
      { x: 520, y: 295 },
      { x: 720, y: 295 },
      'AXI-Stream (to PL)',
      'solid',
      '#0B2545'
    ),

    // C5: AXI DMA MM2S -> Hann Window (AXI-Stream from PS)
    conn(
      'conn-dma-to-hann',
      'node-ps-dma',
      'node-pl-hann',
      { x: 520, y: 415 },
      { x: 690, y: 415 },
      'AXI-Stream (from PS)',
      'solid',
      '#0B2545'
    ),

    // C6: AXI-Stream Input -> Pulse Detector
    conn(
      'conn-input-to-pulse',
      'node-pl-stream-input',
      'node-pl-pulse-det',
      { x: 805, y: 205 },
      { x: 805, y: 265 },
      'AXI-Stream',
      'solid',
      '#0B2545'
    ),

    // C7: Pulse Detector -> Hann Window
    conn(
      'conn-pulse-to-hann',
      'node-pl-pulse-det',
      'node-pl-hann',
      { x: 760, y: 330 },
      { x: 760, y: 385 },
      '',
      'solid',
      '#0B2545'
    ),

    // C8: Pulse Detector -> Peak Detector (Bypass stream)
    conn(
      'conn-pulse-to-peak',
      'node-pl-pulse-det',
      'node-pl-peak-det',
      { x: 860, y: 330 },
      { x: 935, y: 485 },
      'AXI-Stream',
      'solid',
      '#0B2545'
    ),

    // C9: Hann Window -> Xilinx FFT 1024-pt
    conn(
      'conn-hann-to-fft',
      'node-pl-hann',
      'node-pl-fft',
      { x: 760, y: 440 },
      { x: 760, y: 485 },
      'AXI-Stream',
      'solid',
      '#0B2545'
    ),

    // C10: Result Calculation <-> AXI-Lite Control (Bidirectional)
    conn(
      'conn-calc-to-axictrl',
      'node-ps-calc',
      'node-axi-lite-ctrl',
      { x: 510, y: 580 },
      { x: 565, y: 580 },
      'AXI-Lite',
      'solid',
      '#0B2545'
    ),

    // C11: AXI-Lite Control -> AXI DMA (Control trigger, dashed)
    conn(
      'conn-calc-to-dma-ctrl',
      'node-ps-calc',
      'node-ps-dma',
      { x: 420, y: 545 },
      { x: 420, y: 460 },
      '',
      'dashed',
      '#0F275E'
    ),

    // C12: AXI-Lite Control -> PL Registers (dashed control)
    conn(
      'conn-axictrl-to-regs',
      'node-axi-lite-ctrl',
      'node-pl-regs-status',
      { x: 670, y: 615 },
      { x: 715, y: 630 },
      '',
      'dashed',
      '#0F275E'
    ),

    // C13: Xilinx FFT 1024-pt <-> AXI-Lite Registers (dashed control)
    conn(
      'conn-fft-to-regs',
      'node-pl-fft',
      'node-pl-regs-status',
      { x: 760, y: 550 },
      { x: 760, y: 610 },
      '',
      'dashed',
      '#0F275E'
    ),

    // C14: Peak Detector <-> AXI-Lite Registers (dashed control)
    conn(
      'conn-peak-to-regs',
      'node-pl-peak-det',
      'node-pl-regs-status',
      { x: 900, y: 550 },
      { x: 900, y: 610 },
      '',
      'dashed',
      '#0F275E'
    ),

    // C15: AXI-Lite Registers & Status -> Result Calculation (Bottom Loop Control feedback)
    conn(
      'conn-regs-to-calc-feedback',
      'node-pl-regs-status',
      'node-ps-calc',
      { x: 715, y: 655 },
      { x: 415, y: 620 },
      'Control Feedback',
      'dashed',
      '#0F275E'
    ),
  ],
};
