import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, Check, Circle, AlertCircle } from 'lucide-react';
import { QuestionConfidence } from '../types';

interface ReviewFlagsPanelProps {
  questions: QuestionConfidence[];
  onSaveOverrides: (updatedQuestions: QuestionConfidence[]) => void;
  onCancel: () => void;
  studentName: string;
}

export const ReviewFlagsPanel: React.FC<ReviewFlagsPanelProps> = ({
  questions,
  onSaveOverrides,
  onCancel,
  studentName
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [localQuestions, setLocalQuestions] = useState<QuestionConfidence[]>(() => 
    questions.map(q => ({ ...q }))
  );

  const currentQuestion = localQuestions[currentIndex];

  const handleOverride = (option: string) => {
    const updated = [...localQuestions];
    updated[currentIndex] = {
      ...currentQuestion,
      detected: option,
      confidence: 100, // force maximum confidence upon teacher approval
      flagged: false // unflag
    };
    setLocalQuestions(updated);
  };

  const handleNext = () => {
    if (currentIndex < localQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSaveAll = () => {
    onSaveOverrides(localQuestions);
  };

  // Mock bubble zoom graphic helper
  const renderBubbleZoom = (qNum: number, detected: string) => {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 uppercase">OMR Sensor Macro-Lens Zoom</div>
        
        {/* Scanned crop simulator */}
        <div className="flex items-center gap-6 my-6">
          {['A', 'B', 'C', 'D'].map((opt) => {
            // Let's draw standard smudge mock for Alice Q17 (first flagged)
            const isSmudgedA = qNum === 17 && opt === 'A';
            const isSmudgedB = qNum === 17 && opt === 'B';
            const isChosen = detected === opt;

            return (
              <div key={opt} className="flex flex-col items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">{opt}</span>
                <div className="relative w-11 h-11 rounded-full border-2 border-slate-400 flex items-center justify-center bg-white shadow-sm">
                  {isSmudgedA && (
                    /* Drawn black bubble */
                    <div className="absolute inset-1 rounded-full bg-slate-800 opacity-90" />
                  )}
                  {isSmudgedB && (
                    /* Smudge or messy pencil scratch */
                    <div className="absolute inset-1 rounded-full bg-slate-400 opacity-60 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-700 animate-pulse">
                        <path d="M10 20 L90 80 M80 20 L20 80 M30 10 L70 90 M10 50 L90 50" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                  {isChosen && !isSmudgedA && !isSmudgedB && (
                    /* Clean selection overlay */
                    <div className="absolute inset-1.5 rounded-full bg-emerald-500 opacity-90" />
                  )}

                  {/* Red cross if flagged */}
                  {qNum === 17 && isSmudgedB && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 text-white">
                      <AlertTriangle className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs font-semibold text-slate-700 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Issue detected: Double selection or smudged erasure found.</span>
        </div>
      </div>
    );
  };

  const remainingFlagsCount = localQuestions.filter(q => q.flagged).length;

  return (
    <div id="review_flags_panel" className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto my-4">
      {/* Top Header */}
      <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-xl text-white">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950">Review OMR Flags</h3>
            <p className="text-xs text-slate-600 font-medium">
              Student: <strong className="text-slate-900">{studentName}</strong>
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
          {remainingFlagsCount} {remainingFlagsCount === 1 ? 'flag' : 'flags'} left
        </span>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-6">
        
        {/* Progress Nav Row */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
          <button
            id="btn_prev_flag"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className={`p-1.5 rounded-lg border transition ${
              currentIndex === 0 
                ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Question</span>
            <span className="text-base font-extrabold text-slate-900">
              Q{currentQuestion.questionNumber} <span className="text-xs font-normal text-slate-400">of {localQuestions.length}</span>
            </span>
          </div>

          <button
            id="btn_next_flag"
            disabled={currentIndex === localQuestions.length - 1}
            onClick={handleNext}
            className={`p-1.5 rounded-lg border transition ${
              currentIndex === localQuestions.length - 1 
                ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Neural confidence details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">OMR Confidence Log</h4>
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const conf = currentQuestion.options[opt as 'A' | 'B' | 'C' | 'D'];
                const isSelected = currentQuestion.detected === opt;
                return (
                  <div key={opt} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={`font-mono ${isSelected ? 'text-emerald-600' : 'text-slate-600'}`}>
                        Bubble {opt} {isSelected && " (Currently Registered)"}
                      </span>
                      <span className="text-slate-500 font-mono">{conf}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isSelected ? 'bg-emerald-600' : 'bg-slate-400'
                        }`}
                        style={{ width: `${conf}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Macro Viewfinder Column */}
          <div className="flex flex-col justify-center">
            {renderBubbleZoom(currentQuestion.questionNumber, currentQuestion.detected)}
          </div>
        </div>

        {/* Direct Action override pad */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Override & Resolve Decisive Answer:
          </h4>
          
          <div className="grid grid-cols-4 gap-2">
            {['A', 'B', 'C', 'D'].map((opt) => (
              <button
                key={opt}
                id={`btn_force_${opt}`}
                onClick={() => handleOverride(opt)}
                className={`p-3 rounded-xl border-2 font-extrabold text-sm transition flex flex-col items-center justify-center gap-1 shadow-sm ${
                  currentQuestion.detected === opt 
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800' 
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Circle className={`w-4 h-4 ${currentQuestion.detected === opt ? 'fill-emerald-600 stroke-emerald-700' : 'text-slate-400'}`} />
                <span>Mark {opt}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              id="btn_force_blank"
              onClick={() => handleOverride('')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 ${
                currentQuestion.detected === '' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-slate-200'
              }`}
            >
              Mark as Blank (No Answer)
            </button>
            <button
              id="btn_force_multiple"
              onClick={() => handleOverride('Multiple')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 ${
                currentQuestion.detected === 'Multiple' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200'
              }`}
            >
              Mark as Multiple (Invalid)
            </button>
          </div>
        </div>

      </div>

      {/* Footer controls */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        <button
          id="btn_cancel_flags"
          onClick={onCancel}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          Cancel Review
        </button>

        <button
          id="btn_submit_flags"
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow-md"
        >
          <Check className="w-4 h-4" />
          <span>Save Resolution & Finalize Score</span>
        </button>
      </div>
    </div>
  );
};
