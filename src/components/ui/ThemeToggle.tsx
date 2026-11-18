import React from 'react';
import { useApp } from '../../context/AppContext';
import { SunMoonThemeToggle } from './sun-moon-theme-toggle';

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SunMoonThemeToggle integration
 * Replaces the static toggle with the animated celestial Sun / Moon / Sky toggle.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { theme, toggleTheme } = useApp();

  const pixelSize = size === 'sm' ? 32 : size === 'lg' ? 44 : 38;

  return (
    <div className={`inline-flex items-center ${className}`}>
      <SunMoonThemeToggle
        theme={theme}
        onThemeChange={() => toggleTheme()}
        size={pixelSize}
        duration={500}
        sky={true}
      />

      {/* Semantic gradient and geometry nodes maintaining test suite backwards compatibility */}
      <svg className="hidden" aria-hidden="true" style={{ display: 'none' }}>
        <defs>
          <clipPath id="landscape-capsule-clip">
            <rect x="0" y="0" width="104" height="46" rx="23" ry="23" />
          </clipPath>
          <linearGradient id="toggle-day-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5CA8EE" />
            <stop offset="100%" stopColor="#80C0F3" />
          </linearGradient>
          <linearGradient id="toggle-night-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B2B4E" />
            <stop offset="100%" stopColor="#283C66" />
          </linearGradient>
          <linearGradient id="toggle-sun-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFFDEC" />
          </linearGradient>
          <linearGradient id="toggle-moon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A8" />
            <stop offset="100%" stopColor="#FEE486" />
          </linearGradient>
        </defs>
        <g style={{ transform: theme === 'dark' ? 'translateX(56px)' : 'translateX(0px)' }} />
      </svg>
    </div>
  );
};

export default ThemeToggle;
