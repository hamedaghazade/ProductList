import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { exportExcelApi, exportPdfApi } from '../services/api';
import { FileSpreadsheet, FileText, Barcode, CheckSquare, Square } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ExportPage: React.FC = () => {
  const { productsQuery } = useProducts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === (productsQuery.data?.items.length || 0)) {
      setSelectedIds([]);
    } else {
      setSelectedIds(productsQuery.data?.items.map((p) => p.id) || []);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleExport = async (type: 'excel' | 'pdf-table' | 'pdf-label') => {
    setIsExporting(true);
    try {
      const ids = selectedIds.length > 0 ? selectedIds : undefined;
      if (type === 'excel') await exportExcelApi(ids);
      if (type === 'pdf-table') await exportPdfApi('table', ids);
      if (type === 'pdf-label') await exportPdfApi('label', ids);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto pb-24" dir="rtl">
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">دریافت گزارش‌ها و چاپ بارکد</h2>
        <p className="text-xs text-slate-500 mt-1">
          می‌توانید کل محصولات یا فقط اقلام انتخابی را خروجی بگیرید.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          onClick={() => handleExport('excel')}
          isLoading={isExporting}
          className="flex-col gap-1 py-3 h-auto"
        >
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span className="text-xs">اکسل</span>
        </Button>

        <Button
          variant="secondary"
          onClick={() => handleExport('pdf-table')}
          isLoading={isExporting}
          className="flex-col gap-1 py-3 h-auto"
        >
          <FileText className="w-5 h-5 text-rose-600" />
          <span className="text-xs">PDF جدولی</span>
        </Button>

        <Button
          variant="secondary"
          onClick={() => handleExport('pdf-label')}
          isLoading={isExporting}
          className="flex-col gap-1 py-3 h-auto"
        >
          <Barcode className="w-5 h-5 text-amber-600" />
          <span className="text-xs">چاپ لیبل</span>
        </Button>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
          انتخاب اقلام ({selectedIds.length} از {productsQuery.data?.items.length || 0})
        </span>
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold"
        >
          {selectedIds.length === (productsQuery.data?.items.length || 0) ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          <span>انتخاب همه</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
        {productsQuery.data?.items.map((p) => {
          const selected = selectedIds.includes(p.id);
          return (
            <div
              key={p.id}
              onClick={() => toggleSelect(p.id)}
              className={`p-3 bg-white dark:bg-slate-800 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                selected ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div>
                <div className="text-sm font-bold">{p.name}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{p.barcode}</div>
              </div>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => {}}
                className="w-4 h-4 rounded text-blue-600 pointer-events-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};