import React, { useState } from 'react';
import { 
  Building2, Users, CheckCircle2, AlertCircle, Clock, FileText, 
  Search, Check, X, ShieldCheck, Lock, RotateCcw, Edit3, MessageSquare, 
  ArrowLeft, ArrowRight, Printer, Sparkles, UserCheck, Plus, Sliders, QrCode, Share2
} from 'lucide-react';
import { 
  SchoolProfile, ClassSubmission, SubmissionStatus, TeacherJoinRequest, PresetRemark, GradedResult 
} from '../types';

interface HeadteacherPanelProps {
  onBack: () => void;
  resultsList?: GradedResult[];
  schoolProfile?: SchoolProfile | null;
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

export function HeadteacherPanel({ 
  onBack, 
  resultsList = [],
  schoolProfile = null 
}: HeadteacherPanelProps) {
  const [activeTab, setActiveTab] = useState<"matrix" | "broadsheet" | "remarks" | "teachers">("matrix");
  const [submissions, setSubmissions] = useState<ClassSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("sub_jhs2");
  const [pendingTeachers, setPendingTeachers] = useState<TeacherJoinRequest[]>(INITIAL_PENDING_TEACHERS);
  const [presetRemarks, setPresetRemarks] = useState<PresetRemark[]>(INITIAL_PRESET_REMARKS);
  
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
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 pb-16">
      
      {/* Upper Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              id="btn_back_headteacher_panel"
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-350"
              title="Return to teacher command center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {INITIAL_SCHOOL_PROFILE.name}
                  </h1>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {INITIAL_SCHOOL_PROFILE.headteacherName} • {INITIAL_SCHOOL_PROFILE.academicTerm}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              id="btn_school_qr_code"
              onClick={() => setShowSchoolCodeModal(true)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">School Link Code</span>
            </button>

            <button
              id="btn_print_broadsheet"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Broadsheet</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            id="tab_head_matrix"
            onClick={() => setActiveTab("matrix")}
            className={`py-3 px-4 text-xs font-extrabold uppercase border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === "matrix"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Class Submission Matrix</span>
          </button>

          <button
            id="tab_head_broadsheet"
            onClick={() => setActiveTab("broadsheet")}
            className={`py-3 px-4 text-xs font-extrabold uppercase border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === "broadsheet"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Class Review & Broadsheet</span>
          </button>

          <button
            id="tab_head_remarks"
            onClick={() => setActiveTab("remarks")}
            className={`py-3 px-4 text-xs font-extrabold uppercase border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === "remarks"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Preset Remarks Manager</span>
          </button>

          <button
            id="tab_head_teachers"
            onClick={() => setActiveTab("teachers")}
            className={`py-3 px-4 text-xs font-extrabold uppercase border-b-2 transition flex items-center gap-2 shrink-0 relative ${
              activeTab === "teachers"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory & Access</span>
            {pendingTeachers.filter(t => t.status === "pending").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: CLASS SUBMISSION MATRIX */}
        {activeTab === "matrix" && (
          <div className="space-y-6">
            
            {/* Overview Metric Bento Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Classes</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white">6 Classes</span>
                <span className="text-[9px] text-slate-400 font-bold block">{INITIAL_SCHOOL_PROFILE.totalStudents} Enrolled</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Submissions Pending</span>
                <span className="text-xl font-black font-mono text-blue-600">
                  {submissions.filter(s => s.status === "submitted").length} Classes
                </span>
                <span className="text-[9px] text-blue-600 font-bold block">Awaiting Head Review</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Approved & Locked</span>
                <span className="text-xl font-black font-mono text-emerald-600">
                  {submissions.filter(s => s.status === "approved").length} Classes
                </span>
                <span className="text-[9px] text-emerald-600 font-bold block">Digital Signature Appended</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Revisions Requested</span>
                <span className="text-xl font-black font-mono text-amber-600">
                  {submissions.filter(s => s.status === "revision_requested").length} Classes
                </span>
                <span className="text-[9px] text-amber-600 font-bold block">Notes Sent to Teacher</span>
              </div>
            </div>

            {/* Submission Matrix Grid */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Academic Term Class Progress Board
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click any submitted class to open its broadsheet and perform headteacher verification.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3 hover:border-emerald-500 transition duration-150 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{sub.className}</span>
                        {getStatusBadge(sub.status)}
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <p><strong className="text-slate-700 dark:text-slate-300">Teacher:</strong> {sub.teacherName}</p>
                        <p><strong className="text-slate-700 dark:text-slate-300">Progress:</strong> {sub.completedReportsCount} / {sub.totalStudents} Student Reports ({Math.round((sub.completedReportsCount / sub.totalStudents) * 100)}%)</p>
                        {sub.submittedAt && <p className="text-[10px] text-slate-400 font-mono">Submitted: {sub.submittedAt}</p>}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300" 
                          style={{ width: `${(sub.completedReportsCount / sub.totalStudents) * 100}%` }}
                        />
                      </div>

                      {sub.revisionNotes && (
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-[10px] text-amber-800 dark:text-amber-300 space-y-0.5">
                          <span className="font-bold uppercase tracking-wider block">Headteacher Revision Note:</span>
                          <p className="line-clamp-2">{sub.revisionNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        id={`btn_review_class_${sub.id}`}
                        onClick={() => {
                          setSelectedSubmissionId(sub.id);
                          setActiveTab("broadsheet");
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-lg hover:border-emerald-500 transition flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Broadsheet</span>
                      </button>

                      {sub.status === "submitted" && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            id={`btn_quick_approve_${sub.id}`}
                            onClick={() => handleApproveClass(sub.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Approve & Lock Reports"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            id={`btn_quick_revision_${sub.id}`}
                            onClick={() => handleOpenRevisionModal(sub.id)}
                            className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Return for Revision"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: CLASS REVIEW & BROADSHEET VERIFICATION */}
        {activeTab === "broadsheet" && (
          <div className="space-y-6">
            
            {/* Header & Verification Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                    Class Broadsheet: {selectedSubmission.className}
                  </h3>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
                <p className="text-[11px] text-slate-400">
                  Teacher: <strong>{selectedSubmission.teacherName}</strong> • Term Consolidated Marks
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedSubmission.status !== "approved" ? (
                  <>
                    <button
                      type="button"
                      id="btn_broadsheet_approve"
                      onClick={() => handleApproveClass(selectedSubmission.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Approve & Append Headteacher Stamp</span>
                    </button>

                    <button
                      type="button"
                      id="btn_broadsheet_revision"
                      onClick={() => handleOpenRevisionModal(selectedSubmission.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return with Revision Notes</span>
                    </button>
                  </>
                ) : (
                  <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Locked & Digitally Signed by {INITIAL_SCHOOL_PROFILE.headteacherName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Broadsheet Table Sheet */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 printable-sheet">
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1">
                <h2 className="text-base font-black uppercase text-slate-900 dark:text-white">
                  {INITIAL_SCHOOL_PROFILE.name} - OFFICIAL BROADSHEET
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  {selectedSubmission.className} • {INITIAL_SCHOOL_PROFILE.academicTerm}
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
                      [DIGITALLY SIGNED: {INITIAL_SCHOOL_PROFILE.headteacherName}]
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

      </div>

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
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">{INITIAL_SCHOOL_PROFILE.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Share this unique code or QR with subject teachers to link their workspace</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Official School ID Code</span>
              <span className="text-xl font-black font-mono tracking-widest text-emerald-600 block select-all">
                {INITIAL_SCHOOL_PROFILE.code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(INITIAL_SCHOOL_PROFILE.code);
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

    </div>
  );
}
