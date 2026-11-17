import React from 'react';
import { useApp } from '../../../context/AppContext';
import { CampusTicket, TicketStatus, TicketPriority } from '../../../types';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building2,
  Trash2,
  Wrench,
  Cpu,
  Zap,
  Boxes,
  User as UserIcon,
} from 'lucide-react';

export interface CampusKanbanBoardProps {
  className?: string;
}

export const CampusKanbanBoard: React.FC<CampusKanbanBoardProps> = ({ className = '' }) => {
  const { campusTickets, updateCampusTicketStatus, deleteCampusTicket } = useApp();

  const columns: { status: TicketStatus; label: string; count: number; accent: string }[] = [
    {
      status: 'Reported',
      label: 'Reported',
      count: campusTickets.filter(t => t.status === 'Reported').length,
      accent: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
    },
    {
      status: 'In Progress',
      label: 'In Progress',
      count: campusTickets.filter(t => t.status === 'In Progress').length,
      accent: 'border-blue-500/40 text-blue-600 dark:text-blue-400',
    },
    {
      status: 'Resolved',
      label: 'Resolved',
      count: campusTickets.filter(t => t.status === 'Resolved').length,
      accent: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
    },
  ];

  const getNextStatus = (current: TicketStatus): TicketStatus | null => {
    if (current === 'Reported') return 'In Progress';
    if (current === 'In Progress') return 'Resolved';
    return null;
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/60 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            CRITICAL
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded-full">
            MEDIUM
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-900/60 px-2 py-0.5 rounded-full">
            LOW
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Plumbing':
        return <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'IT':
        return <Cpu className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
      case 'Electrical':
        return <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Boxes className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // 1. Signature Enterprise Empty State if zero tickets logged
  if (campusTickets.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
              Infrastructure Kanban Board
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">0 Active Work Orders</span>
        </div>

        <div className="bg-white border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-white/5 dark:text-slate-400 border rounded-2xl p-10 text-center space-y-3 shadow-sm select-none">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 mx-auto flex items-center justify-center border border-teal-200 dark:border-teal-800">
            <CheckCircle2 className="w-6 h-6 text-[#0F766E]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              No facility tickets in queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              No infrastructure tickets logged yet. All campus facilities operating normally. Click any building on the map above to log an issue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className} font-sans`}>
      {/* Board Title & Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#0F766E]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
            Infrastructure Kanban Board
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#202026] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
            {campusTickets.length} Total Tickets
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Click ticket card or "Advance" button to update status and restore map health.
        </p>
      </div>

      {/* 3 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map(col => {
          const colTickets = campusTickets.filter(t => t.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-slate-50/70 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 flex flex-col min-h-[380px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-[#27272A]">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    {col.label}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold flex items-center justify-center text-slate-700 dark:text-slate-300">
                    {colTickets.length}
                  </span>
                </div>
              </div>

              {/* Tickets List */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colTickets.length === 0 ? (
                  <div className="h-44 border border-dashed border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-center p-4">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      No tickets {col.status.toLowerCase()}
                    </p>
                  </div>
                ) : (
                  colTickets.map(ticket => {
                    const nextStatus = getNextStatus(ticket.status);
                    const isCritical = ticket.priority === 'Critical';

                    return (
                      <div
                        key={ticket.id}
                        className={`group p-4 rounded-xl border bg-white dark:bg-[#18181B] transition-all duration-200 hover:shadow-md space-y-2.5 relative select-none ${
                          isCritical && ticket.status !== 'Resolved'
                            ? 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10'
                            : 'border-slate-200 dark:border-[#27272A]'
                        }`}
                      >
                        {/* Top: 3-Word Summary & Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                            {ticket.summary}
                          </h4>
                          <div className="shrink-0">{getPriorityBadge(ticket.priority)}</div>
                        </div>

                        {/* Description snippet */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          "{ticket.description}"
                        </p>

                        {/* Metadata row */}
                        <div className="pt-2 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {ticket.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 font-mono shrink-0">
                            {getCategoryIcon(ticket.category)}
                            <span>{ticket.category}</span>
                          </div>
                        </div>

                        {/* Submitter & Time Info */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="inline-flex items-center gap-1">
                            <UserIcon className="w-3 h-3 text-slate-400" />
                            <span className="capitalize">{ticket.submitterRole}</span>
                            {ticket.submitterName && <span>({ticket.submitterName.split(' ')[0]})</span>}
                          </span>
                          <span>{formatTimeAgo(ticket.createdAt)}</span>
                        </div>

                        {/* Kanban Move / Action Button */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#27272A]">
                          <button
                            type="button"
                            onClick={() => deleteCampusTicket(ticket.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {nextStatus ? (
                            <button
                              type="button"
                              onClick={() => updateCampusTicketStatus(ticket.id, nextStatus)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                              <span>Move to {nextStatus}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Resolved & Healthy
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampusKanbanBoard;
