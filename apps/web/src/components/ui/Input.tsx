import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</label>
      <input
        className={`w-full p-3 bg-white dark:bg-slate-800 border rounded-xl text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ${
          error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[11px] text-rose-500 font-medium">{error}</span>}
    </div>
  );
};