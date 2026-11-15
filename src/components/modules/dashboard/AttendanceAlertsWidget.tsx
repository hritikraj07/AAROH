import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import { Badge } from '../../ui/Badge';
import { APP_CONFIG } from '../../../config';

export const AttendanceAlertsWidget: React.FC = () => {
  const { attendance, courses, student } = useApp();
  const minThreshold = student?.attendanceMinimum || APP_CONFIG.defaultAttendanceThreshold;

  // Filter attendance records specifically for the logged-in student
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
  const safeAttendance = analyses.filter(a => !a.isBelowThreshold);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2">
          {studentAttendance.length === 0 ? (
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          ) : lowAttendance.length > 0 ? (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Attendance Status
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            (&ge;{minThreshold}% Req.)
          </span>
        </div>
        <Link
          to="/student/academics?tab=attendance"
          className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
        >
          <span>All Subjects</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 space-y-3 flex flex-col justify-between">
        {studentAttendance.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-800">No attendance records logged</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed">
              Course attendance percentages and shortfall warnings will appear once faculty records session hours.
            </p>
          </div>
        ) : lowAttendance.length > 0 ? (
          <div className="space-y-3">
            <div className="p-2.5 rounded-md bg-rose-50/60 border border-rose-200/80 text-xs text-rose-900">
              <span className="font-semibold">
                {lowAttendance.length} {lowAttendance.length === 1 ? 'subject requires' : 'subjects require'} immediate attendance recovery:
              </span>
            </div>

            {lowAttendance.map(item => (
              <div
                key={item.courseId}
                className="p-3 rounded-md border border-rose-200 bg-white space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {item.course.code}
                    </span>
                    <span className="text-xs text-slate-600 truncate max-w-[150px]">
                      {item.course.name}
                    </span>
                  </div>
                  <Badge variant="rose" size="sm" dot>
                    <span className="tabular-nums font-bold">{item.percentage}%</span>
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{item.attended} / {item.total} attended</span>
                    <span className="text-rose-700 font-sans font-medium">{item.hint}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-emerald-800 bg-emerald-50/40 border border-emerald-200/60 rounded-md p-4 my-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold">All subjects are above minimum attendance threshold ({minThreshold}%).</p>
            {analyses.length > 0 && (
              <p className="text-slate-600 text-[11px] mt-1">
                Lowest course is {Math.min(...analyses.map(a => a.percentage))}%
              </p>
            )}
          </div>
        )}

        {/* Safe courses snapshot */}
        {safeAttendance.length > 0 && (
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>{safeAttendance.length} other subjects in good standing</span>
            <Link to="/student/academics?tab=attendance" className="text-teal-700 hover:underline">
              View Breakdown
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
