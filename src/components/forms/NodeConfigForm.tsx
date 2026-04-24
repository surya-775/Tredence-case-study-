import React from 'react';
import type {
  WorkflowNode,
  NodeType,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
  AutomationAction,
  KeyValuePair,
} from '../../types/nodeTypes';

// ─── Shared form primitives ──────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 9px',
  borderRadius: 6,
  border: '0.5px solid #ccc',
  fontSize: 12,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  color: '#1a1a1a',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#777',
  marginBottom: 4,
  display: 'block',
  fontWeight: 600,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─── Key-value pair editor ───────────────────────────────────────────────────

function KVEditor({
  items,
  onChange,
}: {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
}) {
  const update = (i: number, key: keyof KeyValuePair, value: string) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [key]: value } : item);
    onChange(next);
  };
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Key" value={item.key}
            onChange={(e) => update(i, 'key', e.target.value)} />
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Value" value={item.value}
            onChange={(e) => update(i, 'value', e.target.value)} />
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            style={{ fontSize: 12, padding: '4px 7px', borderRadius: 5, border: '0.5px solid #ccc', background: '#f5f5f3', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, { key: '', value: '' }])}
        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, border: '0.5px solid #ccc', background: '#f5f5f3', cursor: 'pointer' }}>
        + Add field
      </button>
    </div>
  );
}

// ─── Per-type forms ──────────────────────────────────────────────────────────

function StartForm({ data, onUpdate }: { data: StartNodeData; onUpdate: (d: Partial<StartNodeData>) => void }) {
  return (
    <>
      <Field label="Start Title">
        <input style={inputStyle} value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })} />
      </Field>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingTop: 8, borderTop: '0.5px solid #eee' }}>Metadata</div>
      <KVEditor items={data.metadata} onChange={(metadata) => onUpdate({ metadata })} />
    </>
  );
}

function TaskForm({ data, onUpdate }: { data: TaskNodeData; onUpdate: (d: Partial<TaskNodeData>) => void }) {
  return (
    <>
      <Field label="Title *">
        <input style={inputStyle} value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 56 }} value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })} />
      </Field>
      <Field label="Assignee">
        <input style={inputStyle} placeholder="e.g. jane@company.com" value={data.assignee}
          onChange={(e) => onUpdate({ assignee: e.target.value })} />
      </Field>
      <Field label="Due Date">
        <input style={inputStyle} type="date" value={data.dueDate}
          onChange={(e) => onUpdate({ dueDate: e.target.value })} />
      </Field>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingTop: 8, borderTop: '0.5px solid #eee' }}>Custom Fields</div>
      <KVEditor items={data.customFields} onChange={(customFields) => onUpdate({ customFields })} />
    </>
  );
}

const APPROVER_ROLES: ApprovalNodeData['approverRole'][] = ['Manager', 'HRBP', 'Director', 'VP', 'C-Suite'];

function ApprovalForm({ data, onUpdate }: { data: ApprovalNodeData; onUpdate: (d: Partial<ApprovalNodeData>) => void }) {
  return (
    <>
      <Field label="Title">
        <input style={inputStyle} value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })} />
      </Field>
      <Field label="Approver Role">
        <select style={inputStyle} value={data.approverRole}
          onChange={(e) => onUpdate({ approverRole: e.target.value as ApprovalNodeData['approverRole'] })}>
          {APPROVER_ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </Field>
      <Field label="Auto-approve Threshold">
        <input style={inputStyle} type="number" min={1} max={10} value={data.threshold}
          onChange={(e) => onUpdate({ threshold: Number(e.target.value) })} />
      </Field>
    </>
  );
}

function AutomatedForm({
  data, onUpdate, automations,
}: {
  data: AutomatedNodeData;
  onUpdate: (d: Partial<AutomatedNodeData>) => void;
  automations: AutomationAction[];
}) {
  const selectedAction = automations.find((a) => a.id === data.actionId);
  return (
    <>
      <Field label="Title">
        <input style={inputStyle} value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })} />
      </Field>
      <Field label="Action">
        <select style={inputStyle} value={data.actionId}
          onChange={(e) => onUpdate({ actionId: e.target.value, params: {} })}>
          <option value="">Select action…</option>
          {automations.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
      </Field>
      {selectedAction && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingTop: 8, borderTop: '0.5px solid #eee' }}>Parameters</div>
          {selectedAction.params.map((param) => (
            <Field key={param} label={param}>
              <input style={inputStyle} placeholder={param} value={data.params[param] ?? ''}
                onChange={(e) => onUpdate({ params: { ...data.params, [param]: e.target.value } })} />
            </Field>
          ))}
          {selectedAction.description && (
            <div style={{ fontSize: 11, color: '#888', background: '#f8f8f6', padding: '6px 8px', borderRadius: 6, marginTop: 4 }}>
              {selectedAction.description}
            </div>
          )}
        </>
      )}
    </>
  );
}

function EndForm({ data, onUpdate }: { data: EndNodeData; onUpdate: (d: Partial<EndNodeData>) => void }) {
  return (
    <>
      <Field label="End Message">
        <input style={inputStyle} value={data.endMessage}
          onChange={(e) => onUpdate({ endMessage: e.target.value })} />
      </Field>
      <Field label="Show Summary">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <input type="checkbox" checked={data.showSummary}
            onChange={(e) => onUpdate({ showSummary: e.target.checked })} />
          Include execution summary
        </label>
      </Field>
    </>
  );
}

// ─── Form config map — easily extend for new node types ─────────────────────

type FormProps = {
  node: WorkflowNode;
  onUpdate: (data: Partial<WorkflowNode['data']>) => void;
  automations: AutomationAction[];
  onDelete: () => void;
};

const NODE_COLORS: Record<NodeType, { dot: string; label: string }> = {
  start:     { dot: '#639922', label: 'Start' },
  task:      { dot: '#185FA5', label: 'Task' },
  approval:  { dot: '#BA7517', label: 'Approval' },
  automated: { dot: '#533AB7', label: 'Automated Step' },
  end:       { dot: '#A32D2D', label: 'End' },
};

export function NodeConfigForm({ node, onUpdate, automations, onDelete }: FormProps) {
  const color = NODE_COLORS[node.type];

  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color.dot }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>{color.label} Configuration</span>
      </div>

      {node.type === 'start' && (
        <StartForm data={node.data as StartNodeData} onUpdate={onUpdate} />
      )}
      {node.type === 'task' && (
        <TaskForm data={node.data as TaskNodeData} onUpdate={onUpdate} />
      )}
      {node.type === 'approval' && (
        <ApprovalForm data={node.data as ApprovalNodeData} onUpdate={onUpdate} />
      )}
      {node.type === 'automated' && (
        <AutomatedForm data={node.data as AutomatedNodeData} onUpdate={onUpdate} automations={automations} />
      )}
      {node.type === 'end' && (
        <EndForm data={node.data as EndNodeData} onUpdate={onUpdate} />
      )}

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '0.5px solid #eee' }}>
        <button
          onClick={onDelete}
          style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '0.5px solid #F7C1C1', background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Delete node
        </button>
      </div>
    </div>
  );
}
