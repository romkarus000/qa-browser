export type QAProfile = {
  id: string;
  name: string;
  targetUrl: string;
  deviceLabel?: string;
  osLabel?: string;
  browserLabel?: string;
  userAgent: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  locale: string;
  timezoneId: string;
  extraHTTPHeaders?: Record<string, string>;
  proxy?: { server: string; username?: string; password?: string } | null;
};

export type HealthResponse = {
  status: string;
  app: string;
  version: string;
  platform: string;
  playwright: 'ok' | 'error';
};

export type BrowserSession = {
  sessionId: string;
  profileId: string;
  profileName: string;
  targetUrl: string;
  startedAt: string;
};

export type LaunchResult = {
  status: 'started';
  sessionId: string;
  profileId: string;
};

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN_ORIGIN'
  | 'PROFILE_ALREADY_RUNNING'
  | 'SESSION_NOT_FOUND'
  | 'BROWSER_LAUNCH_FAILED'
  | 'PROFILE_STORAGE_BUSY'
  | 'INTERNAL_ERROR';

export type ApiErrorBody = {
  error: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export type AgentDownloadUrls = {
  macArm64?: string;
  macX64?: string;
  windows?: string;
};

export type AgentClientOptions = {
  baseUrl?: string;
  /** Pre-configured token (skip /config/client). Use when token is injected by your backend. */
  authToken?: string;
  healthTimeoutMs?: number;
  fetchImpl?: typeof fetch;
};
