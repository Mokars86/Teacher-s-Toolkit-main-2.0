import React, { useState } from 'react';
import { 
  Building2, Users, CheckCircle2, AlertCircle, Clock, FileText, 
  Search, Check, X, ShieldCheck, Lock, RotateCcw, Edit3, MessageSquare, 
  ArrowLeft, ArrowRight, Printer, Sparkles, UserCheck, Plus, Sliders, QrCode, Share2,
  Upload, Image as ImageIcon, Save, LogOut, Ticket, Copy, CreditCard, Moon, Sun,
  Utensils, DollarSign, Receipt, Gift, MessageCircle, Award, Zap
} from 'lucide-react';
import { 
  SchoolProfile, ClassSubmission, SubmissionStatus, TeacherJoinRequest, PresetRemark, GradedResult, UserProfile 
} from '../types';
import { 
  LicenseVoucher, PRESET_WORKSHOP_VOUCHERS, generateVoucherCode,
  getReferralLink, REDEEM_POINT_COSTS, REFERRAL_REWARDS, redeemPointsForPlan
} from '../services/subscriptionService';

interface HeadteacherPanelProps {
  onBack: () => void;
  resultsList?: GradedResult[];
  schoolProfile?: SchoolProfile | null;
  onUpdateSchoolProfile?: (updated: SchoolProfile) => void;
  onLogout?: () => void;
  vouchersList?: LicenseVoucher[];
  onAddVoucher?: (voucher: LicenseVoucher) => void;
  userProfile?: UserProfile;
  setUserProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  onOpenSubscriptionModal?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

// Initial mock dataset for school admin
const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  id: "SCH_001",
  name: "St. Peter's Basic School",
  code: "SCH-GH-8821",
  region: "Greater Accra Region",
  address: "P.O. Box 42, Osu, Accra - Ghana",
  motto: "Excellence and Integrity in Knowledge",
  headteacherName: "Rev. Dr. Emmanuel Mensah",
  academicTerm: "Term 2 - 2025/2026 Academic Year",
  totalStudents: 480,
  totalTeachers: 18,
};

const INITIAL_SUBMISSIONS: ClassSubmission[] = [
  {
    id: "sub_jhs2",
    className: "JHS 2 Gold",
    teacherName: "Mr. John Teacher",
    teacherId: "teach_01",
    totalStudents: 25,
    completedReportsCount: 25,
    status: "submitted",
    submittedAt: "2026-07-22 08:30 AM",
  },
  {
    id: "sub_p5",
    className: "Primary 5 Emerald",
    teacherName: "Mrs. Sarah Appiah",
    teacherId: "teach_02",
    totalStudents: 30,
    completedReportsCount: 30,
    status: "approved",
    submittedAt: "2026-07-20 02:15 PM",
    approvedAt: "2026-07-21 09:00 AM",
  },
  {
    id: "sub_shs1",
    className: "SHS 1 General Arts",
    teacherName: "Mr. Kwame Boateng",
    teacherId: "teach_03",
    totalStudents: 28,
    completedReportsCount: 18,
    status: "in_progress",
  },
  {
    id: "sub_jhs3",
    className: "JHS 3 Blue",
    teacherName: "Ms. Patricia Osei",
    teacherId: "teach_04",
    totalStudents: 26,
    completedReportsCount: 26,
    status: "revision_requested",
    submittedAt: "2026-07-21 11:45 AM",
    revisionNotes: "Please re-verify Mathematics score for Candidate #004 (Grace Mensah) before final lock.",
  },
  {
    id: "sub_p4",
    className: "Primary 4 Ruby",
    teacherName: "Mr. Ebenezer Laryea",
    teacherId: "teach_05",
    totalStudents: 22,
    completedReportsCount: 0,
    status: "not_started",
  }
];

const INITIAL_PENDING_TEACHERS: TeacherJoinRequest[] = [
  {
    id: "req_01",
    teacherName: "Daniel K. Ansah",
    email: "daniel.ansah@stpeters.edu.gh",
    assignedClass: "JHS 1 Diamond",
    subject: "Integrated Science",
    requestedAt: "Today at 07:15 AM",
    status: "pending",
  },
  {
    id: "req_02",
    teacherName: "Abena Serwaa",
    email: "abena.serwaa@stpeters.edu.gh",
    assignedClass: "Primary 3 Sapphire",
    subject: "English Language",
    requestedAt: "Yesterday at 04:30 PM",
    status: "pending",
  }
];

