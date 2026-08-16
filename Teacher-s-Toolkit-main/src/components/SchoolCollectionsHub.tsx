import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, CheckCircle, CheckCircle2, DollarSign, 
  Smartphone, Wallet, Printer, Send, MessageSquare, Copy, 
  Filter, ChevronDown, Sparkles, RefreshCw, AlertCircle, FileText,
  UserCheck, ShieldCheck, Plus, X, Share2, Download
} from 'lucide-react';
import { FeeCollectionRecord, PaymentCategory, PaymentMethod, SchoolProfile } from '../types';

interface SchoolCollectionsHubProps {
  onBack: () => void;
  schoolProfile: SchoolProfile | null;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
}

interface StudentOption {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  totalFeesTarget: number;
  feesPaid: number;
  ptaTarget: number;
  ptaPaid: number;
  canteenTarget: number;
  canteenPaid: number;
}

const INITIAL_STUDENTS: StudentOption[] = [
  { id: "STU-001", name: "Kwesi Mensah", rollNo: "JHS2-001", className: "JHS 2 Gold", guardianName: "Esi Mensah", guardianPhone: "+233244123456", totalFeesTarget: 350, feesPaid: 300, ptaTarget: 50, ptaPaid: 50, canteenTarget: 100, canteenPaid: 80 },
  { id: "STU-002", name: "Ama Osei-Bonsu", rollNo: "JHS2-002", className: "JHS 2 Gold", guardianName: "Kofi Osei", guardianPhone: "+233501987654", totalFeesTarget: 350, feesPaid: 350, ptaTarget: 50, ptaPaid: 50, canteenTarget: 100, canteenPaid: 100 },
  { id: "STU-003", name: "Kofi Annan Jr.", rollNo: "JHS2-003", className: "JHS 2 Gold", guardianName: "Grace Annan", guardianPhone: "+233277334455", totalFeesTarget: 350, feesPaid: 150, ptaTarget: 50, ptaPaid: 0, canteenTarget: 100, canteenPaid: 40 },
  { id: "STU-004", name: "Abena Appiah", rollNo: "JHS2-004", className: "JHS 2 Gold", guardianName: "Samuel Appiah", guardianPhone: "+233544889900", totalFeesTarget: 350, feesPaid: 0, ptaTarget: 50, ptaPaid: 0, canteenTarget: 100, canteenPaid: 0 },
  { id: "STU-005", name: "Yaw Dankwa", rollNo: "JHS2-005", className: "JHS 2 Gold", guardianName: "Akosua Dankwa", guardianPhone: "+233200112233", totalFeesTarget: 350, feesPaid: 200, ptaTarget: 50, ptaPaid: 25, canteenTarget: 100, canteenPaid: 50 },
  { id: "STU-006", name: "Efua Kyei", rollNo: "JHS1-012", className: "JHS 1 Emerald", guardianName: "Joseph Kyei", guardianPhone: "+233243990011", totalFeesTarget: 320, feesPaid: 320, ptaTarget: 50, ptaPaid: 50, canteenTarget: 100, canteenPaid: 90 },
  { id: "STU-007", name: "Kojo Adjei", rollNo: "P6-008", className: "Primary 6 Ruby", guardianName: "Mary Adjei", guardianPhone: "+233555223344", totalFeesTarget: 280, feesPaid: 180, ptaTarget: 40, ptaPaid: 40, canteenTarget: 80, canteenPaid: 40 },
];

