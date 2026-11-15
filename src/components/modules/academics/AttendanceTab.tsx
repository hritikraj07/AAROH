import React from 'react';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import { Badge } from '../../ui/Badge';
import { AlertCircle, CheckCircle2, Sliders, Calendar } from 'lucide-react';
import { APP_CONFIG } from '../../../config';

export const AttendanceTab: React.FC = () => {
  const { attendance, courses, student, updateAttendanceThreshold } = useApp();
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

  const totalAttended = studentAttendance.reduce((acc, curr) => acc + curr.attended, 0);
  const totalHeld = studentAttendance.reduce((acc, curr) => acc + curr.total, 0);
  const overallPercentage = totalHeld > 0 ? Number(((totalAttended / totalHeld) * 100).toFixed(1)) : 0;
  const belowCount = analyses.filter(a => a.isBelowThreshold).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Configurator */}
      <div className="bg-white border border-border rounded-lg p-4 sm:p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Metric Glance */}
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Cumulative Attendance
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {totalHeld > 0 ? `${overallPercentage}%` : '—'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({totalAttended} / {totalHeld} Total Hours)
              </span>
            </div>
          </div>

          <div className="border-l border-border pl-6">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Shortfall Status
            </span>
            <div className="mt-1">
              {studentAttendance.length === 0 ? (
                <span className="text-xs text-slate-500">No active course logs</span>
              ) : belowCount > 0 ? (
                <Badge variant="rose" size="md" dot>
                  {belowCount} {belowCount === 1 ? 'Course' : 'Courses'} Below {minThreshold}%
                </Badge>
              ) : (
                <Badge variant="emerald" size="md" dot>
                  All Courses Eligible
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Configurable Threshold Bar */}
        <div className="p-3 bg-slate-50 border border-border rounded-md flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Sliders className="w-3.5 h-3.5 text-teal-700" />
            <span>Target Threshold:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[70, 75, 80, 85].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => updateAttendanceThreshold(val)}
                className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                  minThreshold === val
                    ? 'bg-teal-700 text-white border-teal-700 shadow-subtle'
                    : 'bg-white text-slate-700 border-border hover:bg-slate-100'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Attendance Table / Empty State */}
      <div className="bg-white border border-border rounded-lg shadow-subtle overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Course-Wise Attendance Breakdown
          </h3>
          <span className="text-xs text-slate-500">
            Current Regulation: Minimum {minThreshold}% mandatory for exam hall ticket
          </span>
        </div>

        {analyses.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">No attendance logs found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
              Course attendance percentages and shortfall warnings will populate once course registrations are finalized and classes begin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/80 text-slate-500 font-medium">
                  <th className="py-3 px-4 w-28">Code</th>
                  <th className="py-3 px-4">Course Name & Faculty</th>
                  <th className="py-3 px-4 w-28 text-center">Attended</th>
                  <th className="py-3 px-4 w-48">Progress & Target ({minThreshold}%)</th>
                  <th className="py-3 px-4 w-24 text-right">Percentage</th>
                  <th className="py-3 px-4 w-60">Status & Remediation Hint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analyses.map(item => {
                  const isShort = item.isBelowThreshold;
                  return (
                    <tr
                      key={item.courseId}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isShort ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Course Code */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {item.course.code}
                      </td>

                      {/* Course Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.course.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.course.facultyName} • {item.course.credits} Credits • {item.course.roomDefault}
                        </div>
                      </td>

                      {/* Attended Hours */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-700">
                        <span className="font-bold text-slate-900">{item.attended}</span> / {item.total}
                      </td>

                      {/* Progress Bar against Threshold */}
                      <td className="py-3 px-4">
                        <div className="relative w-full">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isShort ? 'bg-rose-500' : 'bg-teal-600'
                              }`}
                              style={{ width: `${Math.min(100, item.percentage)}%` }}
                            />
                          </div>
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-400/80 -mt-0.5 -mb-0.5 z-10"
                            style={{ left: `${minThreshold}%` }}
                            title={`Target: ${minThreshold}%`}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                          <span>0%</span>
                          <span className="text-slate-600 font-medium">Target: {minThreshold}%</span>
                          <span>100%</span>
                        </div>
                      </td>

                      {/* Percentage */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm tabular-nums">
                        <span className={isShort ? 'text-rose-600' : 'text-slate-900'}>
                          {item.percentage}%
                        </span>
                      </td>

                      {/* Status & Remediation Math */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {isShort ? (
                            <div className="space-y-0.5">
                              <Badge variant="rose" size="sm" dot>
                                Defaulter Alert
                              </Badge>
                              <p className="text-[11px] font-medium text-rose-700 leading-tight">
                                {item.hint}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <Badge variant="emerald" size="sm" dot>
                                Eligible
                              </Badge>
                              <p className="text-[11px] text-emerald-800 leading-tight font-medium">
                                {item.hint}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Policy Notes */}
        <div className="p-4 border-t border-border bg-slate-50 text-[11px] text-slate-500 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Ordinance Note:</strong> As per Academic Regulations Section 4.2, students with attendance below {minThreshold}% in any subject are debarred from appearing in the Semester End Examinations unless an approved Medical Certificate or On-Duty (OD) form has been officially endorsed by the Head of Department.
          </p>
        </div>
      </div>
    </div>
  );
};
