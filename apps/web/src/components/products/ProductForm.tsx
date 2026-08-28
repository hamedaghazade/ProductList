import React, { useState } from 'react';
import { BarcodeType, IProduct } from '@shared/types/product';
import { productSchema } from '@shared/validators/product.schema';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { BarcodePreview } from './BarcodePreview';

interface ProductFormProps {
  initialData?: IProduct;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [quantity, setQuantity] = useState(initialData?.quantityPerPackage.toString() || '1');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [barcodeType, setBarcodeType] = useState<BarcodeType>(initialData?.barcodeType || BarcodeType.EAN13);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name,
      quantityPerPackage: parseInt(quantity, 10),
      price: parseFloat(price),
      barcode,
      barcodeType,
    };

    const validation = productSchema.safeParse(payload);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errMap[err.path[0].toString()] = err.message;
      });
      setErrors(errMap);
      return;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="نام کالا"
        placeholder="مثال: نوشابه کولا"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="تعداد در بسته"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={errors.quantityPerPackage}
        />
        <Input
          label="قیمت (ریال)"
          type="number"
          placeholder="850000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={errors.price}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">نوع استاندارد بارکد</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setBarcodeType(BarcodeType.EAN13)}
            className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
              barcodeType === BarcodeType.EAN13
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600'
            }`}
          >
            EAN-13 (۱۳ رقمی)
          </button>
          <button
            type="button"
            onClick={() => setBarcodeType(BarcodeType.CODE128)}
            className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
              barcodeType === BarcodeType.CODE128
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600'
            }`}
          >
            Code 128 (متنی/عددی)
          </button>
        </div>
      </div>

      <Input
        label="کد بارکد"
        placeholder={barcodeType === BarcodeType.EAN13 ? '6261234567890' : 'ABC-12345'}
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        error={errors.barcode}
        dir="ltr"
        className="font-mono text-center"
      />

      <div className="my-1">
        <span className="text-[11px] font-semibold text-slate-500 mb-1 block">پیش‌نمایش زنده بارکد:</span>
        <BarcodePreview value={barcode} type={barcodeType} />
      </div>

      <Button type="submit" isLoading={isLoading} className="mt-2">
        {initialData ? 'ذخیره تغییرات' : 'ثبت محصول'}
      </Button>
    </form>
  );
};