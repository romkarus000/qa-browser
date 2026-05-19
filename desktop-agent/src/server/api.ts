import Fastify from 'fastify';
import type { AgentConfig } from '../shared/types';
import { API_HOST, API_PORT } from '../shared/types';
import { ApiError } from '../shared/errors';
import { corsHeaders } from './cors';
import { checkOrigin } from './cors';
import { rateLimit } from './rateLimit';
import { registerHealthRoutes } from './routes/health';
import { registerSessionRoutes } from './routes/sessions';
import { registerProfileRoutes } from './routes/profiles';
import { registerLogRoutes } from './routes/logs';
import { registerDiagnosticsRoutes } from './routes/diagnostics';
import { logger } from '../main/logger';

export type ApiServer = {
  app: ReturnType<typeof Fastify>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export function createApiServer(config: AgentConfig): ApiServer {
  const app = Fastify({
    logger: false,
    bodyLimit: 256 * 1024,
  });

  app.addHook('onRequest', async (request, reply) => {
    rateLimit(request);

    const origin = request.headers.origin;
    const headers = corsHeaders(origin, config);
    for (const [key, value] of Object.entries(headers)) {
      reply.header(key, value);
    }
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Cache-Control', 'no-store');
  });

  app.options('/*', async (_request, reply) => reply.status(204).send());

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send(error.body);
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    logger.error('Unhandled API error', { message });
    return reply.status(500).send({
      error: 'INTERNAL_ERROR',
      message,
      details: {},
    });
  });

  app.get('/config/client', async (request, reply) => {
    checkOrigin(request, config);
    return reply.send({ authToken: config.authToken });
  });

  const registerAll = async () => {
    await registerHealthRoutes(app);
    await registerDiagnosticsRoutes(app);
    await registerSessionRoutes(app, { config });
    await registerProfileRoutes(app, { config });
    await registerLogRoutes(app, { config });
  };

  return {
    app,
    async start() {
      await registerAll();
      await app.listen({ host: API_HOST, port: API_PORT });
      logger.info('API server started', { host: API_HOST, port: API_PORT });
    },
    async stop() {
      await app.close();
      logger.info('API server stopped');
    },
  };
}
