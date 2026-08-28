import React, { useState, useMemo } from "react";
import { 
  X, Search, Filter, BookOpen, Check, Plus, AlertCircle, Sparkles, CheckCircle2 
} from "lucide-react";
import { WAECQuestion, ExamLevelType, ExamQuestion } from "../types";
import { INITIAL_WAEC_QUESTION_BANK, WAEC_DISCLAIMER_TEXT } from "../data/waecQuestionBank";

interface QuestionBankImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (imported: ExamQuestion[]) => void;
  allQuestions?: WAECQuestion[];
}

export const QuestionBankImportModal: React.FC<QuestionBankImportModalProps> = ({
  isOpen,
  onClose,
  onImportQuestions,
  allQuestions = INITIAL_WAEC_QUESTION_BANK
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Available unique filter values
  const subjects = useMemo(() => {
    const set = new Set(allQuestions.map(q => q.subject));
    return Array.from(set);
  }, [allQuestions]);

  const years = useMemo(() => {
    const set = new Set(allQuestions.map(q => q.year.toString()));
    return (Array.from(set) as string[]).sort((a, b) => b.localeCompare(a));
  }, [allQuestions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      if (selectedLevel !== "ALL" && q.exam_type !== selectedLevel) return false;
      if (selectedSubject !== "ALL" && q.subject !== selectedSubject) return false;
      if (selectedYear !== "ALL" && q.year.toString() !== selectedYear) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.question_text.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesOptions = Object.values(q.options).some(opt => opt.toLowerCase().includes(query));
        if (!matchesText && !matchesTopic && !matchesOptions) return false;
      }
      return true;
    });
  }, [allQuestions, selectedLevel, selectedSubject, selectedYear, searchQuery]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedQuestionIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedQuestionIds(next);
  };

  const selectAll = () => {
    const allFilteredIds = filteredQuestions.map(q => q.question_id);
    setSelectedQuestionIds(new Set(allFilteredIds));
  };

  const clearSelection = () => {
    setSelectedQuestionIds(new Set());
  };

  const handleConfirmImport = () => {
    const selectedQuestions = allQuestions.filter(q => selectedQuestionIds.has(q.question_id));
    const formatted: ExamQuestion[] = selectedQuestions.map((q, idx) => ({
      id: `imported_${q.question_id}_${Date.now()}_${idx}`,
      questionNumber: idx + 1,
      questionText: `[${q.exam_type} ${q.year} - ${q.topic}] ${q.question_text}`,
      options: q.options,
      correctOption: q.correct_option,
      marks: 1
    }));

    onImportQuestions(formatted);
    setSelectedQuestionIds(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Import from WAEC / BECE Question Bank
              </h2>
              <p className="text-xs font-bold text-slate-400">
                Browse verified past questions and add them to your exam paper
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-950/30 border-b border-slate-200/60 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {/* Search Input */}
            <div className="sm:col-span-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search topic or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Levels (WASSCE & BECE)</option>
                <option value="WASSCE">WASSCE (Senior High)</option>
                <option value="BECE">BECE (Junior High)</option>
                <option value="NOV_DEC">NOV/DEC</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Core Subjects</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Exam Years</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Selection Toolbar */}
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500">
              Showing <strong className="text-slate-900 dark:text-slate-100">{filteredQuestions.length}</strong> questions
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={selectAll}
                className="text-emerald-600 hover:text-emerald-700 font-extrabold hover:underline"
              >
                Select All Filtered
              </button>
              {selectedQuestionIds.size > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear ({selectedQuestionIds.size})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question List Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No matching questions found.</p>
              <p className="text-xs text-slate-400">Try adjusting your subject, level, or year filters.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isSelected = selectedQuestionIds.has(q.question_id);
              return (
                <div
                  key={q.question_id}
                  onClick={() => toggleSelect(q.question_id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                    isSelected
                      ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/60 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(q.question_id)}
                      className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 shrink-0"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {q.exam_type} {q.year}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          {q.subject}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Topic: {q.topic}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                        {q.question_text}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {Object.entries(q.options).map(([optKey, optVal]) => {
                          const isCorrect = q.correct_option === optKey;
                          return (
                            <div
                              key={optKey}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center justify-between ${
                                isCorrect
                                  ? "bg-emerald-100/70 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <span><strong className="mr-1">{optKey}.</strong> {optVal}</span>
                              {isCorrect && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation note */}
                      <p className="text-[10px] italic text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Legal Disclaimer & Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3">
          <p className="text-[9px] text-slate-400 font-mono text-center">
            {WAEC_DISCLAIMER_TEXT}
          </p>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Selected: <span className="text-emerald-600">{selectedQuestionIds.size}</span> question(s)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={selectedQuestionIds.size === 0}
                className="px-5 py-2 rounded-xl btn-emerald text-xs font-black flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Import Selected ({selectedQuestionIds.size})</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
