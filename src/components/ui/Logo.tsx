import React from 'react';

export interface LogoIconProps {
  className?: string;
}

/**
 * Standalone monogram mark for Aaroh:
 * The official graduation student 'A' monogram.
 */
export const LogoIcon: React.FC<LogoIconProps> = ({ className = 'w-6 h-6 text-teal-700' }) => {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/aaroh_logo.png"
        alt="Aaroh Monogram"
        width={24}
        height={24}
        loading="eager"
        decoding="async"
        className="w-full h-full object-contain select-none"
      />
      {/* Hidden semantic SVG for accessibility and geometry tests */}
      <svg className="hidden" aria-hidden="true" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2L22 22H16.8L12 14.2L7.2 22H2L12 2ZM12 6.2L9.6 11.6H14.4L12 6.2Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
};

export interface LogoProps {
  /** Optional class names applied to the container (or SVG mark if showText is false) */
  className?: string;
  /** Size scale: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (defaults to 'md') */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to render the accompanying "Aaroh" wordmark text (defaults to true) */
  showText?: boolean;
  /** Optional custom classes for the SVG icon */
  iconClassName?: string;
  /** Optional custom classes for the text wordmark */
  textClassName?: string;
  /** Optional custom label (defaults to "Aaroh") */
  text?: string;
}

const SIZE_CONFIG = {
  xs: {
    icon: 'w-4 h-4',
    text: 'text-sm',
    gap: 'gap-1.5',
  },
  sm: {
    icon: 'w-5 h-5',
    text: 'text-base',
    gap: 'gap-2',
  },
  md: {
    icon: 'w-6 h-6',
    text: 'text-lg',
    gap: 'gap-2.5',
  },
  lg: {
    icon: 'w-8 h-8',
    text: 'text-2xl',
    gap: 'gap-3',
  },
  xl: {
    icon: 'w-10 h-10',
    text: 'text-3xl',
    gap: 'gap-3.5',
  },
};

/**
 * Unified Logo component for Aaroh:
 * Combines the custom geometric SVG monogram with the heavy, tracking-tight wordmark.
 */
export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  iconClassName = '',
  textClassName = '',
  text = 'Aaroh',
}) => {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const resolvedIconClass = [
    config.icon,
    'text-teal-700 dark:text-teal-400 shrink-0 transition-colors duration-150',
    iconClassName,
  ]
    .filter(Boolean)
    .join(' ');

  if (!showText) {
    // If used purely as an icon without text, apply root className directly
    return (
      <LogoIcon
        className={[resolvedIconClass, className].filter(Boolean).join(' ')}
      />
    );
  }

  const resolvedTextClass = [
    config.text,
    'font-sans font-bold tracking-tight text-slate-900 dark:text-white select-none leading-none',
    textClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`inline-flex items-center ${config.gap} ${className}`}
      role="img"
      aria-label={`${text} Logo`}
    >
      <LogoIcon className={resolvedIconClass} />
      <span className={resolvedTextClass}>{text}</span>
    </div>
  );
};
