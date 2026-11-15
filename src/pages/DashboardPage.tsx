import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Briefcase,
  ShieldCheck,
  PlusCircle,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Focus,
  FileText,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';
import { AcademicService } from '../services/academicService';
import { ClassSession } from '../types';
import { TodayClassesCard } from '../components/modules/dashboard/TodayClassesCard';
import { AttendanceAlertsWidget } from '../components/modules/dashboard/AttendanceAlertsWidget';
import { WeekAssignmentsWidget } from '../components/modules/dashboard/WeekAssignmentsWidget';
import { PinnedNoticesWidget } from '../components/modules/dashboard/PinnedNoticesWidget';
import { UpcomingEventsWidget } from '../components/modules/dashboard/UpcomingEventsWidget';
import { ReportLostFoundModal } from '../components/modules/lostfound/ReportLostFoundModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const {
    user,
    student,
    attendance,
    courses,
    timetable,
    assignments,
    opportunities,
    showToast,
  } = useApp();

  // 1. Attendance KPI
  const minThreshold = student?.attendanceMinimum || APP_CONFIG.defaultAttendanceThreshold;
  const studentAttendance = attendance.filter(rec => {
    if (student?.id && rec.studentId) return rec.studentId === student.id;
    if (!rec.studentId) {
      return !attendance.some(a => a.courseId === rec.courseId && a.studentId === student?.id);
    }
    return false;
  });
  const analyses = AcademicService.analyzeAttendance(studentAttendance, courses, minThreshold);
  const totalAttended = analyses.reduce((acc, c) => acc + c.attended, 0);
  const totalHours = analyses.reduce((acc, c) => acc + c.total, 0);
  const overallPct = totalHours > 0 ? Math.round((totalAttended / totalHours) * 100) : null;
  const lowAttendanceCount = analyses.filter(a => a.isBelowThreshold).length;

  // 2. Classes KPI (filtered for cohort)
  const filteredTimetable = timetable.filter(s => {
    if (user?.role === 'student') {
      if (s.program && user.program && !s.program.toLowerCase().includes(user.program.toLowerCase()) && !user.program.toLowerCase().includes(s.program.toLowerCase())) {
        return false;
      }
      if (s.semester && user.semester && Number(s.semester) !== Number(user.semester)) {
        return false;
      }
    }
    return true;
  });
  const now = new Date();
  const todaySessions = AcademicService.getSessionsForDay(filteredTimetable, now.getDay());
  const upcomingInfo = AcademicService.getNextUpcomingClass(filteredTimetable, now);

  // 3. Context-Aware Focus Mode Logic
  // Checks current system time against student's timetable array
  const [activeClassSession, setActiveClassSession] = useState<ClassSession | null>(null);
  const [isSimulatedFocus, setIsSimulatedFocus] = useState(false);

  useEffect(() => {
    const checkCurrentClassSchedule = () => {
      const currentDate = new Date();
      const currentDay = currentDate.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
      const currentHours = currentDate.getHours();
      const currentMinutes = currentDate.getMinutes();
      const currentMinutesTotal = currentHours * 60 + currentMinutes;

      const parseTimeToMinutes = (timeStr?: string): number => {
        if (!timeStr) return 0;
        const parts = timeStr.trim().split(':');
        if (parts.length < 2) return 0;
        return Number(parts[0]) * 60 + Number(parts[1]);
      };

      // Check if student is currently inside a scheduled class time block
      const inSession = filteredTimetable.find(slot => {
        if (slot.dayOfWeek !== currentDay) return false;
        const startMin = parseTimeToMinutes(slot.startTime);
        const endMin = parseTimeToMinutes(slot.endTime);
        return currentMinutesTotal >= startMin && currentMinutesTotal <= endMin;
      });

      setActiveClassSession(inSession || null);
    };

    checkCurrentClassSchedule();
    const intervalTimer = setInterval(checkCurrentClassSchedule, 15000);
    return () => clearInterval(intervalTimer);
  }, [filteredTimetable]);

  const isSystemInClass = Boolean(activeClassSession);
  const isFocusMode = isSystemInClass || isSimulatedFocus;

  // Active class session for Focus Mode display
  const activeFocusSession: ClassSession | null = activeClassSession || (isSimulatedFocus ? (filteredTimetable[0] || {
    id: 'sim_focus_class',
    courseId: courses[0]?.id || 'cs_core',
    courseCode: courses[0]?.code || 'CS301',
    courseName: courses[0]?.name || 'Operating Systems & System Architecture',
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '11:30',
    room: 'Lab 402',
    facultyName: 'Dr. Aris Thorne',
    type: 'Lecture',
  }) : null);

  const activeCourse = courses.find(c => c.id === activeFocusSession?.courseId);
  const currentSubjectName = activeFocusSession
    ? activeCourse?.name || activeFocusSession.courseName || 'Computer Networks & Distributed Systems'
    : '';

  const handleTakeLiveNotes = () => {
    showToast({
      type: 'info',
      title: 'Live Notes Scratchpad',
      message: `Live notes workspace launched for ${currentSubjectName}.`,
    });
  };

  const handleViewResources = () => {
    showToast({
      type: 'info',
      title: 'Course Resources',
      message: `Loading slides, lecture notes, and reference links for ${currentSubjectName}.`,
    });
  };

  // 4. Coursework KPI
  const pendingAssignments = assignments.filter(a => a.status !== 'submitted');
  const overdueAssignments = assignments.filter(a => a.status === 'overdue');

  // 5. Opportunities KPI
  const savedOppIds = user?.savedOpportunityIds || [];
  const savedOpportunities = opportunities.filter(o => savedOppIds.includes(o.id) || o.isSaved);

  return (
    <div className="space-y-8">
      {/* 0. Context-Aware Focus Mode Banner (Displayed when student is inside class block) */}
      {isFocusMode && (
        <div className="animate-in fade-in zoom-in-95 duration-500 bg-teal-50 border border-teal-200 text-teal-900 px-4 py-3 rounded-lg flex items-center justify-between text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <Focus className="w-4 h-4 text-teal-700 animate-pulse shrink-0" />
            <span>Focus Mode Auto-Activated: Muting non-academic notifications until class ends.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded uppercase tracking-wider">
              {isSystemInClass ? 'Live Class Active' : 'Simulated Session'}
            </span>
            {isSimulatedFocus && !isSystemInClass && (
              <button
                type="button"
                onClick={() => setIsSimulatedFocus(false)}
                className="text-xs text-teal-800 underline hover:text-teal-950 font-medium"
              >
                Exit Demo
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Header & Identity Strip (Zero clutter, crisp typography) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Overview
            </h1>
            <span className="text-xs font-mono font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
              {user?.rollNumber || '22CS042'}
            </span>
            <span className="text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              {user?.program || 'B.Tech'} Sem {user?.semester || 5}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-tight mt-1">
            {APP_CONFIG.collegeName} • Academic Session {APP_CONFIG.academicSession}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Demo helper to test Context-Aware Focus Mode on-demand */}
          {!isSystemInClass && (
            <button
              type="button"
              onClick={() => setIsSimulatedFocus(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-transform duration-150 select-none active:scale-95 ${
                isSimulatedFocus
                  ? 'text-teal-800 bg-teal-50 border-teal-300 font-semibold'
                  : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
              }`}
              title="Test context-aware Focus Mode"
            >
              <Focus className="w-3.5 h-3.5 text-slate-400" />
              <span>{isSimulatedFocus ? 'Exit Focus Demo' : 'Focus Mode Demo'}</span>
            </button>
          )}

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 active:scale-95 transition-transform duration-150 select-none"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Item</span>
          </button>

          <button
            onClick={() => navigate('/student/opportunities')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 active:scale-95 transition-transform duration-150 select-none"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Opportunities</span>
          </button>

          <button
            onClick={() => navigate('/student/academics?tab=timetable')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 active:scale-95 transition-transform duration-150 select-none"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Timetable</span>
          </button>
        </div>
      </div>

      {/* Prominent Focus Mode Expanded Section: Current Class */}
      {isFocusMode && activeFocusSession && (
        <div className="animate-in fade-in zoom-in-95 duration-500 bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  LIVE IN SESSION
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {activeFocusSession.startTime} – {activeFocusSession.endTime}
                </span>
                {activeFocusSession.room && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Room {activeFocusSession.room}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-2">
                Current Class: {currentSubjectName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Instructor: {activeFocusSession.facultyName || 'Course Faculty'} • Type: {activeFocusSession.type || 'Lecture'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleTakeLiveNotes}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors active:scale-95 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Take Live Notes</span>
              </button>

              <button
                type="button"
                onClick={handleViewResources}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors active:scale-95 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>View Resources</span>
              </button>
            </div>
          </div>

          {/* Context Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-slate-50 rounded-md border border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Class Progress</div>
              <div className="mt-1 text-sm font-bold text-slate-900 font-mono">
                {activeFocusSession.startTime} – {activeFocusSession.endTime}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Focus mode auto-disengages when class concludes</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-md border border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Attendance Sync</div>
              <div className="mt-1 text-sm font-bold text-teal-700 font-mono">Roll Call Active</div>
              <div className="text-xs text-slate-500 mt-0.5">Faculty roll call synchronized with student record</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-md border border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Notifications</div>
              <div className="mt-1 text-sm font-bold text-slate-900 font-mono">Muted & Filtered</div>
              <div className="text-xs text-slate-500 mt-0.5">Campus notices & events held until session ends</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Metric Stats Grid (Large bold numbers, uppercase tracked labels, generous whitespace) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Attendance */}
        <div
          onClick={() => navigate('/student/academics?tab=attendance')}
          className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              ATTENDANCE RATE
            </span>
            <ShieldCheck className="w-4 h-4 text-teal-700" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {overallPct !== null ? `${overallPct}%` : '—'}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Req: &ge;{minThreshold}%</span>
            {lowAttendanceCount > 0 ? (
              <span className="text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lowAttendanceCount} shortfall
              </span>
            ) : (
              <span className="text-teal-700 font-medium">In good standing</span>
            )}
          </div>
        </div>

        {/* Metric 2: Today's Classes */}
        <div
          onClick={() => navigate('/student/academics?tab=timetable')}
          className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              CLASSES TODAY
            </span>
            <Clock className="w-4 h-4 text-teal-700" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {todaySessions.length}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono truncate">
            {upcomingInfo.session
              ? `Next: ${upcomingInfo.session.startTime} (${upcomingInfo.session.room})`
              : 'No further sessions today'}
          </div>
        </div>

        {/* Metric 3: Pending Coursework */}
        <div
          onClick={() => navigate('/student/academics?tab=assignments')}
          className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              PENDING TASKS
            </span>
            <BookOpen className="w-4 h-4 text-teal-700" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {pendingAssignments.length}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>{assignments.length} total tasks</span>
            {overdueAssignments.length > 0 ? (
              <span className="text-rose-600 font-medium">
                {overdueAssignments.length} overdue
              </span>
            ) : (
              <span className="text-teal-700 font-medium">On schedule</span>
            )}
          </div>
        </div>

        {/* Metric 4: Saved Opportunities */}
        <div
          onClick={() => navigate('/student/opportunities?tab=saved')}
          className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              SAVED OPPORTUNITIES
            </span>
            <Briefcase className="w-4 h-4 text-teal-700" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {savedOpportunities.length}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {opportunities.length} active listings
          </div>
        </div>
      </div>

      {/* 3. Primary Data Modules (Clean tables, generous padding, zero boilerplate) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <TodayClassesCard />
        <WeekAssignmentsWidget />
      </div>

      {/* 4. Secondary Data Modules: When in Focus Mode, Campus Updates & Upcoming Events are MUTED/HIDDEN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <AttendanceAlertsWidget />
        {!isFocusMode && (
          <div className="grid grid-cols-1 gap-6 sm:gap-8 animate-in fade-in duration-300">
            <PinnedNoticesWidget />
            <UpcomingEventsWidget />
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportLostFoundModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
