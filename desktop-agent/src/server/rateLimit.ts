import type { FastifyRequest } from 'fastify';
import { ApiError } from '../shared/errors';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;

export function rateLimit(request: FastifyRequest): void {
  const key = request.ip;
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    throw new ApiError(429, 'RATE_LIMITED', 'Rate limit exceeded', {
      retryAfterMs: bucket.resetAt - now,
    });
  }
}
