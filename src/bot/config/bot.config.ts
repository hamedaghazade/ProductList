import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface BotConfig {
  botToken: string;
  webAppUrl: string;
  nodeEnv: string;
  itemsPerPage: number;
}

const botToken = process.env.BOT_TOKEN?.trim();

if (!botToken) {
  throw new Error(
    'خطا: متغیر BOT_TOKEN در فایل .env یافت نشد یا مقدار آن خالی است.'
  );
}

export const botConfig: BotConfig = {
  botToken,
  webAppUrl: process.env.WEBAPP_URL?.trim() || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  itemsPerPage: Number(process.env.ITEMS_PER_PAGE) || 5,
};