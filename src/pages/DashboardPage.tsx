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
  CheckCircle2,
  Users
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
import { LostAndFoundMatcherWidget } from '../components/modules/dashboard/LostAndFoundMatcherWidget';
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

  const studentDisplayName = user?.name ? user.name.split(' ')[0] : 'Hritik';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 0. Context-Aware Focus Mode Banner */}
      {isFocusMode && (
        <div className="animate-in fade-in zoom-in-95 duration-500 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <Focus className="w-4 h-4 text-teal-700 dark:text-teal-400 animate-pulse shrink-0" />
            <span>Focus Mode Auto-Activated: Muting non-academic notifications until class ends.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-700 px-2 py-0.5 rounded uppercase tracking-wider">
              {isSystemInClass ? 'Live Class Active' : 'Simulated Session'}
            </span>
            {isSimulatedFocus && !isSystemInClass && (
              <button
                type="button"
                onClick={() => setIsSimulatedFocus(false)}
                className="text-xs text-teal-800 dark:text-teal-300 underline hover:text-teal-950 font-medium"
              >
                Exit Demo
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Hero Banner: Deep Teal bg-[#0F766E], rounded-3xl, subtle CSS decorative shapes */}
      <div className="relative overflow-hidden bg-[#0F766E] text-white rounded-3xl p-6 sm:p-10 shadow-sm transition-all duration-300 select-none">
        {/* Subtle CSS decorative shapes: curves and stars */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full border-[20px] border-white/10 pointer-events-none" />
        <div className="absolute right-28 -top-16 w-52 h-52 rounded-full border-[14px] border-white/10 pointer-events-none" />
        <div className="absolute top-6 right-16 text-white/20 pointer-events-none select-none">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
        <div className="absolute bottom-8 right-52 text-white/15 pointer-events-none select-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/20 font-mono uppercase tracking-wider">
            <span>{APP_CONFIG.collegeName} • {APP_CONFIG.academicSession}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Welcome back, {studentDisplayName}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 font-normal leading-relaxed max-w-xl">
            Here is your institutional overview for today. All scheduled coursework, live attendance metrics, and campus opportunities are synchronized.
          </p>

          <div className="pt-2 flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono font-medium text-white bg-white/20 border border-white/30 px-2.5 py-1 rounded-full">
              Roll No: {user?.rollNumber || '22CS042'}
            </span>
            <span className="text-xs font-medium text-teal-900 bg-teal-100 px-2.5 py-1 rounded-full">
              {user?.program || 'B.Tech'} Sem {user?.semester || 5}
            </span>
            {!isSystemInClass && (
              <button
                type="button"
                onClick={() => setIsSimulatedFocus(prev => !prev)}
                className="text-xs font-medium text-white bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1 rounded-full transition-colors active:scale-95 flex items-center gap-1.5"
                title="Toggle Context-Aware Focus Mode demo"
              >
                <Focus className="w-3.5 h-3.5" />
                <span>{isSimulatedFocus ? 'Exit Focus Demo' : 'Focus Mode Demo'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Focus Mode Expanded Section: Current Class */}
      {isFocusMode && activeFocusSession && (
        <div className="animate-in fade-in zoom-in-95 duration-500 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  LIVE IN SESSION
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {activeFocusSession.startTime} – {activeFocusSession.endTime}
                </span>
                {activeFocusSession.room && (
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#27272A] px-2 py-0.5 rounded">
                    Room {activeFocusSession.room}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-2">
                Current Class: {currentSubjectName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Instructor: {activeFocusSession.facultyName || 'Course Faculty'} • Type: {activeFocusSession.type || 'Lecture'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleTakeLiveNotes}
                className="rounded-full bg-teal-700 hover:bg-[#0D6861] active:bg-[#115E59] text-white text-xs px-4 py-2 font-medium transition-all duration-200 active:scale-95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Take Live Notes</span>
              </button>

              <button
                type="button"
                onClick={handleViewResources}
                className="rounded-full bg-white dark:bg-[#27272A] border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs px-4 py-2 font-medium transition-colors active:scale-95 shadow-sm inline-flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>View Resources</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-slate-50 dark:bg-[#27272A]/50 rounded-xl border border-slate-100 dark:border-[#27272A]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Class Progress</div>
              <div className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                {activeFocusSession.startTime} – {activeFocusSession.endTime}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Focus mode auto-disengages when class concludes</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#27272A]/50 rounded-xl border border-slate-100 dark:border-[#27272A]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Attendance Sync</div>
              <div className="mt-1 text-sm font-bold text-teal-700 dark:text-teal-400 font-mono">Roll Call Active</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Faculty roll call synchronized with student record</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#27272A]/50 rounded-xl border border-slate-100 dark:border-[#27272A]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Notifications</div>
              <div className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">Muted & Filtered</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Campus notices & events held until session ends</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Metric Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Attendance */}
        <div
          onClick={() => navigate('/student/academics?tab=attendance')}
          className="bg-white border border-slate-200 text-slate-900 dark:bg-[#18181B] dark:border-[#27272A] dark:text-slate-50 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              ATTENDANCE RATE
            </span>
            <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums font-mono">
              {overallPct !== null ? `${overallPct}%` : '—'}
            </span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between">
            <span>Req: &ge;{minThreshold}%</span>
            {lowAttendanceCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lowAttendanceCount} shortfall
              </span>
            ) : (
              <span className="text-teal-700 dark:text-teal-400 font-medium">In good standing</span>
            )}
          </div>
        </div>

        {/* Metric 2: Today's Classes */}
        <div
          onClick={() => navigate('/student/academics?tab=timetable')}
          className="bg-white border border-slate-200 text-slate-900 dark:bg-[#18181B] dark:border-[#27272A] dark:text-slate-50 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              CLASSES TODAY
            </span>
            <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums font-mono">
              {todaySessions.length}
            </span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">
            {upcomingInfo.session
              ? `Next: ${upcomingInfo.session.startTime} (${upcomingInfo.session.room})`
              : 'No further sessions today'}
          </div>
        </div>

        {/* Metric 3: Pending Coursework */}
        <div
          onClick={() => navigate('/student/academics?tab=assignments')}
          className="bg-white border border-slate-200 text-slate-900 dark:bg-[#18181B] dark:border-[#27272A] dark:text-slate-50 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              PENDING TASKS
            </span>
            <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums font-mono">
              {pendingAssignments.length}
            </span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between">
            <span>{assignments.length} total tasks</span>
            {overdueAssignments.length > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                {overdueAssignments.length} overdue
              </span>
            ) : (
              <span className="text-teal-700 dark:text-teal-400 font-medium">On schedule</span>
            )}
          </div>
        </div>

        {/* Metric 4: Saved Opportunities */}
        <div
          onClick={() => navigate('/student/opportunities?tab=saved')}
          className="bg-white border border-slate-200 text-slate-900 dark:bg-[#18181B] dark:border-[#27272A] dark:text-slate-50 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              SAVED OPPORTUNITIES
            </span>
            <Briefcase className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums font-mono">
              {savedOpportunities.length}
            </span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            {opportunities.length} active listings
          </div>
        </div>
      </div>

      {/* 3. Data Cards Section: Dynamically rendered from localStorage opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            FEATURED CAMPUS HIGHLIGHTS
          </h2>
          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">Curated for your cohort</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opportunities.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No active opportunities. Hackathons and internships will appear here.
            </div>
          ) : (
            opportunities.slice(0, 3).map((opp, idx) => {
              const gradients = [
                'from-teal-600 to-teal-800',
                'from-indigo-600 to-indigo-900',
                'from-slate-800 to-slate-950',
              ];
              const gradient = gradients[idx % gradients.length];
              return (
                <div
                  key={opp.id}
                  onClick={() => navigate('/student/opportunities')}
                  className="bg-white border border-slate-200 text-slate-900 dark:bg-[#18181B] dark:border-[#27272A] dark:text-slate-50 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Top half placeholder image/cover */}
                    <div className={`h-32 bg-gradient-to-br ${gradient} p-4 relative flex items-end`}>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                      <span className="relative z-10 text-[10px] font-mono font-semibold text-teal-100 bg-black/25 px-2 py-0.5 rounded backdrop-blur-sm">
                        {opp.mode || 'Active'}
                      </span>
                    </div>

                    {/* Middle: Tiny category badge + bold title */}
                    <div className="p-5 space-y-2">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 font-mono">
                        {(opp.type || 'Opportunity').toUpperCase()}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-50 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {opp.description || `${opp.organization} · ${opp.eligibility || 'All students eligible'}`}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: small avatar / name */}
                  <div className="px-5 py-3 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-teal-700 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                        {opp.organization ? opp.organization.slice(0, 2).toUpperCase() : 'OP'}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                        {opp.organization}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-teal-700 dark:text-teal-400 font-semibold">
                      {opp.stipendPrize || opp.compensation || 'View Details'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI Lost & Found Matcher Widget */}
      <LostAndFoundMatcherWidget />

      {/* 4. Primary Data Modules (Tables: Today's Schedule & Coursework) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <TodayClassesCard />
        <WeekAssignmentsWidget />
      </div>

      {/* 5. Secondary Data Modules: When in Focus Mode, Campus Updates & Upcoming Events are MUTED/HIDDEN */}
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
