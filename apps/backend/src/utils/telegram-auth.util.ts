import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export function verifyTelegramInitData(
  initData: string | undefined,
  botToken: string
): { valid: boolean; user?: TelegramUser } {
  if (!botToken) throw new Error('BOT_TOKEN تنظیم نشده — سرویس نمی‌تواند بالا بیاید');
  if (!initData) return { valid: false };

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) return { valid: false };

  urlParams.delete('hash');

  const params: string[] = [];
  Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, val]) => params.push(`${key}=${val}`));

  const dataCheckString = params.join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const providedHash = Buffer.from(hash, 'hex');
  const expectedHash = Buffer.from(calculatedHash, 'hex');
  if (providedHash.length !== expectedHash.length || !crypto.timingSafeEqual(providedHash, expectedHash)) {
    return { valid: false };
  }

  const userJson = urlParams.get('user');
  if (!userJson) return { valid: false };

  try {
    const user: TelegramUser = JSON.parse(userJson);
    if (!Number.isSafeInteger(user.id) || typeof user.first_name !== 'string') {
      return { valid: false };
    }
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}
