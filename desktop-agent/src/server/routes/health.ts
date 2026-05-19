import type { FastifyInstance } from 'fastify';
import { chromium } from 'playwright';
import { APP_NAME, APP_VERSION } from '../../shared/types';
import { logger } from '../../main/logger';

async function checkPlaywright(): Promise<'ok' | 'error'> {
  try {
    const executable = chromium.executablePath();
    return executable ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    const playwrightStatus = await checkPlaywright();
    if (playwrightStatus === 'error') {
      logger.warn('Playwright health check failed');
    }

    return reply.send({
      status: 'ok',
      app: APP_NAME,
      version: APP_VERSION,
      platform: process.platform,
      playwright: playwrightStatus,
    });
  });
}
