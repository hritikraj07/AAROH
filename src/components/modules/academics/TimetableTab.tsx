import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { ClassSession } from '../../../types';
import { Clock, MapPin, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react';
import { getFacultyFullName } from '../../../utils/facultyUtils';
import { TimetableCalendar } from './TimetableCalendar';
import { UpcomingClassesCard } from './UpcomingClassesCard';
import { TopographicBg } from '../../ui/TopographicBg';

// Helper to get campus date in Asia/Kolkata timezone
const getCampusNow = (): Date => {
  const now = new Date();
  const kolkataStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(kolkataStr);
};

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isBeforeToday = (d: Date, today: Date) => {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return target < t;
};

const toMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const TimetableTab: React.FC = () => {
  const { timetable, courses, user, users } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'day'>('day');
  // Campus current date in Asia/Kolkata timezone
  const campusNow = useMemo(() => getCampusNow(), []);

  // Single source of truth for date control, defaulting to today
  const [selectedDate, setSelectedDate] = useState<Date>(() => getCampusNow());

  // Universal audience filtering: checks user.program and user.semester, falling back to complete schedule so EVERY student sees it
  const filteredTimetable = useMemo(() => {
    const rawFiltered = timetable.filter(s => {
      if (user?.role === 'student') {
        if (s.program && user.program && !s.program.toLowerCase().includes(user.program.toLowerCase()) && !user.program.toLowerCase().includes(s.program.toLowerCase())) {
          return false;
        }
        if (s.semester && user.semester && Number(s.semester) !== Number(user.semester)) {
          return false;
        }
      }
      return true;
    });
    return rawFiltered.length > 0 ? rawFiltered : timetable;
  }, [timetable, user?.program, user?.semester, user?.role]);

  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

  // Full weekly cycle Mon to Sun
  const days = [
    { num: 1, name: 'Monday', short: 'Mon' },
    { num: 2, name: 'Tuesday', short: 'Tue' },
    { num: 3, name: 'Wednesday', short: 'Wed' },
    { num: 4, name: 'Thursday', short: 'Thu' },
    { num: 5, name: 'Friday', short: 'Fri' },
    { num: 6, name: 'Saturday', short: 'Sat' },
    { num: 0, name: 'Sunday', short: 'Sun' },
  ];

  // Specific time slots matching the semester 1 lecture schedule
  const timeSlots = [
    { label: '09:10 - 10:00', start: '09:10', end: '10:00' },
    { label: '10:05 - 10:55', start: '10:05', end: '10:55' },
    { label: '11:00 - 11:50', start: '11:00', end: '11:50' },
    { label: '11:50 - 12:40', start: '11:50', end: '12:40' },
    { label: '13:30 - 14:20', start: '13:30', end: '14:20' },
    { label: '14:20 - 15:10', start: '14:20', end: '15:10' },
    { label: '15:10 - 16:00', start: '15:10', end: '16:00' },
  ];

  // Day of week of the selected date (0 = Sunday, 1 = Monday ... 6 = Saturday)
  const selectedDayOfWeek = selectedDate.getDay();

  // Sessions for the selected date
  const daySessions = useMemo(() => {
    return filteredTimetable
      .filter(s => s.dayOfWeek === selectedDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [filteredTimetable, selectedDayOfWeek]);

  // Total period counts per day of the week
  const getPeriodsCountForDay = (dayNum: number): number => {
    return filteredTimetable.filter(s => s.dayOfWeek === dayNum).length;
  };

  // Handle weekday button click in the header selector strip
  const handleWeekdayClick = (targetDayNum: number) => {
    const currentDayNum = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
    const targetNorm = targetDayNum === 0 ? 7 : targetDayNum;
    const diffDays = targetNorm - currentDayNum;
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + diffDays);
    setSelectedDate(newDate);
  };

  const getSessionAtSlot = (dayNum: number, startTime: string): ClassSession | undefined => {
    return filteredTimetable.find(s => s.dayOfWeek === dayNum && s.startTime === startTime);
  };

  const isToday = isSameDay(selectedDate, campusNow);
  const isPast = isBeforeToday(selectedDate, campusNow);
  const currentMinutes = campusNow.getHours() * 60 + campusNow.getMinutes();

  // Heading formatted date string (e.g. Thursday, 19 November 2026)
  const formattedDateTitle = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* 1. LEFT COLUMN: Timetable Schedule & Controls (approx 72%) */}
      <div className="flex-1 min-w-0 w-full space-y-4">
        {/* Day Selector Strip Mon - Sun */}
        <div className="bg-gradient-to-r from-[#0F2544] to-[#1D4ED8] text-white rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {formattedDateTitle}
                </h3>
                {isToday && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-400 text-[#0F2544] uppercase tracking-wide">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100/85 mt-0.5">
                {daySessions.length === 0
                  ? 'No lectures scheduled for this date'
                  : `${daySessions.length} academic lecture${daySessions.length === 1 ? '' : 's'} scheduled`}
              </p>
            </div>

            {/* View Mode Toggle: Day View vs Weekly Grid */}
            <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl text-xs self-start sm:self-auto shrink-0 border border-white/15">
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={`px-3.5 py-1.5 min-h-[32px] rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-white text-[#1D4ED8] font-bold shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Day View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3.5 py-1.5 min-h-[32px] rounded-lg font-medium transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#1D4ED8] font-bold shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Weekly Grid
              </button>
            </div>
          </div>

          {/* Weekday Navigation Pills Mon - Sun */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/15 scrollbar-none">
            {days.map(d => {
              const isSelected = selectedDayOfWeek === d.num;
              const isDayToday = campusNow.getDay() === d.num;
              const count = getPeriodsCountForDay(d.num);

              return (
                <button
                  key={d.num}
                  type="button"
                  onClick={() => handleWeekdayClick(d.num)}
                  className={`px-3 py-2 min-h-[40px] text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-white text-[#1D4ED8] font-bold shadow-md ring-2 ring-white/60'
                      : 'bg-white/10 hover:bg-white/20 text-white font-medium'
                  }`}
                >
                  <span>{d.short}</span>
                  {count > 0 ? (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-blue-100 text-[#1D4ED8]'
                          : 'bg-black/20 text-blue-100'
                      }`}
                    >
                      {count} {count === 1 ? 'Period' : 'Periods'}
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-slate-100 text-slate-500' : 'text-white/50'
                      }`}
                    >
                      Off
                    </span>
                  )}
                  {isDayToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Today" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Day View (Clean Blue-Themed Period Cards with Slide Transitions) */}
        {viewMode === 'day' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDayOfWeek}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="space-y-3.5"
            >
              {daySessions.length === 0 ? (
                /* Empty state: Saturday / Sunday / Monday */
                <div className="bg-white dark:bg-[#18181B] border border-blue-200/70 dark:border-blue-900/50 rounded-2xl p-10 sm:p-14 text-center flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                  <TopographicBg />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center text-[#1D4ED8] dark:text-blue-400 mb-4 shadow-inner">
                      <CalendarIcon className="w-8 h-8 text-[#1D4ED8] dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-[#0F2544] dark:text-white">
                      No Lectures Scheduled
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
                      {selectedDayOfWeek === 0
                        ? 'Campus is closed for regular academic lectures on Sundays.'
                        : `No lectures scheduled for ${days.find(d => d.num === selectedDayOfWeek)?.name || 'this day'}. Enjoy your free day or make progress on your automated coding laboratories.`}
                    </p>
                  </div>
                </div>
              ) : (
                daySessions.map((session, index) => {
                  const course = courseMap.get(session.courseId);
                  const startMin = toMinutes(session.startTime);
                  const endMin = toMinutes(session.endTime);
                  const facultyDisplay = session.facultyName || getFacultyFullName(session, course, users);

                  // Free period calculation before this session
                  let freePeriodGap: { start: string; end: string; minutes: number } | null = null;
                  if (index > 0) {
                    const prevEndMin = toMinutes(daySessions[index - 1].endTime);
                    const gap = startMin - prevEndMin;
                    if (gap >= 20) {
                      freePeriodGap = {
                        start: daySessions[index - 1].endTime,
                        end: session.startTime,
                        minutes: gap,
                      };
                    }
                  }

                  // Class status differentiation
                  let sessionStatus: 'In Progress' | 'Upcoming' | 'Completed' = 'Upcoming';
                  if (isToday) {
                    if (currentMinutes >= startMin && currentMinutes < endMin) {
                      sessionStatus = 'In Progress';
                    } else if (currentMinutes >= endMin) {
                      sessionStatus = 'Completed';
                    } else {
                      sessionStatus = 'Upcoming';
                    }
                  } else if (isPast) {
                    sessionStatus = 'Completed';
                  }

                  const isPR = session.type === 'PR' || session.type === 'Lab';

                  return (
                    <React.Fragment key={session.id}>
                      {/* Subtle Distinct Free Period Slot */}
                      {freePeriodGap && (
                        <div className="py-2.5 px-4 rounded-xl border border-dashed border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold">
                              {freePeriodGap.start} - {freePeriodGap.end}
                            </span>
                            <span>•</span>
                            <span>Recess / Free Period</span>
                          </div>
                          <span className="text-xs font-mono font-medium">{freePeriodGap.minutes} min</span>
                        </div>
                      )}

                      {/* Timetable Session Card in Blue Theme */}
                      <div
                        className={`bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/30 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-indigo-950/20 border border-blue-200/70 dark:border-blue-900/50 border-l-4 border-l-[#1D4ED8] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          sessionStatus === 'In Progress'
                            ? 'ring-2 ring-[#1D4ED8] bg-blue-50/80 dark:bg-blue-950/40 shadow-sm'
                            : sessionStatus === 'Completed'
                            ? 'opacity-85'
                            : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-1 min-w-0">
                          {/* Time Badge with Clock Icon */}
                          <div className="bg-blue-100/80 text-[#1D4ED8] dark:bg-blue-950/70 dark:text-blue-300 font-semibold tabular-nums text-xs font-mono px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 border border-blue-200/60 dark:border-blue-800/60 self-start sm:self-center">
                            <Clock className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
                            <span>{session.startTime} - {session.endTime}</span>
                          </div>

                          <div className="space-y-1.5 min-w-0 flex-1">
                            {/* Subject Name & Type Tag */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#1D4ED8] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                                {course?.code || session.courseCode || 'CS'}
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-[#0F2544] dark:text-white tracking-tight truncate">
                                {course?.name || session.courseName || 'Class Lecture'}
                              </h4>

                              {/* Type Tag: PP vs PR */}
                              {isPR ? (
                                <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  PR (Lab)
                                </span>
                              ) : (
                                <span className="bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  PP (Theory)
                                </span>
                              )}

                              {sessionStatus === 'In Progress' && (
                                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/80 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                                  In Progress
                                </span>
                              )}
                            </div>

                            {/* Secondary Metadata: Classroom & Faculty */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                              {/* Room / Lab Badge */}
                              <span className="bg-sky-100/80 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-medium text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-sky-200/60 dark:border-sky-800/50">
                                <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                                <span>Room {session.room}</span>
                              </span>

                              {/* Faculty Badge */}
                              <span className="bg-blue-50 text-[#0F2544] dark:bg-blue-950/50 dark:text-blue-200 border border-blue-200/80 dark:border-blue-800/80 font-medium text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                <UserIcon className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
                                <span>{facultyDisplay}</span>
                              </span>

                              <span className="text-slate-400 text-xs hidden lg:inline">
                                {course?.credits || 4} Credits
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* 2. Weekly Grid View (Synchronized with selected day column in Blue Theme) */}
        {viewMode === 'grid' && (
          <div className="bg-white dark:bg-[#18181B] border border-blue-200/70 dark:border-blue-900/50 rounded-2xl overflow-x-auto shadow-sm transition-colors">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-7 border-b border-blue-200/70 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-slate-900 dark:to-slate-800 text-xs font-bold text-[#0F2544] dark:text-white">
                <div className="p-3.5 border-r border-blue-200/70 dark:border-blue-900/50 text-[#1D4ED8] dark:text-blue-400 uppercase tracking-wider font-mono">
                  Time Slot
                </div>
                {days.filter(d => d.num >= 1 && d.num <= 6).map(d => {
                  const isDaySelected = selectedDayOfWeek === d.num;
                  const isDayToday = campusNow.getDay() === d.num;

                  return (
                    <button
                      key={d.num}
                      type="button"
                      onClick={() => handleWeekdayClick(d.num)}
                      className={`p-3 border-r border-blue-200/70 dark:border-blue-900/50 last:border-r-0 text-center transition-colors cursor-pointer ${
                        isDaySelected
                          ? 'bg-blue-100/70 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300'
                          : 'hover:bg-blue-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="font-bold block">{d.name}</span>
                      {isDayToday && (
                        <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Time Slot Rows */}
              {timeSlots.map(slot => (
                <div key={slot.start} className="grid grid-cols-7 border-b border-blue-200/60 dark:border-blue-900/40 last:border-b-0 min-h-[92px]">
                  {/* Time Label */}
                  <div className="p-3 border-r border-blue-200/60 dark:border-blue-900/40 bg-blue-50/30 dark:bg-slate-900/40 text-xs font-mono text-[#1D4ED8] dark:text-blue-300 font-semibold flex items-center justify-center text-center">
                    {slot.label}
                  </div>

                  {/* Day Columns */}
                  {days.filter(d => d.num >= 1 && d.num <= 6).map(d => {
                    const session = getSessionAtSlot(d.num, slot.start);
                    const course = session ? courseMap.get(session.courseId) : undefined;
                    const isColSelected = selectedDayOfWeek === d.num;

                    return (
                      <div
                        key={d.num}
                        className={`p-2 border-r border-blue-200/60 dark:border-blue-900/40 last:border-r-0 transition-colors ${
                          isColSelected ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {session ? (
                          <div className="h-full p-2.5 rounded-xl border border-blue-200/80 border-l-3 border-l-[#1D4ED8] bg-white dark:bg-slate-900 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between text-xs">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-mono font-bold text-[#1D4ED8] dark:text-blue-400 text-[11px]">
                                  {course?.code || session.courseCode}
                                </span>
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 font-bold">
                                  {session.type}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-[#0F2544] dark:text-white line-clamp-1 leading-snug">
                                {course?.name || session.courseName}
                              </p>
                            </div>

                            <div className="mt-2 pt-1 border-t border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="truncate font-mono font-bold text-[#0F2544] dark:text-blue-200">
                                Room {session.room}
                              </span>
                              <span className="truncate text-slate-600 dark:text-slate-400 font-medium">
                                {session.facultyName || getFacultyFullName(session, course, users)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[11px] text-blue-200 dark:text-blue-900/40">
                            -
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. RIGHT COLUMN: Calendar & Upcoming Card (~28%, 280px) */}
      <div className="w-full lg:w-[280px] shrink-0 space-y-4">
        {/* Interactive Monthly Calendar */}
        <TimetableCalendar
          selectedDate={selectedDate}
          onSelectDate={date => {
            setSelectedDate(date);
          }}
          timetable={filteredTimetable}
          campusNow={campusNow}
        />

        {/* Upcoming Classes Card */}
        <UpcomingClassesCard
          selectedDate={selectedDate}
          timetable={filteredTimetable}
          courses={courses}
          users={users}
          campusNow={campusNow}
          onViewFullSchedule={() => {
            if (viewMode !== 'day') setViewMode('day');
          }}
        />
      </div>
    </div>
  );
};

export default TimetableTab;
