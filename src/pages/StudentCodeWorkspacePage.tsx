import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { simulateCodeExecution, CodeExecutionResult } from '../utils/codeGrader';
import {
  Code,
  Lock,
  Play,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  RotateCcw,
  Sparkles,
  FileCode2,
  Layers,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { Assignment } from '../types';

export const StudentCodeWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, submitCodingAssignment, showToast, user } = useApp();

  const [assignment, setAssignment] = useState<Assignment | null>(() => {
    const list = StorageService.getAssignments();
    return list.find(a => a.id === id) || null;
  });

  const [studentCode, setStudentCode] = useState<string>(() => {
    return assignment?.studentCode || assignment?.starterCode || '';
  });

  const [isCompiling, setIsCompiling] = useState(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    return assignment?.status === 'submitted';
  });

  // ==========================================
  // Zero-Trust Exam Proctoring State & Storage
  // ==========================================
  const [cheatingStrikes, setCheatingStrikes] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('cheatingStrikes');
      if (stored) return parseInt(stored, 10) || 0;
      const userRaw = localStorage.getItem('aaroh_auth_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        return u.cheatingStrikes || 0;
      }
    } catch {
      // fallback
    }
    return 0;
  });

  const [isFocusLost, setIsFocusLost] = useState<boolean>(false);
  const [lastViolationTime, setLastViolationTime] = useState<string>('');

  const course = courses.find(c => c.id === assignment?.courseId);
  const labStatus = assignment?.labStatus || 'locked';

  // Strict Browser API Hack: Page Visibility API + window.onblur
  useEffect(() => {
    // Only proctor during active, unsubmitted live coding labs
    if (labStatus !== 'active' || isSubmitted) return;

    const recordFocusLoss = () => {
      const now = new Date().toLocaleTimeString();
      setLastViolationTime(now);
      setIsFocusLost(true);

      // Increment Cheating Strike in student's localStorage profile
      setCheatingStrikes(prev => {
        const next = prev + 1;
        try {
          localStorage.setItem('cheatingStrikes', String(next));

          // Persist to aaroh_auth_user
          const authRaw = localStorage.getItem('aaroh_auth_user');
          if (authRaw) {
            const authObj = JSON.parse(authRaw);
            authObj.cheatingStrikes = next;
            localStorage.setItem('aaroh_auth_user', JSON.stringify(authObj));
          }

          // Persist to aaroh_student
          const stdRaw = localStorage.getItem('aaroh_student');
          if (stdRaw) {
            const stdObj = JSON.parse(stdRaw);
            stdObj.cheatingStrikes = next;
            localStorage.setItem('aaroh_student', JSON.stringify(stdObj));
          }

          // Persist to aaroh_users
          const usersRaw = localStorage.getItem('aaroh_users');
          if (usersRaw) {
            const usersList = JSON.parse(usersRaw);
            if (Array.isArray(usersList)) {
              const updatedUsers = usersList.map((u: any) =>
                u.id === user?.id || u.email === user?.email
                  ? { ...u, cheatingStrikes: next }
                  : u
              );
              localStorage.setItem('aaroh_users', JSON.stringify(updatedUsers));
            }
          }
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.error('Failed to log cheating strike:', e);
        }
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordFocusLoss();
      }
    };

    const handleBlur = () => {
      recordFocusLoss();
    };

    // 1. Page Visibility API listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // 2. Window blur listener and window.onblur assignment
    window.addEventListener('blur', handleBlur);
    window.onblur = handleBlur;

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.onblur = null;
    };
  }, [labStatus, isSubmitted, user?.id, user?.email]);

  // Feature 4: Real-Time Offline Sync via window 'storage' listener
  // Detects if the instructor changes labStatus in another tab/window without page refresh
  useEffect(() => {
    const handleStorageChange = () => {
      const allAssignments = StorageService.getAssignments();
      const updated = allAssignments.find(a => a.id === id);
      if (updated) {
        setAssignment(prev => {
          // If newly loaded or starter code changed
          if (!prev?.studentCode && updated.starterCode && !studentCode) {
            setStudentCode(updated.starterCode);
          }
          if (updated.status === 'submitted') {
            setIsSubmitted(true);
          }
          return updated;
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id, studentCode]);

  // Sync initial student code when assignment is first loaded
  useEffect(() => {
    if (assignment) {
      if (!studentCode) {
        setStudentCode(assignment.studentCode || assignment.starterCode || '');
      }
      if (assignment.status === 'submitted') {
        setIsSubmitted(true);
      }
    }
  }, [assignment?.id]);

  if (!assignment) {
    return (
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-12 text-center max-w-lg mx-auto my-8 space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lab Assignment Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested coding problem could not be located in the local storage registry.
        </p>
        <Link
          to="/student/academics?tab=assignments"
          className="inline-flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline pt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assignments</span>
        </Link>
      </div>
    );
  }

  // Feature 5: Run Code Action (1.5s simulated compilation + mock evaluation)
  const handleRunCode = () => {
    if (isCompiling) return;
    setIsCompiling(true);

    setTimeout(() => {
      const result = simulateCodeExecution(
        studentCode,
        assignment.starterCode,
        assignment.testCases
      );
      setExecutionResult(result);
      setIsCompiling(false);
    }, 1500);
  };

  // Submit Assignment Action
  const handleSubmitAssignment = () => {
    if (labStatus === 'closed') return;

    submitCodingAssignment(
      assignment.id,
      studentCode,
      executionResult?.summary || 'Manual code submission'
    );
    setIsSubmitted(true);
  };

  const handleResetStarterCode = () => {
    if (assignment.starterCode) {
      setStudentCode(assignment.starterCode);
      setExecutionResult(null);
      showToast({
        type: 'info',
        title: 'Editor Reset',
        message: 'Reverted back to starter template.',
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Zero-Trust Exam Proctoring Overlay Banner / Flash */}
      {isFocusLost && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#18181B] border-2 border-rose-500 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden animate-pulse">
            {/* Top red & deep teal accent band */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-600 via-rose-500 to-teal-700" />

            <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-500">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700 text-teal-300 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Trust Proctoring Lockdown</span>
              </div>
              <h2 className="text-xl font-black text-rose-400 font-mono tracking-tight">
                🚨 Focus Lost. Tab switching is recorded during live coding labs.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                The exam proctoring engine detected a window defocus or tab switch via the Page Visibility API. This violation has been logged to your profile.
              </p>
            </div>

            <div className="p-3.5 bg-rose-950/50 border border-rose-900/60 rounded-xl flex items-center justify-around font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Cheating Strikes</span>
                <span className="text-lg font-bold text-rose-400">#{cheatingStrikes}</span>
              </div>
              <div className="border-l border-rose-900/60 pl-4">
                <span className="text-slate-400 block text-[10px] uppercase">Logged At</span>
                <span className="text-xs font-semibold text-slate-200">{lastViolationTime || 'Live'}</span>
              </div>
              <div className="border-l border-rose-900/60 pl-4">
                <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                <span className="text-xs font-bold text-amber-400">Flagged</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFocusLost(false)}
              className="w-full px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Acknowledge & Return to Lab</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#27272A]">
        <div className="flex items-center gap-3">
          <Link
            to="/student/academics?tab=assignments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Assignments</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded">
            {course?.code || 'CS301'}
          </span>
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-md">
            {assignment.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zero-Trust Proctoring Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-mono text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Zero-Trust Proctoring: Active</span>
            {cheatingStrikes > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {cheatingStrikes} Strike{cheatingStrikes === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-2 py-0.5 rounded">
            Language: {assignment.language || 'python'}
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-2 py-0.5 rounded">
            Max: {assignment.maxMarks} Pts
          </span>
        </div>
      </div>

      {/* State 1: LOCKED VIEW */}
      {labStatus === 'locked' && (
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-12 text-center max-w-xl mx-auto space-y-4 my-8 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-500 dark:text-slate-400 mx-auto">
            <Lock className="w-7 h-7 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Live Lab Session Locked
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Lab Session is not active. Waiting for the instructor to open the lab...
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded text-xs text-slate-600 dark:text-slate-300 font-mono">
            {assignment.title} • {course?.name || 'Computer Science'}
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] text-teal-700 dark:text-teal-400 font-mono pt-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Real-time listener active — will unlock automatically when started</span>
          </div>
        </div>
      )}

      {/* State 2 & 3: ACTIVE or CLOSED SPLIT-SCREEN WORKSPACE */}
      {labStatus !== 'locked' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Lab Status Notice Strip */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] text-xs">
            <div className="flex items-center gap-2">
              {labStatus === 'active' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-semibold text-emerald-800 dark:text-emerald-400 font-mono">
                    LIVE LAB SESSION ACTIVE
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Real-time automated evaluation enabled
                  </span>
                </>
              ) : (
                <span className="font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-2.5 py-1 rounded-md">
                  Lab Session Ended. Submissions Closed.
                </span>
              )}
            </div>

            {isSubmitted && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assignment Submitted</span>
              </span>
            )}
          </div>

          {/* Split-Screen Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Pane: Problem Description & Read-Only Test Cases */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-6 space-y-6">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono">
                  PROBLEM SPECIFICATION
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {assignment.title}
                </h3>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans space-y-2 border-t border-b border-slate-100 dark:border-[#27272A] py-4">
                {assignment.description}
              </div>

              {/* Read-Only Test Cases */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                    TEST CASES ({assignment.testCases?.length || 0})
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Read-Only</span>
                </div>

                <div className="space-y-2.5">
                  {(assignment.testCases || []).map((tc, idx) => (
                    <div
                      key={tc.id}
                      className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md font-mono text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        <span>Test Case #{idx + 1}</span>
                      </div>
                      <div className="bg-white dark:bg-[#18181B] p-2 rounded border border-slate-200 dark:border-[#27272A] text-slate-800 dark:text-slate-200 text-[11px]">
                        <span className="text-slate-400 dark:text-slate-500 select-none mr-2">Input:</span>
                        <span>{tc.input}</span>
                      </div>
                      <div className="bg-white dark:bg-[#18181B] p-2 rounded border border-slate-200 dark:border-[#27272A] text-slate-800 dark:text-slate-200 text-[11px]">
                        <span className="text-slate-400 dark:text-slate-500 select-none mr-2">Expected:</span>
                        <span className="text-teal-900 dark:text-teal-300 font-semibold">{tc.expectedOutput}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane: Code Editor & Terminal Output */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-6 space-y-4">
              {/* Editor Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase">
                    solution.{assignment.language === 'python' ? 'py' : assignment.language === 'javascript' ? 'js' : 'cpp'}
                  </span>
                </div>

                {labStatus === 'active' && (
                  <button
                    onClick={handleResetStarterCode}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 active:scale-95 transition-transform"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Starter</span>
                  </button>
                )}
              </div>

              {/* Code Editor <textarea> */}
              <div>
                <textarea
                  readOnly={labStatus === 'closed'}
                  value={studentCode}
                  onChange={e => setStudentCode(e.target.value)}
                  placeholder="Type your code solution here..."
                  className={`w-full h-80 font-mono bg-slate-900 text-slate-100 p-4 rounded-md text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-500 border border-slate-800 resize-y select-text ${
                    labStatus === 'closed' ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
                  spellCheck={false}
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1 gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isCompiling}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md active:scale-95 transition-all duration-200 select-none disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {isCompiling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-teal-700 fill-teal-700" />
                      <span>Run Code</span>
                    </>
                  )}
                </button>

                {labStatus === 'active' && (
                  <button
                    type="button"
                    onClick={handleSubmitAssignment}
                    disabled={isCompiling}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-[#0D6861] active:bg-[#115E59] border border-transparent rounded-md active:scale-95 transition-all duration-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)] select-none disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}</span>
                  </button>
                )}
              </div>

              {/* Terminal Execution Output Box */}
              {isCompiling && (
                <div className="p-4 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  <span>Compiling runtime container & executing test assertions...</span>
                </div>
              )}

              {executionResult && !isCompiling && (
                <div className="rounded-md bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-teal-400" />
                      <span>EXECUTION CONSOLE</span>
                    </div>
                    <span className={executionResult.allPassed ? 'text-emerald-400' : 'text-rose-400'}>
                      {executionResult.passedCount}/{executionResult.totalCount} Passed
                    </span>
                  </div>

                  {/* Summary Bar: "✅ Test 1 Passed | ❌ Test 2 Failed" */}
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-semibold">
                    <span>{executionResult.summary}</span>
                  </div>

                  {/* Detailed Log Output */}
                  <div className="space-y-1 text-[11px] text-slate-400">
                    {executionResult.logs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCodeWorkspacePage;
