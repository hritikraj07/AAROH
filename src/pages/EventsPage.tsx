import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EventCategory, CampusEvent } from '../types';
import { AcademicService } from '../services/academicService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EventDetailModal } from '../components/modules/events/EventDetailModal';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Search,
  Filter,
  List,
  Ticket,
  Building,
  Code2,
  Music,
  Trophy,
  Lightbulb,
} from 'lucide-react';

interface EventThemeConfig {
  cardBg: string;
  border: string;
  topStrip: string;
  pill: string;
  progressBg: string;
  watermarkIcon: React.ComponentType<{ className?: string }>;
}

const EVENT_THEMES: Record<string, EventThemeConfig> = {
  tech: {
    cardBg: 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 dark:from-blue-950/30 dark:via-slate-900 dark:to-indigo-950/20',
    border: 'border-blue-200/70 hover:border-blue-300 dark:border-blue-900/60 dark:hover:border-blue-700/80',
    topStrip: 'h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500',
    pill: 'bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80',
    progressBg: 'bg-gradient-to-r from-blue-600 to-indigo-500',
    watermarkIcon: Code2,
  },
  cultural: {
    cardBg: 'bg-gradient-to-br from-rose-50/90 via-white to-amber-50/60 dark:from-rose-950/30 dark:via-slate-900 dark:to-amber-950/20',
    border: 'border-rose-200/70 hover:border-rose-300 dark:border-rose-900/60 dark:hover:border-rose-700/80',
    topStrip: 'h-1.5 bg-gradient-to-r from-rose-500 to-amber-500',
    pill: 'bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
    progressBg: 'bg-gradient-to-r from-rose-500 to-amber-500',
    watermarkIcon: Music,
  },
  sports: {
    cardBg: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20',
    border: 'border-emerald-200/70 hover:border-emerald-300 dark:border-emerald-900/60 dark:hover:border-emerald-700/80',
    topStrip: 'h-1.5 bg-gradient-to-r from-emerald-600 to-teal-500',
    pill: 'bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
    progressBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    watermarkIcon: Trophy,
  },
  workshops: {
    cardBg: 'bg-gradient-to-br from-violet-50/90 via-white to-purple-50/60 dark:from-violet-950/30 dark:via-slate-900 dark:to-purple-950/20',
    border: 'border-violet-200/70 hover:border-violet-300 dark:border-violet-900/60 dark:hover:border-violet-700/80',
    topStrip: 'h-1.5 bg-gradient-to-r from-violet-600 to-purple-500',
    pill: 'bg-violet-100/80 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/80',
    progressBg: 'bg-gradient-to-r from-violet-600 to-purple-500',
    watermarkIcon: Lightbulb,
  },
  clubs: {
    cardBg: 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20',
    border: 'border-amber-200/70 hover:border-amber-300 dark:border-amber-900/60 dark:hover:border-amber-700/80',
    topStrip: 'h-1.5 bg-gradient-to-r from-amber-500 to-orange-500',
    pill: 'bg-amber-100/80 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
    progressBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    watermarkIcon: Users,
  },
};

const DEFAULT_THEME: EventThemeConfig = {
  cardBg: 'bg-gradient-to-br from-slate-50/90 via-white to-slate-100/60 dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950/40',
  border: 'border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
  topStrip: 'h-1.5 bg-gradient-to-r from-slate-500 to-slate-600',
  pill: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  progressBg: 'bg-gradient-to-r from-slate-500 to-slate-600',
  watermarkIcon: CalendarIcon,
};

const getEventTheme = (category?: string): EventThemeConfig => {
  if (!category) return DEFAULT_THEME;
  const key = category.trim().toLowerCase();
  return EVENT_THEMES[key] || DEFAULT_THEME;
};

