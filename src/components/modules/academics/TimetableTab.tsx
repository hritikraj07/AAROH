import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { ClassSession } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Clock, MapPin, User as UserIcon, Network, Calendar as CalendarIcon } from 'lucide-react';
import { getFacultyFullName } from '../../../utils/facultyUtils';
import { SkillTreeModal } from './SkillTreeModal';
import { TimetableCalendar } from './TimetableCalendar';
import { UpcomingClassesCard } from './UpcomingClassesCard';

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
  const [selectedCourseForTree, setSelectedCourseForTree] = useState<{ id: string; code: string; name: string } | null>(null);

  // Campus current date in Asia/Kolkata timezone
  const campusNow = useMemo(() => getCampusNow(), []);

  // Single source of truth for date control
  const [selectedDate, setSelectedDate] = useState<Date>(() => getCampusNow());

  // Filter timetable if logged-in user is a student with program/semester
  const filteredTimetable = timetable.filter(s => {
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

  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

  const days = [
    { num: 1, name: 'Monday', short: 'Mon' },
    { num: 2, name: 'Tuesday', short: 'Tue' },
    { num: 3, name: 'Wednesday', short: 'Wed' },
    { num: 4, name: 'Thursday', short: 'Thu' },
    { num: 5, name: 'Friday', short: 'Fri' },
    { num: 6, name: 'Saturday', short: 'Sat' },
  ];

  // Time slots for weekly grid
  const timeSlots = [
    { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
    { label: '10:15 - 11:15', start: '10:15', end: '11:15' },
    { label: '11:30 - 12:30', start: '11:30', end: '12:30' },
    { label: '14:00 - 16:00', start: '14:00', end: '16:00' },
  ];

  // Day of week of the selected date (0 = Sunday, 1 = Monday ... 6 = Saturday)
  const selectedDayOfWeek = selectedDate.getDay();

  // Sessions for the selected date
  const daySessions = useMemo(() => {
    if (selectedDayOfWeek >= 1 && selectedDayOfWeek <= 6) {
      return filteredTimetable
        .filter(s => s.dayOfWeek === selectedDayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return [];
  }, [filteredTimetable, selectedDayOfWeek]);

  // Handle weekday button click in the left column
  const handleWeekdayClick = (targetDayNum: number) => {
    // Synchronize selectedDate to the clicked day within the current week
    const currentDayNum = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
    const diffDays = targetDayNum - currentDayNum;
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
      {/* ======================================================== */}
      {/* 1. LEFT COLUMN: Timetable Experience (approx 72%)        */}
      {/* ======================================================== */}
      <div className="flex-1 min-w-0 w-full space-y-4">
        {/* Timetable Header Card with Selected Date & Controls */}
        <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[10px] border border-[#EAE9E4] dark:border-[#27272A] p-4 space-y-3.5 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#252823] dark:text-[#EAE9E4] tracking-tight">
                  {formattedDateTitle}
                </h3>
                {isToday && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-[#252823] text-white dark:bg-[#EAE9E4] dark:text-[#252823]">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-[#77786F] dark:text-[#A1A1AA] mt-0.5">
                {selectedDayOfWeek === 0
                  ? 'Sunday - No scheduled classes'
                  : `${daySessions.length} academic session${daySessions.length === 1 ? '' : 's'} scheduled`}
              </p>
            </div>

            {/* View Mode Toggle: Weekly Grid / Day View */}
            <div className="flex items-center gap-1 bg-[#F7F6F2] dark:bg-[#111115] p-1 rounded-[8px] border border-[#EAE9E4] dark:border-[#27272A] text-xs self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 min-h-[32px] rounded-[6px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-[#FFFFFF] text-[#252823] font-semibold shadow-2xs dark:bg-[#18181B] dark:text-white'
                    : 'text-[#77786F] hover:text-[#252823] dark:text-[#A1A1AA] dark:hover:text-white'
                }`}
              >
                Day View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 min-h-[32px] rounded-[6px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#FFFFFF] text-[#252823] font-semibold shadow-2xs dark:bg-[#18181B] dark:text-white'
                    : 'text-[#77786F] hover:text-[#252823] dark:text-[#A1A1AA] dark:hover:text-white'
                }`}
              >
                Weekly Grid
              </button>
            </div>
          </div>

          {/* Weekday Navigation Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[#EAE9E4] dark:border-[#27272A]">
            {days.map(d => {
              const isSelected = selectedDayOfWeek === d.num;
              const isDayToday = campusNow.getDay() === d.num;

              return (
                <button
                  key={d.num}
                  type="button"
                  onClick={() => handleWeekdayClick(d.num)}
                  className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-[8px] transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#252823] text-white font-semibold dark:bg-[#EAE9E4] dark:text-[#252823]'
                      : 'bg-[#F7F6F2] text-[#252823] hover:bg-[#EAE9E4] dark:bg-[#111115] dark:text-[#EAE9E4] dark:hover:bg-[#202025]'
                  }`}
                >
                  <span>{d.short}</span>
                  {isDayToday && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#252823]'
                          : 'bg-[#A49B83]/20 text-[#252823] dark:text-[#EAE9E4]'
                      }`}
                    >
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Unpublished Empty State Banner */}
        {filteredTimetable.length === 0 && (
          <div className="p-12 bg-[#FFFFFF] dark:bg-[#18181B] border border-[#EAE9E4] dark:border-[#27272A] rounded-[10px] text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#F7F6F2] dark:bg-[#111115] flex items-center justify-center text-[#77786F] dark:text-[#A1A1AA] mb-3">
              <Clock className="w-5 h-5 text-[#77786F]" />
            </div>
            <h4 className="text-sm font-semibold text-[#252823] dark:text-[#EAE9E4]">
              No timetable schedule published yet
            </h4>
            <p className="text-xs text-[#77786F] dark:text-[#A1A1AA] max-w-sm mt-1 leading-relaxed">
              Class lectures, tutorial sessions, and laboratory slots for your enrolled section will synchronize here once timetables are confirmed by the academic department.
            </p>
          </div>
        )}

        {/* 1. Day View (Clean Vertical Schedule with Free Periods) */}
        {viewMode === 'day' && filteredTimetable.length > 0 && (
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] border border-[#EAE9E4] dark:border-[#27272A] rounded-[10px] p-4 sm:p-5 transition-colors">
            {daySessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#77786F] dark:text-[#A1A1AA] space-y-1">
                <p className="font-semibold text-sm text-[#252823] dark:text-[#EAE9E4]">
                  {selectedDayOfWeek === 0 ? 'Sunday' : 'No Classes Scheduled'}
                </p>
                <p className="text-xs">
                  {selectedDayOfWeek === 0
                    ? 'Campus is closed for regular academic lectures on Sundays.'
                    : `No classes are scheduled for ${days.find(d => d.num === selectedDayOfWeek)?.name || 'this day'}.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {daySessions.map((session, index) => {
                  const course = courseMap.get(session.courseId);
                  const startMin = toMinutes(session.startTime);
                  const endMin = toMinutes(session.endTime);

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
                  } else {
                    sessionStatus = 'Upcoming';
                  }

                  return (
                    <React.Fragment key={session.id}>
                      {/* Subtle Distinct Free Period Slot */}
                      {freePeriodGap && (
                        <div className="py-2 px-3 rounded-[8px] border border-dashed border-[#EAE9E4] dark:border-[#27272A] bg-[#F7F6F2]/70 dark:bg-[#111115]/50 flex items-center justify-between text-xs text-[#77786F] dark:text-[#A1A1AA]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-medium">
                              {freePeriodGap.start} - {freePeriodGap.end}
                            </span>
                            <span>•</span>
                            <span>Free Period / Break</span>
                          </div>
                          <span className="text-[11px] font-mono">{freePeriodGap.minutes} min</span>
                        </div>
                      )}

                      {/* Timetable Session Card */}
                      <div
                        className={`p-4 rounded-[10px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          sessionStatus === 'In Progress'
                            ? 'border-[#252823] bg-[#F7F6F2] dark:border-[#EAE9E4] dark:bg-[#202025]'
                            : sessionStatus === 'Completed'
                            ? 'border-[#EAE9E4]/60 bg-[#FFFFFF] dark:border-[#27272A]/80 dark:bg-[#18181B] opacity-80'
                            : 'border-[#EAE9E4] bg-[#FFFFFF] hover:border-[#A49B83] dark:border-[#27272A] dark:bg-[#18181B]'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Consistent Time Slot Box */}
                          <div className="w-24 shrink-0 font-mono text-xs font-semibold text-[#252823] dark:text-[#EAE9E4] bg-[#FFFFFF] dark:bg-[#111115] border border-[#EAE9E4] dark:border-[#27272A] px-2.5 py-1.5 rounded-[6px] text-center">
                            {session.startTime} - {session.endTime}
                          </div>

                          <div className="space-y-1">
                            {/* Subject Name & Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#A49B83] dark:text-[#A49B83]">
                                {course?.code || session.courseCode || 'ACAD'}
                              </span>
                              <span className="text-[#EAE9E4] dark:text-[#27272A]">•</span>
                              <h4 className="text-xs sm:text-sm font-semibold text-[#252823] dark:text-[#EAE9E4]">
                                {course?.name || session.courseName || 'Class Lecture'}
                              </h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#F7F6F2] text-[#77786F] border border-[#EAE9E4] dark:bg-[#111115] dark:text-[#A1A1AA] dark:border-[#27272A]">
                                {session.type}
                              </span>

                              {sessionStatus === 'In Progress' && (
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#252823] text-white dark:bg-[#EAE9E4] dark:text-[#252823]">
                                  In Progress
                                </span>
                              )}
                            </div>

                            {/* Secondary Metadata: Classroom & Faculty */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#77786F] dark:text-[#A1A1AA] pt-0.5">
                              <span className="flex items-center gap-1 font-mono font-medium text-[#252823] dark:text-[#EAE9E4]">
                                <MapPin className="w-3.5 h-3.5 text-[#A49B83]" />
                                Room {session.room}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-[#77786F] dark:text-[#A1A1AA]">
                                <UserIcon className="w-3.5 h-3.5 text-[#77786F]" />
                                {getFacultyFullName(session, course, users)}
                              </span>
                              <span className="hidden sm:inline text-[#77786F] dark:text-[#A1A1AA]">
                                {course?.credits || 4} Credits
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedCourseForTree({ id: session.courseId, code: course?.code || 'CS', name: course?.name || session.courseName || 'Course' })}
                                className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#F7F6F2] hover:bg-[#EAE9E4] text-[#252823] border border-[#EAE9E4] dark:bg-[#111115] dark:hover:bg-[#202025] dark:text-[#EAE9E4] dark:border-[#27272A] transition-colors ml-auto cursor-pointer"
                                title="View Course Syllabus Skill Tree"
                              >
                                <Network className="w-3 h-3 text-[#A49B83]" />
                                <span>View Skill Tree</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. Weekly Grid View (Synchronized with selected day column) */}
        {viewMode === 'grid' && filteredTimetable.length > 0 && (
          <div className="bg-[#FFFFFF] dark:bg-[#18181B] border border-[#EAE9E4] dark:border-[#27272A] rounded-[10px] overflow-x-auto transition-colors">
            <div className="min-w-[760px]">
              {/* Header Row */}
              <div className="grid grid-cols-7 border-b border-[#EAE9E4] dark:border-[#27272A] bg-[#F7F6F2] dark:bg-[#111115] text-xs font-semibold text-[#252823] dark:text-[#EAE9E4]">
                <div className="p-3 border-r border-[#EAE9E4] dark:border-[#27272A] text-[#77786F]">
                  Time Slot
                </div>
                {days.map(d => {
                  const isDaySelected = selectedDayOfWeek === d.num;
                  const isDayToday = campusNow.getDay() === d.num;

                  return (
                    <button
                      key={d.num}
                      type="button"
                      onClick={() => handleWeekdayClick(d.num)}
                      className={`p-3 border-r border-[#EAE9E4] dark:border-[#27272A] last:border-r-0 text-center transition-colors cursor-pointer ${
                        isDaySelected
                          ? 'bg-[#EAE9E4]/60 dark:bg-[#202025] text-[#252823] dark:text-[#EAE9E4]'
                          : 'hover:bg-[#EAE9E4]/30'
                      }`}
                    >
                      <span className="font-bold">{d.name}</span>
                      {isDayToday && (
                        <span className="block text-[10px] text-[#A49B83] font-medium">
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Time Slot Rows */}
              {timeSlots.map(slot => (
                <div key={slot.start} className="grid grid-cols-7 border-b border-[#EAE9E4] dark:border-[#27272A] last:border-b-0 min-h-[90px]">
                  {/* Time Label */}
                  <div className="p-3 border-r border-[#EAE9E4] dark:border-[#27272A] bg-[#F7F6F2]/40 dark:bg-[#111115]/50 text-xs font-mono text-[#77786F] dark:text-[#A1A1AA] flex items-center justify-center text-center">
                    {slot.label}
                  </div>

                  {/* Day Columns */}
                  {days.map(d => {
                    const session = getSessionAtSlot(d.num, slot.start);
                    const course = session ? courseMap.get(session.courseId) : undefined;
                    const isColSelected = selectedDayOfWeek === d.num;

                    return (
                      <div
                        key={d.num}
                        className={`p-2 border-r border-[#EAE9E4] dark:border-[#27272A] last:border-r-0 transition-colors ${
                          isColSelected ? 'bg-[#F7F6F2]/40 dark:bg-[#202025]/30' : ''
                        }`}
                      >
                        {session && course ? (
                          <div className="h-full p-2.5 rounded-[8px] border border-[#EAE9E4] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#111115] hover:border-[#A49B83] transition-all flex flex-col justify-between text-xs">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-mono font-bold text-[#A49B83] dark:text-[#A49B83]">
                                  {course.code}
                                </span>
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#F7F6F2] dark:bg-[#18181B] text-[#77786F]">
                                  {session.type}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-[#252823] dark:text-[#EAE9E4] line-clamp-1 leading-snug">
                                {course.name}
                              </p>
                            </div>

                            <div className="mt-2 pt-1 border-t border-[#EAE9E4]/60 dark:border-[#27272A] flex items-center justify-between text-[10px] text-[#77786F] dark:text-[#A1A1AA]">
                              <span className="truncate font-mono font-bold text-[#252823] dark:text-[#EAE9E4]">
                                Room {session.room}
                              </span>
                              <span className="truncate text-[#77786F] dark:text-[#A1A1AA] font-medium">
                                {getFacultyFullName(session, course, users)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[11px] text-[#EAE9E4] dark:text-[#27272A]">
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

      {/* ======================================================== */}
      {/* 2. RIGHT COLUMN: Calendar & Upcoming Card (~28%, 280px)  */}
      {/* ======================================================== */}
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

      {/* Course Skill Tree Modal */}
      {selectedCourseForTree && (
        <SkillTreeModal
          courseId={selectedCourseForTree.id}
          courseCode={selectedCourseForTree.code}
          courseName={selectedCourseForTree.name}
          isOpen={Boolean(selectedCourseForTree)}
          onClose={() => setSelectedCourseForTree(null)}
        />
      )}
    </div>
  );
};

export default TimetableTab;
