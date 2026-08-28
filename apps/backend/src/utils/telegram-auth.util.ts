import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function verifyTelegramInitData(initData: string, botToken: string): { valid: boolean; user?: TelegramUser } {
  if (!initData) return { valid: false };

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  if (!hash) return { valid: false };

  urlParams.delete('hash');

  const params: string[] = [];
  Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, val]) => params.push(`${key}=${val}`));

  const dataCheckString = params.join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) {
    return { valid: false };
  }

  const userJson = urlParams.get('user');
  if (!userJson) return { valid: false };

  try {
    const user: TelegramUser = JSON.parse(userJson);
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}