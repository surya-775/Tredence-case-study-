// ─── Core Node Types ────────────────────────────────────────────────────────

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

// ─── Per-node data shapes ────────────────────────────────────────────────────

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface StartNodeData {
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  title: string;
  approverRole: 'Manager' | 'HRBP' | 'Director' | 'VP' | 'C-Suite';
  threshold: number;
}

export interface AutomatedNodeData {
  title: string;
  actionId: string;
  params: Record<string, string>;
}

export interface EndNodeData {
  title: string;
  endMessage: string;
  showSummary: boolean;
}

export type NodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

// ─── Workflow Node (React Flow compatible) ───────────────────────────────────

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  selected?: boolean;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

// ─── API types ───────────────────────────────────────────────────────────────

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
  description?: string;
}

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  title: string;
  status: 'success' | 'skipped' | 'error';
  description: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
  executedAt: string;
  totalDurationMs: number;
}

export interface WorkflowPayload {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    createdAt: string;
    version: string;
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
