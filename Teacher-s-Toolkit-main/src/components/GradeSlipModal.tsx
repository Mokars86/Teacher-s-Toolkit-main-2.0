import React, { useState, useEffect } from 'react';
import { 
  X, Download, Share2, Printer, Copy, Check, MessageCircle, 
  Sparkles, FileText, CheckCircle2, User, Award, ArrowDownToLine,
  Scissors, Sliders, Layers, RefreshCw, ChevronDown
} from 'lucide-react';
import { GradedResult, SchoolProfile } from '../types';
import { 
  getLetterGrade, formatGradeSlipText, generateGradeSlipCanvas, 
  generate4On1GradeSlipCanvas, downloadDataUrl, shareGradeSlip, 
  print4On1GradeSlips, calculateScoreConversion, 
  formatSequentialCorrectRanges, getItemizedDiagnostics 
} from '../utils/gradeSlipUtils';

interface GradeSlipModalProps {
  result: GradedResult | null;
  allResults?: GradedResult[];
  masterKeyAnswers?: { [key: number]: string };
  schoolProfile?: SchoolProfile | null;
  customSchoolName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const GradeSlipModal: React.FC<GradeSlipModalProps> = ({
  result,
  allResults = [],
  masterKeyAnswers = {},
  schoolProfile,
  customSchoolName,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'fourOnOne'>('fourOnOne');
  const [fourMode, setFourMode] = useState<'single_replicated' | 'batch_class'>('single_replicated');
  const [targetScale, setTargetScale] = useState<number>(30); // Default scaled to 30 marks
  const [copied, setCopied] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [preview4On1Url, setPreview4On1Url] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const schoolTitle = customSchoolName || schoolProfile?.name || "CHRIST THE KING INTERNATIONAL SCHOOL";

  // Re-generate preview images when modal opens or settings change
  useEffect(() => {
    if (isOpen && result) {
      setIsGeneratingImg(true);

      const promiseSingle = generateGradeSlipCanvas(result, masterKeyAnswers, {
        schoolName: schoolTitle,
        targetScale: targetScale,
      });

      // Prepare results set for 4-on-1
      let batchResults: GradedResult[] = [result];
      if (fourMode === 'batch_class' && allResults.length > 0) {
        // Take up to 4 results starting around current result
        const currentIndex = allResults.findIndex(r => r.id === result.id);
        const startIdx = currentIndex >= 0 ? currentIndex : 0;
        batchResults = allResults.slice(startIdx, startIdx + 4);
        if (batchResults.length < 4) {
          batchResults = allResults.slice(0, 4);
        }
      }

      const promise4On1 = generate4On1GradeSlipCanvas(batchResults, masterKeyAnswers, {
        schoolName: schoolTitle,
        targetScale: targetScale,
      });

      Promise.all([promiseSingle, promise4On1])
        .then(([singleUrl, fourUrl]) => {
          setPreviewDataUrl(singleUrl);
          setPreview4On1Url(fourUrl);
          setIsGeneratingImg(false);
        })
        .catch((err) => {
          console.error('Failed to generate slip canvases:', err);
          setIsGeneratingImg(false);
        });
    } else {
      setPreviewDataUrl('');
      setPreview4On1Url('');
      setStatusMessage('');
      setCopied(false);
    }
  }, [isOpen, result, masterKeyAnswers, fourMode, targetScale, schoolTitle, allResults]);

  if (!isOpen || !result) return null;

  const { grade, text: gradeText, color: gradeColor } = getLetterGrade(result.percentage);
  const conv = calculateScoreConversion(result.score, result.totalQuestions, targetScale);
  const correctRanges = formatSequentialCorrectRanges(result, masterKeyAnswers);
  const diagnostics = getItemizedDiagnostics(result, masterKeyAnswers);

  const handleDownloadActiveImage = async () => {
    try {
      setStatusMessage('Preparing high-resolution slip image...');
      let url = activeTab === 'fourOnOne' ? preview4On1Url : previewDataUrl;
      
      if (!url) {
        if (activeTab === 'fourOnOne') {
          url = await generate4On1GradeSlipCanvas([result], masterKeyAnswers, {
            schoolName: schoolTitle,
            targetScale,
          });
        } else {
          url = await generateGradeSlipCanvas(result, masterKeyAnswers, {
            schoolName: schoolTitle,
            targetScale,
          });
        }
      }

      if (url) {
        const fileName = activeTab === 'fourOnOne'
          ? `${result.candidateName.replace(/\s+/g, '_')}_4on1_A4_Slips.png`
          : `${result.candidateName.replace(/\s+/g, '_')}_MiniFeedbackSlip.png`;
        
        await downloadDataUrl(url, fileName);
        setStatusMessage('✔ Saved to your downloads folder!');
        setTimeout(() => setStatusMessage(''), 3500);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Download failed. You can use print or copy text.');
    }
  };

  const handlePrint4On1 = () => {
    let batchResults: GradedResult[] = [result];
    if (fourMode === 'batch_class' && allResults.length > 0) {
      batchResults = allResults;
    }
    print4On1GradeSlips(batchResults, masterKeyAnswers, {
      schoolName: schoolTitle,
      targetScale,
    });
  };

  const handleShare = async () => {
    try {
      setStatusMessage('Opening share sheet...');
      const res = await shareGradeSlip(result, masterKeyAnswers, {
        schoolName: schoolTitle,
        targetScale,
      });
      setStatusMessage(res.message);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWhatsAppShare = () => {
    const text = formatGradeSlipText(result, masterKeyAnswers, targetScale);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = async () => {
    try {
      const text = formatGradeSlipText(result, masterKeyAnswers, targetScale);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setStatusMessage('✔ Grade slip text copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setStatusMessage('');
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in select-none">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
              <Scissors className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight">Mini Feedback Slip (4-on-1 A4)</h3>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 font-mono">
                  Speed-Ink
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium truncate max-w-xs sm:max-w-md">
                {schoolTitle}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Controls and Tab Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('fourOnOne')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'fourOnOne'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>4-on-1 A4 Sheet</span>
            </button>
            
            <button
              onClick={() => setActiveTab('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'single'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Single Slip</span>
            </button>
          </div>

          {/* Scale / Weight Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 font-mono">Scale:</span>
            <select
              value={targetScale}
              onChange={(e) => setTargetScale(Number(e.target.value))}
              className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value={30}>Converted to /30 Marks</option>
              <option value={40}>Converted to /40 Marks</option>
              <option value={50}>Converted to /50 Marks</option>
              <option value={100}>Converted to /100 Marks</option>
            </select>
          </div>

          {/* 4-on-1 Multi-Student vs Single Student Toggle */}
          {activeTab === 'fourOnOne' && allResults.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="fourMode"
                  checked={fourMode === 'single_replicated'}
                  onChange={() => setFourMode('single_replicated')}
                  className="text-emerald-600 focus:ring-0"
                />
                <span>4x Same Student</span>
              </label>
              <span className="text-slate-300">|</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="fourMode"
                  checked={fourMode === 'batch_class'}
                  onChange={() => setFourMode('batch_class')}
                  className="text-emerald-600 focus:ring-0"
                />
                <span>Class Batch ({allResults.length} Papers)</span>
              </label>
            </div>
          )}
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-100/60">
          
          {/* Main Visual Slip Display */}
          {activeTab === 'fourOnOne' ? (
            /* 4-on-1 A4 Canvas Preview */
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-400/80 p-3 shadow-md overflow-hidden relative">
                
                {/* Staple & Scissors Cut Legend Banner */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 mb-3">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Scissors className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cut along center dashed lines</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span>📎 Staple in top-left corners of exam papers</span>
                  </div>
                </div>

                {preview4On1Url ? (
                  <img
                    src={preview4On1Url}
                    alt="4-on-1 A4 Printable Layout"
                    className="w-full h-auto object-contain block max-h-[460px] mx-auto rounded-lg shadow-inner cursor-zoom-in"
                    title="4-on-1 A4 Printable Sheet"
                  />
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                    <span className="text-xs font-semibold">Rendering 4-on-1 layout...</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 text-center font-medium">
                💡 Prints 4 mini slips on a single A4 page with clean cut-lines. Perfect for stapling to student scripts.
              </div>
            </div>
          ) : (
            /* Single Mini Slip Interactive Mockup */
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-md space-y-4 relative overflow-hidden">
                
                {/* Staple Guide Marker */}
                <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-300 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px]">
                  <span>📎 STAPLE HERE</span>
                </div>

                {/* Header Block */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center text-lg font-black shadow-xs">
                      🎓
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{schoolTitle}</h4>
                      <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                        Official Mini Feedback Slip
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {result.testName || 'Exam'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      {result.scannedAt?.split(' ')[0] || new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-slate-900">{result.candidateName}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      Index No: <strong className="text-slate-700">{result.candidateId || 'N/A'}</strong> • Class: {result.className || 'General'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 font-mono">Verified OMR</span>
                  </div>
                </div>

                {/* Performance Summary Banner */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-xs"
                      style={{ backgroundColor: gradeColor }}
                    >
                      {grade}
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900 font-mono flex items-center gap-2">
                        <span>{result.score} / {result.totalQuestions}</span>
                        <span className="text-emerald-700 text-sm font-bold">➔ {conv.convertedScore} / {targetScale}</span>
                      </div>
                      <div className="text-xs font-bold" style={{ color: gradeColor }}>
                        {result.percentage}% • {gradeText}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-bold font-mono">
                    <div className="text-emerald-700">✔ {result.score} Correct</div>
                    <div className="text-red-700">✖ {result.totalQuestions - result.score} Errors</div>
                  </div>
                </div>

                {/* Itemized Correction Table (Split Data Box) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Left: Correct Sequential Answers */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <h5 className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5 pb-1 border-b border-emerald-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct Items ({result.score}/{result.totalQuestions})</span>
                      </h5>
                      <p className="text-xs font-semibold text-emerald-800 mt-2 leading-relaxed">
                        {correctRanges}
                      </p>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-2 pt-1 border-t border-emerald-200/50">
                      Sequential range summary
                    </div>
                  </div>

                  {/* Right: Missed Questions & Diagnostics */}
                  <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <h5 className="text-[11px] font-extrabold text-red-900 flex items-center gap-1.5 pb-1 border-b border-red-200/60">
                        <X className="w-3.5 h-3.5 text-red-600" />
                        <span>Missed & Diagnostics ({result.totalQuestions - result.score})</span>
                      </h5>
                      
                      <div className="space-y-1 mt-2 text-xs font-medium text-red-900">
                        {diagnostics.length === 0 ? (
                          <p className="text-emerald-700 font-bold">🌟 Perfect Sheet! Zero errors.</p>
                        ) : (
                          diagnostics.slice(0, 4).map(d => (
                            <div key={d.questionNumber} className="leading-tight text-[11px]">
                              <strong>Q{d.questionNumber}:</strong> Chose <span className="font-bold underline">[{d.studentAns}]</span>, Key was <span className="font-bold text-emerald-800">[{d.keyAns}]</span>
                            </div>
                          ))
                        )}
                        {diagnostics.length > 4 && (
                          <div className="text-[10px] text-red-700 italic pt-1">
                            + {diagnostics.length - 4} more errors on sheet
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-red-600 font-medium mt-2 pt-1 border-t border-red-200/50">
                      Itemized error analysis
                    </div>
                  </div>

                </div>

                {/* Cut-out Staple Border Note */}
                <div className="border-t border-dashed border-slate-300 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>✂ Dashed Staple Boundary</span>
                  <span>Mokars Speed-Ink OMR</span>
                </div>

              </div>
            </div>
          )}

          {/* Quick Action Bar Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handlePrint4On1}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              title="Print 4 slips per A4 page with dashed cut lines"
            >
              <Printer className="w-4 h-4" />
              <span>Print 4-on-1 A4 Page</span>
            </button>

            <button
              onClick={handleDownloadActiveImage}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              title="Download high-resolution image file"
            >
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              <span>Download A4 Image</span>
            </button>
          </div>

          {/* Secondary Share and Copy Options */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition"
              title="Share slip summary via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShare}
              className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition"
              title="Share slip image / file"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Share</span>
            </button>

            <button
              onClick={handleCopyText}
              className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition"
              title="Copy formatted feedback text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>4-on-1 A4 Mini Slip Format</span>
          </div>
          
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 rounded-xl font-bold text-xs transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
