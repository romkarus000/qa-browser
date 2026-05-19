import type { QAProfile } from '@qa/desktop-agent-client';

const FALLBACK: QAProfile[] = [];

export async function loadProfiles(): Promise<QAProfile[]> {
  try {
    const res = await fetch('/profiles.json', { cache: 'no-cache' });
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as QAProfile[];
    return Array.isArray(data) ? data : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
