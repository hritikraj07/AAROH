import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Briefcase,
  ShieldCheck,
  PlusCircle,
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';
import { AcademicService } from '../services/academicService';
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

  // 3. Coursework KPI
  const pendingAssignments = assignments.filter(a => a.status !== 'submitted');
  const overdueAssignments = assignments.filter(a => a.status === 'overdue');

  // 4. Opportunities KPI
  const savedOppIds = user?.savedOpportunityIds || [];
  const savedOpportunities = opportunities.filter(o => savedOppIds.includes(o.id) || o.isSaved);

  return (
    <div className="space-y-8">
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

      {/* 4. Secondary Data Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <AttendanceAlertsWidget />
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          <PinnedNoticesWidget />
          <UpcomingEventsWidget />
        </div>
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
