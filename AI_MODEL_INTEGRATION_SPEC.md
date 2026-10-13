# 🤖 Inkflow AI Model Integration & Command Specification

This specification defines how **any external AI model, agentic script, or developer** (Claude, GPT-4, Grok, Ollama, DeepSeek, Cursor, or OpenCode) can programmatically control Inkflow and generate/update high-fidelity architecture diagrams.

---

## 1. Terminal CLI Control

Inkflow provides a dedicated CLI at `~/.local/bin/inkflow` (available globally in your terminal):

| Command | Action |
|---|---|
| `inkflow` | Starts the server in the background and opens Google Chrome on `http://localhost:5173`. |
| `inkflow start` | Explicitly starts the Inkflow server and opens Chrome. |
| `inkflow stop` | Gracefully stops the server and frees port `5173`. |
| `inkflow-stop` | Direct one-word shortcut to stop the server from anywhere. |
| `inkflow status` | Reports whether Inkflow is RUNNING or STOPPED, including active PIDs. |
| `inkflow restart` | Restarts the server with one command. |
| `inkflow schema` | Prints the machine-readable JSON schema for diagram generation. |
| `inkflow prompt` | Prints the copy-pasteable system prompt for incoming AI models. |
| `inkflow curl` | Prints ready-to-run curl templates for automated updates. |

> **Desktop Shortcuts**:
> - `~/Desktop/Inkflow.command` — Double-click to start and open Chrome.
> - `~/Desktop/Inkflow-Stop.command` — Double-click to immediately stop the server.

---

## 2. How Incoming AI Models Know What to Return

When an AI model interacts with Inkflow, it can query two self-documenting local HTTP endpoints:

### Endpoint A: Machine-Readable Schema
```bash
curl http://localhost:5173/api/schema
```
Returns the exact JSON schema definition for all canvas elements, grid coordinates, and connectors.

### Endpoint B: Pre-Baked System Prompt
```bash
curl http://localhost:5173/api/prompt
```
Returns the exact system prompt to instruct any LLM on how to produce Inkflow diagrams.

---

## 3. The Exact JSON Output Contract

When an AI model generates or updates an architecture, it outputs (or POSTs) a single JSON payload with this schema:

```json
{
  "title": "Architecture Diagram Title",
  "doc": "# Technical Documentation Markdown\n\nDetailed specifications...",
  "elements": [
    // Array of Frames (Tiers), Nodes (Services), and Connectors (Wires)
  ]
}
```

### 3.1 Node Element (`type: 'icon'`)
Standard architecture microservice card with brand icon, title, and 2-line subtitle:

```json
{
  "id": "node-auth-service",
  "type": "icon",
  "x": 80,
  "y": 120,
  "width": 230,
  "height": 78,
  "iconName": "tech-docker",
  "iconLabel": "Auth & Token Service",
  "subtitle": "OAuth2 / JWT tokens\nRedis session store",
  "style": {
    "fillColor": "#FFFFFF",
    "strokeColor": "#FB923C",
    "strokeWidth": 1.5,
    "textColor": "#0F172A",
    "fontSize": 12
  }
}
```

- **Dimensions**: Always `width: 230`, `height: 78` for horizontal layout.
- **`iconName`**: Over 3,900 official brand icons available:
  - Tech: `tech-docker`, `tech-kubernetes`, `tech-python`, `tech-react`, `tech-redis`, `tech-kafka`, `tech-postgres`, `tech-graphql`
  - AWS: `aws-lambda`, `aws-s3`, `aws-dynamodb`, `aws-cloudfront`, `aws-apigateway`, `aws-sqs`
  - GCP: `gcp-cloud-run`, `gcp-bigquery`, `gcp-kubernetes-engine`
  - Generic: `gen-server`, `gen-database`, `gen-browser`, `gen-mobile`, `gen-microservice`
- **`subtitle`**: 2 lines of technical details separated by `\n`.

---

### 3.2 Tier Frame Element (`type: 'frame'`)
Enclosing colored group boundary for each tier:

