import React, { useState } from 'react';
import { 
  X, Share2, Copy, Check, Gift, Users, Award, Sparkles, Zap, ArrowRight, ShieldCheck, MessageCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  getReferralLink, REDEEM_POINT_COSTS, REFERRAL_REWARDS, redeemPointsForPlan 
} from '../services/subscriptionService';

interface ReferralHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const ReferralHubModal: React.FC<ReferralHubModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const isHeadteacher = userProfile.role === 'headteacher' || (userProfile.referralCode && userProfile.referralCode.startsWith('SCH-REF'));
  const referrerPoints = isHeadteacher ? REFERRAL_REWARDS.HEADTEACHER_REFERRER_POINTS : REFERRAL_REWARDS.REFERRER_POINTS;
  const bonusPoints = isHeadteacher ? REFERRAL_REWARDS.REFERRED_SCHOOL_BONUS_POINTS : REFERRAL_REWARDS.NEW_USER_BONUS_POINTS;

  const referralCode = userProfile.referralCode || (isHeadteacher ? 'SCH-REF-8921' : 'TEACHER-GH-8921');
  const referralLink = getReferralLink(referralCode);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      isHeadteacher
        ? `Hello Headteacher! 📚 Check out Teacher's Toolkit for school-wide terminal report approval, OMR grading & fee collections.\n\nSign up with our school referral link to get 20 FREE Bonus Points for your school:\n${referralLink}`
        : `Hello Colleague! 📚 Check out Teacher's Toolkit - the best Ghanaian offline-first OMR exam grading & lesson planning app for teachers.\n\nSign up with my link to get 10 FREE Reward Points:\n${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleRedeem = (type: 'pass' | 'pro' | 'school') => {
    const res = redeemPointsForPlan(type, userProfile);
    if (res.success && res.updatedProfile) {
      onUpdateProfile(res.updatedProfile);
      setFeedback({ success: true, message: res.message });
    } else {
      setFeedback({ success: false, message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 relative">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-800 text-white p-5 sm:p-6 shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl shadow-lg font-bold">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {isHeadteacher ? "School & Headteacher Referrals 🏫" : "Refer & Earn Subscriptions 🎁"}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm">
                {isHeadteacher 
                  ? "Refer partner schools & Headteachers to earn 40 Points per school!" 
                  : "Invite fellow teachers & convert points to free Pro plans!"}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-blue-500/40 text-center">
            <div className="bg-white/10 rounded-xl p-1.5 sm:p-2">
              <div className="text-[9px] sm:text-[10px] text-blue-200 uppercase font-semibold">Reward Balance</div>
              <div className="text-base sm:text-xl font-extrabold text-amber-300">{userProfile.rewardPoints || 0} Pts</div>
            </div>
            <div className="bg-white/10 rounded-xl p-1.5 sm:p-2">
              <div className="text-[9px] sm:text-[10px] text-blue-200 uppercase font-semibold">Referrals Done</div>
              <div className="text-base sm:text-xl font-extrabold text-white">{userProfile.referralCount || 0} {isHeadteacher ? "Schools" : "Users"}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-1.5 sm:p-2">
              <div className="text-[9px] sm:text-[10px] text-blue-200 uppercase font-semibold">Points / Refer</div>
              <div className="text-base sm:text-xl font-extrabold text-emerald-300">+{referrerPoints} Pts</div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          
          {feedback && (
            <div className={`p-3.5 sm:p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm ${
              feedback.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Referral Link & Code Box */}
          <div className="bg-white border-2 border-blue-500/30 rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>{isHeadteacher ? "Your School Referral Link & Code" : "Your Personal Referral Link & Code"}</span>
            </h3>

            {/* Direct Link Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shareable Referral Link</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-700 outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share Link directly on WhatsApp (+{referrerPoints} Pts / {isHeadteacher ? "School" : "User"})</span>
            </button>

            {/* Unique Referral Code */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Referral Code: </span>
                <span className="font-mono font-bold text-slate-900 text-xs bg-amber-100 px-2 py-0.5 rounded text-amber-900">{referralCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Code Only'}</span>
              </button>
            </div>
          </div>

          {/* How Referral System Works */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">How It Works</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">1</div>
                <div className="font-bold text-slate-800">Share Your Code</div>
                <div className="text-slate-500 text-[11px]">Send link to {isHeadteacher ? "Headteachers or partner schools." : "colleagues or teacher groups."}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">2</div>
                <div className="font-bold text-slate-800">Second {isHeadteacher ? "School" : "Teacher"} Signs Up</div>
                <div className="text-slate-500 text-[11px]">They automatically get <strong>{bonusPoints} Bonus Points</strong> upon registration.</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-xs">3</div>
                <div className="font-bold text-slate-800">Get {referrerPoints} Reward Pts</div>
                <div className="text-slate-500 text-[11px]">You instantly get <strong>{referrerPoints} Points</strong> to unlock free {isHeadteacher ? "School Admin licenses!" : "Teacher Pro plans!"}</div>
              </div>
            </div>
          </div>

          {/* Redeem Points Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Redeem Points for Subscriptions</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Balance: <strong className="text-amber-600">{userProfile.rewardPoints || 0} Pts</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: 2-Week Pass */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">14 Days</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-2">End-of-Term Pass</h4>
                  <div className="text-base font-black text-blue-700 mt-1">{REDEEM_POINT_COSTS.END_OF_TERM_PASS} Points</div>
                  <p className="text-[11px] text-slate-500 mt-1">Unlimited scans during exam crunch.</p>
                </div>
                <button
                  onClick={() => handleRedeem('pass')}
                  disabled={(userProfile.rewardPoints || 0) < REDEEM_POINT_COSTS.END_OF_TERM_PASS}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Redeem 100 Pts
                </button>
              </div>

              {/* Option 2: Teacher Pro 1 Month */}
              <div className="bg-white border-2 border-emerald-500/50 rounded-2xl p-4 shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase text-center py-0.5 absolute top-0 left-0 right-0">
                  Best Value
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-start">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">30 Days</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-2">Teacher Pro (1 Month)</h4>
                  <div className="text-base font-black text-emerald-700 mt-1">{REDEEM_POINT_COSTS.TEACHER_PRO_MONTH} Points</div>
                  <p className="text-[11px] text-slate-500 mt-1">Full Pro features, unlimited exports & SMS.</p>
                </div>
                <button
                  onClick={() => handleRedeem('pro')}
                  disabled={(userProfile.rewardPoints || 0) < REDEEM_POINT_COSTS.TEACHER_PRO_MONTH}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Redeem 200 Pts
                </button>
              </div>

              {/* Option 3: School License 1 Term */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">1 Term</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-2">School Admin License</h4>
                  <div className="text-base font-black text-indigo-700 mt-1">{REDEEM_POINT_COSTS.SCHOOL_LICENSE_TERM} Points</div>
                  <p className="text-[11px] text-slate-500 mt-1">Collections Hub & Multi-Teacher sync.</p>
                </div>
                <button
                  onClick={() => handleRedeem('school')}
                  disabled={(userProfile.rewardPoints || 0) < REDEEM_POINT_COSTS.SCHOOL_LICENSE_TERM}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Redeem 1000 Pts
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 shrink-0 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Earn points by contributing papers (+30 Pts) or referring colleagues (+20 Pts)</span>
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
