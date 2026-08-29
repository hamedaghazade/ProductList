import crypto from 'crypto';
import { verifyTelegramInitData } from '../src/utils/telegram-auth.util';

const BOT_TOKEN = '123456789:AAFakeTokenForTests';

function buildInitData(overrides: Record<string, string> = {}) {
  const params = new URLSearchParams({
    auth_date: '1735689600',
    user: JSON.stringify({ id: 123456789, first_name: 'Test', username: 'test_user' }),
    ...overrides,
  });

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  params.set('hash', hash);
  return params.toString();
}

describe('verifyTelegramInitData', () => {
  it('accepts valid initData', () => {
    const result = verifyTelegramInitData(buildInitData(), BOT_TOKEN);

    expect(result.valid).toBe(true);
    expect(result.user?.id).toBe(123456789);
  });

  it('rejects tampered initData', () => {
    const params = new URLSearchParams(buildInitData());
    params.set('user', JSON.stringify({ id: 123456789, first_name: 'Attacker' }));

    expect(verifyTelegramInitData(params.toString(), BOT_TOKEN).valid).toBe(false);
  });

  it('rejects initData without hash or user', () => {
    const noHash = new URLSearchParams(buildInitData());
    noHash.delete('hash');
    expect(verifyTelegramInitData(noHash.toString(), BOT_TOKEN).valid).toBe(false);

    const noUser = new URLSearchParams(buildInitData());
    noUser.delete('user');
    noUser.delete('hash');
    const dataCheckString = Array.from(noUser.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    noUser.set('hash', crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex'));

    expect(verifyTelegramInitData(noUser.toString(), BOT_TOKEN).valid).toBe(false);
  });

  it('fails hard when BOT_TOKEN is missing', () => {
    expect(() => verifyTelegramInitData('anything', '')).toThrow(
      'BOT_TOKEN تنظیم نشده — سرویس نمی‌تواند بالا بیاید'
    );
  });
});
