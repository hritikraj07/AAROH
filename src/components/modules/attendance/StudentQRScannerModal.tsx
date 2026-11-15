import React, { useState } from 'react';
import { X, QrCode, Camera, ZoomIn, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface StudentQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentQRScannerModal: React.FC<StudentQRScannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { timetable, user, recordAttendanceEntry, showToast } = useApp();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);

    setTimeout(() => {
      // 1. Read simulated QR payload from active faculty session in localStorage or fallback
      let rawQrString = '';
      try {
        const activeSessionRaw = localStorage.getItem('aaroh_active_qr_session');
        if (activeSessionRaw) {
          const parsed = JSON.parse(activeSessionRaw);
          rawQrString = parsed.token || `${parsed.classId}-${Date.now()}`;
        }
      } catch {
        // ignore
      }

      // If no active session was broadcast, generate a simulated string matching student's first timetable class
      if (!rawQrString) {
        const defaultClass = timetable[0];
        rawQrString = `${defaultClass?.id || 'cs_core_1'}-${Date.now()}`;
      }

      // 2. Parse classId from the simulated QR string (e.g., "classId-timestamp")
      const parsedClassId = rawQrString.split('-')[0];

      // 3. Auto-detect which class it belongs to from the timetable array
      const matchedSession =
        timetable.find(c => c.id === parsedClassId || c.courseId === parsedClassId) ||
        timetable[0];

      const detectedClassName =
        matchedSession?.courseName ||
        matchedSession?.courseCode ||
        'Operating Systems';

      const targetCourseId = matchedSession?.courseId || parsedClassId || 'cs_core';

      // 4. Increment student's attendance for that specific class in localStorage
      recordAttendanceEntry(targetCourseId, 1, 1);

      // 5. Display green success toast: "Attendance marked for [Class Name]"
      showToast({
        type: 'success',
        title: `Attendance marked for ${detectedClassName}`,
        message: 'Verified via dynamic cryptographic campus QR.',
      });

      setIsScanning(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#18181B] border border-[#27272A] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Camera Scanner
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-[#27272A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport with simulated viewfinder box bracket */}
        <div className="relative h-72 bg-[#0E0E11] flex items-center justify-center overflow-hidden select-none">
          {/* Subtle camera lens noise & vignette */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/80 pointer-events-none" />

          {/* Scalable Viewfinder Box Bracket (Scaled by zoom slider) */}
          <div
            style={{ transform: `scale(${zoomLevel})` }}
            className="relative w-52 h-52 border-2 border-teal-500/70 rounded-2xl flex flex-col items-center justify-center transition-transform duration-100 ease-out shadow-2xl bg-teal-950/10 backdrop-blur-xs"
          >
            {/* Viewfinder Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-teal-400 rounded-tl" />
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-teal-400 rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-teal-400 rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-teal-400 rounded-br" />

            {/* Moving Laser Scanner Beam */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] animate-bounce" />

            <QrCode className="w-16 h-16 text-teal-400/40" />
            <span className="text-[10px] font-mono text-teal-300 mt-2 font-medium tracking-wide">
              {isScanning ? 'Verifying Token...' : 'Align QR within frame'}
            </span>
          </div>

          {/* Live Scanner Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-teal-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>OPTICAL SENSOR ACTIVE</span>
          </div>
        </div>

        {/* Bottom Control Surface: Zoom Slider & Simulate Scan Button */}
        <div className="p-5 bg-[#18181B] border-t border-[#27272A] space-y-4">
          {/* Zoom Slider Feature */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-teal-400" />
                Camera Zoom:
              </span>
              <span className="font-bold text-teal-400">{zoomLevel.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500">1x</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoomLevel}
                onChange={e => setZoomLevel(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#27272A] rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <span className="text-[10px] font-mono text-slate-500">3x</span>
            </div>
          </div>

          {/* Simulate Scan Button for demo */}
          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-[#0D6861] active:bg-[#115E59] active:scale-95 text-white font-semibold text-xs transition-all duration-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-teal-200" />
                <span>Processing QR Signature...</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Simulate Scan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