export const EventsPage: React.FC = () => {
  const { events, timetable, courses, toggleEventRegistration } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'all' | 'my-registrations'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [categoryFilter, setCategoryFilter] = useState<'All' | EventCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  // Sync selected event from query param ?id=
  const eventIdFromUrl = searchParams.get('id');
  useEffect(() => {
    if (eventIdFromUrl) {
      const match = events.find(e => e.id === eventIdFromUrl);
      if (match) setSelectedEvent(match);
    }
  }, [eventIdFromUrl, events]);

  const categories: ('All' | EventCategory)[] = ['All', 'Tech', 'Cultural', 'Sports', 'Workshops', 'Clubs'];

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // My registrations tab
      if (activeTab === 'my-registrations' && !e.isRegistered) return false;

      // Category filter
      if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchDesc = e.description.toLowerCase().includes(q);
        const matchVenue = e.venue.toLowerCase().includes(q);
        const matchOrg = e.organizer.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchVenue && !matchOrg) return false;
      }

      return true;
    });
  }, [events, activeTab, categoryFilter, searchQuery]);

  const registeredCount = events.filter(e => e.isRegistered).length;

  const handleOpenDetail = (ev: CampusEvent) => {
    setSelectedEvent(ev);
    setSearchParams({ id: ev.id });
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
    setSearchParams({});
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Campus Events & Activities</h2>
        </div>

        {/* View Mode & My Registrations Tab */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-[#111115] p-1 rounded-md border border-slate-200 dark:border-[#27272A] text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${activeTab === 'all'
                  ? 'bg-white dark:bg-[#18181B] text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('my-registrations')}
              className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'my-registrations'
                  ? 'bg-teal-700 text-white font-semibold dark:bg-[#0F766E]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
            >
              <Ticket className="w-3 h-3" />
              <span>My Registrations</span>
              {registeredCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${activeTab === 'my-registrations' ? 'bg-teal-800 text-white dark:bg-[#094e49]' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                >
                  {registeredCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-3.5 space-y-3">
        {/* Category Pills Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => {
              const isSelected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${isSelected
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold dark:bg-[#0F766E] dark:text-white dark:border-teal-700'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-[#111115] dark:border-[#27272A] dark:text-slate-300 dark:hover:bg-[#202025]'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Toggle List / Calendar */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111115] p-0.5 rounded border border-slate-200 dark:border-[#27272A] text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#18181B] text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-[#18181B] text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              title="Calendar View"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative pt-2 border-t border-slate-200 dark:border-[#27272A]">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 mt-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search events by title, organizer, or venue..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/70 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
          />
        </div>
      </div>

      {/* 1. List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-400 dark:text-teal-400 mb-3">
                <CalendarIcon className="w-5 h-5 text-slate-400 dark:text-teal-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {activeTab === 'my-registrations'
                  ? 'No event registrations found'
                  : events.length === 0
                    ? 'No campus events scheduled'
                    : 'No matching events found'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
                {activeTab === 'my-registrations'
                  ? "You haven't registered for any events yet. Check back when new events are published!"
                  : events.length === 0
                    ? 'Hackathons, workshops, cultural fests, and sports championships will appear here.'
                    : 'Try selecting a different category or search keyword.'}
              </p>
            </div>
          ) : (
            filteredEvents.map(event => {
              const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
              const isFull = seatsLeft === 0 && !event.isRegistered;
              const clash = AcademicService.checkEventClash(
                event.date,
                event.startTime,
                event.endTime,
                timetable,
                courses
              );
              const theme = getEventTheme(event.category);
              const WatermarkIcon = theme.watermarkIcon;
              const percent = Math.min(100, Math.round((event.registeredCount / Math.max(1, event.capacity)) * 100));

              return (
                <div
                  key={event.id}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${theme.cardBg} ${theme.border} shadow-xs`}
                >
                  {/* Top Accent Strip */}
                  <div className={`w-full ${theme.topStrip} absolute top-0 left-0 right-0 z-10`} />

                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Watermark Icon */}
                  <WatermarkIcon className="absolute -top-3 -right-3 w-32 h-32 opacity-[0.06] dark:opacity-[0.04] pointer-events-none select-none text-current" />

                  <div className="relative z-10 p-5 pb-0 space-y-2.5">
                    {/* Top Row: Category and Date Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.pill}`}>
                          {event.category}
                        </span>
                        {event.isRegistered && (
                          <Badge variant="teal" size="sm" dot>
                            Pass Confirmed
                          </Badge>
                        )}
                        {isFull && (
                          <Badge variant="rose" size="sm">
                            Housefull
                          </Badge>
                        )}
                        {event.itinerary && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/80 font-medium">
                            2-Day Schedule
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                        {event.event_date || event.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => handleOpenDetail(event)}
                      className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-teal-800 dark:hover:text-teal-400 cursor-pointer leading-snug pt-0.5 line-clamp-1"
                    >
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Venue, Time & Organizer Details */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{event.organizer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="font-mono text-[11px]">
                          {event.time_window || `${event.startTime} - ${event.endTime}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Clash warning */}
                    {clash.hasClash && (
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5 mt-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Class Overlap:</strong> Clashes with {clash.clashingCourse?.code} ({clash.clashingSession?.startTime}-{clash.clashingSession?.endTime})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer with Progress Bar */}
                  <div className="relative z-10 p-5 pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          {event.registeredCount}/{event.capacity}
                        </span>
                        <span>({seatsLeft} left)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(event)}
                        >
                          View Details
                        </Button>

                        <Button
                          variant={event.isRegistered ? 'outline' : 'primary'}
                          size="sm"
                          disabled={isFull && !event.isRegistered}
                          onClick={() => toggleEventRegistration(event.id)}
                          className={event.isRegistered ? 'text-rose-600 hover:bg-rose-50 border-rose-200 dark:border-rose-900/60 dark:hover:bg-rose-950/30' : ''}
                        >
                          {event.isRegistered
                            ? 'Cancel'
                            : isFull
                              ? 'Full'
                              : 'Register'}
                        </Button>
                      </div>
                    </div>

                    {/* Seat Progress Bar */}
                    <div className="w-full bg-slate-200/70 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.progressBg}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-[#27272A]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Campus Event Schedule Matrix
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Upcoming Semester Highlights</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-400 dark:text-teal-400 mb-3">
                <CalendarIcon className="w-5 h-5 text-slate-400 dark:text-teal-400" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">No events found on calendar</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mt-0.5">
                No events match your current filter selections.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => handleOpenDetail(event)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:bg-slate-50 dark:hover:bg-[#1c1c22] cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-18 h-14 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 text-teal-900 dark:text-teal-200 flex flex-col items-center justify-center shrink-0 px-1">
                      <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400">
                        {event.date.includes('-') ? `${event.date.split('-')[1]}/${event.date.split('-')[2]}` : 'Nov'}
                      </span>
                      <span className="text-xs font-mono font-bold">
                        {event.startTime}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getEventTheme(event.category).pill}`}>
                          {event.category}
                        </span>
                        {event.isRegistered && (
                          <Badge variant="teal" size="sm">
                            Registered
                          </Badge>
                        )}
                        {event.event_date && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {event.event_date}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {event.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {event.venue} • {event.organizer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs self-end sm:self-center">
                    <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {event.registeredCount} / {event.capacity} Attendees
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={handleCloseDetail}
      />
    </div>
  );
};
