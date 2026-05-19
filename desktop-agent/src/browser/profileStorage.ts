import fs from 'fs';
import path from 'path';
import { PROFILES_DIR } from '../main/config';
import { validationError } from '../shared/errors';

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function normalizeProfileId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) {
    throw validationError('profile.id is required');
  }
  if (!SAFE_ID_PATTERN.test(trimmed)) {
    throw validationError(
      'profile.id must contain only latin letters, digits, hyphens, and underscores',
      { id: trimmed }
    );
  }
  return trimmed;
}

export function getProfileUserDataDir(profileId: string): string {
  const safeId = normalizeProfileId(profileId);
  const dir = path.join(PROFILES_DIR, safeId, 'browser-data');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function clearProfileStorage(profileId: string): void {
  const safeId = normalizeProfileId(profileId);
  const profileDir = path.join(PROFILES_DIR, safeId);
  if (fs.existsSync(profileDir)) {
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(profileDir, 'browser-data'), { recursive: true });
}

export function profileStorageExists(profileId: string): boolean {
  const safeId = normalizeProfileId(profileId);
  return fs.existsSync(path.join(PROFILES_DIR, safeId));
}
