import React from 'react';
import type { SimulationResult, NodeType } from '../../types/nodeTypes';

const NODE_COLORS: Record<NodeType, { bg: string; text: string }> = {
  start:     { bg: '#EAF3DE', text: '#3B6D11' },
  task:      { bg: '#E6F1FB', text: '#185FA5' },
  approval:  { bg: '#FAEEDA', text: '#854F0B' },
  automated: { bg: '#EEEDFE', text: '#534AB7' },
  end:       { bg: '#FCEBEB', text: '#A32D2D' },
};

interface SimulationPanelProps {
  result: SimulationResult | null;
  loading: boolean;
  errors: string[];
  onClose: () => void;
}

export function SimulationPanel({ result, loading, errors, onClose }: SimulationPanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          width: 500,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          border: '0.5px solid #ddd',
          overflow: 'hidden',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Workflow Simulation</div>
            {result && (
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                Executed in {result.totalDurationMs}ms · {result.steps.length} steps
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '0.5px solid #ccc', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            Close
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: 32, color: '#888', fontSize: 13 }}>
              Simulating workflow…
            </div>
          )}

          {/* Validation errors */}
          {!loading && errors.length > 0 && (
            <div style={{ background: '#FCEBEB', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#A32D2D', marginBottom: 6 }}>Validation failed</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#A32D2D' }}>
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Results */}
          {!loading && result && result.steps.map((step, i) => {
            const c = NODE_COLORS[step.nodeType] ?? { bg: '#f5f5f3', text: '#555' };
            return (
              <div
                key={step.nodeId}
                style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start', animation: `fadeIn 0.3s ease ${i * 0.06}s both` }}
              >
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{step.description}</div>
                  <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: c.bg, color: c.text, fontWeight: 500 }}>
                      {step.nodeType}
                    </span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#EAF3DE', color: '#3B6D11', fontWeight: 500 }}>
                      ✓ {step.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary */}
          {!loading && result && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8f8f6', borderRadius: 8, fontSize: 12, color: '#555' }}>
              <strong>Simulation complete.</strong> {result.steps.length} steps executed successfully.
              {result.steps.find((s) => s.nodeType === 'end') && (
                <span> · {result.steps.find((s) => s.nodeType === 'end')?.description}</span>
              )}
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}
