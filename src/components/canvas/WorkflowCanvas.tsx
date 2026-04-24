import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from '../nodes/CustomNodes';
import { useWorkflowStore } from '../../store/workflowStore';
import type { NodeType } from '../../types/nodeTypes';
import { defaultNodeData } from '../../store/workflowStore';

let nodeId = 0;
const getNodeId = () => `node_${++nodeId}`;

interface WorkflowCanvasProps {
  onNodeSelect: (id: string | null) => void;
}

export function WorkflowCanvas({ onNodeSelect }: WorkflowCanvasProps) {
  const store = useWorkflowStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = React.useState<any>(null);

  // Convert store nodes → React Flow nodes
  const rfNodes: Node[] = store.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
    selected: n.id === store.selectedNodeId,
  }));

  // Convert store edges → React Flow edges
  const rfEdges: Edge[] = store.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: false,
    style: { stroke: '#185FA5', strokeWidth: 1.5, opacity: 0.7 },
    markerEnd: { type: 'arrowclosed' as any, color: '#185FA5' },
  }));

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        store.addEdge(connection.source, connection.target);
      }
    },
    [store]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      store.selectNode(node.id);
      onNodeSelect(node.id);
    },
    [store, onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    store.selectNode(null);
    onNodeSelect(null);
  }, [store, onNodeSelect]);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      store.moveNode(node.id, node.position);
    },
    [store]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (window.confirm('Delete this connection?')) {
        store.deleteEdge(edge.id);
      }
    },
    [store]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !rfInstance || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      store.addNode(type, position);
    },
    [rfInstance, store]
  );

  return (
    <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e0e0e0" />
        <Controls />
        <MiniMap
          nodeStrokeWidth={2}
          style={{ background: '#f8f8f6', border: '0.5px solid #e0e0e0' }}
        />
      </ReactFlow>
    </div>
  );
}