```json
{
  "id": "tier-01",
  "type": "frame",
  "x": 60,
  "y": 80,
  "width": 1100,
  "height": 155,
  "frameTitle": "01 · CLIENT & INGESTION TIER",
  "style": {
    "fillColor": "rgba(254, 243, 199, 0.22)",
    "strokeColor": "#FB923C",
    "strokeWidth": 1.5,
    "strokeStyle": "solid"
  },
  "zIndex": 1
}
```

#### Standard 4-Tier Colors & Positions:
| Tier | Frame Y | Nodes Y | Border Color | Fill Tint |
|---|---|---|---|---|
| **Tier 1 (Client/Ingestion)** | `y: 80` | `y: 120` | `#FB923C` (Amber) | `rgba(254, 243, 199, 0.22)` |
| **Tier 2 (Normalization/Extraction)** | `y: 275` | `y: 315` | `#10B981` (Emerald) | `rgba(209, 250, 229, 0.22)` |
| **Tier 3 (Multi-Agent Logic)** | `y: 470` | `y: 510` | `#A855F7` (Purple) | `rgba(243, 232, 255, 0.25)` |
| **Tier 4 (Persistence/Gateway)** | `y: 665` | `y: 705` | `#3B82F6` (Blue) | `rgba(219, 234, 254, 0.25)` |

#### Standard 4-Column Grid X Positions:
- **Column 1**: `x: 80`
- **Column 2**: `x: 350`
- **Column 3**: `x: 620`
- **Column 4**: `x: 890`

---

### 3.3 Connector Element (`type: 'connector'`)
Orthogonal wired connection with arrow and high-contrast label:

```json
{
  "id": "c-1",
  "type": "connector",
  "fromId": "node-auth-service",
  "toId": "node-api-gw",
  "fromAnchor": "right",
  "toAnchor": "left",
  "routing": "orthogonal",
  "arrowEnd": true,
  "connectorLabel": "HTTPS / JSON Payload",
  "style": {
    "strokeColor": "#FB923C",
    "strokeWidth": 1.5
  }
}
```

- **Routing Rules**:
  - Horizontal within a tier: `fromAnchor: "right"`, `toAnchor: "left"`.
  - Vertical drop between tiers: `fromAnchor: "bottom"`, `toAnchor: "top"`.
  - Labels automatically center along the wire without overlapping cards.

---

## 4. Live Command Execution Example

Any external AI model can live-edit the user's canvas by executing this single curl command:

```bash
curl -X POST http://localhost:5173/api/diagram \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-Commerce Microservices",
    "doc": "# E-Commerce Microservices Architecture\n\nHigh-throughput reactive stack.",
    "elements": [
      {
        "id": "tier-01",
        "type": "frame",
        "x": 60,
        "y": 80,
        "width": 1100,
        "height": 155,
        "frameTitle": "01 · CLIENT & INGRESS TIER",
        "style": { "fillColor": "rgba(254, 243, 199, 0.22)", "strokeColor": "#FB923C", "strokeWidth": 1.5, "strokeStyle": "solid" }
      },
      {
        "id": "node-gw",
        "type": "icon",
        "x": 80,
        "y": 120,
        "width": 230,
        "height": 78,
        "iconName": "tech-docker",
        "iconLabel": "API Gateway",
        "subtitle": "Nginx / Traefik proxy\nTLS & Rate limiting",
        "style": { "fillColor": "#FFFFFF", "strokeColor": "#FB923C", "strokeWidth": 1.5 }
      },
      {
        "id": "node-auth",
        "type": "icon",
        "x": 350,
        "y": 120,
        "width": 230,
        "height": 78,
        "iconName": "tech-python",
        "iconLabel": "Authentication",
        "subtitle": "JWT session signing\nOAuth2 provider",
        "style": { "fillColor": "#FFFFFF", "strokeColor": "#FB923C", "strokeWidth": 1.5 }
      },
      {
        "id": "c-1",
        "type": "connector",
        "fromId": "node-gw",
        "toId": "node-auth",
        "fromAnchor": "right",
        "toAnchor": "left",
        "routing": "orthogonal",
        "arrowEnd": true,
        "connectorLabel": "REST /bearer",
        "style": { "strokeColor": "#FB923C", "strokeWidth": 1.5 }
      }
    ]
  }'
```

When this command runs, the Vite server broadcasts an SSE update and the user's browser updates **immediately** without a page reload!
