import type { FastifyInstance } from 'fastify';
import type { AgentConfig } from '../../shared/types';
import { requireAuth } from '../auth';
import { checkOrigin } from '../cors';
import { validateProfile } from '../../browser/validateProfile';
import { launchProfile } from '../../browser/launchProfile';
import { listSessions, closeSession } from '../../browser/sessionManager';
import { ApiError } from '../../shared/errors';
import { logger } from '../../main/logger';

type SessionsDeps = {
  config: AgentConfig;
};

export async function registerSessionRoutes(
  app: FastifyInstance,
  deps: SessionsDeps
): Promise<void> {
  app.post('/sessions/launch', async (request, reply) => {
    checkOrigin(request, deps.config);
    requireAuth(request, deps.config);

    const body = request.body as { profile?: unknown } | undefined;
    const profile = validateProfile(body?.profile);

    try {
      const result = await launchProfile(profile);
      return reply.send({
        status: result.status,
        sessionId: result.sessionId,
        profileId: result.profileId,
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error('Unexpected launch error', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  });

  app.get('/sessions', async (request, reply) => {
    checkOrigin(request, deps.config);
    requireAuth(request, deps.config);

    return reply.send({ sessions: listSessions() });
  });

  app.post('/sessions/:sessionId/close', async (request, reply) => {
    checkOrigin(request, deps.config);
    requireAuth(request, deps.config);

    const { sessionId } = request.params as { sessionId: string };
    await closeSession(sessionId);

    return reply.send({ status: 'closed', sessionId });
  });

}
