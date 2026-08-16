import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Calendar, Check, X, Clock, User, Plus, Trash2, Users, 
  TrendingUp, Sparkles, Download, Search, Share2, CheckCircle2, 
  AlertCircle, Filter, CalendarDays, FileText, PieChart, Info, MoreHorizontal
} from "lucide-react";

interface AttendanceRecord {
  id: string; // class_date
  date: string; // YYYY-MM-DD
  className: string;
  totalCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  statuses: { [studentName: string]: "Present" | "Absent" | "Late" };
}

interface AttendanceModuleProps {
  onBack: () => void;
  resultsList: any[];
}

// Pre-seeded lists of students for default classes
const DEFAULT_ROSTERS: { [className: string]: string[] } = {
  "JHS 2 Gold": [
    "Kojo Mensah",
    "Ama Serwaa",
    "Kwame Boateng",
    "Efua Ansah",
    "Yaw Osei",
    "Abena Appiah",
    "Emmanuel Owusu",
    "Sarah Jenkins",
    "Benjamin Thompson",
    "Michael Rodriguez"
  ],
  "Grade 10-A": [
    "John Doe",
    "Alice Johnson",
    "Kofi Appiah",
    "Ama Mensah",
    "Kwesi Boateng",
    "Grace Ansah",
    "Richard Osei"
  ],
  "JHS 3 Diamond": [
    "Derrick Mensah",
    "Phyllis Serwaa",
    "Clement Boateng",
    "Mercy Ansah",
    "Stephen Osei",
    "Blessing Appiah"
  ]
};

