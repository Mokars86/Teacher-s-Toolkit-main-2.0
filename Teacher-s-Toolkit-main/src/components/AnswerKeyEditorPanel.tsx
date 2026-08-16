import React, { useState } from 'react';
import { Check, Clipboard, Trash2, ArrowLeft, Plus, Save } from 'lucide-react';
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
  const [title, setTitle] = useState<string>(initialKey?.title || 'Grade 10 - Math Final');
  const [className, setClassName] = useState<string>(initialKey?.className || 'Grade 10-A');
  const [questionsCount, setQuestionsCount] = useState<number>(initialKey?.questionsCount || defaultQuestionsCount);
  const [answers, setAnswers] = useState<{ [key: number]: string }>(() => {
    if (initialKey?.answers) {
      return { ...initialKey.answers };
    }
    // Prepopulate some default keys
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

  // Quick Paste logic: parses ABCDA or A B C D and fills the map
  const handleQuickPaste = () => {
    const cleaned = pasteInput.toUpperCase().replace(/[^A-D]/g, '');
    if (!cleaned) {
      setPasteFeedback('No valid A, B, C, D options found to paste.');
      return;
    }

    const newAnswers = { ...answers };
    for (let i = 0; i < cleaned.length && i < questionsCount; i++) {
      newAnswers[i + 1] = cleaned[i];
    }

    setAnswers(newAnswers);
    setPasteFeedback(`Successfully loaded ${cleaned.length} answers!`);
    setPasteInput('');
    setTimeout(() => setPasteFeedback(''), 4000);
  };

  const handleSave = () => {
    const saved: AnswerKey = {
      id: initialKey?.id || 'key_' + Date.now(),
      title: title.trim() || 'Untitled Answer Key',
      className: className.trim() || 'General Class',
      questionsCount,
      answers,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    onSave(saved);
  };

  const handleAddQuestion = () => {
    const nextQ = questionsCount + 1;
    setQuestionsCount(nextQ);
    setAnswers(prev => ({ ...prev, [nextQ]: 'A' }));
  };

  const handleRemoveLastQuestion = () => {
    if (questionsCount > 1) {
      const nextQ = questionsCount - 1;
      setQuestionsCount(nextQ);
      setAnswers(prev => {
        const nextAnswers = { ...prev };
        delete nextAnswers[questionsCount];
        return nextAnswers;
      });
    }
  };

  return (
    <div id="answer_key_editor_panel" className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto my-4">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            id="btn_back_key_editor"
            onClick={onCancel} 
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialKey ? 'Edit Master Answer Key' : 'Create New Answer Key'}
            </h3>
            <p className="text-xs text-emerald-700 font-semibold">Define exact bubble patterns for auto-grading</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Test Title</label>
            <input 
              id="input_key_title"
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
              placeholder="e.g. History Midterm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Class/Grade</label>
            <input 
              id="input_key_class"
              type="text" 
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Grade 10-B"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Questions</label>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-sm font-bold px-4 py-2.5 rounded-xl block min-w-[70px] text-center">
                {questionsCount} Qs
              </span>
              <button
                id="btn_key_editor_dec_q"
                type="button"
                onClick={handleRemoveLastQuestion}
                disabled={questionsCount <= 5}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl disabled:opacity-50 transition"
                title="Remove last question row"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                id="btn_key_editor_inc_q"
                type="button"
                onClick={handleAddQuestion}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                title="Add new question row"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Paste Area */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clipboard className="w-4 h-4 text-emerald-500" />
              <span>Quick Paste Answer Key Input</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">e.g. ABCDABCCCDD</span>
          </div>

          <div className="flex gap-2">
            <input 
              id="input_quick_paste"
              type="text"
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder="Paste answers continuous characters like 'ABCDAC...' to auto-fill the grid"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-emerald-500"
            />
            <button
              id="btn_quick_paste_apply"
              onClick={handleQuickPaste}
              className="p-2 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl text-xs transition border border-emerald-200"
            >
              Apply Paste
            </button>
          </div>
          {pasteFeedback && (
            <p className="text-xs font-semibold text-emerald-600 animate-pulse">{pasteFeedback}</p>
          )}
        </div>

        {/* Answer Bubbles Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Master Answer Matrix (Click to set correct bubble)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200 max-h-[380px] overflow-y-auto">
            {Array.from({ length: questionsCount }, (_, idx) => {
              const qNum = idx + 1;
              const selectedOpt = answers[qNum] || '';

              return (
                <div key={qNum} className="flex items-center justify-between bg-white p-2.5 px-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all">
                  <span className="font-mono text-xs font-bold text-slate-400">Q{qNum.toString().padStart(2, '0')}</span>
                  
                  <div className="flex gap-2">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const isSelected = selectedOpt === opt;
                      return (
                        <button
                          key={opt}
                          id={`btn_key_editor_q${qNum}_${opt}`}
                          onClick={() => handleSelectOption(qNum, opt)}
                          className={`w-7 h-7 rounded-full text-xs font-extrabold border transition flex items-center justify-center ${
                            isSelected 
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_2px_6px_rgba(5,150,105,0.3)] scale-110' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
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

      {/* Footer Actions */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        <button
          id="btn_key_editor_cancel"
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          Discard Changes
        </button>

        <button
          id="btn_key_editor_save"
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>Save Master Key</span>
        </button>
      </div>

    </div>
  );
};
