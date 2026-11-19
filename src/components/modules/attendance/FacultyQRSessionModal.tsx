import React, { useState, useEffect, useMemo } from 'react';
import { X, QrCode, RefreshCw, Copy, Check, Users, ShieldCheck, Zap } from 'lucide-react';
import QRCode from 'qrcode';
import { ClassSession, User } from '../../../types';

interface FacultyQRSessionModalProps {
  session: ClassSession;
  isOpen: boolean;
  onClose: () => void;
  enrolledStudents?: User[];
  onManualCheckIn?: (studentId: string) => void;
}

export const FacultyQRSessionModal: React.FC<FacultyQRSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  enrolledStudents = [],
  onManualCheckIn,
}) => {
  // Generate a persistent 6-character human-readable session code (e.g. CS-4819)
  const baseSessionCode = useMemo(() => {
    const prefix = (session.courseCode?.replace(/[^a-zA-Z]/g, '').slice(0, 2) || 'CS').toUpperCase();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  }, [session.id]);

  const [qrToken, setQrToken] = useState<string>(() => `${session.id}-${Date.now()}`);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [checkedInScans, setCheckedInScans] = useState<Array<{ studentId: string; studentName?: string; timestamp: number }>>([]);

  const courseName = session.courseName || session.courseCode || 'Class Lecture';
  const division = session.section || 'A';
  const courseProgram = session.program || 'B.Tech CSE';

  // Synchronize live scans for this session
  useEffect(() => {
    if (!isOpen) return;

    const readScans = () => {
      try {
        const raw = localStorage.getItem('aaroh_qr_attendance_scans');
        if (raw) {
          const list: Array<{ studentId: string; studentName?: string; classId?: string; courseId?: string; timestamp: number }> = JSON.parse(raw);
          const currentSessionScans = list.filter(
            s => s.classId === session.id || s.courseId === session.courseId
          );
          setCheckedInScans(currentSessionScans);
        }
      } catch {
        // ignore
      }
    };

    readScans();
    const interval = setInterval(readScans, 1000);
    window.addEventListener('storage', readScans);
    window.addEventListener('aaroh_qr_scan_recorded', readScans);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', readScans);
      window.removeEventListener('aaroh_qr_scan_recorded', readScans);
    };
  }, [isOpen, session.id, session.courseId]);

  // Generate payload & real scannable QR code
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const generateAndBroadcast = async () => {
      const token = `${session.id}-${Date.now()}`;
      setQrToken(token);
      setSecondsRemaining(5);

      const activePayload = {
        sessionId: session.id,
        sessionCode: baseSessionCode,
        course: courseProgram,
        division,
        subject: courseName,
        room: session.room || 'General Hall',
        token,
        timestamp: Date.now(),
        expiresAt: Date.now() + 5000,
      };

      try {
        localStorage.setItem('aaroh_active_qr_session', JSON.stringify(activePayload));
      } catch {
        // storage fallback
      }

      try {
        // Generate scannable QR code image containing the active session payload
        const qrString = JSON.stringify(activePayload);
        const url = await QRCode.toDataURL(qrString, {
          width: 280,
          margin: 1,
          color: {
            dark: '#0B2545',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        if (isMounted) {
          setQrDataUrl(url);
        }
      } catch {
        // fallback
      }
    };

    generateAndBroadcast();

    // 5-second dynamic rotation interval
    const refreshInterval = setInterval(() => {
      generateAndBroadcast();
    }, 5000);

    // Smooth countdown progress interval
    const countdownInterval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 0.1) return 5;
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
      try {
        localStorage.removeItem('aaroh_active_qr_session');
      } catch {
        // ignore
      }
    };
  }, [isOpen, session, baseSessionCode, courseName, division, courseProgram]);

  if (!isOpen) return null;

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 5) * 100));

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(baseSessionCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleQuickDemoCheckIn = (st: User) => {
    try {
      const scansRaw = localStorage.getItem('aaroh_qr_attendance_scans');
      const list = scansRaw ? JSON.parse(scansRaw) : [];
      if (!list.some((s: any) => s.studentId === st.id && (s.classId === session.id || s.courseId === session.courseId))) {
        list.push({
          studentId: st.id,
          studentName: st.name,
          studentRoll: st.rollNumber,
          classId: session.id,
          courseId: session.courseId,
          sessionCode: baseSessionCode,
          timestamp: Date.now(),
        });
        localStorage.setItem('aaroh_qr_attendance_scans', JSON.stringify(list));
        window.dispatchEvent(new Event('aaroh_qr_scan_recorded'));
      }
      onManualCheckIn?.(st.id);
    } catch {
      // ignore
    }
  };

  const pendingStudents = enrolledStudents.filter(
    st => !checkedInScans.some(s => s.studentId === st.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 space-y-4 max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#134074]/10 dark:bg-[#134074]/30 text-[#134074] dark:text-[#8DA9C4] border border-[#8DA9C4]/40 font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live QR Attendance Session
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">
              {courseName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {courseProgram} • Division {division} • Room {session.room || 'General Hall'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer -mr-2 -mt-1"
            aria-label="Close session"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code & Session Code Display Container */}
        <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl relative space-y-3">
          <div className="relative p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Active Classroom Attendance QR Code"
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 sm:w-52 sm:h-52 flex flex-col items-center justify-center bg-slate-50 rounded-lg text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-[#134074]" />
                <span className="text-[11px] font-mono mt-2">Generating QR...</span>
              </div>
            )}
          </div>

          {/* Visible Session Code with 1-Click Copy */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] flex items-center gap-2 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold">
                Session Code:
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#134074] dark:text-[#8DA9C4] tracking-wider">
                {baseSessionCode}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs min-h-[38px]"
              title="Copy session code"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Expiration Progress & Countdown Timer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#134074] dark:text-[#8DA9C4] animate-spin" />
              Auto-rotating QR beacon in:
            </span>
            <span className="font-bold text-[#134074] dark:text-[#8DA9C4]">
              {secondsRemaining.toFixed(1)}s
            </span>
          </div>
          {/* 5-second progress bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-[#27272A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#134074] dark:bg-[#8DA9C4] transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Live Check-In Counter & Feed */}
        <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Live Attendance Check-Ins</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {checkedInScans.length} of {enrolledStudents.length || checkedInScans.length} Present
            </span>
          </div>

          {checkedInScans.length === 0 ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono text-center py-1">
              Waiting for students to scan QR or submit code...
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
              {checkedInScans.map(scan => (
                <span
                  key={scan.studentId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{scan.studentName || scan.studentId}</span>
                </span>
              ))}
            </div>
          )}

          {/* Quick Check-In Demo Row */}
          {pendingStudents.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-[#27272A] flex items-center justify-between gap-2 flex-wrap text-[11px]">
              <span className="text-[10px] font-mono text-slate-400">Quick Check-in:</span>
              <div className="flex flex-wrap gap-1">
                {pendingStudents.slice(0, 3).map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleQuickDemoCheckIn(st)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-[#18181B] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 border border-slate-200 dark:border-[#27272A] transition-colors cursor-pointer flex items-center gap-1"
                    title={`Mark ${st.name} present`}
                  >
                    <Zap className="w-2.5 h-2.5 text-amber-500" />
                    <span>{st.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#27272A]">
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">
            Students scan via Student Portal &gt; Scan Attendance QR
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 min-h-[40px] text-xs font-semibold rounded-xl bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white transition-colors cursor-pointer shadow-xs"
          >
            Review &amp; Finalize Roster
          </button>
        </div>
      </div>
    </div>
  );
};
