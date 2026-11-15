import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Menu, Search, Bell, LogOut, ArrowRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';
import { Link, useNavigate } from 'react-router-dom';
import { getApproachingDeadlines } from '../../utils/deadlineUtils';
import { StorageService } from '../../services/storage';
import { GlobalSearchResult } from '../../types';

export interface TopBarProps {
  onOpenMobileMenu: () => void;
  pageTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu, pageTitle }) => {
  const navigate = useNavigate();
  const {
    openSearch,
    assignments,
    opportunities,
    logout,
    user,
    role,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Global Search Input & Dropdown State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute urgent approaching deadlines strictly within next 48 hours
  const urgentDeadlines = useMemo(() => {
    return getApproachingDeadlines(assignments, opportunities, user);
  }, [assignments, opportunities, user]);

  // Compute normalized search results across notices, events, and opportunities
  const searchResults: GlobalSearchResult[] = useMemo(() => {
    if (searchQuery.trim().length <= 1) return [];
    return StorageService.searchGlobal(searchQuery);
  }, [searchQuery]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Shortcut Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        if (searchQuery.trim().length > 1) {
          setIsSearchOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  const getTypeBadgeClasses = (type: 'Notice' | 'Event' | 'Opportunity') => {
    switch (type) {
      case 'Notice':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Event':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Opportunity':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-150 ease-in-out"
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
        {/* Global Search Input & Dropdown */}
        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                setIsSearchOpen(val.trim().length > 1);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 1) {
                  setIsSearchOpen(true);
                }
              }}
              placeholder="Search notices, events, opportunities..."
              className="w-44 sm:w-64 md:w-72 lg:w-80 pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out font-sans"
              aria-label="Search notices, events, opportunities"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-all duration-150 ease-in-out"
                aria-label="Clear search query"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Results Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 1 && (
            <div className="absolute left-0 top-full mt-1 w-80 sm:w-96 bg-white rounded-md border border-slate-200 shadow-sm py-1 z-50 animate-in fade-in duration-150 font-sans">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 text-[11px] text-slate-500 font-medium">
                <span>Search Results</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-200">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    No results found for '{searchQuery.trim()}'
                  </div>
                ) : (
                  searchResults.map(result => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.url}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="block px-3 py-2.5 text-xs transition-all duration-150 ease-in-out hover:bg-slate-50 group"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug truncate">
                            {result.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 text-xs font-mono font-medium rounded border ${getTypeBadgeClasses(result.type)}`}>
                          {result.type}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className={`relative p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150 ease-in-out ${
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
            <div className="absolute right-0 top-full mt-1 w-80 sm:w-96 bg-white rounded-md border border-slate-200 shadow-sm py-2 z-50 animate-in fade-in duration-150 font-sans">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">Notifications</span>
                  {urgentDeadlines.length > 0 && (
                    <span className="text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
                      {urgentDeadlines.length} urgent
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Next 48 Hours</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-200">
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
                      className="block p-3.5 text-xs transition-all duration-150 ease-in-out hover:bg-slate-50 group"
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

        {/* Sign Out Action */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-slate-200 transition-all duration-150 ease-in-out select-none active:scale-95 group"
          title="Sign out of active account"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          <span>Sign Out</span>
        </button>

        {/* User Identity & Role Status Chip */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
          <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px] flex items-center justify-center font-mono">
            {user?.avatarInitials || (role === 'admin' ? 'AD' : role === 'faculty' ? 'FA' : 'ST')}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-700 max-w-[140px] truncate">
              {user?.name || 'Aaroh User'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
              {role || 'student'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
