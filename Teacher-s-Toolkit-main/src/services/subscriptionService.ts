import { UserProfile, MobileMoneyProvider, PaymentTransaction, SubscriptionPlanDetails } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'Free',
    name: 'Free Forever',
    priceTag: 'GH₵ 0 / month',
    monthlyGHS: 0,
    tagline: 'Essential tools for individual classroom daily tasks',
    features: [
      'Basic Class Register & Attendance Tracker',
      'Lesson Planner module',
      'Digital CBT Online Exams (Up to 2 active tests)',
      'Rapid Keypad Score Entry & Class Broadsheet',
      'Basic Terminal Report Builder (manual entry)',
    ],
  },
  {
    id: 'Teacher Pro Monthly',
    name: 'Teacher Pro (Monthly)',
    priceTag: 'GH₵ 25 / month',
    monthlyGHS: 25,
    tagline: 'Supercharge your classroom productivity and save late-night hours',
    features: [
      'Unlimited Digital CBT Online Exams & PINs',
      'Rapid Keypad Score Entry & Grade Processing',
      'Unlimited Exam Builder & 2-Column PDF Export',
      'Bulk Terminal Report PDF Bundles (One-tap class export)',
      'SMS / WhatsApp 1-Tap Parent Alerts & Receipts',
    ],
  },
  {
    id: 'Teacher Pro Term',
    name: 'Teacher Pro (Quarterly / Term)',
    priceTag: 'GH₵ 70 / term',
    monthlyGHS: 70,
    termGHS: 70,
    popular: true,
    tagline: 'Full academic term access for continuous grading, CBT exams & terminal reports',
    features: [
      'Full 3 Months (Term) Unlimited Pro Access',
      'Unlimited Digital CBT Online Exams & Live Hub',
      'Rapid Keypad Score Entry with Instant Analytics',
      'Terminal Report Cards with Automated Position Grading',
      'WhatsApp & SMS Parent Notification Alerts',
    ],
  },
  {
    id: 'Teacher Pro Year',
    name: 'Teacher Pro (Annual / Yearly)',
    priceTag: 'GH₵ 250 / year',
    monthlyGHS: 250,
    yearlyGHS: 250,
    tagline: 'Best Value! Full 12-month access with maximum savings for dedicated educators',
    features: [
      'Full 12-Month Unlimited Pro Access',
      'Unlimited Digital CBT Portals & Student Access',
      'Unlimited Exam Papers & Terminal PDF Bundles',
      'Priority WhatsApp & Customer Support',
      'Save GH₵ 50 compared to monthly billing',
    ],
  },
];

export const HEADTEACHER_SCHOOL_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'School License Weekly',
    name: 'Weekly School Plan',
    priceTag: 'GH₵ 70 / week',
    monthlyGHS: 70,
    tagline: '7-day short-term institutional license for exam crunch & quick school evaluation',
    features: [
      '7 Days full multi-teacher access & broadsheet sync',
      'Centralized Collections Hub (Fees, PTA & Canteen)',
      'School-wide Digital CBT Online Exam Hub',
      'Digital Headteacher Signature & School Crest on Reports',
      'Covers all active staff teachers during test week',
    ],
  },
  {
    id: 'School License Monthly',
    name: 'Monthly School Plan',
    priceTag: 'GH₵ 250 / month',
    monthlyGHS: 250,
    tagline: 'Flexible month-to-month institutional license for school management',
    features: [
      'Multi-Teacher Score Sync to Headteacher Portal',
      'Centralized Collections Hub (School Fees, PTA, Canteen)',
      'School-wide CBT Exams with Instant Score Aggregation',
      'Digital Headteacher Signature & Official School Crest on Reports',
      'Textbook & Asset Inventory Tracker for all classes',
    ],
  },
  {
    id: 'School License Term',
    name: 'Quarterly / Term School Plan',
    priceTag: 'GH₵ 750 / term',
    monthlyGHS: 750,
    popular: true,
    tagline: 'Complete academic term coverage for all teachers and class broadsheets',
    features: [
      'Full Academic Term coverage for all classes (Basic to SHS)',
      'Bulk Class Broadsheet PDF Export & Approval Locks',
      'Centralized Collections Hub & Automatic Parent Receipts',
      'SMS Parent Notifications & Attendance Alerts',
      'Custom School Crest Branding & Headteacher Stamp',
    ],
  },
  {
    id: 'School License Year',
    name: 'Annual / Yearly School Plan',
    priceTag: 'GH₵ 1,000 / year',
    monthlyGHS: 1000,
    yearlyGHS: 1000,
    tagline: 'Best Value! Full 12-month academic year institutional license with maximum savings',
    features: [
      'Full 12-Month Unlimited Institutional License',
      'Unlimited Teachers, Classes, Students & Digital CBT Exams',
      'Priority WhatsApp & SMS Parent Notification Gateway',
      'Dedicated School Support & Custom Broadsheet Layouts',
      'Save over GH₵ 2,000 compared to monthly billing',
    ],
  },
];

