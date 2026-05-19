import type { FastifyInstance } from 'fastify';
import type { AgentConfig } from '../../shared/types';
import { requireAuth } from '../auth';
import { checkOrigin } from '../cors';
import { normalizeProfileId, clearProfileStorage } from '../../browser/profileStorage';
import { isProfileRunning } from '../../browser/sessionManager';
import { profileStorageBusyError } from '../../shared/errors';
import { logger } from '../../main/logger';

type ProfilesDeps = {
  config: AgentConfig;
};

export async function registerProfileRoutes(
  app: FastifyInstance,
  deps: ProfilesDeps
): Promise<void> {
  app.post('/profiles/:profileId/clear-storage', async (request, reply) => {
    checkOrigin(request, deps.config);
    requireAuth(request, deps.config);

    const { profileId: rawId } = request.params as { profileId: string };
    const profileId = normalizeProfileId(rawId);

    if (isProfileRunning(profileId)) {
      throw profileStorageBusyError(profileId);
    }

    clearProfileStorage(profileId);
    logger.info('Profile storage cleared', { profileId });

    return reply.send({ status: 'cleared', profileId });
  });
}
