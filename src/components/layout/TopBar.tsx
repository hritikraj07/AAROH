import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Menu, Search, Bell, LogOut, ArrowRight, X, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeToggle } from '../ui/ThemeToggle';
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
    theme,
    toggleTheme,
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

  // Close notifications and search on outside click
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
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900';
      case 'Event':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900';
      case 'Opportunity':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-900';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#EEF4ED] dark:bg-[#18181B] border-b border-[#D8E2DC] dark:border-[#27272A] h-16 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Left: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-all duration-150"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:inline font-mono">
            {APP_CONFIG.collegeShortName} /
          </span>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{pageTitle}</h1>
        </div>
      </div>

      {/* Middle: Expanded Search Bar with Filter Icon */}
      <div className="flex-1 max-w-xl lg:max-w-2xl" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
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
            className="w-full pl-9 pr-16 py-2 text-xs bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 dark:focus:border-teal-500 transition-all duration-150 font-sans shadow-none"
            aria-label="Search notices, events, opportunities"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                  searchInputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (searchQuery.trim().length > 1) setIsSearchOpen(prev => !prev);
              }}
              className="text-slate-400 hover:text-teal-700 dark:text-slate-500 dark:hover:text-teal-400 p-1 rounded transition-colors"
              title="Filter and refine search"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 1 && (
          <div className="absolute left-auto mt-1 w-80 sm:w-96 bg-white dark:bg-[#18181B] rounded-lg border border-slate-200 dark:border-[#27272A] shadow-sm py-1 z-50 animate-in fade-in duration-150 font-sans">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#0E0E11]/60 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Search Results</span>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#27272A]">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No results found for '{searchQuery}'
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
                    className="block p-3 text-xs hover:bg-slate-50 dark:hover:bg-[#27272A]/60 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                        {result.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${getTypeBadgeClasses(
                          result.type
                        )}`}
                      >
                        {result.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {result.subtitle}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Landscape Animated Theme Toggle */}
        <ThemeToggle size="md" />

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
            title="Approaching deadlines & urgent alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {urgentDeadlines.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-[#18181B]" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#18181B] rounded-lg border border-slate-200 dark:border-[#27272A] shadow-sm z-50 overflow-hidden animate-in fade-in duration-150 font-sans">
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0E0E11] border-b border-slate-200 dark:border-[#27272A] flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Urgent Approaching Deadlines</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Next 48 Hours</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#27272A]">
                {urgentDeadlines.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                    You're all caught up. No deadlines in the next 48 hours.
                  </div>
                ) : (
                  urgentDeadlines.map(item => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      to={item.route}
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3.5 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-[#27272A]/60 group"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-900 dark:text-slate-100 font-medium leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                            {item.formattedText}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{item.subtitle}</span>
                            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 capitalize flex items-center gap-0.5 group-hover:text-teal-700 dark:group-hover:text-teal-400">
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

        {/* Sign Out Action Button */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 bg-white dark:bg-[#18181B] hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-slate-200 dark:border-[#27272A] transition-all duration-150 select-none active:scale-95 group"
          title="Sign out of active account"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
