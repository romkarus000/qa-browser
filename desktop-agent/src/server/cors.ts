import type { FastifyRequest } from 'fastify';
import type { AgentConfig } from '../shared/types';
import { forbiddenOriginError } from '../shared/errors';
import { isOriginAllowed } from './origin';

export function checkOrigin(request: FastifyRequest, config: AgentConfig): void {
  const origin = request.headers.origin;
  if (!origin) return;

  if (isOriginAllowed(origin, config)) return;

  const host = request.headers.host;
  if (host && (origin === `http://${host}` || origin === `https://${host}`)) {
    return;
  }

  throw forbiddenOriginError(origin);
}

export function corsHeaders(origin: string | undefined, config: AgentConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && isOriginAllowed(origin, config)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }

  return headers;
}
