import React from 'react';

export interface UniversityBuildingWireframeProps {
  className?: string;
  wrapperClassName?: string;
}

/**
 * Architectural line-art SVG illustration of K.R. Mangalam University monumental building facade.
 * Clean, solid, crisp thin strokes only (strokeWidth 1.15).
 * Features a grand central dome with spire, two symmetrical flanking side domes,
 * a pedimented entrance portico with classical vertical columns, and symmetrical left/right wings.
 * Strictly bounded within viewBox 0 0 460 220 with zero stray lines outside the building silhouette.
 */
export const UniversityBuildingWireframe: React.FC<UniversityBuildingWireframeProps> = ({
  className,
  wrapperClassName = 'hidden lg:flex items-end justify-end absolute right-3 bottom-0 w-[42%] max-w-[460px] h-[88%] pointer-events-none select-none z-0',
}) => {
  const outerWrapperClass = className && className.includes('absolute')
    ? className
    : wrapperClassName;

  const svgClass = className && !className.includes('absolute')
    ? className
    : 'w-full h-full text-[#4a7c59]/25 dark:text-emerald-400/25';

  return (
    <div className={outerWrapperClass}>
      <svg
        viewBox="0 0 460 220"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={svgClass}
        preserveAspectRatio="xMaxYMax meet"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* 1. Base Monumental Plinth & Steps */}
        <line x1="15" y1="216" x2="445" y2="216" strokeWidth="1.3" />
        <line x1="20" y1="212" x2="440" y2="212" strokeWidth="1.15" />
        <line x1="25" y1="208" x2="435" y2="208" strokeWidth="1.15" />

        {/* Center Entrance Steps */}
        <line x1="175" y1="208" x2="285" y2="208" strokeWidth="1.15" />
        <line x1="178" y1="211" x2="282" y2="211" strokeWidth="1.0" />
        <line x1="181" y1="214" x2="279" y2="214" strokeWidth="1.0" />

        {/* 2. Left Wing (X: 25 to 135) */}
        {/* Outer Left Wall */}
        <line x1="25" y1="102" x2="25" y2="208" strokeWidth="1.2" />
        {/* Horizontal Cornices */}
        <line x1="25" y1="102" x2="135" y2="102" strokeWidth="1.1" />
        <line x1="25" y1="108" x2="135" y2="108" strokeWidth="1.25" />
        <line x1="25" y1="144" x2="135" y2="144" strokeWidth="0.95" />
        <line x1="25" y1="178" x2="135" y2="178" strokeWidth="0.95" />

        {/* Floor 3 Paired Windows */}
        {[36, 68, 100].map((wx) => (
          <g key={`left-f3-${wx}`}>
            <rect x={wx} y="116" width="10" height="18" rx="1" strokeWidth="0.85" />
            <line x1={wx} y1="125" x2={wx + 10} y2="125" strokeWidth="0.6" />
            <rect x={wx + 14} y="116" width="10" height="18" rx="1" strokeWidth="0.85" />
            <line x1={wx + 14} y1="125" x2={wx + 24} y2="125" strokeWidth="0.6" />
          </g>
        ))}

        {/* Floor 2 Paired Windows */}
        {[36, 68, 100].map((wx) => (
          <g key={`left-f2-${wx}`}>
            <rect x={wx} y="150" width="10" height="18" rx="1" strokeWidth="0.85" />
            <line x1={wx} y1="159" x2={wx + 10} y2="159" strokeWidth="0.6" />
            <rect x={wx + 14} y="150" width="10" height="18" rx="1" strokeWidth="0.85" />
            <line x1={wx + 14} y1="159" x2={wx + 24} y2="159" strokeWidth="0.6" />
          </g>
        ))}

        {/* Ground Floor Arcade Bays */}
        {[33, 45, 57, 69, 81, 93, 105, 117, 127].map((ax) => (
          <rect key={`left-arcade-${ax}`} x={ax} y="184" width="7" height="24" rx="1" strokeWidth="0.85" />
        ))}

        {/* 3. Left Tower & Flanking Side Dome (Center = 155, X: 135 to 175) */}
        <line x1="133" y1="94" x2="177" y2="94" strokeWidth="1.2" />
        <rect x="138" y="70" width="34" height="24" strokeWidth="1.1" />
        <line x1="135" y1="70" x2="175" y2="70" strokeWidth="1.2" />

        {/* Left Side Drum Windows */}
        <rect x="142" y="75" width="5" height="13" rx="2.5" strokeWidth="0.8" />
        <rect x="152.5" y="75" width="5" height="13" rx="2.5" strokeWidth="0.8" />
        <rect x="163" y="75" width="5" height="13" rx="2.5" strokeWidth="0.8" />

        {/* Left Cupola Dome */}
        <path d="M 137 70 C 137 48, 173 48, 173 70 Z" strokeWidth="1.2" />
        <line x1="155" y1="48" x2="155" y2="70" strokeWidth="0.8" />
        <path d="M 155 48 C 147 52, 142 59, 140 70" strokeWidth="0.75" />
        <path d="M 155 48 C 163 52, 168 59, 170 70" strokeWidth="0.75" />
        {/* Left Spire & Finial */}
        <line x1="155" y1="48" x2="155" y2="36" strokeWidth="1.1" />
        <circle cx="155" cy="36" r="1.4" />

        {/* Left Tower Body Windows */}
        <rect x="148" y="103" width="14" height="18" rx="1" strokeWidth="0.85" />
        <line x1="148" y1="112" x2="162" y2="112" strokeWidth="0.6" />
        <rect x="148" y="150" width="14" height="18" rx="1" strokeWidth="0.85" />
        <line x1="148" y1="159" x2="162" y2="159" strokeWidth="0.6" />

        {/* 4. Central Grand Rotunda & Main Dome (Center = 230) */}
        {/* Rotunda Drum Base & Cornice */}
        <line x1="190" y1="96" x2="270" y2="96" strokeWidth="1.2" />
        <rect x="195" y="68" width="70" height="28" strokeWidth="1.1" />
        <line x1="192" y1="68" x2="268" y2="68" strokeWidth="1.3" />

        {/* Drum Arched Windows */}
        {[201, 210, 219, 227.5, 236, 245, 254].map((wx) => (
          <rect key={`drum-win-${wx}`} x={wx} y="74" width="5" height="15" rx="2.5" strokeWidth="0.8" />
        ))}

        {/* Grand Central Hemispherical Dome */}
        <path d="M 195 68 C 195 28, 265 28, 265 68 Z" strokeWidth="1.35" />
        {/* Dome Ribs */}
        <line x1="230" y1="28" x2="230" y2="68" strokeWidth="1.0" />
        <path d="M 230 28 C 216 35, 206 48, 204 68" strokeWidth="0.85" />
        <path d="M 230 28 C 205 38, 198 50, 196 68" strokeWidth="0.85" />
        <path d="M 230 28 C 244 35, 254 48, 256 68" strokeWidth="0.85" />
        <path d="M 230 28 C 255 38, 262 50, 264 68" strokeWidth="0.85" />

        {/* Dome Lantern & Spire Finial */}
        <line x1="224" y1="28" x2="236" y2="28" strokeWidth="1.1" />
        <rect x="226" y="22" width="8" height="6" strokeWidth="0.9" />
        <path d="M 225 22 L 230 17 L 235 22 Z" strokeWidth="0.95" />
        <line x1="230" y1="17" x2="230" y2="9" strokeWidth="1.1" />
        <circle cx="230" cy="9" r="1.5" />

        {/* 5. Central Portico & Triangular Pediment (Center = 230, X: 175 to 285) */}
        {/* Triangular Pediment */}
        <path d="M 175 130 L 230 96 L 285 130 Z" strokeWidth="1.35" />
        <path d="M 183 128 L 230 101 L 277 128" strokeWidth="0.9" />
        {/* Tympanum Roundel / Crest */}
        <circle cx="230" cy="116" r="6" strokeWidth="0.9" />
        <circle cx="230" cy="116" r="3" strokeWidth="0.7" />

        {/* Entablature Beams Under Pediment */}
        <line x1="173" y1="130" x2="287" y2="130" strokeWidth="1.3" />
        <line x1="175" y1="135" x2="285" y2="135" strokeWidth="0.9" />

        {/* Classical Portico Vertical Columns (6 Solid Columns) */}
        {[184, 202, 221, 239, 258, 276].map((colX) => (
          <g key={`portico-col-${colX}`}>
            {/* Capital */}
            <line x1={colX - 4} y1="135" x2={colX + 4} y2="135" strokeWidth="1.1" />
            {/* Shaft */}
            <line x1={colX - 2} y1="136" x2={colX - 2} y2="204" strokeWidth="0.85" />
            <line x1={colX + 2} y1="136" x2={colX + 2} y2="204" strokeWidth="0.85" />
            {/* Base Plinth */}
            <rect x={colX - 3.5} y="204" width="7" height="4" strokeWidth="0.9" />
          </g>
        ))}

        {/* Grand Center Entrance Portal */}
        <rect x="222" y="174" width="16" height="30" rx="1.5" strokeWidth="1.0" />
        <line x1="230" y1="174" x2="230" y2="204" strokeWidth="0.75" />

        {/* 6. Right Tower & Flanking Side Dome (Center = 305, X: 285 to 325) */}
        <line x1="283" y1="94" x2="327" y2="94" strokeWidth="1.2" />
        <rect x="288" y="70" width="34" height="24" strokeWidth="1.1" />
        <line x1="285" y1="70" x2="325" y2="70" strokeWidth="1.2" />

        {/* Right Side Drum Windows */}
        <rect x="292" y="75" width="5" height="13" rx="2.5" strokeWidth="0.8" />
        <rect x="302.5" y="75" width="5" height="13" rx="2.5" strokeWidth="0.8" />
        <rect x="313" y="75" width="5" height="13" rx="2.5" strokeWidth="0.8" />

        {/* Right Cupola Dome */}
        <path d="M 287 70 C 287 48, 323 48, 323 70 Z" strokeWidth="1.2" />
        <line x1="305" y1="48" x2="305" y2="70" strokeWidth="0.8" />
        <path d="M 305 48 C 297 52, 292 59, 290 70" strokeWidth="0.75" />
        <path d="M 305 48 C 313 52, 318 59, 320 70" strokeWidth="0.75" />
        {/* Right Spire & Finial */}
        <line x1="305" y1="48" x2="305" y2="36" strokeWidth="1.1" />
        <circle cx="305" cy="36" r="1.4" />

        {/* Right Tower Body Windows */}
        <rect x="298" y="103" width="14" height="18" rx="1" strokeWidth="0.85" />
        <line x1="298" y1="112" x2="312" y2="112" strokeWidth="0.6" />
        <rect x="298" y="150" width="14" height="18" rx="1" strokeWidth="0.85" />
        <line x1="298" y1="159" x2="312" y2="159" strokeWidth="0.6" />

        {/* 7. Right Wing (X: 325 to 435) */}
        {/* Horizontal Cornices */}
        <line x1="325" y1="102" x2="435" y2="102" strokeWidth="1.1" />
        <line x1="325" y1="108" x2="435" y2="108" strokeWidth="1.25" />
        <line x1="325" y1="144" x2="435" y2="144" strokeWidth="0.95" />
        <line x1="325" y1="178" x2="435" y2="178" strokeWidth="0.95" />
        {/* Outer Right Wall */}
        <line x1="435" y1="102" x2="435" y2="208" strokeWidth="1.2" />

        {/* Floor 3 Paired Windows */}
        {[336, 368, 400].map((wx) => (
          <g key={`right-f3-${wx}`}>
            <rect x={wx} y="116" width="10" height="18" rx="1" strokeWidth="0.85" />
            <line x1={wx} y1="125" x2={wx + 10} y2="125" strokeWidth="0.6" />
            <rect x={wx + 14} y="116" width="10" height="18" rx="1" strokeWidth="0.85" />
            <line x1={wx + 14} y1="125" x2={wx + 24} y2="125" strokeWidth="0.6" />
          </g>
        ))}

        {/* Floor 2 Paired Windows */}
        {[336, 368, 400].map((wx) => (
          <g key={`right-f2-${wx}`}>
            <rect x={wx} y="150" width="10" height="18" rx="1" strokeWidth="0.85" />
            <line x1={wx} y1="159" x2={wx + 10} y2="159" strokeWidth="0.6" />
            <rect x={wx + 14} y="150" width="10" height="18" rx="1" strokeWidth="0.85" />
            <line x1={wx + 14} y1="159" x2={wx + 24} y2="159" strokeWidth="0.6" />
          </g>
        ))}

        {/* Ground Floor Arcade Bays */}
        {[332, 344, 356, 368, 380, 392, 404, 416, 426].map((ax) => (
          <rect key={`right-arcade-${ax}`} x={ax} y="184" width="7" height="24" rx="1" strokeWidth="0.85" />
        ))}
      </svg>
    </div>
  );
};

export default UniversityBuildingWireframe;
