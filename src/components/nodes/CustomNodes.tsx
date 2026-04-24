import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../../types/nodeTypes';

// ─── Shared node wrapper ─────────────────────────────────────────────────────

interface NodeShellProps {
  color: string;
  bg: string;
  textColor: string;
  label: string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  showIn?: boolean;
  showOut?: boolean;
  children?: React.ReactNode;
}

function NodeShell({
  color, bg, textColor, label, title, subtitle, selected,
  showIn = true, showOut = true, children,
}: NodeShellProps) {
  return (
    <div
      className={`flow-node-shell ${selected ? 'selected' : ''}`}
      style={{
        background: '#fff',
        border: `1.5px solid ${selected ? '#185FA5' : '#ddd'}`,
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 150,
        boxShadow: selected
          ? '0 0 0 3px rgba(24,95,165,0.15)'
          : '0 1px 4px rgba(0,0,0,0.07)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {showIn && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#639922', width: 10, height: 10, border: '2px solid #fff' }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
          {title}
        </span>
      </div>
      {subtitle && (
        <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{subtitle}</div>
      )}
      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: bg, color: textColor, fontWeight: 500, display: 'inline-block' }}>
        {label}
      </span>
      {children}
      {showOut && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#185FA5', width: 10, height: 10, border: '2px solid #fff' }}
        />
      )}
    </div>
  );
}

// ─── Start Node ──────────────────────────────────────────────────────────────

export const StartNode = memo(({ data, selected }: NodeProps<StartNodeData>) => (
  <NodeShell
    color="#639922" bg="#EAF3DE" textColor="#3B6D11"
    label="Start" title={data.title || 'Start'}
    subtitle={data.metadata?.length ? `${data.metadata.length} metadata fields` : undefined}
    selected={selected} showIn={false}
  />
));

// ─── Task Node ───────────────────────────────────────────────────────────────

export const TaskNode = memo(({ data, selected }: NodeProps<TaskNodeData>) => (
  <NodeShell
    color="#185FA5" bg="#E6F1FB" textColor="#185FA5"
    label="Task" title={data.title || 'Task'}
    subtitle={data.assignee ? `→ ${data.assignee}` : data.description || undefined}
    selected={selected}
  />
));

// ─── Approval Node ───────────────────────────────────────────────────────────

export const ApprovalNode = memo(({ data, selected }: NodeProps<ApprovalNodeData>) => (
  <NodeShell
    color="#BA7517" bg="#FAEEDA" textColor="#854F0B"
    label="Approval" title={data.title || 'Approval'}
    subtitle={`${data.approverRole} · threshold ${data.threshold}`}
    selected={selected}
  />
));

// ─── Automated Node ──────────────────────────────────────────────────────────

export const AutomatedNode = memo(({ data, selected }: NodeProps<AutomatedNodeData>) => (
  <NodeShell
    color="#533AB7" bg="#EEEDFE" textColor="#534AB7"
    label="Automated" title={data.title || 'Automated'}
    subtitle={data.actionId ? data.actionId.replace(/_/g, ' ') : 'No action set'}
    selected={selected}
  />
));

// ─── End Node ────────────────────────────────────────────────────────────────

export const EndNode = memo(({ data, selected }: NodeProps<EndNodeData>) => (
  <NodeShell
    color="#A32D2D" bg="#FCEBEB" textColor="#A32D2D"
    label="End" title={data.title || 'End'}
    subtitle={data.endMessage || undefined}
    selected={selected} showOut={false}
  />
));

// ─── nodeTypes map for React Flow ────────────────────────────────────────────

export const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};
