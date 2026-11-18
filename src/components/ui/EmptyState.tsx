import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-[#27272A] dark:border-white/5 dark:text-slate-400 rounded-lg ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-400 dark:text-teal-400 mb-3 border border-slate-200 dark:border-[#27272A]">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 font-sans">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed font-sans">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] rounded-md transition-all duration-150 active:scale-95 border border-[#8DA9C4]/30 shadow-btn-tactile cursor-pointer select-none"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
