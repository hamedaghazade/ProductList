import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { ProductsPage } from './pages/ProductsPage';
import { ExportPage } from './pages/ExportPage';
import { Navbar } from './components/layout/Navbar';
import { useTelegram } from './hooks/useTelegram';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'products' | 'export' | 'add'>('dashboard');
  const { user } = useTelegram();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top App Bar */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/60 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between" dir="rtl">
          <div>
            <h1 className="text-sm font-black bg-gradient-to-l from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ProductList Pro
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">مدیریت هوشمند محصولات و بارکد</p>
          </div>
          {user && (
            <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg">
              {user.first_name}
            </div>
          )}
        </div>
      </header>

      {/* Main Pages Router */}
      <main className="flex-1">
        {currentPage === 'dashboard' && (
          <Dashboard
            onNavigate={(page) => {
              if (page === 'add') {
                setCurrentPage('products');
              } else {
                setCurrentPage(page);
              }
            }}
          />
        )}
        {currentPage === 'products' && <ProductsPage />}
        {currentPage === 'export' && <ExportPage />}
      </main>

      {/* Bottom Nav Bar */}
      <Navbar
        currentPage={currentPage === 'add' ? 'products' : currentPage}
        onNavigate={(p) => setCurrentPage(p)}
      />
    </div>
  );
};