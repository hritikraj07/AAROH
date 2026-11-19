import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CodingLab } from '../types';
import { StudentLabWorkspaceModal } from '../components/modules/labs/StudentLabWorkspaceModal';
import { TopographicBg } from '../components/ui/TopographicBg';
import { stripMarkdown } from '../utils/markdownUtils';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';

export const StudentCodingLabsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, globalLabs, labSubmissions, refreshGlobalLabs, refreshLabSubmissions } = useApp();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedLab, setSelectedLab] = useState<CodingLab | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live timer tick for window calculations
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStudentId = user?.id || 'usr_std_demo';
  const studentName = user?.name || 'Aarav Sharma';
  const studentRoll = user?.rollNumber || '22CS042';
  const studentProgram = user?.program || user?.course || 'B.Tech CSE';
  const studentSemester = user?.semester || 5;
  const studentSection = user?.section || user?.division || 'Sec: A';

  // Submissions mapping
  const studentSubmissions = useMemo(() => {
    return labSubmissions.filter(s => s.studentId === currentStudentId || s.studentName === studentName);
  }, [labSubmissions, currentStudentId, studentName]);

  const submissionMap = useMemo(() => {
    const map = new Map<string, typeof studentSubmissions[0]>();
    studentSubmissions.forEach(sub => map.set(sub.labId, sub));
    return map;
  }, [studentSubmissions]);

  // Filtered labs
  const filteredLabs = useMemo(() => {
    return globalLabs.filter(lab => {
      const isSubmitted = submissionMap.has(lab.id);

      // Status filter
      if (statusFilter === 'pending' && isSubmitted) return false;
      if (statusFilter === 'completed' && !isSubmitted) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = lab.title.toLowerCase().includes(q);
        const matchSubj = lab.subject.toLowerCase().includes(q);
        const matchProblem = lab.problemStatement.toLowerCase().includes(q);
        if (!matchTitle && !matchSubj && !matchProblem) return false;
      }

      return true;
    });
  }, [globalLabs, submissionMap, statusFilter, searchQuery]);

  const completedCount = studentSubmissions.length;
  const pendingCount = Math.max(0, globalLabs.length - completedCount);

  const formatDateTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleLaunchLab = (lab: CodingLab) => {
    setSelectedLab(lab);
    setIsWorkspaceModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Breadcrumb & Return to Overview */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/student')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#0F2544] dark:hover:text-white transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Zero-Trust Proctored IDE
          </span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#F0FDF4] via-[#F8FAF8] to-white dark:from-[#0B1512] dark:via-[#111818] dark:to-[#18181B] border border-[#E5ECE8] dark:border-[#27272A] shadow-sm rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5EE] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-400 border border-[#D1E7D8] dark:border-emerald-800/60 font-mono uppercase tracking-wider shadow-2xs">
            <Code2 className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400" />
            <span>K.R. Mangalam University • Department of CSE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2544] dark:text-white font-sans">
            Automated Coding Labs & Assessments
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            Continuous practical evaluations with browser-sandboxed execution, automated unit test suites, and keystroke integrity verification.
          </p>

          {/* Student Context Badges */}
          <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="inline-flex items-center px-3 py-1 rounded-full font-bold bg-white dark:bg-[#27272A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
              Student: {studentName}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full font-mono font-semibold bg-white dark:bg-[#27272A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
              Roll No: {studentRoll}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              {studentProgram} (Sem {studentSemester}) • {studentSection}
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Total Labs</span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {globalLabs.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Curriculum practicals</span>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold block">Pending Labs</span>
          <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400">
            {pendingCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Action required</span>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold block">Completed</span>
          <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
            {completedCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Submitted & graded</span>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold block">Passing Rate</span>
          <div className="text-2xl font-black font-mono text-blue-700 dark:text-blue-400">
            100%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Unit test verification</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700/60 font-mono text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-[#18181B] text-[#0F2544] dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Labs ({globalLabs.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-[#18181B] text-amber-700 dark:text-amber-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-[#18181B] text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search labs by topic or code..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
        </div>
      </div>

      {/* Labs Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredLabs.length === 0 ? (
          <div className="col-span-full py-16 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl text-center space-y-2 p-6">
            <Code2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching coding labs found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search query or status filter above.
            </p>
          </div>
        ) : (
          filteredLabs.map((lab) => {
            const submission = submissionMap.get(lab.id);
            const isSubmitted = !!submission;

            const startTime = new Date(lab.windowStartTime);
            const endTime = new Date(lab.windowEndTime);
            const nowMs = currentTime.getTime();
            const isTooEarly = nowMs < startTime.getTime();
            const isExpired = nowMs > endTime.getTime();
            const isActive = !isTooEarly && !isExpired;

            return (
              <div
                key={lab.id}
                className="min-w-0 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 sm:p-6 shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="min-w-0 space-y-3">
                  {/* Top Metadata Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="whitespace-nowrap shrink-0 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/60">
                      Sem {lab.semester} • {lab.courseId || 'CS-500'}
                    </span>

                    {isSubmitted ? (
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed & Passed
                      </span>
                    ) : isExpired ? (
                      <span className="whitespace-nowrap shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/60 text-red-600 border border-red-200 dark:border-red-900">
                        Deadline Passed
                      </span>
                    ) : isActive ? (
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Active Window
                      </span>
                    ) : (
                      <span className="whitespace-nowrap shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Upcoming
                      </span>
                    )}
                  </div>

                  {/* Subject and Lab Title */}
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium block truncate">
                      {lab.subject}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mt-0.5 truncate">
                      {lab.title}
                    </h3>
                  </div>

                  {/* Problem Snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {stripMarkdown(lab.problemStatement)}
                  </p>

                  {/* Time Window Details */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {isSubmitted ? (
                        <span className="text-emerald-700 dark:text-emerald-400">
                          Submitted {formatDateTime(submission.timestamp)}
                        </span>
                      ) : (
                        <span>Closes: {formatDateTime(lab.windowEndTime)}</span>
                      )}
                    </span>
                    <span>Max: 25 Marks</span>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchLab(lab)}
                    className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSubmitted
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700'
                        : 'bg-[#0F2544] hover:bg-[#0B2545] active:bg-[#081B33] text-white shadow-sm hover:-translate-y-0.5'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{isSubmitted ? 'Review Submitted Code' : 'Launch Lab & Open IDE'}</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Code Workspace Modal */}
      {selectedLab && (
        <StudentLabWorkspaceModal
          lab={selectedLab}
          isOpen={isWorkspaceModalOpen}
          onClose={() => {
            setIsWorkspaceModalOpen(false);
            setSelectedLab(null);
          }}
          onSubmittedSuccess={() => {
            refreshLabSubmissions();
            refreshGlobalLabs();
          }}
        />
      )}
    </div>
  );
};

export default StudentCodingLabsPage;