const INITIAL_PRESET_REMARKS: PresetRemark[] = [
  {
    id: "rem_A1",
    gradeTier: "A1",
    headComment: "An outstanding and exemplary academic performance! Highly commended for exceptional consistency.",
    teacherCommentTemplate: "Maintains top mastery in all subject topics. Keeps high attention to detail."
  },
  {
    id: "rem_B2",
    gradeTier: "B2",
    headComment: "A very good result. Demonstrates solid grasp of the syllabus and strong critical thinking.",
    teacherCommentTemplate: "Very attentive student with great potential for top honours."
  },
  {
    id: "rem_B3",
    gradeTier: "B3",
    headComment: "Good academic standing. Continued focus in key subjects will lead to top distinction.",
    teacherCommentTemplate: "Shows impressive effort in exercises and group tasks."
  },
  {
    id: "rem_C4",
    gradeTier: "C4",
    headComment: "Credit pass. Satisfactory effort, though further revision is encouraged.",
    teacherCommentTemplate: "Works steadily. Additional revision on core topics will boost marks."
  },
  {
    id: "rem_C5",
    gradeTier: "C5",
    headComment: "Fair progress made this term. Strive to address noted weaknesses next term.",
    teacherCommentTemplate: "Quiet and well-behaved. Needs slight prompting during exercises."
  },
  {
    id: "rem_C6",
    gradeTier: "C6",
    headComment: "Passable performance. Consistent homework and study discipline are essential.",
    teacherCommentTemplate: "Fair performance. Should participate more actively in classroom discussions."
  },
  {
    id: "rem_D7",
    gradeTier: "D7",
    headComment: "Pass level. Close supervision and remedial study sessions are required.",
    teacherCommentTemplate: "Struggling with complex multi-step problems. Requires extra tuition."
  },
  {
    id: "rem_E8",
    gradeTier: "E8",
    headComment: "Weak outcome. Urgently requires parent consultation and dedicated academic support.",
    teacherCommentTemplate: "Needs strict monitoring and regular homework practice to avoid falling behind."
  },
  {
    id: "rem_F9",
    gradeTier: "F9",
    headComment: "Unsatisfactory. Extensive remedial work and PTA conference required next term.",
    teacherCommentTemplate: "Below expected syllabus standard. Intensive intervention is strongly advised."
  }
];

interface TeacherCollectionSubmission {
  id: string;
  teacherName: string;
  className: string;
  canteenAmount: number;
  ptaAmount: number;
  schoolFeesAmount: number;
  submittedAt: string;
  status: "pending" | "verified";
  receiptRef: string;
}

const INITIAL_TEACHER_COLLECTIONS: TeacherCollectionSubmission[] = [
  {
    id: "col_jhs2",
    teacherName: "Mr. John Teacher",
    className: "JHS 2 Gold",
    canteenAmount: 140,
    ptaAmount: 450,
    schoolFeesAmount: 3800,
    submittedAt: "Today at 08:45 AM",
    status: "pending",
    receiptRef: "REC-2026-081"
  },
  {
    id: "col_p5",
    teacherName: "Mrs. Sarah Appiah",
    className: "Primary 5 Emerald",
    canteenAmount: 160,
    ptaAmount: 600,
    schoolFeesAmount: 4500,
    submittedAt: "Yesterday at 04:15 PM",
    status: "verified",
    receiptRef: "REC-2026-080"
  },
  {
    id: "col_shs1",
    teacherName: "Mr. Kwame Boateng",
    className: "SHS 1 General Arts",
    canteenAmount: 95,
    ptaAmount: 350,
    schoolFeesAmount: 2900,
    submittedAt: "Today at 09:10 AM",
    status: "pending",
    receiptRef: "REC-2026-082"
  },
  {
    id: "col_jhs3",
    teacherName: "Ms. Patricia Osei",
    className: "JHS 3 Blue",
    canteenAmount: 110,
    ptaAmount: 550,
    schoolFeesAmount: 4800,
    submittedAt: "2026-07-21 at 03:30 PM",
    status: "verified",
    receiptRef: "REC-2026-078"
  }
];

