import React, { useState, useEffect } from 'react';
// @ts-ignore
import appLogo from './assets/images/app_logo.png';
// @ts-ignore
import mokarsLogo from './assets/images/mokars_logo.png';
import { 
  Camera, Upload, Plus, Search, Filter, Settings, User, Folder, Calendar, 
  ArrowLeft, ArrowRight, Lock, Mail, FileText, Sparkles, Share2, History, 
  Cloud, CloudOff, CheckCircle, CheckCircle2, Trash2, Edit3, AlertTriangle, 
  LogOut, Sliders, Eye, RefreshCw, AlertCircle, Bookmark, Check, ShieldCheck, ChevronRight, Award, Users,
  TrendingUp, BookOpen, Bell, Building2, QrCode, ChevronDown, ShieldAlert, DollarSign, Package, Wallet, Layers, Ticket,
  MessageCircle, Gift
} from 'lucide-react';

import { 
  UserProfile, ClassSettings, AnswerKey, GradedResult, ScreenId, QuestionConfidence,
  SchoolMode, UserRole, SchoolProfile
} from './types';
import { 
  ScanIllustration, GradeIllustration, OfflineIllustration, ShrugIllustration, TeacherAvatar 
} from './components/TeacherIllustrations';
import { CameraViewfinder } from './components/CameraViewfinder';
import { AnswerKeyEditorPanel } from './components/AnswerKeyEditorPanel';
import { ReviewFlagsPanel } from './components/ReviewFlagsPanel';
import { TerminalReportModule } from './components/TerminalReportModule';
import { AttendanceModule } from './components/AttendanceModule';
import { StudentTrendTracker } from './components/StudentTrendTracker';
import { LessonPlanner } from './components/LessonPlanner';
import { SeatingChartModule } from './components/SeatingChartModule';
import { HeadteacherPanel } from './components/HeadteacherPanel';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { WorkshopCertificateModule } from './components/WorkshopCertificateModule';
import { SchoolConnectModal } from './components/SchoolConnectModal';
import { SchoolCollectionsHub } from './components/SchoolCollectionsHub';
import { ResourceTrackerModule } from './components/ResourceTrackerModule';
import { ExamBuilderModule } from './components/ExamBuilderModule';
import { QuestionBankModule } from './components/QuestionBankModule';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PaywallModal } from './components/PaywallModal';
import { ReferralHubModal } from './components/ReferralHubModal';
import { 
  canScanOMR, hasProAccess, hasSchoolLicense, 
  LicenseVoucher, PRESET_WORKSHOP_VOUCHERS, validateAndRedeemVoucher 
} from './services/subscriptionService';

