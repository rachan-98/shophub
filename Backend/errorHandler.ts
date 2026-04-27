import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Postgres unique violation
  if ((err as NodeJS.ErrnoException).code === '23505') {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
}
