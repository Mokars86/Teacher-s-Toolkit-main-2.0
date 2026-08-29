export interface UserProfile {
  email: string;
  fullName: string;
  avatarUrl?: string;
  role?: string;
  isLoggedIn: boolean;
  isPremium: boolean;
  syncEnabled: boolean;
  offlineCount: number;
  rewardPoints: number;
  referralCode: string;
  referralCount: number;
  submittedQuestionsCount: number;
  activeSubscriptionPlan: "Free" | "Teacher Pro" | "School License" | "School License Weekly" | "School License Monthly" | "School License Term" | "School License Year";
  scansThisMonth: number;
  maxFreeScansPerMonth: number;
  smsCredits: number;
  maxFreeExamPapers?: number;
  endOfTermPassExpiry?: string | null; // ISO date string if active
  schoolLicenseExpiry?: string | null;
}

export type MobileMoneyProvider = "MTN MoMo" | "Telecel Cash" | "AT Money";

export interface PaymentTransaction {
  id: string;
  planOrItemTitle: string;
  amountGHS: number;
  provider: MobileMoneyProvider;
  phoneNumber: string;
  date: string;
  status: "completed" | "failed" | "pending";
  reference: string;
}

export interface SubscriptionPlanDetails {
  id: string;
  name: string;
  priceTag: string;
  monthlyGHS: number;
  yearlyGHS?: number;
  termGHS?: number;
  tagline: string;
  popular?: boolean;
  features: string[];
}


export interface ClassSettings {
  testName: string;
  className: string;
  totalQuestions: number;
  gradingScale: {
    A: number; // e.g. 90
    B: number; // e.g. 80
    C: number; // e.g. 70
    D: number; // e.g. 60
  };
}

export interface AnswerKey {
  id: string;
  title: string;
  className: string;
  questionsCount: number;
  answers: { [key: number]: string }; // Map of question index (1-based) to correct option (A, B, C, D)
  createdAt: string;
}

export interface QuestionConfidence {
  questionNumber: number;
  options: {
    A: number; // confidence score 0-100
    B: number;
    C: number;
    D: number;
  };
  detected: string; // "A", "B", "C", "D", or "" (Blank), or "Multiple"
  confidence: number; // 0-100
  flagged: boolean; // low confidence or multiple/blank marked
}

export interface GradedResult {
  id: string;
  candidateName: string;
  candidateId: string;
  testName: string;
  className: string;
  score: number; // questions correct
  totalQuestions: number;
  percentage: number;
  scannedAt: string;
  answers: { [key: number]: string }; // what student selected
  status: "Synced" | "Offline Pending";
  flaggedCount: number;
  answerKeyId: string;
  imageThumbnail: string; // data URL or mock OMR sheet image
}

export enum ScreenId {
  SPLASH = "SPLASH",
  ONBOARDING = "ONBOARDING",
  AUTH = "AUTH",
  DASHBOARD = "DASHBOARD",
  CAMERA_SCAN = "CAMERA_SCAN",
  CONFIRM_IMAGE = "CONFIRM_IMAGE",
  DEFINE_ANSWER_KEY = "DEFINE_ANSWER_KEY",
  ANSWER_KEY_EDITOR = "ANSWER_KEY_EDITOR",
  REVIEW_FLAGS = "REVIEW_FLAGS",
  RESULTS_SUMMARY = "RESULTS_SUMMARY",
  RESULTS_HISTORY = "RESULTS_HISTORY",
  SAVED_ANSWER_KEYS = "SAVED_ANSWER_KEYS",
  TEST_CLASS_SETTINGS = "TEST_CLASS_SETTINGS",
  PROFILE_SETTINGS = "PROFILE_SETTINGS",
  TERMINAL_REPORT = "TERMINAL_REPORT",
  ATTENDANCE_SHEET = "ATTENDANCE_SHEET",
  STUDENT_TREND_TRACKER = "STUDENT_TREND_TRACKER",
  LESSON_PLANNER = "LESSON_PLANNER",
  SEATING_CHART = "SEATING_CHART",
  HEADTEACHER_PANEL = "HEADTEACHER_PANEL",
  SUPER_ADMIN_PANEL = "SUPER_ADMIN_PANEL",
  COLLECTIONS_HUB = "COLLECTIONS_HUB",
  RESOURCE_TRACKER = "RESOURCE_TRACKER",
  EXAM_BUILDER = "EXAM_BUILDER",
  QUESTION_BANK = "QUESTION_BANK",
  WORKSHOP_CERTIFICATE = "WORKSHOP_CERTIFICATE"
}

