import type { ApiErrorBody, ApiErrorCode } from './types';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly body: ApiErrorBody;

  constructor(
    statusCode: number,
    error: ApiErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.body = { error, message, details: details ?? {} };
  }
}

export function validationError(
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return new ApiError(400, 'VALIDATION_ERROR', message, details);
}

export function unauthorizedError(message = 'Invalid or missing auth token'): ApiError {
  return new ApiError(401, 'UNAUTHORIZED', message);
}

export function forbiddenOriginError(origin: string): ApiError {
  return new ApiError(403, 'FORBIDDEN_ORIGIN', `Origin not allowed: ${origin}`);
}

export function profileAlreadyRunningError(profileId: string): ApiError {
  return new ApiError(
    409,
    'PROFILE_ALREADY_RUNNING',
    `Profile ${profileId} is already running`
  );
}

export function sessionNotFoundError(sessionId: string): ApiError {
  return new ApiError(404, 'SESSION_NOT_FOUND', `Session ${sessionId} not found`);
}

export function profileStorageBusyError(profileId: string): ApiError {
  return new ApiError(
    409,
    'PROFILE_STORAGE_BUSY',
    `Profile ${profileId} is currently running; close the session first`
  );
}

export function browserLaunchFailedError(message: string): ApiError {
  return new ApiError(500, 'BROWSER_LAUNCH_FAILED', message);
}

export function internalError(message: string): ApiError {
  return new ApiError(500, 'INTERNAL_ERROR', message);
}
