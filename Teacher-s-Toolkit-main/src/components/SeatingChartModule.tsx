import React, { useState, useMemo } from 'react';
import { 
  Users, ArrowLeft, Grid, Shuffle, Printer, Sparkles, 
  UserCheck, AlertCircle, Eye, ShieldAlert, Check, RefreshCw, Move, Plus, Trash2, LayoutGrid
} from 'lucide-react';
import { GradedResult } from '../types';

interface SeatingChartModuleProps {
  onBack: () => void;
  resultsList: GradedResult[];
}

interface StudentSeat {
  id: string; // student candidate ID or unique ID
  name: string;
  className: string;
  specialNeeds?: string; // e.g. "Front Row - Vision", "Left-handed Desk"
  seatIndex: number; // 0-based grid position
}

// Default roster of Ghanaian students for classroom seating presets
const INITIAL_STUDENTS = [
  { id: "STUD_001", name: "John Doe", className: "JHS 2 Gold", specialNeeds: "Needs Front Desk (Vision)" },
  { id: "STUD_002", name: "Alice Johnson", className: "JHS 2 Gold", specialNeeds: "Left-handed" },
  { id: "STUD_003", name: "Michael Ampofo", className: "JHS 2 Gold" },
  { id: "STUD_004", name: "Grace Mensah", className: "JHS 2 Gold" },
  { id: "STUD_005", name: "David Osei", className: "JHS 2 Gold", specialNeeds: "Needs Front Desk (Attention)" },
  { id: "STUD_006", name: "Emmanuel Kwarteng", className: "JHS 2 Gold" },
  { id: "STUD_007", name: "Fatima Ibrahim", className: "JHS 2 Gold" },
  { id: "STUD_008", name: "Kofi Owusu", className: "JHS 2 Gold" },
  { id: "STUD_009", name: "Ama Serwaa", className: "JHS 2 Gold" },
  { id: "STUD_010", name: "Kwaku Bonsu", className: "JHS 2 Gold" },
  { id: "STUD_011", name: "Abena Appiah", className: "JHS 2 Gold" },
  { id: "STUD_012", name: "Samuel Addo", className: "JHS 2 Gold" },
  { id: "STUD_013", name: "Yaa Asantewaa", className: "JHS 2 Gold" },
  { id: "STUD_014", name: "Kwame Nkrumah", className: "JHS 2 Gold" },
  { id: "STUD_015", name: "Akua Donkor", className: "JHS 2 Gold" },
  { id: "STUD_016", name: "Gideon Agyeman", className: "JHS 2 Gold" },
  { id: "STUD_017", name: "Ebenezer Laryea", className: "JHS 2 Gold" },
  { id: "STUD_018", name: "Priscilla Tetteh", className: "JHS 2 Gold" },
  { id: "STUD_019", name: "Daniel Boateng", className: "JHS 2 Gold" },
  { id: "STUD_020", name: "Bernice Ansah", className: "JHS 2 Gold" },
];

