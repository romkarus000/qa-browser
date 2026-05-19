import type { ApiErrorBody } from './types';

export class AgentClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly body?: ApiErrorBody;

  constructor(message: string, code = 'AGENT_ERROR', status = 0, body?: ApiErrorBody) {
    super(message);
    this.name = 'AgentClientError';
    this.code = code;
    this.status = status;
    this.body = body;
  }
}

export function parseAgentError(status: number, payload: unknown): AgentClientError {
  if (payload && typeof payload === 'object' && 'error' in payload && 'message' in payload) {
    const body = payload as ApiErrorBody;
    return new AgentClientError(body.message, body.error, status, body);
  }
  return new AgentClientError(
    typeof payload === 'object' && payload && 'message' in payload
      ? String((payload as { message: unknown }).message)
      : `Agent request failed (${status})`,
    'AGENT_HTTP_ERROR',
    status
  );
}
