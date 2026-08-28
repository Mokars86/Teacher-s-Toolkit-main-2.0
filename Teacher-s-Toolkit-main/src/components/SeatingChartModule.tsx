import React, { useState, useMemo } from 'react';
import { 
  Users, ArrowLeft, Grid, Shuffle, Printer, Sparkles, 
  UserCheck, AlertCircle, Eye, ShieldAlert, Check, RefreshCw, Move, Plus, Trash2, LayoutGrid, Layers
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
  deskIndex: number; // 0-based grid position of the desk
  slotIndex: number; // 0-based slot inside the desk (0, 1, 2)
  seatKey: string; // `${deskIndex}_${slotIndex}`
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
  const [gridColumns, setGridColumns] = useState<number>(4);
  const [gridRows, setGridRows] = useState<number>(3);
  const [deskCapacity, setDeskCapacity] = useState<number>(2); // 1 = Single Desk, 2 = Dual Desk, 3 = Triple Desk
  const [layoutMode, setLayoutMode] = useState<"standard" | "exam" | "pods">("standard");
  const [selectedSeatKey, setSelectedSeatKey] = useState<string | null>(null);

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

  // Map of seatKey `${deskIndex}_${slotIndex}` -> StudentSeat object assigned to that desk slot
  const [seatingAssignments, setSeatingAssignments] = useState<{ [seatKey: string]: StudentSeat }>(() => {
    const initialMap: { [seatKey: string]: StudentSeat } = {};
    // Default initial seating into dual desks (2 seats per desk)
    INITIAL_STUDENTS.slice(0, 20).forEach((st, idx) => {
      const deskIndex = Math.floor(idx / 2);
      const slotIndex = idx % 2;
      const key = `${deskIndex}_${slotIndex}`;
      initialMap[key] = {
        ...st,
        deskIndex,
        slotIndex,
        seatKey: key,
      };
    });
    return initialMap;
  });

  const totalDesks = gridColumns * gridRows;
  const totalSeats = totalDesks * deskCapacity;

  // List of assigned & unassigned students
  const assignedStudentIds = new Set(Object.values(seatingAssignments).map((s: StudentSeat) => s.id));
  const unassignedStudents = classRoster.filter(s => !assignedStudentIds.has(s.id));

  // Auto-arrange handlers
  const handleRandomizeSeating = () => {
    const shuffled = [...classRoster].sort(() => Math.random() - 0.5);
    const newAssignments: { [seatKey: string]: StudentSeat } = {};
    
    let seatCount = 0;
    for (let d = 0; d < totalDesks; d++) {
      for (let s = 0; s < deskCapacity; s++) {
        if (seatCount < shuffled.length) {
          const st = shuffled[seatCount];
          const key = `${d}_${s}`;
          newAssignments[key] = {
            ...st,
            deskIndex: d,
            slotIndex: s,
            seatKey: key,
          };
          seatCount++;
        }
      }
    }

    setSeatingAssignments(newAssignments);
    setSelectedSeatKey(null);
  };

  const handleExamModeArrange = () => {
    setLayoutMode("exam");
    // In Exam anti-cheating layout: 1 student per desk (slot 0) on alternating desks to prevent eyes wandering
    const newAssignments: { [seatKey: string]: StudentSeat } = {};
    let studentIndex = 0;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridColumns; col++) {
        const deskIndex = row * gridColumns + col;
        // Alternate desks (even row + col)
        if ((row + col) % 2 === 0 && studentIndex < classRoster.length) {
          const st = classRoster[studentIndex];
          const key = `${deskIndex}_0`;
          newAssignments[key] = {
            ...st,
            deskIndex,
            slotIndex: 0,
            seatKey: key,
          };
          studentIndex++;
        }
      }
    }

    setSeatingAssignments(newAssignments);
    setSelectedSeatKey(null);
  };

  const handleAssignStudentToSeat = (student: typeof classRoster[0], targetSeatKey: string) => {
    const [deskIdxStr, slotIdxStr] = targetSeatKey.split('_');
    const deskIndex = Number(deskIdxStr);
    const slotIndex = Number(slotIdxStr);

    // Remove student if already placed somewhere else
    const cleanMap = { ...seatingAssignments };
    Object.keys(cleanMap).forEach(k => {
      if (cleanMap[k]?.id === student.id) {
        delete cleanMap[k];
      }
    });

    cleanMap[targetSeatKey] = {
      ...student,
      deskIndex,
      slotIndex,
      seatKey: targetSeatKey,
    };

    setSeatingAssignments(cleanMap);
    setSelectedSeatKey(null);
  };

  const handleUnassignSeat = (targetSeatKey: string) => {
    const updated = { ...seatingAssignments };
    delete updated[targetSeatKey];
    setSeatingAssignments(updated);
    setSelectedSeatKey(null);
  };

  const findFirstAvailableSeatKey = (): string | null => {
    for (let d = 0; d < totalDesks; d++) {
      for (let s = 0; s < deskCapacity; s++) {
        const key = `${d}_${s}`;
        if (!seatingAssignments[key]) {
          return key;
        }
      }
    }
    return null;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 pb-12">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
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
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-widest uppercase font-bold">1-Seater, 2-Seater & 3-Seater Desk Engine</p>
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

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Toolbar & Controls Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            
            {/* Class Selection, Grid Dimensions & Desk Capacity Selector */}
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

              {/* DESK CAPACITY COLUMNS SELECTOR: 1, 2, or 3 Seats per Desk */}
              <div>
                <label className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Desk Type (Seats per Desk)
                </label>
                <select
                  id="select_desk_capacity"
                  value={deskCapacity}
                  onChange={(e) => {
                    setDeskCapacity(Number(e.target.value));
                    setSelectedSeatKey(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-black focus:outline-emerald-500 shadow-xs"
                >
                  <option value={1}>1-Student Desk (Mono Desk)</option>
                  <option value={2}>2-Student Desk (Dual Bench - Standard)</option>
                  <option value={3}>3-Student Desk (Triple Bench)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Desk Columns</label>
                <select
                  value={gridColumns}
                  onChange={(e) => setGridColumns(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-emerald-500"
                >
                  <option value={3}>3 Desk Columns</option>
                  <option value={4}>4 Desk Columns</option>
                  <option value={5}>5 Desk Columns</option>
                  <option value={6}>6 Desk Columns</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Desk Rows</label>
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
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-400 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Standard Fill</span>
              </button>

              <button
                type="button"
                id="btn_arrange_exam"
                onClick={handleExamModeArrange}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  layoutMode === "exam"
                    ? "bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-800 dark:text-amber-400 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Exam Anti-Cheating</span>
              </button>

              <button
                type="button"
                id="btn_shuffle_seats"
                onClick={handleRandomizeSeating}
                className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1"
                title="Shuffle seating arrangement"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span>Class Roster: <strong className="text-slate-900 dark:text-white font-mono">{classRoster.length}</strong> Students</span>
              <span>Desk Capacity: <strong className="text-emerald-600 font-mono">{deskCapacity} {deskCapacity === 1 ? 'Seat/Desk' : 'Seats/Desk'}</strong></span>
              <span>Total Seats: <strong className="text-blue-600 font-mono">{totalSeats}</strong> ({totalDesks} Desks)</span>
              <span>Seated: <strong className="text-emerald-600 font-mono">{Object.keys(seatingAssignments).length}</strong></span>
              <span>Unassigned: <strong className="text-amber-600 font-mono">{unassignedStudents.length}</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 italic">Click any desk slot to assign or vacate a student</p>
          </div>
        </div>

        {/* Main Seating Canvas & Unassigned Roster Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Seating Grid Canvas */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 printable-sheet">
            
            {/* Front Stage / Chalkboard */}
            <div className="bg-slate-800 dark:bg-slate-950 text-slate-200 p-2.5 rounded-xl text-center space-y-0.5 border-2 border-dashed border-slate-600 shadow-inner">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                FRONT OF CLASSROOM / CHALKBOARD & TEACHER'S DESK
              </span>
              <p className="text-[9px] text-slate-400">All students face forward towards chalkboard</p>
            </div>

            {/* Desks Layout Grid */}
            <div 
              className="grid gap-4 transition-all"
              style={{
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: totalDesks }).map((_, deskIdx) => {
                const row = Math.floor(deskIdx / gridColumns);
                const col = deskIdx % gridColumns;
                const deskLabel = `${String.fromCharCode(65 + row)}${col + 1}`; // e.g. A1, A2, B1

                return (
                  <div
                    key={deskIdx}
                    className="p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-amber-50/20 dark:bg-slate-950/60 shadow-xs space-y-2 relative"
                  >
                    {/* Desk Header Badge */}
                    <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        <span>Desk {deskLabel}</span>
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                        {deskCapacity === 1 ? 'Mono' : deskCapacity === 2 ? 'Dual Desk' : 'Triple Bench'}
                      </span>
                    </div>

                    {/* Desk Seats Slots Container (1, 2, or 3 seats side-by-side) */}
                    <div className={`grid gap-1.5 ${
                      deskCapacity === 1 ? 'grid-cols-1' :
                      deskCapacity === 2 ? 'grid-cols-2' :
                      'grid-cols-3'
                    }`}>
                      {Array.from({ length: deskCapacity }).map((_, slotIdx) => {
                        const seatKey = `${deskIdx}_${slotIdx}`;
                        const student = seatingAssignments[seatKey];
                        const isSelected = selectedSeatKey === seatKey;

                        return (
                          <div
                            key={seatKey}
                            onClick={() => setSelectedSeatKey(isSelected ? null : seatKey)}
                            className={`p-2 rounded-xl border text-left transition duration-150 cursor-pointer relative flex flex-col justify-between min-h-[85px] ${
                              student
                                ? isSelected
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/40"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 shadow-xs"
                                : isSelected
                                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30"
                                  : "border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/30 hover:bg-slate-100/90"
                            }`}
                          >
                            {/* Seat Number Tag */}
                            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                              <span>S{slotIdx + 1}</span>
                              {student?.specialNeeds && (
                                <span className="w-2 h-2 rounded-full bg-amber-500" title={student.specialNeeds} />
                              )}
                            </div>

                            {student ? (
                              <div className="my-0.5 space-y-0.5">
                                <p className="text-[11px] font-black text-slate-900 dark:text-white line-clamp-1 leading-tight">
                                  {student.name}
                                </p>
                                <p className="text-[8px] font-mono text-slate-400 font-bold">
                                  {student.id}
                                </p>
                                {student.specialNeeds && (
                                  <span className="text-[7.5px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1 py-0.2 rounded block truncate font-bold">
                                    {student.specialNeeds}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="my-auto text-center py-1">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 block">
                                  + Vacant
                                </span>
                              </div>
                            )}

                            {/* Slot Quick Action on Selection */}
                            {isSelected && (
                              <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px]">
                                {student ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnassignSeat(seatKey);
                                    }}
                                    className="text-rose-600 hover:underline font-extrabold flex items-center gap-0.5"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                    <span>Vacate</span>
                                  </button>
                                ) : (
                                  <span className="text-emerald-600 font-extrabold text-[8px]">Select on right</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Unassigned Students & Seat Assignment Sidebar */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Roster & Unseated Students</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {selectedSeatKey !== null
                  ? `Click a student below to seat at ${selectedSeatKey.split('_')[0] ? `Desk ${String.fromCharCode(65 + Math.floor(Number(selectedSeatKey.split('_')[0]) / gridColumns))}${Number(selectedSeatKey.split('_')[0]) % gridColumns + 1} (Seat ${Number(selectedSeatKey.split('_')[1]) + 1})` : 'Selected Seat'}`
                  : "Click any student to place in next vacant desk seat"}
              </p>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {classRoster.map((st) => {
                const assignedSeatKey = Object.keys(seatingAssignments).find(
                  k => seatingAssignments[k]?.id === st.id
                );
                const isAssigned = assignedSeatKey !== undefined;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      if (selectedSeatKey !== null) {
                        handleAssignStudentToSeat(st, selectedSeatKey);
                      } else {
                        const nextEmptyKey = findFirstAvailableSeatKey();
                        if (nextEmptyKey) {
                          handleAssignStudentToSeat(st, nextEmptyKey);
                        } else {
                          alert("All desks and seats are currently occupied! Increase desk capacity or add rows/columns.");
                        }
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      isAssigned
                        ? "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400"
                        : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-500 shadow-xs"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{st.name}</p>
                      <p className="text-[9px] font-mono text-slate-400">{st.id}</p>
                    </div>

                    <div>
                      {isAssigned && assignedSeatKey ? (
                        <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Desk {String.fromCharCode(65 + Math.floor(Number(assignedSeatKey.split('_')[0]) / gridColumns))}{(Number(assignedSeatKey.split('_')[0]) % gridColumns) + 1} (S{Number(assignedSeatKey.split('_')[1]) + 1})
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
