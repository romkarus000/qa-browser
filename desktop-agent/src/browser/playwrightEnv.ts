import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { logger } from '../main/logger';

/** Configure Playwright browser path for dev and packaged Electron builds. */
export function configurePlaywrightBrowsers(): void {
  if (app.isPackaged) {
    const bundled = path.join(process.resourcesPath, 'playwright-browsers');
    if (fs.existsSync(bundled)) {
      process.env.PLAYWRIGHT_BROWSERS_PATH = bundled;
      logger.info('Using bundled Playwright browsers', { path: bundled });
      return;
    }
    logger.warn('Bundled Playwright browsers not found; using system Chrome or cache');
  }
}
