import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileDrawer } from './MobileDrawer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { SettingsModal } from './SettingsModal';
import { ToastContainer } from '../ui/ToastContainer';
import { AarohAIAssistant } from '../modules/ai/AarohAIAssistant';

export const Layout: React.FC = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
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
    <div className="flex h-screen overflow-hidden bg-[#FBFBFA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Desktop Sidebar (Persistent left panel) */}
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

        <main className="flex-1 overflow-y-auto bg-[#FBFBFA] dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modals, Floating AI Assistant & Notifications */}
      <GlobalSearchModal />
      <SettingsModal />
      <ToastContainer />
      <AarohAIAssistant />
    </div>
  );
};

export const AppLayout = Layout;
export default Layout;
