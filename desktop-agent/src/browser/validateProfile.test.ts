import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProfile } from './validateProfile';
import { ApiError } from '../shared/errors';

const valid = {
  id: 'qa-android-test',
  name: 'Test',
  targetUrl: 'https://staging.example.com/',
  userAgent: 'Mozilla/5.0 Mobile',
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: 'ru-RU',
  timezoneId: 'Asia/Almaty',
};

test('accepts valid profile', () => {
  const p = validateProfile(valid);
  assert.equal(p.id, 'qa-android-test');
});

test('rejects unsafe profile id', () => {
  assert.throws(
    () => validateProfile({ ...valid, id: '../etc/passwd' }),
    (e) => e instanceof ApiError && e.body.error === 'VALIDATION_ERROR'
  );
});

test('rejects invalid proxy scheme', () => {
  assert.throws(() =>
    validateProfile({
      ...valid,
      proxy: { server: 'ftp://proxy:21' },
    })
  );
});
