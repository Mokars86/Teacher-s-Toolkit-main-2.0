import React, { useState } from 'react';
import { 
  Building2, Search, QrCode, CheckCircle2, ShieldCheck, 
  Upload, X, Check, ArrowRight, Sparkles, SlidersHorizontal, Image
} from 'lucide-react';
import { SchoolMode, SchoolProfile } from '../types';

interface SchoolConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: SchoolMode;
  setActiveMode?: (mode: SchoolMode) => void;
  onModeChange?: (mode: SchoolMode) => void;
  linkedSchool: SchoolProfile | null;
  setLinkedSchool?: (school: SchoolProfile | null) => void;
  onLinkSchool?: (school: SchoolProfile) => void;
  customBranding: {
    schoolName: string;
    address: string;
    motto: string;
    logoUrl: string;
  };
  setCustomBranding?: React.Dispatch<React.SetStateAction<{
    schoolName: string;
    address: string;
    motto: string;
    logoUrl: string;
  }>>;
  onUpdateBranding?: (branding: { schoolName: string; address: string; motto: string; logoUrl: string }) => void;
}

const MOCK_SCHOOL_DIRECTORY: SchoolProfile[] = [
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
    name: "Achimota Preparatory & Basic",
    code: "SCH-GH-4412",
    region: "Greater Accra Region",
    address: "P.O. Box 101, Achimota, Accra",
    motto: "Ut Sint Unum",
    headteacherName: "Mrs. Evelyn Quaye",
    academicTerm: "Term 2 - 2025/2026",
    totalStudents: 620,
    totalTeachers: 24,
  },
  {
    id: "SCH_003",
    name: "Prempeh College Basic Department",
    code: "SCH-GH-9903",
    region: "Ashanti Region",
    address: "Sofoline, Kumasi",
    motto: "Suban Ne Nyansapo",
    headteacherName: "Mr. Baffour Awuah",
    academicTerm: "Term 2 - 2025/2026",
    totalStudents: 550,
    totalTeachers: 20,
  }
];

