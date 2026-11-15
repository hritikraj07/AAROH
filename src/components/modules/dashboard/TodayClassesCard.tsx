import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import { Badge } from '../../ui/Badge';

export const TodayClassesCard: React.FC = () => {
  const { timetable, courses } = useApp();
  const courseMap = new Map(courses.map(c => [c.id, c]));

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const upcomingInfo = AcademicService.getNextUpcomingClass(timetable, now);

  // Get sessions to display: today's sessions, or next day's sessions if today has none
  let displayDayNum = currentDayOfWeek;
  let isDisplayingFutureDay = false;
  let headerLabel = "Today's Classes";

  if (currentDayOfWeek === 0 || AcademicService.getSessionsForDay(timetable, currentDayOfWeek).length === 0) {
    // Sunday or no classes today
    isDisplayingFutureDay = true;
    displayDayNum = upcomingInfo.session ? upcomingInfo.session.dayOfWeek : 1;
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    headerLabel = `${daysName[displayDayNum]}'s Classes (Next Active Day)`;
  }

  const sessionsToDisplay = AcademicService.getSessionsForDay(timetable, displayDayNum);

  return (
    <div className="bg-white border border-border rounded-lg shadow-subtle overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-700" />
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            {headerLabel}
          </h3>
        </div>
        <Link
          to="/academics?tab=timetable"
          className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
        >
          <span>Full Timetable</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Classes List */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {sessionsToDisplay.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No classes scheduled for this period.
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessionsToDisplay.map(session => {
              const course = courseMap.get(session.courseId);
              const isNext = upcomingInfo.session?.id === session.id;

              return (
                <div
                  key={session.id}
                  className={`p-3 rounded-md border transition-all ${
                    isNext
                      ? 'border-teal-500/80 bg-teal-50/40 ring-1 ring-teal-500/30'
                      : 'border-border bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {session.startTime} – {session.endTime}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-teal-800">
                        {course?.code || 'CS'}
                      </span>
                      <Badge variant="slate" size="sm">
                        {session.type}
                      </Badge>
                    </div>

                    {isNext && (
                      <Badge variant="teal" size="sm" dot>
                        {upcomingInfo.isHappeningNow
                          ? 'In Progress'
                          : upcomingInfo.isToday
                          ? upcomingInfo.minutesUntil > 0
                            ? `Starts in ${upcomingInfo.minutesUntil}m`
                            : 'Next Class'
                          : `${upcomingInfo.dayLabel} Next`}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs font-medium text-slate-800 mt-1">
                    {course?.name}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {session.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {session.facultyName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isDisplayingFutureDay && (
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-border flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>No remaining classes today. Showing next lecture day for your section.</span>
          </p>
        )}
      </div>
    </div>
  );
};
