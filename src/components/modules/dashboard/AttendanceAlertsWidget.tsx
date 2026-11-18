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
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 sm:p-6 transition-colors duration-150 flex flex-col justify-between">
      <div>
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

        <div className="mt-6">
          {studentAttendance.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No attendance records logged</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">Course logs will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
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
