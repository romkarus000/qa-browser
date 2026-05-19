export type QAProfile = {
  id: string;
  name: string;
  targetUrl: string;

  deviceLabel?: string;
  osLabel?: string;
  browserLabel?: string;

  userAgent: string;

  viewport: {
    width: number;
    height: number;
  };

  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;

  locale: string;
  timezoneId: string;

  extraHTTPHeaders?: Record<string, string>;

  proxy?: {
    server: string;
    username?: string;
    password?: string;
  } | null;
};

export type BrowserSession = {
  sessionId: string;
  profileId: string;
  profileName: string;
  targetUrl: string;
  startedAt: string;
};

export type AgentConfig = {
  authToken: string;
  allowedOrigins: string[];
  /** e.g. [".yourcompany.com"] — allows https origins whose host ends with suffix */
  allowedHostSuffixes?: string[];
  version: string;
};

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN_ORIGIN'
  | 'PROFILE_ALREADY_RUNNING'
  | 'SESSION_NOT_FOUND'
  | 'BROWSER_LAUNCH_FAILED'
  | 'PROFILE_STORAGE_BUSY'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED';

export type ApiErrorBody = {
  error: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export { APP_VERSION } from './version';

export const APP_NAME = 'qa-desktop-agent';
export const API_HOST = '127.0.0.1';
export const API_PORT = 43127;
