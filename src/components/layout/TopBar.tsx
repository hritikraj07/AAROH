import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, RotateCcw, Check, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';
import { Link } from 'react-router-dom';

export interface TopBarProps {
  onOpenMobileMenu: () => void;
  pageTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu, pageTitle }) => {
  const {
    openSearch,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
    user,
    role,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

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
            className={`relative p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
              isNotifOpen ? 'bg-slate-100 text-slate-900' : ''
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg border border-border shadow-modal py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.2 rounded-full">
                      {unreadNotificationsCount} unread
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-medium hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-xs transition-colors hover:bg-slate-50 flex items-start justify-between gap-3 ${
                        !n.read ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />}
                          <p className="font-semibold text-slate-900 leading-snug">{n.title}</p>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-400">
                          <span>{n.timestamp}</span>
                          {n.actionUrl && (
                            <Link
                              to={n.actionUrl}
                              onClick={() => setIsNotifOpen(false)}
                              className="inline-flex items-center gap-1 text-teal-700 hover:underline font-medium"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
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
