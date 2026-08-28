import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Plus, FileSpreadsheet, FileText, ArrowLeft, Barcode } from 'lucide-react';
import { fetchProductsSummary, exportExcelApi, exportPdfApi } from '../services/api';

interface DashboardProps {
  onNavigate: (page: 'products' | 'add' | 'export') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['products-summary'],
    queryFn: fetchProductsSummary,
  });

  const handleDownloadFile = async (type: 'excel' | 'pdf-table' | 'pdf-label') => {
    if (type === 'excel') await exportExcelApi();
    if (type.startsWith('pdf')) await exportPdfApi(type === 'pdf-table' ? 'table' : 'label');
  };

  return (
    <div className="flex flex-col gap-5 p-4 max-w-lg mx-auto pb-24 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-85">
            <span className="text-xs font-medium">کل محصولات</span>
            <Package className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">{isLoading ? '...' : summary?.totalProducts ?? 0}</div>
            <span className="text-[10px] opacity-75">قلم کالا ثبت شده</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-lg shadow-teal-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-85">
            <span className="text-xs font-medium">کل اقلام انبار</span>
            <Barcode className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">{isLoading ? '...' : summary?.totalItemsCount ?? 0}</div>
            <span className="text-[10px] opacity-75">مجموع بسته/عدد</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">دسترسی سریع</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('add')}
            className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">ثبت محصول</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigate('products')}
            className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">فهرست کالاها</span>
            </div>
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Export Panel */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">دریافت خروجی‌ها</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-2 divide-y divide-slate-100 dark:divide-slate-700/50 shadow-sm">
          <div
            onClick={() => handleDownloadFile('excel')}
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">خروجی اکسل (Excel)</div>
                <div className="text-xs text-slate-500">حاوی جدول کامل و تصویر بارکد در سلول</div>
              </div>
            </div>
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={() => handleDownloadFile('pdf-table')}
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">خروجی PDF (گزارش جدولی)</div>
                <div className="text-xs text-slate-500">طراحی استاندارد A4 فارسی جهت بایگانی</div>
              </div>
            </div>
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={() => handleDownloadFile('pdf-label')}
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-lg">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">چاپ لیبل بارکد (PDF Labels)</div>
                <div className="text-xs text-slate-500">شبکه‌بندی دقیق جهت چاپ برچسب کالا</div>
              </div>
            </div>
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};