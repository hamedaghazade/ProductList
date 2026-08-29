import { BarcodeType } from '@shared/types/product';
import { productSchema } from '@shared/validators/product.schema';

describe('productSchema', () => {
  const validProduct = {
    name: 'Test Product',
    quantityPerPackage: 10,
    price: 1250.5,
    barcode: '4006381333931',
    barcodeType: BarcodeType.EAN13,
  };

  it('accepts valid product data', () => {
    expect(productSchema.parse(validProduct)).toEqual(validProduct);
  });

  it('rejects invalid EAN-13 check digit', () => {
    expect(() =>
      productSchema.parse({
        ...validProduct,
        barcode: '4006381333932',
      })
    ).toThrow('رقم کنترلی (Check Digit) بارکد EAN-13 نامعتبر است.');
  });

  it('rejects product names longer than database limit', () => {
    expect(() =>
      productSchema.parse({
        ...validProduct,
        name: 'x'.repeat(151),
      })
    ).toThrow('نام محصول نمی‌تواند بیش از ۱۵۰ کاراکتر باشد.');
  });
});
