import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Bell, Calendar, Briefcase, HelpCircle, BookOpen, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, notices, events, opportunities, lostFound, courses } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Aggregate searchable items
  interface SearchItem {
    id: string;
    type: 'Notice' | 'Event' | 'Opportunity' | 'Lost & Found' | 'Course';
    title: string;
    subtitle: string;
    url: string;
    icon: React.ReactNode;
    tagVariant: 'teal' | 'emerald' | 'amber' | 'rose' | 'slate' | 'blue' | 'indigo' | 'violet';
  }

  const searchResults: SearchItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Show default top suggestions when search query is empty
      const initial: SearchItem[] = [
        ...notices.slice(0, 2).map(n => ({
          id: n.id,
          type: 'Notice' as const,
          title: n.title,
          subtitle: `${n.department} • ${n.publishedDate}`,
          url: `/student/notices?id=${n.id}`,
          icon: <Bell className="w-3.5 h-3.5" />,
          tagVariant: 'teal' as const,
        })),
        ...events.slice(0, 2).map(e => ({
          id: e.id,
          type: 'Event' as const,
          title: e.title,
          subtitle: `${e.venue} • ${e.date}`,
          url: `/student/events?id=${e.id}`,
          icon: <Calendar className="w-3.5 h-3.5" />,
          tagVariant: 'blue' as const,
        })),
        ...opportunities.slice(0, 2).map(o => ({
          id: o.id,
          type: 'Opportunity' as const,
          title: o.title,
          subtitle: `${o.organization} • ${o.type}`,
          url: `/student/opportunities?id=${o.id}`,
          icon: <Briefcase className="w-3.5 h-3.5" />,
          tagVariant: 'emerald' as const,
        })),
      ];
      return initial;
    }

    const results: SearchItem[] = [];

    // 1. Notices
    notices.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.department.toLowerCase().includes(q)) {
        results.push({
          id: n.id,
          type: 'Notice',
          title: n.title,
          subtitle: `${n.department} • ${n.category}`,
          url: `/student/notices?id=${n.id}`,
          icon: <Bell className="w-3.5 h-3.5" />,
          tagVariant: 'teal',
        });
      }
    });

    // 2. Events
    events.forEach(e => {
      if (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.organizer.toLowerCase().includes(q)) {
        results.push({
          id: e.id,
          type: 'Event',
          title: e.title,
          subtitle: `${e.venue} • ${e.date}`,
          url: `/student/events?id=${e.id}`,
          icon: <Calendar className="w-3.5 h-3.5" />,
          tagVariant: 'blue',
        });
      }
    });

    // 3. Opportunities
    opportunities.forEach(o => {
      if (o.title.toLowerCase().includes(q) || o.organization.toLowerCase().includes(q) || o.description.toLowerCase().includes(q) || o.eligibility.toLowerCase().includes(q)) {
        results.push({
          id: o.id,
          type: 'Opportunity',
          title: o.title,
          subtitle: `${o.organization} • ${o.compensation}`,
          url: `/student/opportunities?id=${o.id}`,
          icon: <Briefcase className="w-3.5 h-3.5" />,
          tagVariant: 'emerald',
        });
      }
    });

    // 4. Lost & Found
    lostFound.forEach(lf => {
      if (lf.title.toLowerCase().includes(q) || lf.description.toLowerCase().includes(q) || lf.location.toLowerCase().includes(q)) {
        results.push({
          id: lf.id,
          type: 'Lost & Found',
          title: lf.title,
          subtitle: `${lf.type.toUpperCase()} at ${lf.location}`,
          url: `/student/lost-found?id=${lf.id}`,
          icon: <HelpCircle className="w-3.5 h-3.5" />,
          tagVariant: 'amber',
        });
      }
    });

    // 5. Courses
    courses.forEach(c => {
      if (c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.facultyName && c.facultyName.toLowerCase().includes(q))) {
        results.push({
          id: c.id,
          type: 'Course',
          title: `${c.code}: ${c.name}`,
          subtitle: `${c.facultyName} • ${c.credits} Credits • ${c.roomDefault}`,
          url: `/student/academics?course=${c.code}`,
          icon: <BookOpen className="w-3.5 h-3.5" />,
          tagVariant: 'indigo',
        });
      }
    });

    return results.slice(0, 10);
  }, [query, notices, events, opportunities, lostFound, courses]);

  const handleSelect = (item: SearchItem) => {
    closeSearch();
    navigate(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < searchResults.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white rounded-lg border border-border shadow-modal z-10 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search notices, events, courses..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] font-mono bg-white text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching results found for "{query}"
            </div>
          ) : (
            <div className="space-y-0.5">
              {!query && (
                <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Quick Suggestions
                </div>
              )}
              {searchResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-teal-50/80 text-teal-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`${isSelected ? 'text-teal-700' : 'text-slate-400'} shrink-0`}>
                        {item.icon}
                      </span>
                      <div className="min-w-0 truncate">
                        <p className="truncate font-semibold text-slate-900">{item.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge variant={item.tagVariant} size="sm">
                        {item.type}
                      </Badge>
                      {isSelected && <ArrowRight className="w-3.5 h-3.5 text-teal-700" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Hotkey Legend */}
        <div className="px-4 py-2 bg-slate-50 border-t border-border flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded mr-1">↑↓</kbd>
              Navigate
            </span>
            <span>
              <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded mr-1">↵</kbd>
              Select
            </span>
          </div>
          <span>Aaroh Global Search</span>
        </div>
      </div>
    </div>
  );
};
