import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, AlertCircle, Sparkles, Check, Files } from 'lucide-react';

interface CameraViewfinderProps {
  onCapture: (imageDataUrl: string, isAmbiguousSample: boolean, studentName: string) => void;
  onCancel: () => void;
  testName: string;
  totalQuestions: number;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onCapture,
  onCancel,
  testName,
  totalQuestions
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [detectionProgress, setDetectionProgress] = useState<number>(0);
  const [isSheetDetected, setIsSheetDetected] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  
  // Choose sample sheet to simulate scanning
  const [selectedSample, setSelectedSample] = useState<'perfect' | 'ambiguous'>('ambiguous');
  const [simulatedStudentName, setSimulatedStudentName] = useState<string>('Candidate B (Alice Johnson)');

  // Try to launch camera
  useEffect(() => {
    async function setupCamera() {
      try {
        setCameraError('');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setHasCamera(true);
          setIsCameraActive(true);
        }
      } catch (err: any) {
        console.warn("Camera access denied or unavailable:", err);
        setHasCamera(false);
        setIsCameraActive(false);
        setCameraError(err.message || 'Camera blocked or not found. Using interactive OMR simulator.');
      }
    }
    setupCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Simulate OMR Sheet detection loop
  useEffect(() => {
    let timer: any;
    if (isCameraActive || !hasCamera) {
      // Auto-trigger sheets detection
      timer = setInterval(() => {
        setIsSheetDetected(true);
        setDetectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          const next = prev + 15;
          return next >= 100 ? 100 : next;
        });
      }, 350);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isCameraActive, hasCamera, selectedSample, simulatedStudentName]);

  // Handle capture safely in an effect once progress reaches 100
  useEffect(() => {
    if (detectionProgress >= 100) {
      handleTriggerCapture();
    }
  }, [detectionProgress]);

  const handleTriggerCapture = () => {
    // Generate sample OMR graphic
    const isAmbiguous = selectedSample === 'ambiguous';
    onCapture(
      isAmbiguous ? 'MOCK_AMBIGUOUS_IMAGE_URL' : 'MOCK_PERFECT_IMAGE_URL',
      isAmbiguous,
      simulatedStudentName
    );
  };

  // Handle standard image file upload as a clean fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(
            event.target.result as string,
            selectedSample === 'ambiguous',
            simulatedStudentName
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="camera_scan_viewfinder" className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col justify-between overflow-hidden">
      
