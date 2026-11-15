import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, UserCheck } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import { Badge } from '../../ui/Badge';

export const TodayClassesCard: React.FC = () => {
  const { timetable, courses, user } = useApp();
  const courseMap = new Map(courses.map(c => [c.id, c]));

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

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const upcomingInfo = AcademicService.getNextUpcomingClass(filteredTimetable, now);

  let displayDayNum = currentDayOfWeek;
  let isDisplayingFutureDay = false;
  let headerLabel = "TODAY'S SCHEDULE";

  if (filteredTimetable.length > 0) {
    if (currentDayOfWeek === 0 || AcademicService.getSessionsForDay(filteredTimetable, currentDayOfWeek).length === 0) {
      isDisplayingFutureDay = true;
      displayDayNum = upcomingInfo.session ? upcomingInfo.session.dayOfWeek : 1;
      const daysName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      headerLabel = `${daysName[displayDayNum]}'S SCHEDULE`;
    }
  }

  const sessionsToDisplay = AcademicService.getSessionsForDay(filteredTimetable, displayDayNum);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              {headerLabel}
            </span>
            {isDisplayingFutureDay && (
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono">
                (NEXT ACTIVE)
              </span>
            )}
          </div>
          <Link
            to="/student/academics?tab=timetable"
            className="rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs px-3 py-1 font-medium transition-colors flex items-center gap-1 active:scale-95"
          >
            <span>Full Schedule</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Content Table / Borderless Data Rows */}
        <div className="mt-6">
          {sessionsToDisplay.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No scheduled sessions</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">Timetable records will populate here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessionsToDisplay.map(session => {
                const course = courseMap.get(session.courseId);
                const isNext = upcomingInfo.session?.id === session.id;

                return (
                  <div
                    key={session.id}
                    className={`py-3.5 px-3 rounded-xl flex items-center justify-between gap-4 transition-colors ${isNext
                        ? 'bg-teal-50/70 dark:bg-teal-900/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {session.startTime} – {session.endTime}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-xs font-bold text-teal-800 dark:text-teal-400">
                          {course?.code || 'CS'}
                        </span>
                        <Badge variant="slate" size="sm">
                          {session.type}
                        </Badge>
                      </div>

                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 mt-1 truncate">
                        {course?.name || session.courseName}
                      </p>

                      <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {session.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {session.facultyName}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isNext ? (
                        <span className="rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-bold font-mono uppercase px-2.5 py-1">
                          {upcomingInfo.isHappeningNow
                            ? 'Live'
                            : upcomingInfo.isToday && upcomingInfo.minutesUntil > 0
                              ? `In ${upcomingInfo.minutesUntil}m`
                              : 'Next'}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {sessionsToDisplay.length > 0 && (
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <span>{sessionsToDisplay.length} sessions listed</span>
          <span>Cohort: {user?.program || 'B.Tech'} Sem {user?.semester || 5}</span>
        </div>
      )}
    </div>
  );
};

export default TodayClassesCard;
