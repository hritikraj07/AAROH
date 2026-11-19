import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Users,
  Award,
  Network,
  MapPin
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

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();
  const {
    user,
    role,
    unreadNoticeCount,
    pendingAssignmentsCount,
    lowAttendanceCount,
    openSettings,
    logout,
  } = useApp();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    navigate('/login');
  };

  // Student Navigation Groups
  const studentNavGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          to: '/student',
          label: 'Overview',
          icon: <LayoutDashboard className="w-4 h-4" />,
          badge: lowAttendanceCount > 0 ? (
            <span className="flex items-center text-[10px] font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900 px-1.5 py-0.5 rounded tabular-nums">
              <AlertTriangle className="w-3 h-3 mr-0.5" />
              {lowAttendanceCount}
            </span>
          ) : null,
        },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        {
          to: '/student/academics',
          label: 'Academics',
          icon: <GraduationCap className="w-4 h-4" />,
          badge: pendingAssignmentsCount > 0 ? (
            <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-1.5 py-0.5 rounded tabular-nums">
              {pendingAssignmentsCount}
            </span>
          ) : null,
        },
        {
          to: '/student/notices',
          label: 'Campus Updates',
          icon: <Bell className="w-4 h-4" />,
          badge: unreadNoticeCount > 0 ? (
            <span className="text-[10px] font-semibold text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 px-1.5 py-0.5 rounded tabular-nums">
              {unreadNoticeCount}
            </span>
          ) : null,
        },
        {
          to: '/student/opportunities',
          label: 'Opportunities',
          icon: <Briefcase className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'CAMPUS LIFE',
      items: [
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
          to: '/student/campus-map',
          label: 'Report Facility Issues',
          icon: <MapPin className="w-4 h-4" />,
        },
      ],
    },
  ];

  // Faculty Navigation Groups
  const facultyNavGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          to: '/faculty',
          label: 'Overview',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        {
          to: '/faculty/classes',
          label: 'Assigned Classes',
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          to: '/faculty/gradebook',
          label: 'Gradebook',
          icon: <Award className="w-4 h-4" />,
        },
        {
          to: '/faculty/assignments',
          label: 'Coursework & Grading',
          icon: <GraduationCap className="w-4 h-4" />,
          badge: pendingAssignmentsCount > 0 ? (
            <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-1.5 py-0.5 rounded tabular-nums">
              {pendingAssignmentsCount}
            </span>
          ) : null,
        },
      ],
    },
    {
      title: 'COMMUNICATIONS',
      items: [
        {
          to: '/faculty/notices',
          label: 'Department Notices',
          icon: <Bell className="w-4 h-4" />,
        },
        {
          to: '/faculty/campus-map',
          label: 'Report Facility Issues',
          icon: <MapPin className="w-4 h-4" />,
        },
      ],
    },
  ];

  // Admin Navigation Groups
  const adminNavGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          to: '/admin',
          label: 'Administration Console',
          icon: <ShieldCheck className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'PEOPLE & CURRICULUM',
      items: [
        {
          to: '/admin/people',
          label: 'User Directory',
          icon: <Users className="w-4 h-4" />,
        },
        {
          to: '/admin/timetable',
          label: 'Timetable Scheduler',
          icon: <Clock className="w-4 h-4" />,
        },
        {
          to: '/admin/attendance',
          label: 'Manual Attendance',
          icon: <ClipboardList className="w-4 h-4" />,
        },
        {
          to: '/admin/curriculum',
          label: 'Curriculum Builder',
          icon: <Network className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'CAMPUS OPERATIONS',
      items: [
        {
          to: '/admin/notices',
          label: 'Notice Publisher',
          icon: <Bell className="w-4 h-4" />,
        },
        {
          to: '/admin/events',
          label: 'Events & Approvals',
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          to: '/admin/opportunities',
          label: 'Opportunity Board',
          icon: <Briefcase className="w-4 h-4" />,
        },
        {
          to: '/admin/campus-map',
          label: 'Campus Facilities',
          icon: <MapPin className="w-4 h-4" />,
        },
        {
          to: '/admin/settings',
          label: 'System Configuration',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  const getNavGroups = (): NavGroup[] => {
    switch (role) {
      case 'admin':
        return adminNavGroups;
      case 'faculty':
        return facultyNavGroups;
      case 'student':
      default:
        return studentNavGroups;
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

  const navGroups = getNavGroups();

  return (
    <aside className="w-64 bg-white dark:bg-[#18181B] border-r border-[#D8E2DC] dark:border-[#27272A] h-full flex flex-col justify-between select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 border-b border-[#D8E2DC] dark:border-[#27272A]">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <span className="text-[10px] uppercase font-semibold tracking-wider text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 px-2 py-0.5 rounded">
              {getBadgeLabel()}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mt-1 truncate">
            {APP_CONFIG.collegeName}
          </p>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="p-3 space-y-6">
          {navGroups.map(group => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                {group.title}
              </div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/student' || item.to === '/faculty' || item.to === '/admin'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3 py-2.5 min-h-[40px] text-xs font-medium rounded-xl transition-all duration-150 ease-out active:scale-[0.97] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/40 ${
                      isActive
                        ? 'text-teal-900 dark:text-teal-100 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-[#27272A]/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400 rounded-xl border border-teal-200/80 dark:border-teal-800/50 z-0"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-2.5">
                        <span className={`transition-colors duration-150 ${isActive ? 'text-teal-700 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <div className="relative z-10">
                        {item.badge}
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Settings & Logout at bottom */}
      <div className="p-4 border-t border-[#D8E2DC] dark:border-[#27272A] bg-white dark:bg-[#18181B]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              openSettings();
            }}
            className="flex items-center gap-1.5 min-h-[44px] text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-[#27272A] active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 min-h-[44px] text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 transition-all duration-150 cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