export function AttendanceModule({ onBack, resultsList }: AttendanceModuleProps) {
  // Available Classes list
  const [classesList, setClassesList] = useState<string[]>(() => {
    // Get unique classes from resultsList, plus standard defaults
    const list = new Set(["JHS 2 Gold", "Grade 10-A", "JHS 3 Diamond"]);
    resultsList.forEach(r => {
      if (r.className) list.add(r.className);
    });
    return Array.from(list);
  });

  const [selectedClass, setSelectedClass] = useState<string>("JHS 2 Gold");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Current classroom roster for the selected class
  const [roster, setRoster] = useState<string[]>([]);
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [rosterSearch, setRosterSearch] = useState<string>("");

  // All historical records loaded from localStorage
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>(() => {
    const cached = localStorage.getItem("omr_attendance_records");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    
    // Seed standard dummy history records for the default class
    const seed: AttendanceRecord[] = [];
    const JHS_2_Gold_Students = DEFAULT_ROSTERS["JHS 2 Gold"];
    
    // Generate past 5 school days
    const today = new Date();
    for (let i = 5; i >= 1; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends
      
      const dateStr = d.toISOString().split("T")[0];
      const statuses: { [key: string]: "Present" | "Absent" | "Late" } = {};
      
      let pCount = 0;
      let aCount = 0;
      let lCount = 0;

      JHS_2_Gold_Students.forEach((student, index) => {
        // Random statuses with high present weight
        let status: "Present" | "Absent" | "Late" = "Present";
        const rand = Math.random();
        if (rand < 0.1) {
          status = "Absent";
          aCount++;
        } else if (rand < 0.22) {
          status = "Late";
          lCount++;
        } else {
          pCount++;
        }
        statuses[student] = status;
      });

      seed.push({
        id: `att_jhs_2_gold_${dateStr}`,
        date: dateStr,
        className: "JHS 2 Gold",
        totalCount: JHS_2_Gold_Students.length,
        presentCount: pCount,
        absentCount: aCount,
        lateCount: lCount,
        statuses
      });
    }

    localStorage.setItem("omr_attendance_records", JSON.stringify(seed));
    return seed;
  });

  // Load custom student rosters from localStorage if saved, or fallback to DEFAULT_ROSTERS
  const [customRosters, setCustomRosters] = useState<{ [className: string]: string[] }>(() => {
    const cached = localStorage.getItem("omr_custom_rosters");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return DEFAULT_ROSTERS;
      }
    }
    return DEFAULT_ROSTERS;
  });

  // Synchronize current roster when class selection changes
  useEffect(() => {
    const classRoster = customRosters[selectedClass] || DEFAULT_ROSTERS[selectedClass] || [];
    setRoster(classRoster);
  }, [selectedClass, customRosters]);

  // Keep custom rosters in sync with localStorage
  useEffect(() => {
    localStorage.setItem("omr_custom_rosters", JSON.stringify(customRosters));
  }, [customRosters]);

  // Keep records in sync with localStorage
  useEffect(() => {
    localStorage.setItem("omr_attendance_records", JSON.stringify(historyRecords));
  }, [historyRecords]);

  // Current day statuses for active grid
  const [currentStatuses, setCurrentStatuses] = useState<{ [student: string]: "Present" | "Absent" | "Late" }>({});

  // When date or class changes, look up existing daily record, or default everyone to Present
  useEffect(() => {
    const existing = historyRecords.find(
      r => r.className === selectedClass && r.date === selectedDate
    );

    if (existing) {
      setCurrentStatuses(existing.statuses);
    } else {
      // Default state: all active roster is Present
      const defaultState: { [student: string]: "Present" | "Absent" | "Late" } = {};
      roster.forEach(student => {
        defaultState[student] = "Present";
      });
      setCurrentStatuses(defaultState);
    }
  }, [selectedClass, selectedDate, roster, historyRecords]);

  // Active statistics for currently displayed grid
  const gridStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;

    roster.forEach(student => {
      const status = currentStatuses[student] || "Present";
      if (status === "Present") present++;
      else if (status === "Absent") absent++;
      else if (status === "Late") late++;
    });

    const total = roster.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { present, absent, late, total, rate };
  }, [roster, currentStatuses]);

  // Save/commit attendance sheet for the selected date and class
  const handleSaveSheet = () => {
    if (roster.length === 0) {
      alert("No students in active class roster to register.");
      return;
    }

    // Build the sheet record
    const recordId = `att_${selectedClass.toLowerCase().replace(/\s+/g, "_")}_${selectedDate}`;
    const newRecord: AttendanceRecord = {
      id: recordId,
      date: selectedDate,
      className: selectedClass,
      totalCount: roster.length,
      presentCount: gridStats.present,
      absentCount: gridStats.absent,
      lateCount: gridStats.late,
      statuses: { ...currentStatuses }
    };

    // Replace or insert
    setHistoryRecords(prev => {
      const filtered = prev.filter(r => r.id !== recordId);
      return [newRecord, ...filtered];
    });

    alert(`Daily Attendance Sheet for ${selectedClass} (${selectedDate}) has been saved securely to local cache!`);
  };

  // Mark all students in the roster
  const handleMarkAll = (status: "Present" | "Absent" | "Late") => {
    const updated: { [student: string]: "Present" | "Absent" | "Late" } = {};
    roster.forEach(s => {
      updated[s] = status;
    });
    setCurrentStatuses(updated);
  };

  // Add student to the class roster dynamically
  const handleAddStudentToRoster = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newStudentName.trim();
    if (!cleanName) return;

    if (roster.includes(cleanName)) {
      alert("This student name is already in the class roster.");
      return;
    }

    // Update custom rosters state
    setCustomRosters(prev => {
      const currentClassList = prev[selectedClass] || [];
      return {
        ...prev,
        [selectedClass]: [...currentClassList, cleanName]
      };
    });

    // Automatically set status for new student
    setCurrentStatuses(prev => ({
      ...prev,
      [cleanName]: "Present"
    }));

    setNewStudentName("");
  };

  // Delete student from active roster
  const handleDeleteStudentFromRoster = (student: string) => {
    if (!confirm(`Are you sure you want to remove ${student} from the ${selectedClass} roster?`)) {
      return;
    }

    setCustomRosters(prev => {
      const currentClassList = prev[selectedClass] || [];
      return {
        ...prev,
        [selectedClass]: currentClassList.filter(s => s !== student)
      };
    });
  };

  // Create a new class dynamically
  const [showAddClassModal, setShowAddClassModal] = useState<boolean>(false);
  const [newClassNameInput, setNewClassNameInput] = useState<string>("");

  const handleCreateNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanClassName = newClassNameInput.trim();
    if (!cleanClassName) return;

    if (classesList.includes(cleanClassName)) {
      alert("Class already exists.");
      return;
    }

    setClassesList(prev => [...prev, cleanClassName]);
    setCustomRosters(prev => ({
      ...prev,
      [cleanClassName]: []
    }));
    setSelectedClass(cleanClassName);
    setNewClassNameInput("");
    setShowAddClassModal(false);
  };

  // Filtered Roster for local display search
  const filteredRoster = useMemo(() => {
    return roster.filter(student => 
      student.toLowerCase().includes(rosterSearch.toLowerCase())
    );
  }, [roster, rosterSearch]);

  // Calculate high-fidelity stats for Student Attendance summary (absenteeism alerts)
  const absenteeismSummary = useMemo(() => {
    const classRecords = historyRecords.filter(r => r.className === selectedClass);
    const summary: { [student: string]: { present: number; absent: number; late: number; total: number } } = {};

    // Initialize for everyone in the current roster
    roster.forEach(student => {
      summary[student] = { present: 0, absent: 0, late: 0, total: 0 };
    });

    // Populate across history
    classRecords.forEach(record => {
      roster.forEach(student => {
        const status = record.statuses[student];
        if (status) {
          summary[student].total++;
          if (status === "Present") summary[student].present++;
          else if (status === "Absent") summary[student].absent++;
          else if (status === "Late") summary[student].late++;
        }
      });
    });

    return Object.entries(summary).map(([name, stats]) => {
      const rate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 100;
      return { name, ...stats, rate };
    }).sort((a, b) => a.rate - b.rate); // Sort so the lowest attendance rate is at the top
  }, [roster, historyRecords, selectedClass]);

  // Attendance history records list for visual audit log
  const activeClassHistory = useMemo(() => {
    return historyRecords
      .filter(r => r.className === selectedClass)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [historyRecords, selectedClass]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* 1. Header Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Go Back Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Daily Attendance Register</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              Paperless Classroom Attendance Sheet
            </p>
          </div>
        </div>

        {/* Action Controls for Quick Selection */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Select Dropdown */}
          <div className="space-y-0.5">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-emerald-500 cursor-pointer"
            >
              {classesList.map(c => (
                <option key={c} value={c}>Class: {c}</option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-emerald-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowAddClassModal(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-slate-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Class</span>
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: ACTIVE REGISTER SHEET GRID (lg:col-span-8)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. Dynamic Sheet Controls & Live Counter Box */}
          <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  <span>Register Sheet: {selectedClass}</span>
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Mark daily student presence for <span className="text-slate-800 font-bold">{selectedDate}</span>
                </p>
              </div>

              {/* Quick Update Button triggers */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleMarkAll("Present")}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-150 transition"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll("Absent")}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg text-[10px] font-bold border border-red-150 transition"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Live Stats Ribbon */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today Attendance</span>
                <span className="text-xl font-black text-emerald-600 font-mono mt-0.5 block">{gridStats.rate}%</span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Present</span>
                <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">{gridStats.present}</span>
              </div>
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Late</span>
                <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">{gridStats.late}</span>
              </div>
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Absent</span>
                <span className="text-xl font-black text-red-700 font-mono mt-0.5 block">{gridStats.absent}</span>
              </div>
            </div>
          </div>

          {/* B. Student list Search and Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            
            {/* List Header Search */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search students in active roster..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs font-semibold text-slate-800 focus:outline-emerald-500"
                />
              </div>

              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                {filteredRoster.length} candidate{filteredRoster.length !== 1 ? "s" : ""} listed
              </div>
            </div>

            {/* Main Interactive Roll-call Sheet */}
            {filteredRoster.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">No students found</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Add students using the roster manager or alter your search filters.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRoster.map((student, idx) => {
                  const status = currentStatuses[student] || "Present";

                  return (
                    <div 
                      key={student} 
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition ${
                        status === "Absent" ? "bg-red-50/10" : ""
                      }`}
                    >
                      {/* Name with roll label */}
                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-mono text-[10px] font-bold border border-slate-200">
                          {(idx + 1).toString().padStart(2, "0")}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{student}</h4>
                          <p className="text-[9px] text-slate-400 font-mono tracking-wide">Candidate Roll • {selectedClass}</p>
                        </div>
                      </div>

                      {/* Interactive Selection Pills */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {/* Present Option */}
                        <button
                          onClick={() => {
                            setCurrentStatuses(prev => ({ ...prev, [student]: "Present" }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 transition ${
                            status === "Present"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        {/* Late Option */}
                        <button
                          onClick={() => {
                            setCurrentStatuses(prev => ({ ...prev, [student]: "Late" }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 transition ${
                            status === "Late"
                              ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>

                        {/* Absent Option */}
                        <button
                          onClick={() => {
                            setCurrentStatuses(prev => ({ ...prev, [student]: "Absent" }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 transition ${
                            status === "Absent"
                              ? "bg-red-600 text-white shadow-md shadow-red-500/10"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <div className="w-px h-5 bg-slate-200 mx-1.5" />

                        {/* Delete candidate from this active class */}
                        <button
                          onClick={() => handleDeleteStudentFromRoster(student)}
                          className="p-1.5 text-slate-350 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                          title="Remove student from roster"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Save sheet submit bar */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Attendance counts link automatically to the Terminal Report card generator.</span>
              </div>

              <button
                onClick={handleSaveSheet}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition whitespace-nowrap"
              >
                Save Attendance Sheet
              </button>
            </div>
          </div>

          {/* C. Quick Add Student to active roster */}
          <form onSubmit={handleAddStudentToRoster} className="glass-card rounded-2xl p-5 shadow-sm space-y-3">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Quick Roster Manager</h3>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">Enrich active class roster with missing candidates</p>
            </div>

            <div className="flex gap-2.5">
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Type new candidate's full name (e.g. Kofi Appiah)..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-emerald-500 text-slate-800"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>
          </form>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: ANALYTICS & RECENT LOGS (lg:col-span-4)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Overall absenteeism Alerts / Roster Report Rate */}
          <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>Cumulative Attendance Audit</span>
              </h3>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">
                Class Attendance average across past logs
              </p>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto divide-y divide-slate-50">
              {absenteeismSummary.map((student) => {
                const isAlert = student.rate < 85;

                return (
                  <div key={student.name} className="pt-2 pb-1.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block truncate max-w-[160px]">{student.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        P: {student.present} • L: {student.late} • A: {student.absent}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <span className={`font-mono font-black ${isAlert ? "text-red-600 font-bold" : "text-slate-700"}`}>
                        {student.rate}%
                      </span>
                      {isAlert && (
                        <span className="block text-[8px] font-black text-red-500 uppercase tracking-wider">
                          Poor Attendance
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Visual Audit Log / past registers */}
          <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Saved Registers Log</span>
              </h3>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">Historical sheets for {selectedClass}</p>
            </div>

            {activeClassHistory.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No past daily sheets saved yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {activeClassHistory.map((record) => {
                  const rate = record.totalCount > 0 
                    ? Math.round(((record.presentCount + record.lateCount) / record.totalCount) * 100) 
                    : 0;

                  return (
                    <button
                      key={record.id}
                      onClick={() => {
                        setSelectedDate(record.date);
                      }}
                      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-slate-50 transition flex items-center justify-between gap-3 bg-slate-50/30"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-850 block">{record.date}</span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          Pres: {record.presentCount} • Abs: {record.absentCount} • Late: {record.lateCount}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-emerald-600 block">{rate}%</span>
                        <span className="text-[8px] text-slate-400 uppercase font-bold block">Open Sheet</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Export / Backup Logs */}
          <div className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl space-y-3.5 shadow-md">
            <div>
              <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase block">Data Backup</span>
              <h4 className="text-xs font-black text-white mt-0.5">Spreadsheet CSV Backups</h4>
              <p className="text-[10px] text-emerald-300 leading-relaxed mt-1">
                Download a fully formatted CSV roster representing all student attendance ratios to open in Excel or print.
              </p>
            </div>

            <button
              onClick={() => {
                let csv = "Student Name,Total Days,Present Count,Late Count,Absent Count,Attendance Rate\n";
                absenteeismSummary.forEach(s => {
                  csv += `"${s.name}",${s.total},${s.present},${s.late},${s.absent},${s.rate}%\n`;
                });

                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.setAttribute("download", `attendance_summary_${selectedClass.toLowerCase().replace(/\s+/g, "_")}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition text-center block shadow"
            >
              Export Attendance Summary CSV
            </button>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* ADD CLASS MODAL DIALOG                                   */}
      {/* ======================================================== */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-250 flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase">Create New Roster Class</h4>
              <button 
                onClick={() => setShowAddClassModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewClass} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class Name</label>
                <input
                  type="text"
                  required
                  value={newClassNameInput}
                  onChange={(e) => setNewClassNameInput(e.target.value)}
                  placeholder="e.g. JHS 1 Blue"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
