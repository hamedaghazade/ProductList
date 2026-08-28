import { z } from 'zod';

export const BarcodeTypeEnum = z.enum(['EAN13', 'CODE128'], {
  errorMap: () => ({ message: 'نوع بارکد باید EAN13 یا CODE128 باشد' }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'نام محصول الزامی است' })
      .trim()
      .min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد')
      .max(255, 'نام محصول نمی‌تواند بیش از ۲۵۵ کاراکتر باشد'),
    quantityPerPackage: z
      .number({ required_error: 'تعداد در بسته الزامی است' })
      .int('تعداد باید عدد صحیح باشد')
      .positive('تعداد در بسته باید یک عدد مثبت باشد'),
    price: z
      .number({ required_error: 'قیمت محصول الزامی است' })
      .nonnegative('قیمت محصول نمی‌تواند منفی باشد'),
    barcode: z
      .string({ required_error: 'بارکد الزامی است' })
      .trim()
      .min(1, 'بارکد نباید خالی باشد'),
    barcodeType: BarcodeTypeEnum.default('CODE128'),
  }).superRefine((data, ctx) => {
    if (data.barcodeType === 'EAN13') {
      const isDigitsOnly = /^\d+$/.test(data.barcode);
      if (!isDigitsOnly || data.barcode.length !== 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'بارکد EAN-13 باید دقیقاً ۱۳ رقم عددی باشد',
          path: ['barcode'],
        });
      }
    }
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('شناسه محصول نامعتبر است'),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'نام محصول باید حداقل ۲ کاراکتر باشد')
      .max(255, 'نام محصول نمی‌تواند بیش از ۲۵۵ کاراکتر باشد')
      .optional(),
    quantityPerPackage: z
      .number()
      .int('تعداد باید عدد صحیح باشد')
      .positive('تعداد در بسته باید یک عدد مثبت باشد')
      .optional(),
    price: z
      .number()
      .nonnegative('قیمت محصول نمی‌تواند منفی باشد')
      .optional(),
    barcode: z
      .string()
      .trim()
      .min(1, 'بارکد نباید خالی باشد')
      .optional(),
    barcodeType: BarcodeTypeEnum.optional(),
  }).superRefine((data, ctx) => {
    if (data.barcodeType === 'EAN13' && data.barcode) {
      const isDigitsOnly = /^\d+$/.test(data.barcode);
      if (!isDigitsOnly || data.barcode.length !== 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'بارکد EAN-13 باید دقیقاً ۱۳ رقم عددی باشد',
          path: ['barcode'],
        });
      }
    }
  }),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('شناسه محصول نامعتبر است'),
  }),
});

export const queryProductSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform((v) => Math.max(1, parseInt(v, 10) || 1)),
    limit: z.string().optional().default('10').transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 10))),
    search: z.string().trim().optional(),
    sortBy: z.enum(['createdAt', 'name', 'price', 'quantityPerPackage']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});