export function SeatingChartModule({ onBack, resultsList }: SeatingChartModuleProps) {
  const [selectedClass, setSelectedClass] = useState<string>("JHS 2 Gold");
  const [gridColumns, setGridColumns] = useState<number>(5);
  const [gridRows, setGridRows] = useState<number>(4);
  const [layoutMode, setLayoutMode] = useState<"standard" | "exam" | "pods">("standard");
  const [selectedSeatIndex, setSelectedSeatIndex] = useState<number | null>(null);

  // Combine static initial roster with dynamic students scanned from OMR results
  const fullRoster = useMemo(() => {
    const map = new Map<string, { id: string; name: string; className: string; specialNeeds?: string }>();
    
    INITIAL_STUDENTS.forEach(s => map.set(s.id, s));

    resultsList.forEach(r => {
      if (r.candidateName && !map.has(r.candidateId)) {
        map.set(r.candidateId, {
          id: r.candidateId,
          name: r.candidateName,
          className: r.className || "JHS 2 Gold",
        });
      }
    });

    return Array.from(map.values());
  }, [resultsList]);

  // Filter roster by selected class
  const classRoster = useMemo(() => {
    return fullRoster.filter(s => s.className === selectedClass || selectedClass === "All Classes");
  }, [fullRoster, selectedClass]);

  // Map of seat index -> Student object assigned to that desk
  const [seatingAssignments, setSeatingAssignments] = useState<{ [seatIndex: number]: StudentSeat }>(() => {
    const initialMap: { [seatIndex: number]: StudentSeat } = {};
    INITIAL_STUDENTS.slice(0, 20).forEach((st, idx) => {
      initialMap[idx] = {
        ...st,
        seatIndex: idx
      };
    });
    return initialMap;
  });

  const totalDesks = gridColumns * gridRows;

  // List of unassigned students
  const assignedStudentIds = new Set((Object.values(seatingAssignments) as StudentSeat[]).map(s => s.id));
  const unassignedStudents = classRoster.filter(s => !assignedStudentIds.has(s.id));

  // Auto-arrange handlers
  const handleRandomizeSeating = () => {
    const shuffled = [...classRoster].sort(() => Math.random() - 0.5);
    const newAssignments: { [seatIndex: number]: StudentSeat } = {};
    
    shuffled.forEach((st, idx) => {
      if (idx < totalDesks) {
        newAssignments[idx] = {
          ...st,
          seatIndex: idx
        };
      }
    });

    setSeatingAssignments(newAssignments);
    setSelectedSeatIndex(null);
  };

  const handleExamModeArrange = () => {
    setLayoutMode("exam");
    // Stagger students in alternating desks to prevent eyes wandering
    const newAssignments: { [seatIndex: number]: StudentSeat } = {};
    let studentIndex = 0;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridColumns; col++) {
        const deskIndex = row * gridColumns + col;
        // Alternate seats (even row/col combinations)
        if ((row + col) % 2 === 0 && studentIndex < classRoster.length) {
          const st = classRoster[studentIndex];
          newAssignments[deskIndex] = {
            ...st,
            seatIndex: deskIndex
          };
          studentIndex++;
        }
      }
    }

    setSeatingAssignments(newAssignments);
    setSelectedSeatIndex(null);
  };

  const handleAssignStudentToSeat = (student: typeof classRoster[0], targetSeatIdx: number) => {
    // Remove student if already placed somewhere else
    const cleanMap = { ...seatingAssignments };
    Object.keys(cleanMap).forEach(k => {
      if (cleanMap[Number(k)]?.id === student.id) {
        delete cleanMap[Number(k)];
      }
    });

    cleanMap[targetSeatIdx] = {
      ...student,
      seatIndex: targetSeatIdx
    };

    setSeatingAssignments(cleanMap);
    setSelectedSeatIndex(null);
  };

  const handleUnassignSeat = (seatIdx: number) => {
    const updated = { ...seatingAssignments };
    delete updated[seatIdx];
    setSeatingAssignments(updated);
    setSelectedSeatIndex(null);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 pb-12">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              id="btn_back_seating_chart"
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-350"
              title="Go back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Classroom Seating & Desk Planner</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Exam & Daily Seating Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              id="btn_print_seating_chart"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Seating Plan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Toolbar & Controls Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            
            {/* Class Selection & Grid Size */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Classroom</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-emerald-500"
                >
                  <option value="JHS 2 Gold">JHS 2 Gold</option>
                  <option value="Primary 5 Emerald">Primary 5 Emerald</option>
                  <option value="SHS 1 General Arts">SHS 1 General Arts</option>
                  <option value="All Classes">All Classes</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Columns</label>
                <select
                  value={gridColumns}
                  onChange={(e) => setGridColumns(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-emerald-500"
                >
                  <option value={4}>4 Desks Wide</option>
                  <option value={5}>5 Desks Wide</option>
                  <option value={6}>6 Desks Wide</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rows</label>
                <select
                  value={gridRows}
                  onChange={(e) => setGridRows(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-emerald-500"
                >
                  <option value={3}>3 Rows Deep</option>
                  <option value={4}>4 Rows Deep</option>
                  <option value={5}>5 Rows Deep</option>
                </select>
              </div>
            </div>

            {/* Layout Preset Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn_arrange_standard"
                onClick={() => {
                  setLayoutMode("standard");
                  handleRandomizeSeating();
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  layoutMode === "standard"
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Daily Standard Grid</span>
              </button>

              <button
                type="button"
                id="btn_arrange_exam"
                onClick={handleExamModeArrange}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  layoutMode === "exam"
                    ? "bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-800 dark:text-amber-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Exam Anti-Cheating Layout</span>
              </button>

              <button
                type="button"
                id="btn_shuffle_seats"
                onClick={handleRandomizeSeating}
                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1"
                title="Shuffle seating"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>Class Roster: <strong className="text-slate-900 dark:text-white font-mono">{classRoster.length}</strong> Students</span>
              <span>Seated: <strong className="text-emerald-600 font-mono">{Object.keys(seatingAssignments).length}</strong></span>
              <span>Unassigned: <strong className="text-amber-600 font-mono">{unassignedStudents.length}</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 italic">Click any desk to change or reassign student seat placement</p>
          </div>
        </div>

        {/* Main Seating Canvas & Unassigned Roster Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Seating Grid Canvas */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 printable-sheet">
            
            {/* Front Stage / Chalkboard */}
            <div className="bg-slate-800 dark:bg-slate-950 text-slate-200 p-2.5 rounded-xl text-center space-y-0.5 border-2 border-dashed border-slate-600">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                FRONT OF CLASSROOM / CHALKBOARD & TEACHER'S DESK
              </span>
              <p className="text-[9px] text-slate-400">All students face this direction</p>
            </div>

            {/* Desks Layout Grid */}
            <div 
              className="grid gap-3 sm:gap-4 transition-all"
              style={{
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: totalDesks }).map((_, deskIdx) => {
                const row = Math.floor(deskIdx / gridColumns);
                const col = deskIdx % gridColumns;
                const seatCode = `${String.fromCharCode(65 + row)}${col + 1}`; // e.g. A1, A2
                const student = seatingAssignments[deskIdx];
                const isSelected = selectedSeatIndex === deskIdx;

                return (
                  <div
                    key={deskIdx}
                    onClick={() => setSelectedSeatIndex(isSelected ? null : deskIdx)}
                    className={`p-3 rounded-xl border text-left transition duration-150 cursor-pointer relative flex flex-col justify-between min-h-[95px] ${
                      student
                        ? isSelected
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-emerald-400"
                        : "border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/20 hover:bg-slate-100/80"
                    }`}
                  >
                    {/* Desk Code Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase">
                        Desk {seatCode}
                      </span>
                      {student?.specialNeeds && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title={student.specialNeeds} />
                      )}
                    </div>

                    {student ? (
                      <div className="my-1 space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {student.name}
                        </p>
                        <p className="text-[9px] font-mono text-slate-400 font-semibold">
                          {student.id}
                        </p>
                        {student.specialNeeds && (
                          <span className="text-[8px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.2 rounded inline-block truncate max-w-full font-bold">
                            {student.specialNeeds}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="my-auto text-center py-2">
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 block">
                          Empty Seat
                        </span>
                      </div>
                    )}

                    {/* Desk Action Tool on Click */}
                    {isSelected && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
                        {student ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnassignSeat(deskIdx);
                            }}
                            className="text-rose-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Vacate</span>
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold">Pick student on right</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Unassigned Students & Seat Assignment Sidebar */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Roster & Unseated Students</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {selectedSeatIndex !== null
                  ? `Select a student below to seat at Desk #${selectedSeatIndex + 1}`
                  : "Click a student to assign or swap seats"}
              </p>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {classRoster.map((st) => {
                const assignedDeskIdx = Object.keys(seatingAssignments).find(
                  k => seatingAssignments[Number(k)]?.id === st.id
                );
                const isAssigned = assignedDeskIdx !== undefined;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      if (selectedSeatIndex !== null) {
                        handleAssignStudentToSeat(st, selectedSeatIndex);
                      } else {
                        // Find first empty desk
                        const emptyIdx = Array.from({ length: totalDesks }).findIndex(
                          (_, idx) => !seatingAssignments[idx]
                        );
                        if (emptyIdx !== -1) {
                          handleAssignStudentToSeat(st, emptyIdx);
                        } else {
                          alert("All desks are currently occupied! Increase grid dimensions or vacate a seat.");
                        }
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      isAssigned
                        ? "border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400"
                        : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-500"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{st.name}</p>
                      <p className="text-[9px] font-mono text-slate-400">{st.id}</p>
                    </div>

                    <div>
                      {isAssigned ? (
                        <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Desk #{Number(assignedDeskIdx) + 1}
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          <span>Assign</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
