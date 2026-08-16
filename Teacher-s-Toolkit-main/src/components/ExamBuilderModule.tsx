import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Shuffle, Image as ImageIcon, Camera, 
  Printer, Share2, Save, FileText, CheckCircle2, CheckCircle, 
  HelpCircle, ChevronDown, Sparkles, Copy, X, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { ExamPaper, ExamQuestion, AnswerKey, SchoolProfile } from '../types';

interface ExamBuilderModuleProps {
  onBack: () => void;
  schoolProfile: SchoolProfile | null;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  onSaveMasterKeyAndScan: (key: AnswerKey) => void;
}

const DEFAULT_SAMPLE_QUESTIONS: ExamQuestion[] = [
  {
    id: "q_1",
    questionNumber: 1,
    questionText: "Which organelle is known as the powerhouse of the cell?",
    options: {
      A: "Nucleus",
      B: "Mitochondria",
      C: "Ribosome",
      D: "Endoplasmic Reticulum"
    },
    correctOption: "B",
    marks: 1
  },
  {
    id: "q_2",
    questionNumber: 2,
    questionText: "What is the chemical formula for water?",
    options: {
      A: "CO2",
      B: "H2O",
      C: "NaCl",
      D: "O2"
    },
    correctOption: "B",
    marks: 1
  },
  {
    id: "q_3",
    questionNumber: 3,
    questionText: "Which process do green plants use to manufacture their own food?",
    options: {
      A: "Respiration",
      B: "Photosynthesis",
      C: "Transpiration",
      D: "Osmosis"
    },
    correctOption: "B",
    marks: 1
  },
  {
    id: "q_4",
    questionNumber: 4,
    questionText: "What is the SI unit of electric current?",
    options: {
      A: "Volt",
      B: "Watt",
      C: "Ampere",
      D: "Ohm"
    },
    correctOption: "C",
    marks: 1
  }
];