export function SchoolConnectModal({
  isOpen,
  onClose,
  activeMode,
  setActiveMode,
  onModeChange,
  linkedSchool,
  setLinkedSchool,
  onLinkSchool,
  customBranding,
  setCustomBranding,
  onUpdateBranding
}: SchoolConnectModalProps) {
  const handleModeToggle = (mode: SchoolMode) => {
    if (setActiveMode) setActiveMode(mode);
    if (onModeChange) onModeChange(mode);
  };

  const handleLink = (school: SchoolProfile) => {
    if (setLinkedSchool) setLinkedSchool(school);
    if (onLinkSchool) onLinkSchool(school);
  };

  const handleBranding = (branding: { schoolName: string; address: string; motto: string; logoUrl: string }) => {
    if (setCustomBranding) setCustomBranding(branding);
    if (onUpdateBranding) onUpdateBranding(branding);
  };
  const [tab, setTab] = useState<"search" | "code" | "branding">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolCodeInput, setSchoolCodeInput] = useState("");
  const [requestSentSchoolId, setRequestSentSchoolId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSchools = MOCK_SCHOOL_DIRECTORY.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLinkSchoolCode = (e: React.FormEvent) => {
    e.preventDefault();
    const match = MOCK_SCHOOL_DIRECTORY.find(s => s.code.toUpperCase() === schoolCodeInput.trim().toUpperCase());
    if (match) {
      handleLink(match);
      handleModeToggle("linked");
      alert(`Successfully linked workspace to ${match.name}!`);
      onClose();
    } else {
      // Default fallback mock connection
      const newLinked: SchoolProfile = {
        id: "SCH_CUSTOM",
        name: "St. Peter's Basic School",
        code: schoolCodeInput.trim().toUpperCase() || "SCH-GH-8821",
        region: "Greater Accra Region",
        address: "P.O. Box 42, Osu, Accra",
        motto: "Excellence & Integrity",
        headteacherName: "Rev. Dr. Emmanuel Mensah",
        academicTerm: "Term 2 - 2025/2026",
        totalStudents: 480,
        totalTeachers: 18,
      };
      handleLink(newLinked);
      handleModeToggle("linked");
      alert(`Connected to school using Code ${newLinked.code}!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              School Connection & Mode Management
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Switch between independent personal mode or connect directly with your school's headteacher dashboard.
          </p>
        </div>

        {/* Mode Switcher Indicator Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Workspace Mode</span>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn_mode_personal"
              onClick={() => handleModeToggle("personal")}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 ${
                activeMode === "personal"
                  ? "border-slate-800 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Personal Mode</span>
                {activeMode === "personal" && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <p className={`text-[10px] ${activeMode === "personal" ? "opacity-80" : "text-slate-400"}`}>
                Independent exports & custom report branding
              </p>
            </button>

            <button
              type="button"
              id="btn_mode_linked"
              onClick={() => {
                if (!linkedSchool) {
                  setTab("code");
                } else {
                  handleModeToggle("linked");
                }
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 ${
                activeMode === "linked"
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-emerald-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black flex items-center gap-1">
                  <span>Linked School</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </span>
                {activeMode === "linked" && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <p className={`text-[10px] ${activeMode === "linked" ? "opacity-90" : "text-slate-400"}`}>
                {linkedSchool ? linkedSchool.name : "Click to connect school"}
              </p>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 text-xs font-extrabold uppercase">
          <button
            onClick={() => setTab("search")}
            className={`pb-2 px-3 border-b-2 transition ${
              tab === "search" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400"
            }`}
          >
            Search School
          </button>
          <button
            onClick={() => setTab("code")}
            className={`pb-2 px-3 border-b-2 transition ${
              tab === "code" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400"
            }`}
          >
            School ID / QR Code
          </button>
          <button
            onClick={() => setTab("branding")}
            className={`pb-2 px-3 border-b-2 transition ${
              tab === "branding" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400"
            }`}
          >
            Custom Branding
          </button>
        </div>

        {/* TAB 1: SEARCH DIRECTORY */}
        {tab === "search" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by school name, location, or region..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredSchools.map((sch) => (
                <div 
                  key={sch.id}
                  className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-emerald-400 transition"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sch.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{sch.region} • ID: {sch.code}</p>
                  </div>

                  {requestSentSchoolId === sch.id ? (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded border border-amber-200">
                      Request Sent
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setRequestSentSchoolId(sch.id);
                        handleLink(sch);
                        handleModeToggle("linked");
                        alert(`Connection request sent to ${sch.name}! Headteacher will approve your staff account.`);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition"
                    >
                      Request Join
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ENTER CODE */}
        {tab === "code" && (
          <form onSubmit={handleLinkSchoolCode} className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-500">
                Enter the 8-character School Link Code provided by your Headteacher (e.g. <code>SCH-GH-8821</code>)
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={schoolCodeInput}
                onChange={(e) => setSchoolCodeInput(e.target.value)}
                placeholder="e.g. SCH-GH-8821"
                className="w-full text-center tracking-widest text-base font-mono font-black py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl uppercase focus:outline-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Link Workspace Instantly</span>
            </button>
          </form>
        )}

        {/* TAB 3: CUSTOM BRANDING FOR PERSONAL MODE */}
        {tab === "branding" && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-400">
              Customize headers, logo, address, and motto displayed on generated PDF terminal reports in Personal Mode.
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">School Name</label>
                <input
                  type="text"
                  value={customBranding.schoolName}
                  onChange={(e) => handleBranding({ ...customBranding, schoolName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Postal Address</label>
                <input
                  type="text"
                  value={customBranding.address}
                  onChange={(e) => handleBranding({ ...customBranding, address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">School Motto</label>
                <input
                  type="text"
                  value={customBranding.motto}
                  onChange={(e) => handleBranding({ ...customBranding, motto: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert("Custom Report Card Branding settings updated!");
                onClose();
              }}
              className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow mt-2"
            >
              Save Custom Branding
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
