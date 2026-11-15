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
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              {headerLabel}
            </span>
            {isDisplayingFutureDay && (
              <span className="text-[10px] font-medium text-slate-400 font-mono">
                (NEXT ACTIVE)
              </span>
            )}
          </div>
          <Link
            to="/student/academics?tab=timetable"
            className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 active:scale-95 transition-transform duration-150"
          >
            <span>Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Table / Data Rows */}
        <div className="mt-6">
          {sessionsToDisplay.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-slate-900">No scheduled sessions</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">Timetable records will populate here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessionsToDisplay.map(session => {
                const course = courseMap.get(session.courseId);
                const isNext = upcomingInfo.session?.id === session.id;

                return (
                  <div
                    key={session.id}
                    className={`py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 transition-colors ${
                      isNext ? 'bg-teal-50/50 -mx-3 px-3 rounded-md' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {session.startTime} – {session.endTime}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-teal-800">
                          {course?.code || 'CS'}
                        </span>
                        <Badge variant="slate" size="sm">
                          {session.type}
                        </Badge>
                      </div>

                      <p className="text-xs font-semibold text-slate-900 mt-1 truncate">
                        {course?.name || session.courseName}
                      </p>

                      <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {session.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          {session.facultyName}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isNext ? (
                        <Badge variant="teal" size="sm" dot>
                          {upcomingInfo.isHappeningNow
                            ? 'Live'
                            : upcomingInfo.isToday && upcomingInfo.minutesUntil > 0
                            ? `In ${upcomingInfo.minutesUntil}m`
                            : 'Next'}
                        </Badge>
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
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{sessionsToDisplay.length} sessions listed</span>
          <span>Cohort: {user?.program || 'B.Tech'} Sem {user?.semester || 5}</span>
        </div>
      )}
    </div>
  );
};