export function HeadteacherPanel({ 
  onBack, 
  resultsList = [],
  schoolProfile = null,
  onUpdateSchoolProfile,
  onLogout,
  vouchersList,
  onAddVoucher,
  userProfile,
  setUserProfile,
  onOpenSubscriptionModal,
  isDarkMode = false,
  onToggleDarkMode,
}: HeadteacherPanelProps) {
  const [activeTab, setActiveTab] = useState<"matrix" | "broadsheet" | "remarks" | "teachers" | "settings">("matrix");
  const [submissions, setSubmissions] = useState<ClassSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("sub_jhs2");
  const [pendingTeachers, setPendingTeachers] = useState<TeacherJoinRequest[]>(INITIAL_PENDING_TEACHERS);
  const [presetRemarks, setPresetRemarks] = useState<PresetRemark[]>(INITIAL_PRESET_REMARKS);
  const [teacherCollections, setTeacherCollections] = useState<TeacherCollectionSubmission[]>(INITIAL_TEACHER_COLLECTIONS);

  // Headteacher Referral & Points State
  const [headRedeemFeedback, setHeadRedeemFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedHeadLink, setCopiedHeadLink] = useState(false);

  const headReferralCode = userProfile?.referralCode || 'SCH-REF-8821';
  const headReferralLink = getReferralLink(headReferralCode);

  const handleCopyHeadLink = () => {
    navigator.clipboard.writeText(headReferralLink);
    setCopiedHeadLink(true);
    setTimeout(() => setCopiedHeadLink(false), 2500);
  };

  const handleShareHeadteacherWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Headteacher! 📚 Check out Teacher's Toolkit for multi-teacher broadsheet grading, terminal reports & school fee collections.\n\nSign up with our school referral link to get 20 FREE Bonus Points for your school:\n${headReferralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleHeadteacherRedeem = (type: 'pass' | 'pro' | 'school' | 'school_weekly' | 'school_monthly' | 'school_term' | 'school_year') => {
    if (!userProfile) return;
    const res = redeemPointsForPlan(type, userProfile);
    if (res.success && res.updatedProfile && setUserProfile) {
      setUserProfile(prev => ({ ...prev, ...res.updatedProfile }));
      setHeadRedeemFeedback({ success: true, message: res.message });
    } else {
      setHeadRedeemFeedback({ success: false, message: res.message });
    }
  };

  const totalCanteenToday = teacherCollections.reduce((sum, c) => sum + c.canteenAmount, 0);
  const totalPtaTerm = teacherCollections.reduce((sum, c) => sum + c.ptaAmount, 0);
  const totalFeesTerm = teacherCollections.reduce((sum, c) => sum + c.schoolFeesAmount, 0);

  const handleVerifyCollection = (id: string) => {
    setTeacherCollections(prev => prev.map(c => c.id === id ? { ...c, status: "verified" } : c));
  };

  // Editable School Profile Settings State
  const [currentSchool, setCurrentSchool] = useState<SchoolProfile>(() => {
    return schoolProfile || INITIAL_SCHOOL_PROFILE;
  });

  const [localVouchers, setLocalVouchers] = useState<LicenseVoucher[]>(() => {
    return vouchersList || PRESET_WORKSHOP_VOUCHERS;
  });
  const [newVoucherType, setNewVoucherType] = useState<'WORKSHOP' | 'PRO' | 'SCHOOL'>('WORKSHOP');
  const [newVoucherDesc, setNewVoucherDesc] = useState('Teacher Workshop 30-Day VIP Pass');

  const [printCrestOnPdf, setPrintCrestOnPdf] = useState(true);
  const [autoSignatureOnReports, setAutoSignatureOnReports] = useState(true);
  const [saveNotice, setSaveNotice] = useState(false);
  
  // Revision modal state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNoteInput, setRevisionNoteInput] = useState("");

  // QR / Code Modal
  const [showSchoolCodeModal, setShowSchoolCodeModal] = useState(false);

  const selectedSubmission = submissions.find(s => s.id === selectedSubmissionId) || submissions[0];

  // Actions for Headteacher
  const handleApproveClass = (id: string) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: "approved" as SubmissionStatus,
          approvedAt: new Date().toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return s;
    }));
  };

  const handleOpenRevisionModal = (id: string) => {
    setSelectedSubmissionId(id);
    setRevisionNoteInput(selectedSubmission.revisionNotes || "");
    setIsRevisionModalOpen(true);
  };

  const handleConfirmRevision = () => {
    if (!revisionNoteInput.trim()) {
      alert("Please provide revision feedback notes for the teacher.");
      return;
    }
    setSubmissions(prev => prev.map(s => {
      if (s.id === selectedSubmissionId) {
        return {
          ...s,
          status: "revision_requested" as SubmissionStatus,
          revisionNotes: revisionNoteInput
        };
      }
      return s;
    }));
    setIsRevisionModalOpen(false);
  };

  const handleTeacherAction = (id: string, action: "approved" | "rejected") => {
    setPendingTeachers(prev => prev.map(t => t.id === id ? { ...t, status: action } : t));
  };

  const handleSaveSettings = () => {
    if (onUpdateSchoolProfile) {
      onUpdateSchoolProfile(currentSchool);
    }
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const handleGenerateVoucher = () => {
    const code = generateVoucherCode(newVoucherType);
    let planType: LicenseVoucher['planType'] = 'Workshop VIP Pass';
    if (newVoucherType === 'PRO') planType = 'Teacher Pro';
    if (newVoucherType === 'SCHOOL') planType = 'School License';

    const newV: LicenseVoucher = {
      code,
      planType,
      description: newVoucherDesc || `${planType} Voucher`,
      createdAt: new Date().toISOString().split('T')[0],
      isUsed: false,
      durationDays: newVoucherType === 'WORKSHOP' ? 30 : newVoucherType === 'PRO' ? 365 : 120,
      smsBonus: newVoucherType === 'WORKSHOP' ? 200 : newVoucherType === 'PRO' ? 500 : 1000,
    };

    setLocalVouchers((prev) => [newV, ...prev]);
    if (onAddVoucher) onAddVoucher(newV);
    alert(`Generated New Voucher Code: ${code}`);
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case "approved":
        return (
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved & Signed</span>
          </span>
        );
      case "submitted":
        return (
          <span className="text-[10px] font-black text-blue-800 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Pending Review</span>
          </span>
        );
      case "revision_requested":
        return (
          <span className="text-[10px] font-black text-amber-800 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Revision Sent</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800">
            Not Started
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* ── COMPACT MOBILE TOP HEADER (MOBILE ONLY, HIDDEN ON DESKTOP) ── */}
      <header className="md:hidden flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            id="btn_mob_back_headteacher"
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 shrink-0"
            title="Return to teacher command center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
              {currentSchool.logoUrl ? (
                <img src={currentSchool.logoUrl} alt="Crest" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                {currentSchool.name}
              </h1>
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                Headteacher Portal
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSchoolCodeModal(true)}
          className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-[10px] font-mono font-extrabold shrink-0"
        >
          {currentSchool.code}
        </button>
      </header>

      {/* ── DESKTOP LEFT SIDEBAR NAVIGATION (DESKTOP ONLY, HIDDEN ON MOBILE) ── */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 flex-col justify-between shadow-sm sticky top-0 md:h-screen z-20">
        
        <div>
          {/* Header Branding */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <button 
                id="btn_back_headteacher_panel"
                onClick={onBack}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
                title="Return to teacher command center"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                  {currentSchool.logoUrl ? (
                    <img src={currentSchool.logoUrl} alt="Crest" className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {currentSchool.name}
                  </h1>
                  <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                    Headteacher Portal
                  </span>
                </div>
              </div>
            </div>

            {/* School Code Quick Button */}
            <button
              id="btn_school_qr_code"
              onClick={() => setShowSchoolCodeModal(true)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px] truncate">{currentSchool.code}</span>
              </div>
              <Share2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition shrink-0" />
            </button>
          </div>

          {/* Sidebar Navigation Links */}
          <div className="p-3 space-y-5">
            {/* Section 1: Academic Oversight */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                ACADEMIC OVERSIGHT
              </div>

              <button
                id="tab_head_matrix"
                onClick={() => setActiveTab("matrix")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === "matrix"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Submission Matrix</span>
              </button>

              <button
                id="tab_head_broadsheet"
                onClick={() => setActiveTab("broadsheet")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === "broadsheet"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Class Broadsheet</span>
              </button>
            </div>

            {/* Section 2: School Administration */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                ADMINISTRATION
              </div>

              <button
                id="tab_head_teachers"
                onClick={() => setActiveTab("teachers")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === "teachers"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">Staff Directory</span>
                </div>
                {pendingTeachers.filter(t => t.status === "pending").length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shrink-0">
                    {pendingTeachers.filter(t => t.status === "pending").length}
                  </span>
                )}
              </button>

              <button
                id="tab_head_remarks"
                onClick={() => setActiveTab("remarks")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === "remarks"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Preset Remarks</span>
              </button>
            </div>

            {/* Section 3: Identity & School Settings */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                SETTINGS & LOGO
              </div>

              <button
                id="tab_head_settings"
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === "settings"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span>School & Logo Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Print Broadsheet & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            id="btn_print_broadsheet"
            onClick={() => window.print()}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Broadsheet</span>
          </button>

          <button
            type="button"
            id="btn_head_logout_sidebar"
            onClick={() => {
              if (onLogout) onLogout();
              else onBack();
            }}
            className="w-full py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-rose-200 dark:border-rose-900"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] justify-center pt-1 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Admin Portal Connected</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
        
        {/* TAB 1: CLASS SUBMISSION MATRIX */}
        {activeTab === "matrix" && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Overview Metric Bento Cards (Day Mode & Dark Mode Compatible) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Classes */}
              <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 rounded-2xl shadow-sm hover:shadow-md border border-emerald-200/90 dark:border-emerald-500/30 relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Total Classes</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white block">6 Classes</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">{currentSchool.totalStudents} Enrolled Students</span>
                </div>
              </div>

              {/* Card 2: Submissions Pending */}
              <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 rounded-2xl shadow-sm hover:shadow-md border border-blue-200/90 dark:border-blue-500/30 relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Submissions Pending</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400 block">
                    {submissions.filter(s => s.status === "submitted").length} Classes
                  </span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold block">Awaiting Head Verification</span>
                </div>
              </div>

              {/* Card 3: Approved & Locked */}
              <div className="bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 rounded-2xl shadow-sm hover:shadow-md border border-teal-200/90 dark:border-teal-500/30 relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Approved & Locked</span>
                  <div className="p-2 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black font-mono text-teal-600 dark:text-teal-400 block">
                    {submissions.filter(s => s.status === "approved").length} Classes
                  </span>
                  <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold block">Digitally Signed Reports</span>
                </div>
              </div>

              {/* Card 4: Revisions Needed */}
              <div className="bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 rounded-2xl shadow-sm hover:shadow-md border border-amber-200/90 dark:border-amber-500/30 relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Revisions Needed</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400 block">
                    {submissions.filter(s => s.status === "revision_requested").length} Classes
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block">Feedback Notes Sent</span>
                </div>
              </div>
            </div>

            {/* ── FINANCIAL COLLECTIONS & TEACHER HAND-OVER TRACKING DECK ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>Teacher Financial Collections & Revenue Ledger</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Track daily canteen fees, PTA dues & school fee receipts submitted by class teachers.
                  </p>
                </div>
                <span className="chip-emerald hidden sm:inline-flex">Live Cash Audit</span>
              </div>

              {/* 3 Financial Collection Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Collection Card 1: Daily Canteen Payments */}
                <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 rounded-2xl shadow-xs hover:shadow-md border border-amber-200/90 dark:border-amber-500/30 relative overflow-hidden group transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Daily Canteen Payments</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <Utensils className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <span className="text-xl sm:text-2xl font-black font-mono text-amber-700 dark:text-amber-400 block">
                      GH₵ {totalCanteenToday.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" />
                      <span>Today's Lunch Allowance Hand-Over</span>
                    </span>
                  </div>
                </div>

                {/* Collection Card 2: PTA Dues & Contributions */}
                <div className="bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 rounded-2xl shadow-xs hover:shadow-md border border-blue-200/90 dark:border-blue-500/30 relative overflow-hidden group transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">PTA Dues & Levies</span>
                    <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <span className="text-xl sm:text-2xl font-black font-mono text-blue-700 dark:text-blue-400 block">
                      GH₵ {totalPtaTerm.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-blue-800 dark:text-blue-300 font-bold block flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      <span>Parent-Teacher Association Fund</span>
                    </span>
                  </div>
                </div>

                {/* Collection Card 3: School Fees Revenue */}
                <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 rounded-2xl shadow-xs hover:shadow-md border border-emerald-200/90 dark:border-emerald-500/30 relative overflow-hidden group transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">School Fees Revenue</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 block">
                      GH₵ {totalFeesTerm.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Total Revenue Receipts Verified</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Class Teacher Cash Hand-Over Audit Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Teacher Cash Hand-Over & Collection Verification</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {teacherCollections.filter(c => c.status === "pending").length} Pending Hand-Overs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="p-2.5">Class Teacher</th>
                        <th className="p-2.5">Class</th>
                        <th className="p-2.5">Canteen</th>
                        <th className="p-2.5">PTA Dues</th>
                        <th className="p-2.5">School Fees</th>
                        <th className="p-2.5">Total Cash</th>
                        <th className="p-2.5">Receipt Ref</th>
                        <th className="p-2.5 text-right">Head Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {teacherCollections.map((col) => {
                        const totalCash = col.canteenAmount + col.ptaAmount + col.schoolFeesAmount;
                        const isVerified = col.status === "verified";

                        return (
                          <tr key={col.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">{col.teacherName}</td>
                            <td className="p-2.5 font-bold text-slate-600 dark:text-slate-300">{col.className}</td>
                            <td className="p-2.5 font-mono text-amber-700 dark:text-amber-400 font-bold">GH₵ {col.canteenAmount.toFixed(2)}</td>
                            <td className="p-2.5 font-mono text-blue-700 dark:text-blue-400 font-bold">GH₵ {col.ptaAmount.toFixed(2)}</td>
                            <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400 font-bold">GH₵ {col.schoolFeesAmount.toFixed(2)}</td>
                            <td className="p-2.5 font-mono text-slate-900 dark:text-white font-black">GH₵ {totalCash.toFixed(2)}</td>
                            <td className="p-2.5 font-mono text-[10px] text-slate-400">{col.receiptRef}</td>
                            <td className="p-2.5 text-right">
                              {isVerified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-700">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Received & Verified</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  id={`btn_verify_col_${col.id}`}
                                  onClick={() => handleVerifyCollection(col.id)}
                                  className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-[10px] font-bold rounded-xl shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Confirm & Receive Cash</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Submission Matrix Grid */}
            <div className="glass-card dark:glass-dark rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>Academic Term Class Progress Board</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Click any submitted class to open its broadsheet and perform headteacher verification & digital locking.
                  </p>
                </div>
                <span className="chip-emerald self-start sm:self-auto">{submissions.length} Active Classes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {submissions.map((sub) => {
                  const progressPct = Math.round((sub.completedReportsCount / sub.totalStudents) * 100);
                  const isApproved = sub.status === "approved";
                  const isSubmitted = sub.status === "submitted";
                  const isRevision = sub.status === "revision_requested";

                  return (
                    <div
                      key={sub.id}
                      className="p-4.5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden card-hover"
                    >
                      {/* Status Accent Line */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1" 
                        style={{
                          background: isApproved ? 'linear-gradient(90deg,#10b981,#34d399)' :
                                      isSubmitted ? 'linear-gradient(90deg,#3b6ff5,#60a5fa)' :
                                      isRevision ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' :
                                      'linear-gradient(90deg,#94a3b8,#cbd5e1)'
                        }} 
                      />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{sub.className}</h4>
                          {getStatusBadge(sub.status)}
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50/80 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium">Assigned Teacher:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{sub.teacherName}</span>
                          </p>
                          <p className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium">Completion:</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{sub.completedReportsCount} / {sub.totalStudents} ({progressPct}%)</span>
                          </p>
                          {sub.submittedAt && (
                            <p className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-0.5 border-t border-slate-200/50 dark:border-slate-800">
                              <span>Submitted:</span>
                              <span>{sub.submittedAt}</span>
                            </p>
                          )}
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                            <div 
                              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs" 
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        {sub.revisionNotes && (
                          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[10px] text-amber-800 dark:text-amber-300 space-y-0.5">
                            <span className="font-bold uppercase tracking-wider block text-amber-700 dark:text-amber-400">Headteacher Note:</span>
                            <p className="line-clamp-2 leading-relaxed">{sub.revisionNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          id={`btn_review_class_${sub.id}`}
                          onClick={() => {
                            setSelectedSubmissionId(sub.id);
                            setActiveTab("broadsheet");
                          }}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                          <span>View Broadsheet</span>
                        </button>

                        {sub.status === "submitted" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              id={`btn_quick_approve_${sub.id}`}
                              onClick={() => handleApproveClass(sub.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1 cursor-pointer"
                              title="Approve & Lock Reports"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              id={`btn_quick_revision_${sub.id}`}
                              onClick={() => handleOpenRevisionModal(sub.id)}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1 cursor-pointer"
                              title="Return for Revision"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CLASS REVIEW & BROADSHEET VERIFICATION */}
        {activeTab === "broadsheet" && (
          <div className="space-y-6">
            
            {/* Header & Verification Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase">
                    Class Broadsheet: {selectedSubmission.className}
                  </h3>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
                <p className="text-[11px] text-slate-400">
                  Teacher: <strong>{selectedSubmission.teacherName}</strong> • Term Consolidated Marks
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {selectedSubmission.status !== "approved" ? (
                  <>
                    <button
                      type="button"
                      id="btn_broadsheet_approve"
                      onClick={() => handleApproveClass(selectedSubmission.id)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Approve & Append Stamp</span>
                    </button>

                    <button
                      type="button"
                      id="btn_broadsheet_revision"
                      onClick={() => handleOpenRevisionModal(selectedSubmission.id)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return with Notes</span>
                    </button>
                  </>
                ) : (
                  <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Locked & Digitally Signed by {currentSchool.headteacherName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Broadsheet Table Sheet */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 printable-sheet">
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1">
                <h2 className="text-base font-black uppercase text-slate-900 dark:text-white">
                  {currentSchool.name} - OFFICIAL BROADSHEET
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  {selectedSubmission.className} • {currentSchool.academicTerm}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-2">Candidate ID</th>
                      <th className="py-3 px-2">Student Name</th>
                      <th className="py-3 px-2 text-center">OMR (50%)</th>
                      <th className="py-3 px-2 text-center">Classwork (30%)</th>
                      <th className="py-3 px-2 text-center">Attendance (20%)</th>
                      <th className="py-3 px-2 text-center">Total Score</th>
                      <th className="py-3 px-2 text-center">GES Grade</th>
                      <th className="py-3 px-2">Headmaster Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { id: "STUD_001", name: "John Doe", omr: 42, ca: 26, att: 19, total: 87, grade: "A1", remark: "Outstanding performance!" },
                      { id: "STUD_002", name: "Alice Johnson", omr: 46, ca: 28, att: 20, total: 94, grade: "A1", remark: "Exemplary standard." },
                      { id: "STUD_003", name: "Michael Ampofo", omr: 32, ca: 22, att: 18, total: 72, grade: "B3", remark: "Good academic standing." },
                      { id: "STUD_004", name: "Grace Mensah", omr: 28, ca: 20, att: 16, total: 64, grade: "C4", remark: "Satisfactory, keep striving." },
                      { id: "STUD_005", name: "David Osei", omr: 22, ca: 16, att: 14, total: 52, grade: "C6", remark: "Passable. Consistent revision needed." },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-3 px-2 font-mono font-bold text-slate-500">{row.id}</td>
                        <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{row.name}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.omr}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.ca}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.att}</td>
                        <td className="py-3 px-2 text-center font-mono font-black text-slate-900 dark:text-white">{row.total}%</td>
                        <td className="py-3 px-2 text-center">
                          <span className="px-2 py-0.5 rounded font-black font-mono text-[10px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                            {row.grade}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-300 font-medium italic">{row.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedSubmission.status === "approved" && (
                <div className="pt-8 mt-6 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-end">
                  <div className="text-center space-y-1">
                    <div className="border-b-2 border-slate-900 dark:border-white pb-1 font-mono font-black text-xs text-emerald-600">
                      [DIGITALLY SIGNED: {currentSchool.headteacherName}]
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Headteacher Official Approval Stamp</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: PRESET REMARKS MANAGER */}
        {activeTab === "remarks" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Headteacher Standardized Preset Remarks Library</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure standardized comments per grade tier. Linked teachers can automatically select these templates when drafting terminal report cards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presetRemarks.map((rem) => (
                <div key={rem.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-200">
                      Grade Tier {rem.gradeTier}
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`Edit preset remark template for Tier ${rem.gradeTier}`)}
                      className="text-xs text-slate-400 hover:text-emerald-600 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Headteacher Remarks:</p>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold italic">"{rem.headComment}"</p>
                  </div>

                  <div className="space-y-1 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Teacher Recommendation Template:</p>
                    <p className="text-slate-600 dark:text-slate-400">{rem.teacherCommentTemplate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STAFF DIRECTORY & ACCESS MANAGEMENT */}
        {activeTab === "teachers" && (
          <div className="space-y-6">
            
            {/* Pending Requests Section */}
            {pendingTeachers.filter(t => t.status === "pending").length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    Pending Teacher School Connection Requests ({pendingTeachers.filter(t => t.status === "pending").length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {pendingTeachers.filter(t => t.status === "pending").map((req) => (
                    <div key={req.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{req.teacherName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{req.email} • Requested {req.assignedClass} ({req.subject})</p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          id={`btn_approve_teacher_${req.id}`}
                          onClick={() => handleTeacherAction(req.id, "approved")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Access</span>
                        </button>

                        <button
                          type="button"
                          id={`btn_reject_teacher_${req.id}`}
                          onClick={() => handleTeacherAction(req.id, "rejected")}
                          className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Roster */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Staff & Teacher Roster Management
                  </h3>
                  <p className="text-[11px] text-slate-400">Manage teacher class assignments and authorization permissions</p>
                </div>

                <button
                  type="button"
                  id="btn_add_teacher_manual"
                  onClick={() => setShowSchoolCodeModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Invite Teacher</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-2">Staff Member</th>
                      <th className="py-3 px-2">Assigned Class</th>
                      <th className="py-3 px-2">Subject Specialty</th>
                      <th className="py-3 px-2 text-center">Connection Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{s.teacherName}</td>
                        <td className="py-3 px-2 font-mono font-semibold text-emerald-600">{s.className}</td>
                        <td className="py-3 px-2 text-slate-500">Core Curriculum & OMR Marker</td>
                        <td className="py-3 px-2 text-center">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Active & Verified
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => alert(`Manage settings for ${s.teacherName}`)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: SCHOOL & LOGO SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-4 sm:space-y-6 max-w-4xl animate-fadeIn">
            {/* Header / Intro Card */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/50 border border-emerald-500/30 text-emerald-200 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-300 shrink-0" /> <span>Institutional Administration & Branding</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold">School Identity & Headteacher Authorization</h2>
                <p className="text-emerald-100 text-xs mt-1 leading-relaxed">
                  Configure official school logo, crest, headteacher digital signatures, and PDF report branding.
                </p>
              </div>

              {saveNotice && (
                <div className="bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow animate-bounce flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings Saved!</span>
                </div>
              )}
            </div>

            {/* HEADTEACHER SCHOOL REFERRAL & POINTS REDEMPTION CENTER */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                      <span>Headteacher School Referral Program</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-black uppercase">
                        +40 PTS / SCHOOL
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Refer a partner school or Headteacher. You earn <strong>+40 Points</strong> and the second school gets <strong>+20 Bonus Points</strong>!
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center shrink-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">School Points Balance</div>
                  <div className="text-xl font-black text-amber-300">{userProfile?.rewardPoints || 0} Pts</div>
                </div>
              </div>

              {headRedeemFeedback && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                  headRedeemFeedback.success ? 'bg-emerald-900/90 text-emerald-100 border border-emerald-500' : 'bg-rose-900/90 text-rose-100 border border-rose-500'
                }`}>
                  <span>{headRedeemFeedback.message}</span>
                  <button type="button" onClick={() => setHeadRedeemFeedback(null)} className="text-white hover:text-slate-300">✕</button>
                </div>
              )}

              {/* School Referral Link & Code Box */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Your School Referral Code</span>
                    <span className="text-sm font-mono font-black text-amber-300 bg-amber-950/60 border border-amber-600/40 px-3 py-1 rounded-xl inline-block">
                      {headReferralCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyHeadLink}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-600 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedHeadLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedHeadLink ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareHeadteacherWhatsApp}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Share on WhatsApp (+40 Pts)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800">
                  <div className="bg-slate-800/60 p-2.5 rounded-xl">
                    <span className="font-bold text-emerald-400 block mb-0.5">1. Share School Link</span>
                    <span className="text-slate-400">Send code or link to Headteachers & School Directors.</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-xl">
                    <span className="font-bold text-emerald-400 block mb-0.5">2. Second School Gets +20 Pts</span>
                    <span className="text-slate-400">Referred school receives 20 Bonus Points immediately upon signup.</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-xl">
                    <span className="font-bold text-amber-300 block mb-0.5">3. You Get +40 Points</span>
                    <span className="text-slate-400">Your Headteacher account is credited with 40 Points instantly.</span>
                  </div>
                </div>
              </div>

              {/* Direct Point Redemption Options for Headteachers - 4 School License Plans */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Redeem School Points for Institutional Licenses</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Weekly School License */}
                  <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-cyan-400">Weekly School Plan</span>
                        <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded-full font-mono text-[9px] font-bold">7 Days</span>
                      </div>
                      <div className="text-base font-black text-amber-300 mt-1">150 Points</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Short-term exam crunch & broadsheet evaluation.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleHeadteacherRedeem('school_weekly')}
                      disabled={(userProfile?.rewardPoints || 0) < 150}
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      Redeem 150 Pts
                    </button>
                  </div>

                  {/* Monthly School License */}
                  <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-indigo-400">Monthly School Plan</span>
                        <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded-full font-mono text-[9px] font-bold">1 Month</span>
                      </div>
                      <div className="text-base font-black text-amber-300 mt-1">500 Points</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Flexible month-to-month institutional license.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleHeadteacherRedeem('school_monthly')}
                      disabled={(userProfile?.rewardPoints || 0) < 500}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      Redeem 500 Pts
                    </button>
                  </div>

                  {/* Term School License */}
                  <div className="bg-slate-900/90 border-2 border-emerald-500/80 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between relative overflow-hidden">
                    <div className="bg-emerald-600 text-white text-[8px] font-extrabold uppercase text-center py-0.5 absolute top-0 left-0 right-0">
                      Most Popular Term License
                    </div>
                    <div className="pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-emerald-400">Quarterly / Term Plan</span>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded-full font-mono text-[9px] font-bold">1 Term</span>
                      </div>
                      <div className="text-base font-black text-amber-300 mt-1">1000 Points</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Full term broadsheet & collections sync.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleHeadteacherRedeem('school_term')}
                      disabled={(userProfile?.rewardPoints || 0) < 1000}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      Redeem 1000 Pts
                    </button>
                  </div>

                  {/* Annual / Yearly School License */}
                  <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-amber-400">Annual / Yearly Plan</span>
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded-full font-mono text-[9px] font-bold">1 Year</span>
                      </div>
                      <div className="text-base font-black text-amber-300 mt-1">2000 Points</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Full 12-month unlimited school access.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleHeadteacherRedeem('school_year')}
                      disabled={(userProfile?.rewardPoints || 0) < 2000}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      Redeem 2000 Pts
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section 0: Subscription Plan & Dark Mode Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institutional Subscription Plan Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span>School Subscription</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs shrink-0">
                      {userProfile?.activeSubscriptionPlan || 'School License'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black mt-2">Institutional B2B Plan & Billing</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Full access to Centralized Collections Hub, Multi-Teacher Score Sync, Textbook & Asset Inventory, and custom school crest branding.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="text-xs text-slate-400">
                    Reward Points: <strong className="text-amber-300">{userProfile?.rewardPoints || 0} Pts</strong>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenSubscriptionModal}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Manage Plans & Billing</span>
                  </button>
                </div>
              </div>

              {/* Dark Mode Setting Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>App Appearance & Theme</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-2">Dark Mode</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Switch interface between light and sleek dark mode for comfortable night-time report approval and low-light environments.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Theme: <span className="text-indigo-600 dark:text-indigo-400 uppercase font-mono">{isDarkMode ? 'Dark Active' : 'Light Active'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleDarkMode) onToggleDarkMode();
                      else {
                        const isDark = document.documentElement.classList.toggle('dark');
                        localStorage.setItem('omr_dark_mode', String(isDark));
                      }
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                      isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                    aria-label="Toggle Dark Mode"
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Section 1: School Identity & Logo */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1. School Profile & Crest Logo</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Official School Name
                  </label>
                  <input
                    type="text"
                    value={currentSchool.name}
                    onChange={(e) => setCurrentSchool(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    School ID Code (Link Code)
                  </label>
                  <input
                    type="text"
                    value={currentSchool.code}
                    onChange={(e) => setCurrentSchool(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Region / District
                  </label>
                  <input
                    type="text"
                    value={currentSchool.region}
                    onChange={(e) => setCurrentSchool(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Postal Address
                  </label>
                  <input
                    type="text"
                    value={currentSchool.address}
                    onChange={(e) => setCurrentSchool(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    School Motto / Tagline
                  </label>
                  <input
                    type="text"
                    value={currentSchool.motto}
                    onChange={(e) => setCurrentSchool(prev => ({ ...prev, motto: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Logo Upload / URL */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    School Logo Crest Image URL
                  </label>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {currentSchool.logoUrl ? (
                        <img src={currentSchool.logoUrl} alt="Crest" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Paste Image URL or data URL for official crest logo"
                      value={currentSchool.logoUrl || ''}
                      onChange={(e) => setCurrentSchool(prev => ({ ...prev, logoUrl: e.target.value }))}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none min-w-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section 2: Headteacher Details & Signature */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>2. Headteacher Authorization & Digital Signature</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Headteacher Full Name & Title
                  </label>
                  <input
                    type="text"
                    value={currentSchool.headteacherName}
                    onChange={(e) => setCurrentSchool(prev => ({ ...prev, headteacherName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Active Academic Term
                  </label>
                  <input
                    type="text"
                    value={currentSchool.academicTerm}
                    onChange={(e) => setCurrentSchool(prev => ({ ...prev, academicTerm: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Digital Headteacher Signature Preview
                  </label>
                  <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                      <div className="w-full sm:w-44 h-14 border border-dashed border-emerald-400 dark:border-emerald-700 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 font-serif italic text-base text-emerald-800 dark:text-emerald-300 shadow-inner px-3 shrink-0">
                        {currentSchool.headteacherName || "Headteacher Signature"}
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Digital Verification Active</span>
                        <span className="text-[10px]">Appears on all approved student terminal reports</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section 3: Branding Toggles & Save Button */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Printer className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3. PDF Report & Branding Preferences</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printCrestOnPdf}
                    onChange={(e) => setPrintCrestOnPdf(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 shrink-0"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">
                    Display Official School Crest on PDF Terminal Reports & Exam Papers
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSignatureOnReports}
                    onChange={(e) => setAutoSignatureOnReports(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 shrink-0"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">
                    Auto-append Headteacher Digital Signature to Approved Class Broadsheets & Reports
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="w-full sm:w-auto py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save School & Logo Settings</span>
                </button>
              </div>
            </div>

            {/* Form Section 4: Logout Headteacher Session */}
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                <span>4. Exit / Logout Headteacher Session</span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-400">
                End active administrator session and return to the main sign in screen.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  else onBack();
                }}
                className="w-full sm:w-auto py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Headteacher</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* REVISION FEEDBACK MODAL */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Return Reports for Revision</span>
              </h3>
              <button 
                onClick={() => setIsRevisionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide feedback for <strong>{selectedSubmission.teacherName}</strong> ({selectedSubmission.className}). The teacher will be notified to revise these items.
            </p>

            <textarea
              rows={4}
              value={revisionNoteInput}
              onChange={(e) => setRevisionNoteInput(e.target.value)}
              placeholder="e.g. Please re-check Mathematics score for Candidate B and update attendance record."
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-emerald-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevision}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow"
              >
                Send Revision Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHOOL LINK CODE MODAL */}
      {showSchoolCodeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5 text-center shadow-xl relative">
            <button 
              onClick={() => setShowSchoolCodeModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">{currentSchool.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Share this unique code or QR with subject teachers to link their workspace</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Official School ID Code</span>
              <span className="text-xl font-black font-mono tracking-widest text-emerald-600 block select-all">
                {currentSchool.code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(currentSchool.code);
                alert("School ID Code copied to clipboard!");
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Link Code</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAVIGATION BAR (MATCHING TEACHER NAV STYLE) ── */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <button
            type="button"
            id="btn_mob_nav_matrix"
            onClick={() => setActiveTab("matrix")}
            className={`nav-tab ${activeTab === "matrix" ? 'active' : 'inactive'}`}
          >
            {activeTab === "matrix" && <div className="nav-tab-dot" />}
            <Building2 className="w-5 h-5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            id="btn_mob_nav_broadsheet"
            onClick={() => setActiveTab("broadsheet")}
            className={`nav-tab ${activeTab === "broadsheet" ? 'active' : 'inactive'}`}
          >
            {activeTab === "broadsheet" && <div className="nav-tab-dot" />}
            <FileText className="w-5 h-5" />
            <span>Broadsheet</span>
          </button>

          <button
            type="button"
            id="btn_mob_nav_teachers"
            onClick={() => setActiveTab("teachers")}
            className={`nav-tab ${activeTab === "teachers" ? 'active' : 'inactive'} relative`}
          >
            {activeTab === "teachers" && <div className="nav-tab-dot" />}
            <Users className="w-5 h-5" />
            <span>Staff</span>
            {pendingTeachers.filter(t => t.status === "pending").length > 0 && (
              <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                {pendingTeachers.filter(t => t.status === "pending").length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="btn_mob_nav_remarks"
            onClick={() => setActiveTab("remarks")}
            className={`nav-tab ${activeTab === "remarks" ? 'active' : 'inactive'}`}
          >
            {activeTab === "remarks" && <div className="nav-tab-dot" />}
            <Sparkles className="w-5 h-5" />
            <span>Remarks</span>
          </button>

          <button
            type="button"
            id="btn_mob_nav_settings"
            onClick={() => setActiveTab("settings")}
            className={`nav-tab ${activeTab === "settings" ? 'active' : 'inactive'}`}
          >
            {activeTab === "settings" && <div className="nav-tab-dot" />}
            <Sliders className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
