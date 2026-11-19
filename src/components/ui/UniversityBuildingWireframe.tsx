import React from 'react';

export interface UniversityBuildingWireframeProps {
  className?: string;
}

export const UniversityBuildingWireframe: React.FC<UniversityBuildingWireframeProps> = ({
  className = 'absolute right-0 bottom-0 h-[95%] w-auto pointer-events-none select-none z-0 text-emerald-900/15 dark:text-white/10 [mask-image:linear-gradient(to_left,black_65%,transparent_100%)] hidden md:block',
}) => {
  return (
    <svg
      viewBox="0 0 680 250"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 1. Base Plinth & Monumental Steps */}
      <line x1="10" y1="242" x2="670" y2="242" strokeWidth="1.2" />
      <line x1="25" y1="238" x2="655" y2="238" />
      <line x1="40" y1="234" x2="640" y2="234" />
      <line x1="50" y1="230" x2="630" y2="230" strokeWidth="1.3" />

      {/* 2. Classical Central Rotunda & Grand Dome */}
      {/* Rotunda Drum Base & Arched Windows */}
      <rect x="296" y="40" width="88" height="26" strokeWidth="1.1" />
      <line x1="292" y1="40" x2="388" y2="40" strokeWidth="1.3" />
      <line x1="294" y1="66" x2="386" y2="66" />
      {/* Drum pilaster ribs */}
      <line x1="304" y1="40" x2="304" y2="66" strokeWidth="0.8" />
      <line x1="320" y1="40" x2="320" y2="66" strokeWidth="0.8" />
      <line x1="336" y1="40" x2="336" y2="66" strokeWidth="0.8" />
      <line x1="344" y1="40" x2="344" y2="66" strokeWidth="0.8" />
      <line x1="360" y1="40" x2="360" y2="66" strokeWidth="0.8" />
      <line x1="376" y1="40" x2="376" y2="66" strokeWidth="0.8" />
      {/* Drum arched windows */}
      <path d="M 308 60 L 308 48 A 4 4 0 0 1 316 48 L 316 60 Z" />
      <path d="M 324 60 L 324 46 A 4 4 0 0 1 332 46 L 332 60 Z" />
      <path d="M 348 60 L 348 46 A 4 4 0 0 1 356 46 L 356 60 Z" />
      <path d="M 364 60 L 364 48 A 4 4 0 0 1 372 48 L 372 60 Z" />

      {/* Prominent Central Grand Dome */}
      <line x1="292" y1="40" x2="388" y2="40" strokeWidth="1.4" />
      <path d="M 296 40 C 296 12, 384 12, 384 40 Z" strokeWidth="1.3" />
      {/* Dome meridian ribs */}
      <line x1="340" y1="14" x2="340" y2="40" strokeWidth="1" />
      <path d="M 340 14 C 324 18, 314 27, 312 40" strokeWidth="0.9" />
      <path d="M 340 14 C 308 20, 301 29, 300 40" strokeWidth="0.9" />
      <path d="M 340 14 C 356 18, 366 27, 368 40" strokeWidth="0.9" />
      <path d="M 340 14 C 372 20, 379 29, 380 40" strokeWidth="0.9" />

      {/* Dome Top Lantern & Finial Spire */}
      <line x1="333" y1="14" x2="347" y2="14" strokeWidth="1.2" />
      <line x1="335" y1="8" x2="335" y2="14" strokeWidth="0.9" />
      <line x1="338" y1="8" x2="338" y2="14" strokeWidth="0.9" />
      <line x1="342" y1="8" x2="342" y2="14" strokeWidth="0.9" />
      <line x1="345" y1="8" x2="345" y2="14" strokeWidth="0.9" />
      <path d="M 334 8 L 340 4 L 346 8 Z" strokeWidth="1" />
      <line x1="340" y1="4" x2="340" y2="1" strokeWidth="1.1" />
      <circle cx="340" cy="1" r="1.3" />

      {/* 3. Central Triangular Pedimented Portico */}
      {/* Triangular Pediment */}
      <path d="M 276 104 L 340 66 L 404 104 Z" strokeWidth="1.4" />
      <path d="M 283 102 L 340 70 L 397 102" strokeWidth="0.9" />
      {/* Pediment Tympanum Crest / Medallion */}
      <circle cx="340" cy="86" r="9" strokeWidth="1" />
      <circle cx="340" cy="86" r="5" strokeWidth="0.8" />
      <line x1="340" y1="81" x2="340" y2="91" strokeWidth="0.8" />
      <line x1="335" y1="86" x2="345" y2="86" strokeWidth="0.8" />
      {/* Acroteria Ornaments */}
      <line x1="340" y1="66" x2="340" y2="59" strokeWidth="1" />
      <line x1="337" y1="62" x2="343" y2="62" strokeWidth="0.9" />
      <line x1="276" y1="104" x2="273" y2="99" strokeWidth="1" />
      <line x1="404" y1="104" x2="407" y2="99" strokeWidth="1" />

      {/* Entablature Below Pediment */}
      <line x1="280" y1="104" x2="400" y2="104" strokeWidth="1.3" />
      <line x1="283" y1="109" x2="397" y2="109" strokeWidth="0.8" />
      <line x1="282" y1="114" x2="398" y2="114" strokeWidth="1.2" />

      {/* Grand Arch Portal Behind Portico */}
      <path d="M 322 230 L 322 170 A 18 18 0 0 1 358 170 L 358 230" strokeWidth="1.2" />
      <path d="M 326 230 L 326 172 A 14 14 0 0 1 354 172 L 354 230" strokeWidth="0.9" />
      <line x1="340" y1="172" x2="340" y2="230" strokeWidth="0.9" />
      <line x1="326" y1="200" x2="354" y2="200" strokeWidth="0.8" />
      {/* Keystone */}
      <path d="M 338 152 L 342 152 L 343 158 L 337 158 Z" strokeWidth="0.9" />
      {/* 2nd floor window above portal */}
      <path d="M 332 144 L 332 128 A 8 8 0 0 1 348 128 L 348 144 Z" strokeWidth="0.9" />

      {/* Classical Portico Vertical Columns (6 Fluted Columns) */}
      {[295, 313, 331, 349, 367, 385].map((colX) => (
        <g key={`portico-col-${colX}`}>
          {/* Column Capital */}
          <line x1={colX - 6} y1="114" x2={colX + 6} y2="114" strokeWidth="1.1" />
          <path d={`M ${colX - 5} 118 C ${colX - 6} 115, ${colX - 2} 114, ${colX} 116 C ${colX + 2} 114, ${colX + 6} 115, ${colX + 5} 118 Z`} strokeWidth="0.8" />
          {/* Column Shaft */}
          <line x1={colX - 2.5} y1="118" x2={colX - 2.5} y2="226" strokeWidth="0.9" />
          <line x1={colX + 2.5} y1="118" x2={colX + 2.5} y2="226" strokeWidth="0.9" />
          <line x1={colX} y1="120" x2={colX} y2="224" strokeWidth="0.6" strokeDasharray="4 2" />
          {/* Column Base / Plinth */}
          <rect x={colX - 4.5} y="226" width="9" height="4" strokeWidth="0.9" />
        </g>
      ))}

      {/* 4. Two Symmetrical Side Domes & Pavilions */}
      {/* Left Side Dome Pavilion (center = 210) */}
      <rect x="188" y="78" width="44" height="36" strokeWidth="1.1" />
      <line x1="184" y1="78" x2="236" y2="78" strokeWidth="1.2" />
      <rect x="194" y="60" width="32" height="18" strokeWidth="1" />
      <path d="M 198 74 L 198 65 A 3 3 0 0 1 204 65 L 204 74 Z" strokeWidth="0.8" />
      <path d="M 207 74 L 207 64 A 3 3 0 0 1 213 64 L 213 74 Z" strokeWidth="0.8" />
      <path d="M 216 74 L 216 65 A 3 3 0 0 1 222 65 L 222 74 Z" strokeWidth="0.8" />
      {/* Cupola */}
      <line x1="190" y1="60" x2="230" y2="60" strokeWidth="1.2" />
      <path d="M 192 60 C 192 38, 228 38, 228 60 Z" strokeWidth="1.2" />
      <line x1="210" y1="41" x2="210" y2="60" strokeWidth="0.8" />
      <path d="M 210 41 C 201 44, 196 51, 195 60" strokeWidth="0.7" />
      <path d="M 210 41 C 219 44, 224 51, 225 60" strokeWidth="0.7" />
      {/* Spire */}
      <line x1="210" y1="41" x2="210" y2="28" strokeWidth="1" />
      <circle cx="210" cy="28" r="1.5" />
      <line x1="210" y1="26" x2="210" y2="22" strokeWidth="1" />

      {/* Right Side Dome Pavilion (center = 470) */}
      <rect x="448" y="78" width="44" height="36" strokeWidth="1.1" />
      <line x1="444" y1="78" x2="496" y2="78" strokeWidth="1.2" />
      <rect x="454" y="60" width="32" height="18" strokeWidth="1" />
      <path d="M 458 74 L 458 65 A 3 3 0 0 1 464 65 L 464 74 Z" strokeWidth="0.8" />
      <path d="M 467 74 L 467 64 A 3 3 0 0 1 473 64 L 473 74 Z" strokeWidth="0.8" />
      <path d="M 476 74 L 476 65 A 3 3 0 0 1 482 65 L 482 74 Z" strokeWidth="0.8" />
      {/* Cupola */}
      <line x1="450" y1="60" x2="490" y2="60" strokeWidth="1.2" />
      <path d="M 452 60 C 452 38, 488 38, 488 60 Z" strokeWidth="1.2" />
      <line x1="470" y1="41" x2="470" y2="60" strokeWidth="0.8" />
      <path d="M 470 41 C 461 44, 456 51, 455 60" strokeWidth="0.7" />
      <path d="M 470 41 C 479 44, 484 51, 485 60" strokeWidth="0.7" />
      {/* Spire */}
      <line x1="470" y1="41" x2="470" y2="28" strokeWidth="1" />
      <circle cx="470" cy="28" r="1.5" />
      <line x1="470" y1="26" x2="470" y2="22" strokeWidth="1" />

      {/* 5. Left Wing Facade (Multi-Storey Windows & Cornices) */}
      <line x1="60" y1="114" x2="188" y2="114" strokeWidth="1.3" />
      <line x1="62" y1="106" x2="188" y2="106" strokeWidth="0.9" />
      {/* Left Balustrade ticks */}
      {[70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180].map((bx) => (
        <line key={`left-bal-${bx}`} x1={bx} y1="106" x2={bx} y2="114" strokeWidth="0.7" />
      ))}
      <line x1="60" y1="152" x2="188" y2="152" strokeWidth="0.9" />
      <line x1="60" y1="190" x2="188" y2="190" strokeWidth="0.9" />
      {/* Outer Left Wall Boundary */}
      <line x1="60" y1="106" x2="60" y2="230" strokeWidth="1.2" />
      <line x1="64" y1="106" x2="64" y2="230" strokeWidth="0.6" />

      {/* Left Wing Windows Grids */}
      {[86, 120, 154].map((wx) => (
        <g key={`left-win-${wx}`}>
          {/* Top Floor (Floor 3) Window */}
          <line x1={wx - 9} y1="123" x2={wx + 9} y2="123" strokeWidth="0.8" />
          <rect x={wx - 7} y="125" width="14" height="18" rx="1" strokeWidth="0.9" />
          <line x1={wx - 7} y1="134" x2={wx + 7} y2="134" strokeWidth="0.6" />
          <line x1={wx} y1="125" x2={wx} y2="143" strokeWidth="0.6" />

          {/* Middle Floor (Floor 2) Window with Pediment Lintel */}
          <path d={`M ${wx - 9} 163 L ${wx} 159 L ${wx + 9} 163`} strokeWidth="0.9" />
          <rect x={wx - 7} y="165" width="14" height="19" rx="1" strokeWidth="0.9" />
          <line x1={wx - 7} y1="174" x2={wx + 7} y2="174" strokeWidth="0.6" />
          <line x1={wx} y1="165" x2={wx} y2="184" strokeWidth="0.6" />

          {/* Ground Floor (Floor 1) Arched Window */}
          <path d={`M ${wx - 7} 224 L ${wx - 7} 207 A 7 7 0 0 1 ${wx + 7} 207 L ${wx + 7} 224 Z`} strokeWidth="0.9" />
          <line x1={wx - 9} y1="225" x2={wx + 9} y2="225" strokeWidth="0.9" />
          <line x1={wx - 7} y1="214" x2={wx + 7} y2="214" strokeWidth="0.6" />
          <line x1={wx} y1="200" x2={wx} y2="224" strokeWidth="0.6" />
        </g>
      ))}

      {/* 6. Right Wing Facade (Multi-Storey Windows & Cornices) */}
      <line x1="492" y1="114" x2="620" y2="114" strokeWidth="1.3" />
      <line x1="492" y1="106" x2="618" y2="106" strokeWidth="0.9" />
      {/* Right Balustrade ticks */}
      {[500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610].map((bx) => (
        <line key={`right-bal-${bx}`} x1={bx} y1="106" x2={bx} y2="114" strokeWidth="0.7" />
      ))}
      <line x1="492" y1="152" x2="620" y2="152" strokeWidth="0.9" />
      <line x1="492" y1="190" x2="620" y2="190" strokeWidth="0.9" />
      {/* Outer Right Wall Boundary */}
      <line x1="620" y1="106" x2="620" y2="230" strokeWidth="1.2" />
      <line x1="616" y1="106" x2="616" y2="230" strokeWidth="0.6" />

      {/* Right Wing Windows Grids */}
      {[526, 560, 594].map((wx) => (
        <g key={`right-win-${wx}`}>
          {/* Top Floor Window */}
          <line x1={wx - 9} y1="123" x2={wx + 9} y2="123" strokeWidth="0.8" />
          <rect x={wx - 7} y="125" width="14" height="18" rx="1" strokeWidth="0.9" />
          <line x1={wx - 7} y1="134" x2={wx + 7} y2="134" strokeWidth="0.6" />
          <line x1={wx} y1="125" x2={wx} y2="143" strokeWidth="0.6" />

          {/* Middle Floor Window with Pediment Lintel */}
          <path d={`M ${wx - 9} 163 L ${wx} 159 L ${wx + 9} 163`} strokeWidth="0.9" />
          <rect x={wx - 7} y="165" width="14" height="19" rx="1" strokeWidth="0.9" />
          <line x1={wx - 7} y1="174" x2={wx + 7} y2="174" strokeWidth="0.6" />
          <line x1={wx} y1="165" x2={wx} y2="184" strokeWidth="0.6" />

          {/* Ground Floor Arched Window */}
          <path d={`M ${wx - 7} 224 L ${wx - 7} 207 A 7 7 0 0 1 ${wx + 7} 207 L ${wx + 7} 224 Z`} strokeWidth="0.9" />
          <line x1={wx - 9} y1="225" x2={wx + 9} y2="225" strokeWidth="0.9" />
          <line x1={wx - 7} y1="214" x2={wx + 7} y2="214" strokeWidth="0.6" />
          <line x1={wx} y1="200" x2={wx} y2="224" strokeWidth="0.6" />
        </g>
      ))}

      {/* 7. Intermediate Wings (Between Side Pavilions & Central Portico) */}
      {/* Left Intermediary */}
      <line x1="236" y1="114" x2="276" y2="114" strokeWidth="1.2" />
      <line x1="236" y1="106" x2="276" y2="106" strokeWidth="0.8" />
      <line x1="236" y1="152" x2="276" y2="152" strokeWidth="0.8" />
      <line x1="236" y1="190" x2="276" y2="190" strokeWidth="0.8" />
      <rect x="249" y="125" width="14" height="18" rx="1" strokeWidth="0.9" />
      <rect x="249" y="165" width="14" height="19" rx="1" strokeWidth="0.9" />
      <path d="M 249 224 L 249 207 A 7 7 0 0 1 263 207 L 263 224 Z" strokeWidth="0.9" />

      {/* Right Intermediary */}
      <line x1="404" y1="114" x2="444" y2="114" strokeWidth="1.2" />
      <line x1="404" y1="106" x2="444" y2="106" strokeWidth="0.8" />
      <line x1="404" y1="152" x2="444" y2="152" strokeWidth="0.8" />
      <line x1="404" y1="190" x2="444" y2="190" strokeWidth="0.8" />
      <rect x="417" y="125" width="14" height="18" rx="1" strokeWidth="0.9" />
      <rect x="417" y="165" width="14" height="19" rx="1" strokeWidth="0.9" />
      <path d="M 417 224 L 417 207 A 7 7 0 0 1 431 207 L 431 224 Z" strokeWidth="0.9" />
    </svg>
  );
};

export default UniversityBuildingWireframe;
