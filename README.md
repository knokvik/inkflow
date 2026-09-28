# 🎨 Eraser Local — Diagram & Technical Document Canvas

A 100% local, private, and offline clone of **[Eraser.io](https://eraser.io)** with:
- **Split-Screen Workspace**: Side-by-side Technical Markdown Document Editor + Infinite Architecture Canvas.
- **Rich Icon Catalog**: Cloud (AWS, GCP, Azure), Databases & Caching (PostgreSQL, Redis, Kafka, MongoDB, Elasticsearch), Tech Stacks (React, Node, Python, Docker, Kubernetes), and Infrastructure.
- **Eraser Hand-Drawn & Crisp Vector Modes**: Toggle Rough.js sketchy style or clean vector lines.
- **Smart Magnetic Connectors**: Orthogonal (step/elbow), curved, and straight arrows that snap to node anchors with directional arrowheads and editable labels.
- **Diagram-as-Code (Eraser DSL)**: Bidirectional code-to-diagram and diagram-to-code compiler (`Client > Gateway > Postgres`).
- **DiagramGPT AI Assistant**: Interactive natural-language diagram generation and real-time mutations ("Add Redis cache", "Add Kafka queue", "Rearrange to horizontal pipeline", "Generate technical specs").
  - Works with **Built-in Offline Engine** (zero setup)
  - Works with **Antigravity / OpenCode** local endpoints
  - Works with **Ollama** (`http://localhost:11434`)
  - Works with **LM Studio / vLLM / LocalAI / OpenAI** endpoints

---

## 🚀 Quick Start

To start your local Eraser instance:

```bash
cd eraser-local
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## ✨ Key Features & Walkthrough

### 1. Split-Screen Document & Canvas
- Switch between **Doc View** (Technical notes only), **Split View** (Doc on left, Canvas on right with draggable resizable divider), and **Canvas View** (Infinite canvas only).
- Markdown Editor features headings, bold/italic, checklists, inline code, syntax-highlighted code blocks, and quote callout alerts (`[!TIP]`, `[!NOTE]`, `[!WARNING]`).

### 2. Comprehensive Icon Library
Click the **Icon Library** button (`I` shortcut) to search and place icons:
- **AWS**: EC2, S3, RDS, Lambda, DynamoDB, API Gateway, CloudFront, SQS, EKS
- **GCP**: Cloud Run, Cloud Storage, BigQuery
- **Azure**: Azure VM, Cosmos DB
- **Databases & Cache**: PostgreSQL, MySQL, Redis, Apache Kafka, MongoDB, Elasticsearch
- **Tech & Languages**: React, Node.js, Python, Docker, Kubernetes, GraphQL
- **Infra & Security**: Nginx, Cloudflare, Load Balancer, Firewall / Shield, Webhook
- **System**: Web Browser, Mobile App, Microservices, Users

### 3. Smart Arrows & Connectors
- Hover over any node to reveal 4 magnetic connection anchor points (Top, Right, Bottom, Left).
- Drag from an anchor to another node to establish orthogonal auto-routed connectors.
- Double-click connector labels to edit protocol or description (e.g. `HTTPS`, `JWT Auth`, `Kafka Event`).

### 4. DiagramGPT / Local AI Assistant
Click the **AI Assistant** button on the top right or toolbar:
- Select your AI provider in the settings:
  - **Built-in Offline Engine**: Instant generation without any API keys or internet.
  - **Antigravity / OpenCode**: Point to your local LLM server (e.g. `http://localhost:8000/v1` or `http://localhost:1234/v1`).
  - **Ollama**: Connect directly to your local Ollama models (`http://localhost:11434`).
- Interactive prompts:
  - *"Generate e-commerce microservices with API Gateway, Redis, and Kafka"*
  - *"Add Redis cache between API and PostgreSQL"*
  - *"Add Kafka message broker and worker"*
  - *"Rearrange layout to horizontal pipeline"*
  - *"Generate architecture documentation"*

### 5. Diagram-as-Code (Eraser DSL)
Click the `< >` code button to inspect and edit your diagram in text syntax:
```eraser
Client [type: "icon", icon: "gen-browser", label: "Web Client"]
Gateway [type: "icon", icon: "aws-api-gateway", label: "API Gateway"]
Auth [type: "icon", icon: "infra-firewall", label: "Auth Guard"]
Postgres [type: "icon", icon: "db-postgres", label: "PostgreSQL DB"]

Client > Gateway [label: "HTTPS"]
Gateway > Auth [label: "Verify Token"]
Auth > Postgres [label: "Query Users"]
```
Click **Apply to Canvas** to reconstruct the visual layout!

### 6. Full Offline & Local Persistence
- Automatically persists all documents, canvas elements, zoom, pan, and settings to browser `localStorage`.
- Supports creating multiple documents and switching between them in the left sidebar.
- Export as **PNG Image**, **SVG Vector**, **Markdown (.md)**, or **JSON Project Backup**.
- Import previous JSON backups anytime.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `V` | Select Tool |
| `H` / `Space + Drag` | Hand / Pan Canvas |
| `R` | Shape Tool (Rectangle, Circle, Cylinder, etc.) |
| `S` | Sticky Note Tool |
| `C` | Connector / Arrow Tool |
| `T` | Text Tool |
| `F` | Frame / Group Boundary |
| `I` | Open Cloud & Tech Icon Library |
| `Ctrl / Cmd + A` | Select All Nodes |
| `Ctrl / Cmd + D` | Duplicate Selected |
| `Ctrl / Cmd + Z` | Undo |
| `Ctrl / Cmd + Y` | Redo |
| `Delete` / `Backspace` | Delete Selected |
| `?` | Keyboard Shortcuts Modal |

<!-- commit 88 -->
<!-- commit 89 -->
<!-- commit 90 -->
<!-- commit 91 -->
<!-- commit 92 -->
<!-- commit 93 -->
<!-- commit 94 -->
<!-- commit 95 -->
<!-- commit 96 -->
<!-- commit 97 -->
<!-- commit 98 -->
<!-- commit 99 -->