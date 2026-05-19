import fs from 'fs';
import path from 'path';
import { LOGS_DIR } from './config';

const LOG_FILE = path.join(LOGS_DIR, 'agent.log');
const MAX_LOG_BYTES = 10 * 1024 * 1024;
const MAX_ROTATED_FILES = 5;

const SENSITIVE_PATTERNS = [
  /password["\s:=]+[^\s,}"]+/gi,
  /Bearer\s+[A-Za-z0-9._-]+/gi,
  /"authToken"\s*:\s*"[^"]+"/gi,
];

function redact(message: string): string {
  let result = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

function rotateIfNeeded(): void {
  if (!fs.existsSync(LOG_FILE)) return;
  const stats = fs.statSync(LOG_FILE);
  if (stats.size < MAX_LOG_BYTES) return;

  for (let i = MAX_ROTATED_FILES - 1; i >= 1; i -= 1) {
    const from = `${LOG_FILE}.${i}`;
    const to = `${LOG_FILE}.${i + 1}`;
    if (fs.existsSync(from)) {
      if (i === MAX_ROTATED_FILES - 1) fs.unlinkSync(from);
      else fs.renameSync(from, to);
    }
  }
  fs.renameSync(LOG_FILE, `${LOG_FILE}.1`);
}

function write(level: string, message: string, meta?: Record<string, unknown>): void {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  rotateIfNeeded();

  const ts = new Date().toISOString();
  const safeMeta = meta
    ? JSON.stringify(meta, (key, value) => {
        if (/password|token|cookie|auth/i.test(key)) return '[REDACTED]';
        if (typeof value === 'string' && /Bearer|password/i.test(value)) return '[REDACTED]';
        return value;
      })
    : '';
  const metaStr = safeMeta ? ` ${safeMeta}` : '';
  const line = `[${ts}] [${level}] ${redact(message)}${metaStr}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('INFO', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('WARN', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('ERROR', message, meta),
};

export function getLogFilePath(): string {
  return LOG_FILE;
}

export function readRecentLogs(maxLines = 200): string[] {
  const files = [LOG_FILE, ...Array.from({ length: MAX_ROTATED_FILES }, (_, i) => `${LOG_FILE}.${i + 1}`)];
  const lines: string[] = [];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');
    lines.push(...content.split('\n').filter(Boolean));
  }

  return lines.slice(-maxLines);
}
