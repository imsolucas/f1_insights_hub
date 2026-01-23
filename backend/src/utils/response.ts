import { Response } from 'express';
import { ApiError } from './errors';

export interface ApiResponse<T> {
  success: true;
  data: T;
  correlationId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  correlationId: string;
  timestamp: string;
}

function getCorrelationId(req: { headers?: { [key: string]: string | string[] | undefined } }): string {
  const header = req.headers?.['x-correlation-id'];
  if (typeof header === 'string') {
    return header;
  }
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  correlationId: string,
  statusCode = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    correlationId,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  error: ApiError | Error,
  correlationId: string
): void {
  if (error instanceof ApiError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      correlationId,
      timestamp: new Date().toISOString(),
    };
    res.status(error.statusCode).json(response);
  } else {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      },
      correlationId,
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
}

export { getCorrelationId };
