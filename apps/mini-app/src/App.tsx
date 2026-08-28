import React, { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { Package, Plus, FileSpreadsheet, Printer } from 'lucide-react';

export const App: React.FC = () => {
  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
    } catch {
      console.warn('Telegram WebApp is running outside Telegram client context.');
    }
  }, []);

  return (
    <div className="min-h-screen p-4 flex flex-col gap-4 max-w-lg mx-auto">
      <header className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold">پنل مدیریت کالا</h1>
          <p className="text-xs text-gray-500">کنترل موجودی، بارکد و خروجی چاپی</p>
        </div>
        <Package className="w-8 h-8 text-blue-600" />
      </header>

      <section className="grid grid-cols-2 gap-3">
        <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition">
          <Plus className="w-6 h-6 text-blue-600 mb-1" />
          <span className="text-sm font-semibold">ثبت محصول جدید</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-1" />
          <span className="text-sm font-semibold">خروجی اکسل</span>
        </button>
      </section>

      <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
        <Printer className="w-12 h-12 mb-2 stroke-1" />
        <p className="text-sm">آماده اتصال به سرویس بارکد و دیتابیس</p>
      </div>
    </div>
  );
};