export default function App() {
  // --- STATE PERSISTENCE & INITIAL SEEDING ---
  const [activeScreen, setActiveScreen] = useState<ScreenId>(ScreenId.SPLASH);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [splashStatusText, setSplashStatusText] = useState<string>("Initializing offline engine...");

  // Mode & Role Management State
  const [activeSchoolMode, setActiveSchoolMode] = useState<SchoolMode>("linked");
  const [userRole, setUserRole] = useState<UserRole>("teacher");
  const [selectedAssignedClass, setSelectedAssignedClass] = useState<string>("JHS 2 Gold");
  
  const [linkedSchool, setLinkedSchool] = useState<SchoolProfile | null>({
    id: "SCH_001",
    name: "St. Peter's Basic School",
    code: "SCH-GH-8821",
    region: "Greater Accra Region",
    address: "P.O. Box 42, Osu, Accra - Ghana",
    motto: "Excellence and Integrity",
    headteacherName: "Rev. Dr. Emmanuel Mensah",
    academicTerm: "Term 2 - 2025/2026",
    totalStudents: 480,
    totalTeachers: 18,
  });

  const [customBranding, setCustomBranding] = useState({
    schoolName: "St. Peter's Basic School",
    address: "P.O. Box 42, Osu, Accra",
    motto: "Excellence & Integrity",
    logoUrl: "",
  });

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  const [notifications, setNotifications] = useState([
    {
      id: "notif_1",
      title: "Headteacher Review Feedback",
      message: "Rev. Dr. Mensah approved Terminal Reports for Primary 5 Emerald.",
      time: "10 mins ago",
      read: false,
      type: "approval"
    },
    {
      id: "notif_2",
      title: "School Sync Queue",
      message: "3 offline scanned sheets ready for automatic headteacher sync.",
      time: "1 hour ago",
      read: false,
      type: "sync"
    }
  ]);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState<boolean>(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);
  const [paywallInfo, setPaywallInfo] = useState<{ title?: string; description?: string; featureTriggered?: string }>({});

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const cached = localStorage.getItem('omr_user_profile');
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        scansThisMonth: parsed.scansThisMonth ?? 18,
        maxFreeScansPerMonth: parsed.maxFreeScansPerMonth ?? 50,
        smsCredits: parsed.smsCredits ?? 120,
      };
    }
    return {
      email: 'teacher@school.edu.gh',
      fullName: 'Teacher Kwesi Mensah',
      isLoggedIn: true,
      isPremium: false,
      syncEnabled: true,
      offlineCount: 3,
      rewardPoints: 150,
      referralCode: 'TEACHER-GH-8921',
      referralCount: 2,
      submittedQuestionsCount: 1,
      activeSubscriptionPlan: 'Free',
      scansThisMonth: 18,
      maxFreeScansPerMonth: 50,
      smsCredits: 120,
      endOfTermPassExpiry: null,
      schoolLicenseExpiry: null,
    };
  });

  const handleTriggerPaywall = (featureTriggered: string, description: string, title?: string) => {
    setPaywallInfo({
      title: title || "Upgrade to Access Feature",
      description,
      featureTriggered,
    });
    setIsPaywallModalOpen(true);
  };

  const [vouchersList, setVouchersList] = useState<LicenseVoucher[]>(PRESET_WORKSHOP_VOUCHERS);
  const [authVoucherInput, setAuthVoucherInput] = useState<string>('');
  const [authVoucherFeedback, setAuthVoucherFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleRedeemVoucherOnAuth = () => {
    if (!authVoucherInput.trim()) {
      setAuthVoucherFeedback({ success: false, message: 'Please enter a valid voucher code.' });
      return;
    }
    const result = validateAndRedeemVoucher(authVoucherInput, userProfile, vouchersList);
    if (result.success && result.updatedProfile) {
      setUserProfile((prev) => ({ ...prev, ...result.updatedProfile, isLoggedIn: true }));
      if (result.voucher) {
        setVouchersList((prev) => prev.map((v) => (v.code.toUpperCase() === result.voucher?.code.toUpperCase() ? result.voucher : v)));
      }
      setAuthVoucherFeedback({ success: true, message: result.message });
      setAuthVoucherInput('');
    } else {
      setAuthVoucherFeedback({ success: false, message: result.message });
    }
  };

  const handleLogoutHeadteacher = () => {
    setUserRole("teacher");
    setActiveSchoolMode("personal");
    setUserProfile((prev) => ({ ...prev, isLoggedIn: false }));
    setActiveScreen(ScreenId.AUTH);
  };

  // 3. USER AUTHENTICATION (LOGIN/SIGNUP)
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPass, setAuthPass] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [selectedAuthRole, setSelectedAuthRole] = useState<UserRole>('teacher');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [authReferralCode, setAuthReferralCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) return ref.trim().toUpperCase();
      const hashMatch = window.location.hash.match(/ref=([A-Za-z0-9_-]+)/);
      if (hashMatch) return hashMatch[1].toUpperCase();
    }
    return '';
  });

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail || !authPass || (isRegistering && !authName)) {
      setAuthError('All form credentials are required.');
      return;
    }

    const assignedRole = selectedAuthRole;
    setUserRole(assignedRole);

    let earnedBonusPoints = 0;
    if (isRegistering && authReferralCode.trim()) {
      earnedBonusPoints = 50; // New user bonus for registering via referral link
    }

    const generatedRefCode = 'TEACHER-GH-' + Math.floor(1000 + Math.random() * 9000);

    setUserProfile((prev) => ({
      ...prev,
      email: authEmail,
      fullName: isRegistering ? authName : (authEmail.split('@')[0] || (assignedRole === 'headteacher' ? 'Headteacher User' : 'Teacher User')),
      isLoggedIn: true,
      isPremium: true,
      rewardPoints: (prev.rewardPoints || 150) + earnedBonusPoints,
      referralCode: prev.referralCode || generatedRefCode,
      syncEnabled: true,
      offlineCount: 0
    }));

    if (earnedBonusPoints > 0) {
      alert(`🎉 Welcome! Referral link applied. You received ${earnedBonusPoints} bonus Reward Points!`);
    }
    
    // Automatically trigger synced status on results when logging in
    setResultsList(prev => prev.map(r => ({ ...r, status: 'Synced' })));

    if (assignedRole === 'headteacher') {
      setActiveScreen(ScreenId.HEADTEACHER_PANEL);
    } else {
      setActiveScreen(ScreenId.DASHBOARD);
    }
  };

  const [classSettings, setClassSettings] = useState<ClassSettings>(() => {
    const cached = localStorage.getItem('omr_class_settings');
    if (cached) return JSON.parse(cached);
    return {
      testName: 'Mathematics Term Quiz',
      className: 'Grade 10-A',
      totalQuestions: 20,
      gradingScale: { A: 90, B: 80, C: 70, D: 60 }
    };
  });

  const [savedKeys, setSavedKeys] = useState<AnswerKey[]>(() => {
    const cached = localStorage.getItem('omr_saved_keys');
    if (cached) return JSON.parse(cached);
    // Seed default keys
    return [
      {
        id: 'key_math_final',
        title: 'Grade 10 - Math Final',
        className: 'Grade 10-A',
        questionsCount: 20,
        answers: {
          1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D',
          9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
          16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D'
        },
        createdAt: 'Jul 15, 2026'
      },
      {
        id: 'key_history_quiz',
        title: 'History Quiz 2',
        className: 'History Quiz 2',
        questionsCount: 15,
        answers: {
          1: 'B', 2: 'C', 3: 'A', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D',
          9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C'
        },
        createdAt: 'Jul 10, 2026'
      }
    ];
  });

  const [resultsList, setResultsList] = useState<GradedResult[]>(() => {
    const cached = localStorage.getItem('omr_graded_results');
    if (cached) return JSON.parse(cached);
    // Seed default historical results
    return [
      {
        id: 'res_1',
        candidateName: 'Candidate A (John Doe)',
        candidateId: 'STUD_023',
        testName: 'Grade 10 - Math Final',
        className: 'Grade 10-A',
        score: 20,
        totalQuestions: 20,
        percentage: 100,
        scannedAt: '2026-07-16 14:23',
        answers: {
          1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D',
          9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
          16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D'
        },
        status: 'Synced',
        flaggedCount: 0,
        answerKeyId: 'key_math_final',
        imageThumbnail: ''
      },
      {
        id: 'res_2',
        candidateName: 'Candidate B (Alice Johnson)',
        candidateId: 'STUD_088',
        testName: 'Grade 10 - Math Final',
        className: 'Grade 10-A',
        score: 16,
        totalQuestions: 20,
        percentage: 80,
        scannedAt: '2026-07-16 15:10',
        answers: {
          1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D',
          9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
          16: 'D', 17: 'B', 18: 'B', 19: 'C', 20: 'D'
        },
        status: 'Synced',
        flaggedCount: 1,
        answerKeyId: 'key_math_final',
        imageThumbnail: ''
      }
    ];
  });

  // --- OMR FLOW SCANNING STATE ---
  const [currentScannedImage, setCurrentScannedImage] = useState<string>('');
  const [isCurrentScanAmbiguous, setIsCurrentScanAmbiguous] = useState<boolean>(false);
  const [tempStudentName, setTempStudentName] = useState<string>('');
  
  // Interactive corner anchors for Screen 6
  const [cornerAnchors, setCornerAnchors] = useState([
    { id: 'TL', x: 12, y: 12 },
    { id: 'TR', x: 88, y: 12 },
    { id: 'BL', x: 12, y: 88 },
    { id: 'BR', x: 88, y: 88 }
  ]);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  // Selected answer key for active grading session
  const [activeAnswerKey, setActiveAnswerKey] = useState<AnswerKey | null>(null);

  // Buffer state to review flags
  const [flaggedQuestions, setFlaggedQuestions] = useState<QuestionConfidence[]>([]);
  
  // Results summary target state
  const [recentGradedResult, setRecentGradedResult] = useState<GradedResult | null>(null);

  // Dark Mode / Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('omr_dark_mode');
    return cached === 'true';
  });

  useEffect(() => {
    localStorage.setItem('omr_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // UI Search/Filter States for History and Keys
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyFilterClass, setHistoryFilterClass] = useState<string>('All');
  const [keysSearch, setKeysSearch] = useState<string>('');

  // Editing state for keys
  const [targetEditKey, setTargetEditKey] = useState<AnswerKey | undefined>(undefined);

  // --- EFFECT CACHING & OFFLINE TOGGLE ---
  useEffect(() => {
    localStorage.setItem('omr_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('omr_class_settings', JSON.stringify(classSettings));
  }, [classSettings]);

  useEffect(() => {
    localStorage.setItem('omr_saved_keys', JSON.stringify(savedKeys));
  }, [savedKeys]);

  useEffect(() => {
    localStorage.setItem('omr_graded_results', JSON.stringify(resultsList));
  }, [resultsList]);

  // Handle Splash auto transition with smooth animated progress
  useEffect(() => {
    if (activeScreen === ScreenId.SPLASH) {
      setSplashProgress(0);
      setSplashStatusText("Initializing offline engine...");
      const startTime = Date.now();
      const duration = 2400; // 2.4 seconds total

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(Math.floor((elapsed / duration) * 100), 100);
        setSplashProgress(progress);

        if (progress < 30) {
          setSplashStatusText("Initializing offline engine...");
        } else if (progress < 65) {
          setSplashStatusText("Loading classroom tools...");
        } else if (progress < 95) {
          setSplashStatusText("Preparing teacher portal...");
        } else {
          setSplashStatusText("Ready!");
        }

        if (progress >= 100) {
          clearInterval(interval);
          setActiveScreen(ScreenId.AUTH);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [activeScreen]);

  // Sync simulated transition toast
  const triggerManualSync = () => {
    if (!isOnline) return;
    setResultsList(prev => prev.map(r => ({ ...r, status: 'Synced' })));
    setUserProfile(p => ({ ...p, offlineCount: 0 }));
  };

  // --- SCREEN RENDERERS ---

  // 1. SPLASH SCREEN (REDESIGNED WITH RICH EMERALD GREEN BACKGROUND & GLASSMORPHISM)
  const renderSplashScreen = () => {
    return (
      <div 
        id="screen_splash" 
        onClick={() => setActiveScreen(ScreenId.AUTH)}
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white cursor-pointer select-none"
      >
        {/* Background ambient glowing emerald & teal orb layers */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-40 blur-3xl animate-float" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-30 blur-3xl animate-float" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', animationDelay: '1.8s' }} />
        <div className="absolute top-1/2 right-10 w-72 h-72 rounded-full pointer-events-none opacity-20 blur-3xl animate-float" style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)', animationDelay: '3s' }} />

        {/* Decorative Grid Mesh Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="flex flex-col items-center space-y-7 text-center z-10 animate-fade-in max-w-sm sm:max-w-md">
          {/* Logo container with Glassmorphism Card & Glowing Halo */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-emerald-400/25 blur-2xl animate-pulse" />
            
            <div className="p-3 bg-white/10 backdrop-blur-2xl border-2 border-emerald-400/50 rounded-[2.5rem] shadow-2xl ring-4 ring-emerald-500/20 relative z-10 transition-transform duration-300 hover:scale-105">
              <img 
                id="app_logo_splash"
                src={appLogo} 
                alt="TEACHER'S TOOLKit Logo" 
                className="w-28 h-28 lg:w-36 lg:h-36 rounded-3xl object-cover animate-pop-heart shadow-xl" 
                referrerPolicy="no-referrer"
                style={{ border: '3px solid #10b981', boxShadow: '0 0 28px rgba(16, 185, 129, 0.6)' }}
              />
            </div>
          </div>
          
          <div className="space-y-2 px-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider text-center text-white drop-shadow-md">
              TEACHER'S TOOLKit
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-xs sm:text-sm font-extrabold tracking-wide text-emerald-200 uppercase">
                GES Classroom Command Center
              </span>
            </div>
          </div>
        </div>
        
        {/* Bottom loading bar + percentage + status text + version badge */}
        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center space-y-4 z-10 px-6">
          <div className="w-64 sm:w-80 lg:w-96 flex flex-col items-center space-y-2.5">
            {/* Status text & percentage */}
            <div className="w-full flex items-center justify-between text-xs font-semibold text-emerald-200 px-1">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300 shrink-0" />
                <span>{splashStatusText}</span>
              </span>
              <span className="font-mono font-black text-white text-sm bg-emerald-800/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                {splashProgress}%
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden bg-emerald-950/80 border border-emerald-500/50 p-0.5 relative shadow-inner backdrop-blur-md">
              <div 
                className="h-full rounded-full transition-all duration-75 relative overflow-hidden" 
                style={{
                  width: `${splashProgress}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                  boxShadow: '0 0 16px rgba(52, 211, 153, 0.8)'
                }}
              >
                {/* Moving shimmer sweep effect inside progress bar */}
                <div className="absolute inset-0 w-full h-full animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)', backgroundSize: '200% 100%' }} />
              </div>
            </div>
          </div>

          <span className="text-[11px] lg:text-xs font-mono text-emerald-300/80 animate-pulse tracking-wider">
            Click or tap anywhere to launch · v2.1.0 Offline Engine
          </span>
        </div>
      </div>
    );
  };

  // 2. ONBOARDING (FEATURE TOUR)
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const onboardingSlides = [
    {
      title: "Scan Instantly",
      description: "Point your camera at any completed bubble sheet to auto-detect corners and align scanning rows in real-time.",
      illustration: <ScanIllustration className="w-64 h-64" />
    },
    {
      title: "Grade Automatically",
      description: "Our offline computer vision instantly cross-checks student marks against your master key with 99.8% precision.",
      illustration: <GradeIllustration className="w-64 h-64" />
    },
    {
      title: "Work Offline",
      description: "No internet required in the classroom. Cache sheets securely and sync to the cloud only when you're back in WiFi.",
      illustration: <OfflineIllustration className="w-64 h-64" />
    }
  ];

  const renderOnboardingScreen = () => {
    const slide = onboardingSlides[onboardingStep];
    return (
      <div id="screen_onboarding" className="min-h-screen mesh-light omr-watermark flex flex-col justify-between p-6 md:p-10 max-w-md mx-auto relative">
        <div className="flex justify-between items-center mt-2">
          <span className="chip-brand">Tour {onboardingStep + 1} / 3</span>
          <button 
            id="btn_skip_onboarding"
            onClick={() => setActiveScreen(ScreenId.AUTH)}
            className="text-xs font-bold transition" style={{color:'#3b6ff5'}}
          >
            Skip
          </button>
        </div>

        {/* Illustration + text */}
        <div className="my-auto flex flex-col items-center text-center space-y-8 animate-fade-in">
          <div className="animate-float">
            {slide.illustration}
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{slide.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed px-4 max-w-xs mx-auto">{slide.description}</p>
          </div>
        </div>

        {/* Bottom pills + buttons */}
        <div className="space-y-5 mb-4">
          <div className="flex justify-center gap-2">
            {onboardingSlides.map((_, idx) => (
              <span 
                key={idx} 
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: onboardingStep === idx ? 28 : 8,
                  background: onboardingStep === idx ? 'linear-gradient(90deg,#3b6ff5,#e94560)' : '#e2e8f0'
                }}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {onboardingStep > 0 ? (
              <button
                id="btn_prev_onboarding"
                onClick={() => setOnboardingStep(prev => prev - 1)}
                className="flex-1 py-3 px-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:border-slate-300 transition text-sm flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : null}

            <button
              id="btn_next_onboarding"
              onClick={() => {
                if (onboardingStep < 2) {
                  setOnboardingStep(prev => prev + 1);
                } else {
                  setActiveScreen(ScreenId.AUTH);
                }
              }}
              className="flex-1 py-3 px-4 btn-primary rounded-2xl text-sm flex items-center justify-center gap-1.5"
            >
              <span>{onboardingStep === 2 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAuthScreen = () => {
    return (
      <div id="screen_auth" className="min-h-screen mesh-light omr-watermark flex items-center justify-center p-2.5 sm:p-6 py-4 sm:py-8">
        <div className="w-full max-w-md lg:max-w-4xl rounded-2xl animate-scale-in relative glass-card max-h-[95vh] lg:max-h-none overflow-y-auto" style={{boxShadow:'0 20px 60px -15px rgba(59,111,245,0.18)'}}>
          {/* Gradient top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl z-20" style={{background:'linear-gradient(90deg,#3b6ff5,#10b981,#e94560)'}} />
          
          <div className="flex flex-col lg:flex-row">
            {/* Left panel - branding (visible on desktop) */}
            <div className="hidden lg:flex flex-col items-center justify-center p-10 relative overflow-hidden" style={{background:'linear-gradient(145deg, #0a1433 0%, #0f1f52 50%, #1a0f2e 100%)', minWidth:'320px'}}>
              <div className="absolute inset-0 omr-watermark opacity-10" />
              <div className="absolute top-10 right-10 w-32 h-32 rounded-full" style={{background:'radial-gradient(circle, rgba(59,111,245,0.2), transparent 70%)'}} />
              <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full" style={{background:'radial-gradient(circle, rgba(233,69,96,0.15), transparent 70%)'}} />
              <div className="relative z-10 text-center space-y-6">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute w-28 h-28 rounded-full animate-pulse" style={{background:'radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)'}} />
                  <img 
                    src={appLogo} 
                    alt="TEACHER'S TOOLKit Logo" 
                    className="relative w-24 h-24 rounded-2xl object-cover" 
                    referrerPolicy="no-referrer"
                    style={{border:'3.5px solid #10b981', boxShadow:'0 0 24px rgba(16,185,129,0.5)'}}
                  />
                </div>
                <div className="space-y-2">
                  <h1 className="text-lg sm:text-2xl font-black tracking-wider" style={{color:'#10b981'}}>TEACHER'S TOOLKit</h1>
                  <p className="text-xs leading-relaxed max-w-[220px] mx-auto" style={{color:'rgba(144,184,255,0.7)'}}>
                    Your all-in-one paperless grading, attendance & school management platform.
                  </p>
                </div>
                <div className="flex items-center gap-3 justify-center pt-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full" style={{background:'rgba(16,185,129,0.15)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.2)'}}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Offline-First</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full" style={{background:'rgba(59,111,245,0.15)', color:'#90b8ff', border:'1px solid rgba(59,111,245,0.2)'}}>
                    <Cloud className="w-3 h-3" />
                    <span>Cloud Sync</span>
                  </div>
                </div>

                {/* WhatsApp Community Button */}
                <div className="pt-2">
                  <a
                    href="https://chat.whatsapp.com/CJueLonpuiyE9rPKPnQbAG"
                    target="_blank"
                    rel="noopener noreferrer"
                    id="link_whatsapp_left_panel"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition shadow-xs group"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Join WhatsApp Support Group</span>
                  </a>
                </div>

                {/* Developed By Attribution Badge */}
                <div className="pt-4 border-t border-slate-700/40 flex flex-col items-center gap-1.5 text-center mt-4">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Developed By</span>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
                    <img src={mokarsLogo} alt="Mokars Tech Logo" className="w-4 h-4 object-contain" />
                    <span className="text-xs font-black tracking-wide text-white">Mokars Tech</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel - form */}
            <div className="flex-1 p-3.5 sm:p-6 lg:p-8">
              <div className="text-center space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 mt-1 lg:mt-0">
                {/* Logo (mobile only) */}
                <div className="relative inline-flex items-center justify-center lg:hidden">
                  <div className="absolute w-16 h-16 rounded-2xl" style={{background:'radial-gradient(circle,rgba(16,185,129,0.2),transparent 70%)'}} />
                  <img 
                    id="app_logo_auth"
                    src={appLogo} 
                    alt="TEACHER'S TOOLKit Logo" 
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover" 
                    referrerPolicy="no-referrer"
                    style={{border:'3px solid #10b981',boxShadow:'0 0 16px rgba(16,185,129,0.4)'}}
                  />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {isRegistering 
                    ? (selectedAuthRole === 'headteacher' ? "Create Headteacher Account" : "Create Teacher Account") 
                    : (selectedAuthRole === 'headteacher' ? "Headteacher Portal Login" : "Teacher Portal Login")}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 px-2 sm:px-4 leading-tight">
                  Cloud sync, grade reporting, and management tools.
                </p>
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl mb-4 text-xs font-semibold flex items-center gap-1.5" style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#b91c1c'}}>
                  <AlertCircle className="w-4 h-4 shrink-0" style={{color:'#ef4444'}} />
                  <span>{authError}</span>
                </div>
              )}

              {/* Role selector */}
              <div className="mb-3.5 sm:mb-4 p-1 rounded-xl flex gap-1" style={{background:'#f1f5f9',border:'1px solid #e2e8f0'}}>
                <button
                  type="button"
                  id="btn_auth_role_teacher"
                  onClick={() => setSelectedAuthRole('teacher')}
                  className="flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                  style={selectedAuthRole==='teacher' ? {background:'#fff',color:'#3b6ff5',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'} : {color:'#64748b'}}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  id="btn_auth_role_headteacher"
                  onClick={() => setSelectedAuthRole('headteacher')}
                  className="flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                  style={selectedAuthRole==='headteacher' ? {background:'linear-gradient(135deg,#3b6ff5,#2450db)',color:'#fff',boxShadow:'0 2px 8px rgba(59,111,245,0.3)'} : {color:'#64748b'}}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Headteacher</span>
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3 sm:space-y-3.5">
                {isRegistering && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      id="input_auth_name"
                      type="text" 
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder={selectedAuthRole === 'headteacher' ? "Rev. Dr. Emmanuel Mensah" : "Ms. Sarah Jenkins"}
                      className="w-full rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none"
                      style={{background:'#f0f4f8',border:'1.5px solid #e2e8f0',color:'#1e293b',transition:'border-color 0.2s'}}
                      onFocus={e => e.currentTarget.style.borderColor='#3b6ff5'}
                      onBlur={e => e.currentTarget.style.borderColor='#e2e8f0'}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 sm:top-3 w-4 h-4" style={{color:'#94a3b8'}} />
                    <input 
                      id="input_auth_email"
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder={selectedAuthRole === 'headteacher' ? "headmaster@school.edu" : "sarah@school.edu"}
                      className="w-full rounded-xl pl-10 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none"
                      style={{background:'#f0f4f8',border:'1.5px solid #e2e8f0',color:'#1e293b',transition:'border-color 0.2s'}}
                      onFocus={e => e.currentTarget.style.borderColor='#3b6ff5'}
                      onBlur={e => e.currentTarget.style.borderColor='#e2e8f0'}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <input 
                    id="input_auth_password"
                    type="password" 
                    value={authPass}
                    onChange={(e) => setAuthPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none"
                    style={{background:'#f0f4f8',border:'1.5px solid #e2e8f0',color:'#1e293b',transition:'border-color 0.2s'}}
                    onFocus={e => e.currentTarget.style.borderColor='#3b6ff5'}
                    onBlur={e => e.currentTarget.style.borderColor='#e2e8f0'}
                  />
                </div>

                {isRegistering && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referral Code (Optional)</label>
                      {authReferralCode && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          🎁 +50 Bonus Pts
                        </span>
                      )}
                    </div>
                    <input 
                      id="input_auth_referral"
                      type="text" 
                      value={authReferralCode}
                      onChange={(e) => setAuthReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. TEACHER-GH-8921"
                      className="w-full rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-mono font-bold uppercase focus:outline-none"
                      style={{background:'#f0f4f8',border: authReferralCode ? '1.5px solid #10b981' : '1.5px solid #e2e8f0',color:'#1e293b',transition:'border-color 0.2s'}}
                    />
                  </div>
                )}

                <button 
                  id="btn_auth_submit"
                  type="submit"
                  className="w-full py-3 sm:py-3.5 btn-primary rounded-xl text-xs sm:text-sm mt-1"
                >
                  {isRegistering 
                    ? (selectedAuthRole === 'headteacher' ? "Sign Up as Headteacher" : "Sign Up & Sync") 
                    : (selectedAuthRole === 'headteacher' ? "Log In to Headteacher Panel" : "Log In & Sync")}
                </button>
              </form>

              <div className="text-center mt-3 sm:mt-4">
                <button
                  id="btn_toggle_auth_mode"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs font-bold transition"
                  style={{color:'#3b6ff5'}}
                >
                  {isRegistering ? "Already have an account? Log In" : "Need an account? Sign up"}
                </button>
              </div>

              {/* WhatsApp Support Group Card */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/80">
                <a
                  href="https://chat.whatsapp.com/CJueLonpuiyE9rPKPnQbAG"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn_join_whatsapp_group"
                  className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 hover:from-emerald-100 hover:to-emerald-100 border border-emerald-200/90 text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-between shadow-xs transition active:scale-[0.98] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-1">
                    <div className="p-1.5 sm:p-2 bg-emerald-500 text-white rounded-lg shrink-0 shadow-xs flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <span className="font-extrabold text-slate-900 text-[11px] sm:text-xs block group-hover:text-emerald-700 transition truncate">
                        Join Teacher's Toolkit WhatsApp Group
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] text-emerald-700 font-medium block truncate">
                        Instant support, updates & teacher community
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 group-hover:translate-x-0.5 transition-transform ml-1" />
                </a>
              </div>

              {/* Super Admin & Developer Portal Access Card */}
              <div className="mt-3 pt-3 border-t border-slate-200/60">
                <button
                  type="button"
                  id="btn_auth_direct_headteacher"
                  onClick={() => {
                    setUserRole("superadmin");
                    setActiveSchoolMode("linked");
                    setUserProfile({
                      email: 'admin@teacherstoolkit.app',
                      fullName: 'Super Admin Developer',
                      isLoggedIn: true,
                      isPremium: true,
                      syncEnabled: true,
                      offlineCount: 0,
                      rewardPoints: 1000,
                      referralCode: 'DEV-ADMIN-001',
                      referralCount: 10,
                      submittedQuestionsCount: 20,
                      activeSubscriptionPlan: 'School License',
                      scansThisMonth: 0,
                      maxFreeScansPerMonth: 999999,
                      smsCredits: 5000
                    });
                    setActiveScreen(ScreenId.SUPER_ADMIN_PANEL);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 hover:from-slate-950 hover:to-emerald-900 text-white font-bold rounded-xl text-xs flex items-center justify-between shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-400 text-slate-950 rounded-lg shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-white text-xs block">Super Admin & Developer Portal</span>
                      <span className="text-[10px] text-emerald-300 font-normal">Generate workshop voucher codes & manage school licenses</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>
              </div>

              {/* Developed By Attribution Badge */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Developed By:</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                  <img src={mokarsLogo} alt="Mokars Tech Logo" className="w-4 h-4 object-contain" />
                  <span className="text-xs font-black tracking-tight text-slate-800">Mokars Tech</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. MAIN DASHBOARD
  const renderDashboardScreen = () => {
    // Math indicators
    const totalScansCount = resultsList.length;
    const averageScore = totalScansCount > 0 
      ? Math.round((resultsList.reduce((acc, curr) => acc + curr.percentage, 0) / totalScansCount)) 
      : 0;

    return (
      <div id="screen_dashboard" className="min-h-screen mesh-light flex flex-col relative pb-24">
        
        <div className="sticky top-0 z-30 flex-shrink-0 glass-nav" style={{borderBottom:'1px solid rgba(226,232,240,0.5)',borderRadius:'0'}}>
          <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="relative shrink-0">
                <img 
                  id="app_logo_header"
                  src={appLogo} 
                  alt="TEACHER'S TOOLKit Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover" 
                  referrerPolicy="no-referrer"
                  style={{border:'2.5px solid #10b981',boxShadow:'0 0 12px rgba(16,185,129,0.4)'}}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex items-center justify-center bg-emerald-500">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-ping" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-[11px] xs:text-xs sm:text-sm font-black tracking-wider whitespace-nowrap" style={{color:'#10b981'}}>TEACHER'S TOOLKit</h1>
                  
                  {userRole === "headteacher" ? (
                    <select
                      id="role_switcher_select"
                      value={userRole}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setUserRole(newRole);
                        if (newRole === "headteacher") {
                          setActiveScreen(ScreenId.HEADTEACHER_PANEL);
                        }
                      }}
                      className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md px-1 py-0.5 cursor-pointer focus:outline-none hidden xs:inline-block"
                      style={{background:'rgba(59,111,245,0.1)',border:'1px solid rgba(59,111,245,0.25)',color:'#2450db'}}
                    >
                      <option value="headteacher">Headteacher</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  ) : (
                    <span className="chip-brand hidden sm:inline-flex">Teacher</span>
                  )}
                </div>

                <button
                  type="button"
                  id="btn_mode_badge"
                  onClick={() => setIsSchoolModalOpen(true)}
                  className="mt-0.5 flex items-center gap-1 cursor-pointer group max-w-[140px] xs:max-w-[200px] sm:max-w-none"
                >
                  {activeSchoolMode === "linked" ? (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full transition truncate" style={{color:'#059669',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)'}}>
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                      <span className="truncate">{linkedSchool?.name || "St. Peter's Basic School"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full transition truncate" style={{color:'#64748b',background:'#f1f5f9',border:'1px solid #e2e8f0'}}>
                      <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                      <span>Personal Mode</span>
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Class selector */}
              <div className="flex items-center gap-1 rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5" style={{background:'rgba(255,255,255,0.7)',border:'1px solid rgba(226,232,240,0.8)'}}>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Class:</span>
                <select
                  id="assigned_class_dropdown"
                  value={selectedAssignedClass}
                  onChange={(e) => {
                    setSelectedAssignedClass(e.target.value);
                    setClassSettings(prev => ({ ...prev, className: e.target.value }));
                  }}
                  className="text-[11px] sm:text-xs font-bold bg-transparent focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none truncate" style={{color:'#1e293b'}}
                >
                  <option value="JHS 2 Gold">JHS 2 Gold</option>
                  <option value="Basic 5 Green">Basic 5 Green</option>
                  <option value="Primary 4 Ruby">Primary 4 Ruby</option>
                  <option value="SHS 1 General Arts">SHS 1 General Arts</option>
                </select>
              </div>

              {/* Refer & Earn Button */}
              <button
                id="btn_open_referral_hub_header"
                onClick={() => setIsReferralModalOpen(true)}
                className="hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 border border-amber-400/40 transition cursor-pointer"
                title="Refer Colleagues & Earn Points"
              >
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>Refer & Earn</span>
                <span className="bg-amber-400 text-slate-950 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-black">+{userProfile.rewardPoints || 0} Pts</span>
              </button>

              {/* Profile Avatar Trigger */}
              <button 
                id="btn_profile_trigger"
                onClick={() => setActiveScreen(ScreenId.PROFILE_SETTINGS)} 
                className="focus:outline-none p-0.5 rounded-full hover:ring-2 hover:ring-emerald-400 transition"
                title="Profile & Settings"
              >
                <TeacherAvatar src={userProfile.avatarUrl} className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-full" />
              </button>
            </div>
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold font-mono animate-pulse" style={{background:'#f59e0b',color:'#1c1917'}}>
            <CloudOff className="w-3.5 h-3.5" />
            <span>OFFLINE MODE ACTIVE • RESULTS CACHED LOCALLY</span>
          </div>
        )}

        <div className="flex-1 p-4 md:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* ── Hero Welcome Card ── */}
          <div className="rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden animate-fade-in" style={{background:'linear-gradient(135deg,#0a1433 0%,#0f1f52 45%,#1a0f2e 100%)',boxShadow:'0 12px 40px -10px rgba(59,111,245,0.35)'}}>
            {/* Background grid */}
            <div className="absolute inset-0 omr-watermark opacity-20" />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full" style={{background:'radial-gradient(circle,rgba(59,111,245,0.2),transparent 70%)'}} />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full" style={{background:'radial-gradient(circle,rgba(233,69,96,0.1),transparent 70%)'}} />
            
            <div className="space-y-3 z-10 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight" style={{color:'#fff'}}>
                    Welcome back, {userProfile.fullName}!
                  </h2>
                  <p className="text-xs leading-relaxed max-w-lg mt-1" style={{color:'rgba(165,180,252,0.8)'}}>
                    Command Center for <strong style={{color:'#6ee7b7'}}>{selectedAssignedClass}</strong> &nbsp;·&nbsp; {activeSchoolMode === "linked" ? linkedSchool?.name : "Personal Workspace"}
                  </p>
                </div>

                <button
                  onClick={() => setIsSchoolModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start md:self-auto"
                  style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.85)'}}
                >
                  <Building2 className="w-3.5 h-3.5" style={{color:'#6ee7b7'}} />
                  <span>School Settings</span>
                </button>
              </div>
              
              {/* Stat chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl text-left space-y-1" style={{background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.2)'}}>
                  <span className="text-[9px] font-bold uppercase tracking-widest block" style={{color:'#6ee7b7'}}>Terminal Reports</span>
                  <p className="text-sm font-black" style={{color:'#fff'}}>18 of 25 Ready</p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(16,185,129,0.2)'}}>
                    <div className="h-full rounded-full" style={{width:'72%',background:'linear-gradient(90deg,#10b981,#6ee7b7)'}} />
                  </div>
                </div>

                <div className="p-3 rounded-xl text-left space-y-1" style={{background:'rgba(59,111,245,0.12)',border:'1px solid rgba(59,111,245,0.2)'}}>
                  <span className="text-[9px] font-bold uppercase tracking-widest block" style={{color:'#90b8ff'}}>Headteacher Sync</span>
                  <p className="text-sm font-black" style={{color:'#fff'}}>
                    {isOnline ? "Synced at 08:30 AM" : "3 Pending Items"}
                  </p>
                  <p className="text-[10px] font-semibold" style={{color:'rgba(165,180,252,0.7)'}}>Auto-transfers on WiFi</p>
                </div>

                <div className="p-3 rounded-xl text-left space-y-1" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <span className="text-[9px] font-bold uppercase tracking-widest block" style={{color:'rgba(255,255,255,0.5)'}}>Class Performance</span>
                  <p className="text-sm font-black" style={{color:'#fff'}}>{averageScore}% Class Avg</p>
                  <p className="text-[10px] font-semibold" style={{color:'rgba(110,231,183,0.8)'}}>{totalScansCount} sheets graded</p>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:block shrink-0 z-10 animate-float">
              <GradeIllustration className="w-32 h-32" />
            </div>
          </div>

          {/* ── Tool Cards Grid ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{color:'#94a3b8'}}>Command Center</h3>
              <span className="chip-emerald">Paperless Tools Active</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 md:gap-4">
              {/* Card 1: Live OMR Camera Scan */}
              <button
                id="card_action_scan"
                onClick={() => {
                  if (savedKeys.length > 0) { setActiveAnswerKey(savedKeys[0]); }
                  setActiveScreen(ScreenId.CAMERA_SCAN);
                }}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#3b6ff5,#5c94ff)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(59,111,245,0.12)',border:'1px solid rgba(59,111,245,0.2)'}}>
                  <Camera className="w-5 h-5" style={{color:'#3b6ff5'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Scan Sheets</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Camera viewfinder for instant OMR bubble scanning.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{background:'rgba(59,111,245,0.12)',color:'#3b6ff5',border:'1px solid rgba(59,111,245,0.25)'}}>Fast Engine</span>
              </button>

              {/* Card 2: Answer Keys */}
              <button
                id="card_action_keys"
                onClick={() => setActiveScreen(ScreenId.SAVED_ANSWER_KEYS)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#10b981,#6ee7b7)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.2)'}}>
                  <FileText className="w-5 h-5" style={{color:'#10b981'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Answer Keys</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Configure master keys and create test patterns.</p>
                </div>
                <ArrowRight className="absolute bottom-3.5 right-3.5 w-4 h-4 transition-transform group-hover:translate-x-1.5 text-slate-400 dark:text-slate-500" />
              </button>

              {/* Card 3: Daily Attendance */}
              <button
                id="card_action_attendance"
                onClick={() => setActiveScreen(ScreenId.ATTENDANCE_SHEET)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#f59e0b,#fbbf24)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.2)'}}>
                  <Users className="w-5 h-5" style={{color:'#f59e0b'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Attendance</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Daily paperless roll-call with presence percentages.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse" style={{background:'rgba(245,158,11,0.12)',color:'#d97706',border:'1px solid rgba(245,158,11,0.25)'}}>NEW</span>
              </button>

              {/* Card 4: Test Setup */}
              <button
                id="card_action_settings"
                onClick={() => setActiveScreen(ScreenId.TEST_CLASS_SETTINGS)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#64748b,#94a3b8)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(100,116,139,0.12)',border:'1px solid rgba(100,116,139,0.2)'}}>
                  <Sliders className="w-5 h-5" style={{color:'#64748b'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Test Setup</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Configure class rosters, questions count & grade thresholds.</p>
                </div>
                <ArrowRight className="absolute bottom-3.5 right-3.5 w-4 h-4 transition-transform group-hover:translate-x-1.5 text-slate-400 dark:text-slate-500" />
              </button>

              {/* Card 5: Terminal Report Builder */}
              <button
                id="card_action_terminal_report"
                onClick={() => setActiveScreen(ScreenId.TERMINAL_REPORT)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#8b5cf6,#a78bfa)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.2)'}}>
                  <Award className="w-5 h-5" style={{color:'#8b5cf6'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Terminal Reports</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Compile grades, assign ranks & bulk print end-of-term reports.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{background:'rgba(139,92,246,0.12)',color:'#8b5cf6',border:'1px solid rgba(139,92,246,0.25)'}}>GES</span>
              </button>

              {/* Card 6: Progress Tracker */}
              <button
                id="card_action_trend_tracker"
                onClick={() => setActiveScreen(ScreenId.STUDENT_TREND_TRACKER)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#06b6d4,#67e8f9)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(6,182,212,0.12)',border:'1px solid rgba(6,182,212,0.2)'}}>
                  <TrendingUp className="w-5 h-5" style={{color:'#06b6d4'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Trend Tracker</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Trace individual marks across weeks. Auto growth indicators.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse" style={{background:'rgba(6,182,212,0.12)',color:'#0891b2',border:'1px solid rgba(6,182,212,0.25)'}}>NEW</span>
              </button>

              {/* Card 7: Lesson Planner */}
              <button
                id="card_action_lesson_planner"
                onClick={() => setActiveScreen(ScreenId.LESSON_PLANNER)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#ec4899,#f9a8d4)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(236,72,153,0.12)',border:'1px solid rgba(236,72,153,0.2)'}}>
                  <BookOpen className="w-5 h-5" style={{color:'#ec4899'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Lesson Planner</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Draft objectives, TLMs and evaluation methods. Print-ready.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse" style={{background:'rgba(236,72,153,0.12)',color:'#db2777',border:'1px solid rgba(236,72,153,0.25)'}}>NEW</span>
              </button>

              {/* Card 8: Seating Chart */}
              <button
                id="card_action_seating_chart"
                onClick={() => setActiveScreen(ScreenId.SEATING_CHART)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#f97316,#fdba74)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(249,115,22,0.12)',border:'1px solid rgba(249,115,22,0.2)'}}>
                  <Users className="w-5 h-5" style={{color:'#f97316'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Seating Planner</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Arrange desks, assign seats & anti-cheating exam layouts.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse" style={{background:'rgba(249,115,22,0.12)',color:'#ea580c',border:'1px solid rgba(249,115,22,0.25)'}}>NEW</span>
              </button>

              {/* Card 9: School Collections Hub */}
              <button
                id="card_action_collections_hub"
                onClick={() => setActiveScreen(ScreenId.COLLECTIONS_HUB)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#3b6ff5,#e94560)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(59,111,245,0.12)',border:'1px solid rgba(59,111,245,0.2)'}}>
                  <DollarSign className="w-5 h-5" style={{color:'#3b6ff5'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Collections Hub</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Fees, PTA & Canteen payments, Cash/MoMo, A6 receipts & SMS proofs.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse" style={{background:'rgba(16,185,129,0.12)',color:'#059669',border:'1px solid rgba(16,185,129,0.25)'}}>FINANCE</span>
              </button>

              {/* Card 10: Resource Distribution Tracker */}
              <button
                id="card_action_resource_tracker"
                onClick={() => setActiveScreen(ScreenId.RESOURCE_TRACKER)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#10b981,#3b82f6)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.2)'}}>
                  <Package className="w-5 h-5" style={{color:'#10b981'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Resource Tracker</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Cabinet textbook allocations, serial barcoding & bulk check-offs.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{background:'rgba(59,130,246,0.12)',color:'#2563eb',border:'1px solid rgba(59,130,246,0.25)'}}>INVENTORY</span>
              </button>

              {/* Card 11: Exam Builder (MCQ/Theory) */}
              <button
                id="card_action_exam_builder"
                onClick={() => setActiveScreen(ScreenId.EXAM_BUILDER)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#ec4899,#8b5cf6)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(236,72,153,0.12)',border:'1px solid rgba(236,72,153,0.2)'}}>
                  <FileText className="w-5 h-5" style={{color:'#ec4899'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Exam Builder</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Fast mobile entry, 2-column paper-saving PDF & instant OMR key generator.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse" style={{background:'rgba(236,72,153,0.12)',color:'#db2777',border:'1px solid rgba(236,72,153,0.25)'}}>PRINT PDF</span>
              </button>

              {/* Card 12: WAEC Question Bank & Points Rewards */}
              <button
                id="card_action_question_bank"
                onClick={() => setActiveScreen(ScreenId.QUESTION_BANK)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#10b981,#059669)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.2)'}}>
                  <BookOpen className="w-5 h-5" style={{color:'#10b981'}} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">WAEC Question Bank</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Snap papers for +50 Pts, refer colleagues for +100 Pts & redeem Pro plans.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse" style={{background:'rgba(16,185,129,0.12)',color:'#059669',border:'1px solid rgba(16,185,129,0.25)'}}>EARN POINTS</span>
              </button>

              {/* Card 13: Refer Colleagues & Earn Points Hub */}
              <button
                id="card_action_referral_hub"
                onClick={() => setIsReferralModalOpen(true)}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card"
              >
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#f59e0b,#eab308)'}} />
                <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.2)'}}>
                  <Gift className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Refer & Earn Pro Plans</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">Share your referral link on WhatsApp. Earn 100 pts per signup to unlock Pro features.</p>
                </div>
                <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  +100 PTS / REFERRAL
                </span>
              </button>

              {/* Card 14: Headteacher Panel */}
              {userRole === "headteacher" && (
                <button
                  id="card_action_headteacher_panel"
                  onClick={() => setActiveScreen(ScreenId.HEADTEACHER_PANEL)}
                  className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-hover"
                  style={{background:'linear-gradient(135deg,#0a1433,#0f1f52)',border:'1px solid rgba(59,111,245,0.3)',boxShadow:'0 4px 20px rgba(59,111,245,0.25)'}}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:'linear-gradient(90deg,#90b8ff,#3b6ff5)'}} />
                  <div className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{background:'rgba(165,180,252,0.15)',border:'1px solid rgba(165,180,252,0.2)'}}>
                    <Building2 className="w-5 h-5" style={{color:'#90b8ff'}} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight" style={{color:'#fff'}}>Admin Panel</h4>
                    <p className="text-[11px] mt-1 line-clamp-2" style={{color:'rgba(165,180,252,0.7)'}}>Review submissions, audit broadsheets & lock term reports.</p>
                  </div>
                  <span className="absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{background:'rgba(165,180,252,0.15)',color:'#90b8ff',border:'1px solid rgba(165,180,252,0.25)'}}>School Sync</span>
                </button>
              )}

            </div>
          </div>

          {/* ── Recent Activity ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{color:'#94a3b8'}}>Recent Graded Sheets</h3>
              <button
                id="btn_dashboard_view_all_history"
                onClick={() => setActiveScreen(ScreenId.RESULTS_HISTORY)}
                className="text-xs font-bold flex items-center gap-0.5 transition" style={{color:'#3b6ff5'}}
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {resultsList.length === 0 ? (
              <div className="rounded-2xl p-8 text-center space-y-4 glass-card">
                <ShrugIllustration className="w-28 h-28 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">No sheets graded yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Click below to start a live OMR scan.</p>
                </div>
                <button
                  id="btn_no_sheets_scan"
                  onClick={() => {
                    if (savedKeys.length > 0) setActiveAnswerKey(savedKeys[0]);
                    setActiveScreen(ScreenId.CAMERA_SCAN);
                  }}
                  className="py-2.5 px-6 btn-primary rounded-xl text-xs"
                >
                  Start First Scan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resultsList.slice(0, 4).map((res) => {
                  const letterGrade = res.percentage >= classSettings.gradingScale.A ? 'A' 
                    : res.percentage >= classSettings.gradingScale.B ? 'B'
                    : res.percentage >= classSettings.gradingScale.C ? 'C'
                    : 'D';
                  const gradeColor = letterGrade === 'A' ? '#10b981' : letterGrade === 'B' ? '#3b6ff5' : letterGrade === 'C' ? '#f59e0b' : '#ef4444';
                  const gradeBg   = letterGrade === 'A' ? 'rgba(16,185,129,0.08)' : letterGrade === 'B' ? 'rgba(59,111,245,0.08)' : letterGrade === 'C' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
                  
                  return (
                    <div 
                      key={res.id} 
                      className="rounded-2xl p-4 flex items-center justify-between transition-all card-hover glass-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{background:gradeBg,color:gradeColor,border:`1px solid ${gradeColor}25`}}>
                          {letterGrade}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{res.candidateName}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono" style={{color:'#94a3b8'}}>
                            <span>{res.testName}</span>
                            <span>·</span>
                            <span>{res.scannedAt.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-slate-800">{res.score}/{res.totalQuestions}</span>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          {res.status === 'Synced' ? (
                            <span className="text-[9px] font-mono font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{background:'rgba(16,185,129,0.08)',color:'#059669',border:'1px solid rgba(16,185,129,0.15)'}}>
                              <Check className="w-2.5 h-2.5" /> Synced
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{background:'rgba(245,158,11,0.08)',color:'#d97706',border:'1px solid rgba(245,158,11,0.15)'}}>
                              <CloudOff className="w-2.5 h-2.5" /> Cached
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        </div>
    );
  };

  // 5. CAMERA SCAN is loaded as full screen component from `./components/CameraViewfinder.tsx`
  const handleScanCapture = (imageUrl: string, isAmbiguousSample: boolean, studentName: string) => {
    setCurrentScannedImage(imageUrl);
    setIsCurrentScanAmbiguous(isAmbiguousSample);
    setTempStudentName(studentName);
    
    // Automatically advance to Screen 6: "Confirm Image"
    setActiveScreen(ScreenId.CONFIRM_IMAGE);
  };

  // 6. CONFIRM IMAGE (Adjust corners and check lists)
  const handleAnchorMouseDown = (anchorId: string) => {
    setActiveAnchor(anchorId);
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeAnchor) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    
    setCornerAnchors(prev => prev.map(anchor => 
      anchor.id === activeAnchor ? { ...anchor, x, y } : anchor
    ));
  };

  const handleContainerMouseUp = () => {
    setActiveAnchor(null);
  };

  const renderConfirmImageScreen = () => {
    return (
      <div id="screen_confirm_image" className="min-h-screen mesh-light flex flex-col pb-10">
        {/* Top bar */}
        <div className="glass-panel p-4 px-6 flex items-center justify-between" style={{borderBottom:'1px solid rgba(226,232,240,0.5)'}}>
          <div className="flex items-center gap-3">
            <button 
              id="btn_back_confirm_image"
              onClick={() => setActiveScreen(ScreenId.CAMERA_SCAN)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Confirm Sheet Boundaries</h3>
              <p className="text-[10px] text-slate-500">Fine-tune OMR tracking anchors</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            Success alignment
          </span>
        </div>

        <div className="flex-1 p-6 max-w-xl mx-auto w-full space-y-6">
          
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Drag the glowing green corner targets to overlap perfectly with the black OMR registration squares on the student page.
          </p>

          {/* Anchor Canvas Draggable Area */}
          <div 
            id="draggable_boundaries_container"
            onMouseMove={handleContainerMouseMove}
            onMouseUp={handleContainerMouseUp}
            onMouseLeave={handleContainerMouseUp}
            className="relative w-full h-[360px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-crosshair shadow-2xl flex items-center justify-center select-none"
          >
            {/* Background Sheet mockup */}
            <div className="absolute inset-8 bg-white border border-slate-300 rounded-xl p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="h-2.5 w-16 bg-slate-200 rounded" />
                <div className="h-2.5 w-8 bg-slate-200 rounded" />
              </div>
              
              {/* Dummy OMR circles rows */}
              <div className="space-y-2 flex-1 mt-6">
                {[1, 2, 3, 4, 5, 6].map((row) => (
                  <div key={row} className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span>Q{row}</span>
                    <div className="flex gap-1.5">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <span key={opt} className="w-3.5 h-3.5 rounded-full border border-slate-200 text-center block text-[8px] font-bold text-slate-300">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-slate-100 pt-2 text-[8px] font-mono text-slate-300 uppercase">
                <span>Teacher's Toolkit OMR Form</span>
                <span>Page 1/1</span>
              </div>
            </div>

            {/* Glowing corner anchors */}
            {cornerAnchors.map((anchor) => (
              <div
                key={anchor.id}
                id={`anchor_${anchor.id}`}
                onMouseDown={() => handleAnchorMouseDown(anchor.id)}
                className={`absolute w-7 h-7 rounded-full border-2 border-emerald-500 bg-white cursor-pointer shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform hover:scale-125 active:scale-110 z-20 ${
                  activeAnchor === anchor.id ? 'ring-4 ring-emerald-400 scale-125' : ''
                }`}
                style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="absolute -top-5 text-[9px] font-bold text-emerald-400 font-mono bg-slate-950 px-1 rounded">
                  {anchor.id}
                </span>
              </div>
            ))}

            {/* Polygon connector SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <polygon 
                points={`
                  ${(cornerAnchors[0].x / 100) * 100}%,${(cornerAnchors[0].y / 100) * 100}% 
                  ${(cornerAnchors[1].x / 100) * 100}%,${(cornerAnchors[1].y / 100) * 100}% 
                  ${(cornerAnchors[3].x / 100) * 100}%,${(cornerAnchors[3].y / 100) * 100}% 
                  ${(cornerAnchors[2].x / 100) * 100}%,${(cornerAnchors[2].y / 100) * 100}%
                `}
                fill="rgba(16,185,129,0.05)"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4"
              />
            </svg>
          </div>

          {/* Quality confirmation checklist below */}
          <div className="glass-card rounded-2xl p-4 space-y-2.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">OMR Validation Log</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Full OMR page visible (Inside lens guidelines)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Image high contrast clear (Bright ambient light verified)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>All 4 Corner markers successfully snapped</span>
              </div>
            </div>
          </div>

          {/* Continue button */}
          <button
            id="btn_continue_grading"
            onClick={() => {
              // Advance to Screen 7: Define Answer Key
              setActiveScreen(ScreenId.DEFINE_ANSWER_KEY);
            }}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition text-sm shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Lock Boundaries & Choose Answer Key</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </div>
    );
  };

  // 7. DEFINE ANSWER KEY (Choose matching master pattern)
  const handleChooseAnswerKey = (key: AnswerKey) => {
    setActiveAnswerKey(key);
    triggerProcessGrading(key);
  };

  const triggerProcessGrading = (targetKey: AnswerKey) => {
    const isAmbiguous = isCurrentScanAmbiguous;
    const qCount = targetKey.questionsCount;

    // Generate Question Confidence outputs based on selected OMR simulation (perfect vs ambiguous)
    const confLog: QuestionConfidence[] = [];
    for (let q = 1; q <= qCount; q++) {
      const correctOption = targetKey.answers[q] || 'A';
      
      if (isAmbiguous && q === 17) {
        // Mock Alice Q17 flagged ambiguity (has high overlap between A and B)
        confLog.push({
          questionNumber: q,
          options: { A: 45, B: 42, C: 6, D: 7 },
          detected: 'A', // initial guess
          confidence: 45, // low
          flagged: true // FLAGGED!
        });
      } else {
        // Normal clean high-confidence correct or wrong bubble
        const isCorrect = isAmbiguous ? q !== 5 : true; // alice missed Q5
        const chosen = isCorrect ? correctOption : (correctOption === 'A' ? 'B' : 'A');
        
        const optionsConf = { A: 2, B: 3, C: 2, D: 3 };
        optionsConf[chosen as 'A' | 'B' | 'C' | 'D'] = 98; // High confidence

        confLog.push({
          questionNumber: q,
          options: optionsConf,
          detected: chosen,
          confidence: 98,
          flagged: false
        });
      }
    }

    setFlaggedQuestions(confLog);

    // If there are flagged questions, go to Screen 9 Review Flags first!
    if (confLog.some(q => q.flagged)) {
      setActiveScreen(ScreenId.REVIEW_FLAGS);
    } else {
      // Direct success save to Results Summary!
      saveGradedResultAndAdvance(confLog, targetKey);
    }
  };

  const saveGradedResultAndAdvance = (resolvedQuestions: QuestionConfidence[], key: AnswerKey) => {
    // Count score
    let correct = 0;
    const studentAnswers: { [key: number]: string } = {};

    resolvedQuestions.forEach(q => {
      const studentChosen = q.detected;
      const masterCorrect = key.answers[q.questionNumber];
      studentAnswers[q.questionNumber] = studentChosen;

      if (studentChosen === masterCorrect) {
        correct++;
      }
    });

    const percentage = Math.round((correct / key.questionsCount) * 100);

    const newResult: GradedResult = {
      id: 'res_' + Date.now(),
      candidateName: tempStudentName || 'Candidate B (Alice Johnson)',
      candidateId: 'STUD_' + Math.floor(100 + Math.random() * 900),
      testName: key.title,
      className: key.className,
      score: correct,
      totalQuestions: key.questionsCount,
      percentage,
      scannedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      answers: studentAnswers,
      status: isOnline ? 'Synced' : 'Offline Pending',
      flaggedCount: resolvedQuestions.filter(q => q.flagged).length,
      answerKeyId: key.id,
      imageThumbnail: ''
    };

    // Save to list
    setResultsList(prev => [newResult, ...prev]);

    // Track user offline count if appropriate
    if (!isOnline) {
      setUserProfile(p => ({ ...p, offlineCount: p.offlineCount + 1 }));
    }

    setRecentGradedResult(newResult);
    setActiveScreen(ScreenId.RESULTS_SUMMARY);
  };

  const renderDefineAnswerKeyScreen = () => {
    return (
      <div id="screen_define_key" className="min-h-screen mesh-light flex flex-col pb-10">
        <div className="glass-panel p-4 px-6 flex items-center justify-between" style={{borderBottom:'1px solid rgba(226,232,240,0.5)'}}>
          <div className="flex items-center gap-3">
            <button 
              id="btn_back_define_key"
              onClick={() => setActiveScreen(ScreenId.CONFIRM_IMAGE)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Choose Master Answer Key</h3>
              <p className="text-[10px] text-slate-500">Student: {tempStudentName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Answer Keys</h4>

          <div className="grid grid-cols-1 gap-3">
            {savedKeys.map((key) => (
              <div 
                key={key.id}
                id={`choose_key_item_${key.id}`}
                className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500 shadow-sm transition"
              >
                <div className="space-y-1">
                  <h5 className="text-sm font-extrabold text-slate-900">{key.title}</h5>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>Class: <strong className="text-slate-700">{key.className}</strong></span>
                    <span>•</span>
                    <span>{key.questionsCount} Questions</span>
                  </div>
                </div>

                <button
                  id={`btn_apply_key_${key.id}`}
                  onClick={() => handleChooseAnswerKey(key)}
                  className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition shadow"
                >
                  Grade with this Key
                </button>
              </div>
            ))}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono font-bold">
              <span className="bg-slate-50 px-2.5 text-slate-400">OR CREATE NEW</span>
            </div>
          </div>

          {/* Setup custom key button */}
          <button
            id="btn_create_key_from_grade_session"
            onClick={() => {
              setTargetEditKey(undefined);
              setActiveScreen(ScreenId.ANSWER_KEY_EDITOR);
            }}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 text-xs transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>Create & Use New Answer Key</span>
          </button>
        </div>
      </div>
    );
  };

  // 10. RESULTS SUMMARY
  const renderResultsSummaryScreen = () => {
    if (!recentGradedResult) return null;

    const letterGrade = recentGradedResult.percentage >= classSettings.gradingScale.A ? 'A' 
      : recentGradedResult.percentage >= classSettings.gradingScale.B ? 'B'
      : recentGradedResult.percentage >= classSettings.gradingScale.C ? 'C'
      : 'D';

    const isAlice = recentGradedResult.candidateName.includes('Alice');

    return (
      <div id="screen_results_summary" className="min-h-screen mesh-light flex flex-col pb-12">
        {/* Header */}
        <div className="glass-panel p-4 px-6 flex items-center justify-between" style={{borderBottom:'1px solid rgba(226,232,240,0.5)'}}>
          <span className="text-xs font-bold text-slate-500">GRADING REPORT COMPLETE</span>
          <button 
            id="btn_results_summary_dashboard"
            onClick={() => setActiveScreen(ScreenId.DASHBOARD)}
            className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 transition"
          >
            Go Dashboard
          </button>
        </div>

        <div className="flex-1 p-6 max-w-xl mx-auto w-full space-y-6">
          
          {/* Main big score ribbon */}
          <div className="glass-card rounded-2xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
            
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-600 tracking-wider uppercase">
                Result Saved Successfully!
              </span>
              <h2 className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                {recentGradedResult.score} <span className="text-lg text-slate-400 font-normal">/ {recentGradedResult.totalQuestions}</span>
              </h2>
              <div className="text-2xl font-black text-emerald-500 mt-1">{recentGradedResult.percentage}%</div>
            </div>

            {/* Teacher recommendation */}
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Student scored a final grade of <strong className="text-slate-800">{letterGrade}</strong> on this module. Grading logs have been successfully cached locally.
            </p>
          </div>

          {/* Student Profile Card details */}
          <div className="glass-card rounded-2xl p-5 space-y-3.5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate Credentials</h4>
            
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-extrabold text-slate-900">{recentGradedResult.candidateName}</h5>
                <p className="text-xs text-slate-500 font-mono">ID Reference: {recentGradedResult.candidateId}</p>
              </div>
              <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-150">
                Class {recentGradedResult.className}
              </span>
            </div>

            {isAlice && (
              <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] text-amber-800 font-medium">
                  Teacher corrected Q17 bubble. Student was awarded correct mark.
                </span>
              </div>
            )}
          </div>

          {/* Actions grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn_results_share"
              onClick={() => alert(`Share link generated for ${recentGradedResult.candidateName}: 32/50`)}
              className="py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 transition text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>Share Grade Slip</span>
            </button>

            <button
              id="btn_results_review_history"
              onClick={() => setActiveScreen(ScreenId.RESULTS_HISTORY)}
              className="py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 transition text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span>View All History</span>
            </button>
          </div>

          {/* Primary CTA */}
          <button
            id="btn_mark_next_sheet"
            onClick={() => setActiveScreen(ScreenId.CAMERA_SCAN)}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Mark Next Sheet</span>
          </button>

        </div>
      </div>
    );
  };

  // 11. RESULTS HISTORY (List of graded student forms)
  const renderResultsHistoryScreen = () => {
    // Search & filters logic
    const filteredResults = resultsList.filter(res => {
      const matchSearch = res.candidateName.toLowerCase().includes(historySearch.toLowerCase()) || 
                          res.testName.toLowerCase().includes(historySearch.toLowerCase());
      const matchClass = historyFilterClass === 'All' || res.className === historyFilterClass;
      return matchSearch && matchClass;
    });

    const uniqueClasses = Array.from(new Set(resultsList.map(r => r.className)));

    return (
      <div id="screen_results_history" className="min-h-screen mesh-light flex flex-col pb-12">
        {/* Header navigation */}
        <div className="glass-panel p-4 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              id="btn_back_results_history"
              onClick={() => setActiveScreen(ScreenId.DASHBOARD)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Graded Sheets History</h3>
              <p className="text-[10px] text-slate-500">Student score reports database</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
          
          {/* Search and Filters Bar */}
          <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                id="input_history_search"
                type="text" 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search candidates, exams, rosters..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <select
                  id="select_history_class_filter"
                  value={historyFilterClass}
                  onChange={(e) => setHistoryFilterClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 appearance-none pr-8 cursor-pointer"
                >
                  <option value="All">All Classes</option>
                  {uniqueClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>

              <button
                id="btn_history_clear_filters"
                onClick={() => {
                  setHistorySearch('');
                  setHistoryFilterClass('All');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results grid list */}
          {filteredResults.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center space-y-4 shadow-sm">
              <ShrugIllustration className="w-32 h-32 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">No score records found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try altering your search string or filter options.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((res) => {
                const letterGrade = res.percentage >= classSettings.gradingScale.A ? 'A' 
                  : res.percentage >= classSettings.gradingScale.B ? 'B'
                  : res.percentage >= classSettings.gradingScale.C ? 'C'
                  : 'D';

                return (
                  <div 
                    key={res.id}
                    id={`history_item_${res.id}`}
                    className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-emerald-500 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600 font-black text-base">
                        {letterGrade}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{res.candidateName}</h4>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {res.className}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">{res.testName}</p>
                        <span className="text-[10px] text-slate-400 font-mono block">Scanned: {res.scannedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          {res.score} / {res.totalQuestions} ({res.percentage}%)
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 sm:justify-end">
                          {res.status === 'Synced' ? (
                            <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Synced
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-0.5">
                              <CloudOff className="w-2.5 h-2.5" /> Cached
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        id={`btn_delete_history_${res.id}`}
                        onClick={() => {
                          if (confirm("Delete this student result permanent record?")) {
                            setResultsList(prev => prev.filter(r => r.id !== res.id));
                          }
                        }}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                        title="Delete student result"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    );
  };

  // 12. SAVED ANSWER KEYS
  const renderSavedAnswerKeysScreen = () => {
    const filteredKeys = savedKeys.filter(key => 
      key.title.toLowerCase().includes(keysSearch.toLowerCase()) || 
      key.className.toLowerCase().includes(keysSearch.toLowerCase())
    );

    return (
      <div id="screen_saved_keys" className="min-h-screen mesh-light flex flex-col pb-12">
        {/* Header */}
        <div className="glass-panel p-4 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              id="btn_back_saved_keys"
              onClick={() => setActiveScreen(ScreenId.DASHBOARD)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">OMR Answer Keys</h3>
              <p className="text-[10px] text-slate-500">Exams master keys database</p>
            </div>
          </div>

          <button
            id="btn_create_key_master"
            onClick={() => {
              setTargetEditKey(undefined);
              setActiveScreen(ScreenId.ANSWER_KEY_EDITOR);
            }}
            className="p-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition shadow flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Key</span>
          </button>
        </div>

        <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
          
          {/* Search and Input Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              id="input_keys_search"
              type="text" 
              value={keysSearch}
              onChange={(e) => setKeysSearch(e.target.value)}
              placeholder="Search master keys by test name, subject..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          {filteredKeys.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center space-y-4 shadow-sm">
              <ShrugIllustration className="w-32 h-32 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">No saved master keys found</h4>
                <p className="text-xs text-slate-500 mt-1">Configure an answer key first to start automatic grading.</p>
              </div>
              <button
                id="btn_keys_create_empty_state"
                onClick={() => {
                  setTargetEditKey(undefined);
                  setActiveScreen(ScreenId.ANSWER_KEY_EDITOR);
                }}
                className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition"
              >
                Create First Key
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKeys.map((key) => (
                <div 
                  key={key.id}
                  id={`key_card_${key.id}`}
                  className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-emerald-500 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {key.className}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {key.createdAt}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">{key.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{key.questionsCount} OMR Answer Rows</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex gap-1.5">
                      <button
                        id={`btn_edit_key_${key.id}`}
                        onClick={() => {
                          setTargetEditKey(key);
                          setActiveScreen(ScreenId.ANSWER_KEY_EDITOR);
                        }}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        id={`btn_delete_key_${key.id}`}
                        onClick={() => {
                          if (confirm("Delete this master answer key template?")) {
                            setSavedKeys(prev => prev.filter(k => k.id !== key.id));
                          }
                        }}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      id={`btn_use_key_scan_${key.id}`}
                      onClick={() => {
                        setActiveAnswerKey(key);
                        setActiveScreen(ScreenId.CAMERA_SCAN);
                      }}
                      className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-lg transition flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Use to Grade</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    );
  };

  // 13. TEST/CLASS SETTINGS
  const [testSettingsName, setTestSettingsName] = useState<string>(classSettings.testName);
  const [testSettingsClass, setTestSettingsClass] = useState<string>(classSettings.className);
  const [testSettingsCount, setTestSettingsCount] = useState<number>(classSettings.totalQuestions);
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setClassSettings({
      testName: testSettingsName,
      className: testSettingsClass,
      totalQuestions: testSettingsCount,
      gradingScale: { A: 90, B: 80, C: 70, D: 60 }
    });
    alert('Active class settings saved successfully!');
    setActiveScreen(ScreenId.DASHBOARD);
  };

  const renderClassSettingsScreen = () => {
    return (
      <div id="screen_class_settings" className="min-h-screen mesh-light flex flex-col pb-12">
        {/* Header */}
        <div className="glass-panel p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              id="btn_back_class_settings"
              onClick={() => setActiveScreen(ScreenId.DASHBOARD)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Active Test & Class Setup</h3>
              <p className="text-[10px] text-slate-500">Configure parameters for instant sheets auto-marking</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 max-w-xl mx-auto w-full space-y-6">
          <form onSubmit={handleSaveSettings} className="glass-card rounded-2xl p-6 space-y-5 shadow-sm">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Test / Examination Name</label>
              <input 
                id="input_settings_test_name"
                type="text" 
                value={testSettingsName}
                onChange={(e) => setTestSettingsName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Mathematics Term Quiz"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Class / Grade Level</label>
              <input 
                id="input_settings_class"
                type="text" 
                value={testSettingsClass}
                onChange={(e) => setTestSettingsClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Grade 10-A"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total OMR Answer Rows</label>
              <select
                id="select_settings_total_q"
                value={testSettingsCount}
                onChange={(e) => setTestSettingsCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={25}>25 Questions</option>
                <option value={30}>30 Questions</option>
                <option value={50}>50 Questions (Advanced OMR Sheet)</option>
              </select>
            </div>

            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Grading Matrix Scale</h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-xs font-black text-slate-800 block">Grade A</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 mt-1 block">≥ 90%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-xs font-black text-slate-800 block">Grade B</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 mt-1 block">≥ 80%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-xs font-black text-slate-800 block">Grade C</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 mt-1 block">≥ 70%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-xs font-black text-slate-800 block">Grade D</span>
                  <span className="text-xs font-mono font-bold text-amber-600 mt-1 block">≥ 60%</span>
                </div>
              </div>
            </div>

            <button
              id="btn_settings_save_submit"
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-emerald-500/10 mt-2"
            >
              Apply Config Parameters
            </button>
          </form>
        </div>
      </div>
    );
  };

  // 14. USER PROFILE & SETTINGS
  const renderProfileSettingsScreen = () => {
    const totalScansCount = resultsList.length;
    const averageScore = totalScansCount > 0 
      ? Math.round((resultsList.reduce((acc, curr) => acc + curr.percentage, 0) / totalScansCount)) 
      : 0;

    return (
      <div id="screen_profile_settings" className="min-h-screen mesh-light flex flex-col pb-20">
        {/* Header */}
        <div className="glass-panel p-3 sm:p-4 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button 
              id="btn_back_profile_settings"
              onClick={() => setActiveScreen(ScreenId.DASHBOARD)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">User Profile & Preferences</h3>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Manage teacher account, school profile & app settings</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-4 sm:space-y-6 animate-fade-in">
          
          {/* Hero Profile Card */}
          <div className="rounded-3xl p-4 sm:p-8 relative overflow-hidden text-white" style={{background:'linear-gradient(135deg,#0a1433 0%,#0f1f52 50%,#1a0f2e 100%)', boxShadow:'0 16px 40px -10px rgba(15,31,82,0.35)'}}>
            <div className="absolute inset-0 omr-watermark opacity-15" />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(59,111,245,0.25),transparent 70%)'}} />
            <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(233,69,96,0.15),transparent 70%)'}} />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
              {/* Avatar with photo upload camera overlay & status ring */}
              <div className="relative shrink-0 group">
                <TeacherAvatar src={userProfile.avatarUrl} className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl border-2 border-emerald-400/90 shadow-2xl object-cover" />
                
                {/* Upload camera hover overlay */}
                <label 
                  htmlFor="avatar-upload-input" 
                  className="absolute inset-0 rounded-2xl bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white"
                  title="Upload profile photo"
                >
                  <Camera className="w-5 h-5 text-emerald-400" />
                  <span className="text-[9px] font-bold mt-1">Upload</span>
                </label>
                <input 
                  id="avatar-upload-input" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUserProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />

                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">{userProfile.fullName}</h4>
                    <p className="text-[11px] sm:text-xs text-blue-200/80 font-mono mt-0.5 break-all">{userProfile.email || 'Guest Offline Mode'}</p>
                  </div>
                  
                  <span className="self-center sm:self-start inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0" style={{background: userProfile.isLoggedIn ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: userProfile.isLoggedIn ? '#6ee7b7' : '#fde68a', border: userProfile.isLoggedIn ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)'}}>
                    {userProfile.isLoggedIn ? '✓ PRO CLOUD' : 'GUEST OFFLINE'}
                  </span>
                </div>

                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    onClick={() => setIsSchoolModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition" style={{background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff'}}
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{activeSchoolMode === "linked" ? (linkedSchool?.name || "St. Peter's Basic School") : "Personal Workspace"}</span>
                  </button>

                  <label
                    htmlFor="avatar-upload-input"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer" style={{background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.4)', color:'#6ee7b7'}}
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{userProfile.avatarUrl ? "Change Avatar Photo" : "Upload Custom Avatar"}</span>
                  </label>

                  {userProfile.avatarUrl && (
                    <button
                      onClick={() => setUserProfile(prev => ({ ...prev, avatarUrl: undefined }))}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition" style={{background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5'}}
                      title="Remove uploaded avatar photo"
                    >
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10 grid grid-cols-3 gap-1.5 sm:gap-3 text-center">
              <div className="p-2 sm:p-2.5 rounded-2xl" style={{background:'rgba(255,255,255,0.06)'}}>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block text-blue-200/70">Sheets Graded</span>
                <span className="text-sm sm:text-base font-black text-white mt-0.5 block">{totalScansCount}</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-2xl" style={{background:'rgba(255,255,255,0.06)'}}>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block text-emerald-200/70">Class Average</span>
                <span className="text-sm sm:text-base font-black text-white mt-0.5 block">{averageScore}%</span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-2xl" style={{background:'rgba(255,255,255,0.06)'}}>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider block text-amber-200/70">Cloud Sync</span>
                <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 block">{userProfile.syncEnabled ? "Auto-Sync" : "Local Cache"}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar for Referral & Subscription */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Referral Card */}
            <div 
              onClick={() => setIsReferralModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Gift className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h5 className="text-xs font-bold">Refer Teachers & Earn</h5>
                  <p className="text-[10px] text-blue-100 font-medium">Balance: {userProfile.rewardPoints || 0} Points</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/80 shrink-0" />
            </div>

            {/* Subscription Card */}
            <div 
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h5 className="text-xs font-bold">Subscription & Passes</h5>
                  <p className="text-[10px] text-emerald-100 font-medium">{userProfile.activeSubscriptionPlan || 'Free Tier (50 scans/mo)'}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/80 shrink-0" />
            </div>
          </div>

          {/* Preferences & Settings Section */}
          <div className="glass-card rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>Application Preferences</span>
              </h4>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Feature 1: Dark Mode */}
              <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl hover:bg-slate-50/80 transition gap-3" style={{border:'1px solid #f1f5f9'}}>
                <div className="space-y-0.5 flex-1 pr-1">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>Dark Mode</span>
                  </h5>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">Switch theme for comfortable night-time grading & low lighting.</p>
                </div>
                <button
                  id="btn_toggle_dark_mode"
                  onClick={() => setIsDarkMode(prev => !prev)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                    isDarkMode ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                  aria-label="Toggle Dark Mode"
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Feature 2: Corner Snapping */}
              <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl hover:bg-slate-50/80 transition gap-3" style={{border:'1px solid #f1f5f9'}}>
                <div className="space-y-0.5 flex-1 pr-1">
                  <h5 className="text-xs font-bold text-slate-800">OMR Camera Corner Assistance</h5>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">Automatically locks camera guidelines around OMR bubble sheets.</p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full p-1 cursor-default shrink-0">
                  <div className="bg-white w-4 h-4 rounded-full shadow translate-x-6" />
                </div>
              </div>

              {/* Feature 3: Auto Sync over Data */}
              <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl hover:bg-slate-50/80 transition gap-3" style={{border:'1px solid #f1f5f9'}}>
                <div className="space-y-0.5 flex-1 pr-1">
                  <h5 className="text-xs font-bold text-slate-800">Automatic Sync over Mobile Data</h5>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">Syncs graded scores immediately when cellular data is connected.</p>
                </div>
                <button
                  id="btn_toggle_sync_pref"
                  onClick={() => {
                    setUserProfile(p => ({ ...p, syncEnabled: !p.syncEnabled }));
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition shrink-0 ${
                    userProfile.syncEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${
                    userProfile.syncEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-3">
            {userProfile.isLoggedIn ? (
              <button
                id="btn_profile_logout"
                onClick={() => {
                  setUserProfile({
                    email: '',
                    fullName: 'Teacher Guest',
                    isLoggedIn: false,
                    isPremium: false,
                    syncEnabled: false,
                    offlineCount: resultsList.filter(r => r.status === 'Offline Pending').length
                  });
                  setActiveScreen(ScreenId.AUTH);
                }}
                className="w-full py-3.5 btn-coral rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Teacher Account</span>
              </button>
            ) : (
              <button
                id="btn_profile_login"
                onClick={() => {
                  setActiveScreen(ScreenId.AUTH);
                }}
                className="w-full py-3.5 btn-primary rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In / Link Cloud Account</span>
              </button>
            )}
          </div>

        </div>
      </div>
    );
  };

  // --- ROUTER DISPATCHER ---
  const renderCurrentScreen = () => {
    switch (activeScreen) {
      case ScreenId.SPLASH:
        return renderSplashScreen();
      case ScreenId.ONBOARDING:
        return renderAuthScreen();
      case ScreenId.AUTH:
        return renderAuthScreen();
      case ScreenId.DASHBOARD:
        return renderDashboardScreen();
      case ScreenId.CAMERA_SCAN:
        return (
          <CameraViewfinder 
            onCapture={handleScanCapture}
            onCancel={() => setActiveScreen(ScreenId.DASHBOARD)}
            testName={classSettings.testName}
            totalQuestions={classSettings.totalQuestions}
          />
        );
      case ScreenId.CONFIRM_IMAGE:
        return renderConfirmImageScreen();
      case ScreenId.DEFINE_ANSWER_KEY:
        return renderDefineAnswerKeyScreen();
      case ScreenId.ANSWER_KEY_EDITOR:
        return (
          <div className="p-6 bg-slate-50 min-h-screen">
            <AnswerKeyEditorPanel 
              initialKey={targetEditKey}
              defaultQuestionsCount={classSettings.totalQuestions}
              onCancel={() => {
                if (targetEditKey) {
                  setActiveScreen(ScreenId.SAVED_ANSWER_KEYS);
                } else {
                  setActiveScreen(ScreenId.DEFINE_ANSWER_KEY);
                }
              }}
              onSave={(savedKey) => {
                setSavedKeys(prev => {
                  const exists = prev.some(k => k.id === savedKey.id);
                  if (exists) {
                    return prev.map(k => k.id === savedKey.id ? savedKey : k);
                  }
                  return [savedKey, ...prev];
                });
                alert('Master Answer Key saved and activated!');
                
                // If we were grading a current student sheet, apply it immediately!
                if (currentScannedImage) {
                  handleChooseAnswerKey(savedKey);
                } else {
                  setActiveScreen(ScreenId.SAVED_ANSWER_KEYS);
                }
              }}
            />
          </div>
        );
      case ScreenId.REVIEW_FLAGS:
        return (
          <div className="p-6 bg-slate-50 min-h-screen">
            <ReviewFlagsPanel 
              questions={flaggedQuestions}
              studentName={tempStudentName}
              onCancel={() => setActiveScreen(ScreenId.DASHBOARD)}
              onSaveOverrides={(resolved) => {
                if (activeAnswerKey) {
                  saveGradedResultAndAdvance(resolved, activeAnswerKey);
                }
              }}
            />
          </div>
        );
      case ScreenId.RESULTS_SUMMARY:
        return renderResultsSummaryScreen();
      case ScreenId.RESULTS_HISTORY:
        return renderResultsHistoryScreen();
      case ScreenId.SAVED_ANSWER_KEYS:
        return renderSavedAnswerKeysScreen();
      case ScreenId.TEST_CLASS_SETTINGS:
        return renderClassSettingsScreen();
      case ScreenId.PROFILE_SETTINGS:
        return renderProfileSettingsScreen();
      case ScreenId.TERMINAL_REPORT:
        return (
          <TerminalReportModule 
            onBack={() => setActiveScreen(ScreenId.DASHBOARD)} 
            resultsList={resultsList} 
            activeSchoolMode={activeSchoolMode}
            linkedSchool={linkedSchool}
          />
        );
      case ScreenId.ATTENDANCE_SHEET:
        return (
          <AttendanceModule 
            onBack={() => setActiveScreen(ScreenId.DASHBOARD)} 
            resultsList={resultsList} 
          />
        );
      case ScreenId.STUDENT_TREND_TRACKER:
        return (
          <StudentTrendTracker 
            onBack={() => setActiveScreen(ScreenId.DASHBOARD)} 
            resultsList={resultsList} 
          />
        );
      case ScreenId.LESSON_PLANNER:
        return (
          <LessonPlanner 
            onBack={() => setActiveScreen(ScreenId.DASHBOARD)} 
          />
        );
      case ScreenId.SEATING_CHART:
        return (
          <SeatingChartModule 
            onBack={() => setActiveScreen(ScreenId.DASHBOARD)} 
            resultsList={resultsList} 
          />
        );
      case ScreenId.HEADTEACHER_PANEL:
        return (
          <HeadteacherPanel 
            onBack={() => {
              setUserRole("teacher");
              setActiveScreen(ScreenId.DASHBOARD);
            }} 
            schoolProfile={linkedSchool}
            onUpdateSchoolProfile={(updated) => setLinkedSchool(updated)}
            onLogout={handleLogoutHeadteacher}
            vouchersList={vouchersList}
            onAddVoucher={(newV) => setVouchersList(prev => [newV, ...prev])}
            userProfile={userProfile}
            onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
          />
        );
      case ScreenId.SUPER_ADMIN_PANEL:
        return (
          <SuperAdminPanel
            onBack={() => {
              setUserRole("teacher");
              setActiveScreen(ScreenId.DASHBOARD);
            }}
            onLogout={handleLogoutHeadteacher}
            vouchersList={vouchersList}
            onAddVoucher={(newV) => setVouchersList(prev => [newV, ...prev])}
            onOpenCertificate={() => setActiveScreen(ScreenId.WORKSHOP_CERTIFICATE)}
          />
        );
      case ScreenId.WORKSHOP_CERTIFICATE:
        return (
          <WorkshopCertificateModule
            onBack={() => setActiveScreen(ScreenId.SUPER_ADMIN_PANEL)}
            defaultTeacherName={userProfile.fullName || "Teacher Sarah Jenkins"}
            defaultSchoolName={linkedSchool?.name || "St. Peter's Basic School"}
          />
        );
      case ScreenId.COLLECTIONS_HUB:
        return (
          <SchoolCollectionsHub
            onBack={() => setActiveScreen(ScreenId.DASHBOARD)}
            schoolProfile={linkedSchool}
            selectedClass={selectedAssignedClass}
            setSelectedClass={setSelectedAssignedClass}
          />
        );
      case ScreenId.RESOURCE_TRACKER:
        return (
          <ResourceTrackerModule
            onBack={() => setActiveScreen(ScreenId.DASHBOARD)}
            selectedClass={selectedAssignedClass}
            setSelectedClass={setSelectedAssignedClass}
          />
        );
      case ScreenId.EXAM_BUILDER:
        return (
          <ExamBuilderModule
            onBack={() => setActiveScreen(ScreenId.DASHBOARD)}
            schoolProfile={linkedSchool}
            selectedClass={selectedAssignedClass}
            setSelectedClass={setSelectedAssignedClass}
            userProfile={userProfile}
            onTriggerPaywall={(feat, desc) => handleTriggerPaywall(feat, desc)}
            onSaveMasterKeyAndScan={(savedKey) => {
              setSavedKeys(prev => [savedKey, ...prev.filter(k => k.id !== savedKey.id)]);
              setActiveAnswerKey(savedKey);
              setActiveScreen(ScreenId.CAMERA_SCAN);
            }}
          />
        );
      case ScreenId.QUESTION_BANK:
        return (
          <QuestionBankModule
            onBack={() => setActiveScreen(ScreenId.DASHBOARD)}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onOpenExamBuilder={() => setActiveScreen(ScreenId.EXAM_BUILDER)}
          />
        );
      default:
        return renderSplashScreen();
    }
  };

  // Determine if bottom navigation & sidebar should be visible
  const isNavVisible = ![ScreenId.SPLASH, ScreenId.ONBOARDING, ScreenId.AUTH, ScreenId.CAMERA_SCAN, ScreenId.HEADTEACHER_PANEL, ScreenId.SUPER_ADMIN_PANEL, ScreenId.WORKSHOP_CERTIFICATE].includes(activeScreen);

  // Desktop Side Navigation Sidebar
  const renderDesktopSidebar = () => {
    if (!isNavVisible) return null;

    const navSections = [
      {
        title: "OVERVIEW",
        items: [
          { id: "desk_side_dashboard", label: "Dashboard", icon: Building2, screen: ScreenId.DASHBOARD, activeScreens: [ScreenId.DASHBOARD] },
        ]
      },
      {
        title: "STUDENTS & ACADEMICS",
        items: [
          { id: "desk_side_attendance", label: "Attendance Sheet", icon: Users, screen: ScreenId.ATTENDANCE_SHEET, activeScreens: [ScreenId.ATTENDANCE_SHEET] },
          { id: "desk_side_trends", label: "Student Trends", icon: TrendingUp, screen: ScreenId.STUDENT_TREND_TRACKER, activeScreens: [ScreenId.STUDENT_TREND_TRACKER] },
          { id: "desk_side_seating", label: "Seating Chart", icon: Layers, screen: ScreenId.SEATING_CHART, activeScreens: [ScreenId.SEATING_CHART] },
        ]
      },
      {
        title: "ASSESSMENTS & REPORTS",
        items: [
          { id: "desk_side_questionbank", label: "WAEC Question Bank", icon: BookOpen, screen: ScreenId.QUESTION_BANK, activeScreens: [ScreenId.QUESTION_BANK] },
          { id: "desk_side_terminal", label: "Terminal Reports", icon: FileText, screen: ScreenId.TERMINAL_REPORT, activeScreens: [ScreenId.TERMINAL_REPORT] },
          { id: "desk_side_exambuilder", label: "Exam Builder", icon: BookOpen, screen: ScreenId.EXAM_BUILDER, activeScreens: [ScreenId.EXAM_BUILDER] },
          { id: "desk_side_answerkeys", label: "Master Answer Keys", icon: CheckCircle2, screen: ScreenId.SAVED_ANSWER_KEYS, activeScreens: [ScreenId.SAVED_ANSWER_KEYS] },
          { id: "desk_side_history", label: "Graded Results", icon: History, screen: ScreenId.RESULTS_HISTORY, activeScreens: [ScreenId.RESULTS_HISTORY, ScreenId.RESULTS_SUMMARY] },
          { id: "desk_side_lessons", label: "Lesson Planner", icon: Sparkles, screen: ScreenId.LESSON_PLANNER, activeScreens: [ScreenId.LESSON_PLANNER] },
        ]
      },
      {
        title: "FINANCE & MANAGEMENT",
        items: [
          { id: "desk_side_collections", label: "Fee Collections", icon: DollarSign, screen: ScreenId.COLLECTIONS_HUB, activeScreens: [ScreenId.COLLECTIONS_HUB] },
          { id: "desk_side_resources", label: "Resource Tracker", icon: Package, screen: ScreenId.RESOURCE_TRACKER, activeScreens: [ScreenId.RESOURCE_TRACKER] },
        ]
      },
      {
        title: "SETTINGS & SYSTEM",
        items: [
          { id: "desk_side_settings", label: "Profile & Account", icon: User, screen: ScreenId.PROFILE_SETTINGS, activeScreens: [ScreenId.PROFILE_SETTINGS] },
          { id: "desk_side_classconfig", label: "Class Test Config", icon: Sliders, screen: ScreenId.TEST_CLASS_SETTINGS, activeScreens: [ScreenId.TEST_CLASS_SETTINGS] },
        ]
      }
    ];

    return (
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 h-screen sticky top-0 z-40 shadow-sm overflow-y-auto">
        {/* Brand & Logo Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img 
                src={appLogo} 
                alt="Teacher's Toolkit Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-sm"
                style={{border:'2.5px solid #10b981',boxShadow:'0 0 12px rgba(16,185,129,0.4)'}}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-emerald-500">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-black tracking-wider truncate text-emerald-600 dark:text-emerald-400">
                TEACHER'S TOOLKit
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Classroom Command
              </p>
            </div>
          </div>

          {/* School Mode Badge / Trigger */}
          <button
            type="button"
            onClick={() => setIsSchoolModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          >
            <div className="flex items-center gap-2 min-w-0">
              {activeSchoolMode === "linked" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">School Mode</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                  {activeSchoolMode === "linked" ? (linkedSchool?.name || "St. Peter's Basic") : "Personal Mode"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
          </button>

          {/* Subscription Plan & Usage Badge */}
          <button
            type="button"
            onClick={() => setIsSubscriptionModalOpen(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-800/80 hover:border-emerald-400 transition group shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
                    {userProfile.activeSubscriptionPlan} Plan
                  </span>
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block">
                  {hasProAccess(userProfile) ? 'Unlimited OMR & Reports' : `${Math.max(0, (userProfile.maxFreeScansPerMonth || 50) - (userProfile.scansThisMonth || 0))} Scans Left`}
                </span>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold group-hover:scale-105 transition">
              Upgrade
            </div>
          </button>
        </div>

        {/* Action Button: Start New Scan */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (savedKeys.length > 0) setActiveAnswerKey(savedKeys[0]);
              setActiveScreen(ScreenId.CAMERA_SCAN);
            }}
            className="w-full py-2.5 px-3 rounded-xl btn-primary flex items-center justify-center gap-2 text-xs font-black shadow-md hover:shadow-lg transition"
          >
            <Camera className="w-4 h-4" />
            <span>START NEW SCAN</span>
          </button>
        </div>

        {/* Side Tabs Navigation Sections */}
        <div className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.activeScreens.includes(activeScreen);
                  return (
                    <button
                      key={item.id}
                      id={item.id}
                      type="button"
                      onClick={() => setActiveScreen(item.screen)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-sm border border-emerald-200/60 dark:border-emerald-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile & Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <TeacherAvatar src={userProfile.avatarUrl} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">{userProfile.fullName}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate">{userRole === "headteacher" ? "Headteacher" : "Subject Teacher"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveScreen(ScreenId.PROFILE_SETTINGS)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              title="Account Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  };

  return (
    <div className="font-sans antialiased min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen">
        {renderDesktopSidebar()}

        <main className="flex-1 min-w-0 flex flex-col">
          {renderCurrentScreen()}
        </main>
      </div>

      {/* ── Premium Bottom Navigation ── */}
      {isNavVisible && (
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">

            {/* Tab 1: Dashboard */}
            <button
              type="button"
              id="nav_tab_dashboard"
              onClick={() => setActiveScreen(ScreenId.DASHBOARD)}
              className={`nav-tab ${activeScreen === ScreenId.DASHBOARD ? 'active' : 'inactive'}`}
            >
              <Building2 className="w-5 h-5 shrink-0" />
              <span>Home</span>
            </button>

            {/* Tab 2: Students */}
            <button
              type="button"
              id="nav_tab_students"
              onClick={() => setActiveScreen(ScreenId.ATTENDANCE_SHEET)}
              className={`nav-tab ${
                [ScreenId.ATTENDANCE_SHEET, ScreenId.STUDENT_TREND_TRACKER, ScreenId.SEATING_CHART].includes(activeScreen) ? 'active' : 'inactive'
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span>Students</span>
            </button>

            {/* Center: Scan FAB */}
            <button
              type="button"
              id="nav_fab_scan"
              className="nav-fab"
              onClick={() => {
                if (savedKeys.length > 0) setActiveAnswerKey(savedKeys[0]);
                setActiveScreen(ScreenId.CAMERA_SCAN);
              }}
              title="Start new scan"
            >
              <Plus className="w-6 h-6 stroke-[2.5] shrink-0" />
            </button>

            {/* Tab 3: Reports */}
            <button
              type="button"
              id="nav_tab_reports"
              onClick={() => setActiveScreen(ScreenId.TERMINAL_REPORT)}
              className={`nav-tab ${
                [ScreenId.TERMINAL_REPORT, ScreenId.RESULTS_HISTORY, ScreenId.SAVED_ANSWER_KEYS, ScreenId.LESSON_PLANNER].includes(activeScreen) ? 'active' : 'inactive'
              }`}
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span>Reports</span>
            </button>

            {/* Tab 4: Settings */}
            <button
              type="button"
              id="nav_tab_settings"
              onClick={() => setActiveScreen(ScreenId.PROFILE_SETTINGS)}
              className={`nav-tab ${
                [ScreenId.PROFILE_SETTINGS, ScreenId.TEST_CLASS_SETTINGS].includes(activeScreen) ? 'active' : 'inactive'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span>Settings</span>
            </button>

          </div>
        </nav>
      )}

      <SchoolConnectModal 
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        activeMode={activeSchoolMode}
        onModeChange={(mode) => setActiveSchoolMode(mode)}
        linkedSchool={linkedSchool}
        onLinkSchool={(school) => {
          setLinkedSchool(school);
          setActiveSchoolMode("linked");
        }}
        customBranding={customBranding}
        onUpdateBranding={(branding) => setCustomBranding(branding)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(updated) => {
          setUserProfile((prev) => ({ ...prev, ...updated }));
        }}
        onOpenReferralHub={() => {
          setIsSubscriptionModalOpen(false);
          setIsReferralModalOpen(true);
        }}
      />

      <ReferralHubModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(updated) => {
          setUserProfile((prev) => ({ ...prev, ...updated }));
        }}
      />

      <PaywallModal
        isOpen={isPaywallModalOpen}
        onClose={() => setIsPaywallModalOpen(false)}
        title={paywallInfo.title}
        description={paywallInfo.description}
        featureTriggered={paywallInfo.featureTriggered}
        userProfile={userProfile}
        onOpenFullSubscriptionHub={() => {
          setIsSubscriptionModalOpen(true);
        }}
        onQuickUpgradePro={() => {
          setIsSubscriptionModalOpen(true);
        }}
        onQuickBuyExamPass={() => {
          setIsSubscriptionModalOpen(true);
        }}
      />
    </div>
  );
}
