import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOriginAllowed } from './origin';
import type { AgentConfig } from '../shared/types';

const base: AgentConfig = {
  authToken: 'x',
  allowedOrigins: ['https://qa.example.com'],
  allowedHostSuffixes: ['.example.com'],
  version: '1.0.0',
};

test('allows explicit origin', () => {
  assert.equal(isOriginAllowed('https://qa.example.com', base), true);
});

test('allows suffix match', () => {
  assert.equal(isOriginAllowed('https://staging.example.com', base), true);
});

test('rejects unknown origin', () => {
  assert.equal(isOriginAllowed('https://evil.com', base), false);
});
