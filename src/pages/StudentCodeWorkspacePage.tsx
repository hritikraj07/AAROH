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
  Layers
} from 'lucide-react';
import { Assignment } from '../types';

export const StudentCodeWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, submitCodingAssignment, showToast } = useApp();

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
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto my-8 space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900">Lab Assignment Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested coding problem could not be located in the local storage registry.
        </p>
        <Link
          to="/student/academics?tab=assignments"
          className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-semibold hover:underline pt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assignments</span>
        </Link>
      </div>
    );
  }

  const course = courses.find(c => c.id === assignment.courseId);
  const labStatus = assignment.labStatus || 'locked';

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
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/student/academics?tab=assignments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Assignments</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
            {course?.code || 'CS301'}
          </span>
          <h1 className="text-sm font-bold text-slate-900 truncate max-w-md">
            {assignment.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
            Language: {assignment.language || 'python'}
          </span>
          <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
            Max: {assignment.maxMarks} Pts
          </span>
        </div>
      </div>

      {/* State 1: LOCKED VIEW */}
      {labStatus === 'locked' && (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-xl mx-auto space-y-4 my-8 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
            <Lock className="w-7 h-7 text-slate-700" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Live Lab Session Locked
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Lab Session is not active. Waiting for the instructor to open the lab...
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 font-mono">
            {assignment.title} • {course?.name || 'Computer Science'}
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] text-teal-700 font-mono pt-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Real-time listener active — will unlock automatically when started</span>
          </div>
        </div>
      )}

      {/* State 2 & 3: ACTIVE or CLOSED SPLIT-SCREEN WORKSPACE */}
      {labStatus !== 'locked' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Lab Status Notice Strip */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-white text-xs">
            <div className="flex items-center gap-2">
              {labStatus === 'active' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-semibold text-emerald-800 font-mono">
                    LIVE LAB SESSION ACTIVE
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">
                    Real-time automated evaluation enabled
                  </span>
                </>
              ) : (
                <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                  Lab Session Ended. Submissions Closed.
                </span>
              )}
            </div>

            {isSubmitted && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assignment Submitted</span>
              </span>
            )}
          </div>

          {/* Split-Screen Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Pane: Problem Description & Read-Only Test Cases */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                  PROBLEM SPECIFICATION
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {assignment.title}
                </h3>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans space-y-2 border-t border-b border-slate-100 py-4">
                {assignment.description}
              </div>

              {/* Read-Only Test Cases */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    TEST CASES ({assignment.testCases?.length || 0})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Read-Only</span>
                </div>

                <div className="space-y-2.5">
                  {(assignment.testCases || []).map((tc, idx) => (
                    <div
                      key={tc.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Test Case #{idx + 1}</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-slate-800 text-[11px]">
                        <span className="text-slate-400 select-none mr-2">Input:</span>
                        <span>{tc.input}</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-slate-800 text-[11px]">
                        <span className="text-slate-400 select-none mr-2">Expected:</span>
                        <span className="text-teal-900 font-semibold">{tc.expectedOutput}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane: Code Editor & Terminal Output */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
              {/* Editor Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md active:scale-95 transition-transform duration-150 select-none disabled:opacity-50"
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-[#0D6861] border border-transparent rounded-md active:scale-95 transition-transform duration-150 select-none disabled:opacity-50"
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
