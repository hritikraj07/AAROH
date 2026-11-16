import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { QrCode } from 'lucide-react';
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
  const { role } = useApp();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const location = useLocation();

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
      case '/admin/curriculum':
      case '/admin/curriculum-builder':
        return 'Curriculum & Skill Tree Builder';
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
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-[#FBFBFA] dark:bg-[#0E0E11]">
      {/* Main Shell Layout - Seamless dark:bg-[#0E0E11] matched with Login Page */}
      <div className="flex flex-1 overflow-hidden bg-[#FBFBFA] dark:bg-[#0E0E11] text-slate-900 dark:text-slate-100">
        {/* Desktop Sidebar: Always accessible and uncluttered */}
        <div className="hidden md:flex md:shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar
            onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
            pageTitle={getPageTitle(location.pathname)}
          />

          <main className="flex-1 overflow-y-auto transition-colors duration-200 bg-[#FBFBFA] dark:bg-[#0E0E11]">
            <div className="max-w-7xl mx-auto p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Floating Scan Attendance QR Button for Students */}
      {role === 'student' && (
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

      {/* Modals, Floating AI Assistant & Notifications */}
      <GlobalSearchModal />
      <SettingsModal />
      <ToastContainer />
      <AarohAIAssistant />
      <StudentQRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </div>
  );
};

export const AppLayout = Layout;
export default Layout;
