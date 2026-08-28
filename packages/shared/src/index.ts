import { z } from 'zod';

export type BarcodeType = 'ean13' | 'code128';

/**
 * اعتبارسنجی و محاسبه رقم کنترل Check-digit در استاندارد جهانی EAN-13
 */
export function validateEan13Checksum(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;
  
  const digits = barcode.split('').map(Number);
  const checkDigit = digits[12];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += i % 2 === 0 ? digits[i] : digits[i] * 3;
  }
  
  const calculatedCheck = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheck;
}

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string({ required_error: 'نام محصول الزامی است' })
    .trim()
    .min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام محصول نمی‌تواند بیش از ۱۰۰ کاراکتر باشد'),
  quantityPerPackage: z
    .number({ required_error: 'تعداد در بسته‌بندی الزامی است' })
    .int('تعداد باید عدد صحیح باشد')
    .positive('تعداد در بسته‌بندی باید حداقل ۱ باشد'),
  price: z
    .number({ required_error: 'قیمت الزامی است' })
    .nonnegative('قیمت نمی‌تواند منفی باشد'),
  barcode: z
    .string({ required_error: 'بارکد محصول الزامی است' })
    .trim()
    .min(1, 'بارکد نباید خالی باشد'),
  barcodeType: z.enum(['ean13', 'code128']).default('ean13'),
}).superRefine((data, ctx) => {
  if (data.barcodeType === 'ean13') {
    if (!/^\d{13}$/.test(data.barcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'بارکد EAN-13 باید دقیقاً ۱۳ رقم عددی باشد',
        path: ['barcode'],
      });
    } else if (!validateEan13Checksum(data.barcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'رقم کنترل (Checksum) بارکد EAN-13 نامعتبر است',
        path: ['barcode'],
      });
    }
  } else if (data.barcodeType === 'code128') {
    if (!/^[\x20-\x7E]+$/.test(data.barcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'بارکد Code 128 فقط شامل کاراکترهای اسکی معتبر است',
        path: ['barcode'],
      });
    }
  }
});

export type ProductDTO = z.infer<typeof ProductSchema>;

export interface ProductResponse extends ProductDTO {
  id: string;
  createdAt: string;
  updatedAt: string;
}