import { chromium } from 'playwright';
import type { QAProfile } from '../shared/types';
import { browserLaunchFailedError } from '../shared/errors';
import { getProfileUserDataDir } from './profileStorage';
import { registerSession, isProfileRunning } from './sessionManager';
import { profileAlreadyRunningError } from '../shared/errors';
import { logger } from '../main/logger';

function createSessionId(): string {
  return `sess_${Date.now()}`;
}

/** Helps reCAPTCHA / OAuth work in Playwright-launched Chrome (not detected as automation). */
const CHROME_LAUNCH_ARGS = [
  '--disable-blink-features=AutomationControlled',
  '--no-first-run',
  '--no-default-browser-check',
];

type PersistentContextOptions = NonNullable<
  Parameters<typeof chromium.launchPersistentContext>[1]
>;

function buildLaunchOptions(profile: QAProfile): PersistentContextOptions {
  return {
    headless: false,
    channel: 'chrome',
    ignoreDefaultArgs: ['--enable-automation'],
    args: CHROME_LAUNCH_ARGS,
    userAgent: profile.userAgent,
    viewport: {
      width: profile.viewport.width,
      height: profile.viewport.height,
    },
    deviceScaleFactor: profile.deviceScaleFactor,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
    locale: profile.locale,
    timezoneId: profile.timezoneId,
    extraHTTPHeaders: profile.extraHTTPHeaders,
    proxy: profile.proxy
      ? {
          server: profile.proxy.server,
          username: profile.proxy.username,
          password: profile.proxy.password,
        }
      : undefined,
  };
}

async function applyStealthScripts(context: Awaited<ReturnType<typeof chromium.launchPersistentContext>>) {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
}

export async function launchProfile(profile: QAProfile) {
  if (isProfileRunning(profile.id)) {
    throw profileAlreadyRunningError(profile.id);
  }

  const userDataDir = getProfileUserDataDir(profile.id);
  const sessionId = createSessionId();

  logger.info('Launching browser profile', {
    sessionId,
    profileId: profile.id,
    targetUrl: profile.targetUrl,
    proxy: profile.proxy ? profile.proxy.server : null,
  });

  try {
    const launchOptions = buildLaunchOptions(profile);

    let context;
    try {
      context = await chromium.launchPersistentContext(userDataDir, launchOptions);
    } catch (chromeErr) {
      logger.warn('Chrome channel launch failed, falling back to bundled Chromium', {
        error: chromeErr instanceof Error ? chromeErr.message : String(chromeErr),
      });
      const { channel: _channel, ...fallbackOptions } = launchOptions;
      context = await chromium.launchPersistentContext(userDataDir, fallbackOptions);
    }

    await applyStealthScripts(context);

    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();
    await page.goto(profile.targetUrl, { waitUntil: 'domcontentloaded' });

    const session = registerSession(sessionId, profile, context);
    return { status: 'started' as const, sessionId, profileId: profile.id, session };
  } catch (err) {
    logger.error('Browser launch failed', {
      sessionId,
      profileId: profile.id,
      error: err instanceof Error ? err.message : String(err),
    });

    if (err && typeof err === 'object' && 'body' in err) {
      throw err;
    }

    const message = err instanceof Error ? err.message : 'Unknown launch error';
    if (message.toLowerCase().includes('proxy')) {
      logger.error('Proxy error during launch', { profileId: profile.id });
    }

    throw browserLaunchFailedError(message);
  }
}