// --- EXAM QUESTION BUILDER TYPES ---
export type QuestionType = "mcq" | "theory";

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  imageUrl?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: "A" | "B" | "C" | "D";
  marks: number;
}

export interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  className: string;
  timeAllowed: string;
  totalMarks: number;
  instructions: string;
  examType: "mcq" | "theory" | "mixed";
  questions: ExamQuestion[];
  createdAt: string;
}

// --- WAEC / BECE QUESTION BANK SCHEMA ---
export type ExamLevelType = "WASSCE" | "BECE" | "NOV_DEC";

export interface WAECQuestion {
  question_id: string;
  exam_type: ExamLevelType;
  subject: string;
  topic: string;
  year: number;
  question_text: string;
  diagram_url?: string | null;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  submitted_by?: string;
  verified?: boolean;
}


// --- SCHOOL COLLECTIONS TYPES ---
export type PaymentCategory = "school_fees" | "pta_dues" | "canteen";
export type PaymentMethod = "cash" | "momo";

export interface FeeCollectionRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  category: PaymentCategory;
  amountPaid: number;
  totalTarget: number;
  outstandingBalance: number;
  paymentMethod: PaymentMethod;
  momoReference?: string;
  note?: string;
  date: string;
  receiptNumber: string;
  guardianPhone: string;
  status: "paid" | "partial" | "unpaid";
}

// --- RESOURCE & TEXTBOOK TRACKER TYPES ---
export type ResourceCategory = "textbook" | "exercise_book" | "uniform" | "math_set" | "sports_kit";
export type AssetCondition = "New" | "Good" | "Fair" | "Damaged";

export interface InventoryItem {
  id: string;
  title: string;
  code: string;
  category: ResourceCategory;
  totalInCabinet: number;
  totalIssued: number;
}

export interface ResourceDistribution {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  itemTitle: string;
  itemCategory: ResourceCategory;
  serialNumber?: string;
  condition: AssetCondition;
  issueDate: string;
  returnDate?: string;
  isReturned: boolean;
  notes?: string;
}


export type SchoolMode = "personal" | "linked";
export type UserRole = "teacher" | "headteacher" | "superadmin";

export interface SchoolProfile {
  id: string;
  name: string;
  code: string; // e.g. "SCH-GH-8821"
  region: string; // e.g. "Greater Accra"
  address: string;
  motto: string;
  logoUrl?: string;
  headteacherName: string;
  academicTerm: string; // e.g. "Term 2, 2025/2026"
  totalStudents: number;
  totalTeachers: number;
}

export type SubmissionStatus = "not_started" | "in_progress" | "submitted" | "approved" | "revision_requested";

export interface ClassSubmission {
  id: string;
  className: string;
  teacherName: string;
  teacherId: string;
  totalStudents: number;
  completedReportsCount: number;
  status: SubmissionStatus;
  submittedAt?: string;
  approvedAt?: string;
  revisionNotes?: string;
}

export interface TeacherJoinRequest {
  id: string;
  teacherName: string;
  email: string;
  assignedClass: string;
  subject: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface PresetRemark {
  id: string;
  gradeTier: "A1" | "B2" | "B3" | "C4" | "C5" | "C6" | "D7" | "E8" | "F9";
  headComment: string;
  teacherCommentTemplate: string;
}

