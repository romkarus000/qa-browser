import type { FastifyInstance } from 'fastify';
import type { AgentConfig } from '../../shared/types';
import { requireAuth } from '../auth';
import { checkOrigin } from '../cors';
import { readRecentLogs } from '../../main/logger';

type LogsDeps = {
  config: AgentConfig;
};

export async function registerLogRoutes(app: FastifyInstance, deps: LogsDeps): Promise<void> {
  app.get('/logs', async (request, reply) => {
    checkOrigin(request, deps.config);
    requireAuth(request, deps.config);

    const lines = readRecentLogs(200);
    return reply.send({ lines });
  });
}
