import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';
import { Button } from '../../components/ui/Button';
import {
  Settings,
  RotateCcw,
  ShieldCheck,
  Building,
  Check,
  AlertTriangle,
  Sliders
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { student, updateAttendanceThreshold, resetDemoData, showToast } = useApp();

  const [threshold, setThreshold] = useState<number>(student?.attendanceMinimum || 75);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    updateAttendanceThreshold(threshold);
    setSavedSuccess(true);
    showToast({
      type: 'success',
      title: 'Policy Updated',
      message: `Institutional minimum attendance threshold updated to ${threshold}%.`,
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePerformReset = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
    showToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'All courses, notices, events, and sessions reinitialized cleanly.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
          Institutional System Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure campus parameters, regulatory thresholds, RBAC domain policies, and system maintenance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Institutional Parameters & Regulatory Thresholds */}
        <div className="space-y-6">
          {/* Institutional Branding */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <Building className="w-4 h-4 text-teal-800 dark:text-teal-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Institution Identity</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Institution Full Title</label>
                <div className="p-2.5 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded font-semibold text-slate-800 dark:text-slate-200">
                  {APP_CONFIG.collegeName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Software Wordmark</label>
                  <div className="p-2 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded font-mono font-bold text-slate-900 dark:text-slate-100">
                    {APP_CONFIG.appName}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">College Short Code</label>
                  <div className="p-2 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded font-mono font-bold text-slate-900 dark:text-slate-100">
                    {APP_CONFIG.collegeShortName}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Institutional labels are configured centrally in <code className="font-mono">src/config.ts</code> for institutional branding.
              </p>
            </div>
          </div>

          {/* Attendance Regulation Settings */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <Sliders className="w-4 h-4 text-teal-800 dark:text-teal-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Attendance Regulatory Policy
              </h3>
            </div>

            <form onSubmit={handleSaveThreshold} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Mandatory Cutoff Threshold
                  </label>
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {threshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={90}
                  step={5}
                  value={threshold}
                  onChange={e => setThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>50%</span>
                  <span>75% (UGC Standard)</span>
                  <span>90%</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Students dropping below this threshold are automatically flagged as attendance defaulters in dashboard analytics and course warnings.
              </p>

              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm" className="min-h-[44px]">
                  Update Regulation Policy
                </Button>
                {savedSuccess && (
                  <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: RBAC Domain Routing & Demo Reset */}
        <div className="space-y-6">
          {/* RBAC Domain Security */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <ShieldCheck className="w-4 h-4 text-teal-800 dark:text-teal-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Role-Based Domain Governance
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Student Clearance</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dashboard, Academics, Notices, Events, Opportunities
                  </span>
                </div>
                <code className="font-mono text-teal-800 dark:text-teal-300 font-bold text-[11px] bg-white dark:bg-[#18181B] px-2 py-0.5 rounded border border-slate-200 dark:border-[#27272A]">
                  @aaroh.edu.in
                </code>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Faculty Clearance</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Classes, Roll Logger, Coursework, Grading
                  </span>
                </div>
                <code className="font-mono text-teal-800 dark:text-teal-300 font-bold text-[11px] bg-white dark:bg-[#18181B] px-2 py-0.5 rounded border border-slate-200 dark:border-[#27272A]">
                  @faculty.aaroh.edu.in
                </code>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Administration Clearance</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Full Console, Timetable Engine, Events, Notices
                  </span>
                </div>
                <code className="font-mono text-teal-800 dark:text-teal-300 font-bold text-[11px] bg-white dark:bg-[#18181B] px-2 py-0.5 rounded border border-slate-200 dark:border-[#27272A]">
                  @admin.aaroh.edu.in
                </code>
              </div>
            </div>
          </div>

          {/* Clean Reset Demo Data Card */}
          <div className="bg-white dark:bg-[#18181B] border border-rose-200 dark:border-rose-900/60 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-rose-100 dark:border-rose-900/40">
              <RotateCcw className="w-4 h-4 text-rose-700 dark:text-rose-400" />
              <h3 className="text-sm font-semibold text-rose-950 dark:text-rose-200">Maintenance & State Reset</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Reset all client-side storage state back to pristine empty foundation. This clears custom notices, created events, timetable entries, and reset attendance logs.
            </p>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />}
                onClick={() => setIsResetConfirmOpen(true)}
                className="border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 min-h-[44px]"
              >
                Reset Demo Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm max-w-md w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Confirm Demo Data Reset?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This action will reinitialize all database entities (courses, timetable, circulars, events, student records) to initial blank state. Active sessions will require re-login.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-[44px]"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="min-h-[44px]"
                onClick={handlePerformReset}
              >
                Confirm Full Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
