import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { BarcodeType } from '@shared/types/product';
import { isValidEAN13 } from '@shared/validators/product.schema';

interface BarcodePreviewProps {
  value: string;
  type: BarcodeType;
}

export const BarcodePreview: React.FC<BarcodePreviewProps> = ({ value, type }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const isValid = type === BarcodeType.EAN13 ? isValidEAN13(value) : value.trim().length > 0;

  useEffect(() => {
    if (svgRef.current && isValid && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: type === BarcodeType.EAN13 ? 'EAN13' : 'CODE128',
          lineColor: '#000000',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          font: 'monospace',
          background: 'transparent',
        });
      } catch {
        // نادیده گرفتن خطاهای رندر در هنگام تایپ کاربر
      }
    }
  }, [value, type, isValid]);

  if (!value) {
    return <div className="text-center text-xs text-slate-400 py-4">بارکد را وارد کنید تا پیش‌نمایش تولید شود</div>;
  }

  if (!isValid) {
    return (
      <div className="text-center text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
        بارکد واردشده با استاندارد {type} همخوانی ندارد
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
      <svg ref={svgRef} className="max-w-full" />
    </div>
  );
};