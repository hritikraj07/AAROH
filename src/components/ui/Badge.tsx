import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'emerald' | 'amber' | 'rose' | 'slate' | 'blue' | 'indigo' | 'violet';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2 py-0.5 font-medium',
  }[size];

  const variantStyles = {
    teal: 'bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    rose: 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#27272A] dark:text-slate-300 dark:border-[#38383E]',
    blue: 'bg-blue-50 text-blue-800 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
    violet: 'bg-purple-50 text-purple-800 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
  }[variant];

  const dotColors = {
    teal: 'bg-teal-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    violet: 'bg-purple-600',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border ${sizeStyles} ${variantStyles} ${className} whitespace-nowrap`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />}
      {children}
    </span>
  );
};
