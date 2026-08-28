import { UserProfile, MobileMoneyProvider, PaymentTransaction, SubscriptionPlanDetails } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'Free',
    name: 'Free Forever',
    priceTag: 'GHS 0 / month',
    monthlyGHS: 0,
    tagline: 'Essential tools for individual classroom daily tasks',
    features: [
      'Basic Class Register & Attendance Tracker',
      'Lesson Planner module',
      'OMR Scanner (Up to 50 papers / month)',
      'Exam Builder (Up to 3 saved test papers)',
      'Basic Terminal Report Builder (manual entry)',
    ],
  },
  {
    id: 'Teacher Pro',
    name: 'Teacher Pro',
    priceTag: 'GHS 25 / month  (or GHS 150 / year)',
    monthlyGHS: 25,
    yearlyGHS: 150,
    popular: true,
    tagline: 'Supercharge your classroom productivity and save late-night hours',
    features: [
      'Unlimited OMR Scanning (No monthly cap)',
      'Unlimited Exam Builder & 2-Column PDF Export',
      'Bulk Terminal Report PDF Bundles (One-tap class export)',
      'SMS / WhatsApp 1-Tap Parent Alerts & Receipts',
      'Custom School Branding on Test Papers & Reports',
    ],
  },
  {
    id: 'School License',
    name: 'School Admin B2B License',
    priceTag: 'GHS 750 / term per school',
    monthlyGHS: 250,
    termGHS: 750,
    tagline: 'Complete financial oversight, asset control, and multi-teacher sync for Proprietors & Headteachers',
    features: [
      'Centralized Collections Hub (School Fees, PTA Levies, Canteen)',
      'Resource & Textbook Inventory tracking',
      'Multi-Teacher Score Sync to Headteacher Portal',
      'Custom School Crest, Digital Headteacher Signature & Reports',
      'All Teacher Pro features included for all staff',
    ],
  },
];

export const PAY_AS_YOU_GO_OPTIONS = [
  {
    id: 'end_of_term_pass',
    title: 'End-of-Term 2-Week Pass',
    priceTag: 'GHS 15',
    amountGHS: 15,
    description: '14 days of Unlimited OMR Scanning & PDF Exports during peak exam grading crunch.',
    badge: 'Popular for Exams',
  },
];

export function isPassActive(expiryDateString?: string | null): boolean {
  if (!expiryDateString) return false;
  const expiry = new Date(expiryDateString).getTime();
  return expiry > Date.now();
}

export function hasProAccess(profile: UserProfile): boolean {
  if (profile.activeSubscriptionPlan === 'Teacher Pro' || profile.activeSubscriptionPlan === 'School License') {
    return true;
  }
  return isPassActive(profile.endOfTermPassExpiry);
}

export function hasSchoolLicense(profile: UserProfile): boolean {
  return profile.activeSubscriptionPlan === 'School License';
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

export const PRESET_WORKSHOP_VOUCHERS: LicenseVoucher[] = [
  {
    code: 'WORKSHOP-GH-2026',
    planType: 'Workshop VIP Pass',
    description: 'Special Teacher Workshop Pass - 30 Days Unlimited Pro Scans',
    createdAt: '2026-08-01',
    isUsed: false,
    durationDays: 30,
    smsBonus: 0,
  },
  {
    code: 'TEACHER-PRO-365',
    planType: 'Teacher Pro',
    description: '1 Year Full Teacher Pro License Voucher',
    createdAt: '2026-08-10',
    isUsed: false,
    durationDays: 365,
    smsBonus: 0,
  },
  {
    code: 'SCH-B2B-TERM2',
    planType: 'School License',
    description: 'Full Term 2 School B2B License Voucher',
    createdAt: '2026-08-15',
    isUsed: false,
    durationDays: 120,
    smsBonus: 0,
  },
];

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
  SCHOOL_LICENSE_TERM: 1000,
};

export const REFERRAL_REWARDS = {
  REFERRER_POINTS: 100,
  NEW_USER_BONUS_POINTS: 50,
};

export function getReferralLink(referralCode: string): string {
  const baseUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://teacherstoolkit.app';
  return `${baseUrl}?ref=${encodeURIComponent(referralCode || 'TEACHER-GH-8921')}`;
}

export function redeemPointsForPlan(
  planOrPassType: 'pass' | 'pro' | 'school',
  userProfile: UserProfile
): { success: boolean; message: string; updatedProfile?: Partial<UserProfile> } {
  const currentPoints = userProfile.rewardPoints || 0;
  let requiredPoints = 200;

  if (planOrPassType === 'pass') requiredPoints = REDEEM_POINT_COSTS.END_OF_TERM_PASS;
  if (planOrPassType === 'pro') requiredPoints = REDEEM_POINT_COSTS.TEACHER_PRO_MONTH;
  if (planOrPassType === 'school') requiredPoints = REDEEM_POINT_COSTS.SCHOOL_LICENSE_TERM;

  if (currentPoints < requiredPoints) {
    return {
      success: false,
      message: `Insufficient points. You need ${requiredPoints} Points, but you currently have ${currentPoints} Points. Invite colleagues (+100 pts each) to earn more!`,
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
  } else if (planOrPassType === 'school') {
    updates.activeSubscriptionPlan = 'School License';
    updates.isPremium = true;
    return {
      success: true,
      message: `🎉 Success! Redeemed ${requiredPoints} Points for 1 Term School Admin License!`,
      updatedProfile: updates,
    };
  }

  return { success: false, message: 'Invalid redemption option.' };
}


