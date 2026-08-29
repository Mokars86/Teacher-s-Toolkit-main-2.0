import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  ArrowLeft, Search, Filter, BookOpen, Plus, Camera, Upload, Award, Share2, 
  Copy, Check, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Gift, Layers, RefreshCw, Zap, AlertTriangle, FileText, Trash2, Video, Eye, X
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
  const [ingestionMode, setIngestionMode] = useState<"snap" | "manual">("snap");
  const [paperTitle, setPaperTitle] = useState<string>("");
  const [paperLevel, setPaperLevel] = useState<ExamLevelType>("WASSCE");
  const [paperSubject, setPaperSubject] = useState<string>("Integrated Science");
  const [paperYear, setPaperYear] = useState<number>(2023);
  
  // Multi-Page Image Upload State (Supports 5+ pages)
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Live Camera Viewfinder Modal State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [cameraStreamError, setCameraStreamError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Answer Key setup state
  const [questionsCount, setQuestionsCount] = useState<number>(20);
  const [answerKeysMap, setAnswerKeysMap] = useState<{ [key: number]: "A" | "B" | "C" | "D" }>(() => {
    const keys: { [key: number]: "A" | "B" | "C" | "D" } = {};
    const defaultPattern: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
    for (let i = 1; i <= 20; i++) {
      keys[i] = defaultPattern[(i - 1) % 4];
    }
    return keys;
  });

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [extractedCount, setExtractedCount] = useState<number>(0);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  // Manual Question Entry State
  const [manualQuestionText, setManualQuestionText] = useState<string>("");
  const [manualOptionA, setManualOptionA] = useState<string>("");
  const [manualOptionB, setManualOptionB] = useState<string>("");
  const [manualOptionC, setManualOptionC] = useState<string>("");
  const [manualOptionD, setManualOptionD] = useState<string>("");
  const [manualCorrectOption, setManualCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [manualTopic, setManualTopic] = useState<string>("General Preparation");
  const [manualExplanation, setManualExplanation] = useState<string>("");

  // Duplicate Submission Check: Check if questions for this exact year, subject & exam level already exist
  const isDuplicateSubmission = useMemo(() => {
    return questions.some(q => {
      const yearSubjectMatch = q.year === paperYear && 
        q.subject.toLowerCase() === paperSubject.toLowerCase() && 
        q.exam_type === paperLevel;
      
      const textMatch = manualQuestionText.trim().length > 5 && 
        q.year === paperYear && 
        q.question_text.toLowerCase().includes(manualQuestionText.trim().toLowerCase());

      return yearSubjectMatch || textMatch;
    });
  }, [questions, paperYear, paperSubject, paperLevel, manualQuestionText]);

  // Adjust answerKeysMap when questionsCount changes
  const handleQuestionsCountChange = (count: number) => {
    setQuestionsCount(count);
    setAnswerKeysMap(prev => {
      const next = { ...prev };
      const defaultPattern: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
      for (let i = 1; i <= count; i++) {
        if (!next[i]) {
          next[i] = defaultPattern[(i - 1) % 4];
        }
      }
      return next;
    });
  };

  const handleSetAnswerKey = (qNum: number, option: "A" | "B" | "C" | "D") => {
    setAnswerKeysMap(prev => ({
      ...prev,
      [qNum]: option
    }));
  };

  const handleBulkFillKeys = (option: "A" | "B" | "C" | "D") => {
    const next: { [key: number]: "A" | "B" | "C" | "D" } = {};
    for (let i = 1; i <= questionsCount; i++) {
      next[i] = option;
    }
    setAnswerKeysMap(next);
  };

  // Multi-file upload handler
  const handleMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList: File[] = Array.from(files);
      const readPromises = fileList.map((file: File) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then(newImages => {
        setSelectedImages(prev => [...prev, ...newImages]);
      });
    }
  };

  // Camera file capture handler (native mobile camera)
  const handleCameraCaptureInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete a single page from multi-page list
  const handleRemovePage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Start live webcam stream
  const startLiveCamera = async () => {
    setCameraStreamError("");
    setIsLiveCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Live camera access failed:", err);
      setCameraStreamError(err.message || "Camera access blocked. Use file selector or photo snap below.");
      // Fallback to native camera input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsLiveCameraOpen(false);
  };

  // Snap current live camera video frame to data URL
  const handleSnapLiveCamera = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setSelectedImages(prev => [...prev, dataUrl]);
      }
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

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

  // Run AI OCR Parsing Simulation (Gemini Vision)
  const handleRunAiExtraction = () => {
    if (isDuplicateSubmission) {
      alert(`⚠️ Questions for ${paperSubject} (${paperLevel} ${paperYear}) have already been done by someone else! Duplicate submissions are not allowed.`);
      return;
    }
    if (selectedImages.length === 0) {
      alert("Please upload or snap at least one page of the exam paper first!");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const totalExtracted = Math.max(questionsCount, selectedImages.length * 4);
      setExtractedCount(totalExtracted);
    }, 2000);
  };

  // Commit extracted/submitted questions and award 30 Points
  const handleCommitIngestedPaper = () => {
    if (isDuplicateSubmission) {
      alert(`⚠️ Questions for ${paperSubject} (${paperLevel} ${paperYear}) have already been submitted to the WAEC question bank by someone else!`);
      return;
    }

    let newQuestions: WAECQuestion[] = [];

    if (ingestionMode === "manual" && manualQuestionText.trim()) {
      newQuestions = [
        {
          question_id: `MANUAL_${Date.now()}`,
          exam_type: paperLevel,
          subject: paperSubject,
          topic: manualTopic.trim() || "General Preparation",
          year: paperYear,
          question_text: manualQuestionText.trim(),
          options: {
            A: manualOptionA.trim() || "Option A",
            B: manualOptionB.trim() || "Option B",
            C: manualOptionC.trim() || "Option C",
            D: manualOptionD.trim() || "Option D",
          },
          correct_option: manualCorrectOption,
          explanation: manualExplanation.trim() || `Correct option is ${manualCorrectOption}.`,
          submitted_by: userProfile.fullName,
          verified: true
        }
      ];
    } else {
      // Build questions from defined answerKeysMap across all uploaded pages
      const totalQs = questionsCount || 20;
      for (let i = 1; i <= totalQs; i++) {
        const correctOpt = answerKeysMap[i] || "A";
        newQuestions.push({
          question_id: `INGESTED_${Date.now()}_Q${i}`,
          exam_type: paperLevel,
          subject: paperSubject,
          topic: `Section ${Math.ceil(i / 10)} - Preparation`,
          year: paperYear,
          question_text: `[Scanned Paper - Page ${Math.ceil(i / 5)}] Question ${i}: Core objective evaluation item for ${paperSubject} (${paperYear})`,
          options: {
            A: "Option A",
            B: "Option B",
            C: "Option C",
            D: "Option D"
          },
          correct_option: correctOpt,
          explanation: `Question ${i} correct answer key is (${correctOpt}) for ${paperSubject} ${paperYear}.`,
          submitted_by: userProfile.fullName,
          verified: true
        });
      }
    }

    setQuestions(prev => [...newQuestions, ...prev]);

    // Award +30 Reward Points & Increment Contributed Count
    setUserProfile(prev => ({
      ...prev,
      rewardPoints: (prev.rewardPoints || 0) + 30,
      submittedQuestionsCount: (prev.submittedQuestionsCount || 0) + 1
    }));

    setRewardClaimed(true);
    setTimeout(() => {
      setRewardClaimed(false);
      setIsIngestionModalOpen(false);
      setSelectedImages([]);
      setExtractedCount(0);
      setManualQuestionText("");
      setManualOptionA("");
      setManualOptionB("");
      setManualOptionC("");
      setManualOptionD("");
      setManualExplanation("");
    }, 2000);
  };

  // Redeem Subscription Plan with Points
  const handleRedeemPlan = (cost: number, planName: "Teacher Pro" | "School License") => {
    if ((userProfile.rewardPoints || 0) < cost) {
      alert(`You need ${cost} points to redeem this plan. Earn more by submitting questions (+30 pts) or referring colleagues (+20 pts)!`);
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
            className="px-4 py-2.5 rounded-xl btn-emerald text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Submit Question & Earn 30 Pts</span>
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
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
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
                  +30
                </div>
                <span><strong>Submit Questions with Answer Keys:</strong> Contribute verified year questions to the WAEC bank.</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  +20
                </div>
                <span><strong>Refer a Colleague:</strong> Share your referral code (Colleague gets 10 Pts on signup).</span>
              </div>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase text-[10px] tracking-widest">Your Referral Code</span>
              <span className="text-[10px] text-emerald-400 font-extrabold">20 Pts / Signup</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950/80 px-3 py-2 rounded-xl font-mono text-xs font-black tracking-wider text-emerald-400 border border-emerald-800/40 text-center select-all">
                {userProfile.referralCode || "TEACHER-GH-8821"}
              </div>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shrink-0 flex items-center gap-1 cursor-pointer"
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

      {/* ── MODAL 1: INGESTION / SUBMISSION MODAL (+30 POINTS) ── */}
      {isIngestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Submit WAEC Question & Answer Keys</h3>
                  <p className="text-[10px] text-emerald-600 font-bold">Earn +30 Teacher Reward Points</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIngestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIngestionMode("snap")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  ingestionMode === "snap"
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap / Upload Exam Paper</span>
              </button>
              <button
                type="button"
                onClick={() => setIngestionMode("manual")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  ingestionMode === "manual"
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Type Full Question & Keys</span>
              </button>
            </div>

            {/* Inputs Header */}
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

              {/* DUPLICATE SUBMISSION WARNING BANNER */}
              {isDuplicateSubmission && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-400 text-amber-950 dark:text-amber-200 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 font-black text-amber-900 dark:text-amber-300 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Already Done By Someone Else!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">
                    Questions for <strong>{paperSubject} ({paperLevel} {paperYear})</strong> have already been submitted to the WAEC question bank by someone else. Duplicate submissions for the same year and subject are disabled.
                  </p>
                </div>
              )}

              {/* MODE 1: SNAP / UPLOAD MULTI-PAGE EXAM PAPER */}
              {ingestionMode === "snap" && (
                <>
                  {/* Hidden Native Upload & Camera Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultiImageUpload}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCaptureInput}
                    className="hidden"
                  />

                  {/* Multi-Page Upload & Snap Action Box */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-4 text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={startLiveCamera}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer w-full sm:w-auto"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Page with Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer w-full sm:w-auto"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Multiple Pages (5+ Pages)</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium">
                      Select or snap all pages of the objective paper (supports 5+ pages, PNG, JPG, or paper photos)
                    </p>
                  </div>

                  {/* Multi-Page Thumbnail Gallery */}
                  {selectedImages.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Uploaded Pages ({selectedImages.length} Page{selectedImages.length > 1 ? "s" : ""})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedImages([])}
                          className="text-[10px] text-rose-500 hover:underline"
                        >
                          Clear All Pages
                        </button>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                        {selectedImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black aspect-video">
                            <img src={imgUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute top-1 left-1 bg-slate-900/80 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow">
                              Page {idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePage(idx)}
                              className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-full hover:bg-rose-700 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:border-slate-400 transition text-[10px] font-bold h-full min-h-[70px]"
                        >
                          <Plus className="w-5 h-5 mb-1" />
                          <span>Add Page</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI OCR Extraction Trigger */}
                  {selectedImages.length > 0 && extractedCount === 0 && (
                    <button
                      type="button"
                      onClick={handleRunAiExtraction}
                      disabled={isAnalyzing || isDuplicateSubmission}
                      className="w-full py-2.5 rounded-xl btn-primary text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Gemini Vision AI Extracting Questions & Answer Keys...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Run Gemini Vision AI OCR on All {selectedImages.length} Page(s)</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* AI OCR Success Feedback */}
                  {extractedCount > 0 && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-300 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Successfully Extracted {extractedCount} Questions across {selectedImages.length} Page(s)!</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Generated original step-by-step explanations and populated the Answer Keys grid below.
                      </p>
                    </div>
                  )}

                  {/* ── ANSWER KEYS EDITOR SECTION ── */}
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Attach Answer Keys for Paper Questions</span>
                        </h4>
                        <p className="text-[10px] text-slate-500">Tap options below to set correct keys for each question</p>
                      </div>

                      {/* Question Count Selector */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400">Total Qs:</span>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                          {[10, 20, 30, 40, 50].map(cnt => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => handleQuestionsCountChange(cnt)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition ${
                                questionsCount === cnt
                                  ? "bg-emerald-600 text-white"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                              }`}
                            >
                              {cnt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bulk Key Presets */}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <span>Quick Fill:</span>
                      <button
                        type="button"
                        onClick={() => handleBulkFillKeys("A")}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition"
                      >
                        All A
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkFillKeys("B")}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition"
                      >
                        All B
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next: { [key: number]: "A" | "B" | "C" | "D" } = {};
                          const opts: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
                          for (let i = 1; i <= questionsCount; i++) {
                            next[i] = opts[(i - 1) % 4];
                          }
                          setAnswerKeysMap(next);
                        }}
                        className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg transition"
                      >
                        Pattern A-B-C-D
                      </button>
                    </div>

                    {/* Interactive Answer Key Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                      {Array.from({ length: questionsCount }, (_, i) => i + 1).map((qNum) => {
                        const activeKey = answerKeysMap[qNum] || "A";
                        return (
                          <div
                            key={qNum}
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                          >
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 w-12">
                              Q{qNum}.
                            </span>

                            <div className="flex items-center gap-1">
                              {(["A", "B", "C", "D"] as const).map((opt) => {
                                const isSelected = activeKey === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleSetAnswerKey(qNum, opt)}
                                    className={`w-7 h-7 rounded-lg text-xs font-black transition flex items-center justify-center cursor-pointer ${
                                      isSelected
                                        ? "bg-emerald-600 text-white shadow-xs scale-105"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
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
                </>
              )}

              {/* MODE 2: MANUAL QUESTION ENTRY */}
              {ingestionMode === "manual" && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Quadratic Equations or Cell Division"
                      value={manualTopic}
                      onChange={(e) => setManualTopic(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Question Text *</label>
                    <textarea
                      rows={3}
                      placeholder="Type the full exam question text here..."
                      value={manualQuestionText}
                      onChange={(e) => setManualQuestionText(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 text-[11px] block mb-0.5">Option A</label>
                      <input
                        type="text"
                        placeholder="Option A text"
                        value={manualOptionA}
                        onChange={(e) => setManualOptionA(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 text-[11px] block mb-0.5">Option B</label>
                      <input
                        type="text"
                        placeholder="Option B text"
                        value={manualOptionB}
                        onChange={(e) => setManualOptionB(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 text-[11px] block mb-0.5">Option C</label>
                      <input
                        type="text"
                        placeholder="Option C text"
                        value={manualOptionC}
                        onChange={(e) => setManualOptionC(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 text-[11px] block mb-0.5">Option D</label>
                      <input
                        type="text"
                        placeholder="Option D text"
                        value={manualOptionD}
                        onChange={(e) => setManualOptionD(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Correct Answer Key *</label>
                      <select
                        value={manualCorrectOption}
                        onChange={(e) => setManualCorrectOption(e.target.value as "A" | "B" | "C" | "D")}
                        className="w-full p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 rounded-xl font-black text-emerald-900 dark:text-emerald-200"
                      >
                        <option value="A">Option A (Correct)</option>
                        <option value="B">Option B (Correct)</option>
                        <option value="C">Option C (Correct)</option>
                        <option value="D">Option D (Correct)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Step-by-Step Explanation</label>
                      <input
                        type="text"
                        placeholder="Explain why this option is correct..."
                        value={manualExplanation}
                        onChange={(e) => setManualExplanation(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Commit & Claim Reward */}
            {rewardClaimed ? (
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl text-center font-black text-xs animate-bounce">
                🎉 +30 Reward Points Awarded & Added to your Profile Balance!
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCommitIngestedPaper}
                disabled={
                  isDuplicateSubmission || 
                  (ingestionMode === "snap" && selectedImages.length === 0) ||
                  (ingestionMode === "manual" && !manualQuestionText.trim())
                }
                className="w-full py-2.5 rounded-xl btn-emerald text-xs font-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Submit to WAEC Question Bank & Claim +30 Points</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* ── MODAL 1.5: LIVE CAMERA VIEWFINDER MODAL ── */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white p-4 animate-fade-in">
          <div className="flex items-center justify-between p-2 shrink-0">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="font-black text-sm">Live Paper Viewfinder</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 text-xs font-mono font-bold border border-emerald-700">
                {selectedImages.length} Page(s) Snapped
              </span>
            </div>
            <button
              type="button"
              onClick={stopLiveCamera}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Video Stream Container */}
          <div className="flex-1 relative bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

            {/* Viewfinder Target Framing Overlay */}
            <div className="absolute inset-8 sm:inset-16 border-2 border-emerald-400/60 rounded-3xl pointer-events-none flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400" />
                <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400" />
              </div>
              <div className="text-center font-bold text-xs bg-black/60 px-3 py-1 rounded-full text-emerald-300 self-center backdrop-blur-sm">
                Align Objective Question Page inside Frame
              </div>
              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400" />
                <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400" />
              </div>
            </div>

            {cameraStreamError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400" />
                <p className="text-sm font-bold text-slate-200">{cameraStreamError}</p>
              </div>
            )}
          </div>

          {/* Shutter Bar Controls */}
          <div className="pt-4 flex items-center justify-around shrink-0">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Native Camera</span>
            </button>

            {/* Shutter Button */}
            <button
              type="button"
              onClick={handleSnapLiveCamera}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg transition active:scale-90 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full border-2 border-slate-950 flex items-center justify-center bg-white/20">
                <Camera className="w-6 h-6" />
              </div>
            </button>

            <button
              type="button"
              onClick={stopLiveCamera}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition cursor-pointer"
            >
              Done ({selectedImages.length} Pages)
            </button>
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
