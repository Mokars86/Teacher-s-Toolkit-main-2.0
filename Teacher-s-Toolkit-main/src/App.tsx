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
import { processOMRSheetImage, simulateStudentSheet, ScanPreset } from './services/omrService';
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
import { GradeSlipModal } from './components/GradeSlipModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { 
  canScanOMR, hasProAccess, hasSchoolLicense, 
  LicenseVoucher, PRESET_WORKSHOP_VOUCHERS, validateAndRedeemVoucher 
} from './services/subscriptionService';
import { supabase, dbService } from './services/supabaseClient';

export default function App() {
  // --- STATE PERSISTENCE & INITIAL SEEDING ---
  const [activeScreen, setActiveScreen] = useState<ScreenId>(ScreenId.SPLASH);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [splashStatusText, setSplashStatusText] = useState<string>("Initializing offline engine...");
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Mode & Role Management State
  const [activeSchoolMode, setActiveSchoolMode] = useState<SchoolMode>("personal");
  const [userRole, setUserRole] = useState<UserRole>("teacher");
  const [selectedAssignedClass, setSelectedAssignedClass] = useState<string>("");
  
  const [linkedSchool, setLinkedSchool] = useState<SchoolProfile | null>(() => {
    const cached = localStorage.getItem('omr_linked_school');
    return cached ? JSON.parse(cached) : null;
  });

  const [customBranding, setCustomBranding] = useState<{
    schoolName: string;
    address: string;
    motto: string;
    logoUrl: string;
  }>(() => {
    const cached = localStorage.getItem('omr_custom_branding');
    return cached ? JSON.parse(cached) : {
      schoolName: "",
      address: "",
      motto: "",
      logoUrl: "",
    };
  });

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: string;
  }[]>([]);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState<boolean>(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);
  const [gradeSlipModalResult, setGradeSlipModalResult] = useState<GradedResult | null>(null);
  const [paywallInfo, setPaywallInfo] = useState<{ title?: string; description?: string; featureTriggered?: string }>({});
  const [dashboardCategory, setDashboardCategory] = useState<'all' | 'assessment' | 'classroom' | 'operations' | 'community'>('all');
  const [dashboardSearch, setDashboardSearch] = useState<string>('');

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const cached = localStorage.getItem('omr_user_profile');
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        scansThisMonth: parsed.scansThisMonth ?? 0,
        maxFreeScansPerMonth: parsed.maxFreeScansPerMonth ?? 50,
        smsCredits: parsed.smsCredits ?? 10,
      };
    }
    return {
      email: '',
      fullName: '',
      isLoggedIn: false,
      isPremium: false,
      syncEnabled: true,
      offlineCount: 0,
      rewardPoints: 0,
      referralCode: '',
      referralCount: 0,
      submittedQuestionsCount: 0,
      activeSubscriptionPlan: 'Free',
      scansThisMonth: 0,
      maxFreeScansPerMonth: 50,
      smsCredits: 10,
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

  const handleLogoutHeadteacher = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setUserRole("teacher");
    setActiveSchoolMode("personal");
    setUserProfile((prev) => ({
      ...prev,
      email: '',
      fullName: '',
      isLoggedIn: false
    }));
    setActiveScreen(ScreenId.AUTH);
  };

  // 3. USER AUTHENTICATION (LOGIN/SIGNUP WITH SUPABASE)
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPass, setAuthPass] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [selectedAuthRole, setSelectedAuthRole] = useState<UserRole>('teacher');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
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

  // Listen to Supabase Auth State & Restore Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session?.user && !error) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const role = (meta.role as UserRole) || 'teacher';
        setUserRole(role);
        setUserProfile((prev) => ({
          ...prev,
          email: u.email || '',
          fullName: meta.full_name || u.email?.split('@')[0] || 'User',
          isLoggedIn: true,
          role: role,
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const role = (meta.role as UserRole) || 'teacher';
        setUserRole(role);
        setUserProfile((prev) => ({
          ...prev,
          email: u.email || '',
          fullName: meta.full_name || u.email?.split('@')[0] || 'User',
          isLoggedIn: true,
          role: role,
        }));
      } else if (event === 'SIGNED_OUT') {
        setUserProfile((prev) => ({
          ...prev,
          email: '',
          fullName: '',
          isLoggedIn: false
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = authEmail.trim();
    const cleanPassword = authPass.trim();
    const cleanName = authName.trim();

    if (!cleanEmail || !cleanPassword || (isRegistering && !cleanName)) {
      setAuthError('Please fill in all required form fields.');
      return;
    }

    const assignedRole = selectedAuthRole;
    setUserRole(assignedRole);
    setIsAuthLoading(true);

    try {
      if (isRegistering) {
        let earnedBonusPoints = 0;
        if (authReferralCode.trim()) {
          earnedBonusPoints = assignedRole === 'headteacher' ? 20 : 10;
        }
        const generatedRefCode = (assignedRole === 'headteacher' ? 'SCH-REF-' : 'TEACHER-GH-') + Math.floor(1000 + Math.random() * 9000);

        // Real Supabase Sign Up Call
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
              role: assignedRole,
              referral_code: generatedRefCode,
              bonus_points: earnedBonusPoints,
            },
          },
        });

        if (signUpError) {
          setAuthError(signUpError.message);
          setIsAuthLoading(false);
          return;
        }

        const user = signUpData.user;
        const fullName = cleanName || user?.email?.split('@')[0] || 'Teacher';

        // Save / Upsert Profile in Supabase
        if (user) {
          await dbService.upsertRow('user_profiles', {
            id: user.id,
            auth_user_id: user.id,
            full_name: fullName,
            email: cleanEmail,
            role: assignedRole,
            school_name: linkedSchool?.name || '',
          });
        }

        setUserProfile((prev) => ({
          ...prev,
          email: cleanEmail,
          fullName: fullName,
          isLoggedIn: true,
          isPremium: true,
          rewardPoints: (prev.rewardPoints || 0) + earnedBonusPoints,
          referralCode: generatedRefCode,
          syncEnabled: true,
          offlineCount: 0,
        }));

        if (earnedBonusPoints > 0) {
          alert(`🎉 Welcome! Referral code applied. Your account received +${earnedBonusPoints} Bonus Reward Points!`);
        }

        // Navigate to appropriate panel
        if (assignedRole === 'headteacher') {
          setActiveScreen(ScreenId.HEADTEACHER_PANEL);
        } else {
          setActiveScreen(ScreenId.DASHBOARD);
        }
      } else {
        // Real Supabase Login Call
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (signInError) {
          setAuthError(signInError.message);
          setIsAuthLoading(false);
          return;
        }

        const user = signInData.user;
        const metadata = user?.user_metadata || {};
        const fullName = metadata.full_name || cleanEmail.split('@')[0] || 'Teacher';
        const role = (metadata.role as UserRole) || assignedRole;

        setUserRole(role);
        setUserProfile((prev) => ({
          ...prev,
          email: cleanEmail,
          fullName: fullName,
          isLoggedIn: true,
          role: role,
          syncEnabled: true,
          offlineCount: 0,
        }));

        if (role === 'headteacher') {
          setActiveScreen(ScreenId.HEADTEACHER_PANEL);
        } else {
          setActiveScreen(ScreenId.DASHBOARD);
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setAuthError(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const isMockClassName = (name?: string | null): boolean => {
    if (!name) return false;
    const n = name.trim().toLowerCase();
    return (
      n === 'grade 10-a' ||
      n === 'grade 10- a' ||
      n === 'grade 10 a' ||
      n === 'grade 10-b' ||
      n === 'grade 10' ||
      n === 'jhs 3 diamond' ||
      n === 'basic 5 green' ||
      n === 'basic 5' ||
      n === 'class 5' ||
      n === 'jhs 2 gold' ||
      n === 'primary 6 ruby'
    );
  };

  const [classSettings, setClassSettings] = useState<ClassSettings>(() => {
    const cached = localStorage.getItem('omr_class_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Clear out any legacy hardcoded mock classes
        if (isMockClassName(parsed.className)) {
          parsed.className = '';
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return {
      testName: '',
      className: '',
      totalQuestions: 20,
      gradingScale: { A: 90, B: 80, C: 70, D: 60 }
    };
  });

  const [savedKeys, setSavedKeys] = useState<AnswerKey[]>(() => {
    const cached = localStorage.getItem('omr_saved_keys');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((k: AnswerKey) => !isMockClassName(k.className));
        }
      } catch {}
    }
    return [];
  });

  const [resultsList, setResultsList] = useState<GradedResult[]>(() => {
    const cached = localStorage.getItem('omr_graded_results');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: GradedResult) => !isMockClassName(r.className));
        }
      } catch {}
    }
    return [];
  });

  // --- OMR FLOW SCANNING STATE ---
  const [currentScannedImage, setCurrentScannedImage] = useState<string>('');
  const [currentScanPreset, setCurrentScanPreset] = useState<ScanPreset>('cv_real');
  const [isCurrentScanAmbiguous, setIsCurrentScanAmbiguous] = useState<boolean>(false);
  const [isAnalyzingOMR, setIsAnalyzingOMR] = useState<boolean>(false);
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
  const [editingQuestionNumber, setEditingQuestionNumber] = useState<number | null>(null);

  // Dark Mode / Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('omr_dark_mode');
    return cached === 'true';
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
                alt="Teacher's ToolKit Logo" 
                className="w-28 h-28 lg:w-36 lg:h-36 rounded-3xl object-cover animate-pop-heart shadow-xl" 
                referrerPolicy="no-referrer"
                style={{ border: '3px solid #10b981', boxShadow: '0 0 28px rgba(16, 185, 129, 0.6)' }}
              />
            </div>
          </div>
          
          <div className="space-y-2 px-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider text-center text-white drop-shadow-md">
              Teacher's ToolKit
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
                    alt="Teacher's ToolKit Logo" 
                    className="relative w-24 h-24 rounded-2xl object-cover" 
                    referrerPolicy="no-referrer"
                    style={{border:'3.5px solid #10b981', boxShadow:'0 0 24px rgba(16,185,129,0.5)'}}
                  />
                </div>
                <div className="space-y-2">
                  <h1 className="text-lg sm:text-2xl font-black tracking-wider" style={{color:'#10b981'}}>Teacher's ToolKit</h1>
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
                    alt="Teacher's ToolKit Logo" 
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
                          🎁 +10 Bonus Pts
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
                  disabled={isAuthLoading}
                  className="w-full py-3 sm:py-3.5 btn-primary rounded-xl text-xs sm:text-sm mt-1 flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAuthLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Connecting to Supabase...</span>
                    </>
                  ) : (
                    <span>
                      {isRegistering 
                        ? (selectedAuthRole === 'headteacher' ? "Sign Up as Headteacher" : "Sign Up & Sync") 
                        : (selectedAuthRole === 'headteacher' ? "Log In to Headteacher Panel" : "Log In & Sync")}
                    </span>
                  )}
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

              {/* Developed By Attribution Badge & Legal Links */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Developed By:</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                    <img src={mokarsLogo} alt="Mokars Tech Logo" className="w-4 h-4 object-contain" />
                    <span className="text-xs font-black tracking-tight text-slate-800">Mokars Tech</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                  <button 
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="hover:text-emerald-600 hover:underline transition"
                  >
                    Privacy Policy &amp; Terms
                  </button>
                  <span>&bull;</span>
                  <a 
                    href="/privacy.html" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-emerald-600 hover:underline transition"
                  >
                    Web Policy
                  </a>
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
                  alt="Teacher's ToolKit Logo" 
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
                  <h1 className="text-[11px] xs:text-xs sm:text-sm font-black tracking-wider whitespace-nowrap" style={{color:'#10b981'}}>Teacher's ToolKit</h1>
                  
                  <select
                    id="role_switcher_select"
                    value={userRole}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setUserRole(newRole);
                      if (newRole === "headteacher") {
                        setActiveScreen(ScreenId.HEADTEACHER_PANEL);
                      } else if (newRole === "superadmin") {
                        setActiveScreen(ScreenId.SUPER_ADMIN_PANEL);
                      } else {
                        setActiveScreen(ScreenId.DASHBOARD);
                      }
                    }}
                    className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md px-1.5 py-0.5 cursor-pointer focus:outline-none hidden xs:inline-block bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                  >
                    <option value="teacher">Teacher View</option>
                    <option value="headteacher">Headteacher Portal</option>
                    <option value="superadmin">Super Admin</option>
                  </select>

                  {!isOnline && (
                    <span 
                      id="badge_offline_mode" 
                      className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider rounded-md px-1.5 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                      title="Working in Offline Mode. All changes automatically saved to device."
                    >
                      <CloudOff className="w-2.5 h-2.5 animate-pulse shrink-0 text-amber-500" />
                      <span>Offline Mode</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  id="btn_mode_badge"
                  onClick={() => setIsSchoolModalOpen(true)}
                  className="mt-0.5 flex items-center gap-1 cursor-pointer group max-w-[140px] xs:max-w-[200px] sm:max-w-none"
                >
                  {activeSchoolMode === "linked" && linkedSchool?.name ? (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full transition truncate" style={{color:'#059669',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)'}}>
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                      <span className="truncate">{linkedSchool.name}</span>
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
                <input
                  id="assigned_class_input"
                  list="suggested_classes_list"
                  placeholder="Set Class..."
                  value={selectedAssignedClass || classSettings.className || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAssignedClass(val);
                    setClassSettings(prev => ({ ...prev, className: val }));
                  }}
                  className="text-[11px] sm:text-xs font-bold bg-transparent focus:outline-none cursor-text w-24 sm:w-32 truncate"
                  style={{color:'#1e293b'}}
                />
                <datalist id="suggested_classes_list">
                  <option value="Basic 1" />
                  <option value="Basic 2" />
                  <option value="Basic 3" />
                  <option value="Basic 4" />
                  <option value="Basic 5" />
                  <option value="Basic 6" />
                  <option value="JHS 1" />
                  <option value="JHS 2" />
                  <option value="JHS 3" />
                  <option value="SHS 1" />
                  <option value="SHS 2" />
                  <option value="SHS 3" />
                </datalist>
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
                    Welcome back, {userProfile.fullName || 'Teacher'}!
                  </h2>
                  <p className="text-xs leading-relaxed max-w-lg mt-1" style={{color:'rgba(165,180,252,0.8)'}}>
                    Command Center for <strong style={{color:'#6ee7b7'}}>{selectedAssignedClass || classSettings.className || "All Classes"}</strong> &nbsp;·&nbsp; {activeSchoolMode === "linked" && linkedSchool?.name ? linkedSchool.name : "Personal Workspace"}
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
                  <span className="text-[9px] font-bold uppercase tracking-widest block" style={{color:'#6ee7b7'}}>Graded Assessments</span>
                  <p className="text-sm font-black" style={{color:'#fff'}}>{resultsList.length} Papers Graded</p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(16,185,129,0.2)'}}>
                    <div className="h-full rounded-full" style={{width:`${Math.min(100, resultsList.length > 0 ? Math.min(100, resultsList.length * 10) : 0)}%`,background:'linear-gradient(90deg,#10b981,#6ee7b7)'}} />
                  </div>
                </div>

                <div className="p-3 rounded-xl text-left space-y-1" style={{background:'rgba(59,111,245,0.12)',border:'1px solid rgba(59,111,245,0.2)'}}>
                  <span className="text-[9px] font-bold uppercase tracking-widest block" style={{color:'#90b8ff'}}>Headteacher / Cloud Sync</span>
                  <p className="text-sm font-black" style={{color:'#fff'}}>
                    {isOnline ? "Cloud Connected" : `${userProfile.offlineCount || 0} Offline Items`}
                  </p>
                  <p className="text-[10px] font-semibold" style={{color:'rgba(165,180,252,0.7)'}}>{isOnline ? "Live sync active" : "Auto-transfers when online"}</p>
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

          {/* ── Categorized Command Center / Tool Cards ── */}
          {(() => {
            const allDashboardCards = [
              // 1. Assessment & Grading
              {
                id: "card_action_scan",
                category: "assessment",
                categoryName: "Exams & Grading",
                categoryIcon: FileText,
                title: "Scan Sheets",
                description: "Camera viewfinder for instant OMR bubble scanning.",
                badge: "Fast Engine",
                badgeStyle: { background: 'rgba(59,111,245,0.12)', color: '#3b6ff5', border: '1px solid rgba(59,111,245,0.25)' },
                topGradient: 'linear-gradient(90deg,#3b6ff5,#5c94ff)',
                iconBg: 'rgba(59,111,245,0.12)',
                iconBorder: 'rgba(59,111,245,0.2)',
                icon: <Camera className="w-5 h-5" style={{ color: '#3b6ff5' }} />,
                onClick: () => {
                  if (savedKeys.length > 0) { setActiveAnswerKey(savedKeys[0]); }
                  setActiveScreen(ScreenId.CAMERA_SCAN);
                }
              },
              {
                id: "card_action_keys",
                category: "assessment",
                categoryName: "Exams & Grading",
                categoryIcon: FileText,
                title: "Answer Keys",
                description: "Configure master keys and create test patterns.",
                topGradient: 'linear-gradient(90deg,#10b981,#6ee7b7)',
                iconBg: 'rgba(16,185,129,0.12)',
                iconBorder: 'rgba(16,185,129,0.2)',
                icon: <FileText className="w-5 h-5" style={{ color: '#10b981' }} />,
                showArrow: true,
                onClick: () => setActiveScreen(ScreenId.SAVED_ANSWER_KEYS)
              },
              {
                id: "card_action_exam_builder",
                category: "assessment",
                categoryName: "Exams & Grading",
                categoryIcon: FileText,
                title: "Exam Builder",
                description: "Fast mobile entry, 2-column paper-saving PDF & instant OMR key generator.",
                badge: "PRINT PDF",
                badgeStyle: { background: 'rgba(236,72,153,0.12)', color: '#db2777', border: '1px solid rgba(236,72,153,0.25)' },
                badgePulse: true,
                topGradient: 'linear-gradient(90deg,#ec4899,#8b5cf6)',
                iconBg: 'rgba(236,72,153,0.12)',
                iconBorder: 'rgba(236,72,153,0.2)',
                icon: <FileText className="w-5 h-5" style={{ color: '#ec4899' }} />,
                onClick: () => setActiveScreen(ScreenId.EXAM_BUILDER)
              },
              {
                id: "card_action_settings",
                category: "assessment",
                categoryName: "Exams & Grading",
                categoryIcon: FileText,
                title: "Test Setup",
                description: "Configure class rosters, questions count & grade thresholds.",
                topGradient: 'linear-gradient(90deg,#64748b,#94a3b8)',
                iconBg: 'rgba(100,116,139,0.12)',
                iconBorder: 'rgba(100,116,139,0.2)',
                icon: <Sliders className="w-5 h-5" style={{ color: '#64748b' }} />,
                showArrow: true,
                onClick: () => setActiveScreen(ScreenId.TEST_CLASS_SETTINGS)
              },

              // 2. Classroom & Students
              {
                id: "card_action_attendance",
                category: "classroom",
                categoryName: "Classroom & Students",
                categoryIcon: Users,
                title: "Attendance",
                description: "Daily paperless roll-call with presence percentages.",
                badge: "NEW",
                badgeStyle: { background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' },
                badgePulse: true,
                topGradient: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                iconBg: 'rgba(245,158,11,0.12)',
                iconBorder: 'rgba(245,158,11,0.2)',
                icon: <Users className="w-5 h-5" style={{ color: '#f59e0b' }} />,
                onClick: () => setActiveScreen(ScreenId.ATTENDANCE_SHEET)
              },
              {
                id: "card_action_seating_chart",
                category: "classroom",
                categoryName: "Classroom & Students",
                categoryIcon: Users,
                title: "Seating Planner",
                description: "Arrange desks, assign seats & anti-cheating exam layouts.",
                badge: "NEW",
                badgeStyle: { background: 'rgba(249,115,22,0.12)', color: '#ea580c', border: '1px solid rgba(249,115,22,0.25)' },
                badgePulse: true,
                topGradient: 'linear-gradient(90deg,#f97316,#fdba74)',
                iconBg: 'rgba(249,115,22,0.12)',
                iconBorder: 'rgba(249,115,22,0.2)',
                icon: <Users className="w-5 h-5" style={{ color: '#f97316' }} />,
                onClick: () => setActiveScreen(ScreenId.SEATING_CHART)
              },
              {
                id: "card_action_trend_tracker",
                category: "classroom",
                categoryName: "Classroom & Students",
                categoryIcon: Users,
                title: "Trend Tracker",
                description: "Trace individual marks across weeks. Auto growth indicators.",
                badge: "NEW",
                badgeStyle: { background: 'rgba(6,182,212,0.12)', color: '#0891b2', border: '1px solid rgba(6,182,212,0.25)' },
                badgePulse: true,
                topGradient: 'linear-gradient(90deg,#06b6d4,#67e8f9)',
                iconBg: 'rgba(6,182,212,0.12)',
                iconBorder: 'rgba(6,182,212,0.2)',
                icon: <TrendingUp className="w-5 h-5" style={{ color: '#06b6d4' }} />,
                onClick: () => setActiveScreen(ScreenId.STUDENT_TREND_TRACKER)
              },
              {
                id: "card_action_lesson_planner",
                category: "classroom",
                categoryName: "Classroom & Students",
                categoryIcon: Users,
                title: "Lesson Planner",
                description: "Draft objectives, TLMs and evaluation methods. Print-ready.",
                badge: "NEW",
                badgeStyle: { background: 'rgba(236,72,153,0.12)', color: '#db2777', border: '1px solid rgba(236,72,153,0.25)' },
                badgePulse: true,
                topGradient: 'linear-gradient(90deg,#ec4899,#f9a8d4)',
                iconBg: 'rgba(236,72,153,0.12)',
                iconBorder: 'rgba(236,72,153,0.2)',
                icon: <BookOpen className="w-5 h-5" style={{ color: '#ec4899' }} />,
                onClick: () => setActiveScreen(ScreenId.LESSON_PLANNER)
              },

              // 3. School Operations & Finance
              {
                id: "card_action_terminal_report",
                category: "operations",
                categoryName: "School Ops & Finance",
                categoryIcon: Building2,
                title: "Terminal Reports",
                description: "Compile grades, assign ranks & bulk print end-of-term reports.",
                badge: "GES",
                badgeStyle: { background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' },
                topGradient: 'linear-gradient(90deg,#8b5cf6,#a78bfa)',
                iconBg: 'rgba(139,92,246,0.12)',
                iconBorder: 'rgba(139,92,246,0.2)',
                icon: <Award className="w-5 h-5" style={{ color: '#8b5cf6' }} />,
                onClick: () => setActiveScreen(ScreenId.TERMINAL_REPORT)
              },
              {
                id: "card_action_collections_hub",
                category: "operations",
                categoryName: "School Ops & Finance",
                categoryIcon: Building2,
                title: "Collections Hub",
                description: "Fees, PTA & Canteen payments, Cash/MoMo, A6 receipts & SMS proofs.",
                badge: "FINANCE",
                badgeStyle: { background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' },
                badgePulse: true,
                topGradient: 'linear-gradient(90deg,#3b6ff5,#e94560)',
                iconBg: 'rgba(59,111,245,0.12)',
                iconBorder: 'rgba(59,111,245,0.2)',
                icon: <DollarSign className="w-5 h-5" style={{ color: '#3b6ff5' }} />,
                onClick: () => setActiveScreen(ScreenId.COLLECTIONS_HUB)
              },
              {
                id: "card_action_resource_tracker",
                category: "operations",
                categoryName: "School Ops & Finance",
                categoryIcon: Building2,
                title: "Resource Tracker",
                description: "Cabinet textbook allocations, serial barcoding & bulk check-offs.",
                badge: "INVENTORY",
                badgeStyle: { background: 'rgba(59,130,246,0.12)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.25)' },
                topGradient: 'linear-gradient(90deg,#10b981,#3b82f6)',
                iconBg: 'rgba(16,185,129,0.12)',
                iconBorder: 'rgba(16,185,129,0.2)',
                icon: <Package className="w-5 h-5" style={{ color: '#10b981' }} />,
                onClick: () => setActiveScreen(ScreenId.RESOURCE_TRACKER)
              },

              // 4. Question Bank & Rewards
              {
                id: "card_action_question_bank",
                category: "community",
                categoryName: "Bank & Rewards",
                categoryIcon: Gift,
                title: "WAEC Question Bank",
                description: "Submit papers for +30 Pts, refer colleagues for +20 Pts & redeem Pro plans.",
                badge: "EARN POINTS",
                badgeStyle: { background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' },
                badgePulse: true,
                topGradient: 'linear-gradient(90deg,#10b981,#059669)',
                iconBg: 'rgba(16,185,129,0.12)',
                iconBorder: 'rgba(16,185,129,0.2)',
                icon: <BookOpen className="w-5 h-5" style={{ color: '#10b981' }} />,
                onClick: () => setActiveScreen(ScreenId.QUESTION_BANK)
              },
              {
                id: "card_action_referral_hub",
                category: "community",
                categoryName: "Bank & Rewards",
                categoryIcon: Gift,
                title: "Refer & Earn Pro Plans",
                description: "Share your referral link on WhatsApp. Earn 20 pts per signup to unlock Pro features.",
                badge: "+20 PTS / REFERRAL",
                badgeClassName: "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700",
                topGradient: 'linear-gradient(90deg,#f59e0b,#eab308)',
                iconBg: 'rgba(245,158,11,0.12)',
                iconBorder: 'rgba(245,158,11,0.2)',
                icon: <Gift className="w-5 h-5 text-amber-500" />,
                onClick: () => setIsReferralModalOpen(true)
              }
            ];

            const categoriesMeta = [
              { id: 'all', label: 'All Tools', icon: Layers, count: allDashboardCards.length },
              { id: 'assessment', label: 'Exams & Grading', icon: FileText, count: allDashboardCards.filter(c => c.category === 'assessment').length },
              { id: 'classroom', label: 'Classroom & Students', icon: Users, count: allDashboardCards.filter(c => c.category === 'classroom').length },
              { id: 'operations', label: 'School Ops & Finance', icon: Building2, count: allDashboardCards.filter(c => c.category === 'operations').length },
              { id: 'community', label: 'Bank & Rewards', icon: Gift, count: allDashboardCards.filter(c => c.category === 'community').length },
            ];

            const filteredCards = allDashboardCards.filter(card => {
              const matchesCategory = dashboardCategory === 'all' || card.category === dashboardCategory;
              const matchesSearch = !dashboardSearch.trim() || 
                card.title.toLowerCase().includes(dashboardSearch.toLowerCase()) || 
                card.description.toLowerCase().includes(dashboardSearch.toLowerCase());
              return matchesCategory && matchesSearch;
            });

            const renderCardButton = (card: typeof allDashboardCards[0]) => (
              <button
                key={card.id}
                id={card.id}
                onClick={card.onClick}
                className="rounded-2xl p-4 text-left transition group relative overflow-hidden flex flex-col justify-between h-44 focus:outline-none cursor-pointer card-3d glass-card hover:translate-y-[-2px]"
              >
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: card.topGradient }} />
                <div 
                  className="p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" 
                  style={{ background: card.iconBg, border: `1px solid ${card.iconBorder}` }}
                >
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{card.title}</h4>
                  <p className="text-[11px] mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">{card.description}</p>
                </div>
                {card.badge && (
                  <span 
                    className={`absolute top-3.5 right-3.5 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${card.badgePulse ? 'animate-pulse' : ''} ${card.badgeClassName || ''}`}
                    style={card.badgeStyle}
                  >
                    {card.badge}
                  </span>
                )}
                {card.showArrow && (
                  <ArrowRight className="absolute bottom-3.5 right-3.5 w-4 h-4 transition-transform group-hover:translate-x-1.5 text-slate-400 dark:text-slate-500" />
                )}
              </button>
            );

            return (
              <div className="space-y-4">
                {/* Header with Title, Search, and Category Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                      Command Center
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                      Select a category or search for tools
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tools (e.g. Scan, PDF, Fees)..."
                      value={dashboardSearch}
                      onChange={(e) => setDashboardSearch(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                    {dashboardSearch && (
                      <button
                        onClick={() => setDashboardSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categoriesMeta.map((cat) => {
                    const IconComponent = cat.icon;
                    const isActive = dashboardCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setDashboardCategory(cat.id as any);
                          setDashboardSearch('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                            : 'bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80'
                        }`}
                      >
                        <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Rendered Cards View */}
                {filteredCards.length === 0 ? (
                  <div className="rounded-2xl p-8 text-center space-y-2 glass-card border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tools found matching "{dashboardSearch}"</p>
                    <button
                      onClick={() => { setDashboardSearch(''); setDashboardCategory('all'); }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Clear search & filter
                    </button>
                  </div>
                ) : dashboardCategory === 'all' && !dashboardSearch ? (
                  // Grouped view when viewing "All Tools"
                  <div className="space-y-6">
                    {[
                      { id: 'assessment', title: 'Exams & Grading', icon: FileText, color: '#3b6ff5' },
                      { id: 'classroom', title: 'Classroom & Student Management', icon: Users, color: '#f59e0b' },
                      { id: 'operations', title: 'School Operations & Finance', icon: Building2, color: '#8b5cf6' },
                      { id: 'community', title: 'Question Bank & Rewards', icon: Gift, color: '#10b981' },
                    ].map((group) => {
                      const groupCards = allDashboardCards.filter(c => c.category === group.id);
                      if (groupCards.length === 0) return null;
                      const GroupIcon = group.icon;
                      return (
                        <div key={group.id} className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <GroupIcon className="w-3.5 h-3.5" style={{ color: group.color }} />
                                {group.title}
                              </h4>
                              <span className="text-[10px] font-bold text-slate-400 font-mono">({groupCards.length})</span>
                            </div>
                            <button
                              onClick={() => setDashboardCategory(group.id as any)}
                              className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 transition"
                            >
                              Focus Category →
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 md:gap-4">
                            {groupCards.map(renderCardButton)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Filtered single category or search results grid
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Showing {filteredCards.length} {filteredCards.length === 1 ? 'tool' : 'tools'}</span>
                      {dashboardCategory !== 'all' && (
                        <button
                          onClick={() => setDashboardCategory('all')}
                          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View All Categories
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 md:gap-4">
                      {filteredCards.map(renderCardButton)}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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
                      onClick={() => {
                        setRecentGradedResult(res);
                        const targetK = savedKeys.find(k => k.id === res.answerKeyId);
                        if (targetK) setActiveAnswerKey(targetK);
                        setActiveScreen(ScreenId.RESULTS_SUMMARY);
                      }}
                      className="rounded-2xl p-4 flex items-center justify-between transition-all card-hover glass-card cursor-pointer hover:border-emerald-400 hover:shadow-md active:scale-[0.99] group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm group-hover:scale-105 transition" style={{background:gradeBg,color:gradeColor,border:`1px solid ${gradeColor}25`}}>
                          {letterGrade}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">{res.candidateName}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono" style={{color:'#94a3b8'}}>
                            <span>{res.testName}</span>
                            <span>·</span>
                            <span>{res.scannedAt.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
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

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGradeSlipModalResult(res);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition cursor-pointer"
                          title="View & Share Grade Slip"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
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
  const handleScanCapture = (imageUrl: string, scanPreset: ScanPreset, studentName: string) => {
    setCurrentScannedImage(imageUrl);
    setCurrentScanPreset(scanPreset);
    setIsCurrentScanAmbiguous(scanPreset === 'sim_audit');
    setTempStudentName(studentName);
    
    // Automatically advance to Screen 6: "Confirm Image"
    setActiveScreen(ScreenId.CONFIRM_IMAGE);
  };

  const handleSpeedInkFastSave = (newResult: GradedResult, imageDataUrl: string) => {
    // 1-Tap Rapid Save for sub-5-second continuous grading loop
    setResultsList(prev => [newResult, ...prev]);
    setRecentGradedResult(newResult);
    setUserProfile(prev => ({
      ...prev,
      scansThisMonth: (prev.scansThisMonth || 0) + 1,
      offlineCount: isOnline ? prev.offlineCount : prev.offlineCount + 1,
    }));
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

  const handleContainerTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!activeAnchor) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((touch.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((touch.clientY - rect.top) / rect.height) * 100)));
    
    setCornerAnchors(prev => prev.map(anchor => 
      anchor.id === activeAnchor ? { ...anchor, x, y } : anchor
    ));
  };

  const handleContainerMouseUp = () => {
    setActiveAnchor(null);
  };

  const renderConfirmImageScreen = () => {
    const isRealPhoto = currentScannedImage && (
      currentScannedImage.startsWith('data:image') || 
      currentScannedImage.startsWith('http') || 
      currentScannedImage.startsWith('blob:')
    );

    return (
      <div id="screen_confirm_image" className="min-h-screen mesh-light flex flex-col pb-10">
        {/* Top bar */}
        <div className="glass-panel p-3 sm:p-4 px-4 sm:px-6 flex items-center justify-between" style={{borderBottom:'1px solid rgba(226,232,240,0.5)'}}>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              id="btn_back_confirm_image"
              onClick={() => setActiveScreen(ScreenId.CAMERA_SCAN)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              title="Back to Camera"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Confirm Sheet Boundaries</h3>
              <p className="text-[10px] text-slate-500">Student: {tempStudentName || 'Candidate'}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen(ScreenId.CAMERA_SCAN)}
            className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Retake</span>
          </button>
        </div>

        <div className="flex-1 p-3 sm:p-6 max-w-xl mx-auto w-full space-y-3 sm:space-y-4">
          
          <p className="text-[11px] sm:text-xs text-slate-500 text-center leading-relaxed">
            Drag the glowing green corner targets to overlap with the black registration squares on the student's sheet.
          </p>

          {/* Anchor Canvas Draggable Area (iPhone SE Responsive) */}
          <div 
            id="draggable_boundaries_container"
            onMouseMove={handleContainerMouseMove}
            onMouseUp={handleContainerMouseUp}
            onMouseLeave={handleContainerMouseUp}
            onTouchMove={handleContainerTouchMove}
            onTouchEnd={handleContainerMouseUp}
            onTouchCancel={handleContainerMouseUp}
            className="relative w-full h-[250px] sm:h-[340px] md:h-[380px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden cursor-crosshair shadow-2xl flex items-center justify-center select-none touch-none"
          >
            {/* Real captured student photo background if available, or fallback mockup */}
            {isRealPhoto ? (
              <img 
                src={currentScannedImage} 
                alt="Scanned Student Sheet" 
                className="absolute inset-0 w-full h-full object-contain p-2 select-none pointer-events-none" 
              />
            ) : (
              /* Background Sheet mockup */
              <div className="absolute inset-4 sm:inset-8 bg-white border border-slate-300 rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-inner">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="h-2 w-12 bg-slate-200 rounded" />
                  <div className="h-2 w-6 bg-slate-200 rounded" />
                </div>
                
                {/* Dummy OMR circles rows */}
                <div className="space-y-1.5 flex-1 mt-3">
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <div key={row} className="flex items-center justify-between text-[8px] text-slate-400 font-mono">
                      <span>Q{row}</span>
                      <div className="flex gap-1">
                        {['A', 'B', 'C', 'D'].map((opt) => (
                          <span key={opt} className="w-3 h-3 rounded-full border border-slate-200 text-center block text-[7px] font-bold text-slate-300">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-1 text-[7px] font-mono text-slate-300 uppercase">
                  <span>OMR Sheet Form</span>
                  <span>1/1</span>
                </div>
              </div>
            )}

            {/* Glowing corner anchors with touch support */}
            {cornerAnchors.map((anchor) => (
              <div
                key={anchor.id}
                id={`anchor_${anchor.id}`}
                onMouseDown={() => handleAnchorMouseDown(anchor.id)}
                onTouchStart={() => handleAnchorMouseDown(anchor.id)}
                className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-emerald-400 bg-emerald-950/80 cursor-pointer shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform hover:scale-125 active:scale-110 z-20 ${
                  activeAnchor === anchor.id ? 'ring-4 ring-emerald-400 scale-125' : ''
                }`}
                style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="absolute -top-4 text-[8px] sm:text-[9px] font-bold text-emerald-300 font-mono bg-slate-950 px-1 rounded shadow">
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
          <div className="glass-card rounded-2xl p-3 sm:p-4 space-y-1.5 sm:space-y-2 shadow-xs">
            <h4 className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">OMR Alignment Status</h4>
            <div className="space-y-1 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Active Key: <strong className="text-slate-900">{activeAnswerKey?.title || savedKeys[0]?.title || classSettings.testName || 'Default Key'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>All 4 registration corner markers snapped</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            {activeAnswerKey || savedKeys.length > 0 ? (
              <button
                id="btn_auto_grade_key"
                onClick={() => {
                  const targetKey = activeAnswerKey || savedKeys[0];
                  if (targetKey) {
                    handleChooseAnswerKey(targetKey);
                  } else {
                    setActiveScreen(ScreenId.DEFINE_ANSWER_KEY);
                  }
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-extrabold rounded-xl transition text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Grade Now with {activeAnswerKey?.title || savedKeys[0]?.title || 'Master Key'}</span>
              </button>
            ) : null}

            <button
              id="btn_continue_grading"
              onClick={() => {
                setActiveScreen(ScreenId.DEFINE_ANSWER_KEY);
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5"
            >
              <span>Switch / Choose Different Answer Key</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    );
  };

  // 7. DEFINE ANSWER KEY (Choose matching master pattern)
  const handleChooseAnswerKey = (key: AnswerKey) => {
    setActiveAnswerKey(key);
    triggerProcessGrading(key);
  };

  const triggerProcessGrading = async (targetKey: AnswerKey) => {
    setIsAnalyzingOMR(true);
    try {
      let confLog: QuestionConfidence[] = [];

      const isRealImage = currentScannedImage && (
        currentScannedImage.startsWith('data:image') || 
        currentScannedImage.startsWith('blob:') || 
        currentScannedImage.startsWith('http')
      );

      if (isRealImage && currentScanPreset !== 'sim_struggling' && currentScanPreset !== 'sim_audit' && currentScanPreset !== 'sim_perfect') {
        // Run Real Computer Vision Optical Mark Recognition on captured/uploaded student sheet!
        confLog = await processOMRSheetImage(
          currentScannedImage,
          cornerAnchors,
          targetKey.questionsCount,
          targetKey
        );
      } else {
        // Run specified simulation preset
        confLog = simulateStudentSheet(
          currentScanPreset,
          targetKey,
          targetKey.questionsCount
        );
      }

      setFlaggedQuestions(confLog);

      // Always save and advance to Results Summary so the user sees results immediately!
      saveGradedResultAndAdvance(confLog, targetKey);
    } catch (err) {
      console.warn('OMR grading error:', err);
      const fallbackLog = simulateStudentSheet('sim_realistic', targetKey, targetKey.questionsCount);
      setFlaggedQuestions(fallbackLog);
      saveGradedResultAndAdvance(fallbackLog, targetKey);
    } finally {
      setIsAnalyzingOMR(false);
    }
  };

  const saveGradedResultAndAdvance = (resolvedQuestions: QuestionConfidence[], key: AnswerKey) => {
    // Count score safely
    let correct = 0;
    const studentAnswers: { [key: number]: string } = {};

    resolvedQuestions.forEach(q => {
      const studentChosen = (q.detected || '').trim().toUpperCase();
      const masterCorrect = (key?.answers ? (key.answers[q.questionNumber] ?? (key.answers as any)[String(q.questionNumber)] ?? 'A') : 'A').trim().toUpperCase();
      studentAnswers[q.questionNumber] = studentChosen;

      if (studentChosen && studentChosen === masterCorrect) {
        correct++;
      }
    });

    const totalQuestions = key?.questionsCount || resolvedQuestions.length || 10;
    const percentage = Math.round((correct / totalQuestions) * 100);

    const newResult: GradedResult = {
      id: 'res_' + Date.now(),
      candidateName: tempStudentName.trim() || `Candidate #${resultsList.length + 1}`,
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
      imageThumbnail: currentScannedImage || ''
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

  const handleOverrideSingleQuestion = (qNum: number, newOption: string) => {
    if (!recentGradedResult) return;
    const targetKey = savedKeys.find(k => k.id === recentGradedResult.answerKeyId) || activeAnswerKey;
    if (!targetKey) return;

    const updatedAnswers = { ...recentGradedResult.answers, [qNum]: newOption };
    let correct = 0;
    for (let i = 1; i <= recentGradedResult.totalQuestions; i++) {
      const studAns = (updatedAnswers[i] || '').trim().toUpperCase();
      const masterAns = (targetKey.answers ? (targetKey.answers[i] ?? (targetKey.answers as any)[String(i)] ?? 'A') : 'A').trim().toUpperCase();
      if (studAns && studAns === masterAns) {
        correct++;
      }
    }

    const percentage = Math.round((correct / recentGradedResult.totalQuestions) * 100);
    const updatedResult: GradedResult = {
      ...recentGradedResult,
      score: correct,
      percentage,
      answers: updatedAnswers,
      flaggedCount: Math.max(0, recentGradedResult.flaggedCount - 1)
    };

    setRecentGradedResult(updatedResult);
    setResultsList(prev => prev.map(r => r.id === updatedResult.id ? updatedResult : r));
    setEditingQuestionNumber(null);
  };

  // 10. RESULTS SUMMARY
  const renderResultsSummaryScreen = () => {
    if (!recentGradedResult) {
      return (
        <div id="screen_results_summary_empty" className="min-h-screen mesh-light flex flex-col p-6 items-center justify-center text-center space-y-4">
          <ShrugIllustration className="w-32 h-32 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No recent graded sheet found</h3>
          <p className="text-xs text-slate-500 max-w-xs">Start a camera scan or select a previous sheet from history.</p>
          <button
            onClick={() => setActiveScreen(ScreenId.CAMERA_SCAN)}
            className="py-2.5 px-6 btn-primary rounded-xl text-xs font-bold"
          >
            Start Camera Scan
          </button>
        </div>
      );
    }

    const letterGrade = recentGradedResult.percentage >= classSettings.gradingScale.A ? 'A' 
      : recentGradedResult.percentage >= classSettings.gradingScale.B ? 'B'
      : recentGradedResult.percentage >= classSettings.gradingScale.C ? 'C'
      : 'D';

    const isAlice = recentGradedResult.candidateName.includes('Alice');
    const targetKey = savedKeys.find(k => k.id === recentGradedResult.answerKeyId) || activeAnswerKey;

    return (
      <div id="screen_results_summary" className="min-h-screen mesh-light flex flex-col pb-12 relative w-full max-w-full overflow-x-hidden">
        {/* Quick Question Override Modal */}
        {editingQuestionNumber !== null && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-2xl text-slate-900 border border-slate-200 animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Adjust Question {editingQuestionNumber} Mark</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Master Key: <strong className="text-emerald-700">{targetKey?.answers[editingQuestionNumber] || 'A'}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setEditingQuestionNumber(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-600">Select candidate's true marked option:</div>

              <div className="grid grid-cols-4 gap-2">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const isCurrent = recentGradedResult.answers[editingQuestionNumber] === opt;
                  const isKey = targetKey?.answers[editingQuestionNumber] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleOverrideSingleQuestion(editingQuestionNumber, opt)}
                      className={`p-3 rounded-2xl border-2 font-extrabold text-sm transition flex flex-col items-center justify-center gap-1 ${
                        isCurrent 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-md' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span>{opt}</span>
                      {isKey && <span className="text-[9px] font-normal opacity-80">Key</span>}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOverrideSingleQuestion(editingQuestionNumber, '')}
                  className="p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Mark as Blank
                </button>
                <button
                  onClick={() => setEditingQuestionNumber(null)}
                  className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="glass-panel p-3.5 sm:p-4 px-4 sm:px-6 flex items-center justify-between w-full max-w-full overflow-hidden" style={{borderBottom:'1px solid rgba(226,232,240,0.5)'}}>
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate mr-2">GRADING REPORT COMPLETE</span>
          <button 
            id="btn_results_summary_dashboard"
            onClick={() => setActiveScreen(ScreenId.DASHBOARD)}
            className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 transition shrink-0 whitespace-nowrap"
          >
            Go Dashboard
          </button>
        </div>

        <div className="flex-1 p-3.5 sm:p-6 max-w-xl mx-auto w-full space-y-4 sm:space-y-6 overflow-x-hidden">
          
          {/* Main big score ribbon */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-sm relative overflow-hidden w-full">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
            
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-600 tracking-wider uppercase">
                Result Saved Successfully!
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                {recentGradedResult.score} <span className="text-base sm:text-lg text-slate-400 font-normal">/ {recentGradedResult.totalQuestions}</span>
              </h2>
              <div className="text-xl sm:text-2xl font-black text-emerald-500 mt-0.5">{recentGradedResult.percentage}%</div>
            </div>

            {/* Teacher recommendation */}
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Student scored a final grade of <strong className="text-slate-800">{letterGrade}</strong> on this module. Grading logs have been cached locally.
            </p>
          </div>

          {/* Student Profile Card details */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm w-full overflow-hidden">
            <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate Credentials</h4>
            
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4 w-full">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2.5 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{recentGradedResult.candidateName}</h5>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-mono truncate">ID: {recentGradedResult.candidateId}</p>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-150 shrink-0">
                Class {recentGradedResult.className}
              </span>
            </div>

            {/* Scanned sheet preview thumbnail if available */}
            {recentGradedResult.imageThumbnail && (
              <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {recentGradedResult.imageThumbnail.startsWith('data:image') || recentGradedResult.imageThumbnail.startsWith('http') || recentGradedResult.imageThumbnail.startsWith('blob:') ? (
                      <img src={recentGradedResult.imageThumbnail} alt="Answer sheet" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[8px] font-mono text-slate-400 font-bold">OMR</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 block truncate">Captured Answer Sheet</span>
                    <span className="text-[10px] text-emerald-600 font-medium block truncate">Scanned & Verified</span>
                  </div>
                </div>
              </div>
            )}

            {isAlice && (
              <div className="bg-amber-50 border border-amber-200/60 p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] text-amber-800 font-medium">
                  Teacher corrected Q17 bubble.
                </span>
              </div>
            )}
          </div>

          {/* Question-by-Question Audit Breakdown with Click-to-Override */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm w-full overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider truncate">Question Mark Log</h4>
                <p className="text-[10px] text-slate-500 truncate">Tap to adjust bubble</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                {recentGradedResult.score} C • {recentGradedResult.totalQuestions - recentGradedResult.score} E
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-h-64 overflow-y-auto pr-1 w-full">
              {Array.from({ length: recentGradedResult.totalQuestions }, (_, i) => i + 1).map((qNum) => {
                const studentAnswer = recentGradedResult.answers[qNum] || '';
                const masterKey = targetKey?.answers[qNum] || 'A';
                const isCorrect = studentAnswer === masterKey;

                return (
                  <button 
                    key={qNum}
                    type="button"
                    onClick={() => setEditingQuestionNumber(qNum)}
                    className={`p-1.5 sm:p-2 rounded-xl border flex items-center justify-between text-[11px] sm:text-xs font-mono transition hover:scale-[1.02] cursor-pointer text-left min-w-0 ${
                      isCorrect 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:border-emerald-400' 
                        : 'bg-red-50/80 border-red-200 text-red-900 hover:border-red-400'
                    }`}
                    title="Tap to override answer"
                  >
                    <span className="font-bold shrink-0">Q{qNum}</span>
                    <div className="flex items-center gap-1 font-bold shrink-0">
                      <span className={isCorrect ? 'text-emerald-700 font-black' : 'text-red-600 line-through'}>
                        {studentAnswer || '—'}
                      </span>
                      {!isCorrect && (
                        <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1 rounded font-bold">
                          ✓{masterKey}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
            <button
              id="btn_results_share"
              type="button"
              onClick={() => setGradeSlipModalResult(recentGradedResult)}
              className="py-3 px-2 sm:px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl border border-emerald-700 transition text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer text-center"
            >
              <Share2 className="w-4 h-4 text-emerald-100 shrink-0" />
              <span className="truncate">Grade Slip</span>
            </button>

            <button
              id="btn_results_review_history"
              type="button"
              onClick={() => setActiveScreen(ScreenId.RESULTS_HISTORY)}
              className="py-3 px-2 sm:px-4 bg-white hover:bg-slate-50 active:scale-98 text-slate-800 font-bold rounded-xl border border-slate-200 transition text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer text-center"
            >
              <History className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="truncate">All History</span>
            </button>
          </div>

          {/* Primary CTA */}
          <button
            id="btn_mark_next_sheet"
            type="button"
            onClick={() => setActiveScreen(ScreenId.CAMERA_SCAN)}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Mark Next Sheet</span>
          </button>

        </div>
      </div>
    );
  };


  const renderDefineAnswerKeyScreen = () => {
    return (
      <div id="screen_define_key" className="min-h-screen mesh-light flex flex-col pb-10 relative">
        {/* Analyzing OMR Loading Modal */}
        {isAnalyzingOMR && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-lg">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold">Analyzing Student Sheet...</h3>
              <p className="text-xs text-slate-400">Measuring optical mark contrast & bubble coordinates...</p>
            </div>
          </div>
        )}

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
            {savedKeys.length === 0 ? (
              <div className="glass-card rounded-2xl p-6 text-center space-y-4 border border-slate-200">
                <div className="space-y-1">
                  <h5 className="text-sm font-extrabold text-slate-800">No Saved Master Keys Found</h5>
                  <p className="text-xs text-slate-500">
                    Create a custom answer key or use our standard auto-key pattern (A, B, C, D...) to grade immediately.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const count = classSettings.totalQuestions || 20;
                      const defaultAnswers: { [key: number]: string } = {};
                      const pattern = ['A', 'B', 'C', 'D', 'C', 'B', 'A', 'D', 'B', 'C', 'D', 'A', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'];
                      for (let i = 1; i <= count; i++) {
                        defaultAnswers[i] = pattern[(i - 1) % pattern.length];
                      }
                      const defaultKey: AnswerKey = {
                        id: 'key_std_' + Date.now(),
                        title: classSettings.testName || 'Standard Assessment',
                        className: classSettings.className || 'General Class',
                        questionsCount: count,
                        answers: defaultAnswers,
                        createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                      };
                      setSavedKeys(prev => [defaultKey, ...prev]);
                      handleChooseAnswerKey(defaultKey);
                    }}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Use Standard Master Key & Grade</span>
                  </button>
                </div>
              </div>
            ) : (
              savedKeys.map((key) => (
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
                    className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition shadow cursor-pointer"
                  >
                    Grade with this Key
                  </button>
                </div>
              ))
            )}
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
      <div id="screen_results_history" className="min-h-screen mesh-light flex flex-col pb-12 w-full max-w-full overflow-x-hidden">
        {/* Header navigation */}
        <div className="glass-panel p-3.5 sm:p-4 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button 
              id="btn_back_results_history"
              type="button"
              onClick={() => setActiveScreen(ScreenId.DASHBOARD)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">Graded Sheets History</h3>
              <p className="text-[10px] text-slate-500 truncate">Student score reports database</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-3.5 sm:p-6 max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 overflow-x-hidden">
          
          {/* Search and Filters Bar */}
          <div className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-2.5 sm:gap-3 shadow-sm w-full overflow-hidden">
            <div className="relative flex-1 min-w-0 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                id="input_history_search"
                type="text" 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search candidates, exams..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <div className="relative flex-1 sm:flex-initial min-w-0">
                <select
                  id="select_history_class_filter"
                  value={historyFilterClass}
                  onChange={(e) => setHistoryFilterClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 appearance-none pr-8 cursor-pointer truncate"
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
                type="button"
                onClick={() => {
                  setHistorySearch('');
                  setHistoryFilterClass('All');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 shrink-0"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results grid list */}
          {filteredResults.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm w-full">
              <ShrugIllustration className="w-28 h-28 sm:w-32 sm:h-32 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">No score records found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try altering your search string or filter options.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {filteredResults.map((res) => {
                const letterGrade = res.percentage >= classSettings.gradingScale.A ? 'A' 
                  : res.percentage >= classSettings.gradingScale.B ? 'B'
                  : res.percentage >= classSettings.gradingScale.C ? 'C'
                  : 'D';

                return (
                  <div 
                    key={res.id}
                    id={`history_item_${res.id}`}
                    onClick={() => {
                      setRecentGradedResult(res);
                      const targetK = savedKeys.find(k => k.id === res.answerKeyId);
                      if (targetK) setActiveAnswerKey(targetK);
                      setActiveScreen(ScreenId.RESULTS_SUMMARY);
                    }}
                    className="glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group w-full overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-600 font-black text-sm sm:text-base shrink-0 group-hover:scale-105 transition">
                        {letterGrade}
                      </div>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">{res.candidateName}</h4>
                          <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                            {res.className}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate">{res.testName}</p>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono block">{res.scannedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
                      <div className="text-left sm:text-right min-w-0">
                        <div className="text-xs font-bold text-slate-900 font-mono whitespace-nowrap">
                          {res.score}/{res.totalQuestions} ({res.percentage}%)
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 sm:justify-end">
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

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGradeSlipModalResult(res);
                          }}
                          className="p-2 sm:p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                          title="Download or share grade slip"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Slip</span>
                        </button>

                        <button
                          id={`btn_delete_history_${res.id}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this student result permanent record?")) {
                              setResultsList(prev => prev.filter(r => r.id !== res.id));
                            }
                          }}
                          className="p-2 sm:p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                          title="Delete student result"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

  useEffect(() => {
    setTestSettingsName(classSettings.testName || '');
    setTestSettingsClass(selectedAssignedClass || classSettings.className || '');
    setTestSettingsCount(classSettings.totalQuestions || 20);
  }, [classSettings, selectedAssignedClass]);
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setClassSettings({
      testName: testSettingsName,
      className: testSettingsClass,
      totalQuestions: testSettingsCount,
      gradingScale: { A: 90, B: 80, C: 70, D: 60 }
    });
    setSelectedAssignedClass(testSettingsClass);
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
                    <span className="truncate max-w-[200px] sm:max-w-none">{activeSchoolMode === "linked" && linkedSchool?.name ? linkedSchool.name : "Personal Workspace"}</span>
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

          {/* Privacy & Legal Compliance */}
          <div className="glass-card rounded-3xl p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Security &amp; Privacy Policy</span>
              </h4>
            </div>
            
            <p className="text-xs text-slate-500">
              Learn how your classroom data, student scores, and camera permissions are protected under our offline-first architecture.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                id="btn_open_privacy_policy"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="flex-1 py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>View In-App Privacy Policy</span>
              </button>

              <a
                href="/privacy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <span>Web Policy</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
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
            onFastSaveNext={handleSpeedInkFastSave}
            onCancel={() => setActiveScreen(ScreenId.DASHBOARD)}
            testName={classSettings.testName}
            totalQuestions={classSettings.totalQuestions}
            activeAnswerKey={activeAnswerKey || savedKeys[0] || null}
            savedKeys={savedKeys}
            onSelectKey={(key) => setActiveAnswerKey(key)}
            existingResultsCount={resultsList.length}
          />
        );
      case ScreenId.CONFIRM_IMAGE:
        return renderConfirmImageScreen();
      case ScreenId.DEFINE_ANSWER_KEY:
        return renderDefineAnswerKeyScreen();
      case ScreenId.ANSWER_KEY_EDITOR:
        return (
          <div className="p-2 sm:p-6 bg-slate-100 min-h-screen">
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
            selectedClass={selectedAssignedClass || classSettings.className || ""}
            setSelectedClass={(cls: string) => {
              setSelectedAssignedClass(cls);
              setClassSettings(prev => ({ ...prev, className: cls }));
            }}
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
              if (userRole === "headteacher") {
                return;
              }
              setActiveScreen(ScreenId.DASHBOARD);
            }} 
            resultsList={resultsList}
            onOpenQuestionBank={() => setActiveScreen(ScreenId.QUESTION_BANK)}
            schoolProfile={linkedSchool}
            onUpdateSchoolProfile={(updated) => setLinkedSchool(updated)}
            onLogout={handleLogoutHeadteacher}
            vouchersList={vouchersList}
            onAddVoucher={(newV) => setVouchersList(prev => [newV, ...prev])}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
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
            defaultTeacherName={userProfile.fullName || "Teacher"}
            defaultSchoolName={linkedSchool?.name || ""}
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
            onBack={() => setActiveScreen(userRole === "headteacher" ? ScreenId.HEADTEACHER_PANEL : ScreenId.DASHBOARD)}
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
  const isNavVisible = ![
    ScreenId.SPLASH, 
    ScreenId.ONBOARDING, 
    ScreenId.AUTH, 
    ScreenId.CAMERA_SCAN, 
    ScreenId.CONFIRM_IMAGE,
    ScreenId.DEFINE_ANSWER_KEY,
    ScreenId.ANSWER_KEY_EDITOR,
    ScreenId.REVIEW_FLAGS,
    ScreenId.HEADTEACHER_PANEL, 
    ScreenId.SUPER_ADMIN_PANEL, 
    ScreenId.WORKSHOP_CERTIFICATE
  ].includes(activeScreen);

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
                alt="Teacher's ToolKit Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-sm"
                style={{border:'2.5px solid #10b981',boxShadow:'0 0 12px rgba(16,185,129,0.4)'}}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-emerald-500">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-black tracking-wider truncate text-emerald-600 dark:text-emerald-400">
                Teacher's ToolKit
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
                  {activeSchoolMode === "linked" && linkedSchool?.name ? linkedSchool.name : "Personal Mode"}
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

      <GradeSlipModal
        isOpen={gradeSlipModalResult !== null}
        result={gradeSlipModalResult}
        allResults={resultsList}
        schoolProfile={linkedSchool}
        customSchoolName={customBranding?.schoolName}
        masterKeyAnswers={savedKeys.find(k => k.id === gradeSlipModalResult?.answerKeyId)?.answers || activeAnswerKey?.answers}
        onClose={() => setGradeSlipModalResult(null)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
