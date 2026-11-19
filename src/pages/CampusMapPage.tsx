import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KrmuCampusExplorer } from '../components/modules/campus/KrmuCampusExplorer';
import { SmartResolveModal } from '../components/modules/campus/SmartResolveModal';
import { CampusKanbanBoard } from '../components/modules/campus/CampusKanbanBoard';
import {
  ClipboardList,
} from 'lucide-react';

export const CampusMapPage: React.FC = () => {
  const { user, campusTickets } = useApp();
  const [selectedBuilding, setSelectedBuilding] = useState<string>('Aryabhata Block');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSelectBuilding = (building: string) => {
    setSelectedBuilding(building);
    setIsModalOpen(true);
  };

  const userTickets = campusTickets.filter(
    t => (user?.id && t.submitterId === user.id) || (user?.role && t.submitterRole === user.role)
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-12 select-none">
      {/* Interactive 3D WebGL Digital Twin of K.R. Mangalam University */}
      <div className="h-[calc(100vh-5.5rem)] max-h-[820px] min-h-[480px] w-full flex flex-col rounded-2xl overflow-hidden shadow-sm relative">
        <KrmuCampusExplorer onReportIssue={handleSelectBuilding} />
      </div>

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
