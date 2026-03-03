// HITL Panel Component

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, CheckCircle, XCircle, Send, AlertCircle } from 'lucide-react';
import { hitlApi } from '@/api/client';

interface HITLRequest {
  id: string;
  executionId: string;
  nodeId: string;
  type: 'approval' | 'input' | 'selection';
  status: string;
  requestData: {
    type: string;
    message: string;
    details?: string;
    fields?: Array<{ name: string; label: string; type: string; required?: boolean }>;
    options?: Array<{ label: string; value: string }>;
    timeoutSeconds?: number;
  };
  expiresAt?: string;
  createdAt: string;
}

interface HITLPanelProps {
  request: HITLRequest;
  onResolved: () => void;
}

export function HITLPanel({ request, onResolved }: HITLPanelProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');

  const respondMutation = useMutation({
    mutationFn: (response: { action: string; data?: any; reason?: string }) =>
      hitlApi.respond(request.id, response),
    onSuccess: () => {
      onResolved();
    },
  });

  const handleApprove = () => {
    respondMutation.mutate({ action: 'approve' });
  };

  const handleReject = () => {
    respondMutation.mutate({ action: 'reject', reason: 'Rejected by user' });
  };

  const handleSubmitInput = () => {
    respondMutation.mutate({ action: 'submit', data: formData });
  };

  const handleSubmitSelection = () => {
    respondMutation.mutate({ action: 'submit', data: { selection: selectedOption } });
  };

  const { requestData } = request;
  const isExpired = request.expiresAt && new Date(request.expiresAt) < new Date();

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-card rounded-lg shadow-xl border border-amber-200 dark:border-amber-800 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={20} />
            <span className="font-medium text-amber-800 dark:text-amber-300">
              {requestData.type === 'approval' && 'Approval Required'}
              {requestData.type === 'input' && 'Input Required'}
              {requestData.type === 'selection' && 'Selection Required'}
            </span>
          </div>
          <button
            onClick={onResolved}
            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded text-amber-600 dark:text-amber-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Message */}
        <p className="text-foreground font-medium mb-2">{requestData.message}</p>

        {/* Details */}
        {requestData.details && (
          <p className="text-sm text-muted-foreground mb-4">{requestData.details}</p>
        )}

        {/* Node info */}
        <p className="text-xs text-muted-foreground mb-4">
          Node: {request.nodeId}
        </p>

        {isExpired ? (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-sm">
            This request has expired
          </div>
        ) : (
          <>
            {/* Approval type */}
            {requestData.type === 'approval' && (
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={respondMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={respondMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            )}

            {/* Input type */}
            {requestData.type === 'input' && requestData.fields && (
              <div className="space-y-3">
                {requestData.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-ring transition-colors"
                        rows={3}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-ring transition-colors"
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={handleSubmitInput}
                  disabled={respondMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Send size={16} />
                  Submit
                </button>
              </div>
            )}

            {/* Selection type */}
            {requestData.type === 'selection' && requestData.options && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {requestData.options.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                        selectedOption === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selection"
                        value={option.value}
                        checked={selectedOption === option.value}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleSubmitSelection}
                  disabled={respondMutation.isPending || !selectedOption}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Send size={16} />
                  Submit Selection
                </button>
              </div>
            )}
          </>
        )}

        {/* Error */}
        {respondMutation.isError && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded">
            Failed to submit response
          </div>
        )}
      </div>
    </div>
  );
}
