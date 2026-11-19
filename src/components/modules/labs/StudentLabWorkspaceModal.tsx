import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  Lock,
  Terminal,
  Code2,
  FileText,
  AlertOctagon,
  Info
} from 'lucide-react';
import { CodingLab, LabSubmission, SecurityIncident } from '../../../types';
import { useApp } from '../../../context/AppContext';

// Exact custom 4-layer tactile button shadow system
const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

export interface StudentLabWorkspaceModalProps {
  lab: CodingLab;
  isOpen: boolean;
  onClose: () => void;
  onSubmittedSuccess?: () => void;
}

export const StudentLabWorkspaceModal: React.FC<StudentLabWorkspaceModalProps> = ({
  lab,
  isOpen,
  onClose,
  onSubmittedSuccess,
}) => {
  const { user, createLabSubmission, labSubmissions } = useApp();

  // Check if already submitted
  const existingSubmission = labSubmissions.find(
    (s: LabSubmission) => s.labId === lab.id && s.studentId === (user?.id || 'demo_student')
  );

  const [code, setCode] = useState<string>(() => {
    if (existingSubmission) return existingSubmission.submittedCode;
    return lab.starterCode || '';
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!existingSubmission);

  // ==============================================================
  // 1. 2-Strike Cybersecurity Proctoring Engine
  // ==============================================================
  const [proctorStrikes, setProctorStrikes] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`proctorStrikes_${lab.id}`);
      if (stored) return parseInt(stored, 10) || 0;
      if (existingSubmission?.securityIncident?.strikes) return existingSubmission.securityIncident.strikes;
      if (existingSubmission?.status === 'SECURITY_BREACH') return 2;
    } catch {}
    return 0;
  });

  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [warningTrigger, setWarningTrigger] = useState<'FOCUS_LOST' | 'BIOMETRIC_ANOMALY'>('FOCUS_LOST');
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState<boolean>(() => {
    return existingSubmission?.status === 'SECURITY_BREACH' || proctorStrikes >= 2;
  });

  // Calculate window remaining seconds
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    try {
      const endMs = new Date(lab.windowEndTime).getTime();
      const nowMs = Date.now();
      const diffSecs = Math.max(0, Math.floor((endMs - nowMs) / 1000));
      return diffSecs > 0 ? diffSecs : 2700; // fallback 45 mins
    } catch {
      return 2700;
    }
  });

  // Keystroke DNA tracking refs
  const lastKeyTimeRef = useRef<number>(Date.now());
  const lastLengthRef = useRef<number>(code.length);

  // Sync existing submission
  useEffect(() => {
    if (existingSubmission) {
      setIsSubmitted(true);
      setCode(existingSubmission.submittedCode);
      if (existingSubmission.status === 'SECURITY_BREACH') {
        setIsLockdownModalOpen(true);
        setProctorStrikes(2);
      }
    }
  }, [existingSubmission]);

  // Persist strikes in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`proctorStrikes_${lab.id}`, proctorStrikes.toString());
      localStorage.setItem('proctorStrikes', proctorStrikes.toString());
    } catch {}
  }, [proctorStrikes, lab.id]);

  // Timer Tick Loop
  useEffect(() => {
    if (!isOpen || isSubmitted || proctorStrikes >= 2 || isTimerPaused) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit('TIMEOUT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isSubmitted, proctorStrikes, isTimerPaused]);

  // -------------------------------------------------------------
  // VIOLATION TRIGGER A: Zero-Trust Tab / Visibility Monitor
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOpen || isSubmitted || proctorStrikes >= 2) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation(
          'FOCUS_LOST',
          '🚨 Warning: Focus Lost. Tab switching is recorded during live coding labs. Further violations will lock the exam.'
        );
      }
    };

    const handleWindowBlur = () => {
      handleViolation(
        'FOCUS_LOST',
        '🚨 Warning: Focus Lost. Tab switching is recorded during live coding labs. Further violations will lock the exam.'
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isOpen, isSubmitted, proctorStrikes]);

  // -------------------------------------------------------------
  // VIOLATION TRIGGER B: Keystroke DNA & Clipboard Interception
  // -------------------------------------------------------------
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    handleViolation(
      'BIOMETRIC_ANOMALY',
      '🚨 Warning: Biometric Anomaly Detected. Unnatural typing speed or clipboard pasting is strictly prohibited.'
    );
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitted || proctorStrikes >= 2) return;

    const newCode = e.target.value;
    const now = Date.now();
    const timeDelta = now - lastKeyTimeRef.current;
    const lengthDelta = Math.abs(newCode.length - lastLengthRef.current);

    // Keystroke DNA check: impossible typing speed (>15 chars in <50ms)
    if (lengthDelta > 15 && timeDelta < 50) {
      handleViolation(
        'BIOMETRIC_ANOMALY',
        '🚨 Warning: Biometric Anomaly Detected. Unnatural typing speed or clipboard pasting is strictly prohibited.'
      );
      return;
    }

    lastKeyTimeRef.current = now;
    lastLengthRef.current = newCode.length;
    setCode(newCode);
  };

  // State Machine Strike Dispatcher
  const handleViolation = (trigger: 'FOCUS_LOST' | 'BIOMETRIC_ANOMALY', message: string) => {
    if (isSubmitted || proctorStrikes >= 2) return;

    const nextStrikes = proctorStrikes + 1;
    setProctorStrikes(nextStrikes);
    setIsTimerPaused(true);

    if (nextStrikes === 1) {
      // Strike 1: Prominent warning modal
      setWarningTrigger(trigger);
      setWarningMessage(message);
      setWarningModalOpen(true);
    } else if (nextStrikes >= 2) {
      // Strike 2: Lockdown & auto-submit
      setWarningModalOpen(false);
      setIsLockdownModalOpen(true);
      executeLockdownSubmission(trigger);
    }
  };

  const handleAcknowledgeWarning = () => {
    setWarningModalOpen(false);
    setIsTimerPaused(false);
    lastKeyTimeRef.current = Date.now();
    lastLengthRef.current = code.length;
  };

  const executeLockdownSubmission = (trigger: 'FOCUS_LOST' | 'BIOMETRIC_ANOMALY') => {
    const studentId = user?.id || 'demo_student';
    const incident: SecurityIncident = {
      strikes: 2,
      trigger,
      reason: trigger === 'FOCUS_LOST' ? 'Focus lost / tab switch violation' : 'Biometric anomaly / paste violation',
      timestamp: new Date().toISOString(),
      capturedCode: code,
      details: 'Automated 2-Strike proctoring engine locked exam on repeat violation.',
    };

    createLabSubmission({
      studentId,
      studentName: user?.name || 'Aarav Sharma',
      studentEmail: user?.email || 'aarav.sharma@aaroh.edu.in',
      labId: lab.id,
      submittedCode: code,
      timestamp: new Date().toISOString(),
      status: 'SECURITY_BREACH',
      securityIncident: incident,
    });

    setIsSubmitted(true);
    onSubmittedSuccess?.();
  };

  const handleFinalSubmit = (reason?: string) => {
    if (isSubmitted || proctorStrikes >= 2) return;

    const studentId = user?.id || 'demo_student';
    createLabSubmission({
      studentId,
      studentName: user?.name || 'Aarav Sharma',
      studentEmail: user?.email || 'aarav.sharma@aaroh.edu.in',
      labId: lab.id,
      submittedCode: code,
      timestamp: new Date().toISOString(),
      status: 'PENDING_REVIEW',
    });

    setIsSubmitted(true);
    onSubmittedSuccess?.();
  };

  const formatTimer = (totalSecs: number) => {
    if (totalSecs <= 0) return '00:00';
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProblemStatement = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${idx}`}
              className="p-3 my-2 rounded-xl bg-slate-900 text-teal-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed"
            >
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (!trimmed) {
        elements.push(<div key={`sp-${idx}`} className="h-1.5" />);
        return;
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${idx}`} className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-2 font-sans">
            {trimmed.replace(/^#\s+/, '')}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${idx}`} className="text-xs font-bold text-[#0F766E] dark:text-teal-400 font-mono uppercase tracking-wider mt-3 mb-1">
            {trimmed.replace(/^#{2,3}\s+/, '')}
          </h3>
        );
        return;
      }

      const renderInline = (str: string) => {
        const parts = str.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        return parts.map((part, pIdx) => {
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code
                key={pIdx}
                className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-teal-800 dark:text-teal-300 font-mono text-[11px]"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });
      };

      if (/^\d+\.\s+/.test(trimmed)) {
        elements.push(
          <div key={`li-${idx}`} className="flex items-start gap-2 pl-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold shrink-0">
              {trimmed.match(/^\d+\./)?.[0]}
            </span>
            <span className="min-w-0">{renderInline(trimmed.replace(/^\d+\.\s+/, ''))}</span>
          </div>
        );
        return;
      }

      elements.push(
        <p key={`p-${idx}`} className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-sans">
          {renderInline(trimmed)}
        </p>
      );
    });

    return <div className="space-y-1.5">{elements}</div>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] w-full max-w-6xl max-h-[88vh] h-[88vh] rounded-2xl shadow-xl flex flex-col overflow-hidden relative transition-colors">
        
        {/* Workspace Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-[#27272A] bg-slate-50/80 dark:bg-[#18181B] flex items-center justify-between gap-3 shrink-0 select-none">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 shrink-0">
              <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight truncate">
                  {lab.title}
                </h2>
                <span className="whitespace-nowrap shrink-0 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {lab.subject} • Sem {lab.semester}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate hidden sm:block">
                Window: {new Date(lab.windowStartTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} - {new Date(lab.windowEndTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Proctor Security Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors whitespace-nowrap shrink-0 ${
              proctorStrikes === 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                : proctorStrikes === 1
                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800'
            }`}>
              {proctorStrikes === 0 ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Zero-Trust: Secure (0/2)</span>
                </>
              ) : proctorStrikes === 1 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>1 Strike Warning (1/2)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Lockdown (2/2)</span>
                </>
              )}
            </div>

            {/* Countdown Timer */}
            <div className={`whitespace-nowrap shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isTimerPaused
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                : remainingSeconds <= 300
                ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
            }`}>
              <Clock className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400" />
              <span>{isTimerPaused ? 'PAUSED' : formatTimer(remainingSeconds)}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
              title="Close Workspace"
              aria-label="Close Workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dual Panel Body: Left Problem Statement, Right Code Editor */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-[#27272A]">
          
          {/* Left Panel: Problem Statement */}
          <div className="lg:col-span-5 min-w-0 p-5 sm:p-6 overflow-y-auto space-y-5 bg-white dark:bg-[#0E0E11] text-slate-800 dark:text-slate-200 font-sans">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Problem Statement
                </h3>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-sm font-sans leading-relaxed">
                {renderProblemStatement(lab.problemStatement)}
              </div>
            </div>

            {/* University Proctoring Rules Notice */}
            <div className="p-4 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-teal-900 dark:text-teal-300 font-mono uppercase tracking-wider">
                <Info className="w-4 h-4 text-[#0F766E]" />
                <span>Zero-Trust Protocol Active</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                Continuous keystroke dynamics and tab switching monitors are enforcing university exam integrity. 
                Any abnormal clipboard paste or tab loss will trigger the 2-Strike penalty lockdown.
              </p>
            </div>
          </div>

          {/* Right Panel: Code Editor (Textarea with syntax appearance) */}
          <div className="lg:col-span-7 min-w-0 flex flex-col justify-between overflow-hidden bg-slate-950">
            {/* Editor Sub-header */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 select-none">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span>solution.py</span>
                {isSubmitted && (
                  <span className="text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Submitted (Locked)
                  </span>
                )}
                {proctorStrikes >= 2 && !isSubmitted && (
                  <span className="text-[10px] text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked Down
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">Python 3.11 Offline Sandbox</span>
            </div>

            {/* Code Textarea with Keystroke DNA Interceptors */}
            <div className="flex-1 relative overflow-hidden p-2">
              <textarea
                value={code}
                onChange={handleCodeChange}
                onPaste={handlePaste}
                readOnly={isSubmitted || proctorStrikes >= 2}
                placeholder="# Enter your solution here..."
                spellCheck={false}
                className="w-full h-full p-4 font-mono text-xs sm:text-sm bg-transparent text-slate-100 placeholder:text-slate-600 resize-none focus:outline-none leading-relaxed select-text"
                style={{ tabSize: 4 }}
              />
            </div>

            {/* Submission Action Bar */}
            <div className="p-3.5 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-slate-400">
                {isSubmitted ? (
                  <span className="text-teal-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Final Submission Logged • No Further Re-submissions Permitted
                  </span>
                ) : proctorStrikes >= 2 ? (
                  <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                    <AlertOctagon className="w-4 h-4" /> Lab Locked due to Security Breach
                  </span>
                ) : (
                  <span>One-Shot Submission: Verify code before submitting.</span>
                )}
              </div>

              {/* Upload Action Button: Custom 4-Layer Shadow */}
              {isSubmitted ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-xs text-teal-300 bg-teal-950/90 border border-teal-800 opacity-90 cursor-not-allowed select-none"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                  <span>Final Code Submitted</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleFinalSubmit('NORMAL')}
                  disabled={proctorStrikes >= 2}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 rounded-xl transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Lab Request</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 2. STRIKE 1 WARNING MODAL (Deep Teal & Red text, bg-black/80)   */}
      {/* ============================================================== */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl p-6 sm:p-7 shadow-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-800/80 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-7 h-7 text-rose-500 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0F766E] px-2.5 py-1 rounded bg-teal-950 border border-teal-800">
                PROCTORING STRIKE 1 / 2
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                Exam Integrity Warning
              </h3>
            </div>

            <p className="text-sm text-rose-300 font-medium leading-relaxed p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl">
              {warningMessage}
            </p>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              The exam timer has been temporarily paused. Acknowledge this violation to resume the lab.
              A second anomaly will result in immediate exam forfeiture and auto-submission with a Security Breach flag.
            </p>

            <button
              type="button"
              onClick={handleAcknowledgeWarning}
              className={`w-full py-3 px-4 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 rounded-xl transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} cursor-pointer select-none`}
            >
              <span>Acknowledge Warning & Resume Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. STRIKE 2 LOCKDOWN MODAL (Auto-Submitted with SECURITY_BREACH) */}
      {/* ============================================================== */}
      {isLockdownModalOpen && !warningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-800/80 w-full max-w-lg rounded-xl p-6 sm:p-7 shadow-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-950 border border-rose-700 flex items-center justify-center mx-auto text-rose-400">
              <AlertOctagon className="w-7 h-7 text-rose-500" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 px-2.5 py-1 rounded bg-rose-950/80 border border-rose-800">
                PROCTORING STRIKE 2 • SECURITY BREACH
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                Exam Terminated & Locked
              </h3>
            </div>

            <p className="text-sm text-rose-300 font-medium leading-relaxed p-3 bg-rose-950/60 border border-rose-900 rounded-xl">
              Multiple integrity violations detected. Your current code has been auto-submitted and flagged as a Security Breach for Faculty review.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Exit Workspace
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
