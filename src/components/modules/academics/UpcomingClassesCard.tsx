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
    <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[10px] border border-[#EAE9E4] dark:border-[#27272A] p-3.5 select-none transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#EAE9E4] dark:border-[#27272A]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#77786F] dark:text-[#A1A1AA]" />
          <h4 className="text-xs font-bold text-[#252823] dark:text-[#EAE9E4] tracking-tight">
            Upcoming Classes
          </h4>
        </div>

        {statusBadge && targetSession && !emptyStateMessage && (
          <span
            className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold ${
              statusBadge === 'In Progress'
                ? 'bg-[#252823] text-white dark:bg-[#EAE9E4] dark:text-[#252823]'
                : statusBadge === 'Upcoming'
                ? 'bg-[#F7F6F2] text-[#252823] border border-[#EAE9E4] dark:bg-[#202025] dark:text-[#EAE9E4] dark:border-[#27272A]'
                : 'bg-[#F7F6F2] text-[#77786F] dark:bg-[#202025] dark:text-[#A1A1AA]'
            }`}
          >
            {statusBadge}
          </span>
        )}
      </div>

      {/* Main Content */}
      {emptyStateMessage ? (
        <div className="py-4 text-center space-y-1">
          <p className="text-xs font-semibold text-[#252823] dark:text-[#EAE9E4]">
            {emptyStateMessage}
          </p>
          {emptyStateSubtitle && (
            <p className="text-[11px] text-[#77786F] dark:text-[#A1A1AA] leading-relaxed">
              {emptyStateSubtitle}
            </p>
          )}
        </div>
      ) : targetSession ? (
        <div className="space-y-2">
          {/* Subject & Code */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-mono font-bold text-[#A49B83] dark:text-[#A49B83]">
                {targetCourse?.code || targetSession.courseCode || 'ACAD'}
              </span>
              <span className="text-[10px] font-mono text-[#77786F] dark:text-[#A1A1AA]">
                {targetSession.type}
              </span>
            </div>
            <h5 className="text-xs font-bold text-[#252823] dark:text-[#EAE9E4] line-clamp-1 leading-snug">
              {targetCourse?.name || targetSession.courseName || 'Class Session'}
            </h5>
          </div>

          {/* Time & Room */}
          <div className="pt-1.5 border-t border-[#EAE9E4]/60 dark:border-[#27272A] space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-[#252823] dark:text-[#EAE9E4] font-mono font-medium">
              <span>{targetSession.startTime} - {targetSession.endTime}</span>
              <span className="flex items-center gap-1 font-sans text-[10px] text-[#77786F] dark:text-[#A1A1AA]">
                <MapPin className="w-3 h-3 text-[#A49B83]" />
                Room {targetSession.room}
              </span>
            </div>

            {facultyName && (
              <div className="flex items-center gap-1 text-[11px] text-[#77786F] dark:text-[#A1A1AA] truncate">
                <UserIcon className="w-3 h-3 text-[#77786F] shrink-0" />
                <span className="truncate">{facultyName}</span>
              </div>
            )}
          </div>

          {/* Additional classes scheduled indicator */}
          {additionalCount > 0 && (
            <div className="pt-1 text-[10px] font-mono text-[#77786F] dark:text-[#A1A1AA]">
              +{additionalCount} more {additionalCount === 1 ? 'class' : 'classes'} scheduled for this date
            </div>
          )}
        </div>
      ) : null}

      {/* Footer Shortcut Action */}
      {onViewFullSchedule && (
        <div className="mt-2.5 pt-2 border-t border-[#EAE9E4] dark:border-[#27272A] flex justify-end">
          <button
            type="button"
            onClick={onViewFullSchedule}
            className="text-[10px] font-medium text-[#252823] hover:text-[#A49B83] dark:text-[#EAE9E4] dark:hover:text-[#A49B83] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View full schedule</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
