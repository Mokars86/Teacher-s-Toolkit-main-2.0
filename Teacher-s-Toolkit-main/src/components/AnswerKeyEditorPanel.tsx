import React, { useState, useRef } from 'react';
import { Check, Clipboard, Trash2, ArrowLeft, Plus, Save, Sparkles, Layers, BookOpen, GraduationCap, Camera, Upload, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnswerKey } from '../types';
import { processOMRSheetImage } from '../services/omrService';

interface AnswerKeyEditorPanelProps {
  initialKey?: AnswerKey;
  onSave: (key: AnswerKey) => void;
  onCancel: () => void;
  defaultQuestionsCount?: number;
}

export const AnswerKeyEditorPanel: React.FC<AnswerKeyEditorPanelProps> = ({
  initialKey,
  onSave,
  onCancel,
  defaultQuestionsCount = 20
}) => {
  const [title, setTitle] = useState<string>(initialKey?.title || '');
  const [className, setClassName] = useState<string>(initialKey?.className || '');
  const [optionsCount, setOptionsCount] = useState<number>(initialKey?.optionsCount || 4);
  const [questionsCount, setQuestionsCount] = useState<number>(initialKey?.questionsCount || defaultQuestionsCount);
  
  // Real answers map - starting empty or from initial key
  const [answers, setAnswers] = useState<{ [key: number]: string }>(() => {
    if (initialKey?.answers) {
      return { ...initialKey.answers };
    }
    return {};
  });

  const [pasteInput, setPasteInput] = useState<string>('');
  const [pasteFeedback, setPasteFeedback] = useState<string>('');
  const [isScanningSheet, setIsScanningSheet] = useState<boolean>(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const activeOptions = ['A', 'B', 'C', 'D', 'E'].slice(0, optionsCount);

  const handleSwitchOptionsCount = (newCount: number) => {
    setOptionsCount(newCount);
    const validLetters = ['A', 'B', 'C', 'D', 'E'].slice(0, newCount);
    // Sanitize any answers that exceed the new option count
    setAnswers(prev => {
      const sanitized: { [key: number]: string } = {};
      Object.keys(prev).forEach(k => {
        const qNum = Number(k);
        const currentAns = prev[qNum];
        if (validLetters.includes(currentAns)) {
          sanitized[qNum] = currentAns;
        }
      });
      return sanitized;
    });
  };

  const handleSelectOption = (questionIndex: number, option: string) => {
    setAnswers(prev => {
      // Toggle off if clicked again, or set to selected option
      if (prev[questionIndex] === option) {
        const copy = { ...prev };
        delete copy[questionIndex];
        return copy;
      }
      return {
        ...prev,
        [questionIndex]: option
      };
    });
  };

  // Quick Paste logic: parses continuous characters based on active option count
  const handleQuickPaste = () => {
    const regex = optionsCount === 3 ? /[^A-C]/g : (optionsCount === 5 ? /[^A-E]/g : /[^A-D]/g);
    const cleaned = pasteInput.toUpperCase().replace(regex, '');
    if (!cleaned) {
      setPasteFeedback(`Please enter valid ${activeOptions.join(', ')} letters.`);
      return;
    }

    const newAnswers = { ...answers };
    for (let i = 0; i < cleaned.length && i < questionsCount; i++) {
      newAnswers[i + 1] = cleaned[i];
    }

    setAnswers(newAnswers);
    setPasteFeedback(`✔ Loaded ${Math.min(cleaned.length, questionsCount)} real answers into key!`);
    setPasteInput('');
    setTimeout(() => setPasteFeedback(''), 4000);
  };

  const handleSetQuestionCount = (newCount: number) => {
    const count = Math.max(5, Math.min(100, newCount));
    setQuestionsCount(count);
  };

  // Bulk fill actions for teacher convenience
  const handleFillAll = (opt: string) => {
    const updated: { [key: number]: string } = {};
    for (let i = 1; i <= questionsCount; i++) {
      updated[i] = opt;
    }
    setAnswers(updated);
    setPasteFeedback(`✔ All ${questionsCount} questions set to option ${opt}`);
    setTimeout(() => setPasteFeedback(''), 3000);
  };

  const handleClearAll = () => {
    setAnswers({});
    setPasteFeedback(`✔ Cleared all answers. You can now tap each question to set real answers.`);
    setTimeout(() => setPasteFeedback(''), 3000);
  };

  // Scan physical master key card from image / camera
  const handleScanMasterSheetFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningSheet(true);
    setScanStatusMessage('Reading master answer sheet bubbles via Computer Vision...');

    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        if (!dataUrl) {
          setIsScanningSheet(false);
          return;
        }

        try {
          const corners = [
            { id: 'TL', x: 8, y: 8 },
            { id: 'TR', x: 92, y: 8 },
            { id: 'BL', x: 8, y: 92 },
            { id: 'BR', x: 92, y: 92 }
          ];

          const detectedConfLog = await processOMRSheetImage(
            dataUrl,
            corners,
            questionsCount,
            {
              id: 'temp_master',
              title: title || 'Temp Master',
              className: className || 'Temp Class',
              questionsCount,
              optionsCount,
              answers: {},
              createdAt: ''
            }
          );

          if (detectedConfLog && detectedConfLog.length > 0) {
            const scannedMap: { [key: number]: string } = {};
            let countDetected = 0;
            detectedConfLog.forEach(item => {
              if (item.detected && activeOptions.includes(item.detected)) {
                scannedMap[item.questionNumber] = item.detected;
                countDetected++;
              }
            });

            setAnswers(prev => ({ ...prev, ...scannedMap }));
            setScanStatusMessage(`✔ Successfully scanned ${countDetected}/${questionsCount} answers from your master sheet!`);
          } else {
            setScanStatusMessage('Could not clearly read master sheet. Please ensure paper is well lit.');
          }
        } catch (err: any) {
          setScanStatusMessage(`Scan error: ${err?.message || 'Failed to analyze master sheet'}`);
        } finally {
          setIsScanningSheet(false);
          setTimeout(() => setScanStatusMessage(''), 5000);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsScanningSheet(false);
    }
    e.target.value = '';
  };

  const configuredCount = Object.keys(answers).filter(k => Number(k) <= questionsCount && answers[Number(k)]).length;
  const isAllConfigured = configuredCount === questionsCount;

  const handleSave = () => {
    // Warn if some questions are left unset
    if (configuredCount < questionsCount) {
      const confirmSave = confirm(
        `Note: ${questionsCount - configuredCount} questions are currently unassigned. Any unassigned question will default to option A. Proceed to save?`
      );
      if (!confirmSave) return;
    }

    const sanitizedAnswers: { [key: number]: string } = {};
    for (let i = 1; i <= questionsCount; i++) {
      sanitizedAnswers[i] = answers[i] || activeOptions[0];
    }

    const saved: AnswerKey = {
      id: initialKey?.id || 'key_' + Date.now(),
      title: title.trim() || 'Custom Answer Key',
      className: className.trim() || 'General Class',
      questionsCount,
      optionsCount,
      answers: sanitizedAnswers,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    onSave(saved);
  };

  return (
    <div id="answer_key_editor_panel" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-3xl mx-auto my-2 sm:my-6 flex flex-col min-h-[85vh]">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            id="btn_back_key_editor"
            type="button"
            onClick={onCancel} 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
              {initialKey ? 'Edit Master Answer Key Card' : 'Create Master Answer Key Card'}
            </h3>
            <p className="text-[11px] text-emerald-400 font-medium">Define real correct bubble options for auto-grading</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-md cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Master Key</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
        
        {/* Hidden inputs for camera & upload */}
        <input 
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleScanMasterSheetFile}
        />
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleScanMasterSheetFile}
        />

        {/* Scan Physical Master Sheet Action Banner */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-emerald-700/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                <Camera className="w-4 h-4" />
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-white">Scan Physical Master Sheet</h4>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              Have a marked teacher's answer key sheet? Snap a photo to automatically extract and populate all answers!
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isScanningSheet}
              className="flex-1 sm:flex-initial py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isScanningSheet ? 'Scanning...' : 'Camera Scan'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanningSheet}
              className="flex-1 sm:flex-initial py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-sky-300" />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>

        {scanStatusMessage && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            scanStatusMessage.includes('✔') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{scanStatusMessage}</span>
          </div>
        )}

        {/* Metadata Inputs Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Test / Exam Title</label>
              <input 
                id="input_key_title"
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 shadow-xs"
                placeholder="e.g. Science Quiz 1 / End of Term Exam"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Class / Grade</label>
              <input 
                id="input_key_class"
                type="text" 
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 shadow-xs"
                placeholder="e.g. Primary 3 / JHS 1 / SHS 2"
              />
            </div>
          </div>

          {/* Option Count Scheme Selector */}
          <div className="pt-2 border-t border-slate-200/70 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Answer Option Format (Level)</span>
              <span className="text-[10px] font-mono text-emerald-600 font-extrabold uppercase">
                {optionsCount === 3 ? '🌱 Lower Level (3 Choices: A, B, C)' : (optionsCount === 5 ? '🎯 Advanced (5 Choices: A-E)' : '⚡ Standard (4 Choices: A-D)')}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn_opt_mode_3"
                onClick={() => handleSwitchOptionsCount(3)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                  optionsCount === 3
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/40'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="font-extrabold">3 Options (A, B, C)</span>
                <span className={`text-[10px] font-normal ${optionsCount === 3 ? 'text-emerald-100' : 'text-slate-400'}`}>
                  Primary / Lower Level
                </span>
              </button>

              <button
                type="button"
                id="btn_opt_mode_4"
                onClick={() => handleSwitchOptionsCount(4)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                  optionsCount === 4
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/40'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="font-extrabold">4 Options (A, B, C, D)</span>
                <span className={`text-[10px] font-normal ${optionsCount === 4 ? 'text-emerald-100' : 'text-slate-400'}`}>
                  Standard / JHS / SHS
                </span>
              </button>

              <button
                type="button"
                id="btn_opt_mode_5"
                onClick={() => handleSwitchOptionsCount(5)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                  optionsCount === 5
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/40'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="font-extrabold">5 Options (A to E)</span>
                <span className={`text-[10px] font-normal ${optionsCount === 5 ? 'text-emerald-100' : 'text-slate-400'}`}>
                  Advanced / Tertiary
                </span>
              </button>
            </div>
          </div>

          {/* Question Count Selectors */}
          <div className="pt-2 border-t border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Questions</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetQuestionCount(questionsCount - 1)}
                  disabled={questionsCount <= 5}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition font-bold text-base cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-sm font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  {questionsCount} Qs
                </span>
                <button
                  type="button"
                  onClick={() => handleSetQuestionCount(questionsCount + 1)}
                  disabled={questionsCount >= 100}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition font-bold text-base cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[10, 15, 20, 25, 30, 40, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSetQuestionCount(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    questionsCount === preset
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {preset} Qs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Tools & Batch Actions */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick Key Tools & Batch Fill</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">1-Tap operations</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {activeOptions.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => handleFillAll(opt)}
                className="py-1.5 px-2.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Set All to [{opt}]
              </button>
            ))}

            <button
              type="button"
              onClick={handleClearAll}
              className="py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Quick Paste Area */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clipboard className="w-4 h-4 text-emerald-600" />
              <span>Quick Paste Answer Key Input</span>
            </h4>
            <span className="text-[10px] text-emerald-700 font-mono">
              e.g. {optionsCount === 3 ? 'ABCABCAB' : 'ABCDABCCCDD'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              id="input_quick_paste"
              type="text" 
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder={`Paste answer letters string like '${optionsCount === 3 ? 'ABCABC...' : 'ABCDAC...'}' to auto-fill`}
              className="flex-1 bg-white border border-emerald-200 rounded-xl px-3.5 py-2 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-emerald-500 shadow-xs text-slate-900"
            />
            <button
              id="btn_quick_paste_apply"
              type="button"
              onClick={handleQuickPaste}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Paste</span>
            </button>
          </div>
          {pasteFeedback && (
            <p className="text-xs font-bold text-emerald-700">{pasteFeedback}</p>
          )}
        </div>

        {/* Answer Bubbles Matrix */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Master Answer Matrix ({optionsCount} Bubbles: {activeOptions.join(', ')})
              </h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isAllConfigured 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {configuredCount}/{questionsCount} Configured
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 max-h-[420px] overflow-y-auto">
            {Array.from({ length: questionsCount }, (_, idx) => {
              const qNum = idx + 1;
              const selectedOpt = answers[qNum] || '';

              return (
                <div 
                  key={qNum} 
                  className={`flex items-center justify-between p-2.5 px-3.5 rounded-xl border shadow-xs transition-all ${
                    selectedOpt 
                      ? 'bg-white border-slate-200 hover:border-emerald-300' 
                      : 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-extrabold text-slate-600">
                      Q{qNum.toString().padStart(2, '0')}
                    </span>
                    {!selectedOpt && (
                      <span className="text-[9px] text-amber-600 font-bold bg-amber-100 px-1 py-0.2 rounded">
                        unset
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {activeOptions.map((opt) => {
                      const isSelected = selectedOpt === opt;
                      return (
                        <button
                          key={opt}
                          id={`btn_key_editor_q${qNum}_${opt}`}
                          type="button"
                          onClick={() => handleSelectOption(qNum, opt)}
                          className={`${optionsCount === 3 ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-xs'} rounded-full font-black border transition-all flex items-center justify-center cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105' 
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky bottom-0 z-10 shrink-0">
        <button
          id="btn_key_editor_cancel"
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition py-2 px-3 rounded-lg hover:bg-slate-200/50 cursor-pointer"
        >
          Discard
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            {configuredCount}/{questionsCount} Real Answers Set
          </span>
          <button
            id="btn_key_editor_save"
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Master Key Card</span>
          </button>
        </div>
      </div>

    </div>
  );
};
