import React from 'react';
import { useApp } from '../../../context/AppContext';
import { APP_CONFIG } from '../../../config';
import { ShieldCheck, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { AcademicService } from '../../../services/academicService';

export const ProfileHeader: React.FC = () => {
  const { student, attendance, assignments, courses } = useApp();

  const analyses = AcademicService.analyzeAttendance(attendance, courses, student.attendanceMinimum);
  const lowAttendance = analyses.filter(a => a.isBelowThreshold);
  const pendingDue = assignments.filter(a => a.status === 'pending' || a.status === 'overdue');

  return (
    <div className="bg-white border border-border rounded-lg p-4 sm:p-5 shadow-subtle mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-teal-700 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
            {student.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {student.name}
              </h2>
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {student.rollNumber}
              </span>
              <span className="text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                {student.program} {student.department}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Semester {student.semester} ({student.section}) • Academic Year {student.academicYear} • {APP_CONFIG.collegeName}
            </p>
          </div>
        </div>

        {/* Right: Quick glance stats */}
        <div className="flex items-center gap-3 sm:gap-4 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-5 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Enrolled Courses</span>
            <span className="font-semibold text-slate-900 text-sm tabular-nums">
              {courses.length}
            </span>
          </div>

          <div className="border-l border-border pl-3 sm:pl-4">
            <span className="text-slate-400 block text-[11px]">Attendance Alert</span>
            {lowAttendance.length > 0 ? (
              <span className="font-semibold text-rose-700 text-sm tabular-nums flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {lowAttendance.length} {lowAttendance.length === 1 ? 'course' : 'courses'}
              </span>
            ) : (
              <span className="font-semibold text-emerald-700 text-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> All &ge; {student.attendanceMinimum}%
              </span>
            )}
          </div>

          <div className="border-l border-border pl-3 sm:pl-4">
            <span className="text-slate-400 block text-[11px]">Pending Work</span>
            <span className="font-semibold text-slate-900 text-sm tabular-nums">
              {pendingDue.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
