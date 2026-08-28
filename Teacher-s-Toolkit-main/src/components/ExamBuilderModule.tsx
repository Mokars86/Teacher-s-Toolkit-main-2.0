import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Shuffle, Image as ImageIcon, Camera, 
  Printer, Share2, Save, FileText, CheckCircle2, CheckCircle, 
  HelpCircle, ChevronDown, Sparkles, Copy, X, ArrowRight, Eye, RefreshCw, BookOpen
} from 'lucide-react';
import { ExamPaper, ExamQuestion, AnswerKey, SchoolProfile } from '../types';
import { QuestionBankImportModal } from './QuestionBankImportModal';

interface ExamBuilderModuleProps {
  onBack: () => void;
  schoolProfile: SchoolProfile | null;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  onSaveMasterKeyAndScan: (key: AnswerKey) => void;
  userProfile?: any;
  onTriggerPaywall?: (featureName: string, description: string) => void;
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

interface SavedExamDraft {
  id: string;
  examTitle: string;
  subject: string;
  selectedClass: string;
  timeAllowed: string;
  totalTargetQuestions: number;
  instructions: string;
  examType: "mcq" | "theory";
  questions: ExamQuestion[];
  savedAt: string;
}

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
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isLoadDraftModalOpen, setIsLoadDraftModalOpen] = useState<boolean>(false);
  const [activeTabPDF, setActiveTabPDF] = useState<"exam" | "omr">("exam");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [draftNotice, setDraftNotice] = useState<boolean>(false);

  const [activeImageQId, setActiveImageQId] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string>("");

  const [savedDrafts, setSavedDrafts] = useState<SavedExamDraft[]>(() => {
    try {
      const raw = localStorage.getItem("teacher_exam_drafts");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleSaveDraft = () => {
    try {
      const newDraft: SavedExamDraft = {
        id: `draft_${Date.now()}`,
        examTitle,
        subject,
        selectedClass,
        timeAllowed,
        totalTargetQuestions,
        instructions,
        examType,
        questions,
        savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      const updatedList = [newDraft, ...savedDrafts.filter(d => !(d.examTitle === examTitle && d.subject === subject && d.selectedClass === selectedClass))];
      setSavedDrafts(updatedList);
      localStorage.setItem("teacher_exam_drafts", JSON.stringify(updatedList));

      setDraftNotice(true);
      setTimeout(() => setDraftNotice(false), 2500);
    } catch (err) {
      alert("Draft saved!");
    }
  };

  const handleLoadSelectedDraft = (draft: SavedExamDraft) => {
    setExamTitle(draft.examTitle);
    setSubject(draft.subject);
    setSelectedClass(draft.selectedClass);
    setTimeAllowed(draft.timeAllowed);
    setTotalTargetQuestions(draft.totalTargetQuestions);
    setInstructions(draft.instructions);
    setExamType(draft.examType);
    setQuestions(draft.questions);
    setIsLoadDraftModalOpen(false);
    setDraftNotice(true);
    setTimeout(() => setDraftNotice(false), 2500);
  };

  const handleDeleteDraft = (id: string) => {
    const updated = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(updated);
    localStorage.setItem("teacher_exam_drafts", JSON.stringify(updated));
  };

  const handleGenerateExamPaper = () => {
    if (!questions || questions.length === 0) {
      alert("Please add or import at least 1 question to generate the exam paper.");
      return;
    }
    setIsOutputModalOpen(true);
  };

  const handleImportQuestions = (imported: ExamQuestion[]) => {
    setQuestions(prev => {
      const startNum = prev.length + 1;
      const renumbered = imported.map((q, idx) => ({
        ...q,
        questionNumber: startNum + idx
      }));
      return [...prev, ...renumbered];
    });
  };

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
      {/* HEADER BAR (MOBILE & IPHONE SE OPTIMIZED) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Back button & Title block */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button 
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg shrink-0">📄</span>
                <h1 className="text-xs sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                  <span className="sm:hidden">Exam Builder & PDF</span>
                  <span className="hidden sm:inline">Exam Question Builder & 2-Column PDF</span>
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                MCQ & Paper-Saving Print Engine
              </p>
            </div>
          </div>

          {/* Right side Badges: Class & Question Counter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-900 dark:text-indigo-200 text-[10px] sm:text-xs font-extrabold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl truncate max-w-[95px] sm:max-w-none">
              {selectedClass}
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1 shadow-xs">
              <span className="text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase hidden sm:inline">Qs:</span>
              <span className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {questions.length}/{totalTargetQuestions}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 pt-6 space-y-6 flex-1">

        {/* SECTION A: EXAM METADATA */}
        <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl space-y-4 card-accent-top">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚙️ Exam Paper Metadata</span>
                <span className="chip-brand">Print Header Info</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure title, duration, marks, and student instructions for output PDF.</p>
            </div>

            {savedDrafts.length > 0 && (
              <button
                type="button"
                id="btn_open_saved_drafts"
                onClick={() => setIsLoadDraftModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition shadow-xs self-start sm:self-auto cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>📁 Load Saved Drafts ({savedDrafts.length})</span>
              </button>
            )}
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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>Question Cards List ({questions.length})</span>
            </h2>
            
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>📚 Import from WAEC Bank</span>
            </button>
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

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-indigo-700 dark:text-indigo-300 font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>+ Create Manual Question (Q{questions.length + 1})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="py-3.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
            >
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>📚 Import from WAEC Bank</span>
            </button>
          </div>

          {/* Action Deck: Save Draft & Generate PDF Directly Below Last Question */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-4 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Exam Paper Output Actions</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                id="btn_save_draft_inline"
                onClick={handleSaveDraft}
                className="py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{draftNotice ? "✓ Draft Saved!" : "💾 Save Exam Draft"}</span>
              </button>

              <button
                type="button"
                id="btn_generate_pdf_inline"
                onClick={handleGenerateExamPaper}
                className="sm:col-span-2 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer active:scale-[0.98]"
              >
                <FileText className="w-5 h-5" />
                <span>📄 Generate 2-Column PDF & OMR Key</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER BAR (OPTIMIZED FOR IPHONE SE & SMALL MOBILE SCREENS) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2.5 sm:p-4 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            id="btn_save_exam_draft"
            onClick={handleSaveDraft}
            className="shrink-0 py-3 px-3 sm:py-3.5 sm:px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl sm:rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Save draft locally"
          >
            <Save className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{draftNotice ? "Saved!" : "Save Draft"}</span>
          </button>

          <button
            type="button"
            id="btn_generate_exam_paper"
            onClick={handleGenerateExamPaper}
            className="flex-1 py-3 px-3.5 sm:py-3.5 sm:px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">Generate 2-Column PDF & Key</span>
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
                className={`py-2 px-1 text-[11px] sm:text-xs rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTabPDF === 'exam' ? 'bg-indigo-600 text-white shadow-sm font-extrabold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>📄 Question Paper PDF</span>
              </button>
              <button
                onClick={() => setActiveTabPDF("omr")}
                className={`py-2 px-1 text-[11px] sm:text-xs rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTabPDF === 'omr' ? 'bg-indigo-600 text-white shadow-sm font-extrabold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>📝 OMR Answer Sheet</span>
              </button>
            </div>

            {activeTabPDF === "exam" ? (
              <div id="printable-exam-paper" className="bg-white text-slate-900 p-4 sm:p-6 rounded-2xl shadow-inner space-y-4 max-h-[45vh] sm:max-h-[50vh] overflow-y-auto font-sans text-xs">
                <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                  <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight">{schoolProfile?.name || "ST. PETER'S BASIC SCHOOL"}</h2>
                  <p className="text-[10px] text-slate-600 font-medium">{schoolProfile?.address || "P.O. Box 42, Osu, Accra - Ghana"}</p>
                  <div className="text-xs font-bold text-indigo-900 uppercase pt-1">{examTitle} — {subject}</div>
                  <div className="flex justify-between text-[10px] sm:text-[11px] font-semibold text-slate-700 pt-2 px-2 border-t border-slate-200">
                    <span>CLASS: {selectedClass}</span>
                    <span>TIME: {timeAllowed}</span>
                    <span>MARKS: {questions.length}</span>
                  </div>
                </div>

                <div className="bg-slate-100 p-2 rounded text-[10px] sm:text-[11px] italic text-slate-700">
                  <strong>Instructions:</strong> {instructions}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] leading-snug">
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
              <div id="printable-omr-paper" className="bg-white text-slate-900 p-4 sm:p-6 rounded-2xl shadow-inner space-y-4 max-h-[45vh] sm:max-h-[50vh] overflow-y-auto font-sans text-xs">
                <div className="text-center border-b-2 border-slate-900 pb-3">
                  <h2 className="text-xs sm:text-sm font-extrabold uppercase">{schoolProfile?.name || "ST. PETER'S BASIC SCHOOL"}</h2>
                  <div className="text-xs font-bold text-indigo-900">OFFICIAL OMR ANSWER BUBBLE SHEET</div>
                  <p className="text-[10px] text-slate-600">{subject} • {selectedClass} • Total Questions: {questions.length}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {questions.map(q => (
                    <div key={q.id} className="flex items-center justify-between p-1.5 border border-slate-200 rounded font-mono text-[10px] sm:text-[11px]">
                      <span className="font-bold">{q.questionNumber}.</span>
                      <div className="flex gap-1 sm:gap-1.5">
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

      {/* LOAD SAVED DRAFTS MODAL */}
      {isLoadDraftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Save className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Saved Exam Paper Drafts</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Click any saved draft to restore questions & metadata.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoadDraftModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {savedDrafts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No saved exam drafts found on this device.
                </div>
              ) : (
                savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 space-y-2.5 hover:border-indigo-400 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">{draft.examTitle}</h4>
                        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {draft.subject} • {draft.selectedClass}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{draft.savedAt}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {draft.questions?.length || 0} Questions Saved
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          title="Delete Draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLoadSelectedDraft(draft)}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Load Draft
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION BANK IMPORT MODAL */}
      <QuestionBankImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportQuestions={handleImportQuestions}
      />
    </div>
  );
}
