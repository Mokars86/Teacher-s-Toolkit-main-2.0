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

const MOCK_REGISTERED_SCHOOLS: SchoolProfile[] = [
  {
    id: "SCH_001",
    name: "St. Peter's Basic School",
    code: "SCH-GH-8821",
    region: "Greater Accra Region",
    address: "P.O. Box 42, Osu, Accra",
    motto: "Excellence and Integrity",
    headteacherName: "Rev. Dr. Emmanuel Mensah",
    academicTerm: "Term 2 - 2025/2026",
    totalStudents: 480,
    totalTeachers: 18,
  },
  {
    id: "SCH_002",
    name: "Achimota Basic & Junior High",
    code: "SCH-GH-1092",
    region: "Greater Accra Region",
    address: "P.O. Box AH 88, Achimota, Accra",
    motto: "Ut Omnes Unum Sint",
    headteacherName: "Mrs. Florence Adjei",
    academicTerm: "Term 2 - 2025/2026",
    totalStudents: 620,
    totalTeachers: 24,
  },
  {
    id: "SCH_003",
    name: "Presby Boys JHS (Legon)",
    code: "SCH-GH-7741",
    region: "Greater Accra Region",
    address: "Legon, Accra",
    motto: "In Deum Confidimus",
    headteacherName: "Mr. Samuel Ofori-Atta",
    academicTerm: "Term 2 - 2025/2026",
    totalStudents: 510,
    totalTeachers: 20,
  },
];

export function SuperAdminPanel({ 
  onBack, 
  onLogout,
  vouchersList = PRESET_WORKSHOP_VOUCHERS,
  onAddVoucher,
  onOpenCertificate,
}: SuperAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"vouchers" | "analytics" | "schools" | "system">("vouchers");
  const [localVouchers, setLocalVouchers] = useState<LicenseVoucher[]>(vouchersList);

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
                    {MOCK_REGISTERED_SCHOOLS.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-sans font-bold text-slate-900">{s.name}</td>
                        <td className="p-3 font-bold text-emerald-700">{s.code}</td>
                        <td className="p-3 font-sans text-slate-700">{s.headteacherName}</td>
                        <td className="p-3 font-sans text-slate-600">{s.totalTeachers} Staff</td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 whitespace-nowrap">
                            Active Term 2 License
                          </span>
                        </td>
                      </tr>
                    ))}
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
          </div>
        )}

      </main>

    </div>
  );
}