export function SchoolCollectionsHub({ 
  onBack, 
  schoolProfile, 
  selectedClass, 
  setSelectedClass 
}: SchoolCollectionsHubProps) {
  const [activeCategory, setActiveCategory] = useState<PaymentCategory>("school_fees");
  const [students, setStudents] = useState<StudentOption[]>(INITIAL_STUDENTS);

  // Form state
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(INITIAL_STUDENTS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [momoNetwork, setMomoNetwork] = useState<string>("MTN MoMo");
  const [momoRef, setMomoRef] = useState<string>("");
  const [paymentNote, setPaymentNote] = useState<string>("");

  // Table filters
  const [tableFilter, setTableFilter] = useState<"all" | "unpaid" | "partial" | "paid">("all");
  const [tableSearch, setTableSearch] = useState<string>("");

  // Modal
  const [lastRecordedReceipt, setLastRecordedReceipt] = useState<FeeCollectionRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  const classList = ["JHS 2 Gold", "JHS 1 Emerald", "Primary 6 Ruby", "School-Wide Ledger"];

  const filteredSearchStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClass === "School-Wide Ledger" || s.className === selectedClass;
      const matchQuery = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                         s.rollNo.toLowerCase().includes(studentSearch.toLowerCase());
      return matchClass && matchQuery;
    });
  }, [students, selectedClass, studentSearch]);

  const selectedStudentBalances = useMemo(() => {
    if (!selectedStudent) return { target: 0, paid: 0, outstanding: 0, status: "unpaid" as const };
    let target = 0;
    let paid = 0;

    if (activeCategory === "school_fees") {
      target = selectedStudent.totalFeesTarget;
      paid = selectedStudent.feesPaid;
    } else if (activeCategory === "pta_dues") {
      target = selectedStudent.ptaTarget;
      paid = selectedStudent.ptaPaid;
    } else {
      target = selectedStudent.canteenTarget;
      paid = selectedStudent.canteenPaid;
    }

    const outstanding = Math.max(0, target - paid);
    let status: "paid" | "partial" | "unpaid" = "unpaid";
    if (paid >= target && target > 0) status = "paid";
    else if (paid > 0) status = "partial";

    return { target, paid, outstanding, status };
  }, [selectedStudent, activeCategory]);

  const classStats = useMemo(() => {
    const activeStudents = students.filter(s => selectedClass === "School-Wide Ledger" || s.className === selectedClass);
    let totalTarget = 0;
    let totalCollected = 0;

    activeStudents.forEach(s => {
      if (activeCategory === "school_fees") {
        totalTarget += s.totalFeesTarget;
        totalCollected += s.feesPaid;
      } else if (activeCategory === "pta_dues") {
        totalTarget += s.ptaTarget;
        totalCollected += s.ptaPaid;
      } else {
        totalTarget += s.canteenTarget;
        totalCollected += s.canteenPaid;
      }
    });

    const percentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;
    return { totalTarget, totalCollected, percentage, count: activeStudents.length };
  }, [students, selectedClass, activeCategory]);

  const handleAddPreset = (addValue: number) => {
    const current = parseFloat(amountPaid) || 0;
    setAmountPaid((current + addValue).toString());
  };

  const handlePayFull = () => {
    setAmountPaid(selectedStudentBalances.outstanding.toString());
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const payAmt = parseFloat(amountPaid);
    if (isNaN(payAmt) || payAmt <= 0) return;

    const newPaidVal = selectedStudentBalances.paid + payAmt;
    const newOutstanding = Math.max(0, selectedStudentBalances.target - newPaidVal);
    let newStatus: "paid" | "partial" | "unpaid" = "unpaid";
    if (newPaidVal >= selectedStudentBalances.target && selectedStudentBalances.target > 0) {
      newStatus = "paid";
    } else if (newPaidVal > 0) {
      newStatus = "partial";
    }

    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudent.id) {
        if (activeCategory === "school_fees") return { ...s, feesPaid: newPaidVal };
        if (activeCategory === "pta_dues") return { ...s, ptaPaid: newPaidVal };
        return { ...s, canteenPaid: newPaidVal };
      }
      return s;
    }));

    const receipt: FeeCollectionRecord = {
      id: `REC-${Date.now().toString().slice(-6)}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      className: selectedStudent.className,
      category: activeCategory,
      amountPaid: payAmt,
      totalTarget: selectedStudentBalances.target,
      outstandingBalance: newOutstanding,
      paymentMethod,
      momoReference: paymentMethod === "momo" ? `${momoNetwork} - ${momoRef || 'Ref#' + Math.floor(100000 + Math.random()*900000)}` : undefined,
      note: paymentNote,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      receiptNumber: `SCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      guardianPhone: selectedStudent.guardianPhone,
      status: newStatus
    };

    setLastRecordedReceipt(receipt);
    setIsReceiptModalOpen(true);
    setAmountPaid("");
    setMomoRef("");
    setPaymentNote("");
  };

  const ledgerData = useMemo(() => {
    return students
      .filter(s => selectedClass === "School-Wide Ledger" || s.className === selectedClass)
      .map(s => {
        let target = 0;
        let paid = 0;
        if (activeCategory === "school_fees") { target = s.totalFeesTarget; paid = s.feesPaid; }
        else if (activeCategory === "pta_dues") { target = s.ptaTarget; paid = s.ptaPaid; }
        else { target = s.canteenTarget; paid = s.canteenPaid; }

        const outstanding = Math.max(0, target - paid);
        let status: "paid" | "partial" | "unpaid" = "unpaid";
        if (paid >= target && target > 0) status = "paid";
        else if (paid > 0) status = "partial";

        return { ...s, target, paid, outstanding, status };
      })
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(tableSearch.toLowerCase()) || 
                              item.rollNo.toLowerCase().includes(tableSearch.toLowerCase());
        if (tableFilter === "unpaid") return matchesSearch && item.status === "unpaid";
        if (tableFilter === "partial") return matchesSearch && item.status === "partial";
        if (tableFilter === "paid") return matchesSearch && item.status === "paid";
        return matchesSearch;
      });
  }, [students, selectedClass, activeCategory, tableFilter, tableSearch]);

  const smsDraft = useMemo(() => {
    if (!lastRecordedReceipt) return "";
    const catLabel = lastRecordedReceipt.category === "school_fees" ? "School Fees" : lastRecordedReceipt.category === "pta_dues" ? "PTA Dues" : "Canteen";
    return `Receipt #${lastRecordedReceipt.receiptNumber}: GHS ${lastRecordedReceipt.amountPaid.toFixed(2)} received for ${lastRecordedReceipt.studentName} (${lastRecordedReceipt.className}). Category: ${catLabel}. Outstanding balance: GHS ${lastRecordedReceipt.outstandingBalance.toFixed(2)}. ${schoolProfile?.name || 'School Office'}. Thank you!`;
  }, [lastRecordedReceipt, schoolProfile]);

  const copySmsDraft = () => {
    navigator.clipboard.writeText(smsDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const categoryLabels = {
    school_fees: { name: "School Fees", icon: "🎓", desc: "Termly tuition & government levies" },
    pta_dues: { name: "PTA Dues", icon: "🤝", desc: "Parent-Teacher Association contributions" },
    canteen: { name: "Canteen & Daily Tracker", icon: "🍱", desc: "Daily lunch & canteen allowances" }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col pb-24 transition-colors duration-200 animate-fade-in">
      {/* ==========================================
          HEADER BAR
          ========================================== */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">School Collections Hub</h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Fees, PTA & Canteen Payment Ledger</p>
            </div>
          </div>

          {/* Active Mode Indicator & Live Total Summary Pill */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-900 dark:text-indigo-200 font-semibold text-xs rounded-xl px-3 py-2 pr-7 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                {classList.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Live Total Summary Pill */}
            <div className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-1.5 flex items-center gap-3 shadow-inner">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Collected Target</div>
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  GHS {classStats.totalCollected.toLocaleString()} <span className="text-slate-500 dark:text-slate-400 font-normal">/ GHS {classStats.totalTarget.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-12 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, classStats.percentage)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{classStats.percentage}%</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 pt-6 space-y-6 flex-1">

        {/* SECTION A: CATEGORY SELECTOR */}
        <section className="bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700/60 rounded-2xl p-1.5 grid grid-cols-3 gap-1.5 shadow-md">
          {(["school_fees", "pta_dues", "canteen"] as PaymentCategory[]).map((cat) => {
            const isActive = activeCategory === cat;
            const meta = categoryLabels[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl transition-all font-semibold text-xs sm:text-sm ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 scale-[1.01]' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/80'
                }`}
              >
                <span className="text-base sm:text-lg">{meta.icon}</span>
                <span className="text-center sm:text-left leading-tight">{meta.name}</span>
              </button>
            );
          })}
        </section>

        {/* SECTION B: QUICK COLLECTION FORM */}
        <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl relative overflow-hidden card-accent-top">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚡ Quick Collection Entry</span>
                <span className="chip-brand">{categoryLabels[activeCategory].name}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Search student, enter payment amount, and issue digital receipt.</p>
            </div>
          </div>

          <form onSubmit={handleRecordPayment} className="space-y-5">
            {/* Student Lookup Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Student Lookup & Selection</span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">Auto-complete search</span>
              </label>

              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    placeholder="Search by student name or roll number (e.g. Kwesi Mensah)..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  {studentSearch && (
                    <button
                      type="button"
                      onClick={() => setStudentSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown Options */}
                {isDropdownOpen && filteredSearchStudents.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSearchStudents.map(student => (
                      <div
                        key={student.id}
                        onClick={() => {
                          setSelectedStudent(student);
                          setStudentSearch(student.name);
                          setIsDropdownOpen(false);
                        }}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors ${
                          selectedStudent?.id === student.id ? 'bg-indigo-50 dark:bg-indigo-950/60 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-300">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{student.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{student.className} • Roll: {student.rollNo}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            Bal: GHS {(student.totalFeesTarget - student.feesPaid).toFixed(0)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{student.guardianPhone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Preview Badge */}
              {selectedStudent && (
                <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedStudent.name}</span>
                        <span className="bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {selectedStudent.className}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Roll: <span className="text-slate-900 dark:text-slate-200 font-medium">{selectedStudent.rollNo}</span> • Guardian: <span className="text-slate-900 dark:text-slate-200">{selectedStudent.guardianName} ({selectedStudent.guardianPhone})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 w-full sm:w-auto justify-between sm:justify-start">
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Outstanding {categoryLabels[activeCategory].name}</div>
                      <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                        GHS {selectedStudentBalances.outstanding.toFixed(2)}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      selectedStudentBalances.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/30' :
                      selectedStudentBalances.status === 'partial' ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/30' :
                      'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-500/30'
                    }`}>
                      {selectedStudentBalances.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Amount Paid (GHS)</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Ghana Cedi (GH₵)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">GHS</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 rounded-xl pl-14 pr-4 py-3 text-lg font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[10, 20, 50, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddPreset(val)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-all active:scale-95"
                    >
                      +{val}
                    </button>
                  ))}
                  {selectedStudentBalances.outstanding > 0 && (
                    <button
                      type="button"
                      onClick={handlePayFull}
                      className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold rounded-lg transition-all active:scale-95 ml-auto"
                    >
                      Pay Full (GHS {selectedStudentBalances.outstanding.toFixed(0)})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Payment Method Selector
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === "cash"
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>💵 Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("momo")}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === "momo"
                        ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>📱 Mobile Money (MoMo)</span>
                  </button>
                </div>

                {paymentMethod === "momo" && (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-fade-in">
                    <select
                      value={momoNetwork}
                      onChange={(e) => setMomoNetwork(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="MTN MoMo">MTN MoMo</option>
                      <option value="Telecel Cash">Telecel Cash</option>
                      <option value="AT Money">AT Money</option>
                    </select>
                    <input
                      type="text"
                      value={momoRef}
                      onChange={(e) => setMomoRef(e.target.value)}
                      placeholder="Transaction Ref #"
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                )}

                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Reference / Note (e.g. Paid by Mother via MoMo Ref #12345)..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* SECTION C: ACTION */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!selectedStudent || !amountPaid || parseFloat(amountPaid) <= 0}
                className="w-full btn-primary py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span>🧾 Record Payment & Generate Receipt</span>
              </button>
            </div>
          </form>
        </section>

        {/* SECTION D: LIVE LEDGER TABLE */}
        <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📋 Live Class Ledger Table</span>
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {ledgerData.length} Students
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time payment balances and filter controls for quick follow-ups.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1 flex items-center gap-1 text-xs">
                {(["all", "unpaid", "partial", "paid"] as const).map(flt => (
                  <button
                    key={flt}
                    onClick={() => setTableFilter(flt)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                      tableFilter === flt 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {flt === 'all' ? 'All' : flt}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 sm:w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Filter table..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll #</th>
                  <th className="py-3 px-4">Category Target</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200 font-medium">
                {ledgerData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      No student records match the current filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  ledgerData.map(student => (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        selectedStudent?.id === student.id ? 'bg-indigo-50/50 dark:bg-indigo-950/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {student.name.charAt(0)}
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{student.rollNo}</td>
                      <td className="py-3 px-4">GHS {student.target.toFixed(2)}</td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">GHS {student.paid.toFixed(2)}</td>
                      <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-bold">GHS {student.outstanding.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          student.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/30' :
                          student.status === 'partial' ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/30' :
                          'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-500/30'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setStudentSearch(student.name);
                            window.scrollTo({ top: 100, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-lg text-[11px] font-bold transition-all"
                        >
                          Add Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* POST-PAYMENT MODAL */}
      {isReceiptModalOpen && lastRecordedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-slate-900 dark:text-white">
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center text-2xl animate-scale-in">
                ✓
              </div>
              <h3 className="text-lg font-bold">Payment Recorded Successfully</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Receipt generated and logged in school ledger.</p>
            </div>

            {/* A6 Printable Receipt Card */}
            <div id="printable-receipt" className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs text-slate-800 dark:text-slate-300">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3 space-y-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{schoolProfile?.name || "St. Peter's Basic School"}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{schoolProfile?.address || "Osu, Accra, Ghana"}</div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">OFFICIAL DIGITAL RECEIPT</div>
                <div className="text-[10px] text-slate-400">No: {lastRecordedReceipt.receiptNumber}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-900 dark:text-white">{lastRecordedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{lastRecordedReceipt.studentName} ({lastRecordedReceipt.className})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="text-indigo-600 dark:text-indigo-300 uppercase font-bold">{categoryLabels[lastRecordedReceipt.category].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="uppercase">{lastRecordedReceipt.paymentMethod} {lastRecordedReceipt.momoReference ? `(${lastRecordedReceipt.momoReference})` : ''}</span>
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">Amount Paid:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">GHS {lastRecordedReceipt.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Balance Remaining:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">GHS {lastRecordedReceipt.outstandingBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 dark:border-slate-800 pt-3 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <div>Issuer: School Bursar</div>
                  <div className="text-emerald-600 dark:text-emerald-500 font-bold">✓ Verified Digital Stamp</div>
                </div>
                <div className="text-right italic">
                  Thank you for payment
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition-all"
              >
                <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Print / Save A6 PDF Receipt</span>
              </button>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>📱 Parent SMS / WhatsApp Proof</span>
                  <span className="text-slate-500">{lastRecordedReceipt.guardianPhone}</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed font-sans">
                  "{smsDraft}"
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={copySmsDraft}
                    className="py-2 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{copiedDraft ? "Copied!" : "Copy SMS Draft"}</span>
                  </button>
                  <a
                    href={`https://wa.me/${lastRecordedReceipt.guardianPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(smsDraft)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <span>💬 Open WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
