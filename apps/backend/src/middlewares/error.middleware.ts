import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error('Unhandled System Error:', err);

  res.status(500).json({
    success: false,
    message: 'خطای داخلی سرور رخ داده است',
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};