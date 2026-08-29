import { Request, Response, NextFunction } from 'express';
import { verifyTelegramInitData } from '../utils/telegram-auth.util';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  telegramUserId?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const initData = req.headers['x-telegram-init-data'] as string | undefined;

  if (env.NODE_ENV === 'development' && env.ALLOW_DEV_AUTH_BYPASS && req.headers['x-dev-user-id']) {
    req.telegramUserId = req.headers['x-dev-user-id'] as string;
    return next();
  }

  const { valid, user } = verifyTelegramInitData(initData, env.BOT_TOKEN);

  if (!valid || !user) {
    return res.status(401).json({
      success: false,
      message: 'دسترسی غیرمجاز: داده‌های هویتی تلگرام نامعتبر است.',
    });
  }

  req.telegramUserId = user.id.toString();
  next();
};
