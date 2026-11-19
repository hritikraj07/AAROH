import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, QrCode, CheckCircle2, AlertCircle, Camera, RefreshCw, KeyRound, Check } from 'lucide-react';
import jsQR from 'jsqr';
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
  const { user, student, courses, recordBatchAttendance, recordAttendanceEntry, showToast } = useApp();
  const currentStudent = user || student;

  const [activeSession, setActiveSession] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scannedSessionDetails, setScannedSessionDetails] = useState<{
    sessionCode: string;
    subject: string;
    room?: string;
    timestamp: number;
  } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [sessionCodeInput, setSessionCodeInput] = useState<string>('');
  const [codeError, setCodeError] = useState<string | null>(null);

  // Live device camera stream state & lifecycle refs
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'active' | 'error' | 'unsupported'>('idle');
  const [cameraStatusMessage, setCameraStatusMessage] = useState<string>('Initializing camera...');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const isComponentMounted = useRef<boolean>(true);

  // Stop camera stream and release hardware tracks immediately
  const stopCamera = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore track cleanup error
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }
    setStream(null);
    setCameraStatus('idle');
  };

  // Request camera access using environment rear camera first, with desktop webcam fallback
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unsupported');
      setCameraError('Camera access is not supported in this browser environment.');
      return;
    }

    setCameraStatus('requesting');
    setCameraStatusMessage('Requesting camera permission...');

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        // Fallback to default video input on desktop or single-camera devices
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (!isComponentMounted.current) {
        mediaStream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraStatus('active');
      setCameraStatusMessage('Camera permission granted, starting video...');
    } catch (err: any) {
      if (!isComponentMounted.current) return;
      setCameraStatus('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings or use the session code below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera detected on this device. You can check in manually using the session code below.');
      } else {
        setCameraError(`Unable to access camera (${err.message || err.name || 'Unknown error'}). You can use the session code below.`);
      }
    }
  };

  // Manage component mount ref for React StrictMode safety
  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      stopCamera();
    };
  }, []);

  // Manage camera lifecycle based on modal visibility
  useEffect(() => {
    if (isOpen && !hasScanned) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, hasScanned]);

  // Attach stream to <video> as soon as stream and videoRef are available in DOM
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream || !isOpen || hasScanned) return;

    let isCancelled = false;

    const playVideo = async () => {
      try {
        if (video.srcObject !== stream) {
          video.srcObject = stream;
        }
        await video.play();
        if (!isCancelled) {
          setCameraStatusMessage('Point camera at QR code');
        }
      } catch (err: any) {
        // Handle AbortError cleanly when switching or stopping streams
        if (err.name !== 'AbortError' && !isCancelled) {
          console.warn('Video play notice:', err);
          setCameraStatusMessage('Point camera at QR code');
        }
      }
    };

    playVideo();

    return () => {
      isCancelled = true;
    };
  }, [stream, isOpen, hasScanned]);

  // Poll for active QR broadcast in classroom
  useEffect(() => {
    if (!isOpen) {
      setHasScanned(false);
      setScanMessage(null);
      setScannedSessionDetails(null);
      setSessionCodeInput('');
      setCodeError(null);
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
      } catch {
        setActiveSession(null);
      }
    };

    checkActiveSession();
    const interval = setInterval(checkActiveSession, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Execute attendance record and broadcast to faculty roster
  const performCheckIn = (methodLabel: string, overrideSession?: any) => {
    const targetSession = overrideSession || activeSession;
    if (!targetSession) return;

    setIsScanning(true);
    setCodeError(null);

    // Stop active camera immediately once valid code is scanned
    stopCamera();

    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);

      const studentId = currentStudent?.id || currentStudent?.rollNumber || '22CS042';
      const studentName = currentStudent?.name || 'Aarav Sharma';
      const studentRoll = currentStudent?.rollNumber || '22CS042';
      const studentEmail = currentStudent?.email || 'aarav.sharma@aaroh.edu.in';

      const targetSessionId = targetSession.sessionId || targetSession.classId || targetSession.id;
      const targetCourseId = targetSession.courseId || courses?.[0]?.id;
      const targetCode = targetSession.sessionCode;

      // 1. Record in local QR scans array so teacher manual list updates in real time
      try {
        const scansRaw = localStorage.getItem('aaroh_qr_attendance_scans');
        const scans = scansRaw ? JSON.parse(scansRaw) : [];
        const existingIdx = scans.findIndex(
          (s: any) =>
            (s.studentId === studentId || (studentRoll && s.studentRoll === studentRoll) || (studentEmail && s.studentEmail === studentEmail)) &&
            ((targetSessionId && (s.classId === targetSessionId || s.sessionId === targetSessionId)) ||
             (targetCourseId && s.courseId === targetCourseId) ||
             (targetCode && s.sessionCode === targetCode))
        );

        const scanEntry = {
          studentId,
          studentName,
          studentRoll,
          studentEmail,
          classId: targetSessionId,
          sessionId: targetSessionId,
          courseId: targetCourseId,
          sessionCode: targetCode,
          method: methodLabel,
          timestamp: Date.now(),
        };

        if (existingIdx === -1) {
          scans.push(scanEntry);
        } else {
          scans[existingIdx] = scanEntry;
        }
        localStorage.setItem('aaroh_qr_attendance_scans', JSON.stringify(scans));
        window.dispatchEvent(new Event('aaroh_qr_scan_recorded'));
        window.dispatchEvent(new CustomEvent('aaroh_attendance_synced', { detail: scanEntry }));
      } catch {
        // storage fallback
      }

      // 2. Dispatch real-time window event so teacher's roster flips to Present instantly
      window.dispatchEvent(new Event('aaroh_qr_scan_recorded'));

      // 3. Record batch attendance in app context
      if (targetCourseId) {
        recordBatchAttendance(targetCourseId, [
          {
            studentId,
            isPresent: true,
          },
        ]);
        if (recordAttendanceEntry) {
          recordAttendanceEntry(targetCourseId, 1, 1);
        }
      }

      const subjectName = targetSession.subject || targetSession.courseName || 'Class';
      const sessionCode = targetSession.sessionCode || 'Active';
      const room = targetSession.room || 'General Hall';

      setScannedSessionDetails({
        sessionCode,
        subject: subjectName,
        room,
        timestamp: Date.now(),
      });

      setScanMessage(`Attendance marked for ${subjectName}.`);
      showToast?.({
        type: 'success',
        title: 'Attendance Verified',
        message: `Attendance marked for ${subjectName}`,
      });
    }, 450);
  };

  // Decode QR code content from video stream
  const handleDecodedQR = (rawText: string) => {
    if (hasScanned || isScanning) return;

    let targetSession = activeSession;
    let codeStr = '';

    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === 'object') {
        targetSession = { ...activeSession, ...parsed };
        codeStr = parsed.sessionCode || '';
      }
    } catch {
      codeStr = rawText.trim().toUpperCase();
    }

    if (!targetSession) {
      try {
        const stored = localStorage.getItem('aaroh_active_qr_session');
        if (stored) {
          const storedParsed = JSON.parse(stored);
          if (!codeStr || storedParsed.sessionCode === codeStr || storedParsed.token === rawText) {
            targetSession = storedParsed;
          }
        }
      } catch {
        // ignore
      }
    }

    if (!targetSession) {
      targetSession = {
        sessionId: 'session-' + Date.now(),
        sessionCode: codeStr || 'CS-5831',
        subject: 'B.Tech CSE Classroom Session',
        courseId: courses?.[0]?.id || 'cs301',
        room: 'General Hall',
      };
    }

    performCheckIn('LIVE_CAMERA_SCAN', targetSession);
  };

  // Frame processing loop using BarcodeDetector with jsQR canvas fallback
  useEffect(() => {
    if (cameraStatus !== 'active' || !stream || hasScanned) return;

    let isActive = true;
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const barcodeDetector = typeof (window as any).BarcodeDetector !== 'undefined'
      ? new (window as any).BarcodeDetector({ formats: ['qr_code'] })
      : null;

    const tick = async () => {
      if (!isActive || hasScanned) return;

      const video = videoRef.current;
      // Ensure video element has loaded enough data to extract image frames
      if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          let detectedText: string | null = null;

          if (barcodeDetector) {
            try {
              const barcodes = await barcodeDetector.detect(video);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                detectedText = barcodes[0].rawValue;
              }
            } catch {
              // fallback to jsQR canvas decode
            }
          }

          if (!detectedText && ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code && code.data) {
              detectedText = code.data;
            }
          }

          if (detectedText && isActive && !hasScanned) {
            isActive = false;
            handleDecodedQR(detectedText);
            return;
          }
        } catch {
          // ignore temporary frame decode hiccups
        }
      }

      if (isActive && !hasScanned) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      isActive = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [cameraStatus, stream, hasScanned]);

  const handleConfirmScan = () => {
    performCheckIn('QR_SCAN');
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let sessionToUse = activeSession;
    if (!sessionToUse) {
      try {
        const stored = localStorage.getItem('aaroh_active_qr_session');
        if (stored) {
          sessionToUse = JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }

    if (!sessionToUse) {
      setCodeError('No active attendance QR session is currently open in your classroom.');
      return;
    }

    const cleanInput = sessionCodeInput.trim().toUpperCase().replace(/\s/g, '');
    const cleanSessionCode = (sessionToUse.sessionCode || '').toUpperCase().replace(/\s/g, '');

    if (cleanInput && (cleanInput === cleanSessionCode || cleanInput === sessionToUse.token || cleanSessionCode.includes(cleanInput) || cleanInput.includes(cleanSessionCode))) {
      performCheckIn('SESSION_CODE', sessionToUse);
    } else {
      setCodeError(`Invalid session code. Expected format matching "${sessionToUse.sessionCode || 'CS-XXXX'}".`);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-[2px] animate-in fade-in duration-150 font-sans overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
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
            className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 -mt-1 p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Camera Viewfinder / Scanner Area */}
        <div className="relative w-full h-56 bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-800 shadow-inner">
          {/* Always-Mounted Video Element with Ref */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-100 ${
              cameraStatus === 'active' && stream ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ transform: `scale(${zoom})` }}
          />

          {/* Camera Status Overlay (when requesting or error) */}
          {cameraStatus === 'requesting' ? (
            <div className="flex flex-col items-center justify-center text-slate-400 p-4 z-10">
              <RefreshCw className="w-8 h-8 animate-spin text-[#8DA9C4] mb-2" />
              <span className="text-xs font-mono">{cameraStatusMessage}</span>
            </div>
          ) : cameraStatus === 'error' || cameraStatus === 'unsupported' ? (
            <div className="flex flex-col items-center justify-center text-center p-4 max-w-xs space-y-2 z-10">
              <AlertCircle className="w-7 h-7 text-amber-400" />
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {cameraError || 'Camera unavailable'}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer min-h-[32px]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
            </div>
          ) : null}

          {/* Centered Scan Frame Overlay with Corner Accents */}
          <div
            className="w-36 h-36 border-2 border-[#8DA9C4]/40 rounded-xl relative flex items-center justify-center z-10 pointer-events-none transition-transform duration-100"
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#8DA9C4]" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#8DA9C4]" />
            <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#8DA9C4]" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#8DA9C4]" />

            {/* Pulsing Scan Beam */}
            {!hasScanned && cameraStatus === 'active' && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse shadow-[0_0_12px_#2dd4bf]" />
            )}

            {hasScanned ? (
              <div className="text-center p-2 animate-in zoom-in-95 bg-black/50 rounded-lg backdrop-blur-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-1 animate-bounce" />
                <span className="text-[10px] font-mono text-emerald-300 font-bold block uppercase">
                  Verified
                </span>
              </div>
            ) : isScanning ? (
              <div className="text-center p-2 bg-black/50 rounded-lg backdrop-blur-xs">
                <RefreshCw className="w-7 h-7 text-[#8DA9C4] animate-spin mx-auto mb-1" />
                <span className="text-[10px] font-mono text-slate-300">Validating...</span>
              </div>
            ) : (
              <QrCode className="w-10 h-10 text-[#8DA9C4]/35" />
            )}
          </div>

          <div className="absolute bottom-2 z-10 text-[10px] font-mono text-slate-300 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            {cameraStatus === 'active'
              ? cameraStatusMessage
              : activeSession
                ? 'Live classroom beacon detected'
                : 'Point camera toward teacher\'s display'}
          </div>

          {/* Hidden Canvas for QR Frame Extraction */}
          <canvas ref={canvasRef} className="hidden" />
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
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 space-y-1.5">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Attendance Recorded</span>
              </div>
              <span className="text-[10px] font-mono font-normal text-emerald-700 dark:text-emerald-400">
                {new Date(scannedSessionDetails?.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/90 font-mono">
              {scanMessage}
            </p>
            {scannedSessionDetails && (
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-[10px] font-mono">
                <span>Code: <strong className="font-bold">{scannedSessionDetails.sessionCode}</strong></span>
                <span>Room: {scannedSessionDetails.room || 'General Hall'}</span>
              </div>
            )}
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
              {activeSession.subject || activeSession.courseName}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>Room: {activeSession.room}</span>
              <span>•</span>
              <span className="font-bold text-[#134074] dark:text-[#8DA9C4]">Code: {activeSession.sessionCode || 'Active'}</span>
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

        {/* Manual Session Code Input Option */}
        {!hasScanned && (
          <form onSubmit={handleManualCodeSubmit} className="space-y-2 pt-1 border-t border-slate-100 dark:border-[#27272A]">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Or Enter Session Code:</span>
              </span>
              {activeSession?.sessionCode && (
                <span className="text-[10px] text-teal-700 dark:text-teal-400">e.g. {activeSession.sessionCode}</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={sessionCodeInput}
                onChange={e => {
                  setSessionCodeInput(e.target.value);
                  setCodeError(null);
                }}
                placeholder="Enter 6-character code..."
                className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="submit"
                disabled={!sessionCodeInput.trim() || isScanning}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#134074] hover:bg-[#0B2545] disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0"
              >
                Check In
              </button>
            </div>
            {codeError && (
              <p className="text-[10px] font-mono text-rose-600 dark:text-rose-400">
                {codeError}
              </p>
            )}
          </form>
        )}

        {/* Action Button */}
        <div>
          {hasScanned ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 min-h-[44px] text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Done</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!activeSession || isScanning}
              onClick={handleConfirmScan}
              className={`w-full py-2.5 px-4 min-h-[44px] text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#8DA9C4]" />
              <span>{isScanning ? 'Registering Attendance...' : 'Simulate Scan'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

export default StudentQRScannerModal;
