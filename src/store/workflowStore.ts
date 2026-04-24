import { create } from 'zustand';
import { temporal } from 'zundo';
import type {
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  NodeData,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../types/nodeTypes';

// ─── Default data per node type ──────────────────────────────────────────────

export const defaultNodeData: Record<NodeType, NodeData> = {
  start: { title: 'Start', metadata: [] } satisfies StartNodeData,
  task: {
    title: 'New Task',
    description: '',
    assignee: '',
    dueDate: '',
    customFields: [],
  } satisfies TaskNodeData,
  approval: {
    title: 'Approval Step',
    approverRole: 'Manager',
    threshold: 1,
  } satisfies ApprovalNodeData,
  automated: {
    title: 'Automated Action',
    actionId: '',
    params: {},
  } satisfies AutomatedNodeData,
  end: {
    title: 'End',
    endMessage: 'Workflow complete.',
    showSummary: true,
  } satisfies EndNodeData,
};

// ─── Store interface ─────────────────────────────────────────────────────────

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  nodeCounter: number;
  edgeCounter: number;

  // Node actions
  addNode: (type: NodeType, position: { x: number; y: number }) => WorkflowNode;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;

  // Edge actions
  addEdge: (source: string, target: string) => WorkflowEdge | null;
  deleteEdge: (id: string) => void;

  // Selection
  selectNode: (id: string | null) => void;

  // Canvas
  clearCanvas: () => void;
}

// ─── Store implementation ────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      nodeCounter: 0,
      edgeCounter: 0,

      addNode(type, position) {
        const { nodeCounter, nodes } = get();
        const id = `node_${nodeCounter + 1}`;
        const newNode: WorkflowNode = {
          id,
          type,
          position,
          data: structuredClone(defaultNodeData[type]),
        };
        set({ nodes: [...nodes, newNode], nodeCounter: nodeCounter + 1 });
        return newNode;
      },

      updateNode(id, partialData) {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...partialData } } : n
          ),
        }));
      },

      deleteNode(id) {
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        }));
      },

      moveNode(id, position) {
        set((state) => ({
          nodes: state.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
        }));
      },

      addEdge(source, target) {
        const { edges, edgeCounter, nodes } = get();

        // Guards
        const sourceNode = nodes.find((n) => n.id === source);
        const targetNode = nodes.find((n) => n.id === target);
        if (!sourceNode || !targetNode) return null;
        if (source === target) return null;
        if (targetNode.type === 'start') return null;
        if (sourceNode.type === 'end') return null;
        if (edges.find((e) => e.source === source && e.target === target)) return null;

        const id = `edge_${edgeCounter + 1}`;
        const newEdge: WorkflowEdge = { id, source, target };
        set({ edges: [...edges, newEdge], edgeCounter: edgeCounter + 1 });
        return newEdge;
      },

      deleteEdge(id) {
        set((state) => ({ edges: state.edges.filter((e) => e.id !== id) }));
      },

      selectNode(id) {
        set({ selectedNodeId: id });
      },

      clearCanvas() {
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          nodeCounter: 0,
          edgeCounter: 0,
        });
      },
    }),
    { limit: 50 } // keep 50 undo steps
  )
);
