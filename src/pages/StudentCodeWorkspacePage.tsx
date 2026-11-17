import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  Clock,
  Pause,
  AlertOctagon
} from 'lucide-react';
import { Assignment, SecurityIncident } from '../types';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

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
    return assignment?.status === 'submitted' || assignment?.status === 'SECURITY_BREACH';
  });

  // ==============================================================
  // 1. 2-Strike State Machine & Proctoring Storage
  // ==============================================================
  const [proctorStrikes, setProctorStrikes] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`proctorStrikes_${id}`) || localStorage.getItem('proctorStrikes');
      if (stored) return parseInt(stored, 10) || 0;
      if (assignment?.securityIncident?.strikes) return assignment.securityIncident.strikes;
      if (assignment?.status === 'SECURITY_BREACH') return 2;
    } catch {}
    return 0;
  });

  // Exam Countdown Timer (45 minutes = 2700s default)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`proctor_timer_${id}`);
      if (stored) return parseInt(stored, 10) || 2700;
    } catch {}
    return 2700;
  });
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Warning Modal (Strike 1) & Lockdown Modal (Strike 2)
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [warningTrigger, setWarningTrigger] = useState<'FOCUS_LOST' | 'BIOMETRIC_ANOMALY'>('FOCUS_LOST');
  const [lastViolationTime, setLastViolationTime] = useState<string>('');
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState<boolean>(() => {
    return assignment?.status === 'SECURITY_BREACH' || proctorStrikes >= 2;
  });

  // Keystroke DNA tracking refs
  const lastKeyTimeRef = useRef<number>(Date.now());
  const lastLengthRef = useRef<number>(studentCode.length);

  const course = courses.find(c => c.id === assignment?.courseId);
  const labStatus = assignment?.labStatus || 'locked';

  // Timer Tick Down Loop
  useEffect(() => {
    if (labStatus !== 'active' || isSubmitted || proctorStrikes >= 2 || isTimerPaused) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssignment();
          return 0;
        }
        const next = prev - 1;
        try {
          localStorage.setItem(`proctor_timer_${id}`, String(next));
        } catch {}
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [labStatus, isSubmitted, proctorStrikes, isTimerPaused, id]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ==============================================================
  // Violation Handler (Strike 1 Warning vs Strike 2 Lockdown)
  // ==============================================================
  const handleViolation = (trigger: 'FOCUS_LOST' | 'BIOMETRIC_ANOMALY', customMsg?: string) => {
    if (labStatus !== 'active' || isSubmitted || proctorStrikes >= 2) return;

    const nextStrikes = proctorStrikes + 1;
    setProctorStrikes(nextStrikes);
    const nowTime = new Date().toLocaleTimeString();
    setLastViolationTime(nowTime);

    try {
      localStorage.setItem(`proctorStrikes_${id}`, String(nextStrikes));
      localStorage.setItem('proctorStrikes', String(nextStrikes));
      // Sync backward-compatible fields
      localStorage.setItem('cheatingStrikes', String(nextStrikes));
    } catch (e) {
      console.error('Failed to persist proctor strike:', e);
    }

    // Focus loss notice: 🚨 Focus Lost. Tab switching is recorded during live coding labs.
    const defaultMsg = trigger === 'FOCUS_LOST'
      ? "🚨 Warning: Focus Lost. Tab switching is recorded during live coding labs. Further violations will lock the exam."
      : "🚨 Warning: Biometric Anomaly Detected. Unnatural typing speed or clipboard pasting is strictly prohibited.";

    const msg = customMsg || defaultMsg;

    if (nextStrikes === 1) {
      // Strike 1 Logic (Warning): Pause timer and display prominent, dismissible warning modal
      setIsTimerPaused(true);
      setWarningMessage(msg);
      setWarningTrigger(trigger);
      setWarningModalOpen(true);
    } else if (nextStrikes >= 2) {
      // Strike 2 Logic (Lockdown): Immediately disable textarea, auto-submit, status: SECURITY_BREACH
      setIsTimerPaused(true);
      setWarningModalOpen(false);
      setIsLockdownModalOpen(true);

      const breachIncident: SecurityIncident = {
        strikes: 2,
        reason: msg,
        trigger,
        timestamp: new Date().toISOString(),
        capturedCode: studentCode,
        details: `Exam locked due to repeated proctoring anomaly (${trigger}). Automatically submitted to faculty directory.`,
      };

      if (assignment) {
        submitCodingAssignment(
          assignment.id,
          studentCode,
          'SECURITY_BREACH: 2-Strike Proctoring Violation',
          'SECURITY_BREACH',
          breachIncident
        );
      }

      setIsSubmitted(true);
      setAssignment(prev => prev ? {
        ...prev,
        status: 'SECURITY_BREACH',
        studentCode,
        securityIncident: breachIncident,
      } : null);
    }
  };

  // ==============================================================
  // 2. Zero-Trust Tab Monitor (Violation Trigger A)
  // ==============================================================
  useEffect(() => {
    if (labStatus !== 'active' || isSubmitted || proctorStrikes >= 2) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation(
          'FOCUS_LOST',
          '🚨 Warning: Focus Lost. Tab switching is recorded during live coding labs. Further violations will lock the exam.'
        );
      }
    };

    const handleBlur = () => {
      handleViolation(
        'FOCUS_LOST',
        '🚨 Warning: Focus Lost. Tab switching is recorded during live coding labs. Further violations will lock the exam.'
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [labStatus, isSubmitted, proctorStrikes, studentCode, assignment?.id]);

  // ==============================================================
  // 3. Keystroke DNA Engine (Violation Trigger B)
  // ==============================================================
  // Prevent Copy-Pasting on textarea
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    handleViolation(
      'BIOMETRIC_ANOMALY',
      '🚨 Warning: Biometric Anomaly Detected. Unnatural typing speed or clipboard pasting is strictly prohibited.'
    );
  };

  // Speed Anomaly Detection (>15 characters in <50 milliseconds)
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (proctorStrikes >= 2 || labStatus === 'closed') return;

    const newText = e.target.value;
    const now = Date.now();
    const timeDelta = now - lastKeyTimeRef.current;
    const lengthDelta = newText.length - lastLengthRef.current;

    lastKeyTimeRef.current = now;
    lastLengthRef.current = newText.length;

    if (lengthDelta > 15 && timeDelta < 50) {
      handleViolation(
        'BIOMETRIC_ANOMALY',
        '🚨 Warning: Biometric Anomaly Detected. Unnatural typing speed or clipboard pasting is strictly prohibited.'
      );
      return;
    }

    setStudentCode(newText);
  };

  // Offline Sync via storage listener
  useEffect(() => {
    const handleStorageChange = () => {
      const allAssignments = StorageService.getAssignments();
      const updated = allAssignments.find(a => a.id === id);
      if (updated) {
        setAssignment(prev => {
          if (!prev?.studentCode && updated.starterCode && !studentCode) {
            setStudentCode(updated.starterCode);
          }
          if (updated.status === 'submitted' || updated.status === 'SECURITY_BREACH') {
            setIsSubmitted(true);
          }
          if (updated.status === 'SECURITY_BREACH') {
            setIsLockdownModalOpen(true);
            setProctorStrikes(2);
          }
          return updated;
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id, studentCode]);

  useEffect(() => {
    if (assignment) {
      if (!studentCode) {
        setStudentCode(assignment.studentCode || assignment.starterCode || '');
      }
      if (assignment.status === 'submitted' || assignment.status === 'SECURITY_BREACH') {
        setIsSubmitted(true);
      }
      if (assignment.status === 'SECURITY_BREACH') {
        setIsLockdownModalOpen(true);
        setProctorStrikes(2);
      }
    }
  }, [assignment?.id]);

  if (!assignment) {
    return (
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-12 text-center max-w-lg mx-auto my-8 space-y-3 font-sans">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Automated Coding Lab Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested coding problem could not be located in the local storage registry.
        </p>
        <Link
          to="/student/academics?tab=assignments"
          className="inline-flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline pt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assignments Hub</span>
        </Link>
      </div>
    );
  }

  const handleRunCode = () => {
    if (isCompiling || proctorStrikes >= 2) return;
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

  const handleSubmitAssignment = () => {
    if (labStatus === 'closed' || proctorStrikes >= 2) return;

    submitCodingAssignment(
      assignment.id,
      studentCode,
      executionResult?.summary || 'Manual code submission'
    );
    setIsSubmitted(true);
  };

  const handleResetStarterCode = () => {
    if (proctorStrikes >= 2) return;
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
    <div className="space-y-6 relative font-sans">
      {/* ============================================================== */}
      {/* Strike 1 Warning Modal (Deep Teal & Red text, bg-black/80)    */}
      {/* ============================================================== */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#18181B] border border-rose-500/80 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
            {/* Top Red & Deep Teal Accent Band */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F766E] via-rose-500 to-[#0F766E]" />

            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-7 h-7 text-rose-500" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-[#0F766E] text-teal-300 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Cybersecurity Proctoring: Strike 1 of 2</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-rose-400 font-mono tracking-tight leading-snug">
                {warningMessage}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                The exam timer has been <span className="text-amber-400 font-semibold">paused</span>. Any further window blur, tab switch, clipboard paste, or biometric typing anomaly will trigger immediate lockdown and report as a <span className="text-rose-400 font-bold font-mono">SECURITY_BREACH</span>.
              </p>
            </div>

            <div className="p-3 bg-black/50 border border-white/10 rounded-xl flex items-center justify-around font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Strikes</span>
                <span className="text-base font-bold text-amber-400">1 / 2</span>
              </div>
              <div className="border-l border-white/10 pl-4">
                <span className="text-slate-400 block text-[10px] uppercase">Violation Time</span>
                <span className="text-xs font-semibold text-slate-200">{lastViolationTime || 'Live'}</span>
              </div>
              <div className="border-l border-white/10 pl-4">
                <span className="text-slate-400 block text-[10px] uppercase">Timer Status</span>
                <span className="text-xs font-bold text-amber-400">Paused</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setWarningModalOpen(false);
                setIsTimerPaused(false);
              }}
              className={`w-full py-2.5 px-4 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} cursor-pointer select-none`}
            >
              <span>Acknowledge Warning & Resume Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Strike 2 Lockdown Modal (Lockdown & Auto-Submit as SECURITY_BREACH) */}
      {/* ============================================================== */}
      {isLockdownModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="max-w-lg w-full bg-[#18181B] border-2 border-rose-600 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-600 via-[#0F766E] to-rose-600" />

            <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500 flex items-center justify-center mx-auto text-rose-500 animate-pulse">
              <AlertOctagon className="w-8 h-8 text-rose-500" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-600 text-rose-300 text-xs font-mono font-bold">
                <span>🚨 Zero-Trust Lockdown: Strike 2 of 2</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-rose-400 font-mono tracking-tight">
                Automated Coding Lab Locked
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Maximum proctoring strikes exceeded. Your coding session has been terminated and auto-submitted to the faculty registry flagged with status:
              </p>
              <div className="inline-block font-mono text-xs font-bold text-rose-300 bg-rose-950 border border-rose-600 px-3 py-1 rounded-md">
                status: "SECURITY_BREACH"
              </div>
            </div>

            <div className="p-3 bg-black/60 border border-rose-900/60 rounded-xl text-xs font-mono text-slate-300 text-left space-y-1">
              <div><span className="text-slate-500">Security Incident:</span> Biometric / Focus Anomaly</div>
              <div><span className="text-slate-500">Strikes Recorded:</span> 2 / 2 (Lockout Limit Reached)</div>
              <div><span className="text-slate-500">Captured Code Size:</span> {studentCode.length} characters</div>
              <div><span className="text-slate-500">Breach Timestamp:</span> {lastViolationTime || new Date().toLocaleTimeString()}</div>
            </div>

            <div className="pt-2">
              <Link
                to="/student/academics?tab=assignments"
                className={`inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D6861] rounded-xl transition-all duration-200 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Assignments Hub</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Navigation Bar */}
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

        {/* Status Indicators: Timer & Proctoring Strikes */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Exam Countdown Timer */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-xs font-semibold ${
            isTimerPaused
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 animate-pulse'
              : remainingSeconds < 300
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300'
          }`}>
            <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>{isTimerPaused ? 'TIMER PAUSED' : `REMAINING: ${formatTimer(remainingSeconds)}`}</span>
          </div>

          {/* 2-Strike Proctoring Engine Badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] font-semibold ${
            proctorStrikes >= 2
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-300'
              : proctorStrikes === 1
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              : 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>2-Strike Proctoring:</span>
            <span className={`px-1.5 py-0.2 rounded font-bold ${
              proctorStrikes >= 2
                ? 'bg-rose-600 text-white'
                : proctorStrikes === 1
                ? 'bg-amber-500 text-white'
                : 'bg-[#0F766E] text-white'
            }`}>
              {proctorStrikes} / 2 Strikes
            </span>
          </div>

          <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-2 py-0.5 rounded">
            {assignment.language || 'python'}
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-2 py-0.5 rounded">
            Max: {assignment.maxMarks} Pts
          </span>
        </div>
      </div>

      {/* State 1: LOCKED VIEW */}
      {labStatus === 'locked' && (
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 my-8 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-500 dark:text-slate-400 mx-auto">
            <Lock className="w-7 h-7 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Automated Coding Lab Locked
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
            <span>Zero-trust listener active — will unlock automatically when started</span>
          </div>
        </div>
      )}

      {/* State 2 & 3: ACTIVE or CLOSED SPLIT-SCREEN WORKSPACE */}
      {labStatus !== 'locked' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Lab Status Notice Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] text-xs">
            <div className="flex items-center gap-2">
              {labStatus === 'active' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-semibold text-emerald-800 dark:text-emerald-400 font-mono">
                    LIVE LAB SESSION ACTIVE
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Real-time Zero-Trust Proctoring & Keystroke DNA continuous authentication active
                  </span>
                </>
              ) : (
                <span className="font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-2.5 py-1 rounded-md">
                  Lab Session Ended. Submissions Closed.
                </span>
              )}
            </div>

            {assignment.status === 'SECURITY_BREACH' ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded font-mono">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>SECURITY_BREACH (Locked)</span>
              </span>
            ) : isSubmitted ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assignment Submitted</span>
              </span>
            ) : null}
          </div>

          {/* Split-Screen Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Pane: Problem Description & Read-Only Test Cases */}
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 space-y-6">
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
                      className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-xl font-mono text-xs space-y-1.5"
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
            <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 space-y-4">
              {/* Editor Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase">
                    solution.{assignment.language === 'python' ? 'py' : assignment.language === 'javascript' ? 'js' : 'cpp'}
                  </span>
                </div>

                {labStatus === 'active' && proctorStrikes < 2 && (
                  <button
                    onClick={handleResetStarterCode}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition-transform"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Starter</span>
                  </button>
                )}
              </div>

              {/* Code Editor <textarea> with Keystroke DNA Anomaly and onPaste Interception */}
              <div className="relative">
                {proctorStrikes >= 2 && (
                  <div className="absolute inset-0 z-20 bg-rose-950/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center p-4 border border-rose-500/50">
                    <div className="text-center space-y-1">
                      <Lock className="w-6 h-6 text-rose-400 mx-auto" />
                      <p className="font-mono text-xs font-bold text-rose-300 uppercase tracking-wider">
                        Editor Disabled (Strike 2/2 Lockdown)
                      </p>
                      <p className="text-[11px] text-slate-300 font-mono">
                        Submission locked as SECURITY_BREACH.
                      </p>
                    </div>
                  </div>
                )}

                <textarea
                  readOnly={labStatus === 'closed' || proctorStrikes >= 2}
                  disabled={labStatus === 'closed' || proctorStrikes >= 2}
                  value={studentCode}
                  onChange={handleCodeChange}
                  onPaste={handlePaste}
                  placeholder="Type your code solution here..."
                  className={`w-full h-80 font-mono bg-slate-900 text-slate-100 p-4 rounded-md text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#0F766E] border border-slate-800 resize-y select-text ${
                    labStatus === 'closed' || proctorStrikes >= 2 ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  spellCheck={false}
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1 gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isCompiling || proctorStrikes >= 2}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl active:scale-95 transition-all duration-200 select-none disabled:opacity-50 cursor-pointer ${exactLightShadow} ${exactDarkShadow}`}
                >
                  {isCompiling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F766E]" />
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-[#0F766E] fill-[#0F766E]" />
                      <span>Run Code</span>
                    </>
                  )}
                </button>

                {labStatus === 'active' && proctorStrikes < 2 && (
                  <button
                    type="button"
                    onClick={handleSubmitAssignment}
                    disabled={isCompiling || proctorStrikes >= 2}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] border border-transparent rounded-xl active:scale-95 transition-all duration-200 select-none disabled:opacity-50 cursor-pointer ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}</span>
                  </button>
                )}
              </div>

              {/* Terminal Execution Output Box */}
              {isCompiling && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  <span>Compiling runtime container & executing test assertions...</span>
                </div>
              )}

              {executionResult && !isCompiling && (
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>EXECUTION CONSOLE</span>
                    </div>
                    <span className={executionResult.allPassed ? 'text-emerald-400' : 'text-rose-400'}>
                      {executionResult.passedCount}/{executionResult.totalCount} Passed
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-semibold">
                    <span>{executionResult.summary}</span>
                  </div>

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