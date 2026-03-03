// Node Configuration Panel

import type { Node } from 'reactflow';
import { X } from 'lucide-react';

interface NodeConfigPanelProps {
  nodeId: string;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onClose: () => void;
}

export function NodeConfigPanel({ nodeId, nodes, setNodes, onClose }: NodeConfigPanelProps) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const updateNodeData = (newData: any) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: newData } : n))
    );
  };

  const handleNameChange = (name: string) => {
    updateNodeData({ ...node.data, name });
  };

  const handleConfigChange = (key: string, value: any) => {
    updateNodeData({
      ...node.data,
      config: { ...node.data.config, [key]: value },
    });
  };

  return (
    <div className="w-80 bg-card border-l border-border overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Configure Node</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Node Type */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
          <div className="text-sm text-foreground bg-muted px-3 py-2 rounded">
            {node.type}
          </div>
        </div>

        {/* Node Name */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
          <input
            type="text"
            value={node.data.name || ''}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={node.type}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>

        {/* Node-specific config */}
        <NodeConfig type={node.type || ''} config={node.data.config} onChange={handleConfigChange} />
      </div>
    </div>
  );
}

// Node-specific configuration forms
function NodeConfig({
  type,
  config,
  onChange,
}: {
  type: string;
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const inputClass = "w-full px-3 py-2 border border-input bg-background text-foreground rounded focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1";

  switch (type) {
    case 'http-request':
      return (
        <>
          <div>
            <label className={labelClass}>Method</label>
            <select
              value={config.method || 'GET'}
              onChange={(e) => onChange('method', e.target.value)}
              className={inputClass}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>URL</label>
            <input
              type="text"
              value={config.url || ''}
              onChange={(e) => onChange('url', e.target.value)}
              placeholder="https://api.example.com"
              className={inputClass}
            />
          </div>
        </>
      );

    case 'code':
      return (
        <div>
          <label className={labelClass}>Code</label>
          <textarea
            value={config.code || ''}
            onChange={(e) => onChange('code', e.target.value)}
            placeholder="// Your JavaScript code here"
            rows={10}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>
      );

    case 'agent':
      return (
        <>
          <div>
            <label className={labelClass}>Provider</label>
            <select
              value={config.provider || 'openai'}
              onChange={(e) => onChange('provider', e.target.value)}
              className={inputClass}
            >
              <option value="openai">OpenAI</option>
              <option value="openclaw">OpenClaw CLI</option>
            </select>
          </div>
          {config.provider === 'openclaw' && (
            <div>
              <label className={labelClass}>Agent ID</label>
              <input
                type="text"
                value={config.agentId || ''}
                onChange={(e) => onChange('agentId', e.target.value)}
                placeholder="agent-xxx"
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Model</label>
            <input
              type="text"
              value={config.model || ''}
              onChange={(e) => onChange('model', e.target.value)}
              placeholder={config.provider === 'openclaw' ? 'claude-3-5-sonnet' : 'gpt-4o-mini'}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>System Prompt</label>
            <textarea
              value={config.systemPrompt || ''}
              onChange={(e) => onChange('systemPrompt', e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Message</label>
            <textarea
              value={config.message || ''}
              onChange={(e) => onChange('message', e.target.value)}
              placeholder="Message to send (or leave empty to use input)"
              rows={4}
              className={inputClass}
            />
          </div>
          {config.provider !== 'openclaw' && (
            <div>
              <label className={labelClass}>
                Temperature: {config.temperature ?? 0.7}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature ?? 0.7}
                onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Timeout (seconds)</label>
            <input
              type="number"
              value={config.timeout || 180}
              onChange={(e) => onChange('timeout', parseInt(e.target.value))}
              className={inputClass}
            />
          </div>
        </>
      );

    case 'hitl':
      return (
        <>
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={config.type || 'approval'}
              onChange={(e) => onChange('type', e.target.value)}
              className={inputClass}
            >
              <option value="approval">Approval</option>
              <option value="input">Input</option>
              <option value="selection">Selection</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Message</label>
            <input
              type="text"
              value={config.message || ''}
              onChange={(e) => onChange('message', e.target.value)}
              placeholder="Approval required"
              className={inputClass}
            />
          </div>
        </>
      );

    case 'schedule-trigger':
      return (
        <div>
          <label className={labelClass}>Cron Expression</label>
          <input
            type="text"
            value={config.cronExpression || ''}
            onChange={(e) => onChange('cronExpression', e.target.value)}
            placeholder="0 9 * * *"
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground mt-1">e.g., "0 9 * * *" for every day at 9 AM</p>
        </div>
      );

    default:
      return (
        <div className="text-sm text-muted-foreground">
          No additional configuration for this node type.
        </div>
      );
  }
}
