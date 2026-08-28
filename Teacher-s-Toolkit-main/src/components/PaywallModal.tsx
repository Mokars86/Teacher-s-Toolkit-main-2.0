import React from 'react';
import { X, Sparkles, CheckCircle2, Zap, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { UserProfile } from '../types';
import { formatGHS } from '../services/subscriptionService';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  featureTriggered?: string;
  userProfile: UserProfile;
  onOpenFullSubscriptionHub: () => void;
  onQuickUpgradePro: () => void;
  onQuickBuyExamPass: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  title = "Unlock Teacher Pro Feature",
  description = "You have reached the limit of your Free Forever plan. Upgrade now to get unlimited access and save hours every week.",
  featureTriggered,
  userProfile,
  onOpenFullSubscriptionHub,
  onQuickUpgradePro,
  onQuickBuyExamPass,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 relative">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Premium Limit Reached
          </div>

          <h3 className="text-xl font-bold">{title}</h3>
          {featureTriggered && (
            <p className="text-emerald-200 text-xs mt-1 font-medium">
              Feature: <span className="text-amber-300 font-bold">{featureTriggered}</span>
            </p>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <p className="text-slate-600 text-sm leading-relaxed">
            {description}
          </p>

          {/* Quick Comparison Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Teacher Pro */}
            <div className="border-2 border-emerald-500 rounded-xl p-4 bg-emerald-50/50 relative flex flex-col justify-between">
              <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Recommended
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Teacher Pro</h4>
                <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
                  GHS 25 <span className="text-xs font-normal text-slate-500">/ mo</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited OMR Scans</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited Test Papers</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bulk PDF Class Bundles</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onQuickUpgradePro();
                }}
                className="mt-4 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Upgrade via MoMo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Option 2: 2-Week Exam Pass */}
            <div className="border border-slate-200 rounded-xl p-4 bg-amber-50/30 hover:border-amber-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-700 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5" /> End-of-Term Pass
                </div>
                <div className="text-lg font-extrabold text-amber-900 mt-0.5">
                  GHS 15 <span className="text-xs font-normal text-slate-500">/ 14 days</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  14 days of unlimited scanning & PDF exports during exam crunch week.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onQuickBuyExamPass();
                }}
                className="mt-4 w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Get 2-Week Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom link to view all plans */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant MoMo Activation (MTN, Telecel, AT)</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenFullSubscriptionHub();
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 flex items-center gap-1"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>View All Pricing Plans</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
