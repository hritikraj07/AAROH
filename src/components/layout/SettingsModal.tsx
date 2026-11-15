import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';
import { RotateCcw, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    student,
    updateAttendanceThreshold,
    resetDemoData,
  } = useApp();

  const [threshold, setThreshold] = useState(student.attendanceMinimum || 75);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveThreshold = (val: number) => {
    setThreshold(val);
    updateAttendanceThreshold(val);
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
      title="Application Settings & Demo State"
      subtitle={`${APP_CONFIG.appName} • ${APP_CONFIG.collegeName}`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Student Profile Overview */}
        <div className="p-3.5 bg-slate-50 border border-border rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <UserCheck className="w-4 h-4 text-teal-700" />
            <span>Active Demo Student Profile</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <span className="font-semibold text-slate-900">{student.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Roll Number</span>
              <span className="font-mono text-slate-900">{student.rollNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Program</span>
              <span>{student.program} {student.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Semester</span>
              <span>Sem {student.semester} ({student.section})</span>
            </div>
          </div>
        </div>

        {/* Configurable Attendance Threshold */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-800 block">
            Minimum Attendance Threshold Target
          </label>
          <p className="text-xs text-slate-500">
            College requirement rule used to calculate shortfall warnings and class margins. Default is 75%.
          </p>

          <div className="flex items-center gap-2 pt-1">
            {[70, 75, 80, 85].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleSaveThreshold(val)}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                  threshold === val
                    ? 'bg-teal-50 text-teal-800 border-teal-600 font-semibold ring-1 ring-teal-600'
                    : 'bg-white text-slate-700 border-border hover:bg-slate-50'
                }`}
              >
                {val}% {val === 75 ? '(Default)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Offline & Privacy Guarantee */}
        <div className="p-3 bg-teal-50/50 border border-teal-200/60 rounded-md text-xs text-teal-900 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-teal-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Offline Guarantee</span>
          </div>
          <p className="text-teal-950/80 leading-relaxed text-[11px]">
            All student actions (submissions, event registrations, lost & found postings) are persisted locally in your browser storage. No network queries or remote CDNs are contacted during this demo.
          </p>
        </div>

        {/* Demo Data Reset Section */}
        <div className="p-3.5 bg-rose-50/40 border border-rose-200/60 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Demo Data</span>
            </div>
            {!confirmReset ? (
              <Button
                variant="outline"
                size="sm"
                className="text-rose-700 hover:bg-rose-50 border-rose-200"
                onClick={() => setConfirmReset(true)}
              >
                Reset to Seed Data
              </Button>
            ) : null}
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Re-populates initial seed state (clears custom registrations, restored mock dates relative to today, un-submits test assignments).
          </p>

          {confirmReset && (
            <div className="flex items-center gap-2 pt-2 border-t border-rose-200/70">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs text-rose-800 font-medium">Are you sure?</span>
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
      </div>
    </Modal>
  );
};
