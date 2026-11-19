import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import { APP_CONFIG } from '../../../config';

export const AttendanceAlertsWidget: React.FC = () => {
  const { attendance, courses, student } = useApp();
  const minThreshold = student?.attendanceMinimum || APP_CONFIG.defaultAttendanceThreshold;

  const studentAttendance = attendance.filter(rec => {
    if (student?.id && rec.studentId) {
      return rec.studentId === student.id;
    }
    if (!rec.studentId) {
      const hasSpecific = attendance.some(a => a.courseId === rec.courseId && a.studentId === student?.id);
      return !hasSpecific;
    }
    return false;
  });

  const analyses = AcademicService.analyzeAttendance(studentAttendance, courses, minThreshold);
  const lowAttendance = analyses.filter(a => a.isBelowThreshold);

  return (
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 sm:p-6 transition-colors duration-150 flex flex-col justify-between min-h-[380px]">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#27272A]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              ATTENDANCE MONITOR
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              (&ge;{minThreshold}%)
            </span>
          </div>
          <Link
            to="/student/academics?tab=attendance"
            className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 active:scale-95 transition-transform duration-150 min-h-[36px] py-1"
          >
            <span>All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {studentAttendance.length === 0 ? (
          <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden rounded-b-2xl px-6 py-10 text-center my-auto">
            {/* SVG Background Layer */}
            <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/60 via-white to-indigo-50/40 dark:from-blue-950/25 dark:via-slate-900 dark:to-indigo-950/20" />
              <svg
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-36 opacity-[0.08]"
                viewBox="0 0 240 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M 0 120 A 120 120 0 0 1 240 120" stroke="#1D4ED8" strokeWidth="1.2" className="dark:stroke-[#60A5FA]" strokeDasharray="4 4" />
                <path d="M 30 120 A 90 90 0 0 1 210 120" stroke="#0F2544" strokeWidth="1.2" className="dark:stroke-[#94A3B8]" />
                <path d="M 60 120 A 60 60 0 0 1 180 120" stroke="#1D4ED8" strokeWidth="1.2" className="dark:stroke-[#60A5FA]" strokeDasharray="4 4" />
                <path d="M 90 120 A 30 30 0 0 1 150 120" stroke="#15803D" strokeWidth="1.2" className="dark:stroke-emerald-400" />
              </svg>
            </div>

            {/* Foreground Empty-State Visual */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* 75% Target Ring Preview */}
              <div className="w-[72px] h-[72px] relative mb-3.5 flex items-center justify-center">
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 72 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="36"
                    cy="36"
                    r="28"
                    stroke="#CBD5E1"
                    className="dark:stroke-slate-700"
                    strokeWidth="3.5"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="28"
                    stroke="#1D4ED8"
                    className="dark:stroke-blue-400"
                    strokeWidth="3.5"
                    strokeDasharray="131.95 175.93"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold font-mono text-[#0F2544] dark:text-slate-100 tabular-nums">
                    &ge;75%
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-[#0F2544] dark:text-slate-100">
                No attendance records logged
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Course logs will appear here
              </p>
              <Link
                to="/student/academics?tab=attendance"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-slate-800/80 text-[#0F2544] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
              >
                <span>View Course Attendance</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
              {lowAttendance.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{lowAttendance.length} {lowAttendance.length === 1 ? 'course' : 'courses'} below {minThreshold}% mandatory threshold</span>
                </div>
              )}

              <div className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {analyses.slice(0, 4).map(item => (
                  <div key={item.courseId} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.course.code}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                          {item.course.name}
                        </span>
                      </div>
                      <span className={`text-xs font-bold tabular-nums font-mono ${
                        item.isBelowThreshold ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {item.percentage}%
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.isBelowThreshold ? 'bg-rose-500' : 'bg-teal-700'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      <span>Attended {item.attended}/{item.total} hrs</span>
                      {item.isBelowThreshold && (
                        <span className="text-rose-600 dark:text-rose-400">Shortfall: need {item.classesToAttend} classes</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {studentAttendance.length > 0 && (
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <span>{analyses.length} courses tracked</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Audit verified</span>
          </span>
        </div>
      )}
    </div>
  );
};
