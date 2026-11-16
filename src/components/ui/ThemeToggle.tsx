import React from 'react';
import { useApp } from '../../context/AppContext';

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: { width: 56, height: 26, viewBox: '0 0 104 46' },
  md: { width: 68, height: 30, viewBox: '0 0 104 46' },
  lg: { width: 84, height: 38, viewBox: '0 0 104 46' },
};

/**
 * Landscape Theme Toggle
 * Recreates the premium animated landscape toggle with day/night scenery,
 * with the sliding Sun/Moon thumb brought to the foreground as an illuminated
 * tactile knob gliding across the landscape track.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';
  const dimensions = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle visual theme between day and night"
      className={`relative inline-flex items-center justify-center p-0 rounded-full cursor-pointer select-none transition-transform duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 shadow-sm hover:shadow group shrink-0 ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      <svg
        viewBox={dimensions.viewBox}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full block rounded-full"
      >
        <defs>
          {/* Capsule Clip Boundary */}
          <clipPath id="landscape-capsule-clip">
            <rect x="0" y="0" width="104" height="46" rx="23" ry="23" />
          </clipPath>

          {/* Sky Gradients */}
          <linearGradient id="toggle-day-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5CA8EE" />
            <stop offset="100%" stopColor="#80C0F3" />
          </linearGradient>
          <linearGradient id="toggle-night-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B2B4E" />
            <stop offset="100%" stopColor="#283C66" />
          </linearGradient>

          {/* Sun & Moon Gradients */}
          <linearGradient id="toggle-sun-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFFDEC" />
          </linearGradient>
          <linearGradient id="toggle-moon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A8" />
            <stop offset="100%" stopColor="#FEE486" />
          </linearGradient>

          {/* Tactile Thumb Drop Shadow */}
          <filter id="thumb-drop-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Clip all elements strictly within the pill capsule */}
        <g clipPath="url(#landscape-capsule-clip)">
          {/* ========================================================= */}
          {/* LAYER 1: SKY BACKGROUNDS (Cross-fading)                   */}
          {/* ========================================================= */}
          {/* Daytime Sky */}
          <rect
            width="104"
            height="46"
            fill="url(#toggle-day-sky)"
            className="transition-opacity duration-500 ease-in-out"
            style={{ opacity: isDark ? 0 : 1 }}
          />
          {/* Nighttime Sky */}
          <rect
            width="104"
            height="46"
            fill="url(#toggle-night-sky)"
            className="transition-opacity duration-500 ease-in-out"
            style={{ opacity: isDark ? 1 : 0 }}
          />

          {/* ========================================================= */}
          {/* LAYER 2: DISTANT BACKGROUND (Cityscape, Clouds, Stars)   */}
          {/* ========================================================= */}
          {/* Daytime Distant City & Clouds */}
          <g
            className="transition-opacity duration-500 ease-in-out"
            style={{ opacity: isDark ? 0 : 1 }}
          >
            {/* Soft Distant Skyline on Left */}
            <rect x="7" y="19" width="5" height="13" fill="#78BAEA" rx="0.5" />
            <rect x="13" y="15" width="6" height="17" fill="#78BAEA" rx="0.5" />
            <rect x="20" y="20" width="5" height="12" fill="#78BAEA" rx="0.5" />
            <rect x="26" y="23" width="4" height="9" fill="#78BAEA" rx="0.5" />
            {/* Fluffy Daytime Clouds */}
            <path
              d="M 44,17 C 44,14 47,13 49,13 C 51,10 55,10 57,13 C 59,13 61,15 60,17 Z"
              fill="#D4EEFD"
              opacity="0.8"
            />
            <path
              d="M 57,19 C 57,16 60,15 62,15 C 64,13 67,13 69,15 C 71,15 72,17 72,19 Z"
              fill="#D4EEFD"
              opacity="0.8"
            />
          </g>

          {/* Nighttime Distant City with Lit Windows & Twinkling Stars */}
          <g
            className="transition-opacity duration-500 ease-in-out"
            style={{ opacity: isDark ? 1 : 0 }}
          >
            {/* Distant Midnight Skyline */}
            <rect x="7" y="19" width="5" height="13" fill="#2E4369" rx="0.5" />
            <rect x="13" y="15" width="6" height="17" fill="#2E4369" rx="0.5" />
            <rect x="20" y="20" width="5" height="12" fill="#2E4369" rx="0.5" />
            <rect x="26" y="23" width="4" height="9" fill="#2E4369" rx="0.5" />
            {/* Lit City Windows */}
            <rect x="15" y="17" width="1.2" height="1.2" fill="#FFE28A" />
            <rect x="15" y="20" width="1.2" height="1.2" fill="#FFE28A" />
            <rect x="9" y="21" width="1.2" height="1.2" fill="#FFE28A" />
            <rect x="22" y="22" width="1.2" height="1.2" fill="#FFE28A" />
            {/* Stars */}
            <path
              d="M 48,15 L 49,12 L 50,15 L 53,16 L 50,17 L 49,20 L 48,17 L 45,16 Z"
              fill="#E2EAF8"
              opacity="0.9"
            />
            <path
              d="M 59,16 L 60,13 L 61,16 L 64,17 L 61,18 L 60,21 L 59,18 L 56,17 Z"
              fill="#E2EAF8"
              opacity="0.9"
            />
            <circle cx="40" cy="18" r="0.8" fill="#E2EAF8" opacity="0.75" />
          </g>

          {/* ========================================================= */}
          {/* LAYER 3: BACKGROUND LANDSCAPES (Hills, Tree, Path, Bushes) */}
          {/* ========================================================= */}
          {/* Daytime Landscape */}
          <g
            className="transition-opacity duration-500 ease-in-out"
            style={{ opacity: isDark ? 0 : 1 }}
          >
            {/* Back Hill (Right) */}
            <path d="M 32 28 Q 62 19 104 22 L 104 46 L 32 46 Z" fill="#45A169" />

            {/* Stylized Tree on Right Hill */}
            <rect x="74" y="20" width="3" height="8" fill="#2D6B48" rx="1" />
            <circle cx="75.5" cy="18" r="6" fill="#33945C" />
            <circle cx="72" cy="19.5" r="4.5" fill="#33945C" />
            <circle cx="79" cy="19.5" r="4.5" fill="#33945C" />
            <circle cx="75.5" cy="15" r="4" fill="#3BA667" />
            {/* Small shrub beside tree */}
            <ellipse cx="69" cy="27" rx="3.5" ry="2" fill="#2E7C85" />

            {/* Front Hill (Left and Center) */}
            <path
              d="M 0 24 Q 28 20 58 29 Q 78 35 104 33 L 104 46 L 0 46 Z"
              fill="#5EBE7B"
            />

            {/* Winding Sandy Country Path */}
            <path
              d="M 48 29 Q 59 31 52 37 Q 48 41 58 46 L 68 46 Q 55 40 62 35 Q 65 30 52 29 Z"
              fill="#E4CD90"
            />

            {/* Bushes on Bottom-Left Corner */}
            <path
              d="M -2 33 Q 6 29 12 35 Q 16 31 22 39 L 22 46 L -2 46 Z"
              fill="#2F7C85"
            />

            {/* Grass Tufts on Hills */}
            <path
              d="M 18 30 L 19 28 M 19 28 L 20 30"
              stroke="#4C9F68"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 43 36 L 44 34 M 44 34 L 45 36"
              stroke="#4C9F68"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 64 38 L 65 36 M 65 36 L 66 38"
              stroke="#4C9F68"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Nighttime Landscape */}
          <g
            className="transition-opacity duration-500 ease-in-out"
            style={{ opacity: isDark ? 1 : 0 }}
          >
            {/* Back Hill (Right) in Midnight Indigo */}
            <path d="M 32 28 Q 62 19 104 22 L 104 46 L 32 46 Z" fill="#1C2740" />

            {/* Tree Silhouette */}
            <rect x="74" y="20" width="3" height="8" fill="#141D30" rx="1" />
            <circle cx="75.5" cy="18" r="6" fill="#172238" />
            <circle cx="72" cy="19.5" r="4.5" fill="#172238" />
            <circle cx="79" cy="19.5" r="4.5" fill="#172238" />
            <circle cx="75.5" cy="15" r="4" fill="#1D2A44" />
            {/* Small night shrub */}
            <ellipse cx="69" cy="27" rx="3.5" ry="2" fill="#18243A" />

            {/* Front Hill in Midnight Slate */}
            <path
              d="M 0 24 Q 28 20 58 29 Q 78 35 104 33 L 104 46 L 0 46 Z"
              fill="#263758"
            />

            {/* Moonlit Reflective Water Path */}
            <path
              d="M 48 29 Q 59 31 52 37 Q 48 41 58 46 L 68 46 Q 55 40 62 35 Q 65 30 52 29 Z"
              fill="#7995C5"
            />

            {/* Night Bushes on Bottom-Left */}
            <path
              d="M -2 33 Q 6 29 12 35 Q 16 31 22 39 L 22 46 L -2 46 Z"
              fill="#18243A"
            />

            {/* Grass Tufts in Twilight */}
            <path
              d="M 18 30 L 19 28 M 19 28 L 20 30"
              stroke="#1C2740"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 43 36 L 44 34 M 44 34 L 45 36"
              stroke="#1C2740"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 64 38 L 65 36 M 65 36 L 66 38"
              stroke="#1C2740"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* ========================================================= */}
          {/* LAYER 4: CELESTIAL THUMB (Sun <-> Moon in FOREGROUND)     */}
          {/* Brought to the most forward as the tactile sliding handle */}
          {/* ========================================================= */}
          <g
            filter="url(#thumb-drop-shadow)"
            className="transition-transform duration-500 ease-in-out"
            style={{
              transform: isDark ? 'translateX(56px)' : 'translateX(0px)',
            }}
          >
            {/* The Sun (Visible in Light Mode) - Glowing Foreground Celestial Body */}
            <g
              className="transition-all duration-500 ease-in-out"
              style={{
                opacity: isDark ? 0 : 1,
                transform: isDark ? 'rotate(90deg) scale(0.6)' : 'rotate(0deg) scale(1)',
                transformOrigin: '23px 23px',
              }}
            >
              {/* Outer Radiant Glow */}
              <circle cx="23" cy="23" r="15" fill="#FFFFFF" opacity="0.32" />
              {/* Outer Sun Ring */}
              <circle cx="23" cy="23" r="13" fill="#FFFBE6" opacity="0.8" />
              {/* Core Sun Body */}
              <circle cx="23" cy="23" r="11.5" fill="url(#toggle-sun-gradient)" />
            </g>

            {/* The Crescent Moon (Visible in Dark Mode) - Glowing Night Thumb */}
            <g
              className="transition-all duration-500 ease-in-out"
              style={{
                opacity: isDark ? 1 : 0,
                transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.6)',
                transformOrigin: '23px 23px',
              }}
            >
              {/* Soft Moon Halo */}
              <circle cx="23" cy="23" r="14" fill="#FEE486" opacity="0.25" />
              {/* Crescent Moon Arc */}
              <path
                d="M 22,10 A 13,13 0 0 0 35,27 A 11.5,11.5 0 1 1 22,10 Z"
                fill="url(#toggle-moon-gradient)"
              />
              {/* Subtle Moon Crater details */}
              <circle cx="25" cy="20" r="1" fill="#E6C852" opacity="0.4" />
              <circle cx="28" cy="23" r="1.3" fill="#E6C852" opacity="0.35" />
            </g>
          </g>

          {/* ========================================================= */}
          {/* LAYER 5: HIGH-GLOSS GLASS REFLECTION SHEEN                */}
          {/* ========================================================= */}
          <polygon
            points="26,-5 42,-5 18,51 2,51"
            fill="#FFFFFF"
            opacity="0.14"
            className="pointer-events-none"
          />
          <polygon
            points="46,-5 53,-5 29,51 22,51"
            fill="#FFFFFF"
            opacity="0.08"
            className="pointer-events-none"
          />

          {/* ========================================================= */}
          {/* LAYER 6: CAPSULE BORDER                                   */}
          {/* ========================================================= */}
          <rect
            x="0.5"
            y="0.5"
            width="103"
            height="45"
            rx="22.5"
            ry="22.5"
            fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'}
            className="pointer-events-none"
          />
        </g>
      </svg>
    </button>
  );
};

export default ThemeToggle;
