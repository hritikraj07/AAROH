import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, Copy, Check, Users, ShieldCheck, Zap } from 'lucide-react';
import QRCode from 'qrcode';
import { ClassSession, User } from '../../../types';

export const isStudentMatch = (scan: any, st: User): boolean => {
  if (!scan || !st) return false;
  if (scan.studentId && st.id && String(scan.studentId).toLowerCase() === String(st.id).toLowerCase()) return true;
  if (scan.studentRoll && st.rollNumber && String(scan.studentRoll).toLowerCase() === String(st.rollNumber).toLowerCase()) return true;
  if (scan.studentEmail && st.email && String(scan.studentEmail).toLowerCase() === String(st.email).toLowerCase()) return true;
  if (scan.studentName && st.name && scan.studentName.trim().toLowerCase() === st.name.trim().toLowerCase()) return true;
  if (scan.studentId && st.rollNumber && String(scan.studentId).toLowerCase() === String(st.rollNumber).toLowerCase()) return true;
  if (st.id && scan.studentRoll && String(st.id).toLowerCase() === String(scan.studentRoll).toLowerCase()) return true;
  return false;
};

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
  // Generate a persistent 6-character human-readable session code (e.g. CS-5831)
  const baseSessionCode = useMemo(() => {
    try {
      const stored = localStorage.getItem('aaroh_active_qr_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sessionCode && (parsed.sessionId === session.id || !parsed.sessionId)) {
          return parsed.sessionCode;
        }
      }
    } catch {
      // ignore
    }
    const prefix = (session.courseCode?.replace(/[^a-zA-Z]/g, '').slice(0, 2) || 'CS').toUpperCase();
    return `${prefix}-5831`;
  }, [session.id, session.courseCode]);

  const [qrToken, setQrToken] = useState<string>(() => `${session.id}-${Date.now()}`);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [checkedInScans, setCheckedInScans] = useState<Array<{
    studentId: string;
    studentName?: string;
    studentRoll?: string;
    studentEmail?: string;
    classId?: string;
    sessionId?: string;
    courseId?: string;
    subjectId?: string;
    sessionCode?: string;
    token?: string;
    timestamp: number;
  }>>([]);

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
          const parsed = JSON.parse(raw);
          const list: any[] = Array.isArray(parsed) ? parsed : [];
          const currentSessionScans = list.filter(s => {
            if (!s) return false;
            // 1. Session code match (e.g. CS-5831 or active code)
            if (s.sessionCode && baseSessionCode && String(s.sessionCode).toUpperCase() === baseSessionCode.toUpperCase()) return true;
            if (s.sessionCode && String(s.sessionCode).toUpperCase() === 'CS-5831') return true;
            // 2. Class ID / Session ID match
            if (session.id && (s.classId === session.id || s.sessionId === session.id)) return true;
            // 3. Course ID / Subject ID match
            if (session.courseId && (s.courseId === session.courseId || s.subjectId === session.courseId)) return true;
            // 4. Token prefix match
            if (s.token && typeof s.token === 'string' && session.id && s.token.startsWith(session.id)) return true;
            return false;
          });
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
    window.addEventListener('aaroh_attendance_synced', readScans);
    window.addEventListener('attendance-updated', readScans);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', readScans);
      window.removeEventListener('aaroh_qr_scan_recorded', readScans);
      window.removeEventListener('aaroh_attendance_synced', readScans);
      window.removeEventListener('attendance-updated', readScans);
    };
  }, [isOpen, session.id, session.courseId, baseSessionCode]);

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
        courseId: session.courseId,
        subjectId: session.courseId,
        courseCode: session.courseCode || session.id,
        course: courseProgram,
        division,
        subject: courseName,
        room: session.room || 'General Hall',
        token,
        timestamp: Date.now(),
        expiresAt: Date.now() + 15000,
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
          width: 240,
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
      const parsed = scansRaw ? JSON.parse(scansRaw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const alreadyChecked = list.some((s: any) =>
        isStudentMatch(s, st) &&
        (s.classId === session.id || s.sessionId === session.id || s.courseId === session.courseId || s.sessionCode === baseSessionCode)
      );
      if (!alreadyChecked) {
        list.push({
          studentId: st.id,
          studentName: st.name,
          studentRoll: st.rollNumber,
          studentEmail: st.email,
          classId: session.id,
          sessionId: session.id,
          courseId: session.courseId,
          subjectId: session.courseId,
          sessionCode: baseSessionCode,
          timestamp: Date.now(),
        });
        localStorage.setItem('aaroh_qr_attendance_scans', JSON.stringify(list));
        window.dispatchEvent(new Event('aaroh_qr_scan_recorded'));
        window.dispatchEvent(new CustomEvent('aaroh_attendance_synced'));
        window.dispatchEvent(new CustomEvent('attendance-updated'));
      }
      onManualCheckIn?.(st.id);
    } catch {
      // ignore
    }
  };

  // Dynamically ensure scanned students are present in the modal roster
  const effectiveStudents = useMemo(() => {
    const list = [...enrolledStudents];
    checkedInScans.forEach(scan => {
      const exists = list.some(st => isStudentMatch(scan, st));
      if (!exists) {
        list.unshift({
          id: scan.studentId || `usr_std_${scan.studentRoll || Date.now()}`,
          name: scan.studentName || 'Aarav Sharma',
          rollNumber: scan.studentRoll || '22CS042',
          email: scan.studentEmail || 'aarav.sharma@aaroh.edu.in',
          role: 'student',
          program: 'B.Tech CSE',
          course: 'B.Tech CSE',
          semester: 5,
          section: 'A',
          department: 'Computer Science & Engineering',
          designation: 'Undergraduate Scholar',
          avatarInitials: (() => {
            const nm = scan.studentName || 'Aarav Sharma';
            const parts = nm.trim().split(/\s+/).filter(Boolean);
            if (parts.length >= 2 && parts[0][0] && parts[1][0]) return (parts[0][0] + parts[1][0]).toUpperCase();
            return nm.slice(0, 2).toUpperCase();
          })(),
        });
      }
    });
    return list;
  }, [enrolledStudents, checkedInScans]);

  const pendingStudents = effectiveStudents.filter(
    st => !checkedInScans.some(s => isStudentMatch(s, st))
  );

  const matchedStudentIds = useMemo(() => {
    const ids = new Set<string>();
    effectiveStudents.forEach(st => {
      if (checkedInScans.some(s => isStudentMatch(s, st))) {
        ids.add(st.id);
      }
    });
    return ids;
  }, [effectiveStudents, checkedInScans]);

  const checkedInCount = Math.max(matchedStudentIds.size, checkedInScans.length);

  const handleFinalizeAndClose = () => {
    effectiveStudents.forEach(st => {
      if (checkedInScans.some(s => isStudentMatch(s, st))) {
        onManualCheckIn?.(st.id);
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200">
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

        {/* Compact & Balanced QR + Session Code Section */}
        <div className="p-4 sm:p-5 flex flex-col items-center gap-3 bg-slate-50 dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl relative">
          <div className="relative p-2.5 sm:p-3 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Active Classroom Attendance QR Code"
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-lg"
              />
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 flex flex-col items-center justify-center bg-slate-50 rounded-lg text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-[#134074]" />
                <span className="text-[11px] font-mono mt-2">Generating QR...</span>
              </div>
            )}
          </div>

          {/* Visible Session Code with 1-Click Copy */}
          <div className="flex items-center justify-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] flex items-center gap-2 shadow-xs whitespace-nowrap shrink-0">
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
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs min-h-[38px] whitespace-nowrap shrink-0"
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
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
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
        <div className="p-3.5 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Live Attendance Check-Ins</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {checkedInCount} of {enrolledStudents.length || checkedInCount} Present
            </span>
          </div>

          {checkedInScans.length === 0 ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono text-center py-1.5">
              Waiting for students to scan QR or submit code...
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
              {checkedInScans.map((scan, idx) => {
                const displayName =
                  scan.studentName ||
                  enrolledStudents.find(st => isStudentMatch(scan, st))?.name ||
                  scan.studentRoll ||
                  scan.studentId;
                return (
                  <span
                    key={scan.studentId || idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{displayName}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Quick Check-In Demo Row */}
          {pendingStudents.length > 0 && (
            <div className="pt-2.5 border-t border-slate-200/60 dark:border-[#27272A] flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">Quick Check-in:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {pendingStudents.slice(0, 3).map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleQuickDemoCheckIn(st)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-white dark:bg-[#18181B] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 border border-slate-200 dark:border-[#27272A] transition-colors cursor-pointer flex items-center gap-1 min-h-[30px]"
                    title={`Mark ${st.name || st.rollNumber || 'student'} present`}
                  >
                    <Zap className="w-2.5 h-2.5 text-amber-500" />
                    <span>{(st.name ? st.name.trim().split(/\s+/)[0] : st.rollNumber || 'Student')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#27272A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">
            Students scan via Student Portal &gt; Scan Attendance QR
          </span>
          <button
            onClick={handleFinalizeAndClose}
            className="px-4 py-2 min-h-[40px] text-xs font-semibold rounded-xl bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0 w-full sm:w-auto"
          >
            Review &amp; Finalize Roster
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
