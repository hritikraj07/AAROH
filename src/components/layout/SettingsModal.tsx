import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { RotateCcw, UserCheck, AlertTriangle } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    student,
    user,
    role,
    resetDemoData,
  } = useApp();

  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setConfirmReset(false);
    closeSettings();
  };

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => {
        setConfirmReset(false);
        closeSettings();
      }}
      title="Settings"
      subtitle="Preferences and account configuration"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Session Profile Overview */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <UserCheck className="w-4 h-4 text-[#134074] dark:text-[#8DA9C4]" />
            <span className="capitalize">Active {role || 'Student'} Session</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Full Name</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">{user?.name || student?.name || 'Aaroh User'}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">
                {role === 'student' ? 'Roll Number' : 'Designation / ID'}
              </span>
              <span className="font-mono text-slate-900 dark:text-slate-100 truncate block">
                {user?.rollNumber || student?.rollNumber || user?.designation || (role === 'admin' ? 'SYS-ADM-01' : 'FAC-01')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Institutional Email</span>
              <span className="font-mono truncate block text-slate-900 dark:text-slate-100">{user?.email || student?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Department / Program</span>
              <span className="text-slate-900 dark:text-slate-100 truncate block">{user?.department || student?.program || 'Engineering & Technology'}</span>
            </div>
          </div>
        </div>

        {/* Interface Theme Section */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Interface Theme</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Toggle between Day and Night visual landscapes</p>
          </div>
          <ThemeToggle size="md" />
        </div>

        {/* Demo Data Reset Section: Available strictly to System Administrators */}
        {role === 'admin' && (
          <div className="p-3.5 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Reset Demo Data</span>
              </div>
              {!confirmReset ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/50"
                  onClick={() => setConfirmReset(true)}
                >
                  Reset to Seed Data
                </Button>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Re-populates initial seed state (clears custom registrations, restored mock dates relative to today, un-submits test assignments).
            </p>

            {confirmReset && (
              <div className="flex items-center gap-2 pt-2 border-t border-rose-200/70 dark:border-rose-900/50">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-xs text-rose-800 dark:text-rose-300 font-medium">Are you sure?</span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleReset}
                  >
                    Confirm Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
