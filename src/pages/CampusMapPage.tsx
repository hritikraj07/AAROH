import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CampusMap } from '../components/modules/campus/CampusMap';
import { SmartResolveModal } from '../components/modules/campus/SmartResolveModal';
import { CampusKanbanBoard } from '../components/modules/campus/CampusKanbanBoard';
import { CampusBuilding } from '../types';
import {
  MapPin,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Plus,
} from 'lucide-react';

export const CampusMapPage: React.FC = () => {
  const { user, campusTickets } = useApp();
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding>('Academic Blocks');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSelectBuilding = (building: CampusBuilding) => {
    setSelectedBuilding(building);
    setIsModalOpen(true);
  };

  const userTickets = campusTickets.filter(
    t => (user?.id && t.submitterId === user.id) || (user?.role && t.submitterRole === user.role)
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-12 select-none">
      {/* Hero Banner: Refined Theme matching #134074 & #8DA9C4 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#134074] via-[#244970] to-[#355B82] border border-[#8DA9C4]/30 shadow-lg text-white rounded-3xl p-6 sm:p-10 transition-all duration-300">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full border-[20px] border-white/10 pointer-events-none" />
        <div className="absolute right-28 -top-16 w-52 h-52 rounded-full border-[14px] border-white/10 pointer-events-none" />
        <div className="absolute top-6 right-16 text-white/20 pointer-events-none select-none">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/20 font-mono uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>K.R. Mangalam University • Campus Facilities</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            {isAdmin ? 'Campus Infrastructure Nexus' : 'Aaroh Smart Campus Heatmap'}
          </h1>

          <div className="pt-2 flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleSelectBuilding('Academic Blocks')}
              className="rounded-full bg-[#EEF4ED] text-[#134074] hover:bg-white text-xs px-4 py-2 font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#134074]" />
              <span>Report Facility Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Click-to-Select Interactive Campus Map */}
      <CampusMap onSelectBuilding={handleSelectBuilding} isAdminView={isAdmin} />

      {/* 2. Admin Nexus: Kanban Board Directly Below Map */}
      {isAdmin ? (
        <CampusKanbanBoard className="mt-8" />
      ) : (
        /* Student / Faculty View: My Recent Tickets */
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#27272A]">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#134074] dark:text-[#8DA9C4]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                Recent Facility Reports
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {userTickets.length} logged by you
            </span>
          </div>

          {userTickets.length === 0 ? (
            <div className="bg-white border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-white/5 dark:text-slate-400 border rounded-2xl p-8 text-center space-y-2 select-none">
              <p className="text-xs">
                No active facility tickets submitted by you yet. Click on any building on the map above to report an issue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userTickets.slice(0, 4).map(ticket => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {ticket.summary}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ticket.location} • {ticket.category}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${ticket.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : ticket.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    "{ticket.description}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* "Smart Resolve" AI Ticketing Modal with Locked Location */}
      <SmartResolveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedBuilding={selectedBuilding}
      />
    </div>
  );
};

export default CampusMapPage;
