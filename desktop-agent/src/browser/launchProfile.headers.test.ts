import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterExtraHttpHeaders } from './launchProfile';

test('strips x-qa-profile from extra headers', () => {
  const out = filterExtraHttpHeaders({
    'Accept-Language': 'ru-RU',
    'X-QA-Profile': 'qa-desktop-chrome-kz',
  });
  assert.deepEqual(out, { 'Accept-Language': 'ru-RU' });
});

test('returns undefined when only forbidden headers remain', () => {
  assert.equal(filterExtraHttpHeaders({ 'x-qa-profile': 'x' }), undefined);
});
