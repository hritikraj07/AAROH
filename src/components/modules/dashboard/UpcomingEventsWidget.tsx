import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, AlertTriangle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import { Badge } from '../../ui/Badge';

export const UpcomingEventsWidget: React.FC = () => {
  const { events, timetable, courses } = useApp();

  const registeredEvents = events.filter(e => e.isRegistered);
  const displayEvents = registeredEvents.length > 0 ? registeredEvents : events.slice(0, 3);

  return (
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/30 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#27272A]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              {registeredEvents.length > 0 ? 'REGISTERED EVENTS' : 'CAMPUS EVENTS'}
            </span>
          </div>
          <Link
            to="/student/events"
            className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 active:scale-95 transition-transform duration-150"
          >
            <span>All Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-6">
          {displayEvents.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No scheduled events</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">Hackathons and campus fests will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#27272A]">
              {displayEvents.map(event => {
                const clash = AcademicService.checkEventClash(
                  event.date,
                  event.startTime,
                  event.endTime,
                  timetable,
                  courses
                );

                return (
                  <div
                    key={event.id}
                    className="py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={event.isRegistered ? 'teal' : 'slate'} size="sm">
                          {event.category}
                        </Badge>
                        {event.isRegistered && (
                          <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-mono">
                            REGISTERED
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {event.date} • {event.startTime}
                      </span>
                    </div>

                    <Link
                      to={`/events?id=${event.id}`}
                      className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-800 dark:hover:text-teal-400 line-clamp-1 block mt-1 active:scale-95 transition-transform duration-150"
                    >
                      {event.title}
                    </Link>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 truncate max-w-[180px] dark:text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {event.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {event.registeredCount}/{event.capacity}
                      </span>
                    </div>

                    {clash.hasClash && (
                      <div className="mt-2 p-1.5 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">
                          Clashes with {clash.clashingCourse?.code} ({clash.clashingSession?.startTime}–{clash.clashingSession?.endTime})
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {events.length > 0 && (
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <span>{events.length} campus events listed</span>
          <span>{registeredEvents.length} enrolled</span>
        </div>
      )}
    </div>
  );
};
