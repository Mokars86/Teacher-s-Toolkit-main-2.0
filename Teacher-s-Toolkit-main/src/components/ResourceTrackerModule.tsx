import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Package, CheckSquare, Square, Camera, Search, 
  RotateCcw, AlertTriangle, CheckCircle2, ChevronDown, Filter, 
  Plus, Sparkles, BookOpen, Layers, UserCheck, ShieldAlert, X
} from 'lucide-react';
import { InventoryItem, ResourceCategory, AssetCondition, ResourceDistribution } from '../types';

interface ResourceTrackerModuleProps {
  onBack: () => void;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
}

interface StudentItem {
  id: string;
  name: string;
  rollNo: string;
  className: string;
}

const MOCK_STUDENTS: StudentItem[] = [
  { id: "STU-001", name: "Kwesi Mensah", rollNo: "JHS2-001", className: "JHS 2 Gold" },
  { id: "STU-002", name: "Ama Osei-Bonsu", rollNo: "JHS2-002", className: "JHS 2 Gold" },
  { id: "STU-003", name: "Kofi Annan Jr.", rollNo: "JHS2-003", className: "JHS 2 Gold" },
  { id: "STU-004", name: "Abena Appiah", rollNo: "JHS2-004", className: "JHS 2 Gold" },
  { id: "STU-005", name: "Yaw Dankwa", rollNo: "JHS2-005", className: "JHS 2 Gold" },
  { id: "STU-006", name: "Efua Kyei", rollNo: "JHS1-012", className: "JHS 1 Emerald" },
  { id: "STU-007", name: "Kojo Adjei", rollNo: "P6-008", className: "Primary 6 Ruby" },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "INV-001", title: "GES B7 Core Science Textbook", code: "GES-SCI-B7", category: "textbook", totalInCabinet: 5, totalIssued: 45 },
  { id: "INV-002", title: "GES B8 Mathematics Textbook", code: "GES-MATH-B8", category: "textbook", totalInCabinet: 8, totalIssued: 42 },
  { id: "INV-003", title: "NaCCA English Reader B7", code: "NACCA-ENG-B7", category: "textbook", totalInCabinet: 12, totalIssued: 38 },
  { id: "INV-004", title: "School Exercise Book (Graph)", code: "EX-GRAPH-80P", category: "exercise_book", totalInCabinet: 120, totalIssued: 280 },
  { id: "INV-005", title: "Standard Mathematical Set", code: "MATH-SET-GH", category: "math_set", totalInCabinet: 15, totalIssued: 35 },
  { id: "INV-006", title: "School Crested Jersey Uniform", code: "UNI-JHS-M", category: "uniform", totalInCabinet: 10, totalIssued: 40 },
];

const INITIAL_DISTRIBUTIONS: ResourceDistribution[] = [
  { id: "DIST-001", studentId: "STU-001", studentName: "Kwesi Mensah", className: "JHS 2 Gold", itemTitle: "GES B7 Core Science Textbook", itemCategory: "textbook", serialNumber: "SN-SCI-9921", condition: "Good", issueDate: "2026-01-15", isReturned: false },
  { id: "DIST-002", studentId: "STU-003", studentName: "Kofi Annan Jr.", className: "JHS 2 Gold", itemTitle: "GES B7 Core Science Textbook", itemCategory: "textbook", serialNumber: "SN-SCI-9923", condition: "Fair", issueDate: "2026-01-15", isReturned: false },
  { id: "DIST-003", studentId: "STU-004", studentName: "Abena Appiah", className: "JHS 2 Gold", itemTitle: "GES B7 Core Science Textbook", itemCategory: "textbook", serialNumber: "SN-SCI-9924", condition: "Good", issueDate: "2026-01-15", isReturned: false },
  { id: "DIST-004", studentId: "STU-002", studentName: "Ama Osei-Bonsu", className: "JHS 2 Gold", itemTitle: "GES B8 Mathematics Textbook", itemCategory: "textbook", serialNumber: "SN-MATH-8812", condition: "New", issueDate: "2026-01-16", isReturned: true, returnDate: "2026-06-20" },
];