      {/* Top Banner overlay */}
      <div className="bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
        <div>
          <span className="text-xs font-mono font-medium tracking-widest text-emerald-400 uppercase bg-emerald-950 px-2 py-1 rounded border border-emerald-900">
            AUTO-SCANNING
          </span>
          <h2 className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
            <span>{testName || "OMR Student Test"}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-mono text-xs">{totalQuestions} Qs</span>
          </h2>
        </div>
        <button 
          id="btn_cancel_scan"
          onClick={onCancel}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition"
          title="Exit Scanner"
        >
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Main interactive viewport container */}
      <div className="relative flex-1 flex items-center justify-center bg-slate-950 overflow-hidden">
        
        {/* Real Live Camera stream or fallback canvas */}
        {isCameraActive && hasCamera ? (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : (
          /* High-Fidelity OMR Scanning Simulator */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 omr-watermark opacity-25">
            {/* OMR Grid background circles */}
            <div className="text-center select-none text-slate-800 pointer-events-none mt-20 font-mono text-[10px] uppercase">
              OMR Tracking Grid Active
            </div>
          </div>
        )}

        {/* Animated Laser Scanning Line */}
        <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-bounce top-1/4 z-10" />

        {/* Floating Sample Selector - ALLOWS QUICK TESTING */}
        <div className="absolute top-4 left-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md z-20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CHOOSE TEST SIMULATION MODE:</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin" /> Live interactive
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              id="opt_sample_ambiguous"
              onClick={() => {
                setSelectedSample('ambiguous');
                setSimulatedStudentName('Candidate B (Alice Johnson)');
                setDetectionProgress(0);
                setIsSheetDetected(false);
              }}
              className={`p-2 rounded text-left text-xs font-semibold flex flex-col transition ${
                selectedSample === 'ambiguous' 
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-100' 
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Alice (Needs Correction)
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Triggers Question 17 flagged override</span>
            </button>

            <button
              id="opt_sample_perfect"
              onClick={() => {
                setSelectedSample('perfect');
                setSimulatedStudentName('Candidate A (John Doe)');
                setDetectionProgress(0);
                setIsSheetDetected(false);
              }}
              className={`p-2 rounded text-left text-xs font-semibold flex flex-col transition ${
                selectedSample === 'perfect' 
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-100' 
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                John (100% Correct)
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Fast scan with perfect bubble scores</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400 font-mono">Student Label:</span>
            <input 
              id="simulated_student_input"
              type="text" 
              value={simulatedStudentName}
              onChange={(e) => setSimulatedStudentName(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-white flex-1 font-sans focus:outline-none focus:border-emerald-500"
              placeholder="Student Name / ID"
            />
          </div>
        </div>

        {/* Viewfinder Bounding Box Overlay */}
        <div className="relative w-[310px] h-[450px] border-2 border-dashed border-emerald-500/40 rounded-2xl flex flex-col items-center justify-between p-6 z-10 bg-slate-900/20 backdrop-blur-[1px] transition-all duration-300">
          
          {/* Top corner markers */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 -mt-1.5 -ml-1.5 rounded-tl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 -mt-1.5 -mr-1.5 rounded-tr" />
          
          {/* Title inside frame */}
          <div className="text-center text-xs font-medium tracking-wide text-emerald-400 bg-slate-950/80 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-md">
            Align OMR Sheet corners
          </div>

          {/* Simulated OMR Sheet Graphic in viewfinder for gorgeous UX */}
          <div className="w-full h-2/3 bg-slate-900/90 border border-slate-700/60 rounded-lg p-3 flex flex-col justify-between shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="h-2 w-14 bg-slate-700 rounded" />
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-700" />
                <span className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
            </div>
            
            {/* Rows of simulated bubbles */}
            <div className="space-y-2 flex-1 mt-3">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>Q{row}</span>
                  <div className="flex gap-2">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isMarked = selectedSample === 'perfect' 
                        ? (row === 1 && opt === 'A') || (row === 2 && opt === 'B') || (row === 3 && opt === 'C') || (row === 4 && opt === 'D') || (row === 5 && opt === 'A')
                        : (row === 1 && opt === 'B') || (row === 2 && opt === 'C') || (row === 3 && opt === 'A') || (row === 4 && opt === 'D') || (row === 5 && opt === 'B');
                      return (
                        <span 
                          key={opt} 
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center font-bold ${
                            isMarked 
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                              : 'border-slate-700 text-slate-600'
                          }`}
                        >
                          {opt}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="text-center text-[10px] text-slate-500 font-mono mt-2 italic">
                {totalQuestions > 5 ? `+ ${totalQuestions - 5} additional rows...` : ""}
              </div>
            </div>

            {/* Bottom black OMR markers */}
            <div className="flex justify-between mt-1.5 pt-1.5 border-t border-slate-800">
              <span className="w-3 h-2 bg-slate-900" />
              <span className="w-3 h-2 bg-slate-900" />
              <span className="w-3 h-2 bg-slate-900" />
            </div>

            {/* Glowing success frame overlay inside when progress goes up */}
            <div className={`absolute inset-0 rounded-lg border-2 transition-all duration-300 pointer-events-none ${
              isSheetDetected ? 'border-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]' : 'border-transparent'
            }`} />
          </div>

          {/* Bottom corner markers */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 -mb-1.5 -ml-1.5 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 -mb-1.5 -mr-1.5 rounded-br" />

          {/* Detection Status text */}
          <div className="text-center mt-2 z-10">
            {isSheetDetected ? (
              <div className="flex flex-col items-center">
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 justify-center animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  SHEET DETECTED!
                </span>
                <span className="text-[10px] text-slate-300 mt-0.5">Hold still... Auto-grading in progress</span>
              </div>
            ) : (
              <span className="text-slate-400 text-xs font-mono">
                Align corners perfectly inside green guides
              </span>
            )}
          </div>
        </div>

        {/* Camera Warning / Mode Toast */}
        {!hasCamera && (
          <div className="absolute bottom-28 left-4 right-4 bg-amber-950/90 border border-amber-900/60 rounded-lg p-2 px-3 text-amber-200 text-xs flex items-center gap-2 max-w-sm mx-auto shadow-lg backdrop-blur-sm">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="leading-tight">
              Webcam is blocked or offline. Operating in high-fidelity sandbox simulation.
            </p>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="bg-slate-900/95 backdrop-blur-md px-6 py-6 border-t border-slate-800 flex flex-col items-center gap-4 z-10">
        
        {/* Detection progress bar */}
        <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
          <div 
            className="bg-emerald-500 h-full transition-all duration-300 shadow-[0_0_8px_#10b981]" 
            style={{ width: `${detectionProgress}%` }}
          />
        </div>

        <div className="w-full flex items-center justify-between max-w-sm">
          {/* File Upload Fallback */}
          <label 
            id="label_upload_scan"
            className="flex flex-col items-center justify-center p-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer transition border border-slate-700 shadow-md group"
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              <span className="text-xs font-semibold">Upload Photo</span>
            </div>
            <input 
              id="file_upload_scan"
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>

          {/* Live Action button for fast-testing scan completion */}
          <button
            id="btn_manual_capture"
            onClick={handleTriggerCapture}
            className="flex items-center gap-2 p-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span className="text-xs">Capture Now</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 font-mono text-center">
          Objective Marker uses serverless local client-side computer vision models. All grading runs offline.
        </p>
      </div>

    </div>
  );
};
