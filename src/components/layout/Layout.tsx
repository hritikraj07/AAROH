import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileDrawer } from './MobileDrawer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { SettingsModal } from './SettingsModal';
import { ToastContainer } from '../ui/ToastContainer';

export const Layout: React.FC = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return 'Student Dashboard';
      case '/academics':
        return 'Academics & Timetable';
      case '/notices':
        return 'Campus Updates';
      case '/events':
        return 'Campus Events & Activities';
      case '/lost-found':
        return 'Lost & Found Registry';
      case '/opportunities':
        return 'Opportunity Board';
      default:
        return 'Aaroh';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar (Persistent) */}
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

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <GlobalSearchModal />
      <SettingsModal />
      <ToastContainer />
    </div>
  );
};
