import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      errors: err.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'محصول یافت نشد.' });
    }

    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'رکورد تکراری است.' });
    }
  }

  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : 'خطای غیرمنتظره در سرور رخ داد.';

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && err instanceof Error ? { stack: err.stack } : {}),
  });
};
