import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'secondary', size = 'md', icon, loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out active:scale-95 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-md';

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-base px-4 py-2.5 gap-2.5',
    }[size];

    const variantStyles = {
      primary: 'bg-teal-700 text-white hover:bg-[#0D6861] active:bg-[#115E59] border border-transparent',
      secondary: 'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200',
      outline: 'bg-transparent text-slate-700 hover:bg-slate-100/70 border border-slate-200',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-0.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
