import React, { useState } from 'react';
import {
  Code2,
  Calendar,
  Clock,
  Sparkles,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  ChevronDown,
  Info,
  Users,
  Eye,
  FileText
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CodingLab } from '../../../types';

// Custom 4-layer premium button shadows
const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

const SEMESTER_SUBJECT_OPTIONS = [
  { semester: 3, subject: 'Data Structures & Algorithms', label: 'Semester 3 • Data Structures & Algorithms (CS201)' },
  { semester: 4, subject: 'Database Management Systems', label: 'Semester 4 • Database Management Systems (CS202)' },
  { semester: 5, subject: 'Operating Systems', label: 'Semester 5 • Operating Systems (CS301)' },
  { semester: 6, subject: 'Full Stack Web Development', label: 'Semester 6 • Full Stack Web Development (CS302)' },
  { semester: 7, subject: 'Cloud Computing & DevOps', label: 'Semester 7 • Cloud Computing & DevOps (CS401)' },
  { semester: 1, subject: 'Python Programming Fundamentals', label: 'Semester 1 • Python Programming Fundamentals (CS101)' },
];

export const PublishCodingLabSection: React.FC = () => {
  const { user, courses, globalLabs, createGlobalLab, deleteGlobalLab, labSubmissions, showToast } = useApp();

  // Helper to generate default datetime-local strings
  const getDefaultDates = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    // Start now
    const startStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    // End in 2 hours
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
    
    return { startStr, endStr };
  };

  const defaultDates = getDefaultDates();

  const [isFormOpen, setIsFormOpen] = useState(true);
  const [labTitle, setLabTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [starterCode, setStarterCode] = useState(
`# Write your solution below
def solution():
    """
    Complete the implementation as specified.
    """
    pass
`
  );
  const [assignedSemesterSubject, setAssignedSemesterSubject] = useState(SEMESTER_SUBJECT_OPTIONS[0].label);
  const [windowStartTime, setWindowStartTime] = useState(defaultDates.startStr);
  const [windowEndTime, setWindowEndTime] = useState(defaultDates.endStr);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const handlePublishLab = (e: React.FormEvent) => {
    e.preventDefault();

    if (!labTitle.trim()) {
      showToast({ type: 'error', title: 'Title Required', message: 'Please enter a title for the coding lab.' });
      return;
    }

    if (!problemStatement.trim()) {
      showToast({ type: 'error', title: 'Problem Statement Required', message: 'Please provide the problem statement.' });
      return;
    }

    if (!windowStartTime || !windowEndTime) {
      showToast({ type: 'error', title: 'Time Window Required', message: 'Please specify both start and end times.' });
      return;
    }

    const startMs = new Date(windowStartTime).getTime();
    const endMs = new Date(windowEndTime).getTime();

    if (endMs <= startMs) {
      showToast({ type: 'error', title: 'Invalid Time Window', message: 'End time must be after the start time.' });
      return;
    }

    setIsPublishing(true);

    // Extract semester and subject
    const selectedOption = SEMESTER_SUBJECT_OPTIONS.find(o => o.label === assignedSemesterSubject);
    const semester = selectedOption ? selectedOption.semester : 4;
    const subject = selectedOption ? selectedOption.subject : assignedSemesterSubject;

    const newLab = createGlobalLab({
      title: labTitle.trim(),
      problemStatement: problemStatement.trim(),
      starterCode: starterCode.trim(),
      semester,
      subject,
      windowStartTime,
      windowEndTime,
      createdByFacultyId: user?.id || 'demo_faculty',
      createdByFacultyName: user?.name || 'Faculty Member',
    });

    setIsPublishing(false);
    showToast({
      type: 'success',
      title: 'Coding Lab Published',
      message: `"${newLab.title}" is now published and synced to globalLabs.`,
    });

    // Reset form fields
    setLabTitle('');
    setProblemStatement('');
    setStarterCode(
`# Write your solution below
def solution():
    """
    Complete the implementation as specified.
    """
    pass
`
    );
    const refreshedDates = getDefaultDates();
    setWindowStartTime(refreshedDates.startStr);
    setWindowEndTime(refreshedDates.endStr);
  };

  const getLabStatus = (startStr: string, endStr: string) => {
    const now = Date.now();
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();

    if (now < start) {
      return { status: 'UPCOMING', label: 'Upcoming Window', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800' };
    } else if (now >= start && now <= end) {
      return { status: 'ACTIVE', label: 'Active Window', color: 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800' };
    } else {
      return { status: 'CONCLUDED', label: 'Deadline Passed', color: 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-800' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* 1. Header & Section Container */}
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#0F766E]" />
                <span>Publish New Coding Lab</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create proctored time-gated programming challenges for your assigned cohorts. Synchronized offline to <code className="font-mono text-[#0F766E]">globalLabs</code>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-mono flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>{isFormOpen ? 'Collapse Creator' : 'Expand Creator'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFormOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 2. Interactive Publish Form */}
        {isFormOpen && (
          <form onSubmit={handlePublishLab} className="space-y-5 animate-in fade-in duration-300">
            {/* Grid 1: Title & Semester/Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Lab Title <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={labTitle}
                  onChange={e => setLabTitle(e.target.value)}
                  placeholder="e.g. Python List Comprehensions & Generator Pipelines"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Assigned Semester / Subject <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={assignedSemesterSubject}
                    onChange={e => setAssignedSemesterSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] appearance-none transition-all cursor-pointer"
                  >
                    {SEMESTER_SUBJECT_OPTIONS.map((opt, i) => (
                      <option key={i} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                    {courses && courses.map(c => (
                      <option key={c.id} value={`Semester 4 • ${c.name} (${c.code})`}>
                        Semester 4 • {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid 2: Strict Window Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-teal-500/20 bg-teal-50/20 dark:bg-[#0F766E]/5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Window Start Time <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={windowStartTime}
                  onChange={e => setWindowStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0F766E] transition-all font-mono"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Students cannot open workspace before this time.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span>Window End Time (Deadline) <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={windowEndTime}
                  onChange={e => setWindowEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0F766E] transition-all font-mono"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Workspace permanently locks once deadline expires.
                </p>
              </div>
            </div>

            {/* Field 3: Problem Statement (Markdown Textarea) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Problem Statement (Markdown Supported) <span className="text-red-500">*</span></span>
                </label>
                <div className="flex items-center gap-1 border border-slate-200 dark:border-[#27272A] rounded-lg p-0.5 bg-slate-50 dark:bg-[#18181B]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded ${activeTab === 'edit' ? 'bg-[#0F766E] text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded ${activeTab === 'preview' ? 'bg-[#0F766E] text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {activeTab === 'edit' ? (
                <textarea
                  required
                  rows={5}
                  value={problemStatement}
                  onChange={e => setProblemStatement(e.target.value)}
                  placeholder={`### Problem Description\nWrite a function that accepts a list of integers and returns only the primes in ascending order.\n\n#### Constraints\n- Time Complexity: O(N * sqrt(M))\n- Input: list of integers [1 <= N <= 10^4]\n\n#### Example\nInput: [10, 3, 5, 8, 11]\nOutput: [3, 5, 11]`}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-mono leading-relaxed"
                />
              ) : (
                <div className="min-h-[120px] p-3.5 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-800 dark:text-slate-200 prose prose-invert prose-xs max-w-none whitespace-pre-wrap font-sans">
                  {problemStatement.trim() || <span className="text-slate-400 italic font-mono">No problem statement written yet.</span>}
                </div>
              )}
            </div>

            {/* Field 4: Starter Code (Code-Formatted Textarea) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Starter Code (Python Template)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Pre-loaded into student's code editor</span>
              </label>
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>starter_solution.py</span>
                  </span>
                  <span>UTF-8</span>
                </div>
                <textarea
                  rows={6}
                  value={starterCode}
                  onChange={e => setStarterCode(e.target.value)}
                  className="w-full p-4 text-xs font-mono bg-transparent text-emerald-400 placeholder:text-slate-600 focus:outline-none leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Submit Action Button with Signature 4-layer tactile button shadows */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isPublishing}
                className={`rounded-full bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white text-xs font-semibold px-6 py-2.5 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-2 border border-[#8DA9C4]/30 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'Publishing Lab...' : 'Publish Lab'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Published Coding Labs List (Synced to globalLabs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
              Published Coding Labs ({globalLabs.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Real-time <code className="text-[#0F766E]">localStorage.globalLabs</code>
          </span>
        </div>

        {globalLabs.length === 0 ? (
          /* Signature Empty State per specification: "No Labs Published" */
          <div className="py-12 px-4 text-center border border-dashed border-slate-200 dark:border-[#27272A] rounded-2xl bg-white dark:bg-[#0E0E11] space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto text-[#0F766E]">
              <Code2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                No Labs Published
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No coding challenges have been scheduled yet. Use the form above to publish your first time-windowed lab.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalLabs.map(lab => {
              const statusInfo = getLabStatus(lab.windowStartTime, lab.windowEndTime);
              const submissionsForLab = labSubmissions.filter(s => s.labId === lab.id);
              const breachCount = submissionsForLab.filter(s => s.status === 'SECURITY_BREACH').length;

              return (
                <div
                  key={lab.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#0E0E11] hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete lab "${lab.title}"?`)) {
                            deleteGlobalLab(lab.id);
                            showToast({ type: 'info', title: 'Lab Removed', message: 'Coding lab was deleted.' });
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete Lab"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {lab.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {lab.problemStatement}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/60 dark:border-[#27272A] space-y-1.5 text-[11px] font-mono">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">Cohort:</span>
                        <span>Sem {lab.semester} • {lab.subject}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">Start:</span>
                        <span>{new Date(lab.windowStartTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">End:</span>
                        <span>{new Date(lab.windowEndTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>{submissionsForLab.length} Submissions</span>
                    </span>

                    {breachCount > 0 && (
                      <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-1.5 py-0.5 rounded">
                        {breachCount} Breach Flag
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
