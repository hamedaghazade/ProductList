import React, { useState, useEffect, useMemo } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { 
  Package, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  FileText, 
  Trash2, 
  Barcode as BarcodeIcon, 
  QrCode,
  RefreshCw 
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  quantityPerPackage: number;
  price: number;
  barcode: string;
  barcodeType: 'ean13' | 'code128';
}

export const App: React.FC = () => {
  const { tg, showScanQrPopup, haptic } = useTelegram();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // فرم ثبت
  const [formData, setFormData] = useState({
    name: '',
    quantityPerPackage: 1,
    price: 0,
    barcode: '',
    barcodeType: 'ean13' as 'ean13' | 'code128',
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch {
      // داده نمایشی برای لوکال
      setProducts([
        { id: '1', name: 'نوشابه کولا ۱.۵ لیتری', quantityPerPackage: 6, price: 420000, barcode: '6261234567890', barcodeType: 'ean13' },
        { id: '2', name: 'روغن سرخ‌کردنی ۹۰۰ گرم', quantityPerPackage: 12, price: 780000, barcode: '6269876543211', barcodeType: 'ean13' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleScanBarcode = () => {
    haptic.impact('medium');
    showScanQrPopup({ text: 'بارکد کالا را مقابل دوربین قرار دهید' }, (scannedText) => {
      setFormData((prev) => ({ ...prev, barcode: scannedText }));
      return true;
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) => p.name.includes(searchQuery) || p.barcode.includes(searchQuery)
    );
  }, [products, searchQuery]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    haptic.impact('heavy');
    setIsLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        haptic.notify('success');
        setShowModal(false);
        setFormData({ name: '', quantityPerPackage: 1, price: 0, barcode: '', barcodeType: 'ean13' });
        fetchProducts();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-emerald-400" />
          <h1 className="font-bold text-lg">مدیریت انبار و بارکد</h1>
        </div>
        <button
          onClick={() => { haptic.selection(); setShowModal(true); }}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> کالا جدید
        </button>
      </header>

      {/* Main Container */}
      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700/60 shadow-sm">
            <span className="text-xs text-slate-400">کل محصولات</span>
            <p className="text-2xl font-bold text-white mt-1">{products.length.toLocaleString('fa-IR')}</p>
          </div>
          <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700/60 shadow-sm">
            <span className="text-xs text-slate-400">ارزش کل موجودی</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {products.reduce((acc, p) => acc + Number(p.price), 0).toLocaleString('fa-IR')} <span className="text-xs">تومان</span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          <a
            href="/api/export/excel"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-750 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> خروجی Excel
          </a>
          <a
            href="/api/export/pdf"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-750 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <FileText className="w-4 h-4 text-rose-400" /> چاپ PDF
          </a>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی نام یا شماره بارکد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Product Cards List */}
        <div className="space-y-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white text-base">{p.name}</h3>
                  <span className="text-xs text-slate-400">تعداد در کارتن: {p.quantityPerPackage} عدد</span>
                </div>
                <span className="text-emerald-400 font-bold text-sm">
                  {Number(p.price).toLocaleString('fa-IR')} تومان
                </span>
              </div>

              {/* Barcode Line */}
              <div className="flex items-center justify-between bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <BarcodeIcon className="w-5 h-5 text-slate-400" />
                  <code className="font-mono text-sm tracking-wider text-slate-200">{p.barcode}</code>
                </div>
                <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">
                  {p.barcodeType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal ثبت محصول */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-800 border border-slate-700 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3">افزودن محصول جدید</h2>
            
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">نام کالا</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="مثال: آبمیوه پرتقال"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">تعداد در بسته</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.quantityPerPackage}
                    onChange={(e) => setFormData({ ...formData, quantityPerPackage: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">قیمت (تومان)</label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-300">کد بارکد</label>
                  <button
                    type="button"
                    onClick={handleScanBarcode}
                    className="text-xs text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    <QrCode className="w-3.5 h-3.5" /> اسکن با دوربین
                  </button>
                </div>
                <input
                  required
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  placeholder="6261234567890"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  {isLoading ? 'در حال ثبت...' : 'ذخیره کالا'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2.5 rounded-lg text-sm transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};