import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Focus,
  FileText,
  Network,
  Coffee,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';
import { AcademicService } from '../services/academicService';
import { ClassSession, CodingLab } from '../types';
import { TodayClassesCard } from '../components/modules/dashboard/TodayClassesCard';
import { AttendanceAlertsWidget } from '../components/modules/dashboard/AttendanceAlertsWidget';
import { WeekAssignmentsWidget } from '../components/modules/dashboard/WeekAssignmentsWidget';
import { PinnedNoticesWidget } from '../components/modules/dashboard/PinnedNoticesWidget';
import { UpcomingEventsWidget } from '../components/modules/dashboard/UpcomingEventsWidget';
import { LostAndFoundMatcherWidget } from '../components/modules/dashboard/LostAndFoundMatcherWidget';
import { ReportLostFoundModal } from '../components/modules/lostfound/ReportLostFoundModal';
import { getFacultyFullName } from '../utils/facultyUtils';
import { SkillTreeModal } from '../components/modules/academics/SkillTreeModal';
import { CampusMap } from '../components/modules/campus/CampusMap';
import { SmartResolveModal } from '../components/modules/campus/SmartResolveModal';
import { CampusBuilding } from '../types';
import { StudentLabWorkspaceModal } from '../components/modules/labs/StudentLabWorkspaceModal';

