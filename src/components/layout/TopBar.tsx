import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Menu, Search, Bell, RotateCcw, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';
import { Link } from 'react-router-dom';
import { getApproachingDeadlines } from '../../utils/deadlineUtils';

export interface TopBarProps {
  onOpenMobileMenu: () => void;
  pageTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu, pageTitle }) => {
  const {
    openSearch,
    assignments,
    opportunities,
    resetDemoData,
    user,
    role,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Compute urgent approaching deadlines strictly within next 48 hours
  const urgentDeadlines = useMemo(() => {
    return getApproachingDeadlines(assignments, opportunities, user);
  }, [assignments, opportunities, user]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border h-14 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 hidden sm:inline">
            {APP_CONFIG.collegeShortName} /
          </span>
          <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{pageTitle}</h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Trigger */}
        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-border bg-slate-50/70 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs transition-colors shadow-subtle group"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          <span className="hidden sm:inline">Search notices, events, opportunities...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-white text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded ml-2">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className={`relative p-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
              isNotifOpen ? 'bg-slate-100 text-slate-900' : ''
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {urgentDeadlines.length > 0 && (
              <span
                data-testid="urgent-deadline-dot"
                className="w-2 h-2 rounded-full bg-rose-600 absolute top-1.5 right-1.5 ring-2 ring-white"
              />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg border border-border shadow-modal py-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">Notifications</span>
                  {urgentDeadlines.length > 0 && (
                    <span className="text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-full">
                      {urgentDeadlines.length} urgent
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Next 48 Hours</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {urgentDeadlines.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-600 font-medium">
                    You're all caught up. No deadlines in the next 48 hours.
                  </div>
                ) : (
                  urgentDeadlines.map(item => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      to={item.route}
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3.5 text-xs transition-colors hover:bg-slate-50 group"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-900 font-medium leading-snug group-hover:text-teal-700 transition-colors">
                            {item.formattedText}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                            <span>{item.subtitle}</span>
                            <span className="font-mono text-[10px] text-slate-400 capitalize flex items-center gap-0.5 group-hover:text-teal-700">
                              <span>Go to {item.type === 'assignment' ? 'assignments' : 'opportunities'}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Reset Data */}
        <button
          onClick={resetDemoData}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-transparent transition-colors"
          title="Reset demo data to initial seed"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Demo</span>
        </button>

        {/* User Identity & Role Status Chip */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-border text-xs">
          <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px] flex items-center justify-center font-mono">
            {user?.avatarInitials || (role === 'admin' ? 'AD' : role === 'faculty' ? 'FA' : 'ST')}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-700 max-w-[140px] truncate">
              {user?.name || 'Aaroh User'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 capitalize">
              {role || 'student'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
