import React, { useState, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { QrCode, ShieldAlert, Lock } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileDrawer } from './MobileDrawer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { SettingsModal } from './SettingsModal';
import { ToastContainer } from '../ui/ToastContainer';
import { AarohAIAssistant } from '../modules/ai/AarohAIAssistant';
import { StudentQRScannerModal } from '../modules/attendance/StudentQRScannerModal';
import { useApp } from '../../context/AppContext';

export const Layout: React.FC = () => {
  const { role, timetable, assignments } = useApp();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [manualGhostMode, setManualGhostMode] = useState<boolean | null>(null);
  const location = useLocation();

  // "Ghost Mode" Exam Focus Logic:
  // Detect if an Exam is scheduled or an Automated Coding Lab is active
  const isAutoGhostMode = useMemo(() => {
    if (role !== 'student') return false;

    // Check if an Automated Coding Lab is currently active
    const hasActiveCodingLab = assignments.some(
      a => a.type === 'coding' && a.labStatus === 'active'
    );
    if (hasActiveCodingLab) return true;

    // Check timetable for scheduled exams
    const now = new Date();
    const currentDay = (now.getDay() === 0 ? 7 : now.getDay()) as any;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const isExamNow = timetable.some(session => {
      const isExam =
        session.type === ('Exam' as any) ||
        session.courseName?.toLowerCase().includes('exam') ||
        session.courseCode?.toLowerCase().includes('exam');

      if (!isExam) return false;
      if (session.dayOfWeek !== currentDay) return false;

      const [startH, startM] = session.startTime.split(':').map(Number);
      const [endH, endM] = session.endTime.split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      return currentMinutes >= startTotal && currentMinutes <= endTotal;
    });

    return isExamNow;
  }, [role, assignments, timetable]);

  const isGhostMode = manualGhostMode !== null ? manualGhostMode : isAutoGhostMode;

  const getPageTitle = (pathname: string): string => {
    const cleanPath = pathname.replace(/\/+$/, '') || '/';

    if (cleanPath.includes('/assignments/code')) {
      return 'Live Lab Code Workspace';
    }

    switch (cleanPath) {
      // Student Routes
      case '/':
      case '/student':
      case '/student/dashboard':
      case '/dashboard':
        return 'Overview';
      case '/student/academics':
      case '/academics':
        return 'Academics & Timetable';
      case '/student/notices':
      case '/notices':
      case '/student/campus-updates':
      case '/campus-updates':
        return 'Campus Updates';
      case '/student/events':
      case '/events':
        return 'Campus Events & Activities';
      case '/student/lost-found':
      case '/lost-found':
        return 'Lost & Found Registry';
      case '/student/opportunities':
      case '/opportunities':
        return 'Opportunity Board';

      // Faculty Routes
      case '/faculty':
      case '/faculty/dashboard':
        return 'Faculty Overview';
      case '/faculty/classes':
        return 'Assigned Courses & Curriculum';
      case '/faculty/attendance':
        return 'Lecture Attendance Logger';
      case '/faculty/gradebook':
        return 'Faculty Gradebook';
      case '/faculty/assignments':
        return 'Coursework & Grading';
      case '/faculty/notices':
        return 'Department Circulars & Notices';

      // Admin Routes
      case '/admin':
      case '/admin/dashboard':
        return 'Administration Console';
      case '/admin/people':
      case '/admin/directory':
      case '/admin/users':
        return 'Campus User Directory & Onboarding';
      case '/admin/notices':
        return 'Notice Board Publisher';
      case '/admin/events':
        return 'Events Scheduling & Approvals';
      case '/admin/timetable':
        return 'Institutional Timetable Scheduler';
      case '/admin/opportunities':
        return 'Opportunity Board Publisher';
      case '/admin/settings':
        return 'System Configuration';

      default:
        return 'Aaroh';
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      {/* Ghost Mode Exam Focus: Prominent, Un-dismissible Banner */}
      {isGhostMode && (
        <div className="w-full bg-[#1e102d] text-purple-200 border-b border-purple-500/50 px-4 py-2.5 text-xs font-mono font-bold flex items-center justify-between z-50 shrink-0 shadow-lg animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
            <Lock className="w-4 h-4 text-purple-300" />
            <span>🔒 Exam Mode Enforced. Navigation disabled.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-purple-300/80 uppercase tracking-wider hidden sm:inline">
              Anti-Cheating Architecture Active
            </span>
            <button
              type="button"
              onClick={() => setManualGhostMode(false)}
              className="text-[11px] text-purple-300 hover:text-white underline font-mono cursor-pointer"
            >
              Exit Ghost Mode
            </button>
          </div>
        </div>
      )}

      {/* Main Shell Layout */}
      <div
        className={`flex flex-1 overflow-hidden transition-all duration-300 ${
          isGhostMode
            ? 'bg-[#070709] dark:bg-[#070709] border-t-2 border-purple-500/50'
            : 'bg-[#FBFBFA] dark:bg-[#0E0E11] text-slate-900 dark:text-slate-100'
        }`}
      >
        {/* Desktop Sidebar: Completely HIDDEN in Ghost Mode */}
        {!isGhostMode && (
          <div className="hidden md:flex md:shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Mobile Drawer: Disabled in Ghost Mode */}
        {!isGhostMode && (
          <MobileDrawer
            isOpen={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div
          className={`flex flex-col flex-1 min-w-0 overflow-hidden ${
            isGhostMode ? 'border-l border-r border-purple-500/50' : ''
          }`}
        >
          <TopBar
            onOpenMobileMenu={() => {
              if (!isGhostMode) setIsMobileDrawerOpen(true);
            }}
            pageTitle={getPageTitle(location.pathname)}
          />

          <main
            className={`flex-1 overflow-y-auto transition-colors duration-200 ${
              isGhostMode ? 'bg-[#070709] dark:bg-[#070709]' : 'bg-[#FBFBFA] dark:bg-[#0E0E11]'
            }`}
          >
            <div className="max-w-7xl mx-auto p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Floating Scan Attendance QR Button for Students (hidden in Ghost Mode) */}
      {role === 'student' && !isGhostMode && (
        <div className="fixed bottom-6 right-20 sm:right-22 z-40">
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#18181B] dark:bg-[#18181B] hover:bg-slate-800 text-white shadow-lg border border-[#27272A] text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
            title="Scan Attendance QR"
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Scan Attendance QR</span>
          </button>
        </div>
      )}

      {/* Demo Floating Exam Mode Trigger (for demonstration purposes) */}
      {role === 'student' && !isGhostMode && (
        <div className="fixed bottom-6 left-6 z-40 hidden sm:block">
          <button
            onClick={() => setManualGhostMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 text-[11px] font-mono font-semibold transition-all duration-150 active:scale-95 cursor-pointer shadow-md"
            title="Simulate Ghost Mode Exam Focus"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Simulate Ghost Mode</span>
          </button>
        </div>
      )}

      {/* Modals, Floating AI Assistant & Notifications */}
      <GlobalSearchModal />
      <SettingsModal />
      <ToastContainer />
      {/* Floating AI Assistant: completely hidden in Ghost Mode to prevent cheating */}
      {!isGhostMode && <AarohAIAssistant />}
      <StudentQRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </div>
  );
};

export const AppLayout = Layout;
export default Layout;

