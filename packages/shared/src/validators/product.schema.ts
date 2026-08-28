import { z } from 'zod';
import { BarcodeType } from '../types/product';

export const ean13CheckDigit = (barcodeWithoutCheck: string): number => {
  const digits = barcodeWithoutCheck.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = digits[i];
    if (digit !== undefined) {
      sum += i % 2 === 0 ? digit : digit * 3;
    }
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
};

export const isValidEAN13 = (code: string): boolean => {
  if (!/^\d{13}$/.test(code)) return false;
  const body = code.substring(0, 12);
  const check = Number(code.charAt(12));
  return ean13CheckDigit(body) === check;
};

export const productSchema = z.object({
  name: z
    .string({ required_error: 'نام محصول الزامی است.' })
    .trim()
    .min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد.')
    .max(150, 'نام محصول نمی‌تواند بیش از ۱۵۰ کاراکتر باشد.'),
  quantityPerPackage: z
    .number({ required_error: 'تعداد در بسته الزامی است.' })
    .int('تعداد در بسته باید یک عدد صحیح باشد.')
    .positive('تعداد در بسته باید بزرگتر از صفر باشد.'),
  price: z
    .number({ required_error: 'قیمت الزامی است.' })
    .nonnegative('قیمت نمی‌تواند عدد منفی باشد.'),
  barcode: z
    .string({ required_error: 'کد بارکد الزامی است.' })
    .trim()
    .min(1, 'بارکد نمی‌تواند خالی باشد.'),
  barcodeType: z.nativeEnum(BarcodeType, {
    errorMap: () => ({ message: 'نوع بارکد باید EAN13 یا CODE128 باشد.' }),
  }),
}).superRefine((data, ctx) => {
  if (data.barcodeType === BarcodeType.EAN13) {
    if (!/^\d{13}$/.test(data.barcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['barcode'],
        message: 'بارکد استاندارد EAN-13 باید دقیقاً ۱۳ رقم عددی باشد.',
      });
    } else if (!isValidEAN13(data.barcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['barcode'],
        message: 'رقم کنترلی (Check Digit) بارکد EAN-13 نامعتبر است.',
      });
    }
  } else if (data.barcodeType === BarcodeType.CODE128) {
    if (!/^[\x20-\x7E]+$/.test(data.barcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['barcode'],
        message: 'بارکد Code 128 شامل کاراکترهای نامعتبر اسکی است.',
      });
    }
  }
});