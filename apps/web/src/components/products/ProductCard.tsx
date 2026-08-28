import React from 'react';
import { IProduct } from '@shared/types/product';
import { Edit2, Trash2 } from 'lucide-react';
import { BarcodePreview } from './BarcodePreview';

interface ProductCardProps {
  product: IProduct;
  onEdit: (product: IProduct) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}) => {
  return (
    <div className={`p-4 bg-white dark:bg-slate-800 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-sm ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200/80 dark:border-slate-700/60'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(product.id)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          )}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{product.name}</h4>
            <div className="flex gap-2 text-xs text-slate-500 mt-1">
              <span>بسته {product.quantityPerPackage} تایی</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {product.price.toLocaleString('fa-IR')} ریال
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl flex items-center justify-center">
        <BarcodePreview value={product.barcode} type={product.barcodeType} />
      </div>
    </div>
  );
};