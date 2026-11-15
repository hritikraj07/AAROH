import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Bell,
  Calendar,
  HelpCircle,
  Briefcase,
  Settings,
  LogOut,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Clock,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react';
import { APP_CONFIG } from '../../config';
import { useApp } from '../../context/AppContext';
import { Logo } from '../ui/Logo';

export interface SidebarProps {
  onCloseMobile?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const {
    user,
    role,
    unreadNoticeCount,
    pendingAssignmentsCount,
    lowAttendanceCount,
    openSettings,
    logout,
  } = useApp();

  // Student Navigation Items
  const studentNavItems: NavItem[] = [
    {
      to: '/student',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: lowAttendanceCount > 0 ? (
        <span className="flex items-center text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3 mr-0.5" />
          {lowAttendanceCount}
        </span>
      ) : null,
    },
    {
      to: '/student/academics',
      label: 'Academics',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: pendingAssignmentsCount > 0 ? (
        <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded tabular-nums">
          {pendingAssignmentsCount} due
        </span>
      ) : null,
    },
    {
      to: '/student/notices',
      label: 'Campus Updates',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadNoticeCount > 0 ? (
        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded tabular-nums">
          {unreadNoticeCount} new
        </span>
      ) : null,
    },
    {
      to: '/student/events',
      label: 'Events',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      to: '/student/lost-found',
      label: 'Lost & Found',
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      to: '/student/opportunities',
      label: 'Opportunities',
      icon: <Briefcase className="w-4 h-4" />,
    },
  ];

  // Faculty Navigation Items
  const facultyNavItems: NavItem[] = [
    {
      to: '/faculty',
      label: 'Faculty Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      to: '/faculty/classes',
      label: 'Assigned Classes',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      to: '/faculty/attendance',
      label: 'Attendance Logger',
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      to: '/faculty/assignments',
      label: 'Coursework & Grading',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: pendingAssignmentsCount > 0 ? (
        <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded tabular-nums">
          {pendingAssignmentsCount} active
        </span>
      ) : null,
    },
    {
      to: '/faculty/notices',
      label: 'Department Notices',
      icon: <Bell className="w-4 h-4" />,
    },
  ];

  // Admin Navigation Items
  const adminNavItems: NavItem[] = [
    {
      to: '/admin',
      label: 'Administration Console',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      to: '/admin/people',
      label: 'User Directory',
      icon: <Users className="w-4 h-4" />,
    },
    {
      to: '/admin/notices',
      label: 'Notice Board Publisher',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      to: '/admin/events',
      label: 'Events & Approvals',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      to: '/admin/timetable',
      label: 'Timetable Scheduler',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      to: '/admin/opportunities',
      label: 'Opportunity Board',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      to: '/admin/settings',
      label: 'System Configuration',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return adminNavItems;
      case 'faculty':
        return facultyNavItems;
      case 'student':
      default:
        return studentNavItems;
    }
  };

  const getRoleHeader = () => {
    switch (role) {
      case 'admin':
        return 'System Administration';
      case 'faculty':
        return 'Faculty Portal';
      case 'student':
      default:
        return 'Student Life';
    }
  };

  const getBadgeLabel = () => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'faculty':
        return 'Faculty';
      case 'student':
      default:
        return 'Student';
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Logo size="md" />
              <span className="text-[10px] uppercase font-semibold tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                {getBadgeLabel()}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
            {APP_CONFIG.collegeName}
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {getRoleHeader()}
          </div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/student' || item.to === '/faculty' || item.to === '/admin'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all duration-150 ease-in-out ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="text-slate-500">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile & Footer Controls */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-md bg-white border border-slate-200">
          <div className="w-8 h-8 rounded-md bg-teal-700 text-white font-semibold text-xs flex items-center justify-center shrink-0 font-mono">
            {user?.avatarInitials || (role === 'admin' ? 'AD' : role === 'faculty' ? 'FA' : 'ST')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.name || (role === 'admin' ? 'Campus Admin' : role === 'faculty' ? 'Faculty Member' : 'Student')}
            </p>
            <p className="text-[11px] text-slate-500 truncate font-mono">
              {role === 'student'
                ? `${user?.rollNumber || '22CS042'} • Sem ${user?.semester || 5}`
                : role === 'faculty'
                ? user?.designation || 'Assistant Professor'
                : 'System Administrator'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              openSettings();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-200/50 transition-all duration-150 ease-in-out"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              logout();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-rose-50 transition-all duration-150 ease-in-out"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
