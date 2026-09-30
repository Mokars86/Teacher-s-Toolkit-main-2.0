import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Plus, Share2, QrCode, Copy, Check, Trash2, 
  Eye, RefreshCw, Sparkles, CheckCircle2, Clock, Users, 
  BarChart3, FileText, Send, AlertCircle, Play, Download, X, ExternalLink
} from 'lucide-react';
import { CBTExam, CBTSubmission, GradedResult, SchoolProfile } from '../types';
import { getLetterGrade } from '../utils/gradeSlipUtils';

interface CBTHubModuleProps {
  onBack: () => void;
  schoolProfile: SchoolProfile | null;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  onLaunchStudentPortal: (pin?: string) => void;
  onImportSubmissionsToGradedResults: (submissions: CBTSubmission[], exam: CBTExam) => void;
  onOpenExamBuilder?: () => void;
}

export const CBTHubModule: React.FC<CBTHubModuleProps> = ({
  onBack,
  schoolProfile,
  selectedClass,
  setSelectedClass,
  onLaunchStudentPortal,
  onImportSubmissionsToGradedResults,
  onOpenExamBuilder
}) => {
  // --- STATE ---
  const [exams, setExams] = useState<CBTExam[]>(() => {
    try {
      const raw = localStorage.getItem('omr_cbt_exams');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Filter out any previous demo mock data
        const realExams = parsed.filter((e: CBTExam) => e.id !== 'cbt_demo_101');
        return realExams;
      }
    } catch {}
    return [];
  });

  const [submissions, setSubmissions] = useState<CBTSubmission[]>(() => {
    try {
      const raw = localStorage.getItem('omr_cbt_submissions');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.filter((s: CBTSubmission) => s.examId !== 'cbt_demo_101');
      }
    } catch {
      return [];
    }
    return [];
  });

  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    return '';
  });

  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [activeQRExam, setActiveQRExam] = useState<CBTExam | null>(null);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'exams' | 'submissions' | 'diagnostics'>('exams');
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string>('');

  // Persist exams
  useEffect(() => {
    try {
      localStorage.setItem('omr_cbt_exams', JSON.stringify(exams));
    } catch {}
  }, [exams]);

  // Load latest submissions periodically or on focus
  const refreshSubmissions = () => {
    try {
      const raw = localStorage.getItem('omr_cbt_submissions');
      if (raw) setSubmissions(JSON.parse(raw));
    } catch {}
  };

  useEffect(() => {
    refreshSubmissions();
  }, []);

  const activeExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || (exams.length > 0 ? exams[0] : null);
  }, [exams, selectedExamId]);

  const examSubmissions = useMemo(() => {
    if (!activeExam) return [];
    return submissions.filter(s => s.examId === activeExam.id || s.pin === activeExam.pin);
  }, [submissions, activeExam]);

  // Generate 6 digit pin
  const generateUniquePin = () => {
    let pin = '';
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (exams.some(e => e.pin === pin));
    return pin;
  };

  // Toggle active status
  const handleToggleActive = (examId: string) => {
    setExams(prev => prev.map(e => e.id === examId ? { ...e, isActive: !e.isActive } : e));
  };

  // Delete Exam
  const handleDeleteExam = (examId: string) => {
    if (!confirm('Are you sure you want to delete this CBT Exam?')) return;
    setExams(prev => prev.filter(e => e.id !== examId));
  };

  // Copy PIN
  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  // Share Link via Web / WhatsApp
  const getExamShareUrl = (pin: string) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?cbt=${pin}`;
  };

  const handleCopyLink = (exam: CBTExam) => {
    const url = getExamShareUrl(exam.pin);
    navigator.clipboard.writeText(url);
    setCopiedUrl(exam.pin);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleShareWhatsApp = (exam: CBTExam) => {
    const url = getExamShareUrl(exam.pin);
    const message = `📝 *ONLINE EXAM INVITATION*\n\n` +
      `*Subject:* ${exam.subject}\n` +
      `*Exam:* ${exam.title}\n` +
      `*Class:* ${exam.className}\n` +
      `*Duration:* ${exam.durationMinutes} Minutes (${exam.questions.length} Questions)\n\n` +
      `🔑 *Test PIN:* *${exam.pin}*\n\n` +
      `👉 Click here to start: ${url}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Single-Click Sync to Graded Results
  const handleSyncToGradedResults = () => {
    if (!activeExam || examSubmissions.length === 0) {
      alert('No student submissions available to sync for this exam.');
      return;
    }

    onImportSubmissionsToGradedResults(examSubmissions, activeExam);
    
    // Mark as synced
    const updatedSubs = submissions.map(s => {
      if (s.examId === activeExam.id || s.pin === activeExam.pin) {
        return { ...s, isSyncedToGrades: true };
      }
      return s;
    });
    setSubmissions(updatedSubs);
    localStorage.setItem('omr_cbt_submissions', JSON.stringify(updatedSubs));

    setSyncSuccessMessage(`Successfully imported ${examSubmissions.length} submissions to Graded Results & Terminal Reports!`);
    setTimeout(() => setSyncSuccessMessage(''), 4000);
  };

  // Diagnostics Calculation
  const diagnosticsData = useMemo(() => {
    if (!activeExam || examSubmissions.length === 0) return [];

    return activeExam.questions.map(q => {
      let correctCount = 0;
      examSubmissions.forEach(sub => {
        const studentAns = sub.answers[q.questionNumber];
        if (studentAns && studentAns.toUpperCase() === q.correctOption.toUpperCase()) {
          correctCount++;
        }
      });

      const accuracyPct = Math.round((correctCount / examSubmissions.length) * 100);
      return {
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        correctOption: q.correctOption,
        correctCount,
        totalCount: examSubmissions.length,
        accuracyPct
      };
    });
  }, [activeExam, examSubmissions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col pb-32 transition-colors duration-200 animate-fade-in font-sans">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button 
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition active:scale-95 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg shrink-0">🌐</span>
                <h1 className="text-xs sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                  Digital CBT & Online Exam Link
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Zero Bubble Sheets • Instant Digital Grading • 6-Digit PIN Codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenExamBuilder && (
              <button
                type="button"
                onClick={onOpenExamBuilder}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Exam in</span> Builder
              </button>
            )}

            <button
              type="button"
              onClick={() => onLaunchStudentPortal()}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto w-full px-3 sm:px-6 pt-6 space-y-6 flex-1">
        
        {syncSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-md">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}

        {/* HERO BENEFIT CARD */}
        <section className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Paperless Objective Replacement</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Eliminate Camera & Bubble Errors with 100% Digital CBT
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Give students a 6-digit PIN or WhatsApp link to take objective quizzes on any phone, tablet, or computer. Scores are graded instantly and sync with your terminal reports.
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onLaunchStudentPortal(activeExam?.pin)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Test as Student</span>
              </button>
            </div>
          </div>
        </section>

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Active Exams ({exams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Live Submissions ({examSubmissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Item Diagnostics</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: EXAMS LIST & SHARE CODES
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'exams' && (
          <div className="space-y-4">
            {exams.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 mx-auto bg-indigo-50 dark:bg-indigo-950/60 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    No CBT Exams Published Yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Create a real exam paper with your custom questions in Exam Builder and launch it as a Digital CBT test with a 6-digit PIN.
                  </p>
                </div>
                {onOpenExamBuilder && (
                  <button
                    type="button"
                    onClick={onOpenExamBuilder}
                    className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Exam in Exam Builder</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map(exam => {
                const isSelected = exam.id === activeExam?.id;
                const subsCount = submissions.filter(s => s.examId === exam.id || s.pin === exam.pin).length;

                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`bg-white dark:bg-slate-800/90 border rounded-3xl p-5 space-y-4 shadow-md transition cursor-pointer relative ${
                      isSelected 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                        : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-400'
                    }`}
                  >
                    {/* Top title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px]">
                            {exam.className}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{exam.subject}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                          {exam.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exam.isActive ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {exam.isActive ? 'Active' : 'Closed'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExam(exam.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 transition"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 6-Digit PIN Highlight Banner */}
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Student Test PIN</span>
                        <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-indigo-600 dark:text-indigo-400">
                          {exam.pin}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPin(exam.pin);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100 transition"
                      >
                        {copiedPin === exam.pin ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPin === exam.pin ? 'Copied PIN' : 'Copy PIN'}</span>
                      </button>
                    </div>

                    {/* Stats & Duration */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Questions</span>
                        <div className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                          {exam.questions.length} Qs
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Duration</span>
                        <div className="font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                          {exam.durationMinutes} Mins
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Submissions</span>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                          {subsCount}
                        </div>
                      </div>
                    </div>

                    {/* Quick Sharing Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(exam);
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{copiedUrl === exam.pin ? 'Link Copied!' : 'Copy Link'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareWhatsApp(exam);
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveQRExam(exam);
                          setIsQRModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                        title="Display QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: LIVE SUBMISSIONS ROSTER
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'submissions' && activeExam && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 sm:p-5 shadow-sm">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Student Submissions for {activeExam.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-xs">
                    {examSubmissions.length} Completed
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time scores graded instantly without camera scanning.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshSubmissions}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                  title="Refresh Submissions"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSyncToGradedResults}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sync to Terminal Reports</span>
                </button>
              </div>
            </div>

            {examSubmissions.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center text-indigo-500">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No submissions yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Share the 6-Digit PIN <strong className="text-indigo-400">{activeExam.pin}</strong> or WhatsApp link with students to start receiving results.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-700/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      <tr>
                        <th className="p-3.5 pl-5">#</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5">Index No.</th>
                        <th className="p-3.5">Score</th>
                        <th className="p-3.5">Percentage</th>
                        <th className="p-3.5">Grade</th>
                        <th className="p-3.5">Time Spent</th>
                        <th className="p-3.5 pr-5">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {examSubmissions.map((sub, idx) => {
                        const grade = getLetterGrade(sub.percentage);
                        const isPass = sub.percentage >= (activeExam.passPercentage || 50);

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750 transition">
                            <td className="p-3.5 pl-5 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                              {sub.studentName}
                            </td>
                            <td className="p-3.5 font-mono text-slate-500">{sub.studentId}</td>
                            <td className="p-3.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                              {sub.score} / {sub.totalQuestions}
                            </td>
                            <td className="p-3.5 font-bold font-mono">
                              <span className={`px-2 py-0.5 rounded-md ${
                                isPass ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}>
                                {sub.percentage}%
                              </span>
                            </td>
                            <td className="p-3.5 font-black text-indigo-600 dark:text-indigo-400 font-mono">
                              {grade}
                            </td>
                            <td className="p-3.5 font-mono text-slate-500">
                              {Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s
                            </td>
                            <td className="p-3.5 pr-5 text-slate-400 text-[11px] font-mono">
                              {sub.submittedAt}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: ITEM DIAGNOSTICS & ACCURACY ANALYSIS
            ───────────────────────────────────────────────────────────── */}
        {activeTab === 'diagnostics' && activeExam && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Item Diagnostics for {activeExam.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Identify question difficulty and topics where students need further explanation.
              </p>
            </div>

            {diagnosticsData.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center text-xs text-slate-400 font-semibold">
                No submissions available to compute item diagnostics.
              </div>
            ) : (
              <div className="space-y-3">
                {diagnosticsData.map(diag => {
                  const isHard = diag.accuracyPct < 50;

                  return (
                    <div
                      key={diag.questionNumber}
                      className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">
                            Q{diag.questionNumber}.
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 ml-2">
                            {diag.questionText}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                            isHard ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {diag.accuracyPct}% Accuracy
                          </span>
                        </div>
                      </div>

                      {/* Accuracy Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isHard ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${diag.accuracyPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Correct Option: <strong className="text-slate-700 dark:text-slate-300 font-mono">{diag.correctOption}</strong></span>
                        <span>{diag.correctCount} of {diag.totalCount} students correct</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* QR CODE MODAL POPUP */}
      {isQRModalOpen && activeQRExam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative text-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setIsQRModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase">
                Direct Scan
              </span>
              <h3 className="text-base font-black">{activeQRExam.title}</h3>
              <p className="text-xs text-slate-400">{activeQRExam.subject} • {activeQRExam.className}</p>
            </div>

            {/* Generated QR Code Image */}
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 inline-block shadow-inner mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getExamShareUrl(activeQRExam.pin))}`}
                alt="Test QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Test PIN</span>
              <span className="text-2xl font-black font-mono text-indigo-500 tracking-widest">
                {activeQRExam.pin}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Ask students to open their phone camera or visit the link to start the test immediately.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
