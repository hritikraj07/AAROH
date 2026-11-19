import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import {
  ClipboardCheck,
  Check,
  X,
  Users,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  QrCode
} from 'lucide-react';
import { ClassSession } from '../../types';
import { FacultyQRSessionModal } from '../../components/modules/attendance/FacultyQRSessionModal';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

export const FacultyAttendancePage: React.FC = () => {
  const { user, courses, timetable, users, attendance, recordBatchAttendance, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Find classes assigned to this faculty member
  const facultyClasses = useMemo(() => {
    const list = timetable.filter(s => {
      if (user?.email && s.facultyEmail && s.facultyEmail.toLowerCase() === user.email.toLowerCase()) {
        return true;
      }
      if (user?.name && s.facultyName && (s.facultyName.toLowerCase().includes(user.name.toLowerCase()) || user.name.toLowerCase().includes(s.facultyName.toLowerCase()))) {
        return true;
      }
      return false;
    });
    return list.length > 0 ? list : timetable;
  }, [timetable, user]);

  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

  // Selected class session
  const initialSessionId = searchParams.get('sessionId') || facultyClasses[0]?.id || '';
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId);

  // Sync state if initialSessionId or facultyClasses change
  useEffect(() => {
    if (initialSessionId) {
      setSelectedSessionId(initialSessionId);
    } else if (facultyClasses.length > 0 && !selectedSessionId) {
      setSelectedSessionId(facultyClasses[0].id);
    }
  }, [initialSessionId, facultyClasses, selectedSessionId]);

  const selectedSession: ClassSession | undefined = facultyClasses.find(s => s.id === selectedSessionId) || facultyClasses[0];
  const selectedCourse = selectedSession ? courseMap.get(selectedSession.courseId) : undefined;

  // Filter enrolled students for selected session based on Program, Semester, or Faculty Assigned Course
  const enrolledStudents = useMemo(() => {
    if (!selectedSession) return [];

    const students = users.filter(u => u.role === 'student');
    const targetCourse = user?.course || selectedSession.program || '';

    // Filter by program and semester if present on session
    const matched = students.filter(st => {
      const prog = st.course || st.program || '';
      if (targetCourse && prog) {
        const progMatch =
          prog.toLowerCase().includes(targetCourse.toLowerCase()) ||
          targetCourse.toLowerCase().includes(prog.toLowerCase());
        if (!progMatch) return false;
      }
      if (selectedSession.semester && st.semester) {
        if (Number(st.semester) !== Number(selectedSession.semester)) return false;
      }
      return true;
    });

    return matched.length > 0 ? matched : students;
  }, [selectedSession, users, user?.course]);

  // Attendance Marks State: studentId -> boolean (true = present, false = absent)
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [qrVerifiedStudentIds, setQrVerifiedStudentIds] = useState<Set<string>>(new Set());

  // Reset marks whenever selected session or enrolled students change
  useEffect(() => {
    const initialMarks: Record<string, boolean> = {};
    enrolledStudents.forEach(st => {
      initialMarks[st.id] = true; // default all present
    });
    setMarks(initialMarks);
    setQrVerifiedStudentIds(new Set());
  }, [selectedSessionId, enrolledStudents]);

  // Real-time synchronization: Poll and listen to storage events for QR scans
  useEffect(() => {
    if (!selectedSession) return;

    const syncQRScans = () => {
      try {
        const scansRaw = localStorage.getItem('aaroh_qr_attendance_scans');
        if (!scansRaw) return;
        const scans: Array<{ studentId: string; classId?: string; courseId?: string; timestamp: number }> = JSON.parse(scansRaw);

        const matchingScans = scans.filter(
          s => s.classId === selectedSession.id || s.courseId === selectedSession.courseId
        );

        if (matchingScans.length > 0) {
          const verifiedIds = new Set(matchingScans.map(s => s.studentId));
          setQrVerifiedStudentIds(prev => {
            let changed = false;
            const updated = new Set(prev);
            verifiedIds.forEach(id => {
              if (!updated.has(id)) {
                updated.add(id);
                changed = true;
              }
            });
            return changed ? updated : prev;
          });

          // Automatically mark Present in manual roster
          setMarks(prev => {
            let changed = false;
            const updated = { ...prev };
            verifiedIds.forEach(id => {
              if (updated[id] !== true) {
                updated[id] = true;
                changed = true;
              }
            });
            return changed ? updated : prev;
          });
        }
      } catch {
        // ignore
      }
    };

    syncQRScans();
    const interval = setInterval(syncQRScans, 1000);
    window.addEventListener('storage', syncQRScans);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncQRScans);
    };
  }, [selectedSession]);

  const toggleStudent = (studentId: string, isPresent: boolean) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: isPresent,
    }));
  };

  const markAll = (isPresent: boolean) => {
    const updated: Record<string, boolean> = {};
    enrolledStudents.forEach(st => {
      updated[st.id] = isPresent;
    });
    setMarks(updated);
  };

  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    setIsSubmitting(true);

    const studentMarks = enrolledStudents.map(st => ({
      studentId: st.id,
      isPresent: marks[st.id] ?? true,
    }));

    recordBatchAttendance(selectedSession.courseId, studentMarks);

    setIsSubmitting(false);
  };

  // Stats calculation
  const totalEnrolled = enrolledStudents.length;
  const presentCount = enrolledStudents.filter(st => marks[st.id] !== false).length;
  const absentCount = totalEnrolled - presentCount;
  const attendanceRate = totalEnrolled > 0 ? (presentCount / totalEnrolled) * 100 : 0;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Lecture Attendance & Roll Call
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log official class attendance, toggle student presence, and update student portal metrics in real-time.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2 font-mono text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Faculty: {user?.full_name || user?.name || 'Faculty Member'} ({user?.username || 'FAC101'})
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-sans">
              Course: {user?.course || 'B.Tech CSE'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-sans">
              Division: {user?.division || 'A'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3 py-1.5 rounded-md">
          <Calendar className="w-3.5 h-3.5 text-[#134074] dark:text-[#8DA9C4]" />
          <span>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {facultyClasses.length === 0 ? (
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No Teaching Sessions Assigned</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            There are currently no timetable sessions linked to your faculty profile. Please contact the Academic Registrar or add sessions in the admin portal.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Class Selector Bar */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Select Teaching Class
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSession?.id || ''}
                    onChange={e => {
                      setSelectedSessionId(e.target.value);
                      setSearchParams({ sessionId: e.target.value });
                    }}
                    className="text-xs font-sans font-medium px-3 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700 w-full sm:w-auto min-w-[280px]"
                  >
                    {facultyClasses.map(session => {
                      const course = courseMap.get(session.courseId);
                      const code = session.courseCode || course?.code || 'CRS';
                      const name = session.courseName || course?.name || 'Course';
                      const dayName = dayNames[session.dayOfWeek];
                      return (
                        <option key={session.id} value={session.id}>
                          {code} - {name} ({dayName} {session.startTime}, {session.room})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {selectedSession && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-md font-mono flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-[#134074]">
                      <BookOpen className="w-3.5 h-3.5" />
                      {selectedSession.courseCode || selectedCourse?.code || 'CRS'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {selectedSession.startTime} - {selectedSession.endTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedSession.room}
                    </span>
                    <span>•</span>
                    <span className="font-sans font-medium text-slate-700">
                      {selectedSession.program || 'B.Tech CSE'}{' '}
                      {selectedSession.semester ? `(Sem ${selectedSession.semester})` : ''}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQROpen(true)}
                    className={`px-3.5 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] rounded-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap border border-[#8DA9C4]/30 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Generate QR (Start QR Session)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Roster & Roll Call Table */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-[#27272A] bg-slate-50/70 dark:bg-[#111115] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#134074] dark:text-[#8DA9C4]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Enrolled Roster ({enrolledStudents.length} Students)
                  </span>
                </div>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-[#27272A]">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Present: <strong className="text-emerald-700 dark:text-emerald-400">{presentCount}</strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Absent: <strong className="text-rose-700 dark:text-rose-400">{absentCount}</strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Rate: <strong className="text-slate-900 dark:text-slate-100">{attendanceRate.toFixed(0)}%</strong>
                  </span>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => markAll(true)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-white dark:bg-[#18181B] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>All Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => markAll(false)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-white dark:bg-[#18181B] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>All Absent</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            {enrolledStudents.length === 0 ? (
              <div className="py-12 text-center p-6 space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-800">No students enrolled</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  No registered student accounts match {selectedSession?.program || 'this program'}{' '}
                  {selectedSession?.semester ? `Semester ${selectedSession.semester}` : ''}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAttendance}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono uppercase text-[10px]">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4 w-28">Roll No</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4 w-36">Section / Program</th>
                        <th className="py-3 px-4 w-36 text-center">Subject Attendance</th>
                        <th className="py-3 px-4 w-52 text-right">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {enrolledStudents.map((st, index) => {
                        const isPresent = marks[st.id] !== false;

                        // Find current attendance record for this student and course
                        const stRec = attendance.find(
                          a =>
                            a.courseId === selectedSession?.courseId &&
                            (a.studentId === st.id || a.studentEmail === st.email)
                        );

                        const totalClasses = stRec?.total || 0;
                        const attendedClasses = stRec?.attended || 0;
                        const currPct = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;
                        const isShort = totalClasses > 0 && currPct < 75;

                        return (
                          <tr
                            key={st.id}
                            className={`hover:bg-slate-50/60 transition-colors ${
                              !isPresent ? 'bg-rose-50/30' : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-center font-mono text-slate-400">
                              {index + 1}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                              {st.rollNumber || `22CS${String(index + 1).padStart(3, '0')}`}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-[10px] font-mono flex items-center justify-center font-semibold">
                                  {st.avatarInitials || st.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{st.name}</span>
                                    {qrVerifiedStudentIds.has(st.id) && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3" />
                                        QR Verified
                                      </span>
                                    )}
                                  </div>
                                  <span className="block text-[10px] text-slate-400 font-mono">
                                    {st.email}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              <span className="text-[11px] font-sans">
                                {st.program || selectedSession?.program || 'B.Tech CSE'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                Sem {st.semester || selectedSession?.semester || 5} • Sec {st.section || 'A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {totalClasses === 0 ? (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  No previous logs
                                </span>
                              ) : (
                                <div className="inline-flex flex-col items-center">
                                  <span
                                    className={`font-mono font-bold text-xs tabular-nums ${
                                      isShort ? 'text-rose-700' : 'text-emerald-700'
                                    }`}
                                  >
                                    {currPct.toFixed(1)}%
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                                    ({attendedClasses}/{totalClasses} hrs)
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex rounded-md p-0.5 bg-slate-100 border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => toggleStudent(st.id, true)}
                                  className={`px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1 ${
                                    isPresent
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Present</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleStudent(st.id, false)}
                                  className={`px-3 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1 ${
                                    !isPresent
                                      ? 'bg-rose-600 text-white shadow-sm'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  <X className="w-3 h-3" />
                                  <span>Absent</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Submit Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#134074] shrink-0" />
                    <span>
                      Submitting updates the permanent student attendance registry immediately in local storage.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      icon={<ClipboardCheck className="w-4 h-4" />}
                      disabled={isSubmitting || enrolledStudents.length === 0}
                    >
                      {isSubmitting ? 'Recording Roll Call...' : 'Save & Submit Roll Call'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Faculty QR Attendance Modal */}
      {selectedSession && (
        <FacultyQRSessionModal
          isOpen={isQROpen}
          session={selectedSession}
          onClose={() => setIsQROpen(false)}
        />
      )}
    </div>
  );
};

export default FacultyAttendancePage;
