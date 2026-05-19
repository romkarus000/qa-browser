import type { FastifyRequest } from 'fastify';
import type { AgentConfig } from '../shared/types';
import { unauthorizedError } from '../shared/errors';

export function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function requireAuth(request: FastifyRequest, config: AgentConfig): void {
  const token = extractBearerToken(request);
  if (!token || token !== config.authToken) {
    throw unauthorizedError();
  }
}
