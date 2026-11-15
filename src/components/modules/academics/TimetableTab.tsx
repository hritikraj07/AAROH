import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import { ClassSession } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Clock, MapPin, User, Calendar } from 'lucide-react';

export const TimetableTab: React.FC = () => {
  const { timetable, courses } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'day'>('grid');

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    // If today is Mon-Sat, select today; if Sun, select Mon (1)
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

  // Helpers
  const getSessionAtSlot = (dayNum: number, startTime: string): ClassSession | undefined => {
    return timetable.find(s => s.dayOfWeek === dayNum && s.startTime === startTime);
  };

  const daySessions = AcademicService.getSessionsForDay(timetable, selectedDay);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-border">
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
                    ? 'bg-teal-700 text-white font-semibold shadow-subtle'
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
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-border text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-subtle font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'day' ? 'bg-white text-slate-900 shadow-subtle font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day View
          </button>
        </div>
      </div>

      {/* 1. Weekly Grid View */}
      {viewMode === 'grid' && (
        <div className="bg-white border border-border rounded-lg shadow-subtle overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-7 border-b border-border bg-slate-50 text-xs font-semibold text-slate-600">
              <div className="p-3 border-r border-border text-slate-400">Time Slot</div>
              {days.map(d => {
                const isToday = currentDayOfWeek === d.num;
                return (
                  <div
                    key={d.num}
                    className={`p-3 border-r border-border last:border-r-0 text-center ${
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
              <div key={slot.start} className="grid grid-cols-7 border-b border-border last:border-b-0 min-h-[90px]">
                {/* Time Label */}
                <div className="p-3 border-r border-border bg-slate-50/30 text-xs font-mono text-slate-500 flex items-center justify-center text-center">
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
                      className={`p-2 border-r border-border last:border-r-0 transition-colors ${
                        isToday ? 'bg-teal-50/20' : ''
                      }`}
                    >
                      {session && course ? (
                        <div className="h-full p-2.5 rounded border border-border bg-slate-50/80 hover:bg-white hover:shadow-subtle hover:border-teal-500/50 transition-all flex flex-col justify-between text-xs">
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
                            <span className="truncate text-slate-400">{session.facultyName.split(' ').pop()}</span>
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

      {/* 2. Day View */}
      {viewMode === 'day' && (
        <div className="bg-white border border-border rounded-lg shadow-subtle p-5">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
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
                    className="p-4 rounded-lg border border-border bg-slate-50/40 hover:bg-white hover:shadow-subtle transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-24 shrink-0 font-mono text-xs font-semibold text-slate-900 bg-white border border-border px-2.5 py-1.5 rounded text-center">
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
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {session.facultyName} ({course?.facultyEmail})
                          </span>
                          <span className="hidden sm:inline text-slate-400">
                            {course?.credits} Credits
                          </span>
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
    </div>
  );
};
