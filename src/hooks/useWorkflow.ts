import { useCallback } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { validateWorkflow, serializeWorkflow } from '../utils/serializer';
import { simulateWorkflow } from '../services/api';
import type { NodeType, WorkflowPayload, SimulationResult } from '../types/nodeTypes';

/**
 * Primary hook for workflow canvas interactions.
 * Wraps the store + utilities into a clean, stable API for components.
 */
export function useWorkflow() {
  const store = useWorkflowStore();

  const validation = validateWorkflow(store.nodes, store.edges);

  const dropNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      return store.addNode(type, position);
    },
    [store]
  );

  const connectNodes = useCallback(
    (sourceId: string, targetId: string) => {
      return store.addEdge(sourceId, targetId);
    },
    [store]
  );

  const serialize = useCallback((): WorkflowPayload => {
    return serializeWorkflow(store.nodes, store.edges);
  }, [store.nodes, store.edges]);

  const runSimulation = useCallback(async (): Promise<SimulationResult> => {
    const payload = serialize();
    return simulateWorkflow(payload);
  }, [serialize]);

  const exportAsJSON = useCallback(() => {
    const payload = serialize();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `workflow-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [serialize]);

  const selectedNode = store.nodes.find((n) => n.id === store.selectedNodeId) ?? null;

  return {
    // State
    nodes: store.nodes,
    edges: store.edges,
    selectedNode,
    selectedNodeId: store.selectedNodeId,
    validation,

    // Node actions
    dropNode,
    updateNode: store.updateNode,
    deleteNode: store.deleteNode,
    moveNode: store.moveNode,

    // Edge actions
    connectNodes,
    deleteEdge: store.deleteEdge,

    // Selection
    selectNode: store.selectNode,

    // Canvas
    clearCanvas: store.clearCanvas,

    // Workflow ops
    runSimulation,
    exportAsJSON,
    serialize,
  };
}
