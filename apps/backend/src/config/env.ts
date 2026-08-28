// apps/backend/src/config/env.ts
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  TELEGRAM_WEBAPP_URL: process.env.TELEGRAM_WEBAPP_URL || 'http://localhost:5173',
  PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
};