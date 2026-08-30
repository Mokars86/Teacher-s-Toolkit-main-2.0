import React, { useState } from 'react';
import { 
  ArrowLeft, Printer, Award, Download, Sparkles, CheckCircle2, ShieldCheck, 
  QrCode, RefreshCw, Edit3, UserCheck, Calendar, BookOpen, Share2
} from 'lucide-react';
// @ts-ignore
import appLogo from '../assets/images/app_logo.png';
// @ts-ignore
import mokarsLogo from '../assets/images/mokars_logo.png';

interface WorkshopCertificateModuleProps {
  onBack: () => void;
  defaultTeacherName?: string;
  defaultSchoolName?: string;
}

export function WorkshopCertificateModule({ 
  onBack,
  defaultTeacherName = "Teacher Sarah Jenkins",
  defaultSchoolName = "St. Peter's Basic School",
}: WorkshopCertificateModuleProps) {
  const [recipientName, setRecipientName] = useState(defaultTeacherName);
  const [schoolName, setSchoolName] = useState(defaultSchoolName);
  const [workshopTitle, setWorkshopTitle] = useState(
    "Digital Pedagogy, OMR Automated Assessment & AI Lesson Planning Masterclass"
  );
  const [certificateId, setCertificateId] = useState("CERT-TT-2026-8921");
  const [issueDate, setIssueDate] = useState("August 25, 2026");
  const [cpdHours, setCpdHours] = useState("12 CPD Hours");
  const [facilitatorName, setFacilitatorName] = useState("Ing. Abubakar M. Karikari");
  const [facilitatorTitle, setFacilitatorTitle] = useState("Lead Trainer, Mokars Tech");
  const [directorName, setDirectorName] = useState("Rev. Dr. Emmanuel Mensah");
  const [directorTitle, setDirectorTitle] = useState("Educational Oversight Director");

  const handlePrint = () => {
    window.print();
  };

  const handleApplyPreset = (type: string) => {
    if (type === 'omr') {
      setWorkshopTitle("Advanced OMR Scanner & Automated Exam Broadsheet Masterclass");
      setCpdHours("8 CPD Hours");
    } else if (type === 'ai') {
      setWorkshopTitle("AI-Assisted Lesson Planning & GES National Curriculum Integration");
      setCpdHours("12 CPD Hours");
    } else if (type === 'b2b') {
      setWorkshopTitle("School Leadership, Terminal Report Analytics & Institutional Oversight");
      setCpdHours("16 CPD Hours");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      
      {/* ── TOP CONTROL BAR (HIDDEN IN PRINT MODE) ── */}
      <div className="w-full max-w-5xl mb-6 print:hidden flex flex-wrap items-center justify-between gap-4 bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-700 transition text-slate-300 flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Workshop Certificate Designer</span>
            </h1>
            <p className="text-slate-400 text-xs">Print or download high-resolution A4 landscape certificates for workshop attendees.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="py-2.5 px-5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Certificate</span>
          </button>
        </div>
      </div>

      {/* ── CUSTOMIZATION PANEL (HIDDEN IN PRINT MODE) ── */}
      <div className="w-full max-w-5xl mb-8 print:hidden bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Certificate Customizer Fields</span>
          </span>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="text-slate-400 font-medium">Preset Themes:</span>
            <button 
              onClick={() => handleApplyPreset('omr')}
              className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold"
            >
              OMR Masterclass
            </button>
            <button 
              onClick={() => handleApplyPreset('ai')}
              className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold"
            >
              AI Lesson Planning
            </button>
            <button 
              onClick={() => handleApplyPreset('b2b')}
              className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sky-300 font-bold"
            >
              School Leadership
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendee / Teacher Name</label>
            <input 
              type="text" 
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">School / Organization</label>
            <input 
              type="text" 
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Certificate Serial Code</label>
            <input 
              type="text" 
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-400 font-mono font-bold outline-none focus:border-amber-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Workshop Title</label>
            <input 
              type="text" 
              value={workshopTitle}
              onChange={(e) => setWorkshopTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-medium outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CPD Credit Hours</label>
            <input 
              type="text" 
              value={cpdHours}
              onChange={(e) => setCpdHours(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* ── CERTIFICATE CANVAS (A4 LANDSCAPE PRINT READY) ── */}
      <div 
        id="certificate-print-area"
        className="w-full max-w-[1020px] aspect-[1.414/1] bg-amber-50/90 text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 md:p-14 relative flex flex-col justify-between overflow-hidden border-8 border-slate-900 print:max-w-none print:w-full print:h-screen print:rounded-none print:shadow-none print:border-none print:p-8"
        style={{
          background: 'linear-gradient(135deg, #fffdfa 0%, #fdf9f0 50%, #f7f1e3 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Outer Metallic Double Frame Border */}
        <div className="absolute inset-4 border-2 border-amber-600/70 rounded-xl pointer-events-none" />
        <div className="absolute inset-6 border border-amber-500/40 rounded-lg pointer-events-none" />

        {/* Decorative Corner Ornaments */}
        <div className="absolute top-7 left-7 w-12 h-12 border-t-4 border-l-4 border-amber-600 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-7 right-7 w-12 h-12 border-t-4 border-r-4 border-amber-600 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-7 left-7 w-12 h-12 border-b-4 border-l-4 border-amber-600 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-7 right-7 w-12 h-12 border-b-4 border-r-4 border-amber-600 rounded-br-lg pointer-events-none" />

        {/* Subtle Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <img src={appLogo} alt="Watermark" className="w-[450px] h-[450px] object-contain" />
        </div>

        {/* CERTIFICATE HEADER */}
        <div className="text-center space-y-3 relative z-10 pt-2">
          {/* Top Logos */}
          <div className="flex items-center justify-between px-6 mb-2">
            <div className="flex items-center gap-2">
              <img src={appLogo} alt="Teacher's Toolkit" className="w-10 h-10 object-contain drop-shadow" />
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 tracking-tight block">Teacher's ToolKit</span>
                <span className="text-[9px] font-bold text-amber-700 tracking-widest uppercase block">Education Tech Ghana</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 tracking-tight block">MOKARS TECH</span>
                <span className="text-[9px] font-bold text-emerald-700 tracking-widest uppercase block">Official Certificate</span>
              </div>
              <img src={mokarsLogo} alt="Mokars Tech" className="w-9 h-9 object-contain drop-shadow" />
            </div>
          </div>

          {/* Certificate Title Badge */}
          <div className="inline-block px-8 py-1.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white font-extrabold text-xs tracking-widest uppercase shadow-md">
            Certificate of Participation & Mastery
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-slate-900 tracking-tight pt-1">
            WORKSHOP CERTIFICATE
          </h2>
        </div>

        {/* CERTIFICATE BODY */}
        <div className="text-center space-y-4 my-auto relative z-10 px-4">
          <p className="text-xs sm:text-sm font-medium text-slate-600 uppercase tracking-widest">
            This is to certify that
          </p>

          {/* Attendee Name */}
          <div className="py-1">
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-amber-900 tracking-wide border-b-2 border-amber-600/30 inline-block px-10 pb-1">
              {recipientName}
            </h3>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              {schoolName}
            </p>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed">
            has successfully completed the professional development hands-on workshop on
          </p>

          {/* Workshop Title */}
          <div className="bg-amber-100/60 border border-amber-300/80 rounded-2xl p-4 max-w-3xl mx-auto shadow-inner">
            <h4 className="text-base sm:text-xl font-black text-slate-900 tracking-tight font-sans">
              "{workshopTitle}"
            </h4>
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-amber-800 mt-2">
              <span>📅 Issued: {issueDate}</span>
              <span>•</span>
              <span>⚡ {cpdHours} Accredited</span>
            </div>
          </div>
        </div>

        {/* CERTIFICATE FOOTER & SEALS */}
        <div className="relative z-10 pt-4 border-t border-amber-300/60 flex flex-wrap items-end justify-between gap-6 px-4">
          
          {/* Signatory 1: Lead Facilitator */}
          <div className="text-center w-44">
            <div className="h-10 flex items-end justify-center font-serif text-lg font-bold text-slate-800 italic border-b border-slate-900 pb-1">
              {facilitatorName}
            </div>
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block mt-1">
              {facilitatorTitle}
            </span>
            <span className="text-[9px] text-slate-500 block">Lead Workshop Facilitator</span>
          </div>

          {/* Center Golden Badge Seal */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-white p-1 shadow-xl flex items-center justify-center border-4 border-white relative">
              <div className="w-full h-full rounded-full border-2 border-dashed border-amber-100 flex flex-col items-center justify-center p-1 text-center">
                <Award className="w-6 h-6 text-white mb-0.5" />
                <span className="text-[7px] font-black tracking-widest uppercase">VERIFIED</span>
                <span className="text-[6px] font-bold">MOKARS TECH</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-extrabold text-amber-900 mt-1 uppercase">
              ID: {certificateId}
            </span>
          </div>

          {/* Signatory 2: Director / Headteacher */}
          <div className="text-center w-44">
            <div className="h-10 flex items-end justify-center font-serif text-lg font-bold text-slate-800 italic border-b border-slate-900 pb-1">
              {directorName}
            </div>
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block mt-1">
              {directorTitle}
            </span>
            <span className="text-[9px] text-slate-500 block">Educational Director</span>
          </div>
        </div>

      </div>

    </div>
  );
}
