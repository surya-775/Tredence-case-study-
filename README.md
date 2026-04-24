# HR Workflow Designer

A visual drag-and-drop workflow builder for HR operations — built as part of the Tredence Studio Full Stack Engineering Intern case study.

## Live Preview

```
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, small bundle, no boilerplate overhead |
| Language | TypeScript (strict) | Type safety across all node data shapes |
| Canvas | React Flow v11 | Production-grade graph library with custom node support |
| State | Zustand + zundo | Minimal boilerplate, built-in undo/redo via temporal middleware |
| Styling | Inline CSS + React Flow defaults | Zero dependency on a CSS framework; portable |

---

## Architecture

```
src/
├── types/
│   └── nodeTypes.ts          # All TypeScript interfaces — single source of truth
│
├── services/
│   └── api.ts                # Mock API layer (GET /automations, POST /simulate)
│
├── utils/
│   └── serializer.ts         # Graph → payload serialization, cycle detection, BFS validator
│
├── store/
│   └── workflowStore.ts      # Zustand store — all canvas state, undo/redo via zundo
│
├── hooks/
│   ├── useWorkflow.ts        # Primary hook — wraps store + utils into a stable component API
│   └── useAutomations.ts     # Data fetching hook for mock /automations endpoint
│
└── components/
    ├── canvas/
    │   └── WorkflowCanvas.tsx    # React Flow wrapper, drag/drop, edge/node events
    ├── nodes/
    │   └── CustomNodes.tsx       # 5 typed custom node renderers + nodeTypes map
    ├── forms/
    │   └── NodeConfigForm.tsx    # Dynamic form renderer — one form per node type
    ├── sidebar/
    │   └── NodeSidebar.tsx       # Draggable node palette
    └── simulation/
        └── SimulationPanel.tsx   # Execution log modal
```

### Key design decisions

**1. Strict TypeScript for all node data**

Each node type has its own data interface (`StartNodeData`, `TaskNodeData`, etc.) rather than a loose `Record<string, unknown>`. This makes form components fully typed and makes extending to new node types explicit — you add a type, an interface, a default, and a form branch. The compiler catches missing cases.

**2. Zustand + temporal middleware for undo/redo**

The entire canvas state lives in a single Zustand store. `zundo`'s `temporal` wrapper gives us 50-step undo/redo at zero cost — no reducer boilerplate, no action history to maintain manually. The store exposes a clean imperative API (`addNode`, `moveNode`, `deleteEdge`) that hooks and components call without coupling to state internals.

**3. Separation of concerns: utils vs store vs hooks**

- `utils/serializer.ts` — pure functions, zero React, fully testable. Cycle detection, BFS ordering, graph → JSON serialization.
- `store/` — state only, no side effects, no API calls.
- `hooks/useWorkflow.ts` — the glue layer. It composes the store with utils and async API calls into a single ergonomic hook that components import. Components never import the store directly.
- `services/api.ts` — simulated network delay and mock data. Swap to a real fetch with the same function signature and nothing else changes.

**4. Dynamic form architecture**

Forms are driven by data, not conditionals. Each node type maps to a typed form component (`StartForm`, `TaskForm`, etc.). `NodeConfigForm` dispatches to the right one based on `node.type`. Adding a new node type means adding a new form component — no existing code changes. Automated node parameters are rendered dynamically from the API response, so adding a new action with new params requires no frontend code change.

**5. Graph validation**

Validation runs on every state update via `useWorkflow`. Checks performed:
- At least one Start node
- At most one Start node
- At least one End node
- Every non-Start node has an incoming connection
- Every non-End node has an outgoing connection
- No cycles (DFS-based)
- Automated nodes have an action selected
- Task nodes have a title

---

## Features

### Canvas
- Drag nodes from sidebar → drop on canvas
- Connect nodes via React Flow handles (bottom = source, top = target)
- Click an edge to delete it
- Delete key removes selected node
- Mini-map for navigation
- Zoom controls
- Auto-layout (BFS-based topological sort)

### Node Types

| Type | Purpose | Key fields |
|---|---|---|
| Start | Workflow entry point | Title, metadata key-values |
| Task | Human task | Title*, description, assignee, due date, custom fields |
| Approval | Manager sign-off | Title, approver role, auto-approve threshold |
| Automated Step | System action | Title, action (from API), dynamic params |
| End | Completion | End message, show summary toggle |

### Configuration Panel
Click any node to open its form on the right. Forms are controlled components with live state sync back to the store. Key-value editors support arbitrary metadata/custom fields.

### Mock API Layer

**`GET /automations`** — returns 6 mock actions (Send Email, Generate Document, Notify Slack, Update HRIS, Create Jira Ticket, Trigger Webhook), each with typed parameters rendered dynamically.

**`POST /simulate`** — accepts the full workflow JSON, performs BFS traversal, returns a step-by-step execution log with per-step status, description, and timestamp.

### Workflow Simulation
1. Validates the graph (blocks on structural errors)
2. Serializes nodes + edges to `WorkflowPayload`
3. Sends to mock `/simulate` endpoint
4. Displays animated execution log — one row per node in BFS order

### Export
"Export JSON" downloads the full `WorkflowPayload` (nodes, edges, metadata) as a `.json` file.

---

## Trade-offs and assumptions

**No backend persistence** — per spec. State lives in memory. A production version would call a REST/GraphQL API on every significant change or provide an explicit "Save" action.

**No authentication** — per spec.

**React Flow handles connection rendering** — I used React Flow's built-in edge system rather than a custom SVG layer. This gives us animated edges, click-to-delete, and built-in handle snapping for free, at the cost of being coupled to React Flow's internal node/edge shape.

**Zustand over Context API** — Context with `useReducer` would work but causes unnecessary re-renders across the tree. Zustand's selector-based subscriptions are more performant at scale and the temporal middleware for undo/redo was the deciding factor.

**Inline CSS over Tailwind** — Tailwind requires a build step and PostCSS config. For a time-boxed case study, inline styles + CSS variables give the same result with zero setup friction. In a real project I'd use Tailwind or CSS Modules.

**Mock API with simulated delay** — `getAutomations()` waits 300ms and `simulateWorkflow()` waits 600ms to simulate real network latency and exercise the loading states.

---

## What I would add with more time

- **Persist to localStorage** — save/load named workflow drafts
- **Node templates** — pre-built workflow blueprints (onboarding, leave approval, offboarding)
- **Edge labels** — conditional routing (e.g. "Approved" / "Rejected" branches from Approval node)
- **Parallel branches** — multiple outgoing edges from a single node
- **Node version history** — track changes to each node's configuration
- **Test coverage** — Jest unit tests for `serializer.ts`, `workflowStore.ts`, and form components
- **MSW integration** — replace the in-memory mock with a proper Service Worker mock for realistic API testing
- **Keyboard shortcuts** — Ctrl+Z undo (wired to zundo), Ctrl+E export, Space to pan

---

## Running locally

```bash
git clone <your-repo>
cd hr-workflow-designer
npm install
npm run dev
```

**Type check:**
```bash
npm run type-check
```

**Production build:**
```bash
npm run build
npm run preview
```


