import type {
  AutomationAction,
  SimulationResult,
  SimulationStep,
  WorkflowPayload,
  WorkflowNode,
  WorkflowEdge,
} from '../types/nodeTypes';

// ─── Simulated network delay ─────────────────────────────────────────────────

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_AUTOMATIONS: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: ['to', 'subject', 'body'],
    description: 'Sends an email via the internal mail relay',
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    params: ['template', 'recipient'],
    description: 'Renders a PDF document from a predefined template',
  },
  {
    id: 'notify_slack',
    label: 'Notify Slack',
    params: ['channel', 'message'],
    description: 'Posts a message to a Slack channel',
  },
  {
    id: 'update_hris',
    label: 'Update HRIS',
    params: ['employeeId', 'field', 'value'],
    description: 'Updates a field in the HR information system',
  },
  {
    id: 'create_jira_ticket',
    label: 'Create Jira Ticket',
    params: ['project', 'summary', 'assignee'],
    description: 'Creates a Jira task in the specified project',
  },
  {
    id: 'trigger_webhook',
    label: 'Trigger Webhook',
    params: ['url', 'method', 'payload'],
    description: 'Fires an HTTP request to an external endpoint',
  },
];

// ─── Topology sort (BFS) ─────────────────────────────────────────────────────

function bfsOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((n) => { adjacency.set(n.id, []); inDegree.set(n.id, 0); });
  edges.forEach((e) => {
    adjacency.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });

  const order: WorkflowNode[] = [];
  const visited = new Set<string>();

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

function describeStep(node: WorkflowNode, automations: AutomationAction[]): string {
  const data = node.data as Record<string, unknown>;
  switch (node.type) {
    case 'start':
      return `Workflow "${data.title}" initiated.`;
    case 'task': {
      const assignee = data.assignee ? `Assigned to ${data.assignee}.` : 'Unassigned.';
      const due = data.dueDate ? ` Due: ${data.dueDate}.` : '';
      return `${assignee}${due}`;
    }
    case 'approval':
      return `Routing to ${data.approverRole} for approval (threshold: ${data.threshold}).`;
    case 'automated': {
      const action = automations.find((a) => a.id === data.actionId);
      return action ? `Executing "${action.label}".` : 'No action configured.';
    }
    case 'end':
      return String(data.endMessage || 'Workflow complete.');
    default:
      return '';
  }
}

// ─── API Surface ─────────────────────────────────────────────────────────────

/**
 * GET /automations
 * Returns the list of available automated actions.
 */
export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return MOCK_AUTOMATIONS;
}

/**
 * POST /simulate
 * Accepts a workflow payload and returns a step-by-step execution log.
 */
export async function simulateWorkflow(
  payload: WorkflowPayload
): Promise<SimulationResult> {
  await delay(600);

  const start = Date.now();
  const automations = MOCK_AUTOMATIONS;
  const ordered = bfsOrder(payload.nodes, payload.edges);

  const steps: SimulationStep[] = ordered.map((node) => ({
    nodeId: node.id,
    nodeType: node.type,
    title: (node.data as Record<string, unknown>).title as string ?? node.type,
    status: 'success',
    description: describeStep(node, automations),
    timestamp: new Date().toISOString(),
  }));

  return {
    success: true,
    steps,
    errors: [],
    executedAt: new Date().toISOString(),
    totalDurationMs: Date.now() - start,
  };
}
