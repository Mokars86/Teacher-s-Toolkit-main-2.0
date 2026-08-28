import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, Search, Filter, BookOpen, Plus, Camera, Upload, Award, Share2, 
  Copy, Check, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Gift, Layers, RefreshCw, Zap
} from "lucide-react";
import { WAECQuestion, UserProfile, ExamLevelType } from "../types";
import { INITIAL_WAEC_QUESTION_BANK, WAEC_DISCLAIMER_TEXT } from "../data/waecQuestionBank";

interface QuestionBankModuleProps {
  onBack: () => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onOpenExamBuilder?: () => void;
}

export const QuestionBankModule: React.FC<QuestionBankModuleProps> = ({
  onBack,
  userProfile,
  setUserProfile,
  onOpenExamBuilder
}) => {
  const [questions, setQuestions] = useState<WAECQuestion[]>(INITIAL_WAEC_QUESTION_BANK);
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState<boolean>(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState<boolean>(false);
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);

  // Ingestion Modal State
  const [paperTitle, setPaperTitle] = useState<string>("");
  const [paperLevel, setPaperLevel] = useState<ExamLevelType>("WASSCE");
  const [paperSubject, setPaperSubject] = useState<string>("Integrated Science");
  const [paperYear, setPaperYear] = useState<number>(2023);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [extractedCount, setExtractedCount] = useState<number>(0);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  // Filter values
  const subjects = useMemo(() => Array.from(new Set(questions.map(q => q.subject))), [questions]);
  const years = useMemo(() => (Array.from(new Set(questions.map(q => q.year.toString()))) as string[]).sort((a, b) => b.localeCompare(a)), [questions]);

  // Filtered List
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (selectedLevel !== "ALL" && q.exam_type !== selectedLevel) return false;
      if (selectedSubject !== "ALL" && q.subject !== selectedSubject) return false;
      if (selectedYear !== "ALL" && q.year.toString() !== selectedYear) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.question_text.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        if (!matchesText && !matchesTopic) return false;
      }
      return true;
    });
  }, [questions, selectedLevel, selectedSubject, selectedYear, searchQuery]);

  // Copy referral code helper
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(userProfile.referralCode || "TEACHER-GH-8821");
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  // Mock paper image upload & AI extraction
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI OCR Parsing Simulation (Gemini Vision)
  const handleRunAiExtraction = () => {
    if (!selectedImage) {
      alert("Please select or snap a photo of the exam paper first!");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setExtractedCount(4);
    }, 2000);
  };

  // Commit extracted questions and award 50 Points
  const handleCommitIngestedPaper = () => {
    const newQuestions: WAECQuestion[] = [
      {
        question_id: `INGESTED_${Date.now()}_1`,
        exam_type: paperLevel,
        subject: paperSubject,
        topic: "General Preparation",
        year: paperYear,
        question_text: `[Scanned Paper] Which of the following is the standard unit of electrical resistance?`,
        options: { A: "Ohm (Ω)", B: "Volt (V)", C: "Ampere (A)", D: "Watt (W)" },
        correct_option: "A",
        explanation: "Resistance is measured in Ohms (Ω) using Ohm's law V = IR.",
        submitted_by: userProfile.fullName,
        verified: true
      },
      {
        question_id: `INGESTED_${Date.now()}_2`,
        exam_type: paperLevel,
        subject: paperSubject,
        topic: "General Preparation",
        year: paperYear,
        question_text: `[Scanned Paper] Identify the gas evolved when dilute hydrochloric acid reacts with calcium carbonate.`,
        options: { A: "Oxygen", B: "Hydrogen", C: "Carbon dioxide", D: "Nitrogen" },
        correct_option: "C",
        explanation: "Carbonates react with acids to produce salt, water, and carbon dioxide gas.",
        submitted_by: userProfile.fullName,
        verified: true
      }
    ];

    setQuestions(prev => [...newQuestions, ...prev]);

    // Award +50 Reward Points & Increment Contributed Count
    setUserProfile(prev => ({
      ...prev,
      rewardPoints: (prev.rewardPoints || 0) + 50,
      submittedQuestionsCount: (prev.submittedQuestionsCount || 0) + 1
    }));

    setRewardClaimed(true);
    setTimeout(() => {
      setRewardClaimed(false);
      setIsIngestionModalOpen(false);
      setSelectedImage(null);
      setExtractedCount(0);
    }, 2000);
  };

  // Redeem Subscription Plan with Points
  const handleRedeemPlan = (cost: number, planName: "Teacher Pro" | "School License") => {
    if ((userProfile.rewardPoints || 0) < cost) {
      alert(`You need ${cost} points to redeem this plan. Earn more by uploading papers (+50 pts) or referring colleagues (+100 pts)!`);
      return;
    }

    setUserProfile(prev => ({
      ...prev,
      rewardPoints: prev.rewardPoints - cost,
      activeSubscriptionPlan: planName,
      isPremium: true
    }));

    alert(`🎉 Congratulations! You have successfully redeemed points for a ${planName} subscription!`);
    setIsRedeemModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                WAEC & BECE Question Bank
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Crowdsourced Exam Question Repository
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenExamBuilder && (
            <button
              type="button"
              onClick={onOpenExamBuilder}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to Exam Builder</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsIngestionModalOpen(true)}
            className="px-4 py-2.5 rounded-xl btn-emerald text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition"
          >
            <Camera className="w-4 h-4" />
            <span>Snap & Earn 50 Points</span>
          </button>
        </div>
      </div>

      {/* Rewards & Referral Incentive Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white relative overflow-hidden shadow-xl border border-emerald-900/40">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Points Balance Column */}
          <div className="space-y-2 border-b lg:border-b-0 lg:border-r border-emerald-800/40 pb-4 lg:pb-0 lg:pr-6">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Gift className="w-4 h-4" />
              <span>Teacher Reward Points</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black tracking-tight text-white font-mono">
                {userProfile.rewardPoints || 0}
              </span>
              <span className="text-sm font-extrabold text-emerald-400">PTS</span>
            </div>

            <p className="text-xs text-slate-300">
              Active Plan: <strong className="text-emerald-300 font-black">{userProfile.activeSubscriptionPlan || "Free"}</strong>
            </p>

            <button
              type="button"
              onClick={() => setIsRedeemModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <Award className="w-4 h-4" />
              <span>Redeem Points for Subscription</span>
            </button>
          </div>

          {/* How to Earn Points */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300">
              How to Earn Reward Points
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  +50
                </div>
                <span><strong>Snap & Upload Exam Paper:</strong> Upload verified past questions with answer keys.</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  +100
                </div>
                <span><strong>Refer a Colleague:</strong> Share your unique referral code with fellow teachers.</span>
              </div>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase text-[10px] tracking-widest">Your Referral Code</span>
              <span className="text-[10px] text-emerald-400 font-extrabold">100 Pts / Signup</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950/80 px-3 py-2 rounded-xl font-mono text-xs font-black tracking-wider text-emerald-400 border border-emerald-800/40 text-center select-all">
                {userProfile.referralCode || "TEACHER-GH-8821"}
              </div>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shrink-0 flex items-center gap-1"
              >
                {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReferral ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search topic or question text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Exam Levels (WASSCE & BECE)</option>
              <option value="WASSCE">WASSCE (Senior High)</option>
              <option value="BECE">BECE (Junior High)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Core Subjects</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Exam Years</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1">
          <span>Showing {filteredQuestions.length} verified question(s)</span>
          <span className="text-[10px] text-slate-400 font-mono">Original IP Explanations • WAEC Educational Prep</span>
        </div>
      </div>

      {/* Question Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => (
          <div
            key={q.question_id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {q.exam_type} {q.year}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {q.subject}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Topic: {q.topic}
              </span>
            </div>

            <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-relaxed">
              {q.question_text}
            </p>

            {/* Options grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(q.options).map(([optKey, optVal]) => {
                const isCorrect = q.correct_option === optKey;
                return (
                  <div
                    key={optKey}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-between ${
                      isCorrect
                        ? "bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-extrabold"
                        : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span><strong className="mr-1">{optKey}.</strong> {optVal}</span>
                    {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Step by step explanation */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Step-by-Step Explanation</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                {q.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* WAEC Copyright Disclaimer Banner */}
      <div className="p-4 bg-slate-200/60 dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-800 text-[10px] text-slate-500 font-mono text-center">
        {WAEC_DISCLAIMER_TEXT}
      </div>

      {/* ── MODAL 1: INGESTION SNAP & UPLOAD MODAL (+50 POINTS) ── */}
      {isIngestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Snap Past Exam Paper</h3>
                  <p className="text-[10px] text-emerald-600 font-bold">Earn +50 Teacher Reward Points</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIngestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Exam Level</label>
                  <select
                    id="select_snap_level"
                    value={paperLevel}
                    onChange={(e) => setPaperLevel(e.target.value as ExamLevelType)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                  >
                    <option value="WASSCE">WASSCE</option>
                    <option value="BECE">BECE</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-1">Subject</label>
                  <select
                    id="select_snap_subject"
                    value={paperSubject}
                    onChange={(e) => setPaperSubject(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                  >
                    <option value="Core Mathematics">Core Mathematics</option>
                    <option value="Integrated Science">Integrated Science</option>
                    <option value="English Language">English Language</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="ICT / Computing">ICT / Computing</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-1">Exam Year</label>
                  <select
                    id="select_snap_year"
                    value={paperYear}
                    onChange={(e) => setPaperYear(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-mono"
                  >
                    {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo snap preview */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-center space-y-2">
                {selectedImage ? (
                  <div className="relative">
                    <img src={selectedImage} alt="Paper Snap" className="w-full h-40 object-cover rounded-xl border" />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded-lg"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-emerald-500" />
                    <span className="block font-bold text-slate-700 dark:text-slate-300">Click to Snap Photo or Upload Image</span>
                    <span className="block text-[10px] text-slate-400">Supports PNG, JPG, or paper photos</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* AI OCR Extraction trigger */}
              {selectedImage && extractedCount === 0 && (
                <button
                  type="button"
                  onClick={handleRunAiExtraction}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 rounded-xl btn-primary text-xs font-black flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gemini Vision AI Extracting Questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run Gemini Vision AI OCR Parsing</span>
                    </>
                  )}
                </button>
              )}

              {/* Extracted questions preview */}
              {extractedCount > 0 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Successfully Extracted {extractedCount} Verified Questions!</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Generated original step-by-step explanations and validated correct options.
                  </p>
                </div>
              )}
            </div>

            {/* Commit & Claim Reward */}
            {rewardClaimed ? (
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl text-center font-black text-xs animate-bounce">
                🎉 +50 Reward Points Awarded & Added to your Profile Balance!
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCommitIngestedPaper}
                disabled={extractedCount === 0}
                className="w-full py-2.5 rounded-xl btn-emerald text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Award className="w-4 h-4" />
                <span>Submit to Shared Bank & Claim +50 Points</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* ── MODAL 2: REDEEM POINTS FOR SUBSCRIPTION ── */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Redeem Points</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Current Balance: {userProfile.rewardPoints || 0} PTS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRedeemModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: 1 Month Pro */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">1 Month Teacher Pro Pass</h4>
                  <p className="text-[10px] text-slate-400">Unlock unlimited AI grading & PDF exports</p>
                  <span className="text-xs font-extrabold text-emerald-600 mt-1 block">250 Points</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRedeemPlan(250, "Teacher Pro")}
                  className="px-3 py-1.5 rounded-xl btn-emerald text-xs font-black shadow-sm"
                >
                  Redeem
                </button>
              </div>

              {/* Option 2: 3 Months Pro */}
              <div className="p-3.5 rounded-2xl border border-emerald-300/80 bg-emerald-50/60 dark:bg-emerald-950/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">3 Months Teacher Pro Pass</h4>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500 text-slate-950">Popular</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Full term access for all your classes</p>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">600 Points</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRedeemPlan(600, "Teacher Pro")}
                  className="px-3 py-1.5 rounded-xl btn-emerald text-xs font-black shadow-sm"
                >
                  Redeem
                </button>
              </div>

              {/* Option 3: 1 Year School License */}
              <div className="p-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/60 dark:bg-amber-950/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">1 Year School License Pass</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Headteacher & school-wide management</p>
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">1,500 Points</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRedeemPlan(1500, "School License")}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm"
                >
                  Redeem
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
