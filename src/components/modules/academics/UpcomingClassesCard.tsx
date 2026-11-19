import React from 'react';
import { Clock, MapPin, User as UserIcon, ArrowRight } from 'lucide-react';
import { ClassSession, Course, User } from '../../../types';
import { getFacultyFullName } from '../../../utils/facultyUtils';

interface UpcomingClassesCardProps {
  selectedDate: Date;
  timetable: ClassSession[];
  courses: Course[];
  users: User[];
  campusNow: Date;
  onViewFullSchedule?: () => void;
}

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isBeforeToday = (d: Date, today: Date) => {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return target < t;
};

const isAfterToday = (d: Date, today: Date) => {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return target > t;
};

const toMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const UpcomingClassesCard: React.FC<UpcomingClassesCardProps> = ({
  selectedDate,
  timetable,
  courses,
  users,
  campusNow,
  onViewFullSchedule,
}) => {
  const courseMap = new Map(courses.map(c => [c.id, c]));

  // Check published status
  const isUnpublished = timetable.length === 0;

  // Selected date relationship to current campus day
  const isToday = isSameDay(selectedDate, campusNow);
  const isFuture = isAfterToday(selectedDate, campusNow);
  const isPast = isBeforeToday(selectedDate, campusNow);

  const dayOfWeek = selectedDate.getDay(); // 0 = Sun, 1-6 = Mon-Sat
  const daySessions = dayOfWeek >= 1 && dayOfWeek <= 6
    ? timetable.filter(s => s.dayOfWeek === dayOfWeek).sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  const currentMinutes = campusNow.getHours() * 60 + campusNow.getMinutes();

  // Determine state and active session
  let targetSession: ClassSession | null = null;
  let statusBadge: 'In Progress' | 'Upcoming' | 'Completed' | null = null;
  let additionalCount = 0;
  let emptyStateMessage: string | null = null;
  let emptyStateSubtitle: string | null = null;

  if (isUnpublished) {
    emptyStateMessage = 'Timetable not published yet';
    emptyStateSubtitle = 'Your academic sessions will synchronize here once finalized.';
  } else if (daySessions.length === 0) {
    emptyStateMessage = 'No upcoming classes';
    emptyStateSubtitle = dayOfWeek === 0
      ? 'Sunday - Campus is closed for scheduled academic lectures.'
      : 'No classes are scheduled on this date.';
  } else if (isToday) {
    // 1. Is there an in-progress class?
    const inProgress = daySessions.find(s => {
      const start = toMinutes(s.startTime);
      const end = toMinutes(s.endTime);
      return currentMinutes >= start && currentMinutes < end;
    });

    if (inProgress) {
      targetSession = inProgress;
      statusBadge = 'In Progress';
      const remaining = daySessions.filter(s => toMinutes(s.startTime) > currentMinutes);
      additionalCount = remaining.length;
    } else {
      // 2. Next class starting later today
      const nextUpcoming = daySessions.find(s => toMinutes(s.startTime) > currentMinutes);
      if (nextUpcoming) {
        targetSession = nextUpcoming;
        statusBadge = 'Upcoming';
        const idx = daySessions.indexOf(nextUpcoming);
        additionalCount = daySessions.length - idx - 1;
      } else {
        // 3. All classes today finished
        emptyStateMessage = 'No more classes today';
        emptyStateSubtitle = 'All scheduled academic sessions for today have concluded.';
      }
    }
  } else if (isFuture) {
    targetSession = daySessions[0];
    statusBadge = 'Upcoming';
    additionalCount = daySessions.length - 1;
  } else {
    // Past date
    targetSession = daySessions[daySessions.length - 1];
    statusBadge = 'Completed';
    emptyStateMessage = 'Classes completed';
    emptyStateSubtitle = `${daySessions.length} session${daySessions.length === 1 ? '' : 's'} concluded for this date.`;
  }

  const targetCourse = targetSession ? courseMap.get(targetSession.courseId) : undefined;
  const facultyName = targetSession ? getFacultyFullName(targetSession, targetCourse, users) : '';

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-blue-200/70 dark:border-blue-900/50 p-4 select-none transition-colors shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-blue-100 dark:border-blue-900/50">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
          <h4 className="text-xs sm:text-sm font-bold text-[#0F2544] dark:text-white tracking-tight">
            Upcoming Classes
          </h4>
        </div>

        {statusBadge && targetSession && !emptyStateMessage && (
          <span
            className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
              statusBadge === 'In Progress'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/60'
                : statusBadge === 'Upcoming'
                ? 'bg-blue-100 text-[#1D4ED8] border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/60'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {statusBadge}
          </span>
        )}
      </div>

      {/* Main Content */}
      {emptyStateMessage ? (
        <div className="py-4 text-center space-y-1">
          <p className="text-xs font-semibold text-[#0F2544] dark:text-white">
            {emptyStateMessage}
          </p>
          {emptyStateSubtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {emptyStateSubtitle}
            </p>
          )}
        </div>
      ) : targetSession ? (
        <div className="space-y-2.5">
          {/* Subject & Code */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-mono font-bold text-[#1D4ED8] dark:text-blue-400">
                {targetCourse?.code || targetSession.courseCode || 'CS'}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300">
                {targetSession.type}
              </span>
            </div>
            <h5 className="text-xs font-bold text-[#0F2544] dark:text-white line-clamp-1 leading-snug mt-0.5">
              {targetCourse?.name || targetSession.courseName || 'Class Session'}
            </h5>
          </div>

          {/* Time & Room */}
          <div className="pt-2 border-t border-blue-100 dark:border-blue-900/50 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-[#0F2544] dark:text-white font-mono font-semibold">
              <span className="text-[#1D4ED8] dark:text-blue-300">{targetSession.startTime} - {targetSession.endTime}</span>
              <span className="flex items-center gap-1 font-sans text-[11px] text-sky-800 dark:text-sky-300 font-medium">
                <MapPin className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                Room {targetSession.room}
              </span>
            </div>

            {facultyName && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 truncate">
                <UserIcon className="w-3 h-3 text-[#1D4ED8] dark:text-blue-400 shrink-0" />
                <span className="truncate">{facultyName}</span>
              </div>
            )}
          </div>

          {/* Additional classes scheduled indicator */}
          {additionalCount > 0 && (
            <div className="pt-1 text-[10px] font-mono text-[#1D4ED8] dark:text-blue-400 font-medium">
              +{additionalCount} more {additionalCount === 1 ? 'class' : 'classes'} scheduled for this date
            </div>
          )}
        </div>
      ) : null}

      {/* Footer Shortcut Action */}
      {onViewFullSchedule && (
        <div className="mt-2.5 pt-2 border-t border-blue-100 dark:border-blue-900/50 flex justify-end">
          <button
            type="button"
            onClick={onViewFullSchedule}
            className="text-[11px] font-semibold text-[#1D4ED8] hover:text-[#0F2544] dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View full schedule</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
