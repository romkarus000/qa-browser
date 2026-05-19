import { app, dialog } from 'electron';
import { loadConfig } from './config';
import { logger } from './logger';
import { createApiServer } from '../server/api';
import { createTray, refreshTray, destroyTray } from './tray';
import { APP_VERSION, API_PORT } from '../shared/types';
import { listSessions, closeSession } from '../browser/sessionManager';
import { configurePlaywrightBrowsers } from '../browser/playwrightEnv';

let apiServer: ReturnType<typeof createApiServer> | null = null;
let trayRefreshTimer: ReturnType<typeof setInterval> | null = null;

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    logger.info('Second instance blocked; agent already running');
  });
}

async function startAgent(): Promise<void> {
  configurePlaywrightBrowsers();
  const config = loadConfig();

  logger.info('QA Desktop Agent starting', {
    version: APP_VERSION,
    port: API_PORT,
    platform: process.platform,
    packaged: app.isPackaged,
  });

  apiServer = createApiServer(config);
  await apiServer.start();

  createTray(restartAgent);
  trayRefreshTimer = setInterval(() => refreshTray(restartAgent), 5000);
}

async function stopAgent(): Promise<void> {
  if (trayRefreshTimer) {
    clearInterval(trayRefreshTimer);
    trayRefreshTimer = null;
  }

  const sessions = listSessions();
  for (const s of sessions) {
    try {
      await closeSession(s.sessionId);
    } catch {
      // ignore
    }
  }

  if (apiServer) {
    await apiServer.stop();
    apiServer = null;
  }

  destroyTray();
  logger.info('QA Desktop Agent stopped');
}

async function restartAgent(): Promise<void> {
  logger.info('Restarting agent');
  await stopAgent();
  await startAgent();
}

if (process.platform === 'darwin') {
  app.dock?.hide();
}

app.whenReady().then(() => {
  void startAgent().catch((err) => {
    logger.error('Failed to start agent', {
      error: err instanceof Error ? err.message : String(err),
    });
    dialog.showErrorBox(
      'QA Desktop Agent',
      `Failed to start: ${err instanceof Error ? err.message : String(err)}`
    );
    app.quit();
  });
});

app.on('window-all-closed', () => {
  // Tray-only app
});

app.on('before-quit', () => {
  void stopAgent();
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    error: reason instanceof Error ? reason.message : String(reason),
  });
});
