import { isValidEAN13, ean13CheckDigit } from '@shared/validators/product.schema';

describe('EAN-13 Validation & Calculation Suite', () => {
  it('باید رقم کنترلی معتبر را برای بارکد ۱۲ رقمی به درستی محاسبه کند', () => {
    // بارکد آزمایشی: 626123456789 -> Check Digit باید 0 باشد
    const check = ean13CheckDigit('626123456789');
    expect(check).toBe(0);
  });

  it('باید بارکد معتبر ایرانی 6261234567890 را تأیید کند', () => {
    expect(isValidEAN13('6261234567890')).toBe(true);
  });

  it('باید بارکد با طول غیرمجاز را رد کند', () => {
    expect(isValidEAN13('62612345678')).toBe(false);
    expect(isValidEAN13('62612345678901')).toBe(false);
  });

  it('باید بارکد با Check Digit دستکاری‌شده را رد کند', () => {
    expect(isValidEAN13('6261234567891')).toBe(false);
  });
});