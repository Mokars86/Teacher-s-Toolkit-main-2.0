import React, { useState } from 'react';
import { Check, Clipboard, Trash2, ArrowLeft, Plus, Save, Sparkles } from 'lucide-react';
import { AnswerKey } from '../types';

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
  const [questionsCount, setQuestionsCount] = useState<number>(initialKey?.questionsCount || defaultQuestionsCount);
  const [answers, setAnswers] = useState<{ [key: number]: string }>(() => {
    if (initialKey?.answers) {
      return { ...initialKey.answers };
    }
    // Prepopulate default key pattern
    const initial: { [key: number]: string } = {};
    const defaultPattern = ['A', 'B', 'C', 'D', 'C', 'B', 'A', 'D', 'B', 'C', 'D', 'A', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'];
    for (let i = 1; i <= defaultQuestionsCount; i++) {
      initial[i] = defaultPattern[(i - 1) % defaultPattern.length];
    }
    return initial;
  });

  const [pasteInput, setPasteInput] = useState<string>('');
  const [pasteFeedback, setPasteFeedback] = useState<string>('');

  const handleSelectOption = (questionIndex: number, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  // Quick Paste logic: parses continuous characters like ABCDA...
  const handleQuickPaste = () => {
    const cleaned = pasteInput.toUpperCase().replace(/[^A-D]/g, '');
    if (!cleaned) {
      setPasteFeedback('Please enter valid A, B, C, D letters.');
      return;
    }

    const newAnswers = { ...answers };
    for (let i = 0; i < cleaned.length && i < questionsCount; i++) {
      newAnswers[i + 1] = cleaned[i];
    }

    setAnswers(newAnswers);
    setPasteFeedback(`✔ Loaded ${Math.min(cleaned.length, questionsCount)} answers into key!`);
    setPasteInput('');
    setTimeout(() => setPasteFeedback(''), 4000);
  };

  const handleSetQuestionCount = (newCount: number) => {
    const count = Math.max(5, Math.min(100, newCount));
    setQuestionsCount(count);
    setAnswers(prev => {
      const updated = { ...prev };
      for (let i = 1; i <= count; i++) {
        if (!updated[i]) updated[i] = 'A';
      }
      return updated;
    });
  };

  const handleSave = () => {
    // Ensure all question indexes from 1 to questionsCount are defined in answers
    const sanitizedAnswers: { [key: number]: string } = {};
    for (let i = 1; i <= questionsCount; i++) {
      sanitizedAnswers[i] = answers[i] || 'A';
    }

    const saved: AnswerKey = {
      id: initialKey?.id || 'key_' + Date.now(),
      title: title.trim() || 'Untitled Answer Key',
      className: className.trim() || 'General Class',
      questionsCount,
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
              {initialKey ? 'Edit Master Answer Key' : 'Create Master Answer Key'}
            </h3>
            <p className="text-[11px] text-emerald-400 font-medium">Define correct bubble options for auto-grading</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-md cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Key</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
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
                placeholder="e.g. Science Quiz 1"
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
                placeholder="e.g. JHS 1 / Grade 10"
              />
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
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition font-bold text-base"
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
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition font-bold text-base"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[10, 20, 30, 40, 50].map((preset) => (
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

        {/* Quick Paste Area */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clipboard className="w-4 h-4 text-emerald-600" />
              <span>Quick Paste Answer Key Input</span>
            </h4>
            <span className="text-[10px] text-emerald-700 font-mono">e.g. ABCDABCCCDD</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              id="input_quick_paste"
              type="text"
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder="Paste answers like 'ABCDAC...' to auto-fill"
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
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Master Answer Matrix (Click to set correct bubble)
            </h4>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {Object.keys(answers).length} Configured
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 max-h-[420px] overflow-y-auto">
            {Array.from({ length: questionsCount }, (_, idx) => {
              const qNum = idx + 1;
              const selectedOpt = answers[qNum] || '';

              return (
                <div key={qNum} className="flex items-center justify-between bg-white p-2.5 px-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
                  <span className="font-mono text-xs font-extrabold text-slate-500">
                    Q{qNum.toString().padStart(2, '0')}
                  </span>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isSelected = selectedOpt === opt;
                      return (
                        <button
                          key={opt}
                          id={`btn_key_editor_q${qNum}_${opt}`}
                          type="button"
                          onClick={() => handleSelectOption(qNum, opt)}
                          className={`w-8 h-8 rounded-full text-xs font-black border transition-all flex items-center justify-center cursor-pointer ${
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
          Discard Changes
        </button>

        <button
          id="btn_key_editor_save"
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition shadow-md cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Master Key</span>
        </button>
      </div>

    </div>
  );
};
