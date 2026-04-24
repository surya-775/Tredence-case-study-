import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowPayload,
  ValidationResult,
  ValidationError,
} from '../types/nodeTypes';

// ─── Serializer ──────────────────────────────────────────────────────────────

/**
 * Converts the live canvas state into the API payload shape.
 */
export function serializeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowPayload {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

// ─── Cycle detection (DFS) ───────────────────────────────────────────────────

function hasCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => adjacency.set(n.id, []));
  edges.forEach((e) => adjacency.get(e.source)?.push(e.target));

  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(id: string): boolean {
    if (stack.has(id)) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    stack.add(id);
    for (const neighbor of adjacency.get(id) ?? []) {
      if (dfs(neighbor)) return true;
    }
    stack.delete(id);
    return false;
  }

  return nodes.some((n) => dfs(n.id));
}

// ─── Validator ───────────────────────────────────────────────────────────────

/**
 * Validates the workflow graph for structural correctness.
 * Returns a list of human-readable errors.
 */
export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  const errors: ValidationError[] = [];

  if (nodes.length === 0) {
    return { valid: false, errors: [{ message: 'Canvas is empty', severity: 'error' }] };
  }

  const starts = nodes.filter((n) => n.type === 'start');
  const ends = nodes.filter((n) => n.type === 'end');

  if (starts.length === 0)
    errors.push({ message: 'Workflow must have a Start node', severity: 'error' });
  if (starts.length > 1)
    errors.push({ message: 'Only one Start node is allowed', severity: 'error' });
  if (ends.length === 0)
    errors.push({ message: 'Workflow must have an End node', severity: 'error' });

  // Check connectivity
  nodes.forEach((node) => {
    const hasIncoming = edges.some((e) => e.target === node.id);
    const hasOutgoing = edges.some((e) => e.source === node.id);

    if (node.type !== 'start' && !hasIncoming) {
      errors.push({
        nodeId: node.id,
        message: `"${(node.data as Record<string, unknown>).title ?? node.type}" has no incoming connection`,
        severity: 'error',
      });
    }
    if (node.type !== 'end' && !hasOutgoing) {
      errors.push({
        nodeId: node.id,
        message: `"${(node.data as Record<string, unknown>).title ?? node.type}" has no outgoing connection`,
        severity: 'error',
      });
    }
  });

  // Automated nodes must have an action
  nodes
    .filter((n) => n.type === 'automated')
    .forEach((n) => {
      const data = n.data as Record<string, unknown>;
      if (!data.actionId) {
        errors.push({
          nodeId: n.id,
          message: `Automated node "${data.title}" has no action selected`,
          severity: 'warning',
        });
      }
    });

  // Task nodes must have a title
  nodes
    .filter((n) => n.type === 'task')
    .forEach((n) => {
      const data = n.data as Record<string, unknown>;
      if (!data.title) {
        errors.push({
          nodeId: n.id,
          message: 'A Task node is missing a title',
          severity: 'error',
        });
      }
    });

  if (hasCycle(nodes, edges)) {
    errors.push({ message: 'Workflow contains a cycle — remove the loop', severity: 'error' });
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  };
}

// ─── BFS execution order ─────────────────────────────────────────────────────

export function getExecutionOrder(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => adjacency.set(n.id, []));
  edges.forEach((e) => adjacency.get(e.source)?.push(e.target));

  const starts = nodes.filter((n) => n.type === 'start');
  const queue = starts.map((n) => n.id);
  const visited = new Set<string>();
  const order: WorkflowNode[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr)) continue;
    visited.add(curr);
    const node = nodes.find((n) => n.id === curr);
    if (node) order.push(node);
    adjacency.get(curr)?.forEach((next) => {
      if (!visited.has(next)) queue.push(next);
    });
  }

  return order;
}