export function ResourceTrackerModule({ 
  onBack, 
  selectedClass, 
  setSelectedClass 
}: ResourceTrackerModuleProps) {
  const [activeMode, setActiveMode] = useState<"issue" | "return">("issue");
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [distributions, setDistributions] = useState<ResourceDistribution[]>(INITIAL_DISTRIBUTIONS);

  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("textbook");
  const [selectedItemCode, setSelectedItemCode] = useState<string>("GES-SCI-B7");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [condition, setCondition] = useState<AssetCondition>("Good");
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>(MOCK_STUDENTS[0].id);
  const [selectedBulkStudentIds, setSelectedBulkStudentIds] = useState<string[]>(
    MOCK_STUDENTS.map(s => s.id)
  );

  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const [returnTarget, setReturnTarget] = useState<ResourceDistribution | null>(null);
  const [returnCondition, setReturnCondition] = useState<AssetCondition>("Good");

  const classList = ["JHS 2 Gold", "JHS 1 Emerald", "Primary 6 Ruby", "School-Wide Ledger"];

  const activeItem = useMemo(() => {
    return inventory.find(i => i.code === selectedItemCode) || inventory[0];
  }, [inventory, selectedItemCode]);

  const unreturnedAssets = useMemo(() => {
    return distributions.filter(d => 
      !d.isReturned && 
      (selectedClass === "School-Wide Ledger" || d.className === selectedClass)
    );
  }, [distributions, selectedClass]);

  const classStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => selectedClass === "School-Wide Ledger" || s.className === selectedClass);
  }, [selectedClass]);

  const handleIssueSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const student = MOCK_STUDENTS.find(s => s.id === selectedStudentId);
    if (!student || !activeItem) return;

    const newDist: ResourceDistribution = {
      id: `DIST-${Date.now().toString().slice(-6)}`,
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      itemTitle: activeItem.title,
      itemCategory: activeItem.category,
      serialNumber: serialNumber.trim() || `SN-${activeItem.category.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      condition: condition,
      issueDate: new Date().toISOString().split('T')[0],
      isReturned: false
    };

    setDistributions(prev => [newDist, ...prev]);

    setInventory(prev => prev.map(inv => {
      if (inv.code === activeItem.code) {
        return {
          ...inv,
          totalIssued: inv.totalIssued + 1,
          totalInCabinet: Math.max(0, inv.totalInCabinet - 1)
        };
      }
      return inv;
    }));

    setSerialNumber("");
  };

  const handleIssueBulk = () => {
    if (selectedBulkStudentIds.length === 0 || !activeItem) return;

    const newDistros: ResourceDistribution[] = selectedBulkStudentIds.map(stId => {
      const st = MOCK_STUDENTS.find(s => s.id === stId)!;
      return {
        id: `DIST-${Date.now()}-${stId}`,
        studentId: st.id,
        studentName: st.name,
        className: st.className,
        itemTitle: activeItem.title,
        itemCategory: activeItem.category,
        condition: "New",
        issueDate: new Date().toISOString().split('T')[0],
        isReturned: false
      };
    });

    setDistributions(prev => [...newDistros, ...prev]);

    setInventory(prev => prev.map(inv => {
      if (inv.code === activeItem.code) {
        return {
          ...inv,
          totalIssued: inv.totalIssued + selectedBulkStudentIds.length,
          totalInCabinet: Math.max(0, inv.totalInCabinet - selectedBulkStudentIds.length)
        };
      }
      return inv;
    }));
  };

  const handleConfirmReturn = () => {
    if (!returnTarget) return;

    setDistributions(prev => prev.map(d => {
      if (d.id === returnTarget.id) {
        return {
          ...d,
          isReturned: true,
          returnDate: new Date().toISOString().split('T')[0],
          condition: returnCondition
        };
      }
      return d;
    }));

    setInventory(prev => prev.map(inv => {
      if (inv.title === returnTarget.itemTitle) {
        return {
          ...inv,
          totalIssued: Math.max(0, inv.totalIssued - 1),
          totalInCabinet: inv.totalInCabinet + 1
        };
      }
      return inv;
    }));

    setReturnTarget(null);
  };

  const handleSimulateScan = () => {
    setIsScannerOpen(true);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const generated = `SN-${activeItem.category.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setSerialNumber(generated);
      setIsScannerOpen(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col pb-24 transition-colors duration-200 animate-fade-in">
      {/* HEADER BAR */}
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
                <span className="text-xl">📦</span>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Resource Distribution Tracker</h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Inventory & Textbook Cabinet Allocation</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-semibold text-xs rounded-xl px-3 py-2 pr-7 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                {classList.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-1.5 flex items-center gap-3 shadow-inner">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{activeItem?.title.slice(0, 18)}...</div>
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {activeItem?.totalIssued} Issued <span className="text-slate-500 dark:text-slate-400 font-normal">/ {activeItem?.totalInCabinet} In Cabinet</span>
                </div>
              </div>
              <div className="w-12 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.round((activeItem?.totalIssued / (activeItem?.totalIssued + activeItem?.totalInCabinet)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 pt-6 space-y-6 flex-1">

        {/* SECTION A: MODE TOGGLE */}
        <section className="bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/80 rounded-2xl p-1.5 grid grid-cols-2 gap-1.5 shadow-md">
          <button
            onClick={() => setActiveMode("issue")}
            className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeMode === "issue"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 scale-[1.01]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            <span className="text-base">📤</span>
            <span>Issue / Hand Out Items</span>
          </button>

          <button
            onClick={() => setActiveMode("return")}
            className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeMode === "return"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 scale-[1.01]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            <span className="text-base">📥</span>
            <span>Collect / Log Returned Items</span>
          </button>
        </section>

        {/* SECTION B: ITEM SELECTION */}
        <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📦 Item & Inventory Selection</span>
                <span className="chip-emerald">Cabinet Stock: {activeItem?.totalInCabinet} available</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose resource category and target asset specifications.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Item Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const cat = e.target.value as ResourceCategory;
                  setSelectedCategory(cat);
                  const firstMatch = inventory.find(i => i.category === cat);
                  if (firstMatch) setSelectedItemCode(firstMatch.code);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-3 text-sm text-slate-900 dark:text-white focus:outline-none font-semibold"
              >
                <option value="textbook">📚 Textbooks (Tracked Assets)</option>
                <option value="exercise_book">📓 Exercise Books (Consumable)</option>
                <option value="uniform">👕 School Uniforms & Kits</option>
                <option value="math_set">📐 Mathematical Sets</option>
                <option value="sports_kit">⚽ Sports & Lab Equipment</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Resource Asset Title</label>
              <select
                value={selectedItemCode}
                onChange={(e) => setSelectedItemCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-3 text-sm text-slate-900 dark:text-white focus:outline-none font-semibold"
              >
                {inventory.filter(i => i.category === selectedCategory).map(item => (
                  <option key={item.code} value={item.code}>
                    {item.title} ({item.code}) - {item.totalInCabinet} in Cabinet
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCategory === "textbook" && activeMode === "issue" && (
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Serial Number / Asset ID</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Unique Barcode</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g. SN-SCI-9925"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                      <span>📸 Scan</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Asset Condition
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["New", "Good", "Fair", "Damaged"] as AssetCondition[]).map(cond => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setCondition(cond)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold border text-center transition-all ${
                          condition === cond
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION C: STUDENT DISTRIBUTION */}
        {activeMode === "issue" && (
          <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📤 Student Distribution Execution</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedCategory === 'textbook' ? 'Assign serial textbook to student profile' : 'Bulk check-off consumable items across class roster'}
                </p>
              </div>
            </div>

            {selectedCategory === "textbook" ? (
              <form onSubmit={handleIssueSingle} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-3 text-sm text-slate-900 dark:text-white focus:outline-none font-semibold"
                  >
                    {classStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.className} • Roll: {student.rollNo})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full btn-emerald py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>📦 Assign Asset to Student</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Class Checklist ({selectedBulkStudentIds.length} / {classStudents.length} selected)
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBulkStudentIds.length === classStudents.length) {
                        setSelectedBulkStudentIds([]);
                      } else {
                        setSelectedBulkStudentIds(classStudents.map(s => s.id));
                      }
                    }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {selectedBulkStudentIds.length === classStudents.length ? 'Deselect All' : 'Select All Class'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {classStudents.map(student => {
                    const isChecked = selectedBulkStudentIds.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedBulkStudentIds(prev => prev.filter(id => id !== student.id));
                          } else {
                            setSelectedBulkStudentIds(prev => [...prev, student.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                          isChecked 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-slate-900 dark:text-white' 
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-bold">{student.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{student.rollNo}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleIssueBulk}
                  disabled={selectedBulkStudentIds.length === 0}
                  className="w-full btn-emerald py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                >
                  <span>Mark All Selected as Issued ({selectedBulkStudentIds.length})</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* SECTION D: END-OF-TERM AUDIT */}
        <section className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📋 End-of-Term Audit & Asset Ledger</span>
                <span className="bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {unreturnedAssets.length} Unreturned Assets
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track outstanding textbooks and log condition changes on return.</p>
            </div>
          </div>

          {unreturnedAssets.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs animate-fade-in">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-800 dark:text-amber-300">⚠️ Audit Warning: {unreturnedAssets.length} High-Value Textbooks Unreturned in {selectedClass}</span>
                <p className="text-[11px] text-amber-700 dark:text-amber-200/80 mt-0.5">
                  Clear outstanding text allocations before issuing end-of-term terminal report cards.
                </p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Item Title</th>
                  <th className="py-3 px-4">Serial / Asset ID</th>
                  <th className="py-3 px-4">Issued Condition</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Return Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200 font-medium">
                {distributions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      No textbook distribution records logged yet.
                    </td>
                  </tr>
                ) : (
                  distributions.map(dist => (
                    <tr key={dist.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{dist.studentName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{dist.className}</div>
                      </td>
                      <td className="py-3 px-4">{dist.itemTitle}</td>
                      <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-300">{dist.serialNumber || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md text-[10px]">
                          {dist.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{dist.issueDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          dist.isReturned 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/30' 
                            : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/30'
                        }`}>
                          {dist.isReturned ? 'Returned' : 'Issued'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!dist.isReturned ? (
                          <button
                            onClick={() => {
                              setReturnTarget(dist);
                              setReturnCondition(dist.condition);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all"
                          >
                            Return Item
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Done ({dist.returnDate})</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* SCANNER MODAL */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Scanning Barcode / Serial Number...</span>
            </h3>
            <div className="w-full h-40 bg-slate-950 border-2 border-dashed border-emerald-500/60 rounded-2xl relative overflow-hidden flex items-center justify-center">
              <div className="w-full h-0.5 bg-emerald-500 shadow-lg shadow-emerald-500 animate-pulse absolute top-1/2 -translate-y-1/2" />
              <span className="text-xs text-slate-500">Align barcode within frame</span>
            </div>
            <p className="text-xs text-slate-400">Detecting code...</p>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {returnTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-slate-900 dark:text-white">
            <button
              onClick={() => setReturnTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold">Log Asset Return</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Returning <span className="text-indigo-600 dark:text-indigo-300 font-bold">{returnTarget.itemTitle}</span> from <span className="font-bold">{returnTarget.studentName}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Returned Condition</label>
              <div className="grid grid-cols-4 gap-2">
                {(["New", "Good", "Fair", "Damaged"] as AssetCondition[]).map(cond => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setReturnCondition(cond)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                      returnCondition === cond
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmReturn}
              className="w-full btn-emerald py-3 rounded-xl font-bold text-xs shadow-lg"
            >
              Confirm Return & Restock Cabinet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
