import React from 'react';
import { X, ShieldCheck, Camera, HardDrive, Lock, FileText, ExternalLink, Mail, Trash2, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Privacy Policy & Data Rights</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Teacher's ToolKit &bull; Mokars Tech</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          {/* Summary Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
            <p className="font-semibold text-xs flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Offline-First &amp; Zero Ad Tracking
            </p>
            <p className="text-[11px] leading-normal opacity-90">
              Teacher's ToolKit is engineered by Mokars Tech. All scanning and grading operations work 100% offline. We never sell student records or teacher personal data.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-500" />
              1. Camera &amp; Device Permissions
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
              <li><strong>Camera (<code>CAMERA</code>):</strong> Required to scan physical OMR bubble answer sheets and capture optional teacher avatars. OMR sheet frames are processed locally on your device.</li>
              <li><strong>Storage (<code>READ/WRITE_STORAGE</code>):</strong> Required to export printable PDF grade slips, terminal report cards, and certificates.</li>
              <li><strong>Vibration (<code>VIBRATE</code>):</strong> Gives subtle physical feedback upon successful OMR sheet alignment.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-500" />
              2. Student Academic Data &amp; COPPA / FERPA Protection
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              The App does not permit direct registration by children under 13. All student marks, rosters, and names are entered exclusively by teachers/schools in their educational capacity. Student data is never used for behavioral advertising or shared with third-party brokers.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              3. Third-Party Integrations
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              We partner with trusted enterprise providers:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
              <li><strong>Supabase:</strong> For encrypted cloud backup and multi-device syncing.</li>
              <li><strong>Google Gemini AI:</strong> For automated lesson plan and exam question generation assistance.</li>
              <li><strong>Paystack:</strong> For PCI-DSS compliant subscription &amp; pass processing (we never hold credit card details).</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              4. Data Control &amp; Account Deletion
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              You retain 100% ownership of your classroom data. You can delete test runs and master keys in-app at any time, or request complete account and cloud deletion by emailing <span className="font-mono text-emerald-600 dark:text-emerald-400">privacy@mokarstech.com</span>.
            </p>
          </div>

          {/* View Full Web Page Link */}
          <div className="pt-2">
            <a 
              href="/privacy.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Full Web Privacy Policy Document</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Last Updated: September 2026 &bull; Mokars Tech
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
