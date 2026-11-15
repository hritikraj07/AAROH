import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, MapPin, Users, AlertTriangle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import { Badge } from '../../ui/Badge';

export const UpcomingEventsWidget: React.FC = () => {
  const { events, timetable, courses } = useApp();

  // Find registered events first, plus upcoming events
  const registeredEvents = events.filter(e => e.isRegistered);
  const displayEvents = registeredEvents.length > 0 ? registeredEvents : events.slice(0, 2);

  return (
    <div className="bg-white border border-border rounded-lg shadow-subtle overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-700" />
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            {registeredEvents.length > 0 ? 'Your Registered Events' : 'Upcoming Campus Events'}
          </h3>
        </div>
        <Link
          to="/student/events"
          className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
        >
          <span>All Events</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Events List / Empty State */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {displayEvents.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-slate-800">No upcoming events scheduled</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 leading-relaxed">
              Hackathons, cultural fests, tournaments, and workshops will appear here as dates are announced.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
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
                  className="p-3 rounded-md border border-border bg-white hover:bg-slate-50/70 transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={event.isRegistered ? 'teal' : 'slate'} size="sm">
                        {event.category}
                      </Badge>
                      {event.isRegistered && (
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full">
                          Registered
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {event.date} • {event.startTime}
                    </span>
                  </div>

                  <Link
                    to={`/events?id=${event.id}`}
                    className="font-semibold text-slate-900 hover:text-teal-800 line-clamp-1 block mt-1"
                  >
                    {event.title}
                  </Link>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {event.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {event.registeredCount}/{event.capacity}
                    </span>
                  </div>

                  {clash.hasClash && (
                    <div className="mt-2 p-1.5 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
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

        {events.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-slate-500">
            <span>{registeredEvents.length} registered event{registeredEvents.length === 1 ? '' : 's'}</span>
            <Link to="/student/events" className="text-teal-700 hover:underline">
              Browse Event Calendar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
