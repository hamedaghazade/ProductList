import { isValidEAN13, ean13CheckDigit } from '@shared/validators/product.schema';

describe('EAN-13 Check Digit & Structural Integrity', () => {
  it('باید رقم کنترلی بارکد ۶۲۶۱۲۳۴۵۶۷۸۹ را برابر با ۰ محاسبه کند', () => {
    expect(ean13CheckDigit('626123456789')).toBe(0);
  });

  it('باید بارکد استاندارد معتبر ۶۲۶۱۲۳۴۵۶۷۸۹۰ را تایید کند', () => {
    expect(isValidEAN13('6261234567890')).toBe(true);
  });

  it('باید بارکد دستکاری‌شده با رقم کنترلی اشتباه را رد کند', () => {
    expect(isValidEAN13('6261234567891')).toBe(false);
  });
});