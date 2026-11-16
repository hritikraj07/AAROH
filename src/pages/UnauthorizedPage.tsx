import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';
import { Button } from '../components/ui/Button';
import { ShieldAlert, ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user, role, logout } = useApp();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'faculty':
        return '/faculty';
      case 'student':
      default:
        return '/student';
    }
  };

  const getRoleDisplayName = (r: string | null) => {
    switch (r) {
      case 'admin':
        return 'Campus Administrator';
      case 'faculty':
        return 'Faculty Member';
      case 'student':
        return 'Student Scholar';
      default:
        return 'Unknown Role';
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0E0E11] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-200 dark:border-[#27272A]">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded">
              HTTP 403 • Access Restricted
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-2">
              Unauthorized Portal Area
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Your institutional account clearance does not grant access to this module or route.
            </p>
          </div>
        </div>

        {/* Current Active Account Information */}
        <div className="p-4 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Current Active Identity
          </span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center font-mono">
              {user?.avatarInitials || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {user?.name || 'Authenticated User'}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-slate-200 text-slate-800 capitalize">
                  {getRoleDisplayName(role)}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">{user?.email}</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {user?.department || APP_CONFIG.collegeName}
              </p>
            </div>
          </div>
        </div>

        {/* Informational Guidance */}
        <p className="text-xs text-slate-500 leading-relaxed">
          Access control policies enforce strict boundaries between student academic life, faculty grading/attendance management, and campus administration. If you believe this is in error, contact the registrar office.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(getDashboardPath())}
            className="w-full sm:flex-1 justify-center"
          >
            Return to My Portal
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={<LogOut className="w-4 h-4 text-slate-500" />}
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full sm:w-auto justify-center"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
