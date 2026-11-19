import React from 'react';

export interface UniversityBuildingWireframeProps {
  className?: string;
}

/**
 * Architectural line-art SVG illustration of K.R. Mangalam University's monumental building facade.
 * Features a grand central dome with spire, two flanking side cupolas, triangular pedimented portico,
 * symmetrical multi-storey wings with paired windows, and a ground-floor classical colonnade arcade.
 */
export const UniversityBuildingWireframe: React.FC<UniversityBuildingWireframeProps> = ({
  className = 'absolute right-0 bottom-0 h-[92%] sm:h-[96%] w-auto pointer-events-none select-none z-0 text-[#15803D]/45 dark:text-emerald-400/35 [mask-image:linear-gradient(to_left,black_65%,transparent_100%)] hidden md:block',
}) => {
  return (
    <svg
      viewBox="0 0 700 240"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 1. Base Ground Lines & Monumental Steps */}
      <line x1="20" y1="225" x2="680" y2="225" strokeWidth="1.4" />
      <line x1="40" y1="220" x2="660" y2="220" strokeWidth="1.2" />
      <line x1="260" y1="216" x2="440" y2="216" strokeWidth="1.1" />
      <line x1="270" y1="212" x2="430" y2="212" strokeWidth="1.1" />
      <line x1="280" y1="208" x2="420" y2="208" strokeWidth="1.1" />

      {/* 2. Central Grand Rotunda & Main Dome */}
      {/* Rotunda Drum Base & Windows */}
      <line x1="295" y1="94" x2="405" y2="94" strokeWidth="1.2" />
      <rect x="304" y="66" width="92" height="28" strokeWidth="1.1" />
      <line x1="300" y1="66" x2="400" y2="66" strokeWidth="1.3" />
      {/* Drum vertical arched windows */}
      {[312, 324, 336, 348, 360, 372, 384].map((wx) => (
        <rect key={`drum-win-${wx}`} x={wx} y="72" width="6" height="16" rx="3" strokeWidth="0.85" />
      ))}

      {/* Grand Central Hemispherical Dome */}
      <path d="M 305 66 C 305 28, 395 28, 395 66 Z" strokeWidth="1.35" />
      {/* Dome meridian ribs */}
      <line x1="350" y1="28" x2="350" y2="66" strokeWidth="1.0" />
      <path d="M 350 28 C 332 35, 320 48, 318 66" strokeWidth="0.85" />
      <path d="M 350 28 C 316 38, 308 50, 306 66" strokeWidth="0.85" />
      <path d="M 350 28 C 368 35, 380 48, 382 66" strokeWidth="0.85" />
      <path d="M 350 28 C 384 38, 392 50, 394 66" strokeWidth="0.85" />

      {/* Dome Lantern & Spire Finial */}
      <line x1="344" y1="28" x2="356" y2="28" strokeWidth="1.1" />
      <rect x="346" y="22" width="8" height="6" strokeWidth="0.9" />
      <path d="M 345 22 L 350 17 L 355 22 Z" strokeWidth="0.95" />
      <line x1="350" y1="17" x2="350" y2="10" strokeWidth="1.1" />
      <circle cx="350" cy="10" r="1.4" />

      {/* 3. Two Flanking Towers & Side Cupola Domes */}
      {/* Left Tower & Dome (Center = 245) */}
      <rect x="222" y="94" width="46" height="34" strokeWidth="1.1" />
      <line x1="218" y1="94" x2="272" y2="94" strokeWidth="1.2" />
      <rect x="228" y="68" width="34" height="26" strokeWidth="1.05" />
      <line x1="225" y1="68" x2="265" y2="68" strokeWidth="1.2" />
      {/* Side drum windows */}
      <rect x="233" y="74" width="5" height="14" rx="2.5" strokeWidth="0.8" />
      <rect x="242.5" y="74" width="5" height="14" rx="2.5" strokeWidth="0.8" />
      <rect x="252" y="74" width="5" height="14" rx="2.5" strokeWidth="0.8" />
      {/* Cupola curve */}
      <path d="M 226 68 C 226 46, 264 46, 264 68 Z" strokeWidth="1.2" />
      <line x1="245" y1="46" x2="245" y2="68" strokeWidth="0.8" />
      <path d="M 245 46 C 236 50, 230 58, 229 68" strokeWidth="0.75" />
      <path d="M 245 46 C 254 50, 260 58, 261 68" strokeWidth="0.75" />
      {/* Tower Spire */}
      <line x1="245" y1="46" x2="245" y2="34" strokeWidth="1.05" />
      <circle cx="245" cy="34" r="1.3" />
      {/* Tower body window */}
      <rect x="238" y="102" width="14" height="18" rx="1" strokeWidth="0.85" />
      <line x1="238" y1="111" x2="252" y2="111" strokeWidth="0.6" />

      {/* Right Tower & Dome (Center = 455) */}
      <rect x="432" y="94" width="46" height="34" strokeWidth="1.1" />
      <line x1="428" y1="94" x2="482" y2="94" strokeWidth="1.2" />
      <rect x="438" y="68" width="34" height="26" strokeWidth="1.05" />
      <line x1="435" y1="68" x2="475" y2="68" strokeWidth="1.2" />
      {/* Side drum windows */}
      <rect x="443" y="74" width="5" height="14" rx="2.5" strokeWidth="0.8" />
      <rect x="452.5" y="74" width="5" height="14" rx="2.5" strokeWidth="0.8" />
      <rect x="462" y="74" width="5" height="14" rx="2.5" strokeWidth="0.8" />
      {/* Cupola curve */}
      <path d="M 436 68 C 436 46, 474 46, 474 68 Z" strokeWidth="1.2" />
      <line x1="455" y1="46" x2="455" y2="68" strokeWidth="0.8" />
      <path d="M 455 46 C 446 50, 440 58, 439 68" strokeWidth="0.75" />
      <path d="M 455 46 C 464 50, 470 58, 471 68" strokeWidth="0.75" />
      {/* Tower Spire */}
      <line x1="455" y1="46" x2="455" y2="34" strokeWidth="1.05" />
      <circle cx="455" cy="34" r="1.3" />
      {/* Tower body window */}
      <rect x="448" y="102" width="14" height="18" rx="1" strokeWidth="0.85" />
      <line x1="448" y1="111" x2="462" y2="111" strokeWidth="0.6" />

      {/* 4. Central Portico & Triangular Pediment */}
      {/* Triangular Pediment */}
      <path d="M 285 130 L 350 96 L 415 130 Z" strokeWidth="1.35" />
      <path d="M 293 128 L 350 101 L 407 128" strokeWidth="0.9" />
      {/* Tympanum Roundel / Crest */}
      <circle cx="350" cy="116" r="6" strokeWidth="0.9" />
      <circle cx="350" cy="116" r="3" strokeWidth="0.7" />

      {/* Glass / Window Grid Behind Portico Columns */}
      <line x1="292" y1="146" x2="408" y2="146" strokeWidth="0.6" strokeDasharray="2 2" />
      <line x1="292" y1="162" x2="408" y2="162" strokeWidth="0.6" strokeDasharray="2 2" />
      <line x1="292" y1="178" x2="408" y2="178" strokeWidth="0.6" strokeDasharray="2 2" />
      {[308, 328, 350, 372, 392].map((gx) => (
        <line key={`portico-grid-${gx}`} x1={gx} y1="130" x2={gx} y2="195" strokeWidth="0.6" strokeDasharray="2 2" />
      ))}

      {/* Entablature beam */}
      <line x1="285" y1="130" x2="415" y2="130" strokeWidth="1.3" />
      <line x1="288" y1="135" x2="412" y2="135" strokeWidth="0.85" />

      {/* Classical Portico Vertical Columns (6 Fluted Columns) */}
      {[296, 317, 338, 362, 383, 404].map((colX) => (
        <g key={`portico-col-${colX}`}>
          {/* Capital */}
          <line x1={colX - 5} y1="135" x2={colX + 5} y2="135" strokeWidth="1.1" />
          {/* Shaft */}
          <line x1={colX - 2.2} y1="136" x2={colX - 2.2} y2="204" strokeWidth="0.85" />
          <line x1={colX + 2.2} y1="136" x2={colX + 2.2} y2="204" strokeWidth="0.85" />
          {/* Base */}
          <rect x={colX - 4} y="204" width="8" height="4" strokeWidth="0.9" />
        </g>
      ))}

      {/* Grand Center Entrance Portal */}
      <rect x="340" y="174" width="20" height="30" rx="1.5" strokeWidth="1.0" />
      <line x1="350" y1="174" x2="350" y2="204" strokeWidth="0.75" />

      {/* 5. Left Wing (Multi-Storey Windows & Ground Arcade) */}
      {/* Horizontal Cornices */}
      <line x1="75" y1="108" x2="222" y2="108" strokeWidth="1.25" />
      <line x1="75" y1="102" x2="222" y2="102" strokeWidth="0.8" />
      <line x1="75" y1="144" x2="222" y2="144" strokeWidth="0.9" />
      <line x1="75" y1="178" x2="222" y2="178" strokeWidth="0.9" />
      <line x1="75" y1="102" x2="75" y2="220" strokeWidth="1.2" />

      {/* Floor 3 Paired Windows */}
      {[92, 132, 172].map((wx) => (
        <g key={`left-f3-${wx}`}>
          <rect x={wx} y="115" width="11" height="19" rx="1" strokeWidth="0.85" />
          <line x1={wx} y1="124" x2={wx + 11} y2="124" strokeWidth="0.6" />
          <rect x={wx + 15} y="115" width="11" height="19" rx="1" strokeWidth="0.85" />
          <line x1={wx + 15} y1="124" x2={wx + 26} y2="124" strokeWidth="0.6" />
        </g>
      ))}

      {/* Floor 2 Paired Windows */}
      {[92, 132, 172].map((wx) => (
        <g key={`left-f2-${wx}`}>
          <rect x={wx} y="150" width="11" height="19" rx="1" strokeWidth="0.85" />
          <line x1={wx} y1="159" x2={wx + 11} y2="159" strokeWidth="0.6" />
          <rect x={wx + 15} y="150" width="11" height="19" rx="1" strokeWidth="0.85" />
          <line x1={wx + 15} y1="159" x2={wx + 26} y2="159" strokeWidth="0.6" />
        </g>
      ))}

      {/* Ground Floor Colonnade / Open Walkway Arcade */}
      {[86, 100, 114, 128, 142, 156, 170, 184, 198, 212].map((ax) => (
        <rect key={`left-arcade-${ax}`} x={ax} y="184" width="8" height="34" rx="1" strokeWidth="0.85" />
      ))}

      {/* 6. Right Wing (Multi-Storey Windows & Ground Arcade) */}
      {/* Horizontal Cornices */}
      <line x1="478" y1="108" x2="625" y2="108" strokeWidth="1.25" />
      <line x1="478" y1="102" x2="625" y2="102" strokeWidth="0.8" />
      <line x1="478" y1="144" x2="625" y2="144" strokeWidth="0.9" />
      <line x1="478" y1="178" x2="625" y2="178" strokeWidth="0.9" />
      <line x1="625" y1="102" x2="625" y2="220" strokeWidth="1.2" />

      {/* Floor 3 Paired Windows */}
      {[502, 542, 582].map((wx) => (
        <g key={`right-f3-${wx}`}>
          <rect x={wx} y="115" width="11" height="19" rx="1" strokeWidth="0.85" />
          <line x1={wx} y1="124" x2={wx + 11} y2="124" strokeWidth="0.6" />
          <rect x={wx + 15} y="115" width="11" height="19" rx="1" strokeWidth="0.85" />
          <line x1={wx + 15} y1="124" x2={wx + 26} y2="124" strokeWidth="0.6" />
        </g>
      ))}

      {/* Floor 2 Paired Windows */}
      {[502, 542, 582].map((wx) => (
        <g key={`right-f2-${wx}`}>
          <rect x={wx} y="150" width="11" height="19" rx="1" strokeWidth="0.85" />
          <line x1={wx} y1="159" x2={wx + 11} y2="159" strokeWidth="0.6" />
          <rect x={wx + 15} y="150" width="11" height="19" rx="1" strokeWidth="0.85" />
          <line x1={wx + 15} y1="159" x2={wx + 26} y2="159" strokeWidth="0.6" />
        </g>
      ))}

      {/* Ground Floor Colonnade / Open Walkway Arcade */}
      {[482, 496, 510, 524, 538, 552, 566, 580, 594, 608].map((ax) => (
        <rect key={`right-arcade-${ax}`} x={ax} y="184" width="8" height="34" rx="1" strokeWidth="0.85" />
      ))}
    </svg>
  );
};

export default UniversityBuildingWireframe;