// Exact custom 4-layer tactile button shadow system
const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSkillTreeModalOpen, setIsSkillTreeModalOpen] = useState(false);
  const [selectedMapBuilding, setSelectedMapBuilding] = useState<CampusBuilding>('Academic Blocks');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedGlobalLab, setSelectedGlobalLab] = useState<CodingLab | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const {
    user,
    users,
    student,
    attendance,
    courses,
    timetable,
    assignments,
    opportunities,
    globalLabs,
    labSubmissions,
    refreshGlobalLabs,
    refreshLabSubmissions,
    showToast,
  } = useApp();

  // Tick timer every second for strict time window validation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // 3. Time-Aware Logic (The Engine): Evaluate student's real-time schedule
  const [currentContext, setCurrentContext] = useState<'IN_CLASS' | 'FREE_PERIOD'>('FREE_PERIOD');
  const [activeClassSession, setActiveClassSession] = useState<ClassSession | null>(null);
  const [isSimulatedFocus, setIsSimulatedFocus] = useState(false);

  // Quick Notes state persisted to localStorage
  const [quickNotes, setQuickNotes] = useState<string>(() => {
    try {
      return localStorage.getItem('aaroh_dashboard_quick_notes') || '';
    } catch {
      return '';
    }
  });
  const [notesSavedToast, setNotesSavedToast] = useState(false);

  useEffect(() => {
    const evaluateStudentScheduleContext = () => {
      // Cross-reference current time and day with the student's timetable stored in localStorage
      let storedTimetable: ClassSession[] = filteredTimetable;
      try {
        const raw = localStorage.getItem('aaroh_timetable');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            storedTimetable = parsed.filter((s: ClassSession) => {
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
          }
        }
      } catch {
        storedTimetable = filteredTimetable;
      }

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

      const inSession = storedTimetable.find(slot => {
        if (slot.dayOfWeek !== currentDay) return false;
        const startMin = parseTimeToMinutes(slot.startTime);
        const endMin = parseTimeToMinutes(slot.endTime);
        return currentMinutesTotal >= startMin && currentMinutesTotal <= endMin;
      });

      if (inSession) {
        setActiveClassSession(inSession);
        setCurrentContext('IN_CLASS');
      } else {
        setActiveClassSession(null);
        setCurrentContext('FREE_PERIOD');
      }
    };

    // Run immediately on mount
    evaluateStudentScheduleContext();

    // Runs every minute (60,000ms) to check current system time
    const intervalTimer = setInterval(evaluateStudentScheduleContext, 60000);
    return () => clearInterval(intervalTimer);
  }, [filteredTimetable, user]);

  const isSystemInClass = Boolean(activeClassSession);
  const effectiveContext: 'IN_CLASS' | 'FREE_PERIOD' = isSimulatedFocus ? 'IN_CLASS' : currentContext;
  const isFocusMode = effectiveContext === 'IN_CLASS';

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

  const handleSaveNotes = () => {
    try {
      localStorage.setItem('aaroh_dashboard_quick_notes', quickNotes);
      setNotesSavedToast(true);
      setTimeout(() => setNotesSavedToast(false), 2000);
      showToast({
        type: 'success',
        title: 'Notes Saved',
        message: `Quick notes saved locally to storage for ${currentSubjectName || 'lecture'}.`,
      });
    } catch {
      // Fallback
    }
  };

  // 4. Coursework KPI & Automated Coding Labs (globalLabs & labSubmissions)
  const currentStudentId = user?.id || 'demo_student';
  const studentSubmissions = (labSubmissions || []).filter(s => s.studentId === currentStudentId);
  const submittedLabIds = new Set(studentSubmissions.map(s => s.labId));
  const activePendingGlobalLabs = (globalLabs || []).filter(l => !submittedLabIds.has(l.id));

  const pendingAssignments = assignments.filter(a => a.status !== 'submitted');
  const overdueAssignments = assignments.filter(a => a.status === 'overdue');
  const pendingCodingLabs = assignments.filter(a => a.type === 'coding' && a.status !== 'submitted');

  // 5. Opportunities KPI
  const savedOppIds = user?.savedOpportunityIds || [];
  const savedOpportunities = opportunities.filter(o => savedOppIds.includes(o.id) || o.isSaved);

  const studentDisplayName = user?.name ? user.name.split(' ')[0] : 'Hritik';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Context-Aware Adaptive Top Banner */}
      {isFocusMode ? (
        /* "In-Class" UI State: Prominent, pulsing Deep Teal banner */
        <div className="animate-in fade-in zoom-in-95 duration-500 bg-[#0F766E]/15 border-2 border-[#0F766E] dark:bg-teal-950/80 dark:border-teal-500 text-teal-950 dark:text-teal-100 p-4 sm:p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
                </span>
                <span className="text-xs font-mono font-bold tracking-wider uppercase bg-[#0F766E] text-white px-2.5 py-0.5 rounded-full">
                  In-Class Focus Mode Active
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>🟢 Current Lecture: {currentSubjectName} with {getFacultyFullName(activeFocusSession, activeCourse, users)}</span>
              </h3>
              <p className="text-xs text-teal-900/80 dark:text-teal-200/90 flex items-center gap-1.5 font-medium">
                <Focus className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400 shrink-0" />
                <span>Focus Mode Auto-Activated: Muting non-academic notifications until class ends.</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-mono text-teal-900 dark:text-teal-200 bg-teal-100/60 dark:bg-teal-900/50 px-3 py-1 rounded-full border border-teal-300 dark:border-teal-700">
                {activeFocusSession?.startTime} - {activeFocusSession?.endTime} {activeFocusSession?.room ? `• Room ${activeFocusSession.room}` : ''}
              </span>
              {isSimulatedFocus && !isSystemInClass && (
                <button
                  type="button"
                  onClick={() => setIsSimulatedFocus(false)}
                  className="text-xs font-medium text-teal-800 dark:text-teal-300 hover:text-teal-950 dark:hover:text-white underline px-2 py-1"
                >
                  Exit Demo
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* "Free Period" UI State: Subtle, subdued banner */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 px-4 py-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm shrink-0">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Free Period: Good time to catch up on assignments.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/student/assignments')}
              className={`w-full sm:w-auto rounded-full bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white text-xs px-4 py-2 min-h-[40px] font-medium transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} flex items-center justify-center gap-1.5 cursor-pointer border border-[#8DA9C4]/30`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8DA9C4]" />
              <span>Automated Coding Labs</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Hero Banner: Refined Theme matching #134074 & #8DA9C4 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#134074] via-[#244970] to-[#355B82] border border-[#8DA9C4]/30 shadow-lg text-white rounded-3xl p-6 sm:p-10 transition-all duration-300 select-none">
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
            <span className="text-xs font-medium text-[#134074] bg-[#EEF4ED] px-2.5 py-1 rounded-full">
              {user?.program || 'B.Tech'} Sem {user?.semester || 5}
            </span>
          </div>
        </div>
      </div>

      {/* 3. In-Class Adaptive Layout Shift: Quick Notes & Live Pulse Widget at the VERY TOP */}
      {isFocusMode && activeFocusSession && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Quick Notes Widget (Textarea for Markdown Notes) */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                  Quick Notes
                </h3>
              </div>
              <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full font-medium">
                Markdown Notepad
              </span>
            </div>

            <div className="flex-1 space-y-1.5">
              <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                Lecture Scratchpad for {currentSubjectName}
              </label>
              <textarea
                value={quickNotes}
                onChange={(e) => {
                  setQuickNotes(e.target.value);
                  try {
                    localStorage.setItem('aaroh_dashboard_quick_notes', e.target.value);
                  } catch {
                    // Ignore quota
                  }
                }}
                placeholder="Take quick notes in Markdown... (e.g. # Algorithm Steps, - Key Formulas, `console.log()`)"
                className="w-full h-40 p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#27272A] text-xs">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {quickNotes.trim().split(/\s+/).filter(Boolean).length} words • Autosaved
              </span>
              <div className="flex items-center gap-2">
                {quickNotes && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickNotes('');
                      localStorage.removeItem('aaroh_dashboard_quick_notes');
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium px-2 py-1"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className={`rounded-full bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white text-xs px-4 py-1.5 font-medium transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} cursor-pointer inline-flex items-center gap-1.5 border border-[#8DA9C4]/30`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{notesSavedToast ? 'Notes Saved ✓' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Pulse Widget */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                  Live Pulse
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500">In Session Now</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                  Current Class: {currentSubjectName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Instructor: {getFacultyFullName(activeFocusSession, activeCourse, users)} • Room: {activeFocusSession.room || 'Lecture Lab'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 dark:bg-[#111115] rounded-xl border border-slate-100 dark:border-[#27272A]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Roll Call Sync</span>
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5 font-mono">Active (QR Synced)</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#111115] rounded-xl border border-slate-100 dark:border-[#27272A]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Class Slot</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                    {activeFocusSession.startTime} - {activeFocusSession.endTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 flex-wrap border-t border-slate-100 dark:border-[#27272A]">
              <button
                type="button"
                onClick={handleTakeLiveNotes}
                className={`rounded-full bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white text-xs px-4 py-2 font-medium transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} inline-flex items-center gap-1.5 cursor-pointer border border-[#8DA9C4]/30`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Take Live Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSkillTreeModalOpen(true)}
                className="rounded-full bg-white dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#202025] text-xs px-3.5 py-2 font-medium transition-colors active:scale-95 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Network className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>View Skill Tree</span>
              </button>

              <button
                type="button"
                onClick={handleViewResources}
                className="rounded-full bg-white dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#202025] text-xs px-3.5 py-2 font-medium transition-colors active:scale-95 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>View Resources</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Top Metric Stats Grid */}
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
              {overallPct !== null ? `${overallPct}%` : 'N/A'}
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

      {/* 5. Free Period Priority Section: Automated Coding Labs (Brought to the top) */}
      {!isFocusMode && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                Automated Coding Labs • Pending Tasks
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/academics?tab=assignments')}
              className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-mono font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({assignments.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {activePendingGlobalLabs.length === 0 && pendingCodingLabs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
              All Automated Coding Labs completed on schedule! Great work!
            </div>
          ) : activePendingGlobalLabs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePendingGlobalLabs.map(lab => {
                const startTime = new Date(lab.windowStartTime);
                const endTime = new Date(lab.windowEndTime);
                const nowMs = currentTime.getTime();
                const startMs = startTime.getTime();
                const endMs = endTime.getTime();

                // State 1: Too Early
                const isTooEarly = nowMs < startMs;
                // State 3: Expired
                const isExpired = nowMs > endMs;
                // State 2: Active
                const isActive = !isTooEarly && !isExpired;

                const formatUnlock = (d: string) => {
                  try {
                    return new Date(d).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  } catch {
                    return d;
                  }
                };

                return (
                  <div
                    key={lab.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#111115] hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                          Sem {lab.semester} • {lab.subject}
                        </span>
                        {isExpired && (
                          <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 px-1.5 py-0.5 rounded">
                            Deadline Passed / Locked
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] font-mono text-teal-800 dark:text-teal-300 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            Active Window
                          </span>
                        )}
                        {isTooEarly && (
                          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {lab.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {lab.problemStatement}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-[#27272A] space-y-2">
                      {isTooEarly && (
                        <div className="text-[11px] font-mono text-[#0F766E] dark:text-teal-400 font-medium">
                          Lab unlocks at {formatUnlock(lab.windowStartTime)}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                          {isExpired ? 'Window Closed' : `Closes ${formatUnlock(lab.windowEndTime)}`}
                        </span>

                        {isTooEarly && (
                          <button
                            type="button"
                            disabled
                            className="rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[11px] font-medium px-3 py-1 cursor-not-allowed opacity-70"
                          >
                            <span>Open Lab</span>
                          </button>
                        )}

                        {isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGlobalLab(lab);
                              setIsWorkspaceModalOpen(true);
                            }}
                            className={`rounded-full bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white text-[11px] font-medium px-3 py-1 transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} flex items-center gap-1 cursor-pointer border border-[#8DA9C4]/30`}
                          >
                            <span>Open Lab</span>
                            <span className="hidden sm:inline text-[9px] opacity-80">• Launch Workspace</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {isExpired && (
                          <button
                            type="button"
                            disabled
                            className="rounded-full bg-red-100 dark:bg-red-950/40 text-red-400 text-[11px] font-medium px-3 py-1 cursor-not-allowed opacity-60"
                          >
                            <span>Open Lab</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingCodingLabs.map(lab => (
                <div
                  key={lab.id}
                  onClick={() => navigate(lab.type === 'coding' ? `/student/assignments/code/${lab.id}` : '/student/academics?tab=assignments')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#111115] hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                        {lab.type === 'coding' ? `${lab.language || 'Python'} Lab` : 'Coursework'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Due {lab.dueDate}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {lab.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {lab.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-[#27272A] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      {lab.maxMarks || 20} Marks
                    </span>
                    <button
                      type="button"
                      className={`rounded-full bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white text-[11px] font-medium px-3 py-1 transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} flex items-center gap-1 cursor-pointer border border-[#8DA9C4]/30`}
                    >
                      <span>Launch Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Opportunity Board: In Free Period, brought to the top! In Focus Mode: DISTRACTION BLOCKING hides it! */}
      {!isFocusMode && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
      )}

      {/* AI Lost & Found Matcher Widget */}
      {!isFocusMode && <LostAndFoundMatcherWidget />}

      {/* Interactive Campus Map & Smart Resolve AI Facility Portal */}
      <CampusMap
        onSelectBuilding={b => {
          setSelectedMapBuilding(b);
          setIsMapModalOpen(true);
        }}
      />

      {/* 7. Primary Data Modules (Tables: Today's Schedule & Coursework) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <TodayClassesCard />
        <WeekAssignmentsWidget />
      </div>

      {/* 8. Secondary Data Modules: When in Focus Mode, Campus Updates & Upcoming Events are MUTED/HIDDEN */}
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

      {/* Curriculum Tracker & Mastery Modal */}
      <SkillTreeModal
        courseId={activeFocusSession?.courseId || 'all_cs'}
        courseCode={activeCourse?.code || activeFocusSession?.courseCode || 'CS301'}
        courseName={currentSubjectName || 'Operating Systems'}
        isOpen={isSkillTreeModalOpen}
        onClose={() => setIsSkillTreeModalOpen(false)}
      />

      {/* Smart Resolve AI Ticketing Modal */}
      <SmartResolveModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        selectedBuilding={selectedMapBuilding}
      />

      {/* Student Proctored Lab Workspace Modal */}
      {selectedGlobalLab && (
        <StudentLabWorkspaceModal
          lab={selectedGlobalLab}
          isOpen={isWorkspaceModalOpen}
          onClose={() => {
            setIsWorkspaceModalOpen(false);
            setSelectedGlobalLab(null);
          }}
          onSubmittedSuccess={() => {
            refreshLabSubmissions();
            refreshGlobalLabs();
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
