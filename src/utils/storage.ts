import { EraserDocument } from '../types/canvas';
import { STARTER_AGENTIC_SCRAPER_DOCUMENT } from '../constants/starterScraperDoc';

const STORAGE_KEY = 'eraser_documents_v4';
const ACTIVE_DOC_KEY = 'eraser_active_doc_id_v4';

export const STARTER_DOCUMENTS: EraserDocument[] = [
  STARTER_AGENTIC_SCRAPER_DOCUMENT,
  {
    id: 'starter-verdant',
    title: 'WeMakeDevs',
    viewMode: 'canvas',
    theme: 'light',
    createdAt: Date.now() - 1000000,
    updatedAt: Date.now() - 500000,
    content: `# Verdant Waste Tracking and Compliance Architecture

## High-Level System Overview
Verdant is an automated, decentralized compliance and chain-of-custody tracking platform designed for end-to-end municipal and industrial waste accountability.

### Architecture Tiers

#### 01 — Client / User Interfaces (Orange Tier)
- **Citizen & Picker Mobile App**: Handles QR code scanning, offline photo capture, batch submissions, and automated GPS geo-tagging.
- **Hub Supervisor Dashboard**: Provides bulk-weighing calibration, revocable co-sampler attestations, and supervisor approval logs.
- **Brand / Buyer Marketplace**: Enterprise procurement interface for purchasing tokenized EPR compliance certificates.
- **DePIN Waste Map**: Real-time decentralized telemetry map of waste collection coverage and environmental impact.

#### 02 — Physical Proof & Verification (Green Tier)
- **QR-Coded Tamper-Evident Bag**: Cryptographic serialized bag stickers scanned at initial collection.
- **Dual-Signature Verification**: Atomic multi-signature approval between picker and hub supervisor.
- **EV Waste Verification**: Real-time vehicle weight delta sensors and route telemetry.
- **Recycler / Processing Plant**: Certified optical sorting, weight bridge cross-verification, and thermal destruction logging.

#### 03 — AWS Cloud Tier (Blue Tier)
- **Amazon Cognito**: JWT token issuance and user identity binding.
- **API Gateway**: REST & WebSocket endpoint management with rate-limiting.
- **AWS Lambda**: Serverless microservices managing verification state transitions.
- **Step Functions**: Multi-stage state machine orchestrating chain-of-custody validations.
- **Amazon S3 & DynamoDB**: Immutable storage for audit-grade raw image evidence and single-digit millisecond state indexing.

#### 04 — Algorand Ledger Tier (Purple Tier)
- **Chain-of-Custody ASA**: Minting fractional provenance tokens on Algorand Pure PoS.
- **Trust Score Registry & Smart Contracts**: Transparent on-chain scoring for collectors and recyclers.
- **Algorand Indexer**: Real-time blockchain event query layer.
`,
    canvasSettings: {
      grid: 'dots',
      roughStyle: false,
      zoom: 0.65,
      pan: { x: 80, y: 30 },
      snapToGrid: true,
    },
    elements: [
      // Outer Diagram Frame 1
      {
        id: 'frame-verdant-main',
        type: 'frame',
        x: 40,
        y: 40,
        width: 1040,
        height: 820,
        frameTitle: 'Verdant Waste Tracking and Compliance Architecture',
        style: {
          fillColor: 'rgba(255, 255, 255, 0.4)',
          strokeColor: '#CBD5E1',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 13,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 1,
      },

      // TIER 1: CLIENT / USER INTERFACES (Orange)
      {
        id: 'tier-01',
        type: 'frame',
        x: 60,
        y: 80,
        width: 1000,
        height: 140,
        frameTitle: '01 - CLIENT / USER INTERFACES',
        style: {
          fillColor: 'rgba(254, 243, 199, 0.22)',
          strokeColor: '#FB923C',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#C2410C',
          fontSize: 11,
          fontFamily: 'mono',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 2,
      },
      {
        id: 'node-client-mobile',
        type: 'icon',
        x: 90,
        y: 115,
        width: 190,
        height: 85,
        iconName: 'gen-mobile',
        iconLabel: 'Citizen & Picker Mobile App',
        subtitle: 'Mobile GPS • weights • QR scanning\nOffline-first photo • hybrid upload batch',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#FB923C',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-client-hub',
        type: 'icon',
        x: 320,
        y: 115,
        width: 190,
        height: 85,
        iconName: 'gen-browser',
        iconLabel: 'Hub Supervisor Dashboard',
        subtitle: 'Bulk-weighing, regulatory co-sign\nRevocable co-sampler attestations',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#FB923C',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-client-brand',
        type: 'icon',
        x: 550,
        y: 115,
        width: 190,
        height: 85,
        iconName: 'tech-react',
        iconLabel: 'Brand / Buyer Marketplace',
        subtitle: 'Private RFQs, volume lots\nPurchase certificates • export ledger',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#FB923C',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-client-depin',
        type: 'icon',
        x: 780,
        y: 115,
        width: 190,
        height: 85,
        iconName: 'aws-cloudfront',
        iconLabel: 'DePIN Waste Map',
        subtitle: 'Explore hotspots • cluster plots\nDecentralized public compliance feed',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#FB923C',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },

      // TIER 2: PHYSICAL PROOF & VERIFICATION (Green)
      {
        id: 'tier-02',
        type: 'frame',
        x: 60,
        y: 245,
        width: 1000,
        height: 140,
        frameTitle: '02 - PHYSICAL PROOF & VERIFICATION',
        style: {
          fillColor: 'rgba(240, 253, 244, 0.28)',
          strokeColor: '#4ADE80',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#15803D',
          fontSize: 11,
          fontFamily: 'mono',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 2,
      },
      {
        id: 'node-proof-bag',
        type: 'icon',
        x: 90,
        y: 280,
        width: 210,
        height: 85,
        iconName: 'tech-docker',
        iconLabel: '1 - QR-Coded Tamper-Evident Bag',
        subtitle: 'Unique lot-id sticker • serialized seal\nSlow QR upload, tamper indicator trace',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#4ADE80',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-proof-dual',
        type: 'icon',
        x: 330,
        y: 280,
        width: 200,
        height: 85,
        iconName: 'infra-firewall',
        iconLabel: '2 - Dual-Signature Verification',
        subtitle: 'Picker + Hub supervisor co-sign\nTLS cryptographic signature • instant trace',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#4ADE80',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-proof-ev',
        type: 'icon',
        x: 560,
        y: 280,
        width: 190,
        height: 85,
        iconName: 'gen-microservice',
        iconLabel: '3 - EV Waste Verification',
        subtitle: 'On-route weight, speed, GPS validation\nLow confidence threshold = manual review',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#4ADE80',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-proof-recycler',
        type: 'icon',
        x: 780,
        y: 280,
        width: 200,
        height: 85,
        iconName: 'tech-k8s',
        iconLabel: '5 - Recycler / Processing Plant',
        subtitle: 'Final gross weight • shredding verification\nTLS-degraded video • certified output',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#4ADE80',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },

      // TIER 3: AWS CLOUD TIER (Blue)
      {
        id: 'tier-03',
        type: 'frame',
        x: 60,
        y: 410,
        width: 1000,
        height: 250,
        frameTitle: '03 - AWS CLOUD — AUTHENTICATION, ORCHESTRATION, DATA & OBSERVABILITY',
        style: {
          fillColor: 'rgba(244, 244, 245, 0.4)',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#374151',
          fontSize: 11,
          fontFamily: 'mono',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 2,
      },
      {
        id: 'node-aws-cognito',
        type: 'icon',
        x: 90,
        y: 445,
        width: 170,
        height: 80,
        iconName: 'infra-firewall',
        iconLabel: 'Amazon Cognito',
        subtitle: 'Citizen & Picker User Pools • JWT\nIdentity vs wallet agreement routing',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-aws-apigw',
        type: 'icon',
        x: 280,
        y: 445,
        width: 160,
        height: 80,
        iconName: 'aws-api-gateway',
        iconLabel: 'API Gateway',
        subtitle: 'REST APIs • IAM Authorizer\nRate-limits & route governance',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-aws-lambda',
        type: 'icon',
        x: 460,
        y: 445,
        width: 160,
        height: 80,
        iconName: 'aws-lambda',
        iconLabel: 'AWS Lambda',
        subtitle: 'Microservices & event compute\nAsync state machine invocation',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-aws-step',
        type: 'icon',
        x: 640,
        y: 445,
        width: 160,
        height: 80,
        iconName: 'tech-node',
        iconLabel: 'Step Functions',
        subtitle: 'Multi-stage proof workflow\nRetry logic & fallback to audit flag',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-aws-cloudwatch',
        type: 'icon',
        x: 820,
        y: 445,
        width: 160,
        height: 80,
        iconName: 'db-elastic',
        iconLabel: 'CloudWatch',
        subtitle: 'Logs • metrics • central alerts\nAudit anomaly alarms',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-aws-dynamo',
        type: 'cylinder',
        x: 90,
        y: 545,
        width: 170,
        height: 85,
        text: 'DynamoDB',
        subtitle: 'Order / User / State fast lookups\nLow latency single-table key-value',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-aws-s3',
        type: 'cylinder',
        x: 280,
        y: 545,
        width: 170,
        height: 85,
        text: 'Amazon S3',
        subtitle: 'Parquet, JSON, images, PDFs\nAudit-grade raw files • lifecycle policies',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-aws-sagemaker',
        type: 'icon',
        x: 470,
        y: 545,
        width: 160,
        height: 85,
        iconName: 'tech-python',
        iconLabel: 'SageMaker AI',
        subtitle: 'CV bag classification models\nConfidence analysis pipeline',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-aws-eventbridge',
        type: 'icon',
        x: 650,
        y: 545,
        width: 160,
        height: 85,
        iconName: 'db-kafka',
        iconLabel: 'Amazon EventBridge',
        subtitle: 'Event bus • rules engine\nWeight network dispatching',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-aws-sqs',
        type: 'icon',
        x: 830,
        y: 545,
        width: 150,
        height: 85,
        iconName: 'aws-sqs',
        iconLabel: 'Amazon SQS',
        subtitle: 'FIFO distribution work queues\nRetries & dead-letter processing',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#71717A',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },

      // TIER 4: ALGORAND LEDGER (Purple)
      {
        id: 'tier-04',
        type: 'frame',
        x: 60,
        y: 680,
        width: 1000,
        height: 155,
        frameTitle: '04 - ALGORAND — IMMUTABLE CUSTODY, TRUST, CERTIFICATES & REWARDS',
        style: {
          fillColor: 'rgba(250, 245, 255, 0.28)',
          strokeColor: '#C084FC',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#7E22CE',
          fontSize: 11,
          fontFamily: 'mono',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 2,
      },
      {
        id: 'node-algo-coc',
        type: 'icon',
        x: 90,
        y: 715,
        width: 170,
        height: 85,
        iconName: 'tech-graphql',
        iconLabel: '4 - Chain-of-Custody ASA',
        subtitle: 'ASA-72314 • immutable metadata\nCustody state transitions',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#C084FC',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-algo-trust',
        type: 'icon',
        x: 280,
        y: 715,
        width: 160,
        height: 85,
        iconName: 'infra-firewall',
        iconLabel: 'Trust Score Registry',
        subtitle: 'Smart contract reputation matrix\nZero-fraud compliance tiers',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#C084FC',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-algo-epr',
        type: 'icon',
        x: 460,
        y: 715,
        width: 170,
        height: 85,
        iconName: 'tech-graphql',
        iconLabel: '6-7 - EPR Certificate ASA',
        subtitle: 'Burned token on recycling plant\nAudited volume certificate proof',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#C084FC',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-algo-token',
        type: 'icon',
        x: 650,
        y: 715,
        width: 160,
        height: 85,
        iconName: 'tech-graphql',
        iconLabel: '8 - Green Utility Token',
        subtitle: 'Reward payouts to verified wallets\nP2P clean economy liquidity',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#C084FC',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },
      {
        id: 'node-algo-indexer',
        type: 'icon',
        x: 830,
        y: 715,
        width: 160,
        height: 85,
        iconName: 'db-postgres',
        iconLabel: 'Algorand Indexer',
        subtitle: 'GraphQL / REST read queries\nReal-time block stream search',
        style: {
          fillColor: '#FFFFFF',
          strokeColor: '#C084FC',
          strokeWidth: 1.5,
          strokeStyle: 'solid',
          roughness: 0,
          textColor: '#0F172A',
          fontSize: 11,
          fontFamily: 'sans',
          textAlign: 'left',
          opacity: 1,
        },
        zIndex: 10,
      },

      // CONNECTORS (Exact color-coded orthogonal connectors as seen in screenshot!)
      {
        id: 'c-1',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-client-mobile', fromAnchor: 'bottom',
        toId: 'node-proof-bag', toAnchor: 'top',
        startPoint: { x: 185, y: 200 }, endPoint: { x: 185, y: 280 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'scan + capture',
        style: { fillColor: 'transparent', strokeColor: '#FB923C', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#C2410C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
      {
        id: 'c-2',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-client-hub', fromAnchor: 'bottom',
        toId: 'node-proof-dual', toAnchor: 'top',
        startPoint: { x: 415, y: 200 }, endPoint: { x: 415, y: 280 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'weights + co-sign',
        style: { fillColor: 'transparent', strokeColor: '#FB923C', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#C2410C', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
      {
        id: 'c-3',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-proof-bag', fromAnchor: 'right',
        toId: 'node-proof-dual', toAnchor: 'left',
        startPoint: { x: 300, y: 322 }, endPoint: { x: 330, y: 322 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'batch status',
        style: { fillColor: 'transparent', strokeColor: '#4ADE80', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
      {
        id: 'c-4',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-proof-dual', fromAnchor: 'bottom',
        toId: 'node-aws-apigw', toAnchor: 'top',
        startPoint: { x: 415, y: 365 }, endPoint: { x: 360, y: 445 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'signed batch proof',
        style: { fillColor: 'transparent', strokeColor: '#4ADE80', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#15803D', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
      {
        id: 'c-5',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-aws-apigw', fromAnchor: 'right',
        toId: 'node-aws-lambda', toAnchor: 'left',
        startPoint: { x: 440, y: 485 }, endPoint: { x: 460, y: 485 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'authorize request',
        style: { fillColor: 'transparent', strokeColor: '#71717A', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#374151', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
      {
        id: 'c-6',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-aws-lambda', fromAnchor: 'right',
        toId: 'node-aws-step', toAnchor: 'left',
        startPoint: { x: 620, y: 485 }, endPoint: { x: 640, y: 485 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'execute workflow',
        style: { fillColor: 'transparent', strokeColor: '#71717A', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#374151', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
      {
        id: 'c-7',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-aws-lambda', fromAnchor: 'bottom',
        toId: 'node-aws-s3', toAnchor: 'top',
        startPoint: { x: 500, y: 525 }, endPoint: { x: 365, y: 545 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'write evidence',
        style: { fillColor: 'transparent', strokeColor: '#71717A', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#374151', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
      {
        id: 'c-8',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-aws-lambda', fromAnchor: 'bottom',
        toId: 'node-algo-coc', toAnchor: 'top',
        startPoint: { x: 540, y: 525 }, endPoint: { x: 175, y: 715 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'mint / ASA transfer',
        style: { fillColor: 'transparent', strokeColor: '#C084FC', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
      {
        id: 'c-9',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-algo-coc', fromAnchor: 'right',
        toId: 'node-algo-trust', toAnchor: 'left',
        startPoint: { x: 260, y: 757 }, endPoint: { x: 280, y: 757 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'update reputation',
        style: { fillColor: 'transparent', strokeColor: '#C084FC', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
      {
        id: 'c-10',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0,
        fromId: 'node-algo-trust', fromAnchor: 'right',
        toId: 'node-algo-epr', toAnchor: 'left',
        startPoint: { x: 440, y: 757 }, endPoint: { x: 460, y: 757 },
        routing: 'orthogonal', arrowEnd: true, connectorLabel: 'EPR Certificate',
        style: { fillColor: 'transparent', strokeColor: '#C084FC', strokeWidth: 1.5, strokeStyle: 'solid', roughness: 0, textColor: '#7E22CE', fontSize: 10, fontFamily: 'mono', textAlign: 'center', opacity: 1 },
        zIndex: 5,
      },
    ],
  },
];

export function loadDocuments(): EraserDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDocuments(STARTER_DOCUMENTS);
      return STARTER_DOCUMENTS;
    }
    const docs = JSON.parse(raw);
    if (!Array.isArray(docs) || docs.length === 0) return STARTER_DOCUMENTS;

    // Ensure all starter documents (like Autonomous AI Web Scraper) are available and up-to-date
    for (const starter of STARTER_DOCUMENTS) {
      const idx = docs.findIndex((d: EraserDocument) => d.id === starter.id);
      if (idx === -1) {
        docs.unshift(starter);
      } else if (docs[idx].elements.length !== starter.elements.length) {
        docs[idx] = starter;
      }
    }
    return docs.map((doc: EraserDocument) => ({
      ...doc,
      elements: (doc.elements || []).map((el) => {
        const stroke = el.style?.strokeColor;
        const fill = el.style?.fillColor;
        const isBlueStroke =
          stroke &&
          ['#60a5fa', '#3b82f6', '#2563eb', '#6366f1', '#818cf8', '#1d4ed8', '#38bdf8'].includes(stroke.toLowerCase());
        const isBlueFill =
          fill &&
          (fill.includes('219, 234, 254') ||
            fill.includes('139, 92, 246') ||
            fill === '#161924' ||
            fill === '#1E293B' ||
            fill === '#1A1E2E' ||
            fill === '#1E2333');

        if (isBlueStroke || isBlueFill) {
          return {
            ...el,
            style: {
              ...el.style,
              strokeColor: isBlueStroke ? '#71717A' : el.style.strokeColor,
              fillColor: isBlueFill ? 'transparent' : el.style.fillColor,
              textColor:
                el.style?.textColor &&
                ['#1d4ed8', '#93c5fd', '#c7d2fe', '#818cf8'].includes(el.style.textColor.toLowerCase())
                  ? '#374151'
                  : el.style?.textColor,
            },
          };
        }
        return el;
      }),
    }));
  } catch (e) {
    console.error('Failed to load documents from localStorage', e);
    return STARTER_DOCUMENTS;
  }
}

export function saveDocuments(docs: EraserDocument[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save documents to localStorage', e);
  }
}

export function getActiveDocumentId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_DOC_KEY);
    return id || 'starter-agentic-scraper';
  } catch {
    return 'starter-agentic-scraper';
  }
}

export function setActiveDocumentId(id: string) {
  try {
    localStorage.setItem(ACTIVE_DOC_KEY, id);
  } catch (e) {
    console.error('Failed to set active doc id', e);
  }
}
