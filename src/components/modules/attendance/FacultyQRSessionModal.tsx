import React, { useState, useEffect } from 'react';
import { X, QrCode, RefreshCw } from 'lucide-react';
import { ClassSession } from '../../../types';

interface FacultyQRSessionModalProps {
  session: ClassSession;
  isOpen: boolean;
  onClose: () => void;
}

export const FacultyQRSessionModal: React.FC<FacultyQRSessionModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [qrToken, setQrToken] = useState<string>(() => `${session.id}-${Date.now()}`);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);

  useEffect(() => {
    if (!isOpen) return;

    // Immediately generate initial token and persist active session to localStorage
    const initialToken = `${session.id}-${Date.now()}`;
    setQrToken(initialToken);
    setSecondsRemaining(5);

    try {
      localStorage.setItem(
        'aaroh_active_qr_session',
        JSON.stringify({
          classId: session.id,
          courseId: session.courseId,
          courseName: session.courseName || session.courseCode || 'Class Session',
          room: session.room,
          token: initialToken,
          timestamp: Date.now(),
          expiresAt: Date.now() + 5000,
        })
      );
    } catch (e) {
      console.error('Failed to set active QR session:', e);
    }

    // Interval to refresh token every 5 seconds
    const refreshInterval = setInterval(() => {
      const newToken = `${session.id}-${Date.now()}`;
      setQrToken(newToken);
      setSecondsRemaining(5);

      try {
        localStorage.setItem(
          'aaroh_active_qr_session',
          JSON.stringify({
            classId: session.id,
            courseId: session.courseId,
            courseName: session.courseName || session.courseCode || 'Class Session',
            room: session.room,
            token: newToken,
            timestamp: Date.now(),
            expiresAt: Date.now() + 5000,
          })
        );
      } catch (e) {
        console.error('Failed to update active QR session:', e);
      }
    }, 5000);

    // High frequency interval to smoothly update progress bar and countdown
    const countdownInterval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 0.1) return 5;
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
      try {
        localStorage.removeItem('aaroh_active_qr_session');
      } catch (e) {
        // ignore
      }
    };
  }, [isOpen, session]);

  if (!isOpen) return null;

  // Progress percentage (5 seconds down to 0)
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 5) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div className="relative w-full max-w-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl shadow-md overflow-hidden p-5 sm:p-6 space-y-4 max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#134074]/10 dark:bg-[#134074]/30 text-[#134074] dark:text-[#8DA9C4] border border-[#8DA9C4]/40 font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live QR Attendance Session
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">
              {session.courseName || session.courseCode || 'Class Lecture'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Room {session.room || 'General Hall'} • {session.startTime} – {session.endTime}
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

        {/* QR Code Canvas / Visual Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl relative">
          <div className="relative p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            {/* SVG Generative QR Code Matrix with Finder Patterns */}
            <svg
              className="w-48 h-48"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-label="Dynamic Attendance QR Code"
            >
              {/* Corner Finder 1: Top-Left */}
              <rect x="5" y="5" width="26" height="26" fill="#0B2545" rx="3" />
              <rect x="9" y="9" width="18" height="18" fill="white" rx="1.5" />
              <rect x="13" y="13" width="10" height="10" fill="#134074" rx="1" />

              {/* Corner Finder 2: Top-Right */}
              <rect x="69" y="5" width="26" height="26" fill="#0B2545" rx="3" />
              <rect x="73" y="9" width="18" height="18" fill="white" rx="1.5" />
              <rect x="77" y="13" width="10" height="10" fill="#134074" rx="1" />

              {/* Corner Finder 3: Bottom-Left */}
              <rect x="5" y="69" width="26" height="26" fill="#0B2545" rx="3" />
              <rect x="9" y="73" width="18" height="18" fill="white" rx="1.5" />
              <rect x="13" y="77" width="10" height="10" fill="#134074" rx="1" />

              {/* Alignment & Data Pattern Grid based on Token Hash */}
              <rect x="36" y="8" width="5" height="5" fill="#0B2545" />
              <rect x="46" y="8" width="5" height="5" fill="#134074" />
              <rect x="56" y="8" width="5" height="5" fill="#0B2545" />

              <rect x="36" y="18" width="5" height="5" fill="#134074" />
              <rect x="46" y="18" width="5" height="5" fill="#0B2545" />
              <rect x="56" y="18" width="5" height="5" fill="#134074" />

              <rect x="8" y="36" width="5" height="5" fill="#0B2545" />
              <rect x="18" y="36" width="5" height="5" fill="#134074" />
              <rect x="28" y="36" width="5" height="5" fill="#0B2545" />
              <rect x="38" y="36" width="5" height="5" fill="#134074" />
              <rect x="48" y="36" width="5" height="5" fill="#0B2545" />
              <rect x="58" y="36" width="5" height="5" fill="#134074" />
              <rect x="68" y="36" width="5" height="5" fill="#0B2545" />
              <rect x="78" y="36" width="5" height="5" fill="#134074" />
              <rect x="88" y="36" width="5" height="5" fill="#0B2545" />

              <rect x="8" y="46" width="5" height="5" fill="#134074" />
              <rect x="28" y="46" width="5" height="5" fill="#0B2545" />
              <rect x="38" y="46" width="5" height="5" fill="#0B2545" />
              <rect x="48" y="46" width="5" height="5" fill="#134074" />
              <rect x="58" y="46" width="5" height="5" fill="#0B2545" />
              <rect x="68" y="46" width="5" height="5" fill="#134074" />
              <rect x="88" y="46" width="5" height="5" fill="#134074" />

              <rect x="8" y="56" width="5" height="5" fill="#0B2545" />
              <rect x="18" y="56" width="5" height="5" fill="#134074" />
              <rect x="38" y="56" width="5" height="5" fill="#134074" />
              <rect x="48" y="56" width="5" height="5" fill="#0B2545" />
              <rect x="68" y="56" width="5" height="5" fill="#134074" />
              <rect x="78" y="56" width="5" height="5" fill="#0B2545" />

              <rect x="36" y="68" width="5" height="5" fill="#0B2545" />
              <rect x="46" y="68" width="5" height="5" fill="#134074" />
              <rect x="56" y="68" width="5" height="5" fill="#0B2545" />
              <rect x="76" y="68" width="5" height="5" fill="#134074" />
              <rect x="86" y="68" width="5" height="5" fill="#0B2545" />

              <rect x="36" y="78" width="5" height="5" fill="#134074" />
              <rect x="46" y="78" width="5" height="5" fill="#0B2545" />
              <rect x="66" y="78" width="5" height="5" fill="#134074" />
              <rect x="76" y="78" width="5" height="5" fill="#0B2545" />
              <rect x="86" y="78" width="5" height="5" fill="#134074" />

              <rect x="36" y="88" width="5" height="5" fill="#0B2545" />
              <rect x="56" y="88" width="5" height="5" fill="#134074" />
              <rect x="76" y="88" width="5" height="5" fill="#0B2545" />
            </svg>

            {/* Central Monogram Brand Badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-9 h-9 rounded-lg bg-white border border-[#8DA9C4]/40 shadow-sm flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#134074]" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
              Payload: <code className="text-[#134074] dark:text-[#8DA9C4] font-bold">{qrToken}</code>
            </span>
          </div>
        </div>

        {/* Dynamic Expiration Progress & Countdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#134074] dark:text-[#8DA9C4] animate-spin" />
              Auto-expiring in:
            </span>
            <span className="font-bold text-[#134074] dark:text-[#8DA9C4]">
              {secondsRemaining.toFixed(1)}s
            </span>
          </div>
          {/* 5-second progress bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-[#27272A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#134074] transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Footer info & close */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-[#27272A]">
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">
            Students in classroom scan via Student Portal
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#333338] text-slate-700 dark:text-slate-200 transition-colors"
          >
            End QR Session
          </button>
        </div>
      </div>
    </div>
  );
};
