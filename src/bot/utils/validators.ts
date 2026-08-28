export interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  error?: string;
}

export function validateProductName(input: string): ValidationResult<string> {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'نام محصول باید حداقل ۲ کاراکتر باشد.' };
  }
  return { isValid: true, value: trimmed };
}

export function validateQuantity(input: string): ValidationResult<number> {
  const parsed = Number(input.trim());
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return { isValid: false, error: 'تعداد در بسته باید یک عدد صحیح بزرگ‌تر از صفر باشد.' };
  }
  return { isValid: true, value: parsed };
}

export function validatePrice(input: string): ValidationResult<number> {
  const sanitized = input.trim().replace(/,/g, '');
  const parsed = Number(sanitized);
  if (isNaN(parsed) || parsed < 0) {
    return { isValid: false, error: 'قیمت باید عددی بزرگ‌تر یا مساوی صفر باشد.' };
  }
  return { isValid: true, value: parsed };
}

export function validateBarcode(input: string, type: 'EAN13' | 'CODE128' = 'CODE128'): ValidationResult<{ barcode: string; type: 'EAN13' | 'CODE128' }> {
  const trimmed = input.trim();
  
  if (type === 'EAN13') {
    if (!/^\d{13}$/.test(trimmed)) {
      return { isValid: false, error: 'بارکد EAN-13 باید دقیقاً ۱۳ رقم عددی باشد.' };
    }
  } else {
    if (!/^[A-Za-z0-9\-_.]{3,30}$/.test(trimmed)) {
      return { isValid: false, error: 'بارکد وارد شده نامعتبر است (حداقل ۳ و حداکثر ۳۰ کاراکتر استاندارد).' };
    }
  }

  return { isValid: true, value: { barcode: trimmed, type } };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' ریال';
}