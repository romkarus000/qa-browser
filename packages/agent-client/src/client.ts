import { AgentClientError, parseAgentError } from './errors';
import type {
  AgentClientOptions,
  AgentDownloadUrls,
  BrowserSession,
  HealthResponse,
  LaunchResult,
  QAProfile,
} from './types';

const DEFAULT_BASE = 'http://127.0.0.1:43127';

export class QADesktopAgentClient {
  private readonly baseUrl: string;
  private readonly healthTimeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private authToken: string | null;
  private tokenPromise: Promise<string> | null = null;

  constructor(options: AgentClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
    this.healthTimeoutMs = options.healthTimeoutMs ?? 3000;
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
    this.authToken = options.authToken ?? null;
  }

  clearAuthCache(): void {
    this.authToken = null;
    this.tokenPromise = null;
  }

  getDiagnosticsUrl(): string {
    return `${this.baseUrl}/diagnostics`;
  }

  openDiagnostics(): void {
    if (typeof window !== 'undefined') {
      window.open(this.getDiagnosticsUrl(), '_blank', 'noopener,noreferrer');
    }
  }

  async checkHealth(): Promise<HealthResponse | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.healthTimeoutMs);
    try {
      const res = await this.fetchImpl(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });
      if (!res.ok) return null;
      return (await res.json()) as HealthResponse;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async isAvailable(): Promise<boolean> {
    const health = await this.checkHealth();
    return health?.status === 'ok';
  }

  private async resolveToken(): Promise<string> {
    if (this.authToken) return this.authToken;
    if (!this.tokenPromise) {
      this.tokenPromise = (async () => {
        const res = await this.fetchImpl(`${this.baseUrl}/config/client`, {
          credentials: 'omit',
        });
        if (!res.ok) {
          throw new AgentClientError('Failed to obtain agent auth token', 'TOKEN_ERROR', res.status);
        }
        const data = (await res.json()) as { authToken: string };
        this.authToken = data.authToken;
        return data.authToken;
      })();
    }
    return this.tokenPromise;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    auth = true
  ): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (auth) {
      headers.set('Authorization', `Bearer ${await this.resolveToken()}`);
    }

    const res = await this.fetchImpl(`${this.baseUrl}${path}`, { ...init, headers });
    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw parseAgentError(res.status, payload);
    }
    return payload as T;
  }

  async listSessions(): Promise<BrowserSession[]> {
    const data = await this.request<{ sessions: BrowserSession[] }>('/sessions');
    return data.sessions ?? [];
  }

  async launchProfile(profile: QAProfile): Promise<LaunchResult> {
    return this.request<LaunchResult>('/sessions/launch', {
      method: 'POST',
      body: JSON.stringify({ profile }),
    });
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.request(`/sessions/${encodeURIComponent(sessionId)}/close`, {
      method: 'POST',
    });
  }

  async clearProfileStorage(profileId: string): Promise<void> {
    await this.request(`/profiles/${encodeURIComponent(profileId)}/clear-storage`, {
      method: 'POST',
    });
  }

  async getRecentLogs(): Promise<string[]> {
    const data = await this.request<{ lines: string[] }>('/logs');
    return data.lines ?? [];
  }
}

export function createAgentClient(options?: AgentClientOptions): QADesktopAgentClient {
  return new QADesktopAgentClient(options);
}

/** Resolve download URLs for the current platform from release manifest env. */
export function resolveDownloadUrls(urls: AgentDownloadUrls): {
  mac?: string;
  windows?: string;
  current?: string;
} {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMac = /Mac/i.test(ua);
  const isWin = /Win/i.test(ua);
  // Intel Macs include "Intel" in UA; Apple Silicon typically does not
  const isIntelMac = /Intel Mac OS X|Macintosh.*Intel/i.test(ua);
  const mac = isMac
    ? isIntelMac
      ? urls.macX64 ?? urls.macArm64
      : urls.macArm64 ?? urls.macX64
    : urls.macArm64 ?? urls.macX64;
  return {
    mac,
    windows: urls.windows,
    current: isMac ? mac : isWin ? urls.windows : undefined,
  };
}
