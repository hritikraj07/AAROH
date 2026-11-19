import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Shimmering skeleton loader with animated pulse and subtle gradient to prevent layout shift.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-white/5 rounded-lg ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#18181B] border border-[#E5ECE8] dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-4 h-4 rounded-full" />
          </div>
          <div className="space-y-1.5 my-3">
            <Skeleton className="w-24 h-3 rounded" />
            <Skeleton className="w-16 h-7 rounded" />
          </div>
          <Skeleton className="w-full h-3 rounded" />
        </div>
      ))}
    </div>
  );
};

export const ListItemSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#18181B] border border-[#E5ECE8] dark:border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="w-48 h-3.5 rounded" />
              <Skeleton className="w-32 h-2.5 rounded" />
            </div>
          </div>
          <Skeleton className="w-16 h-6 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
};
