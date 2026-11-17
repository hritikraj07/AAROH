import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  CAMPUS_BUILDINGS,
  BuildingMeta,
  checkNextClassInBuilding,
  getBuildingHealth,
} from '../../../utils/campusMapUtils';
import { CampusBuilding } from '../../../types';
import {
  Building2,
  BookOpen,
  Home,
  Coffee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Sparkles,
  Info,
} from 'lucide-react';

export interface CampusMapProps {
  onSelectBuilding?: (building: CampusBuilding) => void;
  isAdminView?: boolean;
  className?: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  onSelectBuilding,
  isAdminView = false,
  className = '',
}) => {
  const { timetable, user, campusTickets } = useApp();
  const [hoveredBuilding, setHoveredBuilding] = useState<CampusBuilding | null>(null);
  const [simulatedClassBuilding, setSimulatedClassBuilding] = useState<CampusBuilding | null>(null);

  const getBuildingIcon = (id: CampusBuilding) => {
    switch (id) {
      case 'Academic Blocks':
        return <Building2 className="w-5 h-5 text-teal-700 dark:text-teal-400" />;
      case 'Library':
        return <BookOpen className="w-5 h-5 text-blue-700 dark:text-blue-400" />;
      case 'Hostels':
        return <Home className="w-5 h-5 text-amber-700 dark:text-amber-400" />;
      case 'Canteen':
        return <Coffee className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
    }
  };

  const handleBuildingClick = (buildingId: CampusBuilding) => {
    if (onSelectBuilding) {
      onSelectBuilding(buildingId);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 sm:p-7 shadow-sm transition-colors duration-500 font-sans ${className}`}
    >
      {/* Map Header & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0F766E]" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
              {isAdminView ? 'Campus Infrastructure Heatmap' : 'Interactive Campus Map'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAdminView
              ? 'Real-time facility health monitor • Click building to inspect or log work orders'
              : 'Click any building to report facility repairs with AI Smart Resolve'}
          </p>
        </div>

        {/* Legend / Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAdminView ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Critical Issue
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                <Sparkles className="w-3 h-3 text-[#0F766E]" />
                Next Class Glow
              </span>
              {/* Demo switch to test timetable synergy easily */}
              <button
                type="button"
                onClick={() =>
                  setSimulatedClassBuilding(prev =>
                    prev === 'Academic Blocks' ? 'Library' : prev === 'Library' ? null : 'Academic Blocks'
                  )
                }
                className="text-[10px] font-mono text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 underline underline-offset-2 cursor-pointer transition-colors"
                title="Toggle simulated class to preview 30-minute glow"
              >
                {simulatedClassBuilding ? `[Sim: ${simulatedClassBuilding}]` : '[Simulate Class]'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top-Down Architectural Layout Grid */}
      <div className="relative mt-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#27272A] bg-slate-50/80 dark:bg-[#0E0E11] p-4 sm:p-6 min-h-[380px] flex flex-col justify-between select-none">
        {/* Subtle Campus Grid & Road Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Central Lawn & Pathway SVG Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Central Rotunda */}
          <circle cx="50%" cy="50%" r="48" fill="none" stroke="#0F766E" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="20" fill="#0F766E" fillOpacity="0.08" />
          {/* Axis Pathways */}
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#0F766E" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#0F766E" strokeWidth="1" strokeDasharray="2 4" />
        </svg>

        {/* 4 Interactive Campus Zones / Buildings */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {CAMPUS_BUILDINGS.map(building => {
            const synergy = checkNextClassInBuilding(building.id, timetable, user);
            const hasNextClass =
              synergy.hasClassInNext30Min || simulatedClassBuilding === building.id;
            const health = getBuildingHealth(building.id, campusTickets);
            const isCriticalPulse = isAdminView && health.hasCritical;

            // Compute dynamic CSS styling
            const glowClass = hasNextClass
              ? 'shadow-[0_0_15px_#0F766E] border-teal-500 dark:border-teal-400 ring-2 ring-teal-500/30'
              : '';
            const pulseClass = isCriticalPulse
              ? 'animate-pulse border-red-500 bg-red-500/10 dark:bg-red-500/15'
              : '';

            return (
              <div
                key={building.id}
                onClick={() => handleBuildingClick(building.id)}
                onMouseEnter={() => setHoveredBuilding(building.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                className={`relative group p-5 rounded-2xl cursor-pointer transition-all duration-300 border bg-white dark:bg-[#18181B] hover:scale-[1.015] hover:border-teal-500 dark:hover:border-teal-500 flex flex-col justify-between min-h-[155px] ${
                  pulseClass || glowClass || 'border-slate-200 dark:border-[#27272A]'
                }`}
              >
                {/* Timetable Synergy Tooltip Banner */}
                {hasNextClass && (
                  <div className="absolute -top-3 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0F766E] text-white text-[11px] font-mono font-bold shadow-md animate-bounce">
                    <Clock className="w-3 h-3" />
                    <span>Next Class Here</span>
                    {synergy.minutesUntilStart >= 0 && (
                      <span className="opacity-90 font-normal">({synergy.minutesUntilStart}m)</span>
                    )}
                  </div>
                )}

                {/* Critical Issue Alert Banner (Admin) */}
                {isCriticalPulse && (
                  <div className="absolute -top-3 right-4 z-20 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold shadow-md">
                    <AlertTriangle className="w-3 h-3" />
                    <span>🚨 {health.criticalCount} Critical Issue</span>
                  </div>
                )}

                {/* Top Row: Building Name, Code & Icon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#202026] flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-white/5 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/40 transition-colors">
                      {getBuildingIcon(building.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {building.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-black/30 rounded border border-slate-200/60 dark:border-white/5">
                          {building.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {building.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Operational Status Pill */}
                  <div className="shrink-0 text-right">
                    {health.hasCritical ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/50">
                        <AlertTriangle className="w-3 h-3" />
                        Critical
                      </span>
                    ) : health.unresolvedCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                        <Clock className="w-3 h-3" />
                        {health.unresolvedCount} Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Healthy
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Zone Details & Click CTA */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    <MapPin className="w-3 h-3 text-[#0F766E]" />
                    <span>Zone {building.floorCount} Levels</span>
                    <span className="mx-1">•</span>
                    <span>{health.totalCount} Tickets Logged</span>
                  </div>

                  <span className="text-[11px] font-semibold text-[#0F766E] group-hover:underline inline-flex items-center gap-1">
                    <span>{isAdminView ? 'Inspect Zone →' : 'Report Issue →'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Fountain Campus Label */}
        <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-[#27272A] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>K.R. Mangalam University • Gurugram Campus Infrastructure System</span>
          </div>
          <span>Top-Down Coordinate Grid</span>
        </div>
      </div>
    </div>
  );
};

export default CampusMap;
