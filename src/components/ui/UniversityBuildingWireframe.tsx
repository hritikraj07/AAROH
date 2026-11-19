import React from 'react';

export interface UniversityBuildingWireframeProps {
  className?: string;
  wrapperClassName?: string;
}

/**
 * Architectural line-art SVG illustration of the monumental K.R. Mangalam University campus facade.
 * Modeled directly on the authentic campus photo with high-craft CAD line precision:
 * - 5-Dome Neoclassical Roofline (Grand central dome with pointed spire & portholes + 2 flanking intermediate domes + 2 corner cupolas)
 * - Central Glass Curtain-Wall Atrium behind a Classical Triangular Pedimented Portico with slender columns
 * - Symmetrical 4-Storey Wings with clean horizontal cornices, multi-pane window grids, and ground-floor colonnade pillars
 * - Foreground Entrance Gate Structure featuring the wide horizontal lintel beam, side fluted piers, crest medallion, and wrought-iron gate lines
 * - Bounded within viewBox 0 0 520 230 with zero stray lines outside the building silhouette.
 */
export const UniversityBuildingWireframe: React.FC<UniversityBuildingWireframeProps> = ({
  className,
  wrapperClassName = 'hidden lg:flex items-end justify-end absolute right-3 bottom-0 w-[44%] max-w-[480px] h-[90%] pointer-events-none select-none z-0',
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
        viewBox="0 0 520 230"
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
        {/* 1. Base Monumental Plinth & Ground Curbs */}
        <line x1="18" y1="222" x2="502" y2="222" strokeWidth="1.3" />
        <line x1="24" y1="217" x2="496" y2="217" strokeWidth="1.15" />
        <line x1="30" y1="212" x2="490" y2="212" strokeWidth="1.0" />

        {/* 2. Five-Dome Roofline Silhouette */}
        {/* Dome 1: Far-Left Corner Dome (Center X = 43) */}
        <g id="dome-far-left">
          <line x1="26" y1="78" x2="60" y2="78" strokeWidth="1.1" />
          <rect x="28" y="56" width="30" height="22" strokeWidth="1.0" />
          <line x1="27" y1="56" x2="59" y2="56" strokeWidth="1.15" />
          {/* Drum Portholes */}
          <rect x="33" y="62" width="4" height="9" rx="2" strokeWidth="0.8" />
          <rect x="41" y="62" width="4" height="9" rx="2" strokeWidth="0.8" />
          <rect x="49" y="62" width="4" height="9" rx="2" strokeWidth="0.8" />
          {/* Cupola Shell */}
          <path d="M 28 56 C 28 38, 58 38, 58 56 Z" strokeWidth="1.2" />
          <line x1="43" y1="38" x2="43" y2="56" strokeWidth="0.8" />
          <path d="M 43 38 C 36 42, 31 48, 29 56" strokeWidth="0.75" />
          <path d="M 43 38 C 50 42, 55 48, 57 56" strokeWidth="0.75" />
          {/* Spire & Finial */}
          <line x1="43" y1="38" x2="43" y2="28" strokeWidth="1.1" />
          <circle cx="43" cy="28" r="1.5" />
        </g>

        {/* Dome 2: Intermediate Left Dome (Center X = 210) */}
        <g id="dome-intermediate-left">
          <line x1="192" y1="74" x2="228" y2="74" strokeWidth="1.15" />
          <rect x="194" y="50" width="32" height="24" strokeWidth="1.05" />
          <line x1="193" y1="50" x2="227" y2="50" strokeWidth="1.2" />
          {/* Drum Windows */}
          <rect x="198" y="56" width="4" height="11" rx="2" strokeWidth="0.8" />
          <rect x="208" y="56" width="4" height="11" rx="2" strokeWidth="0.8" />
          <rect x="218" y="56" width="4" height="11" rx="2" strokeWidth="0.8" />
          {/* Cupola Shell */}
          <path d="M 194 50 C 194 30, 226 30, 226 50 Z" strokeWidth="1.25" />
          <line x1="210" y1="30" x2="210" y2="50" strokeWidth="0.85" />
          <path d="M 210 30 C 202 34, 197 42, 195 50" strokeWidth="0.75" />
          <path d="M 210 30 C 218 34, 223 42, 225 50" strokeWidth="0.75" />
          {/* Spire & Finial */}
          <line x1="210" y1="30" x2="210" y2="18" strokeWidth="1.1" />
          <circle cx="210" cy="18" r="1.5" />
        </g>

        {/* Dome 3: Grand Central Dome (Center X = 260) - Largest and Prominent */}
        <g id="dome-grand-central">
          <line x1="224" y1="72" x2="296" y2="72" strokeWidth="1.2" />
          <rect x="226" y="46" width="68" height="26" strokeWidth="1.15" />
          <line x1="224" y1="46" x2="296" y2="46" strokeWidth="1.25" />
          {/* Drum Framing Piers */}
          <line x1="237" y1="46" x2="237" y2="72" strokeWidth="0.85" />
          <line x1="248" y1="46" x2="248" y2="72" strokeWidth="0.85" />
          <line x1="260" y1="46" x2="260" y2="72" strokeWidth="0.85" />
          <line x1="272" y1="46" x2="272" y2="72" strokeWidth="0.85" />
          <line x1="283" y1="46" x2="283" y2="72" strokeWidth="0.85" />
          {/* Drum Circular Porthole Windows */}
          <circle cx="242.5" cy="59" r="3.2" strokeWidth="0.85" />
          <circle cx="254" cy="59" r="3.2" strokeWidth="0.85" />
          <circle cx="266" cy="59" r="3.2" strokeWidth="0.85" />
          <circle cx="277.5" cy="59" r="3.2" strokeWidth="0.85" />
          {/* Grand Hemispherical Dome Shell */}
          <path d="M 226 46 C 226 14, 294 14, 294 46 Z" strokeWidth="1.35" />
          {/* Architectural Dome Ribs */}
          <line x1="260" y1="14" x2="260" y2="46" strokeWidth="1.0" />
          <path d="M 260 14 C 248 20, 238 31, 235 46" strokeWidth="0.85" />
          <path d="M 260 14 C 238 23, 230 34, 228 46" strokeWidth="0.85" />
          <path d="M 260 14 C 272 20, 282 31, 285 46" strokeWidth="0.85" />
          <path d="M 260 14 C 282 23, 290 34, 292 46" strokeWidth="0.85" />
          {/* Dome Lantern & Spire Finial */}
          <line x1="254" y1="14" x2="266" y2="14" strokeWidth="1.1" />
          <rect x="256.5" y="9" width="7" height="5" strokeWidth="0.9" />
          <path d="M 255.5 9 L 260 4 L 264.5 9 Z" strokeWidth="0.95" />
          <line x1="260" y1="4" x2="260" y2="0" strokeWidth="1.1" />
          <circle cx="260" cy="1" r="1.3" />
        </g>

        {/* Dome 4: Intermediate Right Dome (Center X = 310) */}
        <g id="dome-intermediate-right">
          <line x1="292" y1="74" x2="328" y2="74" strokeWidth="1.15" />
          <rect x="294" y="50" width="32" height="24" strokeWidth="1.05" />
          <line x1="293" y1="50" x2="327" y2="50" strokeWidth="1.2" />
          {/* Drum Windows */}
          <rect x="298" y="56" width="4" height="11" rx="2" strokeWidth="0.8" />
          <rect x="308" y="56" width="4" height="11" rx="2" strokeWidth="0.8" />
          <rect x="318" y="56" width="4" height="11" rx="2" strokeWidth="0.8" />
          {/* Cupola Shell */}
          <path d="M 294 50 C 294 30, 326 30, 326 50 Z" strokeWidth="1.25" />
          <line x1="310" y1="30" x2="310" y2="50" strokeWidth="0.85" />
          <path d="M 310 30 C 302 34, 297 42, 295 50" strokeWidth="0.75" />
          <path d="M 310 30 C 318 34, 323 42, 325 50" strokeWidth="0.75" />
          {/* Spire & Finial */}
          <line x1="310" y1="30" x2="310" y2="18" strokeWidth="1.1" />
          <circle cx="310" cy="18" r="1.5" />
        </g>

        {/* Dome 5: Far-Right Corner Dome (Center X = 477) */}
        <g id="dome-far-right">
          <line x1="460" y1="78" x2="494" y2="78" strokeWidth="1.1" />
          <rect x="462" y="56" width="30" height="22" strokeWidth="1.0" />
          <line x1="461" y1="56" x2="493" y2="56" strokeWidth="1.15" />
          {/* Drum Portholes */}
          <rect x="467" y="62" width="4" height="9" rx="2" strokeWidth="0.8" />
          <rect x="475" y="62" width="4" height="9" rx="2" strokeWidth="0.8" />
          <rect x="483" y="62" width="4" height="9" rx="2" strokeWidth="0.8" />
          {/* Cupola Shell */}
          <path d="M 462 56 C 462 38, 492 38, 492 56 Z" strokeWidth="1.2" />
          <line x1="477" y1="38" x2="477" y2="56" strokeWidth="0.8" />
          <path d="M 477 38 C 470 42, 465 48, 463 56" strokeWidth="0.75" />
          <path d="M 477 38 C 484 42, 489 48, 491 56" strokeWidth="0.75" />
          {/* Spire & Finial */}
          <line x1="477" y1="38" x2="477" y2="28" strokeWidth="1.1" />
          <circle cx="477" cy="28" r="1.5" />
        </g>

        {/* 3. Main Facade Structure, Cornices & Wings */}
        {/* Far-Left Corner Tower (X: 18 to 68) */}
        <g id="facade-tower-left">
          <line x1="18" y1="78" x2="18" y2="212" strokeWidth="1.2" />
          <line x1="68" y1="78" x2="68" y2="212" strokeWidth="1.0" />
          <line x1="18" y1="78" x2="68" y2="78" strokeWidth="1.2" />
          <line x1="18" y1="84" x2="68" y2="84" strokeWidth="1.1" />
          <line x1="18" y1="112" x2="68" y2="112" strokeWidth="0.9" />
          <line x1="18" y1="168" x2="68" y2="168" strokeWidth="0.9" />
          {/* Floor 4 Window */}
          <rect x="32" y="92" width="22" height="14" rx="1" strokeWidth="0.85" />
          <line x1="43" y1="92" x2="43" y2="106" strokeWidth="0.6" />
          {/* Floors 2-3 Vertical Glass Curtain Bay */}
          <rect x="30" y="118" width="26" height="46" rx="1" strokeWidth="0.95" />
          <line x1="30" y1="133" x2="56" y2="133" strokeWidth="0.6" />
          <line x1="30" y1="148" x2="56" y2="148" strokeWidth="0.6" />
          <line x1="43" y1="118" x2="43" y2="164" strokeWidth="0.6" />
          {/* Ground Floor Base Portal */}
          <rect x="34" y="180" width="18" height="32" rx="1" strokeWidth="0.85" />
        </g>

        {/* Left Wing Facade (X: 68 to 195) */}
        <g id="facade-wing-left">
          {/* Horizontal Cornices */}
          <line x1="68" y1="82" x2="195" y2="82" strokeWidth="1.1" />
          <line x1="68" y1="86" x2="195" y2="86" strokeWidth="1.25" />
          <line x1="68" y1="112" x2="195" y2="112" strokeWidth="0.95" />
          <line x1="68" y1="140" x2="195" y2="140" strokeWidth="0.95" />
          <line x1="68" y1="168" x2="195" y2="168" strokeWidth="1.1" />
          <line x1="68" y1="212" x2="195" y2="212" strokeWidth="1.2" />

          {/* Upper Windows - 4 Bays (X centers: 86, 116, 146, 176) */}
          {[86, 116, 146, 176].map((cx) => (
            <g key={`win-left-${cx}`}>
              {/* Floor 4 */}
              <rect x={cx - 7} y="92" width="14" height="14" rx="1" strokeWidth="0.85" />
              <line x1={cx} y1="92" x2={cx} y2="106" strokeWidth="0.5" />
              <line x1={cx - 7} y1="99" x2={cx + 7} y2="99" strokeWidth="0.5" />
              {/* Floor 3 */}
              <rect x={cx - 7} y="118" width="14" height="16" rx="1" strokeWidth="0.85" />
              <line x1={cx} y1="118" x2={cx} y2="134" strokeWidth="0.5" />
              <line x1={cx - 7} y1="126" x2={cx + 7} y2="126" strokeWidth="0.5" />
              {/* Floor 2 */}
              <rect x={cx - 7} y="146" width="14" height="16" rx="1" strokeWidth="0.85" />
              <line x1={cx} y1="146" x2={cx} y2="162" strokeWidth="0.5" />
              <line x1={cx - 7} y1="154" x2={cx + 7} y2="154" strokeWidth="0.5" />
            </g>
          ))}

          {/* Ground Floor Colonnade Pillars along Left Wing */}
          {[74, 88, 102, 116, 130, 144, 158, 172, 186].map((colX) => (
            <g key={`colonnade-left-${colX}`}>
              <line x1={colX - 2.5} y1="168" x2={colX + 2.5} y2="168" strokeWidth="0.9" />
              <line x1={colX} y1="169" x2={colX} y2="211" strokeWidth="0.85" />
              <rect x={colX - 2} y="210" width="4" height="2" strokeWidth="0.8" />
            </g>
          ))}
        </g>

        {/* Intermediate Left Bay (X: 195 to 225) */}
        <g id="facade-bay-left">
          <line x1="195" y1="74" x2="225" y2="74" strokeWidth="1.1" />
          <line x1="195" y1="74" x2="195" y2="212" strokeWidth="0.95" />
          {/* Tall Vertical Glass Curtain Bay */}
          <rect x="200" y="88" width="20" height="82" rx="1" strokeWidth="0.95" />
          <line x1="210" y1="88" x2="210" y2="170" strokeWidth="0.6" />
          <line x1="200" y1="108" x2="220" y2="108" strokeWidth="0.6" />
          <line x1="200" y1="128" x2="220" y2="128" strokeWidth="0.6" />
          <line x1="200" y1="148" x2="220" y2="148" strokeWidth="0.6" />
        </g>

        {/* 4. Central Grand Facade, Glass Atrium & Triangular Pedimented Portico */}
        <g id="facade-central-portico">
          {/* Glass Curtain-Wall Atrium behind the Portico */}
          <rect x="226" y="72" width="68" height="104" strokeWidth="1.1" />
          {/* Atrium Mullion Grid */}
          <line x1="237" y1="72" x2="237" y2="176" strokeWidth="0.65" />
          <line x1="248" y1="72" x2="248" y2="176" strokeWidth="0.65" />
          <line x1="260" y1="72" x2="260" y2="176" strokeWidth="0.65" />
          <line x1="272" y1="72" x2="272" y2="176" strokeWidth="0.65" />
          <line x1="283" y1="72" x2="283" y2="176" strokeWidth="0.65" />
          <line x1="226" y1="86" x2="294" y2="86" strokeWidth="0.6" />
          <line x1="226" y1="102" x2="294" y2="102" strokeWidth="0.6" />
          <line x1="226" y1="122" x2="294" y2="122" strokeWidth="0.6" />
          <line x1="226" y1="142" x2="294" y2="142" strokeWidth="0.6" />
          <line x1="226" y1="160" x2="294" y2="160" strokeWidth="0.6" />

          {/* Grand Triangular Pediment */}
          <path d="M 224 114 L 260 84 L 296 114 Z" strokeWidth="1.35" />
          <path d="M 230 112 L 260 88 L 290 112" strokeWidth="0.9" />
          {/* Tympanum Roundel / Crest */}
          <circle cx="260" cy="102" r="5" strokeWidth="0.9" />
          <circle cx="260" cy="102" r="2.5" strokeWidth="0.7" />

          {/* Classical Entablature Beams Under Pediment */}
          <line x1="222" y1="114" x2="298" y2="114" strokeWidth="1.3" />
          <line x1="224" y1="118" x2="296" y2="118" strokeWidth="0.95" />

          {/* 4 Slender Classical Vertical Columns */}
          {[233, 251, 269, 287].map((colX) => (
            <g key={`portico-col-${colX}`}>
              {/* Capital */}
              <line x1={colX - 4} y1="119" x2={colX + 4} y2="119" strokeWidth="1.0" />
              {/* Column Shaft Lines */}
              <line x1={colX - 1.5} y1="120" x2={colX - 1.5} y2="173" strokeWidth="0.8" />
              <line x1={colX + 1.5} y1="120" x2={colX + 1.5} y2="173" strokeWidth="0.8" />
              {/* Base Plinth */}
              <rect x={colX - 3} y="173" width="6" height="3" strokeWidth="0.85" />
            </g>
          ))}

          {/* Main Entrance Portal */}
          <rect x="252" y="176" width="16" height="34" rx="2" strokeWidth="1.0" />
          <line x1="260" y1="176" x2="260" y2="210" strokeWidth="0.7" />
        </g>

        {/* Intermediate Right Bay (X: 295 to 325) */}
        <g id="facade-bay-right">
          <line x1="295" y1="74" x2="325" y2="74" strokeWidth="1.1" />
          <line x1="325" y1="74" x2="325" y2="212" strokeWidth="0.95" />
          {/* Tall Vertical Glass Curtain Bay */}
          <rect x="300" y="88" width="20" height="82" rx="1" strokeWidth="0.95" />
          <line x1="310" y1="88" x2="310" y2="170" strokeWidth="0.6" />
          <line x1="300" y1="108" x2="320" y2="108" strokeWidth="0.6" />
          <line x1="300" y1="128" x2="320" y2="128" strokeWidth="0.6" />
          <line x1="300" y1="148" x2="320" y2="148" strokeWidth="0.6" />
        </g>

        {/* Right Wing Facade (X: 325 to 452) */}
        <g id="facade-wing-right">
          {/* Horizontal Cornices */}
          <line x1="325" y1="82" x2="452" y2="82" strokeWidth="1.1" />
          <line x1="325" y1="86" x2="452" y2="86" strokeWidth="1.25" />
          <line x1="325" y1="112" x2="452" y2="112" strokeWidth="0.95" />
          <line x1="325" y1="140" x2="452" y2="140" strokeWidth="0.95" />
          <line x1="325" y1="168" x2="452" y2="168" strokeWidth="1.1" />
          <line x1="325" y1="212" x2="452" y2="212" strokeWidth="1.2" />

          {/* Upper Windows - 4 Bays (X centers: 344, 374, 404, 434) */}
          {[344, 374, 404, 434].map((cx) => (
            <g key={`win-right-${cx}`}>
              {/* Floor 4 */}
              <rect x={cx - 7} y="92" width="14" height="14" rx="1" strokeWidth="0.85" />
              <line x1={cx} y1="92" x2={cx} y2="106" strokeWidth="0.5" />
              <line x1={cx - 7} y1="99" x2={cx + 7} y2="99" strokeWidth="0.5" />
              {/* Floor 3 */}
              <rect x={cx - 7} y="118" width="14" height="16" rx="1" strokeWidth="0.85" />
              <line x1={cx} y1="118" x2={cx} y2="134" strokeWidth="0.5" />
              <line x1={cx - 7} y1="126" x2={cx + 7} y2="126" strokeWidth="0.5" />
              {/* Floor 2 */}
              <rect x={cx - 7} y="146" width="14" height="16" rx="1" strokeWidth="0.85" />
              <line x1={cx} y1="146" x2={cx} y2="162" strokeWidth="0.5" />
              <line x1={cx - 7} y1="154" x2={cx + 7} y2="154" strokeWidth="0.5" />
            </g>
          ))}

          {/* Ground Floor Colonnade Pillars along Right Wing */}
          {[334, 348, 362, 376, 390, 404, 418, 432, 446].map((colX) => (
            <g key={`colonnade-right-${colX}`}>
              <line x1={colX - 2.5} y1="168" x2={colX + 2.5} y2="168" strokeWidth="0.9" />
              <line x1={colX} y1="169" x2={colX} y2="211" strokeWidth="0.85" />
              <rect x={colX - 2} y="210" width="4" height="2" strokeWidth="0.8" />
            </g>
          ))}
        </g>

        {/* Far-Right Corner Tower (X: 452 to 502) */}
        <g id="facade-tower-right">
          <line x1="452" y1="78" x2="452" y2="212" strokeWidth="1.0" />
          <line x1="502" y1="78" x2="502" y2="212" strokeWidth="1.2" />
          <line x1="452" y1="78" x2="502" y2="78" strokeWidth="1.2" />
          <line x1="452" y1="84" x2="502" y2="84" strokeWidth="1.1" />
          <line x1="452" y1="112" x2="502" y2="112" strokeWidth="0.9" />
          <line x1="452" y1="168" x2="502" y2="168" strokeWidth="0.9" />
          {/* Floor 4 Window */}
          <rect x="466" y="92" width="22" height="14" rx="1" strokeWidth="0.85" />
          <line x1="477" y1="92" x2="477" y2="106" strokeWidth="0.6" />
          {/* Floors 2-3 Vertical Glass Curtain Bay */}
          <rect x="464" y="118" width="26" height="46" rx="1" strokeWidth="0.95" />
          <line x1="464" y1="133" x2="490" y2="133" strokeWidth="0.6" />
          <line x1="464" y1="148" x2="490" y2="148" strokeWidth="0.6" />
          <line x1="477" y1="118" x2="477" y2="164" strokeWidth="0.6" />
          {/* Ground Floor Base Portal */}
          <rect x="468" y="180" width="18" height="32" rx="1" strokeWidth="0.85" />
        </g>

        {/* 5. Main Entrance Gate Structure (Foreground Base) */}
        <g id="krmu-foreground-entrance-gate">
          {/* Left Gate Pier/Pylon (X: 135 to 168) */}
          <rect x="135" y="162" width="33" height="54" rx="1.5" strokeWidth="1.25" />
          {/* Stepped Pier Coping */}
          <line x1="133" y1="162" x2="170" y2="162" strokeWidth="1.2" />
          <line x1="134" y1="160" x2="169" y2="160" strokeWidth="1.1" />
          {/* Vertical Rusticated Fluting Pillars */}
          <line x1="143" y1="166" x2="143" y2="212" strokeWidth="0.8" />
          <line x1="151.5" y1="172" x2="151.5" y2="212" strokeWidth="0.8" />
          <line x1="160" y1="166" x2="160" y2="212" strokeWidth="0.8" />
          {/* Left Circular Crest Plaque */}
          <circle cx="151.5" cy="167" r="3.2" strokeWidth="0.85" />

          {/* Right Gate Pier/Pylon (X: 352 to 385) */}
          <rect x="352" y="162" width="33" height="54" rx="1.5" strokeWidth="1.25" />
          {/* Stepped Pier Coping */}
          <line x1="350" y1="162" x2="387" y2="162" strokeWidth="1.2" />
          <line x1="351" y1="160" x2="386" y2="160" strokeWidth="1.1" />
          {/* Vertical Rusticated Fluting Pillars */}
          <line x1="360" y1="166" x2="360" y2="212" strokeWidth="0.8" />
          <line x1="368.5" y1="172" x2="368.5" y2="212" strokeWidth="0.8" />
          <line x1="377" y1="166" x2="377" y2="212" strokeWidth="0.8" />
          {/* Right Circular Crest Plaque */}
          <circle cx="368.5" cy="167" r="3.2" strokeWidth="0.85" />

          {/* Wide Horizontal Lintel Beam (X: 133 to 387) */}
          <line x1="133" y1="162" x2="387" y2="162" strokeWidth="1.3" />
          <line x1="133" y1="174" x2="387" y2="174" strokeWidth="1.25" />
          <line x1="168" y1="165" x2="352" y2="165" strokeWidth="0.75" />
          <line x1="168" y1="171" x2="352" y2="171" strokeWidth="0.75" />

          {/* Central Circular University Crest Medallion */}
          <circle cx="260" cy="168" r="6.5" strokeWidth="1.1" />
          <circle cx="260" cy="168" r="4.2" strokeWidth="0.85" />
          <circle cx="260" cy="168" r="1.8" strokeWidth="0.75" />

          {/* Center Security Booth */}
          <rect x="252" y="180" width="16" height="34" rx="1" strokeWidth="0.95" />
          <rect x="254" y="184" width="12" height="12" strokeWidth="0.75" />
          <line x1="250" y1="180" x2="270" y2="180" strokeWidth="1.1" />

          {/* Wrought-Iron Security Gate Leaves (Left: 168-248, Right: 272-352) */}
          {/* Left Gate Leaf */}
          <line x1="168" y1="184" x2="248" y2="184" strokeWidth="0.9" />
          <line x1="168" y1="196" x2="248" y2="196" strokeWidth="0.8" />
          <line x1="168" y1="210" x2="248" y2="210" strokeWidth="0.9" />
          {[176, 184, 192, 200, 208, 216, 224, 232, 240].map((gx) => (
            <g key={`gate-left-${gx}`}>
              <line x1={gx} y1="182" x2={gx} y2="211" strokeWidth="0.7" />
              <path d={`M ${gx - 1.2} 182 L ${gx} 179 L ${gx + 1.2} 182 Z`} strokeWidth="0.65" />
            </g>
          ))}

          {/* Right Gate Leaf */}
          <line x1="272" y1="184" x2="352" y2="184" strokeWidth="0.9" />
          <line x1="272" y1="196" x2="352" y2="196" strokeWidth="0.8" />
          <line x1="272" y1="210" x2="352" y2="210" strokeWidth="0.9" />
          {[280, 288, 296, 304, 312, 320, 328, 336, 344].map((gx) => (
            <g key={`gate-right-${gx}`}>
              <line x1={gx} y1="182" x2={gx} y2="211" strokeWidth="0.7" />
              <path d={`M ${gx - 1.2} 182 L ${gx} 179 L ${gx + 1.2} 182 Z`} strokeWidth="0.65" />
            </g>
          ))}

          {/* Flanking Low Boundary Curb Lines */}
          <line x1="24" y1="212" x2="135" y2="212" strokeWidth="1.1" />
          <line x1="24" y1="217" x2="135" y2="217" strokeWidth="0.8" />
          <line x1="385" y1="212" x2="496" y2="212" strokeWidth="1.1" />
          <line x1="385" y1="217" x2="496" y2="217" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
};

export default UniversityBuildingWireframe;
