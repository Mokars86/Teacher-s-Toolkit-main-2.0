import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Key, 
  ChevronDown, 
  Plus, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  Smartphone, 
  ArrowRight, 
  Edit3, 
  Sliders, 
  RotateCcw,
  Zap,
  Award
} from 'lucide-react';
import { AnswerKey } from '../types';

interface ScanOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedKeys: AnswerKey[];
  activeAnswerKey: AnswerKey | null;
  onSelectKey: (key: AnswerKey) => void;
  onCreateKey: () => void;
  onOpenCBT?: () => void;
  onDirectManualGrade?: (key: AnswerKey, candidateName: string, answers: { [key: number]: string }, scoreOverride?: number) => void;
  existingResultsCount: number;
}

export const ScanOptionsModal: React.FC<ScanOptionsModalProps> = ({
  isOpen,
  onClose,
  savedKeys,
  activeAnswerKey,
  onSelectKey,
  onCreateKey,
  onOpenCBT,
  onDirectManualGrade,
  existingResultsCount
}) => {
  const [selectedKeyId, setSelectedKeyId] = useState<string>(() => {
    return activeAnswerKey?.id || (savedKeys.length > 0 ? savedKeys[0].id : '');
  });

  const [candidateName, setCandidateName] = useState<string>(() => {
    return `Candidate #${existingResultsCount + 1}`;
  });

  const [isKeyDropdownOpen, setIsKeyDropdownOpen] = useState<boolean>(false);
  const [entryMode, setEntryMode] = useState<'SELECT' | 'FAST_SCORE' | 'KEYPAD_PUNCH'>('SELECT');

  // Manual fast score input state
  const [rawScoreInput, setRawScoreInput] = useState<string>('');

  // Keypad punch answers state
  const [currentQIndex, setCurrentQIndex] = useState<number>(1);
  const [punchedAnswers, setPunchedAnswers] = useState<{ [qNum: number]: string }>({});

  if (!isOpen) return null;

  const currentKey = savedKeys.find(k => k.id === selectedKeyId) || activeAnswerKey || (savedKeys.length > 0 ? savedKeys[0] : null);
  const totalQuestions = currentKey?.questionsCount || 20;

  const handleKeySelect = (key: AnswerKey) => {
    setSelectedKeyId(key.id);
    onSelectKey(key);
    setIsKeyDropdownOpen(false);
  };

  // Submit fast raw score
  const handleSaveRawScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentKey) {
      alert('Please select or create an Answer Key first.');
      return;
    }
    const scoreNum = parseInt(rawScoreInput);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > totalQuestions) {
      alert(`Please enter a valid score between 0 and ${totalQuestions}.`);
      return;
    }

    if (onDirectManualGrade) {
      onDirectManualGrade(currentKey, candidateName.trim() || `Candidate #${existingResultsCount + 1}`, {}, scoreNum);
    }
    onClose();
  };

  // Keypad punching
  const handlePunchOption = (opt: string) => {
    const nextAnswers = { ...punchedAnswers, [currentQIndex]: opt };
    setPunchedAnswers(nextAnswers);

    if (currentQIndex < totalQuestions) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handleFinishKeypadGrading = () => {
    if (!currentKey) return;
    if (onDirectManualGrade) {
      onDirectManualGrade(currentKey, candidateName.trim() || `Candidate #${existingResultsCount + 1}`, punchedAnswers);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner">
              <Award className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Grade Assessment
                <span className="text-[10px] bg-indigo-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Digital & Fast Entry
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                100% accurate grading with zero camera scanning errors
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800">
          
          {/* Master Key Selection Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Selected Master Key:</span>
              </label>
              
              <button
                type="button"
                onClick={onCreateKey}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New Key</span>
              </button>
            </div>

            {/* Dropdown Selector */}
            {savedKeys.length > 0 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsKeyDropdownOpen(prev => !prev)}
                  className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-xl p-2.5 px-3 flex items-center justify-between text-left transition shadow-xs cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {currentKey?.title || 'Select Master Key'}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{currentKey?.className || 'General'}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-indigo-600">{currentKey?.questionsCount || 20} Questions</span>
                      <span>•</span>
                      <span>{currentKey?.optionsCount === 3 ? '3-Opt (A-C)' : currentKey?.optionsCount === 5 ? '5-Opt (A-E)' : '4-Opt (A-D)'}</span>
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {isKeyDropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100 animate-fadeIn">
                    {savedKeys.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => handleKeySelect(k)}
                        className={`w-full text-left p-2.5 px-3 hover:bg-slate-50 flex items-center justify-between transition cursor-pointer ${
                          k.id === currentKey?.id ? 'bg-indigo-50/60 font-bold' : ''
                        }`}
                      >
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{k.title}</p>
                          <p className="text-[10px] text-slate-500">{k.className} • {k.questionsCount}Q</p>
                        </div>
                        {k.id === currentKey?.id && (
                          <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-center justify-between">
                <span>No master answer key found.</span>
                <button
                  type="button"
                  onClick={onCreateKey}
                  className="font-bold underline text-amber-900 ml-2 cursor-pointer"
                >
                  Create Key Now
                </button>
              </div>
            )}
          </div>

          {/* Candidate Name Input */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <UserCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold text-slate-600 shrink-0">Candidate:</span>
            <input 
              type="text" 
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-900 focus:outline-none flex-1 placeholder-slate-400"
              placeholder="e.g. Candidate #1 or Kwame Mensah"
            />
          </div>

          {/* ─────────────────────────────────────────────────────────────
              VIEW 1: PRIMARY SELECTION (CBT OR FAST ENTRY)
              ───────────────────────────────────────────────────────────── */}
          {entryMode === 'SELECT' && (
            <div className="space-y-3 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Choose Camera-Free Grading Method:
              </p>

              {/* Option 1: Digital CBT Online Exam */}
              {onOpenCBT && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCBT();
                  }}
                  className="w-full text-left p-4 rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-indigo-50/70 hover:from-indigo-100 hover:to-purple-100 transition shadow-sm hover:shadow-md group cursor-pointer flex items-start gap-3.5 relative"
                >
                  <div className="p-3 rounded-2xl bg-indigo-600 text-white group-hover:scale-105 transition shrink-0 shadow-md">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 pr-12">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-indigo-950">
                        Digital CBT Online Exam Link
                      </h3>
                      <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        100% Automated
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-900/80 mt-1 leading-snug">
                      Give students a 6-digit PIN or WhatsApp link to take the test on their phone or lab PC. Zero paper, zero bubble errors.
                    </p>
                  </div>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-700 font-black text-xs flex items-center gap-0.5">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </button>
              )}

              {/* Option 2: Quick Score Manual Entry */}
              <button
                type="button"
                onClick={() => setEntryMode('FAST_SCORE')}
                className="w-full text-left p-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition shadow-xs hover:shadow group cursor-pointer flex items-start gap-3.5 relative"
              >
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-950">
                      Rapid Raw Score Entry
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Instant Roster
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Type the total score (e.g. 18/{totalQuestions}) for marked papers. Auto-computes letter grades and syncs directly.
                  </p>
                </div>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-xs flex items-center gap-0.5">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </button>

              {/* Option 3: Fast 4-Button Keypad Punching */}
              <button
                type="button"
                onClick={() => {
                  setCurrentQIndex(1);
                  setPunchedAnswers({});
                  setEntryMode('KEYPAD_PUNCH');
                }}
                className="w-full text-left p-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition shadow-xs hover:shadow group cursor-pointer flex items-start gap-3.5 relative"
              >
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition shrink-0">
                  <Sliders className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-950">
                      Rapid A-B-C-D Keypad Punch
                    </h3>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Itemized
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Quickly tap student answers (A, B, C, D) with auto-advance to generate itemized diagnostic reports.
                  </p>
                </div>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-600 font-black text-xs flex items-center gap-0.5">
                  <span>Punch</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </button>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 2: FAST RAW SCORE INPUT
              ───────────────────────────────────────────────────────────── */}
          {entryMode === 'FAST_SCORE' && (
            <form onSubmit={handleSaveRawScore} className="space-y-4 pt-1 animate-fadeIn">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Enter Student Score
                </h3>
                <button
                  type="button"
                  onClick={() => setEntryMode('SELECT')}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Back to options
                </button>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <label className="text-xs font-bold text-slate-600 uppercase block">
                  Score (Out of {totalQuestions})
                </label>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={totalQuestions}
                    value={rawScoreInput}
                    onChange={(e) => setRawScoreInput(e.target.value)}
                    placeholder="0"
                    className="w-24 text-center font-mono text-3xl font-black bg-white border-2 border-indigo-400 focus:border-indigo-600 rounded-2xl py-2 text-slate-900 focus:outline-none shadow-xs"
                    autoFocus
                  />
                  <span className="text-xl font-mono text-slate-400 font-bold">/ {totalQuestions}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Grade & Generate Slip</span>
              </button>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 3: RAPID KEYPAD PUNCHING
              ───────────────────────────────────────────────────────────── */}
          {entryMode === 'KEYPAD_PUNCH' && (
            <div className="space-y-4 pt-1 animate-fadeIn">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="text-xs font-black text-indigo-600 font-mono">
                    Question {currentQIndex} of {totalQuestions}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    {Object.keys(punchedAnswers).length} Answers Recorded
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setEntryMode('SELECT')}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* 4 Large Touch Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['A', 'B', 'C', 'D'] as const).map(opt => {
                  const isCur = punchedAnswers[currentQIndex] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handlePunchOption(opt)}
                      className={`h-16 rounded-2xl font-mono text-2xl font-black border transition flex items-center justify-center shadow-xs cursor-pointer active:scale-95 ${
                        isCur 
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={currentQIndex <= 1}
                  onClick={() => setCurrentQIndex(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold disabled:opacity-40"
                >
                  Previous Q
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentQIndex < totalQuestions) {
                      setCurrentQIndex(prev => prev + 1);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Skip / Next Q
                </button>
              </div>

              <button
                type="button"
                onClick={handleFinishKeypadGrading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish & Grade Student Sheet</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