export const PAY_AS_YOU_GO_OPTIONS = [
  {
    id: 'end_of_term_pass',
    title: 'End-of-Term 2-Week Pass',
    priceTag: 'GHS 15',
    amountGHS: 15,
    description: '14 days of Unlimited Digital CBT Exams, Rapid Scoring & PDF Exports during peak exam grading crunch.',
    badge: 'Popular for Exams',
  },
];

export function isPassActive(expiryDateString?: string | null): boolean {
  if (!expiryDateString) return false;
  const expiry = new Date(expiryDateString).getTime();
  return expiry > Date.now();
}

export function hasSchoolLicense(profile?: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.role === 'superadmin') return true;
  return (
    Boolean(profile.activeSubscriptionPlan?.startsWith('School')) ||
    profile.activeSubscriptionPlan === 'School License' ||
    profile.activeSubscriptionPlan === 'School License Weekly' ||
    profile.activeSubscriptionPlan === 'School License Monthly' ||
    profile.activeSubscriptionPlan === 'School License Term' ||
    profile.activeSubscriptionPlan === 'School License Year'
  );
}

export function hasProAccess(profile?: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.role === 'superadmin') return true;
  if (
    profile.activeSubscriptionPlan === 'Teacher Pro' || 
    profile.activeSubscriptionPlan?.startsWith('Teacher Pro') ||
    hasSchoolLicense(profile)
  ) {
    return true;
  }
  return isPassActive(profile.endOfTermPassExpiry);
}

export function canScanOMR(profile: UserProfile): { allowed: boolean; remainingScans: number; reason?: string } {
  if (hasProAccess(profile)) {
    return { allowed: true, remainingScans: 999999 };
  }
  const max = profile.maxFreeScansPerMonth || 50;
  const current = profile.scansThisMonth || 0;
  const remaining = Math.max(0, max - current);
  if (remaining <= 0) {
    return {
      allowed: false,
      remainingScans: 0,
      reason: `You have reached your free tier limit of ${max} OMR scans this month. Upgrade to Teacher Pro or get an End-of-Term Pass to scan unlimited papers.`,
    };
  }
  return { allowed: true, remainingScans: remaining };
}

export function canSaveExamPaper(profile: UserProfile, currentSavedCount: number): { allowed: boolean; reason?: string } {
  if (hasProAccess(profile)) {
    return { allowed: true };
  }
  const max = profile.maxFreeExamPapers || 3;
  if (currentSavedCount >= max) {
    return {
      allowed: false,
      reason: `Free tier is limited to ${max} saved test papers. Upgrade to Teacher Pro to create unlimited exam papers.`,
    };
  }
  return { allowed: true };
}

export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function processMoMoPayment(
  itemTitle: string,
  amountGHS: number,
  provider: MobileMoneyProvider,
  phoneNumber: string
): Promise<PaymentTransaction> {
  // Simulate network payment gateway call (e.g. Paystack / Hubtel / MoMo API)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const randomRef = 'GH-MOMO-' + Math.floor(100000 + Math.random() * 900000);
  
  return {
    id: 'tx_' + Date.now(),
    planOrItemTitle: itemTitle,
    amountGHS,
    provider,
    phoneNumber,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: 'completed',
    reference: randomRef,
  };
}

export interface LicenseVoucher {
  code: string;
  planType: 'Teacher Pro' | 'School License' | 'End-of-Term Pass' | 'Workshop VIP Pass';
  description: string;
  createdAt: string;
  isUsed: boolean;
  usedBy?: string;
  durationDays?: number;
  smsBonus?: number;
}

export const PRESET_WORKSHOP_VOUCHERS: LicenseVoucher[] = [];

export function generateVoucherCode(type: 'WORKSHOP' | 'PRO' | 'SCHOOL'): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  if (type === 'WORKSHOP') return `WORKSHOP-GH-${rand}`;
  if (type === 'SCHOOL') return `B2B-SCH-${rand}`;
  return `PRO-TEACH-${rand}`;
}

export function validateAndRedeemVoucher(
  voucherCode: string,
  userProfile: UserProfile,
  existingVouchers: LicenseVoucher[]
): { success: boolean; message: string; updatedProfile?: Partial<UserProfile>; voucher?: LicenseVoucher } {
  const normalized = voucherCode.trim().toUpperCase();
  const found = existingVouchers.find((v) => v.code.toUpperCase() === normalized);

  if (!found) {
    return { success: false, message: 'Invalid voucher code. Please check the code and try again.' };
  }
  if (found.isUsed) {
    return { success: false, message: 'This voucher code has already been redeemed.' };
  }

  const updates: Partial<UserProfile> = {};
  if (found.planType === 'Teacher Pro') {
    updates.activeSubscriptionPlan = 'Teacher Pro';
    updates.isPremium = true;
  } else if (found.planType === 'School License') {
    updates.activeSubscriptionPlan = 'School License';
    updates.isPremium = true;
  } else if (found.planType === 'Workshop VIP Pass' || found.planType === 'End-of-Term Pass') {
    updates.activeSubscriptionPlan = 'Teacher Pro';
    updates.isPremium = true;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (found.durationDays || 30));
    updates.endOfTermPassExpiry = expiry.toISOString();
  }

  if (found.smsBonus) {
    updates.smsCredits = (userProfile.smsCredits || 0) + found.smsBonus;
  }

  return {
    success: true,
    message: `Voucher redeemed successfully! Activated: ${found.planType} (${found.description})`,
    updatedProfile: updates,
    voucher: { ...found, isUsed: true, usedBy: userProfile.email || userProfile.fullName },
  };
}

