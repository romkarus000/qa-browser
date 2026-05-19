import type { QAProfile } from '../shared/types';
import { validationError } from '../shared/errors';
import { normalizeProfileId } from './profileStorage';

const PROXY_SCHEMES = ['http://', 'https://', 'socks5://', 'socks4://'];

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateExtraHeaders(headers: unknown): Record<string, string> | undefined {
  if (headers === undefined || headers === null) return undefined;
  if (typeof headers !== 'object' || Array.isArray(headers)) {
    throw validationError('extraHTTPHeaders must be an object of string key-value pairs');
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers as Record<string, unknown>)) {
    if (typeof value !== 'string') {
      throw validationError(`extraHTTPHeaders.${key} must be a string`);
    }
    result[key] = value;
  }
  return result;
}

function validateProxy(proxy: unknown): QAProfile['proxy'] {
  if (proxy === null || proxy === undefined) return null;
  if (typeof proxy !== 'object' || Array.isArray(proxy)) {
    throw validationError('proxy must be an object or null');
  }
  const p = proxy as Record<string, unknown>;
  if (typeof p.server !== 'string' || !p.server) {
    throw validationError('proxy.server is required when proxy is set');
  }
  const server = p.server as string;
  const validScheme = PROXY_SCHEMES.some((s) => server.startsWith(s));
  if (!validScheme) {
    throw validationError(
      'proxy.server must start with http://, https://, socks5://, or socks4://'
    );
  }
  return {
    server,
    username: typeof p.username === 'string' ? p.username : undefined,
    password: typeof p.password === 'string' ? p.password : undefined,
  };
}

export function validateProfile(input: unknown): QAProfile {
  if (!input || typeof input !== 'object') {
    throw validationError('profile object is required');
  }

  const raw = input as Record<string, unknown>;

  const id = normalizeProfileId(String(raw.id ?? ''));
  const name = typeof raw.name === 'string' ? raw.name : id;
  const targetUrl = String(raw.targetUrl ?? '');
  if (!targetUrl || !isValidUrl(targetUrl)) {
    throw validationError('profile.targetUrl must be a valid http(s) URL');
  }

  const userAgent = String(raw.userAgent ?? '').trim();
  if (!userAgent) {
    throw validationError('profile.userAgent must not be empty');
  }

  const viewportRaw = raw.viewport as Record<string, unknown> | undefined;
  if (!viewportRaw || typeof viewportRaw !== 'object') {
    throw validationError('profile.viewport is required');
  }
  const width = Number(viewportRaw.width);
  const height = Number(viewportRaw.height);
  if (!Number.isFinite(width) || width < 100 || width > 5000) {
    throw validationError('viewport.width must be between 100 and 5000');
  }
  if (!Number.isFinite(height) || height < 100 || height > 5000) {
    throw validationError('viewport.height must be between 100 and 5000');
  }

  const deviceScaleFactor = Number(raw.deviceScaleFactor);
  if (!Number.isFinite(deviceScaleFactor) || deviceScaleFactor < 1 || deviceScaleFactor > 5) {
    throw validationError('deviceScaleFactor must be between 1 and 5');
  }

  const locale = String(raw.locale ?? '').trim();
  if (!locale) {
    throw validationError('profile.locale must not be empty');
  }

  const timezoneId = String(raw.timezoneId ?? '').trim();
  if (!timezoneId) {
    throw validationError('profile.timezoneId must not be empty');
  }

  const extraHTTPHeaders = validateExtraHeaders(raw.extraHTTPHeaders);
  const proxy = validateProxy(raw.proxy);

  return {
    id,
    name,
    targetUrl,
    deviceLabel: typeof raw.deviceLabel === 'string' ? raw.deviceLabel : undefined,
    osLabel: typeof raw.osLabel === 'string' ? raw.osLabel : undefined,
    browserLabel: typeof raw.browserLabel === 'string' ? raw.browserLabel : undefined,
    userAgent,
    viewport: { width, height },
    deviceScaleFactor,
    isMobile: Boolean(raw.isMobile),
    hasTouch: Boolean(raw.hasTouch),
    locale,
    timezoneId,
    extraHTTPHeaders,
    proxy,
  };
}
