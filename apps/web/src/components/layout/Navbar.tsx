import React from 'react';
import { LayoutDashboard, Package, Download } from 'lucide-react';

interface NavbarProps {
  currentPage: 'dashboard' | 'products' | 'export';
  onNavigate: (page: 'dashboard' | 'products' | 'export') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const items = [
    { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { id: 'products', label: 'محصولات', icon: Package },
    { id: 'export', label: 'خروجی‌ها', icon: Download },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 p-2 z-40 max-w-lg mx-auto">
      <div className="flex justify-around items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
                active
                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};