export function ExamBuilderModule({
  onBack,
  schoolProfile,
  selectedClass,
  setSelectedClass,
  onSaveMasterKeyAndScan
}: ExamBuilderModuleProps) {
  const [examTitle, setExamTitle] = useState<string>("End of Term 3 Examination");
  const [subject, setSubject] = useState<string>("Integrated Science");
  const [timeAllowed, setTimeAllowed] = useState<string>("1 Hour 30 Mins");
  const [totalTargetQuestions, setTotalTargetQuestions] = useState<number>(40);
  const [instructions, setInstructions] = useState<string>(
    "Answer all objective questions on the provided OMR Answer Sheet using an HB pencil. Do not fold or crease the answer sheet."
  );

  const [examType, setExamType] = useState<"mcq" | "theory">("mcq");
  const [questions, setQuestions] = useState<ExamQuestion[]>(DEFAULT_SAMPLE_QUESTIONS);

  const [isOutputModalOpen, setIsOutputModalOpen] = useState<boolean>(false);
  const [activeTabPDF, setActiveTabPDF] = useState<"exam" | "omr">("exam");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [activeImageQId, setActiveImageQId] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string>("");

  const classList = ["JHS 2 Gold", "JHS 1 Emerald", "Primary 6 Ruby", "SHS 1 General Arts"];
  const subjectList = ["Integrated Science", "Mathematics", "English Language", "Social Studies", "RME", "ICT / Computing"];

  const handleAddQuestion = () => {
    const nextNum = questions.length + 1;
    const newQ: ExamQuestion = {
      id: `q_${Date.now()}`,
      questionNumber: nextNum,
      questionText: "",
      options: {
        A: "",
        B: "",
        C: "",
        D: ""
      },
      correctOption: "A",
      marks: 1
    };
    setQuestions(prev => [...prev, newQ]);

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleUpdateQuestionText = (id: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, questionText: text } : q));
  };

  const handleUpdateOption = (id: string, optKey: "A" | "B" | "C" | "D", value: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          options: {
            ...q.options,
            [optKey]: value
          }
        };
      }
      return q;
    }));
  };

  const handleSelectCorrectOption = (id: string, optKey: "A" | "B" | "C" | "D") => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, correctOption: optKey } : q));
  };

  const handleShuffleOptions = (id: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        const keys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
        const originalCorrectText = q.options[q.correctOption];
        const values = [q.options.A, q.options.B, q.options.C, q.options.D];

        for (let i = values.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [values[i], values[j]] = [values[j], values[i]];
        }

        const newOptions = {
          A: values[0],
          B: values[1],
          C: values[2],
          D: values[3]
        };

        let newCorrectKey: "A" | "B" | "C" | "D" = "A";
        for (const k of keys) {
          if (newOptions[k] === originalCorrectText) {
            newCorrectKey = k;
            break;
          }
        }

        return { ...q, options: newOptions, correctOption: newCorrectKey };
      }
      return q;
    }));
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(prev => {
      const filtered = prev.filter(q => q.id !== id);
      return filtered.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    });
  };

  const handleSaveImageAttachment = () => {
    if (!activeImageQId) return;
    setQuestions(prev => prev.map(q => q.id === activeImageQId ? { ...q, imageUrl: tempImageUrl } : q));
    setActiveImageQId(null);
    setTempImageUrl("");
  };

  const compiledAnswerKey = useMemo(() => {
    const keyMap: { [key: number]: string } = {};
    questions.forEach(q => {
      keyMap[q.questionNumber] = q.correctOption;
    });

    const keyObj: AnswerKey = {
      id: `key_${Date.now()}`,
      title: `${subject} - ${examTitle}`,
      className: selectedClass,
      questionsCount: questions.length,
      answers: keyMap,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    return keyObj;
  }, [questions, subject, examTitle, selectedClass]);

  const handleLaunchOMRScanner = () => {
    onSaveMasterKeyAndScan(compiledAnswerKey);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col pb-32 transition-colors duration-200 animate-fade-in">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Exam Question Builder & 2-Column PDF</h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mobile MCQ Entry & Paper-Saving Print Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-900 dark:text-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl">
              {schoolProfile?.name || "St. Peter's Basic"} • {selectedClass}
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow-inner">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Questions:</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {questions.length} / {totalTargetQuestions}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 pt-6 space-y-6 flex-1">

        {/* SECTION A: EXAM METADATA */}
        <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl space-y-4 card-accent-top">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚙️ Exam Paper Metadata</span>
                <span className="chip-brand">Print Header Info</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure title, duration, marks, and student instructions for output PDF.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Exam Title</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. End of Term 3 Examination"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
              >
                {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Class Roster</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
              >
                {classList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Time Allowed</label>
              <input
                type="text"
                value={timeAllowed}
                onChange={(e) => setTimeAllowed(e.target.value)}
                placeholder="e.g. 1 Hour 30 Mins"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Target Questions</label>
              <input
                type="number"
                value={totalTargetQuestions}
                onChange={(e) => setTotalTargetQuestions(parseInt(e.target.value) || 40)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Student Instructions</label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* SECTION B: EXAM TYPE SWITCHER */}
        <section className="bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/80 rounded-2xl p-1.5 grid grid-cols-2 gap-1.5 shadow-md">
          <button
            type="button"
            onClick={() => setExamType("mcq")}
            className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              examType === "mcq"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 scale-[1.01]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            <span className="text-base">📝</span>
            <span>MCQ Mode (Auto-Graded via Scanner)</span>
          </button>

          <button
            type="button"
            onClick={() => setExamType("theory")}
            className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              examType === "theory"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 scale-[1.01]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            <span className="text-base">✍️</span>
            <span>Section B / Theory Mode</span>
          </button>
        </section>

        {/* SECTION C: QUESTION REPEATER */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>Question Cards List ({questions.length})</span>
            </h2>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Single-thumb fast mobile typing active</span>
          </div>

          {questions.map((q) => (
            <div 
              key={q.id}
              className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl space-y-4 relative transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                    Q{q.questionNumber}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Question #{q.questionNumber} of {totalTargetQuestions}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImageQId(q.id);
                      setTempImageUrl(q.imageUrl || "");
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      q.imageUrl 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/40' 
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Attach Diagram / Figure"
                  >
                    <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="hidden sm:inline">{q.imageUrl ? 'Diagram Attached' : 'Attach Figure'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShuffleOptions(q.id)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 transition-all"
                    title="Shuffle Options Order"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={2}
                  value={q.questionText}
                  onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                  placeholder={`Type Question ${q.questionNumber} text here (e.g. What is the SI unit of force?)...`}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 rounded-2xl p-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none leading-relaxed resize-y"
                />

                {q.imageUrl && (
                  <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950">
                    <img src={q.imageUrl} alt="Attached Figure" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleUpdateQuestionText(q.id, q.questionText)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Options Grid (Tap radio button to set correct answer key)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active Key: Option {q.correctOption}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["A", "B", "C", "D"] as const).map(optKey => {
                    const isCorrect = q.correctOption === optKey;
                    return (
                      <div
                        key={optKey}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all ${
                          isCorrect 
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-900/20' 
                            : 'bg-slate-50/80 dark:bg-slate-900/70 border-slate-300 dark:border-slate-700/80 hover:border-slate-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectCorrectOption(q.id, optKey)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                            isCorrect 
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm' 
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
                          }`}
                        >
                          {isCorrect ? "✓" : optKey}
                        </button>

                        <input
                          type="text"
                          value={q.options[optKey]}
                          onChange={(e) => handleUpdateOption(q.id, optKey, e.target.value)}
                          placeholder={`Option ${optKey}...`}
                          className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-indigo-700 dark:text-indigo-300 font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
            >
              <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>+ Add Next Question (Q{questions.length + 1})</span>
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => alert("Draft exam paper saved locally!")}
            className="py-3.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>💾 Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOutputModalOpen(true)}
            className="flex-1 py-3.5 px-6 btn-primary rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30"
          >
            <FileText className="w-5 h-5" />
            <span>📄 Generate 2-Column PDF & OMR Key</span>
          </button>
        </div>
      </footer>

      {/* IMAGE ATTACHMENT MODAL */}
      {activeImageQId && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900 dark:text-white">
            <h3 className="text-base font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Attach Diagram or Image to Question</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enter image URL or choose pre-set diagram figure.</p>

            <input
              type="text"
              value={tempImageUrl}
              onChange={(e) => setTempImageUrl(e.target.value)}
              placeholder="https://example.com/diagram.png or data:image..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
            />

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Preset Diagrams</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTempImageUrl("https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=300&q=80")}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-lg text-xs"
                >
                  🧪 Lab Beaker
                </button>
                <button
                  type="button"
                  onClick={() => setTempImageUrl("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=300&q=80")}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-lg text-xs"
                >
                  📐 Geometry Triangle
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveImageQId(null)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImageAttachment}
                className="w-full py-2.5 btn-primary font-bold rounded-xl text-xs"
              >
                Save Figure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-GENERATION MODAL */}
      {isOutputModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative text-slate-900 dark:text-white">
            <button
              onClick={() => setIsOutputModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-bold">Exam Paper & Answer Key Ready</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Compiled 2-Column Paper PDF & Mapped OMR Key.</p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl grid grid-cols-2 gap-1 text-xs font-bold">
              <button
                onClick={() => setActiveTabPDF("exam")}
                className={`py-2 rounded-lg transition-all ${
                  activeTabPDF === 'exam' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                📄 2-Column Question Paper PDF
              </button>
              <button
                onClick={() => setActiveTabPDF("omr")}
                className={`py-2 rounded-lg transition-all ${
                  activeTabPDF === 'omr' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                📝 Matching OMR Answer Sheet
              </button>
            </div>

            {activeTabPDF === "exam" ? (
              <div id="printable-exam-paper" className="bg-white text-slate-900 p-6 rounded-2xl shadow-inner space-y-4 max-h-[50vh] overflow-y-auto font-sans text-xs">
                <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                  <h2 className="text-base font-extrabold uppercase tracking-tight">{schoolProfile?.name || "ST. PETER'S BASIC SCHOOL"}</h2>
                  <p className="text-[10px] text-slate-600 font-medium">{schoolProfile?.address || "P.O. Box 42, Osu, Accra - Ghana"}</p>
                  <div className="text-xs font-bold text-indigo-900 uppercase pt-1">{examTitle} — {subject}</div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 pt-2 px-2 border-t border-slate-200">
                    <span>CLASS: {selectedClass}</span>
                    <span>TIME: {timeAllowed}</span>
                    <span>MARKS: {questions.length}</span>
                  </div>
                </div>

                <div className="bg-slate-100 p-2 rounded text-[11px] italic text-slate-700">
                  <strong>Instructions:</strong> {instructions}
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] leading-snug">
                  {questions.map(q => (
                    <div key={q.id} className="space-y-1 border-b border-slate-100 pb-2 break-inside-avoid">
                      <div className="font-bold text-slate-900">
                        {q.questionNumber}. {q.questionText}
                      </div>
                      {q.imageUrl && (
                        <img src={q.imageUrl} alt="Figure" className="w-24 h-16 object-cover rounded border my-1" />
                      )}
                      <div className="grid grid-cols-2 gap-1 text-slate-700 font-medium pl-1">
                        <div>A. {q.options.A}</div>
                        <div>B. {q.options.B}</div>
                        <div>C. {q.options.C}</div>
                        <div>D. {q.options.D}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div id="printable-omr-paper" className="bg-white text-slate-900 p-6 rounded-2xl shadow-inner space-y-4 max-h-[50vh] overflow-y-auto font-sans text-xs">
                <div className="text-center border-b-2 border-slate-900 pb-3">
                  <h2 className="text-sm font-extrabold uppercase">{schoolProfile?.name || "ST. PETER'S BASIC SCHOOL"}</h2>
                  <div className="text-xs font-bold text-indigo-900">OFFICIAL OMR ANSWER BUBBLE SHEET</div>
                  <p className="text-[10px] text-slate-600">{subject} • {selectedClass} • Total Questions: {questions.length}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {questions.map(q => (
                    <div key={q.id} className="flex items-center justify-between p-1.5 border border-slate-200 rounded font-mono text-[11px]">
                      <span className="font-bold">{q.questionNumber}.</span>
                      <div className="flex gap-1.5">
                        {(["A", "B", "C", "D"] as const).map(opt => (
                          <span key={opt} className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                            q.correctOption === opt ? 'border-emerald-600 text-emerald-700 bg-emerald-50 font-black' : 'border-slate-400 text-slate-500'
                          }`}>
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700"
                >
                  <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Print {activeTabPDF === 'exam' ? '2-Column Exam PDF' : 'OMR Sheet'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Exam Paper: ${examTitle} - ${subject} (${questions.length} Questions) ready for printing.`);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700"
                >
                  <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{copiedLink ? "Copied Share Link!" : "Share / WhatsApp PDF"}</span>
                </button>
              </div>

              <button
                onClick={handleLaunchOMRScanner}
                className="w-full btn-emerald py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <span>📸 Ready for Objective Marker (Launch Camera Scanner)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
