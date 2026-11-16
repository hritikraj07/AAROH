import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import { ClassSession } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Clock, MapPin, User, Calendar, Network } from 'lucide-react';
import { getFacultyFullName } from '../../../utils/facultyUtils';
import { SkillTreeModal } from './SkillTreeModal';

export const TimetableTab: React.FC = () => {
  const { timetable, courses, user, users } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'day'>('grid');
  const [selectedCourseForTree, setSelectedCourseForTree] = useState<{ id: string; code: string; name: string } | null>(null);

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
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    return currentDayOfWeek >= 1 && currentDayOfWeek <= 6 ? currentDayOfWeek : 1;
  });

  const courseMap = new Map(courses.map(c => [c.id, c]));
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
    { label: '09:00 – 10:00', start: '09:00', end: '10:00' },
    { label: '10:15 – 11:15', start: '10:15', end: '11:15' },
    { label: '11:30 – 12:30', start: '11:30', end: '12:30' },
    { label: '14:00 – 16:00', start: '14:00', end: '16:00' },
  ];

  const getSessionAtSlot = (dayNum: number, startTime: string): ClassSession | undefined => {
    return filteredTimetable.find(s => s.dayOfWeek === dayNum && s.startTime === startTime);
  };

  const daySessions = AcademicService.getSessionsForDay(filteredTimetable, selectedDay);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {days.map(d => {
            const isToday = currentDayOfWeek === d.num;
            const isSelected = selectedDay === d.num;
            return (
              <button
                key={d.num}
                onClick={() => {
                  setSelectedDay(d.num);
                  if (viewMode === 'grid') setViewMode('day');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  isSelected && viewMode === 'day'
                    ? 'bg-teal-700 text-white font-semibold '
                    : 'bg-slate-100/70 text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span>{d.short}</span>
                {isToday && (
                  <span
                    className={`ml-1.5 text-[9px] px-1 py-0.2 rounded font-sans uppercase ${
                      isSelected && viewMode === 'day'
                        ? 'bg-teal-800 text-teal-100'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-white text-slate-900  font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'day' ? 'bg-white text-slate-900  font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day View
          </button>
        </div>
      </div>

      {/* Global Empty State Banner if no sessions configured */}
      {timetable.length === 0 && (
        <div className="p-12 bg-white border border-slate-200 rounded-lg text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">No timetable schedule published yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
            Class lectures, tutorial sessions, and laboratory slots for your enrolled section will be synchronized here once timetables are confirmed by the academic cell.
          </p>
        </div>
      )}

      {/* 1. Weekly Grid View (when timetable exists) */}
      {viewMode === 'grid' && timetable.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <div className="p-3 border-r border-slate-200 text-slate-400">Time Slot</div>
              {days.map(d => {
                const isToday = currentDayOfWeek === d.num;
                return (
                  <div
                    key={d.num}
                    className={`p-3 border-r border-slate-200 last:border-r-0 text-center ${
                      isToday ? 'bg-teal-50/70 text-teal-900' : ''
                    }`}
                  >
                    <span className="font-bold">{d.name}</span>
                    {isToday && (
                      <span className="block text-[10px] text-teal-700 font-medium">
                        Today
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Slot Rows */}
            {timeSlots.map(slot => (
              <div key={slot.start} className="grid grid-cols-7 border-b border-slate-200 last:border-b-0 min-h-[90px]">
                {/* Time Label */}
                <div className="p-3 border-r border-slate-200 bg-slate-50/30 text-xs font-mono text-slate-500 flex items-center justify-center text-center">
                  {slot.label}
                </div>

                {/* Day Columns */}
                {days.map(d => {
                  const session = getSessionAtSlot(d.num, slot.start);
                  const isToday = currentDayOfWeek === d.num;
                  const course = session ? courseMap.get(session.courseId) : undefined;

                  return (
                    <div
                      key={d.num}
                      className={`p-2 border-r border-slate-200 last:border-r-0 transition-colors ${
                        isToday ? 'bg-teal-50/20' : ''
                      }`}
                    >
                      {session && course ? (
                        <div className="h-full p-2.5 rounded border border-slate-200 bg-slate-50/80 hover:bg-white hover: hover:border-teal-500/50 transition-all flex flex-col justify-between text-xs">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono font-bold text-slate-900">
                                {course.code}
                              </span>
                              <Badge variant="slate" size="sm">
                                {session.type}
                              </Badge>
                            </div>
                            <p className="text-[11px] font-medium text-slate-800 line-clamp-1 leading-snug">
                              {course.name}
                            </p>
                          </div>

                          <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="truncate">{session.room}</span>
                            <span className="truncate text-slate-600 dark:text-slate-400 font-medium">
                              {getFacultyFullName(session, course, users)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[11px] text-slate-300">
                          —
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

      {/* 2. Day View (when timetable exists) */}
      {viewMode === 'day' && timetable.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {days.find(d => d.num === selectedDay)?.name} Schedule
              </h3>
              <p className="text-xs text-slate-500">
                {daySessions.length} sessions scheduled
              </p>
            </div>
            {currentDayOfWeek === selectedDay && (
              <Badge variant="teal" size="sm" dot>
                Today's Schedule
              </Badge>
            )}
          </div>

          {daySessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No classes scheduled for {days.find(d => d.num === selectedDay)?.name}.
            </div>
          ) : (
            <div className="space-y-3">
              {daySessions.map(session => {
                const course = courseMap.get(session.courseId);
                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-white hover: transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-24 shrink-0 font-mono text-xs font-semibold text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded text-center">
                        {session.startTime} – {session.endTime}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-teal-800">
                            {course?.code}
                          </span>
                          <span className="text-slate-300">•</span>
                          <h4 className="text-xs font-semibold text-slate-900">
                            {course?.name}
                          </h4>
                          <Badge variant="slate" size="sm">
                            {session.type}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {session.room}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {getFacultyFullName(session, course, users)}
                          </span>
                          <span className="hidden sm:inline text-slate-400">
                            {course?.credits || 4} Credits
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedCourseForTree({ id: session.courseId, code: course?.code || 'CS', name: course?.name || session.courseName || 'Course' })}
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors ml-auto cursor-pointer"
                            title="View B.Tech Skill Tree"
                          >
                            <Network className="w-3 h-3 text-teal-600" />
                            <span>View Skill Tree</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
