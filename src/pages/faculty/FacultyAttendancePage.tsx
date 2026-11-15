import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import {
  ClipboardCheck,
  Check,
  X,
  Plus,
  AlertTriangle,
  BookOpen,
  Calendar,
  Users
} from 'lucide-react';

export const FacultyAttendancePage: React.FC = () => {
  const { courses, attendance, recordAttendanceEntry } = useApp();
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('course') || courses[0]?.id || '';
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const courseRecord = attendance.find(a => a.courseId === selectedCourse?.id);

  const attended = courseRecord?.attended || 0;
  const total = courseRecord?.total || 0;
  const percentage = total > 0 ? (attended / total) * 100 : 100;
  const isLow = total > 0 && percentage < 75;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Lecture Attendance Logger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log official lecture attendance sessions, record roll calls, and monitor student threshold compliance.
          </p>
        </div>

        {courses.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Select Subject:</span>
            <select
              value={selectedCourse?.id || ''}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="text-xs font-mono px-3 py-1.5 bg-white border border-border rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-10 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No courses available for attendance</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Please assign courses to the curriculum first to start logging lecture attendance.
          </p>
        </div>
      ) : !selectedCourse ? (
        <div className="bg-white border border-border rounded-lg p-8 text-center text-xs text-slate-500">
          Select a course from the dropdown above to view and log attendance.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Session Action & Roster Simulation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Session Logger Card */}
            <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-teal-800" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Log Lecture Session for {selectedCourse.code}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Log a completed class session to immediately increment student attendance records and update regulatory compliance metrics in real-time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => recordAttendanceEntry(selectedCourse.id, 1, 1)}
                  className="p-4 rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-50 text-left transition-colors flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded bg-teal-700 text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-teal-950 block">
                      Record Full Session (Present)
                    </span>
                    <span className="text-[11px] text-teal-800 mt-0.5 block">
                      Increments both Attended (+1) and Total Conducted (+1)
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => recordAttendanceEntry(selectedCourse.id, 0, 1)}
                  className="p-4 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-50 text-left transition-colors flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <X className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-950 block">
                      Record Absence / Missed
                    </span>
                    <span className="text-[11px] text-rose-800 mt-0.5 block">
                      Increments Total Conducted (+1) without marking present
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Simulated Student Roll Call Roster */}
            <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Enrolled Class Roster ({selectedCourse.code})
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Section A • Sem 5</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-slate-400 font-mono uppercase text-[10px]">
                      <th className="py-2 px-3">Roll No</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">Overall %</th>
                      <th className="py-2 px-3 text-right">Quick Mark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { roll: '22CS001', name: 'Aarav Sharma', pct: total > 0 ? percentage : 85 },
                      { roll: '22CS014', name: 'Devika Patel', pct: 92 },
                      { roll: '22CS027', name: 'Kavya Rao', pct: 72 },
                      { roll: '22CS042', name: 'Rohan Verma', pct: 68 },
                      { roll: '22CS059', name: 'Siddharth Iyer', pct: 88 },
                    ].map(st => (
                      <tr key={st.roll} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{st.roll}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{st.name}</td>
                        <td className="py-2.5 px-3 font-mono">
                          <span
                            className={`font-semibold ${
                              st.pct < 75 ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {st.pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1">
                          <button
                            onClick={() => recordAttendanceEntry(selectedCourse.id, 1, 1)}
                            className="px-2 py-0.5 text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded font-semibold transition-colors"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => recordAttendanceEntry(selectedCourse.id, 0, 1)}
                            className="px-2 py-0.5 text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded font-semibold transition-colors"
                          >
                            Absent
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Col: Course Metric Summary */}
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Attendance Metrics
              </h3>

              <div className="p-4 bg-slate-50 border border-border rounded-md text-center space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Class Attendance Rate</span>
                <div
                  className={`text-3xl font-bold font-mono ${
                    isLow ? 'text-rose-700' : 'text-slate-900'
                  }`}
                >
                  {total > 0 ? `${percentage.toFixed(1)}%` : 'No Sessions'}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  {attended} present / {total} total conducted
                </div>
              </div>

              {/* Progress Bar against 75% minimum */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Threshold Progress</span>
                  <span className="font-semibold text-slate-700">75% Min. Required</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-border">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isLow ? 'bg-rose-600' : 'bg-teal-700'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>

              {isLow && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Attendance is currently below the mandatory 75% UGC institutional cutoff.
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-border space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Curriculum Credits:</span>
                  <span className="font-semibold font-mono">{selectedCourse.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Hall:</span>
                  <span className="font-semibold font-mono">{selectedCourse.roomDefault}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Faculty In-Charge:</span>
                  <span className="font-semibold">{selectedCourse.facultyName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAttendancePage;
