import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  Check, 
  Zap, 
  ZapOff, 
  Smartphone, 
  Info, 
  Scan,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  ChevronRight,
  Bookmark,
  Volume2,
  VolumeX,
  Layers,
  Edit3,
  HelpCircle,
  Key
} from 'lucide-react';
import { ScanPreset, scanOMRFrameFromCanvas, simulateStudentSheet } from '../services/omrService';
import { AnswerKey, GradedResult } from '../types';
import { getLetterGrade } from '../utils/gradeSlipUtils';

interface CameraViewfinderProps {
  onCapture: (imageDataUrl: string, scanPreset: ScanPreset, studentName: string) => void;
  onFastSaveNext?: (result: GradedResult, imageDataUrl: string) => void;
  onManualOverride?: (answers: { [key: number]: string }, studentName: string, image: string) => void;
  onCancel: () => void;
  testName: string;
  totalQuestions: number;
  activeAnswerKey?: AnswerKey | null;
  savedKeys?: AnswerKey[];
  onSelectKey?: (key: AnswerKey) => void;
  existingResultsCount?: number;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onCapture,
  onFastSaveNext,
  onManualOverride,
  onCancel,
  testName,
  totalQuestions,
  activeAnswerKey,
  savedKeys = [],
  onSelectKey,
  existingResultsCount = 0
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  // Torch/Flashlight state
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);

  // Sound and Lock status
  const [speedInkEnabled, setSpeedInkEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isLiveScanning, setIsLiveScanning] = useState<boolean>(false);

  // Shutter / Save flash animation
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<string>('');

  // Continuous paper counter for < 5s rapid grading
  const [paperIndex, setPaperIndex] = useState<number>(existingResultsCount + 1);
  const [simulatedStudentName, setSimulatedStudentName] = useState<string>(`Candidate #${existingResultsCount + 1}`);
  const [selectedPreset, setSelectedPreset] = useState<ScanPreset>('cv_real');
  const [showSimSelector, setShowSimSelector] = useState<boolean>(false);
  const [showKeySelector, setShowKeySelector] = useState<boolean>(false);
  const [showManualOverrideDrawer, setShowManualOverrideDrawer] = useState<boolean>(false);

  // Selected Answer Key (fall back to first saved key if none active)
  const currentKey = activeAnswerKey || (savedKeys.length > 0 ? savedKeys[0] : null);
  const qCount = currentKey?.questionsCount || totalQuestions || 20;

  // Live Answers Map (detected from live camera or simulated preset)
  const [liveAnswers, setLiveAnswers] = useState<{ [key: number]: string }>({});

  // Helper to safely get the correct key answer for question Q
  const getCorrectKeyAnswer = useCallback((q: number): string => {
    if (!currentKey?.answers) {
      return ['A', 'B', 'C', 'D'][(q - 1) % 4];
    }
    const val = currentKey.answers[q] ?? (currentKey.answers as any)[String(q)];
    if (val && typeof val === 'string' && val.trim()) {
      return val.trim().toUpperCase();
    }
    return ['A', 'B', 'C', 'D'][(q - 1) % 4];
  }, [currentKey]);

  // Generate initial simulated answers if not live computer vision
  useEffect(() => {
    if (selectedPreset !== 'cv_real') {
      const confLog = simulateStudentSheet(selectedPreset, currentKey, qCount);
      const map: { [key: number]: string } = {};
      confLog.forEach(c => {
        map[c.questionNumber] = c.detected;
      });
      setLiveAnswers(map);
    }
  }, [selectedPreset, currentKey, qCount, paperIndex]);

  // REAL-TIME COMPUTER VISION FRAME ANALYZER LOOP
  useEffect(() => {
    let intervalId: any;

    if (selectedPreset === 'cv_real' && isCameraActive && hasCamera) {
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
        offscreenCanvasRef.current.width = 640;
        offscreenCanvasRef.current.height = 800;
      }

      intervalId = setInterval(() => {
        const video = videoRef.current;
        const canvas = offscreenCanvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

        try {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Grid bounds matching the on-screen visual viewfinder frame
          const corners = {
            tl: { x: canvas.width * 0.08, y: canvas.height * 0.08 },
            tr: { x: canvas.width * 0.92, y: canvas.height * 0.08 },
            bl: { x: canvas.width * 0.08, y: canvas.height * 0.92 },
            br: { x: canvas.width * 0.92, y: canvas.height * 0.92 }
          };

          const detectedResults = scanOMRFrameFromCanvas(
            ctx,
            canvas.width,
            canvas.height,
            qCount,
            corners,
            currentKey
          );

          const updatedMap: { [key: number]: string } = {};
          detectedResults.forEach(r => {
            updatedMap[r.questionNumber] = r.detected;
          });

          setLiveAnswers(updatedMap);
          setIsLiveScanning(true);
        } catch (e) {
          console.warn('Real-time frame scan exception:', e);
        }
      }, 240); // 4 FPS real-time live vision sampling
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedPreset, isCameraActive, hasCamera, qCount, currentKey]);

  // Compute live score
  let calculatedScore = 0;
  for (let q = 1; q <= qCount; q++) {
    const studentAns = (liveAnswers[q] || '').trim().toUpperCase();
    const correctAns = getCorrectKeyAnswer(q);
    if (studentAns && studentAns === correctAns) {
      calculatedScore++;
    }
  }

  const livePercentage = Math.round((calculatedScore / (qCount > 0 ? qCount : 1)) * 100);
  const { grade: liveGrade, color: liveGradeColor } = getLetterGrade(livePercentage);

  // Callback ref to attach stream directly to the video element
  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      if (node.srcObject !== streamRef.current) {
        node.srcObject = streamRef.current;
      }
      node.setAttribute('playsinline', 'true');
      node.setAttribute('webkit-playsinline', 'true');
      node.muted = true;
      node.play().catch(e => console.warn('Video play error on mount:', e));
    }
  }, []);

  // Stop camera tracks cleanly
  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
    setTorchSupported(false);
  }, []);

  // Initialize camera with progressive fallbacks
  const setupCamera = useCallback(async () => {
    stopCurrentStream();
    setCameraError('');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setHasCamera(false);
      setIsCameraActive(false);
      setCameraError('Live camera stream restricted. Tap "Native Cam" or Gallery below.');
      return;
    }

    const constraintList: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        },
        audio: false
      },
      {
        video: {
          facingMode: { ideal: facingMode }
        },
        audio: false
      },
      ...(facingMode === 'environment' ? [{ video: { facingMode: 'environment' }, audio: false }] : []),
      {
        video: true,
        audio: false
      }
    ];

    let acquiredStream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintList) {
      try {
        acquiredStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (acquiredStream) break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (acquiredStream) {
      streamRef.current = acquiredStream;
      setHasCamera(true);
      setIsCameraActive(true);

      try {
        const videoTrack = acquiredStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any;
          if (capabilities && 'torch' in capabilities) {
            setTorchSupported(true);
          }
        }
      } catch (e) {
        console.warn('Torch detection error:', e);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = acquiredStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play exception:', playErr);
        }
      }
    } else {
      setHasCamera(false);
      setIsCameraActive(false);
      const isPermissionDenied = lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError';
      if (isPermissionDenied) {
        setCameraError('Camera permission blocked. Use "Native Cam" or enable camera permissions.');
      } else {
        setCameraError(lastError?.message || 'Camera stream unavailable. Tap "Native Cam" below.');
      }
    }
  }, [facingMode, stopCurrentStream]);

  useEffect(() => {
    setupCamera();
    return () => {
      stopCurrentStream();
    };
  }, [setupCamera, stopCurrentStream]);

  const toggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        const nextState = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      }
    } catch (err) {
      console.warn('Torch toggle error:', err);
    }
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const captureFromVideo = (): string => {
    if (!videoRef.current) return '';
    try {
      const video = videoRef.current;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.drawImage(video, 0, 0, width, height);
      return canvas.toDataURL('image/jpeg', 0.92);
    } catch (e) {
      console.warn('Canvas capture error:', e);
      return '';
    }
  };

  const playGradingFeedbackSound = () => {
    if (!soundEnabled || typeof window === 'undefined' || !(window.AudioContext || (window as any).webkitAudioContext)) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  };

  // FAST SAVE & NEXT PAPER (< 5 SECONDS PER SHEET)
  const handleSaveAndNextPaper = () => {
    setIsFlashing(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
    playGradingFeedbackSound();
    setTimeout(() => setIsFlashing(false), 180);

    const capturedUrl = (isCameraActive && videoRef.current) ? captureFromVideo() : '';
    const currentName = simulatedStudentName.trim() || `Candidate #${paperIndex}`;
    const nextIdx = paperIndex + 1;

    const newResult: GradedResult = {
      id: 'res_' + Date.now(),
      candidateName: currentName,
      candidateId: 'STUD_' + Math.floor(100 + Math.random() * 900),
      testName: currentKey?.title || testName || 'OMR Exam',
      className: currentKey?.className || 'General Class',
      score: calculatedScore,
      totalQuestions: qCount,
      percentage: livePercentage,
      scannedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      answers: { ...liveAnswers },
      status: 'Synced',
      flaggedCount: Object.values(liveAnswers).filter(a => !a || a === 'BLANK' || a === 'MULTIPLE').length,
      answerKeyId: currentKey?.id || 'default_key',
      imageThumbnail: capturedUrl || 'SPEED_INK_CAPTURE',
    };

    if (onFastSaveNext) {
      onFastSaveNext(newResult, capturedUrl);
    } else {
      onCapture(capturedUrl || 'SPEED_INK_CAPTURE', selectedPreset, currentName);
    }

    setSavedToast(`✔ Saved ${currentName} (${calculatedScore}/${qCount})`);
    setTimeout(() => setSavedToast(''), 2200);

    setPaperIndex(nextIdx);
    setSimulatedStudentName(`Candidate #${nextIdx}`);
  };

  const handleTriggerCapture = () => {
    setIsFlashing(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setTimeout(() => setIsFlashing(false), 200);

    let capturedUrl = '';
    if (isCameraActive && videoRef.current) {
      capturedUrl = captureFromVideo();
    }

    const finalStudentName = simulatedStudentName.trim() || `Candidate #${paperIndex}`;

    onCapture(
      capturedUrl || 'MOCK_OMR_SHEET_PREVIEW',
      capturedUrl ? (selectedPreset === 'cv_real' ? 'cv_real' : selectedPreset) : (selectedPreset === 'cv_real' ? 'sim_realistic' : selectedPreset),
      finalStudentName
    );
  };

  // Direct toggle on any bubble mark
  const handleManualBubbleToggle = (qNum: number, opt: string) => {
    setLiveAnswers(prev => ({
      ...prev,
      [qNum]: prev[qNum] === opt ? '' : opt
    }));
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 150);
        const finalStudentName = simulatedStudentName.trim() || file.name.replace(/\.[^/.]+$/, "") || `Candidate #${paperIndex}`;
        onCapture(result, 'cv_real', finalStudentName);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getPresetLabel = (preset: ScanPreset) => {
    switch (preset) {
      case 'cv_real': return 'Live Auto CV';
      case 'sim_realistic': return 'Realistic (85%)';
      case 'sim_struggling': return 'Struggling (50%)';
      case 'sim_audit': return 'Flagged / Audit';
      case 'sim_perfect': return 'Perfect (100%)';
    }
  };

  // Columns: 2 cols for <= 20 questions, 3 or 4 for > 20
  const colsCount = qCount > 30 ? 4 : (qCount > 20 ? 3 : (qCount >= 10 ? 2 : 1));
  const questionsPerCol = Math.ceil(qCount / colsCount);

  return (
    <div id="camera_scan_viewfinder" className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Shutter White Flash overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 opacity-90 transition-opacity duration-150 pointer-events-none" />
      )}

      {/* Instant Saved Toast Notification */}
      {savedToast && (
        <div className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-2xl font-black text-xs sm:text-sm flex items-center gap-2 border-2 border-white animate-bounce">
          <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-slate-950 text-emerald-300 shrink-0" />
          <span className="truncate">{savedToast}</span>
        </div>
      )}

      {/* TOP HEADER CONTROLS BAR (Compact for iPhone SE 375x667) */}
      <div className="bg-slate-900/95 backdrop-blur-md px-2 sm:px-4 py-1.5 sm:py-2.5 border-b border-slate-800 flex items-center justify-between z-30 shrink-0 gap-1.5">
        
        {/* Left: Active Answer Key Picker */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowKeySelector(true)}
            className="flex items-center gap-1 bg-emerald-950/90 text-emerald-300 border border-emerald-600/70 hover:bg-emerald-900 px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold transition shadow-xs"
            title="Select Active Answer Key"
          >
            <Key className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[170px]">
              {currentKey?.title || testName || 'Master Key'}
            </span>
            <span className="text-[9px] bg-emerald-800/80 px-1 py-0.2 rounded text-white font-mono">
              {qCount}Q
            </span>
          </button>
        </div>

        {/* Center: Candidate / Paper Name */}
        <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2 py-0.5 sm:py-1 rounded-xl">
          <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          <input 
            id="viewfinder_student_input"
            type="text" 
            value={simulatedStudentName}
            onChange={(e) => setSimulatedStudentName(e.target.value)}
            className="bg-transparent border-none text-[10px] sm:text-xs font-bold text-white placeholder-slate-400 focus:outline-none w-20 sm:w-32 font-sans text-center"
            placeholder="Candidate"
          />
        </div>

        {/* Right: Action Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`p-1.5 sm:p-2 rounded-xl border transition ${
              soundEnabled ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Flashlight Toggle */}
          {torchSupported && isCameraActive && (
            <button
              id="btn_toggle_torch"
              onClick={toggleTorch}
              className={`p-1.5 sm:p-2 rounded-xl border transition ${
                isTorchOn 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title={isTorchOn ? "Flashlight Off" : "Flashlight On"}
            >
              {isTorchOn ? <Zap className="w-3.5 h-3.5 fill-current" /> : <ZapOff className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Flip Camera */}
          {hasCamera && isCameraActive && (
            <button
              id="btn_flip_camera"
              onClick={handleFlipCamera}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition"
              title="Switch Front/Rear Camera"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {/* Close / Exit */}
          <button 
            id="btn_cancel_scan"
            onClick={onCancel}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 border border-slate-700 transition"
            title="Exit Scanner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN CAMERA VIEWPORT CONTAINER */}
      <div className="relative flex-1 flex flex-col items-center justify-center bg-black overflow-hidden select-none min-h-0">
        
        {/* Real Live Camera Video Stream */}
        <video 
          ref={handleVideoRef}
          autoPlay 
          playsInline 
          muted
          controls={false}
          disablePictureInPicture
          onLoadedMetadata={(e) => {
            e.currentTarget.play().catch(err => console.warn('Video play error:', err));
          }}
          className={`absolute inset-0 w-full h-full object-cover z-0 ${
            isCameraActive && hasCamera ? 'block' : 'hidden'
          }`}
        />

        {/* Fallback View when camera stream is unavailable */}
        {(!isCameraActive || !hasCamera) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-0 bg-slate-950">
            <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2">
              <Camera className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-400" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200">Speed-Ink Optical Scanner</h3>
            <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-tight">
              Position student OMR sheet inside frame. Tap below to retry camera or upload.
            </p>

            {cameraError && (
              <div className="mt-2.5 p-2 bg-amber-950/70 border border-amber-900/60 rounded-xl max-w-xs text-left flex items-start gap-1.5 text-amber-200 text-[10px]">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-tight">{cameraError}</p>
              </div>
            )}
            
            <button
              onClick={setupCamera}
              className="mt-2.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-xl text-emerald-400 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Camera Permission</span>
            </button>
          </div>
        )}

        {/* FLOATING TOP SCORE PILL (Responsive for iPhone SE) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          <div className="bg-slate-900/95 border border-emerald-500/50 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Status Indicator */}
            <div className="flex items-center gap-1 bg-emerald-950 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-300 font-mono">MATCHED</span>
            </div>

            {/* Live Score */}
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">Score:</span>
              <span className="text-sm sm:text-base font-black text-white">{calculatedScore}</span>
              <span className="text-[10px] sm:text-xs text-slate-400">/ {qCount}</span>
              <span className="text-[11px] sm:text-sm font-black text-emerald-400">({livePercentage}%)</span>
            </div>

            {/* Letter Grade */}
            <div 
              className="w-5 sm:w-6 h-5 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs text-white shadow-xs"
              style={{ backgroundColor: liveGradeColor }}
            >
              {liveGrade}
            </div>
          </div>
        </div>

        {/* AUTO-ALIGNMENT GRID BOX OVERLAY THAT LOCKS ONTO STUDENT SHEET */}
        <div className="relative w-[92vw] max-w-[350px] h-[52vh] sm:h-[60vh] max-h-[460px] rounded-2xl sm:rounded-3xl flex flex-col justify-between p-2 sm:p-3 z-10 border-2 border-emerald-400/50 bg-slate-950/25 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-[1px]">
          
          {/* 4 Corner Markers */}
          <div className="absolute -top-1 -left-1 w-7 sm:w-9 h-7 sm:h-9 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div className="absolute -top-1 -right-1 w-7 sm:w-9 h-7 sm:h-9 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div className="absolute -bottom-1 -left-1 w-7 sm:w-9 h-7 sm:h-9 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div className="absolute -bottom-1 -right-1 w-7 sm:w-9 h-7 sm:h-9 border-b-4 border-r-4 border-emerald-400 rounded-br-xl shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

          {/* PROJECTED BUBBLES WITH REAL-TIME MATCHING */}
          <div className="w-full h-full flex flex-col justify-between py-0.5 pointer-events-auto overflow-hidden">
            
            {/* Top Grid Alignment Header */}
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-emerald-300 font-mono px-1">
              <span className="bg-slate-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30 truncate max-w-[140px]">
                ⊞ {currentKey?.title || 'Key'}
              </span>
              <span className="bg-slate-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30 text-emerald-300 shrink-0">
                ⚡ Vision Live
              </span>
            </div>

            {/* Question Bubble Matrix */}
            <div className="flex-1 grid gap-1 my-1 items-center overflow-hidden" style={{ gridTemplateColumns: `repeat(${colsCount}, minmax(0, 1fr))` }}>
              {Array.from({ length: colsCount }).map((_, colIdx) => {
                const startQ = colIdx * questionsPerCol + 1;
                const endQ = Math.min(startQ + questionsPerCol - 1, qCount);
                const colQuestions = [];
                for (let q = startQ; q <= endQ; q++) colQuestions.push(q);

                return (
                  <div key={colIdx} className="flex flex-col justify-around h-full bg-slate-950/50 border border-emerald-500/20 rounded-lg p-1 backdrop-blur-xs overflow-hidden">
                    {colQuestions.map((qNum) => {
                      const studentAns = (liveAnswers[qNum] || '').trim().toUpperCase();
                      const correctAns = getCorrectKeyAnswer(qNum);
                      const isCorrect = studentAns === correctAns;
                      const isMissedOrBlank = !studentAns || studentAns === 'BLANK' || studentAns === 'MULTIPLE';

                      return (
                        <div key={qNum} className="flex items-center justify-between gap-0.5 py-0.2">
                          {/* Question Number and Key */}
                          <div className="flex items-center gap-0.5 w-6 sm:w-7 shrink-0">
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-300">
                              {qNum}
                            </span>
                            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-emerald-400">
                              ({correctAns})
                            </span>
                          </div>

                          {/* Option Bubbles */}
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {['A', 'B', 'C', 'D'].map((opt) => {
                              const isChosen = studentAns === opt;
                              const isKey = correctAns === opt;

                              if (isChosen && isCorrect) {
                                // GREEN CIRCLE: Correct answer
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => handleManualBubbleToggle(qNum, opt)}
                                    className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full border-2 border-emerald-400 bg-emerald-500/60 text-white font-black text-[7px] sm:text-[8px] flex items-center justify-center shadow-[0_0_6px_#34d399] transition"
                                    title={`Q${qNum}: Correct! [${opt}]`}
                                  >
                                    <Check className="w-2 sm:w-2.5 h-2 sm:h-2.5 stroke-[3]" />
                                  </button>
                                );
                              } else if (isChosen && !isCorrect) {
                                // RED BOX: Incorrect answer
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => handleManualBubbleToggle(qNum, opt)}
                                    className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-xs border-2 border-red-500 bg-red-500/60 text-white font-black text-[7px] sm:text-[8px] flex items-center justify-center shadow-[0_0_6px_#ef4444] transition"
                                    title={`Q${qNum}: Chose [${opt}], Key is [${correctAns}]`}
                                  >
                                    <X className="w-2 sm:w-2.5 h-2 sm:h-2.5 stroke-[3] text-white" />
                                  </button>
                                );
                              } else if (isMissedOrBlank && isKey) {
                                // Missed question indicator
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => handleManualBubbleToggle(qNum, opt)}
                                    className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-xs border border-dashed border-amber-400 bg-amber-950/40 text-amber-300 font-bold text-[6px] sm:text-[7px] flex items-center justify-center"
                                    title={`Q${qNum}: Missed (Key: [${correctAns}])`}
                                  >
                                    {opt}
                                  </button>
                                );
                              } else {
                                // Standard empty bubble
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => handleManualBubbleToggle(qNum, opt)}
                                    className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full border border-slate-600/70 text-slate-400 font-bold text-[6px] sm:text-[7px] flex items-center justify-center"
                                  >
                                    {opt}
                                  </button>
                                );
                              }
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Bottom Status Tag */}
            <div className="text-center shrink-0">
              <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-300 bg-slate-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-xs">
                ✔ Match: {calculatedScore}/{qCount} Correct • Tap bubble to adjust
              </span>
            </div>

          </div>
        </div>

        {/* Scan Preset Mode Popover Button */}
        <button
          onClick={() => setShowSimSelector(prev => !prev)}
          className="absolute bottom-2 right-3 z-20 text-[9px] sm:text-[10px] font-mono text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-lg backdrop-blur-sm flex items-center gap-1 shadow-xs transition"
        >
          <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-amber-400" />
          <span>{getPresetLabel(selectedPreset)}</span>
        </button>

        {/* Preset Selector Popover */}
        {showSimSelector && (
          <div className="absolute bottom-10 right-3 z-40 bg-slate-900 border border-slate-700 p-2.5 rounded-2xl shadow-2xl w-56 sm:w-64 space-y-1.5 backdrop-blur-md">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>Scan Preset</span>
              <button onClick={() => setShowSimSelector(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {(['cv_real', 'sim_realistic', 'sim_struggling', 'sim_audit', 'sim_perfect'] as ScanPreset[]).map(preset => (
                <button
                  key={preset}
                  onClick={() => {
                    setSelectedPreset(preset);
                    setShowSimSelector(false);
                  }}
                  className={`p-1.5 rounded-xl text-left text-[11px] font-semibold flex flex-col transition ${
                    selectedPreset === preset
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-100'
                      : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <span>{getPresetLabel(preset)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Hidden File Pickers */}
      <input 
        ref={nativeFileInputRef}
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        onChange={handleFilePicked} 
      />

      <input 
        ref={galleryFileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFilePicked} 
      />

      {/* ACTION FOOTER (iPhone SE Optimized) */}
      <div className="bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-3.5 border-t border-slate-800 flex flex-col items-center gap-1.5 sm:gap-2.5 z-30 shrink-0">
        
        {/* Main Action Buttons */}
        <div className="w-full flex items-center justify-between gap-2 max-w-lg">
          
          {/* [ Switch to Manual Override ] */}
          <button
            id="btn_manual_override"
            onClick={() => setShowManualOverrideDrawer(true)}
            className="flex-1 py-2.5 sm:py-3 px-2 sm:px-3 bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 hover:text-white rounded-xl sm:rounded-2xl font-bold text-[11px] sm:text-xs border border-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Adjust student marks manually"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Override</span>
          </button>

          {/* Center Snapshot Shutter Button */}
          <button
            id="btn_shutter_snap"
            onClick={handleTriggerCapture}
            className="w-10 sm:w-12 h-10 sm:h-12 rounded-full border-2 border-slate-700 bg-slate-800 hover:bg-slate-700 active:scale-90 flex items-center justify-center shadow-xs transition shrink-0"
            title="Snap freeze photo"
          >
            <Camera className="w-4 sm:w-5 h-4 sm:h-5 text-slate-300" />
          </button>

          {/* [ Save & Next Paper ] Primary Momentum Button (< 5s Grading) */}
          <button
            id="btn_save_next_paper"
            onClick={handleSaveAndNextPaper}
            className="flex-1 py-2.5 sm:py-3 px-2 sm:px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-[11px] sm:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] border border-emerald-300 transition cursor-pointer"
            title="Save result & grade next paper immediately"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-emerald-200 shrink-0" />
            <span className="truncate">Save & Next</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3] shrink-0" />
          </button>
        </div>

        {/* Secondary Auxiliary Controls Row */}
        <div className="w-full flex items-center justify-between max-w-lg text-[10px] sm:text-[11px] text-slate-400 font-mono pt-0.5">
          <button 
            onClick={() => galleryFileInputRef.current?.click()}
            className="hover:text-slate-200 flex items-center gap-1"
          >
            <Upload className="w-3 h-3 text-sky-400" />
            <span>Gallery</span>
          </button>

          <button
            onClick={() => nativeFileInputRef.current?.click()}
            className="hover:text-slate-200 flex items-center gap-1"
          >
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span>Native Cam</span>
          </button>

          <span className="text-emerald-400 font-bold">
            Paper #{paperIndex}
          </span>
        </div>
      </div>

      {/* QUICK MANUAL OVERRIDE DRAWER */}
      {showManualOverrideDrawer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-5 space-y-3 shadow-2xl text-slate-200 max-h-[85vh] flex flex-col">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">Manual Mark Adjustment</h3>
                  <p className="text-[10px] text-slate-400">{simulatedStudentName} • {calculatedScore}/{qCount} Correct</p>
                </div>
              </div>
              <button 
                onClick={() => setShowManualOverrideDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Bubble Tap Grid */}
            <div className="overflow-y-auto p-1 space-y-1.5 flex-1">
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {Array.from({ length: qCount }).map((_, i) => {
                  const q = i + 1;
                  const studentAns = (liveAnswers[q] || '').trim().toUpperCase();
                  const keyAns = getCorrectKeyAnswer(q);
                  const isCorrect = studentAns === keyAns;

                  return (
                    <div 
                      key={q}
                      className={`p-1.5 sm:p-2 rounded-xl border flex items-center justify-between ${
                        isCorrect ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-red-950/40 border-red-800/60'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold font-mono text-slate-200">Q{q}</span>
                        <span className="text-[8px] font-mono text-emerald-400 font-semibold">Key: {keyAns}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleManualBubbleToggle(q, opt)}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center ${
                              studentAns === opt
                                ? (opt === keyAns ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white')
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-slate-800 pt-2.5 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowManualOverrideDrawer(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Apply & Return to Camera (Score: {calculatedScore}/{qCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANSWER KEY SWITCHER MODAL */}
      {showKeySelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-sm w-full p-4 sm:p-5 space-y-3 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Answer Key</span>
              </h3>
              <button onClick={() => setShowKeySelector(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {savedKeys.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 bg-slate-800/40 rounded-xl">
                  No saved keys. Using current settings ({testName || 'Default Key'}).
                </div>
              ) : (
                savedKeys.map(k => (
                  <button
                    key={k.id}
                    onClick={() => {
                      if (onSelectKey) onSelectKey(k);
                      setShowKeySelector(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition ${
                      currentKey?.id === k.id
                        ? 'bg-emerald-950 border border-emerald-500 text-emerald-200 shadow-xs'
                        : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div>
                      <div className="text-white text-xs">{k.title}</div>
                      <div className="text-[10px] text-emerald-400 font-normal font-mono">
                        {k.className || 'General'} • {k.questionsCount} Questions
                      </div>
                    </div>
                    {currentKey?.id === k.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setShowKeySelector(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
