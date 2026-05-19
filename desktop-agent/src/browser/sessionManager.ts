import type { BrowserContext } from 'playwright';
import type { BrowserSession, QAProfile } from '../shared/types';
import {
  profileAlreadyRunningError,
  sessionNotFoundError,
} from '../shared/errors';
import { logger } from '../main/logger';

type SessionEntry = {
  sessionId: string;
  profile: QAProfile;
  context: BrowserContext;
  startedAt: string;
};

const sessions = new Map<string, SessionEntry>();
const profileToSession = new Map<string, string>();

export function isProfileRunning(profileId: string): boolean {
  return profileToSession.has(profileId);
}

export function getRunningProfileIds(): string[] {
  return Array.from(profileToSession.keys());
}

export function registerSession(
  sessionId: string,
  profile: QAProfile,
  context: BrowserContext
): BrowserSession {
  if (profileToSession.has(profile.id)) {
    throw profileAlreadyRunningError(profile.id);
  }

  const startedAt = new Date().toISOString();
  const entry: SessionEntry = { sessionId, profile, context, startedAt };
  sessions.set(sessionId, entry);
  profileToSession.set(profile.id, sessionId);

  context.on('close', () => {
    removeSession(sessionId);
    logger.info('Session closed (browser window)', { sessionId, profileId: profile.id });
  });

  logger.info('Session registered', { sessionId, profileId: profile.id });

  return {
    sessionId,
    profileId: profile.id,
    profileName: profile.name,
    targetUrl: profile.targetUrl,
    startedAt,
  };
}

function removeSession(sessionId: string): void {
  const entry = sessions.get(sessionId);
  if (!entry) return;
  sessions.delete(sessionId);
  profileToSession.delete(entry.profile.id);
}

export async function closeSession(sessionId: string): Promise<void> {
  const entry = sessions.get(sessionId);
  if (!entry) {
    throw sessionNotFoundError(sessionId);
  }

  try {
    await entry.context.close();
  } catch (err) {
    logger.warn('Error closing browser context', {
      sessionId,
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    removeSession(sessionId);
    logger.info('Session closed via API', { sessionId });
  }
}

export function listSessions(): BrowserSession[] {
  return Array.from(sessions.values()).map((e) => ({
    sessionId: e.sessionId,
    profileId: e.profile.id,
    profileName: e.profile.name,
    targetUrl: e.profile.targetUrl,
    startedAt: e.startedAt,
  }));
}

export function getActiveSessionSummaries(): { profileName: string; sessionId: string }[] {
  return Array.from(sessions.values()).map((e) => ({
    profileName: e.profile.name,
    sessionId: e.sessionId,
  }));
}
