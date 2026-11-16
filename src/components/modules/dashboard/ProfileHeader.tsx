import React from 'react';
import { useApp } from '../../../context/AppContext';
import { APP_CONFIG } from '../../../config';
import { ShieldCheck, Calendar, BookOpen, AlertCircle, UserCheck } from 'lucide-react';
import { AcademicService } from '../../../services/academicService';

export const ProfileHeader: React.FC = () => {
  const { student, attendance, assignments, courses } = useApp();

  const minThreshold = student?.attendanceMinimum || APP_CONFIG.defaultAttendanceThreshold;
  const analyses = AcademicService.analyzeAttendance(attendance, courses, minThreshold);
  const lowAttendance = analyses.filter(a => a.isBelowThreshold);
  const pendingDue = assignments.filter(a => a.status === 'pending' || a.status === 'overdue');

  return (
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-4 sm:p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-teal-700 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm font-mono">
            {student?.avatarInitials || 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {student?.name || 'Enrolled Student'}
              </h2>
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] px-2 py-0.5 rounded">
                {student?.rollNumber || 'ID Pending'}
              </span>
              <span className="text-xs font-medium text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded">
                {student?.program || 'B.Tech'} {student?.department || 'Computer Science & Engineering'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Semester {student?.semester || 5} ({student?.section || 'Section A'}) • Academic Year {student?.academicYear || APP_CONFIG.academicSession} • {APP_CONFIG.collegeName}
            </p>
          </div>
        </div>

        {/* Right: Quick glance stats */}
        <div className="flex items-center gap-3 sm:gap-4 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-[#27272A] pt-3 sm:pt-0 sm:pl-5 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Enrolled Courses</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm tabular-nums">
              {courses.length}
            </span>
          </div>

          <div className="border-l border-slate-200 dark:border-[#27272A] pl-3 sm:pl-4">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Attendance Alert</span>
            {attendance.length === 0 ? (
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-sm">
                No logs yet
              </span>
            ) : lowAttendance.length > 0 ? (
              <span className="font-semibold text-rose-700 dark:text-rose-400 text-sm tabular-nums flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {lowAttendance.length} {lowAttendance.length === 1 ? 'course' : 'courses'}
              </span>
            ) : (
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> All &ge; {minThreshold}%
              </span>
            )}
          </div>

          <div className="border-l border-slate-200 dark:border-[#27272A] pl-3 sm:pl-4">
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Pending Work</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm tabular-nums">
              {pendingDue.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
