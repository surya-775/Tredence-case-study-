import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { NodeSidebar } from './components/sidebar/NodeSidebar';
import { NodeConfigForm } from './components/forms/NodeConfigForm';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { useWorkflow } from './hooks/useWorkflow';
import { useAutomations } from './hooks/useAutomations';
import type { SimulationResult } from './types/nodeTypes';

export default function App() {
  const workflow = useWorkflow();
  const { automations } = useAutomations();

  const [simOpen, setSimOpen] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simErrors, setSimErrors] = useState<string[]>([]);

  async function handleRunSimulation() {
    const { valid, errors } = workflow.validation;
    setSimOpen(true);

    if (!valid) {
      setSimErrors(errors.map((e) => e.message));
      setSimResult(null);
      return;
    }

    setSimErrors([]);
    setSimLoading(true);
    try {
      const result = await workflow.runSimulation();
      setSimResult(result);
    } catch (err) {
      setSimErrors([String(err)]);
    } finally {
      setSimLoading(false);
    }
  }

  const statusColor = workflow.validation.valid
    ? '#3B6D11'
    : workflow.nodes.length === 0
    ? '#888'
    : '#854F0B';

  const statusText = workflow.nodes.length === 0
    ? 'Drop nodes to start building'
    : workflow.validation.valid
    ? '✓ Valid workflow'
    : `⚠ ${workflow.validation.errors[0]?.message ?? 'Fix errors'}`;

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>

        {/* Top bar */}
        <header style={{ height: 48, background: '#fff', borderBottom: '0.5px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect width="18" height="18" rx="4" fill="#185FA5" />
              <path d="M5 9h8M9 5v8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 500 }}>HR Workflow Designer</span>
          </div>
          <div style={{ width: '0.5px', height: 20, background: '#e0e0e0' }} />
          <span style={{ fontSize: 12, color: '#888' }}>Tredence Studio</span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#E6F1FB', color: '#185FA5', fontWeight: 500 }}>
            {workflow.nodes.length} node{workflow.nodes.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#EAF3DE', color: '#3B6D11', fontWeight: 500 }}>
            {workflow.edges.length} edge{workflow.edges.length !== 1 ? 's' : ''}
          </span>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={workflow.exportAsJSON} style={btnStyle}>Export JSON</button>
            <button onClick={workflow.clearCanvas} style={btnStyle}>Clear</button>
            <button onClick={handleRunSimulation} style={{ ...btnStyle, background: '#185FA5', color: '#fff', borderColor: '#185FA5' }}>
              ▶ Run Workflow
            </button>
          </div>
        </header>

        {/* Main layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <NodeSidebar />

          <WorkflowCanvas onNodeSelect={workflow.selectNode} />

          {/* Right config panel */}
          <aside style={{ width: 280, background: '#fff', borderLeft: '0.5px solid #e0e0e0', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #e0e0e0', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="12" height="12" rx="3" stroke="#888" strokeWidth="1.2" />
                <path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#888" strokeWidth="1" strokeLinecap="round" />
              </svg>
              Configuration
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {workflow.selectedNode ? (
                <NodeConfigForm
                  node={workflow.selectedNode}
                  onUpdate={(data) => workflow.updateNode(workflow.selectedNode!.id, data)}
                  automations={automations}
                  onDelete={() => workflow.deleteNode(workflow.selectedNode!.id)}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 24, color: '#aaa', fontSize: 12, gap: 8 }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="4" width="24" height="24" rx="6" stroke="#ddd" strokeWidth="1.5" />
                    <path d="M10 16h12M10 11h12M10 21h8" stroke="#ddd" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  Select a node to configure it
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Status bar */}
        <div style={{ height: 24, background: '#f8f8f6', borderTop: '0.5px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 16, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: statusColor }}>{statusText}</span>
          <span style={{ fontSize: 10, color: '#ccc' }}>·</span>
          <span style={{ fontSize: 10, color: '#aaa' }}>Click edge to delete · Delete key removes selected node</span>
        </div>

        {/* Simulation modal */}
        {simOpen && (
          <SimulationPanel
            result={simResult}
            loading={simLoading}
            errors={simErrors}
            onClose={() => setSimOpen(false)}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
}

const btnStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '5px 12px',
  borderRadius: 6,
  border: '0.5px solid #ccc',
  background: '#fff',
  color: '#1a1a1a',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
