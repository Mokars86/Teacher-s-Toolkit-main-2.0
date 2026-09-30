import React, { useState } from 'react';
import { 
  Building2, Users, CheckCircle2, AlertCircle, Clock, FileText, 
  Search, Check, X, ShieldCheck, Lock, RotateCcw, Edit3, MessageSquare, 
  ArrowLeft, ArrowRight, Printer, Sparkles, UserCheck, Plus, Sliders, QrCode, Share2,
  Upload, Image as ImageIcon, Save, LogOut, Ticket, Copy, Award, Shield, Server,
  BarChart3, TrendingUp, Cpu, Activity
} from 'lucide-react';
import { LicenseVoucher, PRESET_WORKSHOP_VOUCHERS, generateVoucherCode, formatGHS } from '../services/subscriptionService';
import { SchoolProfile } from '../types';
// @ts-ignore
import mokarsLogo from '../assets/images/mokars_logo.png';
// @ts-ignore
import appLogo from '../assets/images/app_logo.png';

interface SuperAdminPanelProps {
  onBack: () => void;
  onLogout: () => void;
  vouchersList?: LicenseVoucher[];
  onAddVoucher?: (voucher: LicenseVoucher) => void;
  onOpenCertificate?: () => void;
}

const INITIAL_REGISTERED_SCHOOLS: SchoolProfile[] = (() => {
  try {
    const cached = localStorage.getItem("omr_registered_schools");
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
})();

export function SuperAdminPanel({ 
  onBack, 
  onLogout,
  vouchersList = PRESET_WORKSHOP_VOUCHERS,
  onAddVoucher,
  onOpenCertificate,
}: SuperAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"vouchers" | "analytics" | "schools" | "system">("vouchers");
  const [localVouchers, setLocalVouchers] = useState<LicenseVoucher[]>(vouchersList);

  // --- 4-DIGIT SECURITY PIN STATE ---
  const [storedPin, setStoredPin] = useState<string>(() => {
    try {
      return localStorage.getItem('omr_super_admin_pin') || '2026';
    } catch {
      return '2026';
    }
  });

  const [isPinAuthenticated, setIsPinAuthenticated] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Change PIN state
  const [currentPinVerify, setCurrentPinVerify] = useState<string>('');
  const [newPinSetting, setNewPinSetting] = useState<string>('');
  const [confirmPinSetting, setConfirmPinSetting] = useState<string>('');
  const [changePinMessage, setChangePinMessage] = useState<string>('');

  const handleKeypadPress = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + digit;
    setEnteredPin(next);
    setPinError('');

    if (next.length === 4) {
      if (next === storedPin) {
        setIsPinAuthenticated(true);
        setPinError('');
      } else {
        setPinError('Incorrect 4-Digit Security PIN');
        setTimeout(() => setEnteredPin(''), 600);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setPinError('');
  };

  const handleKeypadClear = () => {
    setEnteredPin('');
    setPinError('');
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinVerify !== storedPin) {
      setChangePinMessage('Error: Current PIN is incorrect.');
      return;
    }
    if (newPinSetting.length !== 4 || !/^\d{4}$/.test(newPinSetting)) {
      setChangePinMessage('Error: New PIN must be exactly 4 digits.');
      return;
    }
    if (newPinSetting !== confirmPinSetting) {
      setChangePinMessage('Error: New PIN and Confirmation do not match.');
      return;
    }

    setStoredPin(newPinSetting);
    localStorage.setItem('omr_super_admin_pin', newPinSetting);
    setCurrentPinVerify('');
    setNewPinSetting('');
    setConfirmPinSetting('');
    setChangePinMessage('Security PIN successfully updated!');
    setTimeout(() => setChangePinMessage(''), 3500);
  };

  // Voucher generator form
  const [newVoucherType, setNewVoucherType] = useState<'WORKSHOP' | 'PRO' | 'SCHOOL'>('WORKSHOP');
  const [newVoucherDesc, setNewVoucherDesc] = useState('Teacher Training Workshop VIP Pass');
  const [searchTerm, setSearchTerm] = useState('');

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
      smsBonus: 0,
    };

    setLocalVouchers((prev) => [newV, ...prev]);
    if (onAddVoucher) onAddVoucher(newV);
    alert(`Generated New Voucher Code: ${code}`);
  };

  const filteredVouchers = localVouchers.filter(v => 
    v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.planType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────
  // RENDER: 4-DIGIT PIN SECURITY LOCK GATE
  // ─────────────────────────────────────────────────────────────
  if (!isPinAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans select-none animate-fadeIn">
        <div className="max-w-sm w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 relative">
          
          <button
            type="button"
            onClick={onBack}
            className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Cancel & Return"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Glowing Shield / Lock */}
          <div className="pt-2 space-y-2">
            <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Super Admin Security PIN
            </h2>
            <p className="text-xs text-slate-400">
              Enter 4-Digit PIN to access developer & platform controls.
            </p>
          </div>

          {/* 4 Circular PIN Bubbles */}
          <div className="flex justify-center items-center gap-3.5 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-mono text-xl font-black transition-all ${
                    isFilled
                      ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md shadow-indigo-500/20 scale-105'
                      : 'bg-slate-950/60 border-slate-800 text-slate-600'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {pinError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          {/* 12-Key Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 active:text-white border border-slate-700/80 text-white font-mono text-lg font-bold shadow-sm transition active:scale-95 cursor-pointer"
              >
                {digit}
              </button>
            ))}
            
            <button
              type="button"
              onClick={handleKeypadClear}
              className="h-12 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 active:text-white border border-slate-700/80 text-white font-mono text-lg font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleKeypadBackspace}
              className="h-12 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center"
              title="Backspace"
            >
              ⌫
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Default PIN: <strong className="text-slate-400">2026</strong></span>
            <button
              type="button"
              onClick={onBack}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100 text-slate-900 font-sans">
      
      {/* ── MOBILE COMPACT HEADER & TAB NAVIGATION (VISIBLE ON < md) ── */}
      <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        {/* Top bar */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button 
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 shrink-0"
              title="Return to Main Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-black tracking-tight text-slate-900 uppercase truncate">
                SUPER ADMIN
              </h1>
              <span className="text-[8px] font-mono text-emerald-700 font-bold uppercase tracking-wider block">
                Mokars Platform
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="py-1.5 px-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition flex items-center gap-1 shrink-0"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>

        {/* Scrollable Tab Navigation Pills on Mobile */}
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("vouchers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap shrink-0 transition ${
              activeTab === "vouchers"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Vouchers</span>
          </button>

          {onOpenCertificate && (
            <button
              onClick={onOpenCertificate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs text-amber-800 bg-amber-50 border border-amber-200 whitespace-nowrap shrink-0"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Certificates</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap shrink-0 transition ${
              activeTab === "analytics"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("schools")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap shrink-0 transition ${
              activeTab === "schools"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>B2B Schools</span>
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap shrink-0 transition ${
              activeTab === "system"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>System Health</span>
          </button>
        </div>
      </header>

      {/* ── LEFT SIDEBAR NAVIGATION FOR DESKTOP (VISIBLE ON md+) ── */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-slate-200 shrink-0 flex-col justify-between shadow-sm sticky top-0 h-screen z-20">
        <div>
          {/* Header & Developer Logo */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition text-slate-600"
                title="Return to Main Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xs font-black tracking-tight text-slate-900 uppercase truncate">
                    SUPER ADMIN PORTAL
                  </h1>
                  <span className="text-[9px] font-mono text-emerald-700 font-bold uppercase tracking-widest block">
                    Mokars Tech Platform
                  </span>
                </div>
              </div>
            </div>

            {/* Developer Tag */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={mokarsLogo} alt="Mokars" className="w-4 h-4 object-contain" />
                <span className="text-xs font-bold text-slate-700">Developer Workspace</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                v2.4.0
              </span>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="p-3 space-y-5">
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                PLATFORM TOOLS
              </div>

              <button
                onClick={() => setActiveTab("vouchers")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === "vouchers"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Ticket className={`w-4 h-4 shrink-0 ${activeTab === "vouchers" ? "text-amber-300" : "text-amber-600"}`} />
                <span>Workshop Vouchers</span>
              </button>

              {onOpenCertificate && (
                <button
                  onClick={onOpenCertificate}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                >
                  <Award className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Workshop Certificates</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === "analytics"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Platform Analytics</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                MANAGEMENT & INFRA
              </div>

              <button
                onClick={() => setActiveTab("schools")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === "schools"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>School B2B Licenses</span>
              </button>

              <button
                onClick={() => setActiveTab("system")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === "system"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Server className="w-4 h-4 shrink-0" />
                <span>System Health & Config</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Super Admin</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="flex-1 min-w-0 p-3.5 sm:p-6 md:p-8 pb-28 md:pb-8 overflow-y-auto">

        {/* TAB 1: WORKSHOP VOUCHER GENERATOR */}
        {activeTab === "vouchers" && (
          <div className="space-y-4 sm:space-y-6 max-w-5xl animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 border border-emerald-800 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <Ticket className="w-3 h-3" /> Developer Voucher Center
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white">Workshop & License Voucher Generator</h2>
                <p className="text-slate-200 text-xs mt-1">
                  Issue promo voucher codes for teacher workshops, webinars, and B2B school licenses.
                </p>
              </div>

              <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl text-center backdrop-blur-sm self-stretch sm:self-auto shrink-0">
                <span className="text-[9px] sm:text-[10px] text-emerald-200 font-bold uppercase tracking-widest block">Total Vouchers</span>
                <span className="text-lg sm:text-xl font-black font-mono text-amber-300">{localVouchers.length} Codes</span>
              </div>
            </div>

            {/* Generator Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>1. Generate New Voucher Code</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Select Voucher Plan Type
                  </label>
                  <select
                    value={newVoucherType}
                    onChange={(e) => setNewVoucherType(e.target.value as any)}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="WORKSHOP">Workshop VIP Pass (30 Days Unlimited)</option>
                    <option value="PRO">Teacher Pro 1-Year Pass</option>
                    <option value="SCHOOL">School Admin B2B Term License Pass</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Workshop Tag / Description Note
                  </label>
                  <input
                    type="text"
                    value={newVoucherDesc}
                    onChange={(e) => setNewVoucherDesc(e.target.value)}
                    placeholder="e.g. Accra Central STEM Teacher Workshop 2026"
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateVoucher}
                className="w-full py-2.5 sm:py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Voucher Code</span>
              </button>
            </div>

            {/* Generated Vouchers Log */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Voucher Repository ({filteredVouchers.length})</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search voucher codes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left min-w-[560px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Voucher Code</th>
                      <th className="p-3">Plan Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Created</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {filteredVouchers.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-amber-700 text-sm tracking-wider">{v.code}</td>
                        <td className="p-3 font-sans font-bold text-slate-800">{v.planType}</td>
                        <td className="p-3 font-sans text-slate-600 text-[11px] max-w-[160px] truncate">{v.description}</td>
                        <td className="p-3 font-sans text-slate-500 text-[11px]">{v.createdAt}</td>
                        <td className="p-3 font-sans">
                          {v.isUsed ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[9px] border border-slate-200 whitespace-nowrap">
                              Redeemed by {v.usedBy || 'User'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] whitespace-nowrap">
                              Active & Ready
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(v.code);
                              alert(`Copied voucher code ${v.code} to clipboard!`);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-[10px] rounded-lg transition flex items-center gap-1 ml-auto cursor-pointer whitespace-nowrap"
                          >
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy Code</span>
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

        {/* TAB 2: ANALYTICS & METRICS */}
        {activeTab === "analytics" && (
          <div className="space-y-4 sm:space-y-6 max-w-5xl animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Platform System Analytics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Schools</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">42 Schools</span>
                <span className="text-[10px] text-emerald-600 font-bold block">+8 this month</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Teachers</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">1,280</span>
                <span className="text-[10px] text-slate-500 block">Across 16 Regions</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">OMR Scans Processed</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-600">84,200</span>
                <span className="text-[10px] text-amber-600 block">99.8% Scanner Accuracy</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">MoMo Revenue</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">GHS 124,500</span>
                <span className="text-[10px] text-slate-500 block">MTN MoMo & Telecel</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: B2B SCHOOL LICENSES */}
        {activeTab === "schools" && (
          <div className="space-y-4 sm:space-y-6 max-w-5xl animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Platform B2B School Directory & Licensing</h2>
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[560px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">School Name</th>
                      <th className="p-3">School ID Code</th>
                      <th className="p-3">Headteacher</th>
                      <th className="p-3">Teachers</th>
                      <th className="p-3">License Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {INITIAL_REGISTERED_SCHOOLS.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 font-sans">
                          No registered schools yet. Registered schools will appear here automatically.
                        </td>
                      </tr>
                    ) : (
                      INITIAL_REGISTERED_SCHOOLS.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-3 font-sans font-bold text-slate-900">{s.name}</td>
                          <td className="p-3 font-bold text-emerald-700">{s.code}</td>
                          <td className="p-3 font-sans text-slate-700">{s.headteacherName}</td>
                          <td className="p-3 font-sans text-slate-600">{s.totalTeachers} Staff</td>
                          <td className="p-3 font-sans">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 whitespace-nowrap">
                              Active License
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM HEALTH */}
        {activeTab === "system" && (
          <div className="space-y-4 sm:space-y-6 max-w-5xl animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">System Infrastructure & Environment</h2>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 font-mono text-xs text-slate-700 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-2 gap-1">
                <span className="text-slate-500">App Version:</span>
                <span className="font-bold text-emerald-700">Teacher's Toolkit v2.4.0 (Build 2026.08)</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-2 gap-1">
                <span className="text-slate-500">Backend Gateway:</span>
                <span className="font-bold text-emerald-700">Node Express Server (Port 3001)</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-2 gap-1">
                <span className="text-slate-500">Sync Queue:</span>
                <span className="font-bold text-emerald-700">Online & Syncing</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-500">Mobile Money Rails:</span>
                <span className="font-bold text-emerald-700">MTN MoMo, Telecel Cash, AT Money Operational</span>
              </div>
            </div>

            {/* 4-Digit Security PIN Update Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm font-sans">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Change 4-Digit Security PIN</h3>
                  <p className="text-xs text-slate-500">Update the PIN required to access Super Admin and developer features.</p>
                </div>
              </div>

              {changePinMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  changePinMessage.startsWith('Error') 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {changePinMessage.startsWith('Error') ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{changePinMessage}</span>
                </div>
              )}

              <form onSubmit={handleChangePinSubmit} className="space-y-3 max-w-md">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Current 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={currentPinVerify}
                    onChange={(e) => setCurrentPinVerify(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">New 4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newPinSetting}
                      onChange={(e) => setNewPinSetting(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Confirm New PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={confirmPinSetting}
                      onChange={(e) => setConfirmPinSetting(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  Update Security PIN
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
