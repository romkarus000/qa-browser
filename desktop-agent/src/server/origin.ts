import type { AgentConfig } from '../shared/types';

export function isOriginAllowed(origin: string, config: AgentConfig): boolean {
  if (config.allowedOrigins.includes(origin)) return true;

  const suffixes = config.allowedHostSuffixes ?? [];
  if (suffixes.length === 0) return false;

  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== 'https:' && protocol !== 'http:') return false;
    return suffixes.some((suffix) => {
      const normalized = suffix.startsWith('.') ? suffix : `.${suffix}`;
      return hostname === normalized.slice(1) || hostname.endsWith(normalized);
    });
  } catch {
    return false;
  }
}