export const REDEEM_POINT_COSTS = {
  END_OF_TERM_PASS: 100,
  TEACHER_PRO_MONTH: 200,
  SCHOOL_LICENSE_WEEKLY: 150,
  SCHOOL_LICENSE_MONTH: 500,
  SCHOOL_LICENSE_TERM: 1000,
  SCHOOL_LICENSE_YEAR: 2000,
};

export const REFERRAL_REWARDS = {
  REFERRER_POINTS: 20,
  NEW_USER_BONUS_POINTS: 10,
  HEADTEACHER_REFERRER_POINTS: 40,
  REFERRED_SCHOOL_BONUS_POINTS: 20,
};

export function getReferralLink(referralCode: string): string {
  const baseUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://teacherstoolkit.app';
  return `${baseUrl}?ref=${encodeURIComponent(referralCode || 'TEACHER-GH-8921')}`;
}

export function redeemPointsForPlan(
  planOrPassType: 'pass' | 'pro' | 'school' | 'school_weekly' | 'school_monthly' | 'school_term' | 'school_year',
  userProfile: UserProfile
): { success: boolean; message: string; updatedProfile?: Partial<UserProfile> } {
  const currentPoints = userProfile.rewardPoints || 0;
  let requiredPoints = 200;

  if (planOrPassType === 'pass') requiredPoints = REDEEM_POINT_COSTS.END_OF_TERM_PASS;
  if (planOrPassType === 'pro') requiredPoints = REDEEM_POINT_COSTS.TEACHER_PRO_MONTH;
  if (planOrPassType === 'school_weekly') requiredPoints = REDEEM_POINT_COSTS.SCHOOL_LICENSE_WEEKLY;
  if (planOrPassType === 'school_monthly') requiredPoints = REDEEM_POINT_COSTS.SCHOOL_LICENSE_MONTH;
  if (planOrPassType === 'school' || planOrPassType === 'school_term') requiredPoints = REDEEM_POINT_COSTS.SCHOOL_LICENSE_TERM;
  if (planOrPassType === 'school_year') requiredPoints = REDEEM_POINT_COSTS.SCHOOL_LICENSE_YEAR;

  if (currentPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. You need ${requiredPoints} Points, but you currently have ${currentPoints} Points. Refer partner schools (+40 pts each for Headteachers) or colleagues (+20 pts) or submit WAEC questions (+30 pts) to earn more!`,
    };
  }

  const updates: Partial<UserProfile> = {
    rewardPoints: currentPoints - requiredPoints,
  };

  if (planOrPassType === 'pass') {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);
    updates.endOfTermPassExpiry = expiry.toISOString();
    updates.isPremium = true;
    return {
      success: true,
      message: `🎉 Success! Redeemed ${requiredPoints} Points for a 2-Week End-of-Term Pass!`,
      updatedProfile: updates,
    };
  } else if (planOrPassType === 'pro') {
    updates.activeSubscriptionPlan = 'Teacher Pro';
    updates.isPremium = true;
    return {
      success: true,
      message: `🎉 Success! Redeemed ${requiredPoints} Points for 1 Month of Teacher Pro!`,
      updatedProfile: updates,
    };
  } else if (planOrPassType === 'school_weekly') {
    updates.activeSubscriptionPlan = 'School License Weekly';
    updates.isPremium = true;
    return {
      success: true,
      message: `🎉 Success! Redeemed ${requiredPoints} Points for 1 Week School Plan!`,
      updatedProfile: updates,
    };
  } else if (planOrPassType === 'school_monthly') {
    updates.activeSubscriptionPlan = 'School License Monthly';
    updates.isPremium = true;
    return {
      success: true,
      message: `🎉 Success! Redeemed ${requiredPoints} Points for 1 Month School Plan!`,
      updatedProfile: updates,
    };
  } else if (planOrPassType === 'school' || planOrPassType === 'school_term') {
    updates.activeSubscriptionPlan = 'School License Term';
    updates.isPremium = true;
    return {
      success: true,
      message: `🎉 Success! Redeemed ${requiredPoints} Points for 1 Term School Plan!`,
      updatedProfile: updates,
    };
  } else if (planOrPassType === 'school_year') {
    updates.activeSubscriptionPlan = 'School License Year';
    updates.isPremium = true;
    return {
      success: true,
      message: `🎉 Success! Redeemed ${requiredPoints} Points for 1 Year School Plan!`,
      updatedProfile: updates,
    };
  }

  return {
    success: false,
    message: 'Invalid plan selected.',
  };
}
