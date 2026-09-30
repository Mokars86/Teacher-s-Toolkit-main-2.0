import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, Clock, CheckCircle2, AlertCircle, Bookmark, BookmarkCheck,
  ChevronLeft, ChevronRight, Send, Sparkles, Check, X, Eye, 
  HelpCircle, ShieldCheck, Trophy, RotateCcw, Award, LogOut, ArrowRight
} from 'lucide-react';
import { CBTExam, CBTSubmission, ExamQuestion } from '../types';
import { getLetterGrade } from '../utils/gradeSlipUtils';

interface CBTStudentPortalProps {
  initialPin?: string;
  onBackToApp: () => void;
  onSaveSubmission?: (sub: CBTSubmission) => void;
}

export const CBTStudentPortal: React.FC<CBTStudentPortalProps> = ({
  initialPin = '',
  onBackToApp,
  onSaveSubmission
}) => {
  // --- STATE ---
  const [pinInput, setPinInput] = useState<string>(initialPin);
  const [studentName, setStudentName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [activeExam, setActiveExam] = useState<CBTExam | null>(null);
  const [examStatus, setExamStatus] = useState<'LOGIN' | 'INSTRUCTIONS' | 'TEST_IN_PROGRESS' | 'CONFIRM_SUBMIT' | 'RESULT_SUMMARY'>('LOGIN');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qNum: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [qNum: number]: boolean }>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [completedSubmission, setCompletedSubmission] = useState<CBTSubmission | null>(null);
  const [showQuestionDrawer, setShowQuestionDrawer] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Load all available CBT exams from storage
  const getStoredExams = (): CBTExam[] => {
    try {
      const raw = localStorage.getItem('omr_cbt_exams');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.filter((e: CBTExam) => e.id !== 'cbt_demo_101');
      }
    } catch {}
    return [];
  };

  // Auto-fill pin if passed via URL or props
  useEffect(() => {
    if (initialPin) {
      setPinInput(initialPin);
      attemptLoginWithPin(initialPin);
    } else {
      // Check window search params e.g. ?cbt=123456
      try {
        const params = new URLSearchParams(window.location.search);
        const urlPin = params.get('cbt') || params.get('pin');
        if (urlPin) {
          setPinInput(urlPin);
          attemptLoginWithPin(urlPin);
        }
      } catch {}
    }
  }, [initialPin]);

  const attemptLoginWithPin = (pinToTest: string) => {
    const exams = getStoredExams();
    const found = exams.find(e => e.pin === pinToTest.trim() && e.isActive);
    if (found) {
      setActiveExam(found);
      setSelectedClass(found.className);
      setLoginError('');
      setExamStatus('INSTRUCTIONS');
    } else {
      setLoginError('Invalid or inactive Test PIN. Please verify with your teacher.');
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setLoginError('Please enter a 6-digit Test PIN.');
      return;
    }
    attemptLoginWithPin(pinInput);
  };

  // Start exam
  const handleStartExam = () => {
    if (!studentName.trim()) {
      alert('Please enter your Full Name to proceed.');
      return;
    }
    if (!activeExam) return;

    const totalSeconds = (activeExam.durationMinutes || 15) * 60;
    setSecondsRemaining(totalSeconds);
    setStartTime(Date.now());
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setExamStatus('TEST_IN_PROGRESS');
  };

  // Countdown Timer
  useEffect(() => {
    if (examStatus !== 'TEST_IN_PROGRESS' || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true); // auto submit on time out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStatus, secondsRemaining]);

  // Handle option select
  const handleSelectOption = (qNum: number, opt: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qNum]: opt
    }));
  };

  // Toggle flag
  const handleToggleFlag = (qNum: number) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [qNum]: !prev[qNum]
    }));
  };

  // Submit test and grade
  const handleSubmitExam = (isAutoSubmit = false) => {
    if (!activeExam) return;

    let score = 0;
    const totalQuestions = activeExam.questions.length;

    activeExam.questions.forEach(q => {
      const studentChoice = selectedAnswers[q.questionNumber];
      if (studentChoice && studentChoice.toUpperCase() === q.correctOption.toUpperCase()) {
        score += (q.marks || 1);
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    const submission: CBTSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      examId: activeExam.id,
      pin: activeExam.pin,
      studentName: studentName.trim() || 'Anonymous Student',
      studentId: studentId.trim() || `CBT-${Math.floor(1000 + Math.random() * 9000)}`,
      className: selectedClass || activeExam.className,
      score,
      totalQuestions,
      percentage,
      answers: selectedAnswers,
      timeSpentSeconds: timeSpent,
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isSyncedToGrades: false
    };

    // Store submission in local storage
    try {
      const existingSubsRaw = localStorage.getItem('omr_cbt_submissions');
      const subs: CBTSubmission[] = existingSubsRaw ? JSON.parse(existingSubsRaw) : [];
      subs.unshift(submission);
      localStorage.setItem('omr_cbt_submissions', JSON.stringify(subs));
    } catch {}

    setCompletedSubmission(submission);
    if (onSaveSubmission) {
      onSaveSubmission(submission);
    }
    setExamStatus('RESULT_SUMMARY');

    if (isAutoSubmit) {
      alert('Time expired! Your exam has been automatically submitted and scored.');
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Questions stats
  const questionsList = activeExam?.questions || [];
  const currentQuestion = questionsList[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  // ─────────────────────────────────────────────────────────────
  // RENDER: 1. PIN & STUDENT INFO LOGIN
  // ─────────────────────────────────────────────────────────────
  if (examStatus === 'LOGIN') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white font-sans">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl relative">
          
          <button
            type="button"
            onClick={onBackToApp}
            className="absolute top-5 left-5 p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition"
            title="Return to Toolkit"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Student CBT Portal
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Enter your teacher's 6-Digit Test PIN to start your digital exam.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                6-Digit Test PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 123456"
                className="w-full text-center font-mono tracking-widest text-2xl font-black bg-slate-950 border-2 border-indigo-500/50 focus:border-indigo-400 rounded-2xl py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-[0.99] cursor-pointer"
            >
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-400">
              Zero bubble sheets • 100% Instant Grading Accuracy
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: 2. TEST INSTRUCTIONS & CANDIDATE REGISTRATION
  // ─────────────────────────────────────────────────────────────
  if (examStatus === 'INSTRUCTIONS' && activeExam) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="max-w-lg w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          
          <div className="flex items-start justify-between gap-3 border-b border-slate-700 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-[10px] uppercase tracking-wider">
                PIN: {activeExam.pin}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {activeExam.title}
              </h2>
              <p className="text-xs font-bold text-indigo-400">
                {activeExam.subject} • {activeExam.className}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Allowed</span>
              <span className="text-sm font-black text-amber-400 font-mono flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeExam.durationMinutes} Mins
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Exam Instructions</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeExam.instructions || 'Answer all questions to the best of your ability. Once you submit, your score will be calculated automatically.'}
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] font-bold text-slate-400">
              <span>• Total Questions: <strong className="text-white">{activeExam.questions.length}</strong></span>
              <span>• Pass Mark: <strong className="text-emerald-400">{activeExam.passPercentage || 50}%</strong></span>
            </div>
          </div>

          {/* Candidate Profile Details Input */}
          <div className="space-y-3.5 pt-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Candidate Information
            </h3>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Student Full Name *</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Kwame Mensah"
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Index / Roll No. (Optional)</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 102948"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Class</label>
                <input
                  type="text"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  placeholder="e.g. JHS 3"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setExamStatus('LOGIN')}
              className="px-4 py-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Change PIN
            </button>

            <button
              type="button"
              onClick={handleStartExam}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <span>🚀 Start Exam Now</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: 3. ACTIVE TEST PLAYER SCREEN
  // ─────────────────────────────────────────────────────────────
  if (examStatus === 'TEST_IN_PROGRESS' && activeExam && currentQuestion) {
    const isFlagged = flaggedQuestions[currentQuestion.questionNumber];
    const currentAnswer = selectedAnswers[currentQuestion.questionNumber];

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
        {/* Sticky Top Progress Header */}
        <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            
            {/* Exam info */}
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-white truncate">
                {activeExam.subject} — {activeExam.title}
              </h2>
              <p className="text-[10px] text-slate-400 truncate">
                Candidate: <strong className="text-slate-200">{studentName}</strong> ({selectedClass})
              </p>
            </div>

            {/* Timer & Question Grid Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Timer badge */}
              <div className={`px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-black flex items-center gap-1.5 border shadow-inner ${
                secondsRemaining < 120 
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse' 
                  : secondsRemaining < 300 
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300' 
                  : 'bg-slate-800 border-slate-700 text-emerald-400'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>

              {/* Quick Palette Button */}
              <button
                type="button"
                onClick={() => setShowQuestionDrawer(prev => !prev)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                title="Question Navigation Grid"
              >
                <span className="hidden sm:inline">Questions</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black">
                  {answeredCount}/{questionsList.length}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Test Layout */}
        <div className="max-w-5xl mx-auto w-full flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Question Display Column */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Question Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6 shadow-xl relative">
              
              {/* Top metadata */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-black text-xs font-mono">
                    Question {currentQuestion.questionNumber} of {questionsList.length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    ({currentQuestion.marks || 1} Mark)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFlag(currentQuestion.questionNumber)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isFlagged 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {isFlagged ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isFlagged ? 'Flagged' : 'Flag for Review'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {currentQuestion.questionText}
                </p>

                {currentQuestion.imageUrl && (
                  <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800 max-w-sm">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Question Diagram" 
                      className="w-full max-h-48 object-contain rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Multiple Choice Options (A, B, C, D) */}
              <div className="space-y-2.5 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                  const optText = currentQuestion.options[optKey];
                  const isSelected = currentAnswer === optKey;

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.questionNumber, optKey)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl text-left border transition-all flex items-center gap-3.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10 ring-2 ring-indigo-500/30' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 transition ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {optKey}
                      </span>
                      <span className="text-xs sm:text-sm font-medium flex-1">
                        {optText}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav Controls: Prev / Next / Submit */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-2">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentQuestionIndex < questionsList.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questionsList.length - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setExamStatus('CONFIRM_SUBMIT')}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Review & Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Side Question Navigation Matrix */}
          <div className={`lg:block ${showQuestionDrawer ? 'block' : 'hidden lg:block'} space-y-4`}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 sticky top-20 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Question Palette
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {answeredCount}/{questionsList.length} done
                </span>
              </div>

              {/* Palette Legend */}
              <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                  <span>Skipped</span>
                </div>
              </div>

              {/* Number Buttons Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                {questionsList.map((q, idx) => {
                  const isAns = !!selectedAnswers[q.questionNumber];
                  const isFlag = !!flaggedQuestions[q.questionNumber];
                  const isCur = idx === currentQuestionIndex;

                  let colorStyle = 'bg-slate-800 text-slate-400 border-slate-700';
                  if (isFlag) {
                    colorStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
                  } else if (isAns) {
                    colorStyle = 'bg-emerald-600 text-white border-emerald-500';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setShowQuestionDrawer(false);
                      }}
                      className={`h-9 rounded-xl font-mono text-xs font-black border transition flex items-center justify-center relative cursor-pointer ${colorStyle} ${
                        isCur ? 'ring-2 ring-indigo-400 scale-105' : ''
                      }`}
                    >
                      {q.questionNumber}
                      {isFlag && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setExamStatus('CONFIRM_SUBMIT')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Finish & Submit Exam</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: 4. SUBMISSION CONFIRMATION MODAL
  // ─────────────────────────────────────────────────────────────
  if (examStatus === 'CONFIRM_SUBMIT' && activeExam) {
    const unAnsweredCount = questionsList.length - answeredCount;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white">
              Ready to Submit Your Exam?
            </h2>
            <p className="text-xs text-slate-400">
              Review your submission summary before finalizing. Once submitted, answers cannot be modified.
            </p>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Questions:</span>
              <span className="font-bold text-white font-mono">{questionsList.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold">Answered:</span>
              <span className="font-bold text-emerald-400 font-mono">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-400 font-semibold">Unanswered (Blank):</span>
              <span className="font-bold text-rose-400 font-mono">{unAnsweredCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-semibold">Flagged for Review:</span>
              <span className="font-bold text-amber-400 font-mono">{flaggedCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">Time Remaining:</span>
              <span className="font-bold text-amber-300 font-mono">{formatTime(secondsRemaining)}</span>
            </div>
          </div>

          {unAnsweredCount > 0 && (
            <p className="text-[11px] text-rose-400 text-center font-semibold">
              ⚠️ Warning: You have {unAnsweredCount} unanswered questions.
            </p>
          )}

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleSubmitExam(false)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Yes, Finalize & Grade Test</span>
            </button>

            <button
              type="button"
              onClick={() => setExamStatus('TEST_IN_PROGRESS')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition cursor-pointer"
            >
              Return to Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: 5. FINAL RESULT SUMMARY & DIAGNOSTICS
  // ─────────────────────────────────────────────────────────────
  if (examStatus === 'RESULT_SUMMARY' && completedSubmission && activeExam) {
    const isPassed = completedSubmission.percentage >= (activeExam.passPercentage || 50);
    const letterGrade = getLetterGrade(completedSubmission.percentage);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          
          {/* Header & Trophy */}
          <div className="text-center space-y-3">
            <div className={`inline-flex p-4 rounded-3xl ${isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
              {isPassed ? <Trophy className="w-10 h-10" /> : <Award className="w-10 h-10" />}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isPassed ? 'Exam Completed Successfully!' : 'Exam Submitted'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {activeExam.title} • {activeExam.subject}
              </p>
            </div>
          </div>

          {/* Score Highlight Box */}
          <div className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Score</span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                {completedSubmission.score} <span className="text-xs text-slate-500">/ {completedSubmission.totalQuestions}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Percentage</span>
              <div className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {completedSubmission.percentage}%
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Grade</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono mt-0.5">
                {letterGrade}
              </div>
            </div>
          </div>

          {/* Candidate Receipt Details */}
          <div className="bg-slate-950/40 rounded-2xl border border-slate-800/80 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Candidate Name:</span>
              <strong className="text-white">{completedSubmission.studentName}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Candidate ID / Roll No:</span>
              <strong className="text-white font-mono">{completedSubmission.studentId}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Class / Roster:</span>
              <strong className="text-white">{completedSubmission.className}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Time Spent:</span>
              <strong className="text-white font-mono">{Math.floor(completedSubmission.timeSpentSeconds / 60)}m {completedSubmission.timeSpentSeconds % 60}s</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Submitted At:</span>
              <strong className="text-white">{completedSubmission.submittedAt}</strong>
            </div>
          </div>

          {/* Itemized Question Review (if enabled by teacher) */}
          {activeExam.showInstantScore && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Itemized Answer Review</span>
                <span className="text-[10px] font-mono text-slate-500">Green = Correct</span>
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeExam.questions.map((q) => {
                  const studentAns = completedSubmission.answers[q.questionNumber];
                  const isCorrect = studentAns && studentAns.toUpperCase() === q.correctOption.toUpperCase();

                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                        isCorrect 
                          ? 'bg-emerald-950/30 border-emerald-800/60' 
                          : 'bg-rose-950/30 border-rose-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-200">
                          {q.questionNumber}. {q.questionText}
                        </span>
                        {isCorrect ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black shrink-0">
                            +1 Mark
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-black shrink-0">
                            0 Marks
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="text-slate-400">
                          Your choice: <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{studentAns || 'Blank'}</strong>
                        </span>
                        {!isCorrect && (
                          <span className="text-slate-400">
                            Correct choice: <strong className="text-emerald-400">{q.correctOption}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setExamStatus('LOGIN');
                setPinInput('');
                setActiveExam(null);
              }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Test</span>
            </button>

            <button
              type="button"
              onClick={onBackToApp}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Done & Exit</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return null;
};
