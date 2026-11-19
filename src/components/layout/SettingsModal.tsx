import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { RotateCcw, UserCheck, AlertTriangle, Users } from 'lucide-react';

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
  const [findTeammatesEnabled, setFindTeammatesEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('aaroh_radar_seeking_teammates');
    return saved !== null ? saved === 'true' : true; // Default ON per user specification
  });

  const handleToggleTeammates = (enabled: boolean) => {
    setFindTeammatesEnabled(enabled);
    localStorage.setItem('aaroh_radar_seeking_teammates', String(enabled));
  };

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
        {/* Cohort Teammate Radar Preference (Students only, default ON per user specification) */}
        {role === 'student' && (
          <div className="p-4 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Cohort Teammate Radar
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={findTeammatesEnabled}
                  onChange={(e) => handleToggleTeammates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-700"></div>
              </label>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Find Teammate / Team for Cohort Teammate Radar
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                When enabled, your profile signals availability on the Cohort Teammate Radar so peers can invite you to form teams for hackathons and projects.
              </p>
            </div>
          </div>
        )}

        {/* Faculty Profile Overview (Bare-minimum faculty context) */}
        {role === 'faculty' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-[#27272A]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-[#134074] dark:text-[#8DA9C4]" />
                  <span>Faculty Profile</span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                  K.R. Mangalam University
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Full Name</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                    {user?.name || 'Prof. Aarav Sharma'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Position / Designation</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                    {user?.designation || 'Assistant Professor'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Department</span>
                  <span className="text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                    {user?.department || 'School of Engineering & Technology • CSE'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Email / Faculty ID</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                    {user?.email || 'aarav.sharma@faculty.krmu.edu.in'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmReset(false);
                  closeSettings();
                }}
                className="text-xs font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Session Profile Overview (Hidden for students and faculty per user specification) */}
        {role === 'admin' && (
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
                  Designation / ID
                </span>
                <span className="font-mono text-slate-900 dark:text-slate-100 truncate block">
                  {user?.rollNumber || student?.rollNumber || user?.designation || 'SYS-ADM-01'}
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
        )}

        {/* Interface Theme Section hidden per user specifications */}
        <div className="hidden" aria-hidden="true">
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
