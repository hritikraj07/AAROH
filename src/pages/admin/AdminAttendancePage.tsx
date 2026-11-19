import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import {
  ClipboardCheck,
  Check,
  X,
  Users,
  BookOpen,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const AdminAttendancePage: React.FC = () => {
  const { courses, timetable, users, attendance, recordBatchAttendance, showToast } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

  // Find all timetable sessions for the selected course
  const courseSessions = useMemo(() => {
    if (!selectedCourseId) return [];
    return timetable.filter(s => s.courseId === selectedCourseId);
  }, [timetable, selectedCourseId]);

  // Keep selected session in sync when course changes
  useEffect(() => {
    if (courseSessions.length > 0) {
      if (!courseSessions.some(s => s.id === selectedSessionId)) {
        setSelectedSessionId(courseSessions[0].id);
      }
    } else {
      setSelectedSessionId('');
    }
  }, [courseSessions, selectedSessionId]);

  const selectedSession = useMemo(() => {
    return courseSessions.find(s => s.id === selectedSessionId) || courseSessions[0];
  }, [courseSessions, selectedSessionId]);

  const selectedCourse = useMemo(() => {
    return courseMap.get(selectedCourseId) || courses[0];
  }, [courseMap, selectedCourseId, courses]);

  // Enrolled students matching session program and semester
  const enrolledStudents = useMemo(() => {
    const students = users.filter(u => u.role === 'student');
    if (!selectedSession) return students;

    const matched = students.filter(st => {
      if (selectedSession.program && st.program) {
        const progMatch =
          st.program.toLowerCase().includes(selectedSession.program.toLowerCase()) ||
          selectedSession.program.toLowerCase().includes(st.program.toLowerCase());
        if (!progMatch) return false;
      }
      if (selectedSession.semester && st.semester) {
        if (Number(st.semester) !== Number(selectedSession.semester)) return false;
      }
      return true;
    });

    return matched.length > 0 ? matched : students;
  }, [selectedSession, users]);

  // Attendance Marks State: studentId -> boolean (true = present, false = absent)
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset marks when session or student list changes
  useEffect(() => {
    const initialMarks: Record<string, boolean> = {};
    enrolledStudents.forEach(st => {
      initialMarks[st.id] = true;
    });
    setMarks(initialMarks);
  }, [selectedSessionId, enrolledStudents]);

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
    if (!selectedCourseId) return;

    setIsSubmitting(true);

    const studentMarks = enrolledStudents.map(st => ({
      studentId: st.id,
      isPresent: marks[st.id] ?? true,
    }));

    recordBatchAttendance(selectedCourseId, studentMarks);
    setIsSubmitting(false);

    showToast({
      type: 'success',
      title: 'Attendance Updated',
      message: `Attendance updated manually for ${selectedCourse?.name || 'Course'} (${selectedSession?.startTime || 'Session'})!`,
    });
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const totalEnrolled = enrolledStudents.length;
  const presentCount = enrolledStudents.filter(st => marks[st.id] !== false).length;
  const absentCount = totalEnrolled - presentCount;
  const attendanceRate = totalEnrolled > 0 ? (presentCount / totalEnrolled) * 100 : 0;

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#134074]/10 dark:bg-[#134074]/30 text-[#134074] dark:text-[#8DA9C4]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Manual Attendance Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Administrative manual attendance update. Select course and class time to record or correct student attendance rosters.
          </p>
        </div>

        {/* Admin notice: No QR generation */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-[#18181B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#27272A]">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Manual Entry Only (QR Restricted to Faculty)</span>
        </div>
      </div>

      {/* Selector Controls: Course, Date, and Class Time */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
          Select Class Session & Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Select Course */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Course / Subject
            </label>
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#134074]"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Attendance Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#134074]"
              />
            </div>
          </div>

          {/* 3. Select Class Time / Session */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Class Time & Room
            </label>
            {courseSessions.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-slate-400 bg-slate-50 dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl font-mono">
                No scheduled sessions found
              </div>
            ) : (
              <select
                value={selectedSession?.id || ''}
                onChange={e => setSelectedSessionId(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#134074]"
              >
                {courseSessions.map(session => {
                  const dayName = dayNames[session.dayOfWeek] || 'Day';
                  return (
                    <option key={session.id} value={session.id}>
                      {dayName} • {session.startTime} - {session.endTime} (Room {session.room})
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        {/* Selected Session Metadata Strip */}
        {selectedSession && (
          <div className="pt-3 border-t border-slate-100 dark:border-[#27272A] flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-[#134074] dark:text-[#8DA9C4]">
              <BookOpen className="w-3.5 h-3.5" />
              {selectedCourse?.code || selectedSession.courseCode}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {selectedSession.startTime} - {selectedSession.endTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Room {selectedSession.room}
            </span>
            <span>•</span>
            <span className="font-sans font-medium text-slate-700 dark:text-slate-300">
              {selectedSession.program || 'B.Tech CSE'}{' '}
              {selectedSession.semester ? `(Sem ${selectedSession.semester})` : ''}
            </span>
            {selectedSession.facultyName && (
              <>
                <span>•</span>
                <span className="font-sans text-slate-500">
                  Faculty: {selectedSession.facultyName}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Student Roster & Attendance Table */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl overflow-hidden shadow-sm">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-[#27272A] bg-slate-50/70 dark:bg-[#111115] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#134074] dark:text-[#8DA9C4]" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Enrolled Students ({enrolledStudents.length})
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
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#18181B] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>All Present</span>
            </button>
            <button
              type="button"
              onClick={() => markAll(false)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#18181B] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 transition-colors flex items-center gap-1 shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              <span>All Absent</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {enrolledStudents.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-2">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">No students enrolled</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              No registered students match this program and semester.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitAttendance}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#0E0E11] text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-28">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 w-36">Section / Program</th>
                    <th className="py-3 px-4 w-36 text-center">Historical Attendance</th>
                    <th className="py-3 px-4 w-52 text-right">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                  {enrolledStudents.map((st, index) => {
                    const isPresent = marks[st.id] !== false;

                    const stRec = attendance.find(
                      a =>
                        a.courseId === selectedCourseId &&
                        (a.studentId === st.id || a.studentEmail === st.email)
                    );

                    const totalClasses = stRec?.total || 0;
                    const attendedClasses = stRec?.attended || 0;
                    const currPct = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;
                    const isShort = totalClasses > 0 && currPct < 75;

                    return (
                      <tr
                        key={st.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-[#202025] transition-colors ${
                          !isPresent ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {st.rollNumber || `22CS${String(index + 1).padStart(3, '0')}`}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 text-[10px] font-mono flex items-center justify-center font-semibold">
                              {st.avatarInitials || st.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold">{st.name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">
                                {st.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          <span className="text-[11px] font-sans">
                            {st.program || selectedSession?.program || 'B.Tech CSE'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Sem {st.semester || selectedSession?.semester || 1} • Sec {st.section || 'A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {totalClasses === 0 ? (
                            <span className="text-[11px] text-slate-400 font-mono">
                              No prior records
                            </span>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`font-mono font-bold text-xs tabular-nums ${
                                  isShort ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
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
                          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A]">
                            <button
                              type="button"
                              onClick={() => toggleStudent(st.id, true)}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                                isPresent
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>Present</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStudent(st.id, false)}
                              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                                !isPresent
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
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
            <div className="p-4 bg-slate-50 dark:bg-[#0E0E11] border-t border-slate-200 dark:border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#134074] dark:text-[#8DA9C4] shrink-0" />
                <span>
                  Admin override mode: updates will immediately sync to student academic records.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<ClipboardCheck className="w-4 h-4" />}
                  disabled={isSubmitting || enrolledStudents.length === 0}
                  className="bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white"
                >
                  {isSubmitting ? 'Updating Attendance...' : 'Save Attendance Records'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminAttendancePage;
