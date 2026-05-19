import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import type { AgentConfig } from '../shared/types';
import { APP_VERSION } from '../shared/version';

export const AGENT_HOME = path.join(os.homedir(), '.qa-desktop-agent');
export const CONFIG_PATH = path.join(AGENT_HOME, 'config.json');
export const LOGS_DIR = path.join(AGENT_HOME, 'logs');
export const PROFILES_DIR = path.join(AGENT_HOME, 'profiles');

const DEFAULT_ORIGINS = [
  'https://magnific.com',
  'https://www.magnific.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const DEFAULT_HOST_SUFFIXES = ['.magnific.com'];

function ensureDirs(): void {
  fs.mkdirSync(AGENT_HOME, { recursive: true });
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function normalizeOrigins(origins: unknown): string[] {
  if (!Array.isArray(origins)) return DEFAULT_ORIGINS;
  return origins.filter((o): o is string => typeof o === 'string' && o.length > 0);
}

function normalizeSuffixes(suffixes: unknown): string[] | undefined {
  if (!Array.isArray(suffixes)) return undefined;
  const list = suffixes.filter((s): s is string => typeof s === 'string' && s.length > 0);
  return list.length > 0 ? list : undefined;
}

export function loadConfig(): AgentConfig {
  ensureDirs();

  if (!fs.existsSync(CONFIG_PATH)) {
    const config: AgentConfig = {
      authToken: generateToken(),
      allowedOrigins: DEFAULT_ORIGINS,
      allowedHostSuffixes: DEFAULT_HOST_SUFFIXES,
      version: APP_VERSION,
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    return config;
  }

  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) as Partial<AgentConfig>;
  return {
    authToken: raw.authToken ?? generateToken(),
    allowedOrigins: normalizeOrigins(raw.allowedOrigins),
    allowedHostSuffixes: normalizeSuffixes(raw.allowedHostSuffixes),
    version: APP_VERSION,
  };
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export function getProfilesDir(): string {
  return PROFILES_DIR;
}

export function getLogsDir(): string {
  return LOGS_DIR;
}
