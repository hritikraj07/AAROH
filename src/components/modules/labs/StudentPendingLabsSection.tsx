import React, { useState, useEffect } from 'react';
import {
  Code2,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Calendar,
  Sparkles,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CodingLab, LabSubmission } from '../../../types';
import { StudentLabWorkspaceModal } from './StudentLabWorkspaceModal';

// Custom 4-layer premium button shadows
const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

export const StudentPendingLabsSection: React.FC = () => {
  const { user, globalLabs, labSubmissions, refreshGlobalLabs, refreshLabSubmissions } = useApp();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedLab, setSelectedLab] = useState<CodingLab | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted'>('pending');

  const currentStudentId = user?.id || 'demo_student';

  // Live timer tick every 1000ms for strict time validation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter submitted labs vs pending labs
  const studentSubmissions = labSubmissions.filter(s => s.studentId === currentStudentId);
  const submittedLabIds = new Set(studentSubmissions.map(s => s.labId));

  // Pending labs: from globalLabs that have NOT been submitted by this student
  const pendingLabs = globalLabs.filter(lab => !submittedLabIds.has(lab.id));

  // Submitted labs
  const submittedLabs = globalLabs.filter(lab => submittedLabIds.has(lab.id));

  const formatUnlockTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemainingText = (targetDate: Date) => {
    const diffMs = targetDate.getTime() - currentTime.getTime();
    if (diffMs <= 0) return '00:00';
    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const handleOpenLab = (lab: CodingLab) => {
    setSelectedLab(lab);
    setIsWorkspaceOpen(true);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#0F766E]" />
                <span>Automated Coding Labs • Pending Tasks</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proctored university laboratory assessments with zero-trust keystroke authentication and strict submission time windows.
            </p>
          </div>

          {/* Toggle Pending vs Submitted */}
          <div className="flex items-center gap-1 border border-slate-200 dark:border-[#27272A] rounded-xl p-1 bg-slate-50 dark:bg-[#18181B] self-start sm:self-auto font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                activeTab === 'pending'
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Pending Labs ({pendingLabs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('submitted')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                activeTab === 'submitted'
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Submitted ({submittedLabs.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Pending Labs */}
        {activeTab === 'pending' && (
          <div>
            {pendingLabs.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 dark:border-[#27272A] rounded-xl bg-slate-50/50 dark:bg-[#18181B]/50 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#0F766E] mx-auto mb-1" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  All Automated Coding Labs completed on schedule! Great work!
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  There are no pending lab tasks right now. Newly published faculty labs will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingLabs.map(lab => {
                  const startTime = new Date(lab.windowStartTime);
                  const endTime = new Date(lab.windowEndTime);
                  const nowMs = currentTime.getTime();
                  const startMs = startTime.getTime();
                  const endMs = endTime.getTime();

                  // State 1: Too Early
                  const isTooEarly = nowMs < startMs;
                  // State 3: Expired
                  const isExpired = nowMs > endMs;
                  // State 2: Active
                  const isActive = !isTooEarly && !isExpired;

                  return (
                    <div
                      key={lab.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#111115] hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Status Header Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                            Sem {lab.semester} • {lab.subject}
                          </span>

                          {/* Time State Badge */}
                          {isTooEarly && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Starts in {getTimeRemainingText(startTime)}</span>
                            </span>
                          )}

                          {isActive && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-[#0F766E]" />
                              <span>Live: {getTimeRemainingText(endTime)} left</span>
                            </span>
                          )}

                          {isExpired && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Deadline Passed / Locked</span>
                            </span>
                          )}
                        </div>

                        {/* Lab Info */}
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {lab.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {lab.problemStatement}
                          </p>
                        </div>

                        {/* Window Range Info */}
                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200/60 dark:border-[#27272A] space-y-1 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>Window Open:</span>
                            <span className="text-slate-700 dark:text-slate-300">{formatUnlockTime(lab.windowStartTime)}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>Deadline:</span>
                            <span className="text-slate-700 dark:text-slate-300">{formatUnlockTime(lab.windowEndTime)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer with Strict Button Logic */}
                      <div className="pt-3 border-t border-slate-200/60 dark:border-[#27272A] flex items-center justify-between gap-2">
                        {/* State 1: Too Early (Disabled, Deep Teal text countdown/unlock) */}
                        {isTooEarly && (
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-[#0F766E] dark:text-teal-400 font-semibold flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Lab unlocks at {formatUnlockTime(lab.windowStartTime)}</span>
                            </span>
                            <button
                              type="button"
                              disabled
                              className="px-3 py-1.5 rounded-full text-xs font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed"
                            >
                              Open Lab
                            </button>
                          </div>
                        )}

                        {/* State 2: Active (Enabled Open Lab / Launch Workspace button with 4-layer shadow) */}
                        {isActive && (
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                              <span>Proctored Workspace Ready</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenLab(lab)}
                              className={`rounded-full bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] text-white text-xs font-semibold px-4 py-1.5 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
                            >
                              <span>Open Lab</span>
                              <span className="text-[10px] opacity-75 font-mono">• Launch Workspace</span>
                              <ArrowRight className="w-3 h-3 ml-0.5" />
                            </button>
                          </div>
                        )}

                        {/* State 3: Expired (Permanently disabled button with red badge) */}
                        {isExpired && (
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                              Deadline Passed / Locked
                            </span>
                            <button
                              type="button"
                              disabled
                              className="px-3 py-1.5 rounded-full text-xs font-mono font-medium text-red-400 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 opacity-60 cursor-not-allowed"
                            >
                              Open Lab
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Submitted Labs (Read Only Archive) */}
        {activeTab === 'submitted' && (
          <div>
            {submittedLabs.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 dark:border-[#27272A] rounded-xl bg-slate-50/50 dark:bg-[#18181B]/50 text-xs text-slate-500 font-mono">
                No labs submitted yet. Active labs completed will appear in this review archive.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submittedLabs.map(lab => {
                  const submission = studentSubmissions.find(s => s.labId === lab.id);
                  const isBreach = submission?.status === 'SECURITY_BREACH';

                  return (
                    <div
                      key={lab.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#0E0E11] flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            Sem {lab.semester} • {lab.subject}
                          </span>
                          {isBreach ? (
                            <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded">
                              Security Breach
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-[#0F766E] bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#0F766E]" />
                              <span>Final Code Submitted</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {lab.title}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {lab.problemStatement}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-500">
                          {submission?.timestamp ? new Date(submission.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Submitted'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenLab(lab)}
                          className="text-xs font-mono font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review Solution</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Proctored Modal */}
      {selectedLab && (
        <StudentLabWorkspaceModal
          lab={selectedLab}
          isOpen={isWorkspaceOpen}
          onClose={() => setIsWorkspaceOpen(false)}
          onSubmittedSuccess={() => {
            refreshLabSubmissions();
            refreshGlobalLabs();
          }}
        />
      )}
    </div>
  );
};
