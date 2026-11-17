import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle2, AlertCircle, Sparkles, Camera, RefreshCw } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

interface StudentQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentQRScannerModal: React.FC<StudentQRScannerModalProps> = ({ isOpen, onClose }) => {
  const { user, student, recordBatchAttendance, recordAttendanceEntry, showToast } = useApp();
  const currentStudent = user || student;

  const [activeSession, setActiveSession] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  // Poll for active QR broadcast in classroom
  useEffect(() => {
    if (!isOpen) {
      setHasScanned(false);
      setScanMessage(null);
      return;
    }

    const checkActiveSession = () => {
      try {
        const stored = localStorage.getItem('aaroh_active_qr_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setActiveSession(parsed);
        } else {
          setActiveSession(null);
        }
      } catch (e) {
        setActiveSession(null);
      }
    };

    checkActiveSession();
    const interval = setInterval(checkActiveSession, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmScan = () => {
    if (!activeSession) return;
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);

      const studentId = currentStudent?.id || 'demo_student';

      // 1. Record in local QR scans array so teacher manual list updates in real-time
      try {
        const scansRaw = localStorage.getItem('aaroh_qr_attendance_scans');
        const scans = scansRaw ? JSON.parse(scansRaw) : [];
        scans.push({
          studentId,
          studentName: currentStudent?.name || 'Aarav Sharma',
          classId: activeSession.classId,
          courseId: activeSession.courseId,
          timestamp: Date.now(),
        });
        localStorage.setItem('aaroh_qr_attendance_scans', JSON.stringify(scans));
      } catch (e) {
        console.error('Failed to save QR scan:', e);
      }

      // 2. Record batch attendance in app context
      if (activeSession.courseId) {
        recordBatchAttendance(activeSession.courseId, [
          {
            studentId,
            isPresent: true,
          },
        ]);
        if (recordAttendanceEntry) {
          recordAttendanceEntry(activeSession.courseId, 1, 1);
        }
      }

      setScanMessage(`Attendance marked for ${activeSession.courseName || 'Class'}.`);
      showToast?.({
        type: 'success',
        title: 'Attendance Verified',
        message: `Attendance marked for ${activeSession.courseName || 'Class'}`,
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#EEF4ED] dark:bg-[#111115] border border-[#8DA9C4]/30 text-[#134074] dark:text-[#8DA9C4]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Scan Attendance
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Verify classroom attendance with 5-second dynamic QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Camera Simulation */}
        <div className="relative w-full h-52 bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-800 shadow-inner">
          {/* Laser scanning bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8DA9C4] to-transparent animate-pulse shadow-[0_0_12px_#8DA9C4]" />
          
          {/* Viewfinder Crosshairs */}
          <div
            className="w-36 h-36 border-2 border-[#8DA9C4]/40 rounded-xl relative flex items-center justify-center transition-transform duration-100"
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#8DA9C4]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#8DA9C4]" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#8DA9C4]" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#8DA9C4]" />
            
            {hasScanned ? (
              <div className="text-center p-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-1 animate-bounce" />
                <span className="text-[10px] font-mono text-emerald-300 font-bold block uppercase">
                  Verified
                </span>
              </div>
            ) : isScanning ? (
              <div className="text-center p-2">
                <RefreshCw className="w-7 h-7 text-[#8DA9C4] animate-spin mx-auto mb-1" />
                <span className="text-[10px] font-mono text-slate-300">Validating...</span>
              </div>
            ) : (
              <QrCode className="w-12 h-12 text-[#8DA9C4]/40" />
            )}
          </div>

          <div className="absolute bottom-2 text-[10px] font-mono text-slate-400">
            {activeSession ? 'Live classroom beacon detected' : 'Point camera toward teacher\'s display'}
          </div>
        </div>

        {/* Viewfinder Zoom Control Slider */}
        <div className="flex items-center justify-between gap-3 px-1 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="text-[11px]">Optical Zoom: {zoom.toFixed(1)}x</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            className="w-36 accent-[#134074] cursor-pointer"
          />
        </div>

        {/* Status / Active Lecture Card */}
        {hasScanned ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Attendance Recorded</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/90 font-mono">
              {scanMessage}
            </p>
          </div>
        ) : activeSession ? (
          <div className="p-3.5 rounded-xl bg-[#EEF4ED] dark:bg-[#111115] border border-[#8DA9C4]/40 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#134074] dark:text-[#8DA9C4] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Class Found
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Rotates every 5s
              </span>
            </div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {activeSession.courseName}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>Room: {activeSession.room}</span>
              <span>•</span>
              <span className="truncate">Token: {activeSession.token?.slice(0, 14)}...</span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              No live attendance QR session is currently active. Your instructor generates the dynamic QR code during the class lecture.
            </p>
          </div>
        )}

        {/* Action Button */}
        <div>
          {hasScanned ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              disabled={!activeSession || isScanning}
              onClick={handleConfirmScan}
              className={`w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#8DA9C4]" />
              <span>{isScanning ? 'Registering Attendance...' : 'Simulate Scan'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
