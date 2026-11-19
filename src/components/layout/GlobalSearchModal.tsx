import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Compass,
  Code2,
  AlertTriangle,
  BookOpen,
  MapPin,
  Clock,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { CodingLab, CampusTicket } from '../../types';

// Custom 4-layer premium button shadows
const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';

export interface OmniSearchItem {
  id: string;
  category: 'ROUTES' | 'LABS' | 'TICKETS';
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeColor?: string;
  url: string;
  icon: React.ReactNode;
}

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, globalLabs, campusTickets, role } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // 1. System Routes (Pre-defined quick links)
  const systemRoutes: OmniSearchItem[] = useMemo(() => [
    {
      id: 'route_faculty_dash',
      category: 'ROUTES',
      title: 'Navigate to Faculty Dashboard',
      subtitle: 'Faculty overview, active timetable & student attendance tracking',
      badgeText: 'Faculty',
      badgeColor: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      url: '/faculty/dashboard',
      icon: <Compass className="w-4 h-4 text-[#0F766E]" />,
    },
    {
      id: 'route_skill_tree',
      category: 'ROUTES',
      title: 'Open Skill Tree',
      subtitle: 'B.Tech Curriculum Tracker & Prerequisite Map',
      badgeText: 'Academics',
      badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      url: '/student/academics?tab=curriculum',
      icon: <BookOpen className="w-4 h-4 text-[#0F766E]" />,
    },
    {
      id: 'route_report_issue',
      category: 'ROUTES',
      title: 'Report Infrastructure Issue',
      subtitle: 'Smart Resolve AI facility complaint portal & interactive campus heatmap',
      badgeText: 'Campus',
      badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      url: '/student/campus-map',
      icon: <MapPin className="w-4 h-4 text-[#0F766E]" />,
    },
    {
      id: 'route_student_dash',
      category: 'ROUTES',
      title: 'Navigate to Student Overview',
      subtitle: 'Student dashboard, context-aware lecture schedule & urgent tasks',
      badgeText: 'Student',
      badgeColor: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      url: '/student/dashboard',
      icon: <Compass className="w-4 h-4 text-[#0F766E]" />,
    },
    {
      id: 'route_admin_dash',
      category: 'ROUTES',
      title: 'Navigate to Administration Console',
      subtitle: 'Campus facilities, infrastructure tickets kanban & department controls',
      badgeText: 'Admin',
      badgeColor: 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      url: '/admin/dashboard',
      icon: <Shield className="w-4 h-4 text-[#0F766E]" />,
    },
    {
      id: 'route_attendance_logger',
      category: 'ROUTES',
      title: 'Lecture Attendance Logger',
      subtitle: 'Roll call records & QR attendance monitoring',
      badgeText: 'Faculty',
      badgeColor: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      url: '/faculty/attendance',
      icon: <Clock className="w-4 h-4 text-[#0F766E]" />,
    },
    {
      id: 'route_lost_found',
      category: 'ROUTES',
      title: 'Lost & Found Registry',
      subtitle: 'Campus item claims with secure contact exchange',
      badgeText: 'Campus',
      badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      url: '/student/lost-found',
      icon: <Layers className="w-4 h-4 text-[#0F766E]" />,
    },
  ], []);

  // 2. Unified Multi-Storage Search Engine Logic
  const groupedResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Pull real-time data from localStorage arrays
    const storedLabs: CodingLab[] = StorageService.getGlobalLabs();
    const storedTickets: CampusTicket[] = StorageService.getCampusTickets();

    const activeLabs = storedLabs.length > 0 ? storedLabs : globalLabs;
    const activeTickets = storedTickets.length > 0 ? storedTickets : campusTickets;

    // Filter Routes
    const filteredRoutes = systemRoutes.filter(route => {
      if (!q) return true; // show all when empty query
      return (
        route.title.toLowerCase().includes(q) ||
        route.subtitle.toLowerCase().includes(q)
      );
    });

    // Filter Labs (Search globalLabs by lab title or problemStatement)
    const filteredLabs: OmniSearchItem[] = activeLabs
      .filter(lab => {
        if (!q) return false;
        return (
          lab.title.toLowerCase().includes(q) ||
          lab.problemStatement.toLowerCase().includes(q) ||
          (lab.subject && lab.subject.toLowerCase().includes(q))
        );
      })
      .map(lab => ({
        id: `lab_${lab.id}`,
        category: 'LABS' as const,
        title: lab.title,
        subtitle: `${lab.subject} (Sem ${lab.semester}) • ${lab.problemStatement.slice(0, 75)}...`,
        badgeText: `Sem ${lab.semester}`,
        badgeColor: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        url: role === 'faculty' ? '/faculty/assignments' : '/student/dashboard',
        icon: <Code2 className="w-4 h-4 text-[#0F766E]" />,
      }));

    // Filter Tickets (Search campusTickets by category or summary)
    const filteredTickets: OmniSearchItem[] = activeTickets
      .filter(ticket => {
        if (!q) return false;
        return (
          ticket.category.toLowerCase().includes(q) ||
          ticket.summary.toLowerCase().includes(q) ||
          (ticket.description && ticket.description.toLowerCase().includes(q)) ||
          (ticket.location && ticket.location.toLowerCase().includes(q))
        );
      })
      .map(ticket => ({
        id: `ticket_${ticket.id}`,
        category: 'TICKETS' as const,
        title: `${ticket.category}: ${ticket.summary}`,
        subtitle: `${ticket.location} • Priority: ${ticket.priority} • Status: ${ticket.status}`,
        badgeText: ticket.priority,
        badgeColor:
          ticket.priority === 'Critical'
            ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-900'
            : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        url: '/admin/dashboard',
        icon: <AlertTriangle className="w-4 h-4 text-[#0F766E]" />,
      }));

    return {
      ROUTES: filteredRoutes,
      LABS: filteredLabs,
      TICKETS: filteredTickets,
    };
  }, [query, systemRoutes, globalLabs, campusTickets, role]);

  // Flatten ordered results for keyboard navigation: ROUTES -> LABS -> TICKETS
  const flatResults = useMemo(() => {
    return [
      ...groupedResults.ROUTES,
      ...groupedResults.LABS,
      ...groupedResults.TICKETS,
    ];
  }, [groupedResults]);

  // Keep selected index in bounds
  useEffect(() => {
    if (selectedIndex >= flatResults.length) {
      setSelectedIndex(Math.max(0, flatResults.length - 1));
    }
  }, [flatResults.length, selectedIndex]);

  // 4. Keyboard Navigation (UX Polish)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flatResults.length === 0) {
      if (e.key === 'Escape') closeSearch();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = flatResults[selectedIndex];
      if (target) {
        handleSelectItem(target);
      }
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  const handleSelectItem = (item: OmniSearchItem) => {
    closeSearch();
    navigate(item.url);
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-md bg-black/40 flex items-start sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-sans"
      onClick={closeSearch}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-w-2xl w-full bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden font-sans transition-colors relative max-h-[92dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Large, Borderless Text Input with Deep Teal Blinking Cursor */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-white/10">
          <Search className="w-5 h-5 text-[#0F766E] absolute left-4 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search Aaroh... (Type routes, coding labs, facility tickets)"
            className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none caret-[#0F766E] pl-9 pr-12 font-sans"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="absolute right-4 flex items-center gap-1.5">
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded transition-colors"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="text-[10px] font-mono bg-slate-100 dark:bg-[#18181B] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded font-bold">
                ESC
              </kbd>
            )}
          </div>
        </div>

        {/* Scrollable Results List */}
        <div ref={listRef} className="max-h-96 overflow-y-auto p-2 space-y-4">
          {flatResults.length === 0 ? (
            /* Sleek Empty State per user prompt */
            <div className="py-12 px-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#18181B] text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                No results found in the campus database.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                Try searching for quick keywords like "Python", "Plumbing", "Skill Tree", or "Faculty".
              </p>
            </div>
          ) : (
            <>
              {/* Group 1: ROUTES */}
              {groupedResults.ROUTES.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                    ROUTES
                  </div>
                  {groupedResults.ROUTES.map(item => {
                    const currentIndex = flatResults.findIndex(r => r.id === item.id);
                    const isSelected = currentIndex === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors duration-150 ${
                          isSelected
                            ? 'bg-[#0F766E]/10 border-l-2 border-[#0F766E] text-slate-900 dark:text-slate-100 font-medium'
                            : 'hover:bg-slate-50 dark:hover:bg-[#18181B] text-slate-700 dark:text-slate-300 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0">{item.icon}</span>
                          <div className="min-w-0 truncate">
                            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {item.badgeText && (
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${item.badgeColor || 'border-slate-200 text-slate-600'}`}>
                              {item.badgeText}
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#0F766E] translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Group 2: LABS */}
              {groupedResults.LABS.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                    LABS
                  </div>
                  {groupedResults.LABS.map(item => {
                    const currentIndex = flatResults.findIndex(r => r.id === item.id);
                    const isSelected = currentIndex === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors duration-150 ${
                          isSelected
                            ? 'bg-[#0F766E]/10 border-l-2 border-[#0F766E] text-slate-900 dark:text-slate-100 font-medium'
                            : 'hover:bg-slate-50 dark:hover:bg-[#18181B] text-slate-700 dark:text-slate-300 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0">{item.icon}</span>
                          <div className="min-w-0 truncate">
                            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {item.badgeText && (
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${item.badgeColor}`}>
                              {item.badgeText}
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#0F766E] translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Group 3: TICKETS */}
              {groupedResults.TICKETS.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                    TICKETS
                  </div>
                  {groupedResults.TICKETS.map(item => {
                    const currentIndex = flatResults.findIndex(r => r.id === item.id);
                    const isSelected = currentIndex === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors duration-150 ${
                          isSelected
                            ? 'bg-[#0F766E]/10 border-l-2 border-[#0F766E] text-slate-900 dark:text-slate-100 font-medium'
                            : 'hover:bg-slate-50 dark:hover:bg-[#18181B] text-slate-700 dark:text-slate-300 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0">{item.icon}</span>
                          <div className="min-w-0 truncate">
                            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {item.badgeText && (
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${item.badgeColor}`}>
                              {item.badgeText}
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#0F766E] translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Hotkey Guide */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#18181B] border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-bold">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-bold">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-bold">ESC</kbd>
              <span>Close</span>
            </span>
          </div>

          <span className="text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
            <span>Aaroh Omni-Search</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const OmniSearchModal = GlobalSearchModal;
export default GlobalSearchModal;
