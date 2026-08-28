import { z } from 'zod';

/**
 * اعتبارسنجی رقم کنترلی بارکد EAN-13 بر اساس الگوریتم استاندارد Modulo 10
 */
function validateEAN13Checksum(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  return calculatedCheckDigit === parseInt(barcode[12], 10);
}

/**
 * اعتبارسنجی کاراکترهای مجاز در استاندارد Code 128
 */
function validateCode128(barcode: string): boolean {
  return /^[\x20-\x7E]+$/.test(barcode);
}

const refineBarcode = (
  data: { barcode?: string; barcodeType?: 'EAN13' | 'CODE128' | 'QR' },
  ctx: z.RefinementCtx
) => {
  if (!data.barcode || !data.barcodeType) return;

  if (data.barcodeType === 'EAN13') {
    if (!/^\d{13}$/.test(data.barcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'بارکد EAN-13 باید دقیقاً ۱۳ رقم عددی باشد',
        path: ['barcode'],
      });
    } else if (!validateEAN13Checksum(data.barcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'رقم کنترلی (Checksum) بارکد EAN-13 نامعتبر است',
        path: ['barcode'],
      });
    }
  } else if (data.barcodeType === 'CODE128') {
    if (!validateCode128(data.barcode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'بارکد Code 128 شامل کاراکترهای غیرمجاز است',
        path: ['barcode'],
      });
    }
  }
};

export const BaseProductSchema = z.object({
  name: z
    .string({ required_error: 'نام محصول الزامی است' })
    .trim()
    .min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد')
    .max(255, 'نام محصول نمی‌تواند بیش از ۲۵۵ کاراکتر باشد'),

  quantityPerPackage: z
    .number({ required_error: 'تعداد در بسته الزامی است' })
    .int('تعداد در بسته باید عدد صحیح باشد')
    .positive('تعداد در بسته باید بزرگ‌تر از صفر باشد'),

  price: z
    .number({ required_error: 'قیمت محصول الزامی است' })
    .nonnegative('قیمت محصول نمی‌تواند منفی باشد'),

  barcode: z
    .string({ required_error: 'کد بارکد الزامی است' })
    .trim()
    .min(1, 'بارکد نمی‌تواند خالی باشد')
    .max(100, 'طول بارکد بیش از حد مجاز است'),

  barcodeType: z
    .enum(['EAN13', 'CODE128', 'QR'], {
      errorMap: () => ({ message: 'نوع بارکد نامعتبر است (EAN13، CODE128 یا QR)' }),
    })
    .default('CODE128'),
});

export const ProductSchema = BaseProductSchema.superRefine(refineBarcode);

export const UpdateProductSchema = BaseProductSchema.partial().superRefine(refineBarcode);

export const ProductQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'quantityPerPackage', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;