import React from 'react';
import type { NodeType } from '../../types/nodeTypes';

const NODE_PALETTE: { type: NodeType; label: string; color: string; description: string }[] = [
  { type: 'start',     label: 'Start',          color: '#639922', description: 'Workflow entry point' },
  { type: 'task',      label: 'Task',            color: '#185FA5', description: 'Human task assignment' },
  { type: 'approval',  label: 'Approval',        color: '#BA7517', description: 'Manager/HR approval' },
  { type: 'automated', label: 'Automated Step',  color: '#533AB7', description: 'System-triggered action' },
  { type: 'end',       label: 'End',             color: '#A32D2D', description: 'Workflow completion' },
];

function onDragStart(event: React.DragEvent, nodeType: NodeType) {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
}

export function NodeSidebar() {
  return (
    <aside
      style={{
        width: 200,
        background: '#fff',
        borderRight: '0.5px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '10px 12px 4px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Node Types
        </div>
        {NODE_PALETTE.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              borderRadius: 6,
              border: '0.5px solid #e8e8e8',
              background: '#fff',
              cursor: 'grab',
              marginBottom: 6,
              userSelect: 'none',
              transition: 'background 0.12s, border-color 0.12s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = '#f8f8f6';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#ccc';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = '#fff';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e8e8';
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>{item.label}</div>
              <div style={{ fontSize: 10, color: '#888' }}>{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '0.5px solid #e0e0e0', marginTop: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Quick Guide
        </div>
        {[
          '1. Drag nodes to canvas',
          '2. Connect via edge handles',
          '3. Click node to configure',
          '4. Run to simulate',
        ].map((tip) => (
          <div key={tip} style={{ fontSize: 11, color: '#999', lineHeight: 1.8 }}>{tip}</div>
        ))}
      </div>
    </aside>
  );
}
