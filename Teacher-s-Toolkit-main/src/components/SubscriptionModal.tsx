import React, { useState } from 'react';
import { 
  X, CheckCircle2, Sparkles, ShieldCheck, Zap, MessageSquare, Building2, 
  CreditCard, Smartphone, Check, Loader2, RefreshCw, AlertCircle, Award, 
  ChevronRight, Calendar, ArrowRight, ShieldAlert, Ticket, Coffee, Heart, Gift, Share2
} from 'lucide-react';
import { UserProfile, MobileMoneyProvider, PaymentTransaction } from '../types';
import { 
  SUBSCRIPTION_PLANS, PAY_AS_YOU_GO_OPTIONS, isPassActive, 
  formatGHS, processMoMoPayment, hasProAccess, hasSchoolLicense,
  LicenseVoucher, PRESET_WORKSHOP_VOUCHERS, validateAndRedeemVoucher,
  REDEEM_POINT_COSTS, redeemPointsForPlan, getReferralLink
} from '../services/subscriptionService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  vouchersList?: LicenseVoucher[];
  onOpenReferralHub?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  vouchersList = PRESET_WORKSHOP_VOUCHERS,
  onOpenReferralHub,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'points' | 'donate'>('plans');

  
  // Voucher redemption state inside subscription modal
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherFeedback, setVoucherFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Custom Donation Amount
  const [customDonateAmount, setCustomDonateAmount] = useState<number>(30);

  // Checkout state
  const [checkoutItem, setCheckoutItem] = useState<{
    type: 'plan' | 'pass' | 'sms' | 'donation';
    id: string;
    title: string;
    amountGHS: number;
    planId?: "Free" | "Teacher Pro" | "School License";
    smsAmount?: number;
    passDays?: number;
  } | null>(null);

  const [selectedProvider, setSelectedProvider] = useState<MobileMoneyProvider>('MTN MoMo');
  const [momoPhoneNumber, setMomoPhoneNumber] = useState('0244123456');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessTx, setPaymentSuccessTx] = useState<PaymentTransaction | null>(null);
  
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([
    {
      id: 'tx_init_1',
      planOrItemTitle: 'Initial Free Tier Welcome',
      amountGHS: 0,
      provider: 'MTN MoMo',
      phoneNumber: '0244123456',
      date: 'Aug 1, 2026',
      status: 'completed',
      reference: 'GH-MOMO-FREE-INIT',
    }
  ]);

  if (!isOpen) return null;

  const activePass = isPassActive(userProfile.endOfTermPassExpiry);

  const handleStartCheckout = (item: typeof checkoutItem) => {
    setCheckoutItem(item);
    setPaymentSuccessTx(null);
  };

  const handleExecutePayment = async () => {
    if (!checkoutItem) return;
    setIsProcessingPayment(true);

    try {
      const tx = await processMoMoPayment(
        checkoutItem.title,
        checkoutItem.amountGHS,
        selectedProvider,
        momoPhoneNumber
      );

      // Apply benefits to user profile
      if (checkoutItem.type === 'plan' && checkoutItem.planId) {
        onUpdateProfile({
          activeSubscriptionPlan: checkoutItem.planId,
          isPremium: checkoutItem.planId !== 'Free',
        });
      } else if (checkoutItem.type === 'pass' && checkoutItem.passDays) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + checkoutItem.passDays);
        onUpdateProfile({
          endOfTermPassExpiry: expiry.toISOString(),
          isPremium: true,
        });
      } else if (checkoutItem.type === 'sms' && checkoutItem.smsAmount) {
        onUpdateProfile({
          smsCredits: (userProfile.smsCredits || 0) + checkoutItem.smsAmount,
        });
      } else if (checkoutItem.type === 'donation') {
        const bonusPoints = Math.round(checkoutItem.amountGHS * 10);
        onUpdateProfile({
          rewardPoints: (userProfile.rewardPoints || 0) + bonusPoints,
        });
      }

      setPaymentHistory((prev) => [tx, ...prev]);
      setPaymentSuccessTx(tx);
    } catch (err) {
      alert("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRedeemVoucherModal = () => {
    if (!voucherCodeInput.trim()) {
      setVoucherFeedback({ success: false, message: 'Please enter a voucher code.' });
      return;
    }
    const res = validateAndRedeemVoucher(voucherCodeInput, userProfile, vouchersList);
    if (res.success && res.updatedProfile) {
      onUpdateProfile(res.updatedProfile);
      setVoucherFeedback({ success: true, message: res.message });
      setVoucherCodeInput('');
    } else {
      setVoucherFeedback({ success: false, message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-900/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-100 relative">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 sm:p-6 shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3 mb-2 pr-8">
            <div className="p-2 sm:p-2.5 bg-amber-400 text-slate-950 rounded-xl shadow-lg font-bold shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight">Billing & Subscriptions Hub</h2>
              <p className="text-emerald-200 text-[11px] sm:text-sm leading-tight">
                Monetization plans, Seasonal passes, Developer Donations & Workshop Vouchers
              </p>
            </div>
          </div>

          {/* Current Active Account Status Ribbon */}
          <div className="mt-3.5 pt-3 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-2.5 text-[11px] sm:text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-emerald-200 font-medium">Active Plan:</span>
              <span className="px-2.5 py-0.5 sm:py-1 rounded-full font-bold bg-amber-400 text-slate-950 text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
                {userProfile.activeSubscriptionPlan}
              </span>
              {activePass && (
                <span className="px-2.5 py-0.5 sm:py-1 rounded-full font-bold bg-emerald-500 text-white text-[10px] sm:text-[11px]">
                  ⚡ 2-Week Pass Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-emerald-100">
              <div>
                Scans Left: <span className="font-bold text-white">{hasProAccess(userProfile) ? 'Unlimited ∞' : `${Math.max(0, (userProfile.maxFreeScansPerMonth || 50) - (userProfile.scansThisMonth || 0))}/50`}</span>
              </div>
              <div>
                Reward Points: <span className="font-bold text-amber-300">{userProfile.rewardPoints || 0} pts</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 mt-3.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => { setActiveTab('plans'); setCheckoutItem(null); }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'plans' 
                  ? 'bg-white text-emerald-950 shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-emerald-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Subscription Plans & Passes</span>
            </button>

            <button
              onClick={() => { setActiveTab('points'); setCheckoutItem(null); }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'points' 
                  ? 'bg-amber-400 text-slate-950 shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-amber-300'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Redeem Points ({userProfile.rewardPoints || 0})</span>
            </button>

            <button
              onClick={() => { setActiveTab('donate'); setCheckoutItem(null); }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'donate' 
                  ? 'bg-rose-500 text-white shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-rose-300'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Buy Us Coffee ☕</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">

          {/* CHECKOUT OVERLAY DIALOG IF AN ITEM IS SELECTED */}
          {checkoutItem && (
            <div className="bg-white border-2 border-emerald-600 rounded-2xl p-4 sm:p-6 shadow-xl mb-6 relative animate-fadeIn">
              <button
                onClick={() => setCheckoutItem(null)}
                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              {!paymentSuccessTx ? (
                <div>
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base sm:text-lg mb-1 pr-6">
                    <Smartphone className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Mobile Money Express Checkout</span>
                  </div>
                  <p className="text-slate-600 text-xs mb-4">
                    Pay securely using Ghana Mobile Money (MTN MoMo, Telecel Cash, or AT Money).
                  </p>

                  <div className="bg-emerald-50 rounded-xl p-3.5 sm:p-4 mb-4 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Selected Item / Donation:</div>
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">{checkoutItem.title}</div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Total Amount:</div>
                      <div className="font-extrabold text-emerald-700 text-base sm:text-lg">{formatGHS(checkoutItem.amountGHS)}</div>
                    </div>
                  </div>

                  {/* Provider Choice */}
                  <div className="space-y-2.5 mb-4">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                      1. Select MoMo Network Provider:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                      {(['MTN MoMo', 'Telecel Cash', 'AT Money'] as MobileMoneyProvider[]).map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setSelectedProvider(prov)}
                          className={`p-2.5 sm:p-3 rounded-xl border font-bold text-[10px] sm:text-xs text-center transition-all ${
                            selectedProvider === prov
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400'
                          }`}
                        >
                          {prov}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <div className="space-y-2 mb-5">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. Enter Mobile Money Phone Number:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={momoPhoneNumber}
                        onChange={(e) => setMomoPhoneNumber(e.target.value)}
                        placeholder="e.g. 0244123456"
                        className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                      <span className="absolute right-3 top-2.5 sm:top-3 text-[10px] sm:text-xs text-slate-400 font-semibold">Ghana +233</span>
                    </div>
                  </div>

                  {/* Submit Payment Button */}
                  <button
                    disabled={isProcessingPayment || !momoPhoneNumber}
                    onClick={handleExecutePayment}
                    className="w-full py-3 sm:py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending MoMo Prompt to Phone...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Authorize Payment of {formatGHS(checkoutItem.amountGHS)}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* SUCCESS RECEIPT STATE */
                <div className="text-center py-3 space-y-3.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {checkoutItem.type === 'donation' ? 'Thank You For Supporting Us! 💖' : 'Payment Successful!'}
                    </h3>
                    <p className="text-slate-600 text-xs mt-1">
                      {checkoutItem.type === 'donation' 
                        ? 'Your coffee donation directly powers late-night coding, OMR AI research & server hosting for teachers across Ghana!'
                        : 'Your subscription / credits have been instantly updated.'}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-left max-w-md mx-auto text-xs space-y-2 font-mono">
                    <div className="flex justify-between border-b pb-1 text-slate-600">
                      <span>Transaction Ref:</span>
                      <span className="font-bold text-slate-900 break-all">{paymentSuccessTx.reference}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1 text-slate-600">
                      <span>Item / Support Tier:</span>
                      <span className="font-bold text-slate-900">{paymentSuccessTx.planOrItemTitle}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1 text-slate-600">
                      <span>Payment Method:</span>
                      <span className="font-bold text-slate-900">{paymentSuccessTx.provider} ({paymentSuccessTx.phoneNumber})</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Amount Contributed:</span>
                      <span className="font-bold text-emerald-700">{formatGHS(paymentSuccessTx.amountGHS)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCheckoutItem(null)}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    Done & Return to App
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: SUBSCRIPTION PLANS */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {/* Inline Workshop & Partner Voucher Redemption Box */}
              <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-400/50 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-bold shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Have a Workshop or Partner Voucher Code?</h4>
                    <p className="text-xs text-slate-600">Redeem teacher training passes or workshop vouchers directly to unlock VIP features & SMS credits.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Enter Voucher Code (e.g. WORKSHOP-GH-2026)"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (!voucherCodeInput.trim()) return;
                      const res = validateAndRedeemVoucher(voucherCodeInput, userProfile, vouchersList);
                      if (res.success && res.updatedProfile) {
                        onUpdateProfile(res.updatedProfile);
                        setVoucherFeedback({ success: true, message: res.message });
                        setVoucherCodeInput('');
                      } else {
                        setVoucherFeedback({ success: false, message: res.message });
                      }
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Apply Voucher</span>
                  </button>
                </div>

                {voucherFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    voucherFeedback.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{voucherFeedback.message}</span>
                    </div>
                    <button onClick={() => setVoucherFeedback(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="pt-2 border-t border-amber-200/60 text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-700 text-[11px]">Click sample codes:</span>
                  <span 
                    onClick={() => setVoucherCodeInput('WORKSHOP-GH-2026')} 
                    className="px-2 py-0.5 bg-white border border-amber-300 rounded text-[11px] font-mono text-emerald-700 font-bold hover:bg-amber-100 cursor-pointer"
                  >
                    WORKSHOP-GH-2026
                  </span>
                  <span 
                    onClick={() => setVoucherCodeInput('TEACHER-PRO-365')} 
                    className="px-2 py-0.5 bg-white border border-amber-300 rounded text-[11px] font-mono text-emerald-700 font-bold hover:bg-amber-100 cursor-pointer"
                  >
                    TEACHER-PRO-365
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. FREE TIER & PRO PLANS */}
                {SUBSCRIPTION_PLANS.slice(0, 1).map((plan) => {
                  const isCurrent = userProfile.activeSubscriptionPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="p-5 sm:p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>
                        </div>

                        <div className="py-2 border-y border-slate-100">
                          <div className="text-2xl font-black text-slate-800">{plan.priceTag}</div>
                        </div>

                        <ul className="space-y-2.5 text-xs text-slate-600">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-5 bg-slate-50 border-t border-slate-100">
                        {isCurrent ? (
                          <div className="w-full py-2.5 px-3 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Current Active Plan</span>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleStartCheckout({
                                type: 'plan',
                                id: plan.id,
                                title: plan.name,
                                amountGHS: plan.monthlyGHS,
                                planId: plan.id,
                              })
                            }
                            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Subscribe via MoMo</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 2. SEASONAL PASS CARD (INTEGRATED FOR EASY ACCESS) */}
                <div className="bg-white rounded-2xl border-2 border-amber-400 shadow-md hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden">
                  <div className="bg-amber-400 text-slate-950 text-[11px] font-extrabold uppercase tracking-widest text-center py-1 font-sans flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Seasonal Exam Pass</span>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">End-of-Term 2-Wk Pass</h3>
                      <p className="text-xs text-slate-500 mt-1 min-h-[32px]">14 days of unlimited OMR sheet scanning & PDF report card exports during busy exam crunch weeks.</p>
                    </div>

                    <div className="py-2 border-y border-slate-100">
                      <div className="text-2xl font-black text-amber-600">GH₵ 15 <span className="text-xs font-semibold text-slate-400">/ 14 days</span></div>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>14 Days Unlimited OMR Scanning</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Full WAEC & Terminal Reports</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>No Recurring Commitment</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 bg-slate-50 border-t border-slate-100">
                    {activePass ? (
                      <div className="w-full py-2.5 px-3 bg-amber-100 text-amber-900 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 border border-amber-300">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>Pass Active Now</span>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleStartCheckout({
                            type: 'pass',
                            id: 'pass_2week',
                            title: 'End-of-Term 2-Week Pass',
                            amountGHS: 15,
                            passDays: 14,
                          })
                        }
                        className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Buy Pass via MoMo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. TEACHER PRO & SCHOOL LICENSE */}
                {SUBSCRIPTION_PLANS.slice(1).map((plan) => {
                  const isCurrent = userProfile.activeSubscriptionPlan === plan.id;
                  
                  return (
                    <div
                      key={plan.id}
                      className={`bg-white rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                        plan.popular
                          ? 'border-2 border-emerald-500 shadow-xl scale-[1.02]'
                          : 'border-slate-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {plan.popular && (
                        <div className="bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-widest text-center py-1 font-sans">
                          Most Popular
                        </div>
                      )}

                      <div className="p-5 sm:p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>
                        </div>

                        <div className="py-2 border-y border-slate-100">
                          <div className="text-2xl font-black text-emerald-700">{plan.priceTag}</div>
                        </div>

                        <ul className="space-y-2.5 text-xs text-slate-600">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-5 bg-slate-50 border-t border-slate-100">
                        {isCurrent ? (
                          <div className="w-full py-2.5 px-3 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Current Active Plan</span>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleStartCheckout({
                                type: 'plan',
                                id: plan.id,
                                title: plan.name,
                                amountGHS: plan.monthlyGHS,
                                planId: plan.id,
                              })
                            }
                            className={`w-full py-2.5 px-3 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              plan.popular
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            <span>Subscribe via MoMo</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: REWARD POINTS SUBSCRIPTION REDEMPTION */}
          {activeTab === 'points' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-blue-500/15 border border-amber-400/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-bold shadow-md">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Reward Points Balance: <span className="text-amber-600 font-black">{userProfile.rewardPoints || 0} Points</span></h4>
                    <p className="text-xs text-slate-600 mt-0.5">Refer colleagues to earn +100 Points for every signup! Or upload exam papers for +50 Points.</p>
                  </div>
                </div>
                {onOpenReferralHub && (
                  <button
                    onClick={onOpenReferralHub}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Refer & Earn Link</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 2-Week Pass */}
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">14 Days Pass</span>
                    <h4 className="font-bold text-slate-900 text-base mt-2">End-of-Term Pass</h4>
                    <div className="text-xl font-black text-amber-700 mt-1">{REDEEM_POINT_COSTS.END_OF_TERM_PASS} Points</div>
                    <p className="text-xs text-slate-500 mt-2">Unlimited OMR paper scanning during exam crunch week.</p>
                  </div>
                  <button
                    onClick={() => {
                      const res = redeemPointsForPlan('pass', userProfile);
                      if (res.success && res.updatedProfile) {
                        onUpdateProfile(res.updatedProfile);
                        alert(res.message);
                      } else {
                        alert(res.message);
                      }
                    }}
                    disabled={(userProfile.rewardPoints || 0) < REDEEM_POINT_COSTS.END_OF_TERM_PASS}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    Redeem 100 Pts
                  </button>
                </div>

                {/* Teacher Pro Month */}
                <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase text-center py-0.5 absolute top-0 left-0 right-0 font-sans">
                    Most Popular
                  </div>
                  <div className="pt-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">30 Days Pro</span>
                    <h4 className="font-bold text-slate-900 text-base mt-2">Teacher Pro Plan</h4>
                    <div className="text-xl font-black text-emerald-700 mt-1">{REDEEM_POINT_COSTS.TEACHER_PRO_MONTH} Points</div>
                    <p className="text-xs text-slate-500 mt-2">Full Pro access, unlimited exports, custom branding & SMS.</p>
                  </div>
                  <button
                    onClick={() => {
                      const res = redeemPointsForPlan('pro', userProfile);
                      if (res.success && res.updatedProfile) {
                        onUpdateProfile(res.updatedProfile);
                        alert(res.message);
                      } else {
                        alert(res.message);
                      }
                    }}
                    disabled={(userProfile.rewardPoints || 0) < REDEEM_POINT_COSTS.TEACHER_PRO_MONTH}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    Redeem 200 Pts
                  </button>
                </div>

                {/* School License */}
                <div className="bg-white border-2 border-indigo-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase">1 Term License</span>
                    <h4 className="font-bold text-slate-900 text-base mt-2">School Admin License</h4>
                    <div className="text-xl font-black text-indigo-700 mt-1">{REDEEM_POINT_COSTS.SCHOOL_LICENSE_TERM} Points</div>
                    <p className="text-xs text-slate-500 mt-2">Centralized Collections Hub, inventory & multi-staff sync.</p>
                  </div>
                  <button
                    onClick={() => {
                      const res = redeemPointsForPlan('school', userProfile);
                      if (res.success && res.updatedProfile) {
                        onUpdateProfile(res.updatedProfile);
                        alert(res.message);
                      } else {
                        alert(res.message);
                      }
                    }}
                    disabled={(userProfile.rewardPoints || 0) < REDEEM_POINT_COSTS.SCHOOL_LICENSE_TERM}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    Redeem 1000 Pts
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* TAB 4: SUPPORT & BUY US A COFFEE */}
          {activeTab === 'donate' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white rounded-3xl p-6 shadow-xl text-center space-y-3 relative overflow-hidden">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <Coffee className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black">Support Development & Buy Us a Coffee! ☕</h3>
                <p className="text-xs sm:text-sm text-amber-100 max-w-lg mx-auto leading-relaxed">
                  Teacher's Toolkit is built with love by Mokars Tech to empower educators across Ghana. Your generous donations keep our optical scanning servers fast, support offline AI tools, and keep core features free for teachers!
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono">
                  <Heart className="w-3.5 h-3.5 text-rose-200 fill-rose-200 animate-pulse" />
                  <span>100% Mobile Money Supported (MTN MoMo, Telecel, AT)</span>
                </div>
              </div>

              {/* Donation Tiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tier 1 */}
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-2xl mb-1">☕</div>
                    <h4 className="font-bold text-slate-900 text-base">1 Cup of Coffee</h4>
                    <div className="text-xl font-extrabold text-amber-700 mt-1">GHS 10</div>
                    <p className="text-xs text-slate-500 mt-2">Fuel a quick late-night coding & bug-fix session!</p>
                  </div>
                  <button
                    onClick={() => handleStartCheckout({
                      type: 'donation',
                      id: 'donate_coffee_1',
                      title: 'Support Donation: 1 Coffee ☕',
                      amountGHS: 10,
                    })}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Donate GHS 10</span>
                    <Heart className="w-3.5 h-3.5 fill-slate-950" />
                  </button>
                </div>

                {/* Tier 2 */}
                <div className="bg-white border-2 border-rose-400 rounded-2xl p-5 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4 relative overflow-hidden">
                  <div className="bg-rose-500 text-white text-[9px] font-extrabold uppercase tracking-widest text-center py-0.5 font-sans absolute top-0 left-0 right-0">
                    Most Popular Support
                  </div>
                  <div className="pt-2">
                    <div className="text-2xl mb-1">☕☕</div>
                    <h4 className="font-bold text-slate-900 text-base">3 Cups of Coffee</h4>
                    <div className="text-xl font-extrabold text-rose-600 mt-1">GHS 25</div>
                    <p className="text-xs text-slate-500 mt-2">Support OMR scanner cloud server hosting & database sync!</p>
                  </div>
                  <button
                    onClick={() => handleStartCheckout({
                      type: 'donation',
                      id: 'donate_coffee_3',
                      title: 'Support Donation: 3 Coffees ☕☕',
                      amountGHS: 25,
                    })}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Donate GHS 25</span>
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>

                {/* Tier 3 */}
                <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-2xl mb-1">🚀</div>
                    <h4 className="font-bold text-slate-900 text-base">Super Supporter</h4>
                    <div className="text-xl font-extrabold text-emerald-700 mt-1">GHS 50</div>
                    <p className="text-xs text-slate-500 mt-2">Help build new AI lesson planning features & WAEC question banks!</p>
                  </div>
                  <button
                    onClick={() => handleStartCheckout({
                      type: 'donation',
                      id: 'donate_super',
                      title: 'Support Donation: Super Supporter 🚀',
                      amountGHS: 50,
                    })}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Donate GHS 50</span>
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              </div>

              {/* Custom Donation Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-center">
                <h4 className="font-bold text-slate-900 text-sm">Or Enter Custom Donation Amount (GHS)</h4>
                <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">GHS</span>
                    <input 
                      type="number"
                      min={5}
                      max={2000}
                      value={customDonateAmount}
                      onChange={(e) => setCustomDonateAmount(Math.max(5, parseInt(e.target.value) || 0))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <button
                    onClick={() => handleStartCheckout({
                      type: 'donation',
                      id: 'donate_custom',
                      title: `Custom Developer Support Donation (${formatGHS(customDonateAmount)})`,
                      amountGHS: customDonateAmount,
                    })}
                    className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer shrink-0"
                  >
                    Donate via MoMo
                  </button>
                </div>
              </div>
            </div>
          )}



        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 shrink-0 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted MoMo Payments (MTN MoMo, Telecel Cash, AT Money)</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
