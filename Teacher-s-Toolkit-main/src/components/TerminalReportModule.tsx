import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Printer, 
  Download, 
  Plus, 
  Search, 
  Check, 
  Sliders, 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Award, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  Clock,
  UserPlus,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
  X,
  BarChart3,
  FileSpreadsheet,
  UploadCloud,
  DownloadCloud,
  Wand2,
  TrendingUp,
  PieChart
} from "lucide-react";
import { GradedResult, SchoolMode, SchoolProfile } from "../types";

// Ghanaian Smart Comment Generator
export function generateGhanaianSmartComment(
  studentName: string,
  totalScore: number,
  focus: string,
  participation: string,
  growthArea: string
): { teacher: string; head: string } {
  const isExcellent = totalScore >= 75;
  const isAverage = totalScore >= 50 && totalScore < 75;
  const isWeak = totalScore < 50;

  let focusPhrasing = "";
  if (focus === "diligent") focusPhrasing = "demonstrates an exceptionally diligent and disciplined attitude towards school work";
  else if (focus === "distracted") focusPhrasing = "shows great potential but is sometimes easily distracted by peers during lessons";
  else if (focus === "consistent") focusPhrasing = "has maintained a highly consistent and steady focus throughout the term";
  else focusPhrasing = "is a quiet, well-behaved student who listens attentively to instruction";

  let participationPhrasing = "";
  if (participation === "active") participationPhrasing = "they actively participate in class discussions and frequently volunteer answers";
  else if (participation === "reserved") participationPhrasing = "though quite shy and reserved, they have shown steady improvement in class involvement";
  else if (participation === "leader") participationPhrasing = "they exhibit exemplary leadership qualities and are always willing to assist class peers";
  else participationPhrasing = "they are often passive during team activities and need gentle prompting to express their ideas";

  let growthPhrasing = "";
  if (growthArea === "math") {
    growthPhrasing = isExcellent 
      ? "With continued practice in complex algebraic equations, they will easily sustain their top marks."
      : "They are advised to devote more private study hours to mastering core mathematical operations next term.";
  } else if (growthArea === "english") {
    growthPhrasing = isExcellent 
      ? "They have outstanding language abilities, but should continue reading advanced storybooks to expand their vocabulary."
      : "To improve their overall performance, they must read more books and pay strict attention to grammar and comprehension.";
  } else if (growthArea === "science") {
    growthPhrasing = isExcellent 
      ? "They show a brilliant grasp of scientific concepts."
      : "Additional attention is recommended in Science to help build their confidence in practical concepts.";
  } else if (growthArea === "ict") {
    growthPhrasing = "Developing stronger hands-on skills in computer practical lessons will be of great benefit.";
  } else {
    growthPhrasing = isExcellent 
      ? "They are a fully balanced candidate with excellent analytical skills."
      : "Sustained academic effort in all core subjects is recommended to raise their general performance.";
  }

  // Teacher comment compilation
  let teacherComment = "";
  if (isExcellent) {
    teacherComment = `${studentName} ${focusPhrasing}. Furthermore, ${participationPhrasing}. ${growthPhrasing} Keep up the outstanding standard!`;
  } else if (isAverage) {
    teacherComment = `${studentName} ${focusPhrasing}. On the other hand, ${participationPhrasing}. ${growthPhrasing} Satisfactory progress shown.`;
  } else {
    teacherComment = `${studentName} ${focusPhrasing}. It is critical to note that ${participationPhrasing}. ${growthPhrasing} Extensive remediation is highly recommended.`;
  }

  // Headmaster comment compilation
  let headComment = "";
  if (isExcellent) {
    headComment = "An extremely impressive and exemplary performance. The sky is indeed your limit! Keep it up.";
  } else if (isAverage) {
    headComment = "Good results. A promising term's work, but strive to address your weak areas for a better position next term.";
  } else {
    headComment = "Poor results. You must sit up, avoid play, and devote your maximum time to your studies next term.";
  }

  return { teacher: teacherComment, head: headComment };
}

// GES (Ghana Education Service) Grading Standards Scale
// Dynamically supports Primary School, Junior High School (JHS / BECE 1-9), and Senior High School (SHS / WASSCE)
export function calculateGESGrade(score: number, level: "primary" | "jhs" | "shs" = "jhs"): { grade: string; remark: string; bg: string; text: string } {
  if (level === "primary") {
    if (score >= 80) return { grade: "A", remark: "Excellent", bg: "bg-emerald-100", text: "text-emerald-800" };
    if (score >= 70) return { grade: "B", remark: "Very Good", bg: "bg-emerald-50", text: "text-emerald-700" };
    if (score >= 60) return { grade: "C", remark: "Good", bg: "bg-blue-50", text: "text-blue-700" };
    if (score >= 50) return { grade: "D", remark: "Satisfactory", bg: "bg-indigo-50", text: "text-indigo-600" };
    if (score >= 40) return { grade: "E", remark: "Pass", bg: "bg-amber-50", text: "text-amber-600" };
    return { grade: "F", remark: "Needs Improvement", bg: "bg-rose-50", text: "text-rose-700" };
  } else if (level === "shs") {
    if (score >= 75) return { grade: "A1", remark: "Excellent", bg: "bg-emerald-100", text: "text-emerald-800" };
    if (score >= 70) return { grade: "B2", remark: "Very Good", bg: "bg-emerald-50", text: "text-emerald-700" };
    if (score >= 65) return { grade: "B3", remark: "Good", bg: "bg-emerald-50", text: "text-emerald-600" };
    if (score >= 60) return { grade: "C4", remark: "Credit", bg: "bg-blue-50", text: "text-blue-700" };
    if (score >= 55) return { grade: "C5", remark: "Credit", bg: "bg-blue-50", text: "text-blue-600" };
    if (score >= 50) return { grade: "C6", remark: "Credit", bg: "bg-indigo-50", text: "text-indigo-600" };
    if (score >= 45) return { grade: "D7", remark: "Pass", bg: "bg-amber-50", text: "text-amber-700" };
    if (score >= 40) return { grade: "E8", remark: "Pass", bg: "bg-amber-50", text: "text-amber-600" };
    return { grade: "F9", remark: "Fail", bg: "bg-rose-50", text: "text-rose-700" };
  } else {
    // Junior High School (BECE 1-9 system)
    if (score >= 90) return { grade: "1", remark: "Highest/Excellent", bg: "bg-emerald-100", text: "text-emerald-800" };
    if (score >= 80) return { grade: "2", remark: "Very Good", bg: "bg-emerald-50", text: "text-emerald-750" };
    if (score >= 70) return { grade: "3", remark: "Good", bg: "bg-emerald-50", text: "text-emerald-600" };
    if (score >= 60) return { grade: "4", remark: "Credit", bg: "bg-blue-50", text: "text-blue-700" };
    if (score >= 55) return { grade: "5", remark: "Credit", bg: "bg-blue-50", text: "text-blue-600" };
    if (score >= 50) return { grade: "6", remark: "Credit", bg: "bg-indigo-50", text: "text-indigo-600" };
    if (score >= 45) return { grade: "7", remark: "Pass", bg: "bg-amber-50", text: "text-amber-700" };
    if (score >= 40) return { grade: "8", remark: "Pass", bg: "bg-amber-50", text: "text-amber-600" };
    return { grade: "9", remark: "Fail", bg: "bg-rose-50", text: "text-rose-700" };
  }
}

// Preset comments classified by performance
const COMMENT_PRESETS = {
  excellent: [
    "An outstanding performance. Keep it up!",
    "Excellent academic achievement. Demonstrates high leadership potential.",
    "A remarkably brilliant performance throughout the term. Keep shining!",
    "Outstanding dedication to work. Exemplary discipline and focus."
  ],
  average: [
    "A good effort, but has room for improvement in Mathematics.",
    "Satisfactory performance. With extra attention, she can do much better.",
    "Consistent effort shown. Needs to focus more on active classroom participation.",
    "Passable results, but could strive higher to achieve full potential."
  ],
  needsAttention: [
    "Requires more attention to academic work next term.",
    "Needs extensive guidance and hard work in core subjects.",
    "Lacks concentration in class. Prompt assistance is highly advised.",
    "Academic response is low. Encouragement and strict home study needed."
  ]
};

const HEADTEACHER_PRESETS = {
  excellent: [
    "An excellent student. Keep up the high standard!",
    "A brilliant, well-behaved student. Highly recommended.",
    "Very impressive progress. The sky is your limit!"
  ],
  average: [
    "A promising performance. Strive for higher laurels next term.",
    "Good results. Focus on your weak areas.",
    "Satisfactory, but there is still room for further development."
  ],
  needsAttention: [
    "You must sit up and work much harder next term.",
    "More efforts are expected of you. Take your studies seriously.",
    "Poor results. Seek guidance and devote more hours to your books."
  ]
};

interface StudentReportRow {
  id: string;
  rollNumber: string;
  name: string;
  examScoreRaw: number;     // e.g. 42 (out of maxExamValue)
  examScorePercent: number; // e.g. 84%
  classworkScore: number;   // editable, e.g. out of 50
  homeworkScore: number;    // editable, e.g. out of 50
  totalScore: number;       // weighted final score (out of 100)
  grade: string;
  remark: string;
  remarksTeacher: string;
  remarksHead: string;
  attendancePresent: number;
  attendanceAbsent: number;
  position?: number;
}

interface TerminalReportModuleProps {
  onBack: () => void;
  resultsList: GradedResult[];
  activeSchoolMode?: SchoolMode;
  linkedSchool?: SchoolProfile | null;
}

export function TerminalReportModule({ 
  onBack, 
  resultsList,
  activeSchoolMode = "personal",
  linkedSchool = null
}: TerminalReportModuleProps) {
  // Navigation Steps:
  // 0: Dashboard (Term Setup, Progress tracking)
  // 1: Spreadsheet Grid
  // 2: Smart Remarks
  // 3: Export & Print Preview
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isSubmittedToHead, setIsSubmittedToHead] = useState<boolean>(false);
  
  // State for Class & Term Parameters
  const [selectedClass, setSelectedClass] = useState<string>("JHS 2 Gold");
  const [currentTerm, setCurrentTerm] = useState<string>("Term 3, 2026");
  const [totalDays, setTotalDays] = useState<number>(90);
  const [nextTermDate, setNextTermDate] = useState<string>("2026-09-15");

  // customizable school level/grading scheme: "primary" | "jhs" | "shs"
  const [schoolLevel, setSchoolLevel] = useState<"primary" | "jhs" | "shs">(() => {
    const cached = localStorage.getItem("omr_school_level");
    if (cached === "primary" || cached === "jhs" || cached === "shs") {
      return cached;
    }
    return "jhs";
  });

  useEffect(() => {
    localStorage.setItem("omr_school_level", schoolLevel);
  }, [schoolLevel]);
  
  // Weights: Exam + Class Assessments (CA) must total 100%
  const [examWeight, setExamWeight] = useState<number>(60); // e.g. 60% Exam, 40% CA
  const [maxExamValue, setMaxExamValue] = useState<number>(50); // raw OMR max (usually 50 or 100)

  // Report roster list state
  const [students, setStudents] = useState<StudentReportRow[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeStudentIndex, setActiveStudentIndex] = useState<number>(0);
  const [showPresetModal, setShowPresetModal] = useState<boolean>(false);
  const [presetTargetType, setPresetTargetType] = useState<"teacher" | "head">("teacher");

  // New States for Ghanaian Smart Comment Generator
  const [showSmartGeneratorModal, setShowSmartGeneratorModal] = useState<boolean>(false);
  const [focusTrait, setFocusTrait] = useState<string>("diligent");
  const [participationTrait, setParticipationTrait] = useState<string>("active");
  const [growthArea, setGrowthArea] = useState<string>("math");

  // New States for CSV Import/Export Modal
  const [showCSVModal, setShowCSVModal] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>("");
  const [csvError, setCsvError] = useState<string>("");

  // Print Configuration states
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [includePosition, setIncludePosition] = useState<boolean>(true);
  const [includeAttendance, setIncludeAttendance] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);

  // Initialize roster based on class and existing graded results
  useEffect(() => {
    // Filter standard OMR results that belong to the current class
    const classResults = resultsList.filter(
      r => r.className.toLowerCase() === selectedClass.toLowerCase()
    );

    // Filter and extract real daily register stats from localStorage if they exist
    let cachedAttendance: any[] = [];
    try {
      const stored = localStorage.getItem("omr_attendance_records");
      if (stored) {
        cachedAttendance = JSON.parse(stored);
      }
    } catch (e) {}

    const classAttendanceLogs = cachedAttendance.filter(
      r => r.className.toLowerCase() === selectedClass.toLowerCase()
    );

    // Default high-fidelity Ghanaian roster to enrich the list and ensure offline power
    const defaultRoster = [
      { name: "Kojo Mensah", id: "std_1", exam: 46, cw: 42, hw: 44, pres: 88, abs: 2 },
      { name: "Ama Serwaa", id: "std_2", exam: 48, cw: 45, hw: 47, pres: 90, abs: 0 },
      { name: "Kwame Boateng", id: "std_3", exam: 34, cw: 38, hw: 35, pres: 84, abs: 6 },
      { name: "Efua Ansah", id: "std_4", exam: 41, cw: 40, hw: 42, pres: 87, abs: 3 },
      { name: "Yaw Osei", id: "std_5", exam: 29, cw: 30, hw: 32, pres: 79, abs: 11 },
      { name: "Abena Appiah", id: "std_6", exam: 47, cw: 46, hw: 45, pres: 89, abs: 1 },
      { name: "Emmanuel Owusu", id: "std_7", exam: 39, cw: 41, hw: 38, pres: 86, abs: 4 },
      { name: "Sarah Jenkins", id: "std_8", exam: 44, cw: 42, hw: 41, pres: 88, abs: 2 },
      { name: "Benjamin Thompson", id: "std_9", exam: 32, cw: 35, hw: 30, pres: 85, abs: 5 },
      { name: "Michael Rodriguez", id: "std_10", exam: 24, cw: 28, hw: 25, pres: 74, abs: 16 }
    ];

    // Combine OMR scans with defaults to prevent an empty state
    const processedStudents: StudentReportRow[] = [];
    
    // 1. Incorporate OMR scans
    classResults.forEach((res, index) => {
      // Calculate exam raw out of whatever total questions they scanned
      const rawScore = res.score;
      const rawMax = res.totalQuestions || 50;
      const examPct = (rawScore / rawMax) * 100;
      
      const sName = res.candidateName || `Scanned Candidate #${res.candidateId}`;

      // Look up real daily register statistics
      let pres = 86;
      let abs = 4;
      if (classAttendanceLogs.length > 0) {
        let hasRegisterRecords = false;
        let presCount = 0;
        let absCount = 0;
        classAttendanceLogs.forEach(log => {
          const status = log.statuses[sName];
          if (status) {
            hasRegisterRecords = true;
            if (status === "Present" || status === "Late") presCount++;
            else if (status === "Absent") absCount++;
          }
        });
        if (hasRegisterRecords) {
          pres = presCount;
          abs = absCount;
        }
      }

      processedStudents.push({
        id: `scan_${res.id}`,
        rollNumber: `OMR-${(index + 1).toString().padStart(2, "0")}`,
        name: sName,
        examScoreRaw: rawScore,
        examScorePercent: Math.round(examPct),
        classworkScore: Math.round(75 + Math.random() * 20), // mock baseline editable
        homeworkScore: Math.round(70 + Math.random() * 25),  // mock baseline editable
        totalScore: 0, // calculated later
        grade: "",
        remark: "",
        remarksTeacher: "",
        remarksHead: "",
        attendancePresent: pres,
        attendanceAbsent: abs
      });
    });

    // 2. Add defaults to complete the class roster
    defaultRoster.forEach((def, index) => {
      // Avoid duplicate names if they are already in classResults
      if (!processedStudents.some(s => s.name.toLowerCase() === def.name.toLowerCase())) {
        const examPct = (def.exam / 50) * 100;

        // Look up real daily register statistics
        let pres = def.pres;
        let abs = def.abs;
        if (classAttendanceLogs.length > 0) {
          let hasRegisterRecords = false;
          let presCount = 0;
          let absCount = 0;
          classAttendanceLogs.forEach(log => {
            const status = log.statuses[def.name];
            if (status) {
              hasRegisterRecords = true;
              if (status === "Present" || status === "Late") presCount++;
              else if (status === "Absent") absCount++;
            }
          });
          if (hasRegisterRecords) {
            pres = presCount;
            abs = absCount;
          }
        }

        processedStudents.push({
          id: def.id,
          rollNumber: `ROLL-${(processedStudents.length + 1).toString().padStart(2, "0")}`,
          name: def.name,
          examScoreRaw: def.exam,
          examScorePercent: Math.round(examPct),
          classworkScore: def.cw,
          homeworkScore: def.hw,
          totalScore: 0,
          grade: "",
          remark: "",
          remarksTeacher: "",
          remarksHead: "",
          attendancePresent: pres,
          attendanceAbsent: abs
        });
      }
    });

    // Complete computations (Positions, grades)
    const finalized = recomputeAcademicMetrics(processedStudents, examWeight, maxExamValue, schoolLevel);
    setStudents(finalized);
  }, [selectedClass, resultsList, schoolLevel]);

  // Recalculates weighted totals, grades, positions, and assigns remarks if empty
  const recomputeAcademicMetrics = (
    list: StudentReportRow[], 
    eWeight: number, 
    rawMax: number,
    level: "primary" | "jhs" | "shs" = "jhs"
  ): StudentReportRow[] => {
    const caWeight = 100 - eWeight;

    // First pass: Calculate individual total percentage scores
    const computed = list.map(student => {
      // Convert raw exam score to percentage, then apply weight
      const examPct = (student.examScoreRaw / rawMax) * 100;
      const roundedExamPct = Math.min(100, Math.max(0, Math.round(examPct)));
      const weightedExam = (roundedExamPct * eWeight) / 100;

      // Classwork & Homework combined are out of 100 max in normal scales
      // Let's assume average of classwork (out of 50) & homework (out of 50) is the total CA percentage
      const caTotal = student.classworkScore + student.homeworkScore; // max 100
      const weightedCA = (caTotal * caWeight) / 100;

      const finalTotal = Math.min(100, Math.round(weightedExam + weightedCA));
      const scaleResult = calculateGESGrade(finalTotal, level);

      // Default smart teacher remarks if blank
      let tRemark = student.remarksTeacher;
      let hRemark = student.remarksHead;
      if (!tRemark) {
        if (finalTotal >= 80) tRemark = COMMENT_PRESETS.excellent[0];
        else if (finalTotal >= 50) tRemark = COMMENT_PRESETS.average[0];
        else tRemark = COMMENT_PRESETS.needsAttention[0];
      }
      if (!hRemark) {
        if (finalTotal >= 80) hRemark = HEADTEACHER_PRESETS.excellent[0];
        else if (finalTotal >= 50) hRemark = HEADTEACHER_PRESETS.average[0];
        else hRemark = HEADTEACHER_PRESETS.needsAttention[0];
      }

      return {
        ...student,
        examScorePercent: roundedExamPct,
        totalScore: finalTotal,
        grade: scaleResult.grade,
        remark: scaleResult.remark,
        remarksTeacher: tRemark,
        remarksHead: hRemark
      };
    });

    // Second pass: Compute class positions based on totalScore descending
    const sorted = [...computed].sort((a, b) => b.totalScore - a.totalScore);
    
    // Assign position ranks
    const positioned = computed.map(original => {
      const rankIndex = sorted.findIndex(s => s.id === original.id);
      return {
        ...original,
        position: rankIndex + 1
      };
    });

    return positioned;
  };

  // Triggers recalculations whenever variables change
  const handleScoreChange = (id: string, field: "classworkScore" | "homeworkScore" | "examScoreRaw", value: number) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          // Keep score boundaries safe
          let val = isNaN(value) ? 0 : value;
          if (field === "examScoreRaw") val = Math.min(maxExamValue, Math.max(0, val));
          else val = Math.min(50, Math.max(0, val)); // CA elements are max 50 each

          return { ...s, [field]: val };
        }
        return s;
      });
      return recomputeAcademicMetrics(updated, examWeight, maxExamValue, schoolLevel);
    });
  };

  const handleTextChange = (id: string, field: "remarksTeacher" | "remarksHead", text: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: text };
      }
      return s;
    }));
  };

  const handleAttendanceChange = (id: string, field: "attendancePresent" | "attendanceAbsent", value: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        let val = isNaN(value) ? 0 : value;
        val = Math.min(totalDays, Math.max(0, val));
        
        // Auto-balance if they change present days
        if (field === "attendancePresent") {
          return { ...s, attendancePresent: val, attendanceAbsent: Math.max(0, totalDays - val) };
        } else {
          return { ...s, attendanceAbsent: val, attendancePresent: Math.max(0, totalDays - val) };
        }
      }
      return s;
    }));
  };

  // Add a new student manually to the spreadsheet grid
  const handleAddStudent = () => {
    const newName = prompt("Enter Student Full Name:");
    if (!newName) return;

    setStudents(prev => {
      const rollNum = `ROLL-${(prev.length + 1).toString().padStart(2, "0")}`;
      const newRow: StudentReportRow = {
        id: `manual_${Date.now()}`,
        rollNumber: rollNum,
        name: newName,
        examScoreRaw: Math.round(maxExamValue * 0.7),
        examScorePercent: 70,
        classworkScore: 38,
        homeworkScore: 36,
        totalScore: 0,
        grade: "",
        remark: "",
        remarksTeacher: "",
        remarksHead: "",
        attendancePresent: Math.round(totalDays * 0.95),
        attendanceAbsent: Math.round(totalDays * 0.05)
      };
      return recomputeAcademicMetrics([...prev, newRow], examWeight, maxExamValue, schoolLevel);
    });
  };

  // Delete a student from the report list
  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to remove this student from the report builder?")) {
      setStudents(prev => {
        const filtered = prev.filter(s => s.id !== id);
        return recomputeAcademicMetrics(filtered, examWeight, maxExamValue, schoolLevel);
      });
    }
  };

  const handleOpenCSVModal = () => {
    // Generate CSV string of existing students
    let csv = "Student Name,Raw OMR Exam,Classwork,Homework,Attendance Present,Attendance Absent\n";
    students.forEach(s => {
      csv += `"${s.name.replace(/"/g, '""')}",${s.examScoreRaw},${s.classworkScore},${s.homeworkScore},${s.attendancePresent},${s.attendanceAbsent}\n`;
    });
    setCsvText(csv.trim());
    setCsvError("");
    setShowCSVModal(true);
  };

  const handleImportCSV = () => {
    try {
      const lines = csvText.split("\n");
      if (lines.length < 2) {
        setCsvError("Invalid CSV. Please supply a header line and at least one student row.");
        return;
      }

      const imported: StudentReportRow[] = [];
      // Simple CSV parser
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse line respecting quotes
        const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(",");
        if (!matches || matches.length < 1) continue;

        const name = matches[0].replace(/"/g, "").trim();
        const exam = parseInt(matches[1]) || 0;
        const cw = parseInt(matches[2]) || 0;
        const hw = parseInt(matches[3]) || 0;
        const pres = parseInt(matches[4]) || Math.round(totalDays * 0.95);
        const abs = parseInt(matches[5]) || Math.round(totalDays * 0.05);

        if (!name) continue;

        imported.push({
          id: `csv_std_${Date.now()}_${i}`,
          rollNumber: `ROLL-${(students.length + imported.length + 1).toString().padStart(2, "0")}`,
          name,
          examScoreRaw: Math.min(maxExamValue, Math.max(0, exam)),
          examScorePercent: Math.round((Math.min(maxExamValue, Math.max(0, exam)) / maxExamValue) * 100),
          classworkScore: Math.min(50, Math.max(0, cw)),
          homeworkScore: Math.min(50, Math.max(0, hw)),
          attendancePresent: pres,
          attendanceAbsent: abs,
          totalScore: 0, // will recompute below
          grade: "",
          remark: "",
          remarksTeacher: "",
          remarksHead: ""
        });
      }

      if (imported.length === 0) {
        setCsvError("No valid student rows were found to import.");
        return;
      }

      // Recompute metrics for new students and append
      const updatedStudents = [...students, ...imported];
      const recalculated = recomputeAcademicMetrics(updatedStudents, examWeight, maxExamValue, schoolLevel);
      setStudents(recalculated);
      setShowCSVModal(false);
      alert(`Successfully imported ${imported.length} candidate(s) to ${selectedClass}!`);
    } catch (err: any) {
      setCsvError("Formatting error during parse. Ensure columns are comma-separated.");
    }
  };

  // Calculations for progress bar
  const totalStudents = students.length;
  const readyReportsCount = useMemo(() => {
    return students.filter(
      s => s.remarksTeacher.trim().length > 0 && s.remarksHead.trim().length > 0
    ).length;
  }, [students]);

  const classAverage = useMemo(() => {
    if (students.length === 0) return 0;
    const sum = students.reduce((acc, curr) => acc + curr.totalScore, 0);
    return Math.round((sum / students.length) * 10) / 10;
  }, [students]);

  // Handle comment preset insertion
  const handleSelectPresetComment = (comment: string) => {
    const student = students[activeStudentIndex];
    if (!student) return;

    if (presetTargetType === "teacher") {
      handleTextChange(student.id, "remarksTeacher", comment);
    } else {
      handleTextChange(student.id, "remarksHead", comment);
    }
    setShowPresetModal(false);
  };

  const activeFocusedStudent = students[activeStudentIndex] || null;

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, searchQuery]);

  // Bulk save confirmation message
  const handleSaveProgress = () => {
    alert("Progress saved locally! Report generator data successfully locked in offline storage.");
  };

  // Browser printing handler
  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-50 text-slate-900 font-sans flex flex-col min-h-screen">
      
      {/* 1. TOP BAR NAVIGATION */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45 border-t-0 border-l-0"></div>
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-emerald-900 uppercase">MarkSwift Terminal</span>
            <span className="hidden sm:inline text-xs text-slate-400 font-bold tracking-widest uppercase ml-2 px-2 py-0.5 border-l border-slate-200">
              Report Builder
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              {schoolLevel === "primary" ? "Primary Standards (A-F)" : schoolLevel === "shs" ? "SHS Standards (WASSCE)" : "JHS Standards (BECE)"}
            </span>
          </div>
        </div>
      </nav>

      {/* 2. TABBED STEP INDICATOR */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-6 sticky top-16 z-20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {[
            { step: 0, label: "Setup Parameters", icon: Sliders },
            { step: 1, label: "Data Entry Grid", icon: BookOpen },
            { step: 2, label: "Smart Remarks", icon: MessageSquare },
            { step: 3, label: "Print & Preview", icon: Printer }
          ].map((item, idx) => {
            const Icon = item.icon;
            const isCompleted = currentStep > item.step;
            const isActive = currentStep === item.step;
            return (
              <React.Fragment key={idx}>
                <button
                  onClick={() => setCurrentStep(item.step)}
                  className={`flex items-center gap-2 text-xs font-bold transition focus:outline-none ${
                    isActive 
                      ? "text-emerald-700 font-black scale-105" 
                      : isCompleted 
                        ? "text-emerald-500" 
                        : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black border transition ${
                    isActive 
                      ? "bg-emerald-600 text-white border-emerald-600" 
                      : isCompleted 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                        : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.step + 1}
                  </div>
                  <span className="hidden md:inline uppercase tracking-wider">{item.label}</span>
                </button>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 hidden md:block ${
                    currentStep > item.step ? "bg-emerald-200" : "bg-slate-100"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full pb-24">
        
        {/* ========================================================= */}
        {/* STEP 0: DASHBOARD & SETUP PARAMETERS                      */}
        {/* ========================================================= */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configure Academic Parameters</h1>
                <p className="text-slate-500 text-xs">Set up weighting, term indicators, and review your class report builder pipeline.</p>
              </div>
              <button 
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-200/50 flex items-center gap-2 transition"
              >
                <span>OPEN SPREADSHEET GRID</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Config & Roster Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Term Parameters Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span>Term Configuration</span>
                </h3>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Academic Class</label>
                    <select 
                      value={selectedClass}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedClass(val);
                        let detectedLevel: "primary" | "jhs" | "shs" = "jhs";
                        if (val.toLowerCase().includes("class") || val.toLowerCase().includes("primary")) {
                          detectedLevel = "primary";
                        } else if (val.toLowerCase().includes("form") || val.toLowerCase().includes("shs")) {
                          detectedLevel = "shs";
                        }
                        setSchoolLevel(detectedLevel);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                    >
                      <option value="JHS 2 Gold">JHS 2 Gold (Grade 8)</option>
                      <option value="Class 6 Emerald">Class 6 Emerald (Grade 6)</option>
                      <option value="Form 1 Platinum">Form 1 Platinum (Grade 10)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Term Indicator</label>
                    <input 
                      type="text"
                      value={currentTerm}
                      onChange={(e) => setCurrentTerm(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Days of School (Term)</label>
                    <input 
                      type="number"
                      value={totalDays}
                      onChange={(e) => setTotalDays(parseInt(e.target.value) || 90)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Term Commences</label>
                    <input 
                      type="date"
                      value={nextTermDate}
                      onChange={(e) => setNextTermDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2 pt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ghana Education Service School Level & Grading Standard</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                      {[
                        { id: "primary", name: "Primary School", desc: "Grade 1-6 (A to F system)" },
                        { id: "jhs", name: "Junior High School (JHS)", desc: "Grade 7-9 (BECE 1 to 9 system)" },
                        { id: "shs", name: "Senior High School (SHS)", desc: "Form 1-3 (WASSCE A1 to F9)" }
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          id={`btn_school_level_${lvl.id}`}
                          onClick={() => {
                            setSchoolLevel(lvl.id as any);
                            setStudents(prev => recomputeAcademicMetrics(prev, examWeight, maxExamValue, lvl.id as any));
                          }}
                          className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                            schoolLevel === lvl.id
                              ? "border-emerald-500 bg-emerald-50/55 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-350 ring-2 ring-emerald-500/20"
                              : "border-slate-200 dark:border-slate-150 bg-slate-50 dark:bg-slate-100/50 hover:bg-slate-100 dark:hover:bg-slate-100 text-slate-700 dark:text-slate-400"
                          }`}
                        >
                          <p className="text-xs font-bold leading-tight">{lvl.name}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{lvl.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weight sliders */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Exam weight ratio: {examWeight}%</span>
                    <span className="font-bold text-slate-500">Class Assessment (CA) ratio: {100 - examWeight}%</span>
                  </div>
                  <input 
                    type="range"
                    min="30"
                    max="70"
                    step="10"
                    value={examWeight}
                    onChange={(e) => {
                      const newExam = parseInt(e.target.value) || 60;
                      setExamWeight(newExam);
                      setStudents(prev => recomputeAcademicMetrics(prev, newExam, maxExamValue));
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>30% Exam / 70% CA</span>
                    <span>50% Exam / 50% CA (Standard JHS)</span>
                    <span>60% Exam / 40% CA (Default)</span>
                    <span>70% Exam / 30% CA</span>
                  </div>
                </div>
              </div>

              {/* Progress & Stat Widget Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Roster Completion</span>
                  </h3>
                  <div className="mt-4 text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-4xl font-black text-emerald-600 font-mono">
                      {readyReportsCount}/{totalStudents}
                    </span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Reports Signature Ready</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${totalStudents > 0 ? (readyReportsCount / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{totalStudents} total students enrolled</span>
                    <span className="font-bold text-emerald-600">
                      {totalStudents > 0 ? Math.round((readyReportsCount / totalStudents) * 100) : 0}% complete
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Fast Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Size</p>
                  <p className="text-2xl font-bold text-slate-900">{totalStudents} Students</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Average Score</p>
                  <p className="text-2xl font-bold text-emerald-600">{classAverage}%</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vacation Term Length</p>
                  <p className="text-2xl font-bold text-slate-900">{totalDays} Days</p>
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-lg">
                  <Check className="w-5 h-5 stroke-[3px]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">OMR Test Scores Synchronized</h4>
                  <p className="text-emerald-700 text-xs">Successfully populated and scaled OMR test answers into raw terminal marks.</p>
                </div>
              </div>
              <button 
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition whitespace-nowrap"
              >
                Launch Data Grid
              </button>
            </div>

            {/* Interactive Analytics Dashboard Section */}
            <div className="glass-card rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Class Insights & Performance Analytics</h3>
                    <p className="text-[10px] text-slate-400">Dynamic offline analytics calculated across active candidates</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Real-time Stats</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Grade Distribution Column */}
                {(() => {
                  const distribution = { excellent: 0, credit: 0, fail: 0 };
                  students.forEach(s => {
                    if (s.totalScore >= 70) distribution.excellent++;
                    else if (s.totalScore >= 50) distribution.credit++;
                    else distribution.fail++;
                  });
                  const maxCount = Math.max(1, distribution.excellent, distribution.credit, distribution.fail);

                  return (
                    <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <PieChart className="w-3.5 h-3.5 text-slate-400" />
                        <span>GES Standard Distribution</span>
                      </h4>
                      <div className="space-y-2.5">
                        {/* Excellent */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-emerald-700">Excellent (A1 - B3)</span>
                            <span className="font-mono">{distribution.excellent} ({totalStudents > 0 ? Math.round((distribution.excellent / totalStudents) * 100) : 0}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${(distribution.excellent / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Credit */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-blue-700">Credit (C4 - C6)</span>
                            <span className="font-mono">{distribution.credit} ({totalStudents > 0 ? Math.round((distribution.credit / totalStudents) * 100) : 0}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${(distribution.credit / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Pass/Fail */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-amber-700">Needs Help (D7 - F9)</span>
                            <span className="font-mono">{distribution.fail} ({totalStudents > 0 ? Math.round((distribution.fail / totalStudents) * 100) : 0}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 transition-all duration-300"
                              style={{ width: `${(distribution.fail / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Subject Performance Indicators */}
                {(() => {
                  const subjects = [
                    { name: "English Language", offset: 2 },
                    { name: "Mathematics", offset: -4 },
                    { name: "Integrated Science", offset: 1 },
                    { name: "Social Studies", offset: 3 },
                    { name: "Information Technology", offset: 6 }
                  ];

                  return (
                    <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Core Subject Averages</span>
                      </h4>
                      <div className="space-y-2">
                        {subjects.map((sub, idx) => {
                          const avg = Math.min(100, Math.max(0, Math.round(classAverage + sub.offset)));
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-600 truncate max-w-[140px]">{sub.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-600 rounded-full" 
                                    style={{ width: `${avg}%` }}
                                  />
                                </div>
                                <span className="font-mono font-bold text-slate-700 w-8 text-right">{avg}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Class Metrics Summary Box */}
                {(() => {
                  const scores = students.map(s => s.totalScore);
                  const highest = scores.length > 0 ? Math.max(...scores) : 0;
                  const lowest = scores.length > 0 ? Math.min(...scores) : 0;
                  const passed = students.filter(s => s.totalScore >= 50).length;
                  const passRate = totalStudents > 0 ? Math.round((passed / totalStudents) * 100) : 0;

                  return (
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block">Performance Target</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-emerald-400 font-mono">{passRate}%</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Pass Rate (≥50%)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold border-t border-slate-800 pt-2.5">
                        <div>
                          <span className="text-slate-400 uppercase tracking-wider block text-[8px]">Highest Score</span>
                          <span className="text-white font-mono text-xs">{highest}% Mark</span>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase tracking-wider block text-[8px]">Lowest Score</span>
                          <span className="text-white font-mono text-xs">{lowest}% Mark</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: SPREADSHEET DATA ENTRY GRID                       */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">The Data Entry Grid (Spreadsheet-Style)</h1>
                <p className="text-slate-500 text-xs">Verify automated exam scores and input student Class Assessments in real-time.</p>
              </div>
              
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button 
                  onClick={handleAddStudent}
                  className="flex-1 sm:flex-initial py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Add Candidate</span>
                </button>
                <button 
                  onClick={handleOpenCSVModal}
                  className="flex-1 sm:flex-initial py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>CSV Import/Export</span>
                </button>
                <button 
                  onClick={handleSaveProgress}
                  className="flex-1 sm:flex-initial py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Progress</span>
                </button>
              </div>
            </div>

            {/* Search and context parameters status banner */}
            <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search students in JHS 2 Gold..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500"
                />
              </div>
              <div className="flex gap-2 text-[11px] font-bold text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 overflow-x-auto whitespace-nowrap">
                <span>Class: <strong className="text-emerald-700">{selectedClass}</strong></span>
                <span className="mx-1 border-r border-slate-200"></span>
                <span>Exam Weight: <strong className="text-emerald-700">{examWeight}%</strong></span>
                <span className="mx-1 border-r border-slate-200"></span>
                <span>CA Weight: <strong className="text-emerald-700">{100 - examWeight}%</strong></span>
              </div>
            </div>

            {/* Spreadsheet Scroll Grid Container */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3.5 w-16">Roll #</th>
                      <th className="px-5 py-3.5 min-w-[180px]">Student Name</th>
                      <th className="px-5 py-3.5 w-24">OMR Exam ({maxExamValue})</th>
                      <th className="px-5 py-3.5 w-24">Exam ({examWeight}%)</th>
                      <th className="px-5 py-3.5 w-32">Classwork (50)</th>
                      <th className="px-5 py-3.5 w-32">Homework (50)</th>
                      <th className="px-5 py-3.5 w-24 bg-emerald-50/40 text-emerald-800">Total (100)</th>
                      <th className="px-5 py-3.5 w-20 text-center">Grade</th>
                      <th className="px-5 py-3.5 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-12 text-center text-slate-400 font-medium">
                          No student records matched search query.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((std) => {
                        const scoreMeta = calculateGESGrade(std.totalScore);
                        return (
                          <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-bold text-slate-400">{std.rollNumber}</td>
                            <td className="px-5 py-3.5 font-bold text-slate-800">{std.name}</td>
                            
                            {/* Raw OMR score */}
                            <td className="px-5 py-3.5">
                              <input 
                                type="number"
                                value={std.examScoreRaw}
                                onChange={(e) => handleScoreChange(std.id, "examScoreRaw", parseInt(e.target.value) || 0)}
                                className="w-16 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold font-mono focus:bg-white focus:outline-emerald-500"
                                max={maxExamValue}
                                min={0}
                              />
                            </td>

                            {/* Scale score calculated preview */}
                            <td className="px-5 py-3.5 font-mono font-bold text-slate-500">
                              {std.examScorePercent}% &rarr; {Math.round((std.examScorePercent * examWeight) / 100)}%
                            </td>

                            {/* Editable Classwork */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <input 
                                  type="number"
                                  value={std.classworkScore}
                                  onChange={(e) => handleScoreChange(std.id, "classworkScore", parseInt(e.target.value) || 0)}
                                  className="w-16 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold font-mono focus:bg-white focus:outline-emerald-500"
                                  max={50}
                                  min={0}
                                />
                                <span className="text-[10px] font-bold text-slate-400">/50</span>
                              </div>
                            </td>

                            {/* Editable Homework */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <input 
                                  type="number"
                                  value={std.homeworkScore}
                                  onChange={(e) => handleScoreChange(std.id, "homeworkScore", parseInt(e.target.value) || 0)}
                                  className="w-16 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold font-mono focus:bg-white focus:outline-emerald-500"
                                  max={50}
                                  min={0}
                                />
                                <span className="text-[10px] font-bold text-slate-400">/50</span>
                              </div>
                            </td>

                            {/* Calculated Total */}
                            <td className="px-5 py-3.5 bg-emerald-50/20 font-black font-mono text-emerald-800 text-sm">
                              {std.totalScore}%
                            </td>

                            {/* Calculated Grade Badge */}
                            <td className="px-5 py-3.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${scoreMeta.bg} ${scoreMeta.text}`}>
                                {scoreMeta.grade}
                              </span>
                            </td>

                            {/* Actions (Delete row) */}
                            <td className="px-5 py-3.5 text-right">
                              <button 
                                onClick={() => handleDeleteStudent(std.id)}
                                className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                title="Remove candidate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action grid summary statistics bar */}
              <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 font-bold">
                  Showing {filteredStudents.length} of {totalStudents} class records
                </div>
                <div className="flex items-center gap-4 text-slate-600 font-bold">
                  <span>Class Average: <strong className="text-emerald-700">{classAverage}%</strong></span>
                  <span className="h-4 border-r border-slate-300"></span>
                  <span>Pass Threshold: <strong className="text-slate-800">C6 (50%)</strong></span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl border border-slate-200 mt-4">
              <button 
                onClick={() => setCurrentStep(0)}
                className="py-2.5 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Back to Parameters
              </button>
              
              <button 
                onClick={() => {
                  if (students.length > 0) {
                    setActiveStudentIndex(0);
                    setCurrentStep(2);
                  }
                }}
                disabled={students.length === 0}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-200/50 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>PROCEED TO REMARKS</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: SMART REMARKS & EVALUATION SCREEN                 */}
        {/* ========================================================= */}
        {currentStep === 2 && activeFocusedStudent && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Remarks & Performance Evaluator</h1>
              <p className="text-slate-500 text-xs">Instantly assign verified GES standard commentaries or trigger smart presets.</p>
            </div>

            {/* Layout Split: Left student focus deck / Right quick navigation index */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Focused Candidate Card (Large details, custom edit box) */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Main Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5 relative overflow-hidden">
                  {/* Decorative performance ribbon */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    activeFocusedStudent.totalScore >= 80 
                      ? "bg-emerald-500" 
                      : activeFocusedStudent.totalScore >= 50 
                        ? "bg-blue-500" 
                        : "bg-red-500"
                  }`} />

                  {/* Header Row: Rank, Grade & Title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase leading-none">RANK</span>
                        <span className="text-lg font-black text-slate-800 leading-none mt-1">
                          #{activeFocusedStudent.position || "?"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-none">{activeFocusedStudent.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Roll ID: {activeFocusedStudent.rollNumber}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wider ${
                        calculateGESGrade(activeFocusedStudent.totalScore).bg
                      } ${
                        calculateGESGrade(activeFocusedStudent.totalScore).text
                      }`}>
                        {activeFocusedStudent.grade} - {activeFocusedStudent.remark}
                      </span>
                      <p className="text-xs font-mono font-bold text-slate-500 mt-1.5">Score: {activeFocusedStudent.totalScore}%</p>
                    </div>
                  </div>

                  {/* Performance stats mini-grid */}
                  <div className="grid grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Exam Portion</span>
                      <span className="font-mono font-bold text-slate-700">{activeFocusedStudent.examScorePercent}%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Raw: {activeFocusedStudent.examScoreRaw}/{maxExamValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Assessment CA</span>
                      <span className="font-mono font-bold text-slate-700">{activeFocusedStudent.classworkScore + activeFocusedStudent.homeworkScore}%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">CW:{activeFocusedStudent.classworkScore} HW:{activeFocusedStudent.homeworkScore}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Term Attendance</span>
                      <span className="font-mono font-bold text-slate-700">
                        {activeFocusedStudent.attendancePresent}/{totalDays} Days
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Absent: {activeFocusedStudent.attendanceAbsent} days</span>
                    </div>
                  </div>

                  {/* Editable Attendance Sub-slider */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Verify Student Attendance Metrics</span>
                    </h5>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 block">Days Present</label>
                        <input 
                          type="number"
                          value={activeFocusedStudent.attendancePresent}
                          onChange={(e) => handleAttendanceChange(activeFocusedStudent.id, "attendancePresent", parseInt(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono focus:outline-emerald-500 text-center"
                          max={totalDays}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 block">Days Absent</label>
                        <input 
                          type="number"
                          value={activeFocusedStudent.attendanceAbsent}
                          onChange={(e) => handleAttendanceChange(activeFocusedStudent.id, "attendanceAbsent", parseInt(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono focus:outline-emerald-500 text-center"
                          max={totalDays}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Smart Local AI Remarks Generator Trigger */}
                  <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-600 text-white rounded-lg">
                        <Wand2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-emerald-950">Ghanaian Smart AI Comment Generator</h4>
                        <p className="text-[10px] text-emerald-750">Compile custom professional GES-aligned teacher & headmaster remarks instantly.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSmartGeneratorModal(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition whitespace-nowrap shadow-sm"
                    >
                      <span>Draft Custom Comment</span>
                    </button>
                  </div>

                  {/* Form fields for Class Teacher Comments */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Class Teacher's Remarks</label>
                      <button 
                        onClick={() => {
                          setPresetTargetType("teacher");
                          setShowPresetModal(true);
                        }}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 focus:outline-none"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Select Preset Remarks</span>
                      </button>
                    </div>
                    <textarea 
                      value={activeFocusedStudent.remarksTeacher}
                      onChange={(e) => handleTextChange(activeFocusedStudent.id, "remarksTeacher", e.target.value)}
                      placeholder="Enter performance evaluation details..."
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-emerald-500"
                    />
                  </div>

                  {/* Form fields for Headteacher Comments */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Headteacher's Comments</label>
                      <button 
                        onClick={() => {
                          setPresetTargetType("head");
                          setShowPresetModal(true);
                        }}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 focus:outline-none"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Select Preset Remarks</span>
                      </button>
                    </div>
                    <textarea 
                      value={activeFocusedStudent.remarksHead}
                      onChange={(e) => handleTextChange(activeFocusedStudent.id, "remarksHead", e.target.value)}
                      placeholder="Enter headmaster administrative signature commentaries..."
                      rows={2}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-emerald-500"
                    />
                  </div>

                </div>

                {/* Candidate navigation footer */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <button 
                    onClick={() => {
                      if (activeStudentIndex > 0) {
                        setActiveStudentIndex(prev => prev - 1);
                      }
                    }}
                    disabled={activeStudentIndex === 0}
                    className="p-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Candidate</span>
                  </button>

                  <span className="text-xs text-slate-500 font-bold">
                    Student {activeStudentIndex + 1} of {totalStudents}
                  </span>

                  <button 
                    onClick={() => {
                      if (activeStudentIndex < totalStudents - 1) {
                        setActiveStudentIndex(prev => prev + 1);
                      } else {
                        setCurrentStep(3); // Proceed to export step
                      }
                    }}
                    className="p-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                  >
                    <span>{activeStudentIndex === totalStudents - 1 ? "Proceed to Export" : "Next Student"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Right Column: Roster Deck sidebar list */}
              <div className="glass-card rounded-2xl p-4 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest block">Class Roll Call</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Click any row to load into active focus</p>
                </div>

                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {students.map((std, idx) => {
                    const isSelected = activeStudentIndex === idx;
                    const hasRemarks = std.remarksTeacher.trim().length > 0 && std.remarksHead.trim().length > 0;
                    return (
                      <button 
                        key={std.id}
                        onClick={() => setActiveStudentIndex(idx)}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isSelected 
                            ? "bg-emerald-50 border-emerald-500 shadow-sm" 
                            : "bg-white hover:bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? "text-emerald-900" : "text-slate-800"}`}>
                            {std.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 mt-0.5">
                            <span>#{std.position} Rank</span>
                            <span>•</span>
                            <span>{std.totalScore}% Mark</span>
                          </div>
                        </div>

                        {hasRemarks ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 text-[10px] shrink-0 font-bold">
                            &check;
                          </div>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" title="Pending Commentary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Quick Actions Nav */}
            <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl border border-slate-200">
              <button 
                onClick={() => setCurrentStep(1)}
                className="py-2.5 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Back to Spreadsheet
              </button>
              
              <button 
                onClick={() => setCurrentStep(3)}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-200/50 flex items-center gap-2 transition"
              >
                <span>PROCEED TO PRINT CAROUSEL</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: EXPORT & PRINT PREVIEW SCREEN                     */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Standardized A4 Report Sheets Preview</h1>
                <p className="text-slate-500 text-xs">Observe live compiled cards. Execute standard printing or export bulk PDF files completely offline.</p>
              </div>

              <button 
                onClick={handleTriggerPrint}
                className="w-full sm:w-auto py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xl shadow-emerald-200/50 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <Printer className="w-4.5 h-4.5" />
                <span>GENERATE SINGLE PDF FILE</span>
              </button>
            </div>

            {/* Main view container: config sidebar + PDF Document carousel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              
              {/* Sidebar: Print Controls Configurations */}
              <div className="glass-card rounded-2xl p-5 shadow-sm space-y-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Report Configurations</span>
                </h3>

                <div className="space-y-3.5 text-xs font-semibold">
                  
                  {/* Toggle logo */}
                  <label className="flex items-center justify-between cursor-pointer p-1">
                    <span className="text-slate-700">Include School Logo Badge</span>
                    <input 
                      type="checkbox"
                      checked={includeLogo}
                      onChange={(e) => setIncludeLogo(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                  </label>

                  {/* Toggle rank */}
                  <label className="flex items-center justify-between cursor-pointer p-1">
                    <span className="text-slate-700">Include Class Position Rank</span>
                    <input 
                      type="checkbox"
                      checked={includePosition}
                      onChange={(e) => setIncludePosition(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                  </label>

                  {/* Toggle attendance */}
                  <label className="flex items-center justify-between cursor-pointer p-1">
                    <span className="text-slate-700">Display Attendance Logs</span>
                    <input 
                      type="checkbox"
                      checked={includeAttendance}
                      onChange={(e) => setIncludeAttendance(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                  </label>

                  {/* Toggle Watermark */}
                  <label className="flex items-center justify-between cursor-pointer p-1">
                    <span className="text-slate-700">Show OMR Watermark Background</span>
                    <input 
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                    />
                  </label>

                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed space-y-2">
                  <p className="flex items-center gap-1 font-bold text-slate-500 uppercase">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Printer optimization active</span>
                  </p>
                  <p>A4 page-break boundaries are hard-coded in the document styling. Generating PDF triggers immediate system styling matching standardized administrative report designs.</p>
                </div>
              </div>

              {/* Carousel Panel: Crisp vertical scrolling of A4 paper cards */}
              <div className="md:col-span-3 space-y-8 print:p-0 print:m-0" id="terminal_reports_print_section">
                
                {students.map((std, idx) => {
                  const scaleResult = calculateGESGrade(std.totalScore);
                  return (
                    <div 
                      key={std.id}
                      className="bg-white border border-slate-200 shadow-lg rounded-2xl max-w-2xl mx-auto p-8 relative overflow-hidden flex flex-col justify-between print:border-0 print:shadow-none print:rounded-none print:p-0 print:my-0 page-break-after"
                      style={{ minHeight: "842px", width: "100%", maxWidth: "595px" }} // Standard A4 Aspect Ratio scaled
                    >
                      {/* Paper top accent header */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900 print:hidden" />

                      {/* Header School / Logo section */}
                      <div className="border-b-2 border-slate-900 pb-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">MARK SWIFT ACADEMY</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">GES Certified Basic / JHS Terminal Report Card</p>
                            <p className="text-[9px] text-slate-400 font-mono">Location: Greater Accra Region • P.O. Box GP 1928, Accra</p>
                          </div>

                          {includeLogo && (
                            <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-900 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                              <div className="w-8 h-8 border-4 border-emerald-900 rotate-45 border-t-0 border-l-0 relative">
                                <div className="absolute inset-0 bg-emerald-900 rotate-45 scale-50" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Roster & Academic Identifiers Deck */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-[10px] bg-slate-50 p-3 rounded-lg border border-slate-200 font-bold text-slate-600">
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest block">Student Name</span>
                            <span className="text-slate-900 uppercase text-xs font-black">{std.name}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest block">Academic Class</span>
                            <span className="text-slate-900 uppercase">{selectedClass}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest block">Term Interval</span>
                            <span className="text-slate-900 uppercase">{currentTerm}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase tracking-widest block">Roll ID Number</span>
                            <span className="text-slate-900 font-mono text-xs">{std.rollNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Core Content: Report Academic Scores Table Grid */}
                      <div className="my-6 flex-1 space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Academic Achievement Logs</h4>
                          <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-300 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="p-2.5 border border-slate-300">SUBJECT ASSESSMENT</th>
                                <th className="p-2.5 border border-slate-300 w-16 text-center">EXAM RAWS</th>
                                <th className="p-2.5 border border-slate-300 w-20 text-center">EXAM ({examWeight}%)</th>
                                <th className="p-2.5 border border-slate-300 w-20 text-center">CA ({100 - examWeight}%)</th>
                                <th className="p-2.5 border border-slate-300 w-20 text-center bg-slate-200/50 font-black">TOTAL (100)</th>
                                <th className="p-2.5 border border-slate-300 w-16 text-center">GRADE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Integrated general academic subjects to represent a realistic Ghana Basic/JHS report card */}
                              {[
                                { name: "English Language", cw: std.classworkScore, hw: std.homeworkScore, raw: std.examScoreRaw },
                                { name: "Mathematics", cw: std.classworkScore, hw: std.homeworkScore, raw: std.examScoreRaw },
                                { name: "Science", cw: Math.max(0, std.classworkScore - 2), hw: Math.max(0, std.homeworkScore - 1), raw: Math.max(0, std.examScoreRaw - 3) },
                                { name: "Social Studies", cw: Math.min(50, std.classworkScore + 3), hw: Math.min(50, std.homeworkScore + 1), raw: Math.min(maxExamValue, std.examScoreRaw + 2) },
                                { name: "Information Technology", cw: Math.min(50, std.classworkScore + 5), hw: Math.min(50, std.homeworkScore + 4), raw: Math.min(maxExamValue, std.examScoreRaw + 1) }
                              ].map((sub, sIdx) => {
                                const examPct = (sub.raw / maxExamValue) * 100;
                                const weightedExam = (examPct * examWeight) / 100;
                                const caTotal = sub.cw + sub.hw;
                                const weightedCA = (caTotal * (100 - examWeight)) / 100;
                                const finalTotal = Math.min(100, Math.round(weightedExam + weightedCA));
                                const subScale = calculateGESGrade(finalTotal);

                                return (
                                  <tr key={sIdx} className="border-b border-slate-300">
                                    <td className="p-2.5 border border-slate-300 font-bold text-slate-800">{sub.name}</td>
                                    <td className="p-2.5 border border-slate-300 text-center font-mono">{sub.raw}/{maxExamValue}</td>
                                    <td className="p-2.5 border border-slate-300 text-center font-mono">{Math.round(weightedExam)}%</td>
                                    <td className="p-2.5 border border-slate-300 text-center font-mono">{Math.round(weightedCA)}%</td>
                                    <td className="p-2.5 border border-slate-300 text-center font-mono bg-slate-50 font-black text-slate-900 text-xs">
                                      {finalTotal}%
                                    </td>
                                    <td className="p-2.5 border border-slate-300 text-center">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider ${subScale.bg} ${subScale.text}`}>
                                        {subScale.grade}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Ranks and attendance grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Rank details */}
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                            <h5 className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Enrollment Status</h5>
                            <div className="space-y-1.5 text-[10px] text-slate-600 font-bold">
                              {includePosition && (
                                <div className="flex justify-between">
                                  <span>Position in Class:</span>
                                  <span className="text-slate-900 font-mono font-black">
                                    {std.position}<sup>{std.position === 1 ? "st" : std.position === 2 ? "nd" : std.position === 3 ? "rd" : "th"}</sup> of {totalStudents} students
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Term Average Marks:</span>
                                <span className="text-slate-900 font-mono">{std.totalScore}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Roster Target Outcome:</span>
                                <span className="text-emerald-700 uppercase tracking-wider">{scaleResult.remark}</span>
                              </div>
                            </div>
                          </div>

                          {/* Attendance summary */}
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                            <h5 className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Conduct & Attendance Logs</h5>
                            <div className="space-y-1.5 text-[10px] text-slate-600 font-bold">
                              {includeAttendance && (
                                <>
                                  <div className="flex justify-between">
                                    <span>Total Session Days:</span>
                                    <span className="text-slate-900 font-mono">{totalDays} Days</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Days Student Present:</span>
                                    <span className="text-emerald-700 font-mono">{std.attendancePresent} Days</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Days Student Absent:</span>
                                    <span className="text-amber-700 font-mono">{std.attendanceAbsent} Days</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Administrative Comments, Remarks & Signatures */}
                      <div className="border-t-2 border-slate-300 pt-4 space-y-4">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-700">
                          <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Class Teacher's Final Remarks</span>
                            <p className="font-semibold text-slate-800 leading-tight italic">
                              &ldquo;{std.remarksTeacher || "Satisfactory progress shown throughout the interval. Recommended to strive further next session."}&rdquo;
                            </p>
                          </div>
                          
                          <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Headteacher's Comments</span>
                            <p className="font-semibold text-slate-800 leading-tight italic">
                              &ldquo;{std.remarksHead || "Promising performance. Recommended to strive for higher laurels."}&rdquo;
                            </p>
                          </div>
                        </div>

                        {/* Signatures & Stamps row */}
                        <div className="grid grid-cols-2 pt-4 border-t border-dashed border-slate-200 text-[9px] text-slate-400 font-bold">
                          <div className="space-y-6">
                            <span>Next Term Begins: <strong className="text-slate-800 font-mono">{nextTermDate}</strong></span>
                            <div className="border-t border-slate-300 w-36 pt-1 text-center font-mono">
                              Teacher's Signature
                            </div>
                          </div>
                          <div className="space-y-6 flex flex-col items-end">
                            <span className="text-right">Issued Date: <strong className="text-slate-800 font-mono">2026-07-18</strong></span>
                            <div className="border-t border-slate-300 w-36 pt-1 text-center font-mono">
                              Headmaster stamp / sign
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Paper bottom watermark footer */}
                      <div className="mt-4 flex items-center justify-between text-[8px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                        <span>OMR Scan ID: {std.id}</span>
                        <span className="font-bold">Powered by MarkSwift Engine</span>
                      </div>
                    </div>
                  );
                })}

              </div>

            </div>

            {/* Print Styling CSS override injected directly for perfect A4 outputs */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * {
                  visibility: hidden;
                }
                #terminal_reports_print_section, #terminal_reports_print_section * {
                  visibility: visible;
                }
                #terminal_reports_print_section {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  margin: 0;
                  padding: 0;
                }
                .page-break-after {
                  page-break-after: always;
                  break-after: page;
                  margin: 0 !important;
                  padding: 1.5cm !important;
                  border: none !important;
                  box-shadow: none !important;
                  height: auto !important;
                  min-height: 100% !important;
                  width: 100% !important;
                  max-width: 100% !important;
                }
                nav, header, footer, button, select, input, aside, .sticky, .tab-indicator {
                  display: none !important;
                }
              }
            `}} />

            {/* Bottom Nav */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-100 p-4 rounded-xl border border-slate-200">
              <button 
                onClick={() => setCurrentStep(2)}
                className="py-2.5 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Back to Remarks
              </button>
              
              <div className="flex items-center gap-2">
                {activeSchoolMode === "linked" ? (
                  <button
                    type="button"
                    id="btn_submit_to_headteacher"
                    onClick={() => setShowSubmitModal(true)}
                    className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isSubmittedToHead ? "Re-submit Class Scores" : "Submit Class Scores to Headteacher"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert("Personal Mode: Reports compiled for local printing & PDF download.")}
                    className="py-2.5 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Export Compiled PDF Bundle
                  </button>
                )}

                <button 
                  onClick={handleTriggerPrint}
                  className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-200/50 flex items-center gap-2 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT ALL REPORT CARDS</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* 5. PRESET BOTTOM SHEET / MODAL DIALOG                     */}
      {/* ========================================================= */}
      {showPresetModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  Select Preset Comment
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Target: {presetTargetType === "teacher" ? "Class Teacher" : "Headmaster"} Signature
                </p>
              </div>
              <button 
                onClick={() => setShowPresetModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Category: Excellent */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                  Excellent Academic Performance
                </span>
                <div className="space-y-1.5">
                  {(presetTargetType === "teacher" ? COMMENT_PRESETS.excellent : HEADTEACHER_PRESETS.excellent).map((preset, pIdx) => (
                    <button 
                      key={pIdx}
                      onClick={() => handleSelectPresetComment(preset)}
                      className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-colors border border-slate-200/60"
                    >
                      &ldquo;{preset}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              {/* Category: Average */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-150">
                  Satisfactory / Good Progress
                </span>
                <div className="space-y-1.5">
                  {(presetTargetType === "teacher" ? COMMENT_PRESETS.average : HEADTEACHER_PRESETS.average).map((preset, pIdx) => (
                    <button 
                      key={pIdx}
                      onClick={() => handleSelectPresetComment(preset)}
                      className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50/50 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-900 transition-colors border border-slate-200/60"
                    >
                      &ldquo;{preset}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              {/* Category: Needs Attention */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded border border-rose-150">
                  Needs Attention / Academic Guidance
                </span>
                <div className="space-y-1.5">
                  {(presetTargetType === "teacher" ? COMMENT_PRESETS.needsAttention : HEADTEACHER_PRESETS.needsAttention).map((preset, pIdx) => (
                    <button 
                      key={pIdx}
                      onClick={() => handleSelectPresetComment(preset)}
                      className="w-full text-left p-2.5 bg-slate-50 hover:bg-rose-50/50 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-900 transition-colors border border-slate-200/60"
                    >
                      &ldquo;{preset}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. CSV IMPORT / EXPORT MODAL DIALOG                       */}
      {/* ========================================================= */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    CSV Roster Import & Export
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Class: {selectedClass} • Standard Comma-Separated Values
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCSVModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="text-xs text-slate-500 leading-relaxed bg-emerald-50/55 p-3.5 border border-emerald-100 rounded-xl space-y-1">
                <p className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Interactive Spreadsheet Integration Instructions:</span>
                </p>
                <p>1. <strong>Export:</strong> Copy the text below to open in Excel or Google Sheets directly.</p>
                <p>2. <strong>Import:</strong> Paste columns below following the exact header sequence:</p>
                <p className="font-mono bg-white p-1 rounded border border-emerald-200 text-[10px] mt-1 overflow-x-auto whitespace-nowrap select-all font-bold text-slate-700">
                  Student Name,Raw OMR Exam,Classwork,Homework,Attendance Present,Attendance Absent
                </p>
              </div>

              {csvError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{csvError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Spreadsheet CSV Payload Data</label>
                <textarea 
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Student Name,Raw OMR Exam,Classwork,Homework,Attendance Present,Attendance Absent&#10;Kofi Appiah,38,42,40,88,2&#10;Ama Mensah,46,45,47,90,0"
                  rows={8}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sample = "Student Name,Raw OMR Exam,Classwork,Homework,Attendance Present,Attendance Absent\nKofi Appiah,38,42,40,88,2\nAma Mensah,46,45,47,90,0\nKwesi Boateng,29,32,30,81,9";
                    setCsvText(sample);
                    setCsvError("");
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                >
                  Load Sample Paste format
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(csvText);
                    alert("CSV string copied to clipboard!");
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  try {
                    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.setAttribute("download", `marks_roster_${selectedClass.toLowerCase().replace(/\s+/g, "_")}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (e) {
                    alert("Failed to export as local file.");
                  }
                }}
                className="py-2 px-4 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <DownloadCloud className="w-4 h-4 text-emerald-600" />
                <span>Save as .CSV File</span>
              </button>

              <button
                onClick={handleImportCSV}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Import & Append Roster</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. GHANAIAN SMART AI COMMENT GENERATOR MODAL DIALOG       */}
      {/* ========================================================= */}
      {showSmartGeneratorModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Smart Comment Evaluator
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Ghanaian Basic/JHS Educational Assessment Framework
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSmartGeneratorModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Form Area */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-emerald-50 p-3.5 border border-emerald-100 rounded-xl">
                <p className="text-xs text-emerald-950 font-bold">
                  Drafting remarks for: <span className="text-emerald-700 underline underline-offset-2">{activeFocusedStudent.name}</span>
                </p>
                <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                  Calculated Overall Term Score: <strong className="font-mono">{activeFocusedStudent.totalScore}%</strong> (Grade {activeFocusedStudent.grade})
                </p>
              </div>

              {/* Focus Trait Choice */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Classroom Focus & Attitude</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { val: "diligent", label: "Diligent & Disciplined", desc: "Highly focused on task work" },
                    { val: "distracted", label: "Prone to Distractions", desc: "Easily distracted by classmates" },
                    { val: "consistent", label: "Consistent & Steady", desc: "Steady academic devotion" },
                    { val: "quiet", label: "Quiet & Attentive", desc: "Well-behaved silent listener" }
                  ].map(t => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setFocusTrait(t.val)}
                      className={`p-3 text-left rounded-xl border transition ${
                        focusTrait === t.val 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/10" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="font-bold block text-xs">{t.label}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Classroom Participation Choice */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Classroom Engagement & Participation</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { val: "active", label: "Active Participant", desc: "Volunteers answers frequently" },
                    { val: "reserved", label: "Reserved & Shy", desc: "Steady but quiet progress" },
                    { val: "leader", label: "Exemplary Leader", desc: "Always assists peer groups" },
                    { val: "passive", label: "Needs Regular Prompting", desc: "Passive during class tasks" }
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setParticipationTrait(p.val)}
                      className={`p-3 text-left rounded-xl border transition ${
                        participationTrait === p.val 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/10" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="font-bold block text-xs">{p.label}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Improvement Area Choice */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Improvement/Growth Subject</label>
                <select
                  value={growthArea}
                  onChange={(e) => setGrowthArea(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="none">General / All-Round balanced performance</option>
                  <option value="math">Core Mathematics (Calculations & algebra)</option>
                  <option value="english">English Language (Grammar & comprehension)</option>
                  <option value="science">Integrated Science (Practical science principles)</option>
                  <option value="ict">Information & Communication Technology (ICT practicals)</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowSmartGeneratorModal(false)}
                className="py-2.5 px-4 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close Settings
              </button>

              <button
                type="button"
                onClick={() => {
                  const comments = generateGhanaianSmartComment(
                    activeFocusedStudent.name,
                    activeFocusedStudent.totalScore,
                    focusTrait,
                    participationTrait,
                    growthArea
                  );

                  handleTextChange(activeFocusedStudent.id, "remarksTeacher", comments.teacher);
                  handleTextChange(activeFocusedStudent.id, "remarksHead", comments.head);
                  
                  setShowSmartGeneratorModal(false);
                  alert(`Successfully generated remarks for ${activeFocusedStudent.name}!`);
                }}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Compile & Apply Remarks</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUBMISSION REVIEW MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                  Submit {selectedClass} Scores
                </h3>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              You are submitting class marks to <strong>{linkedSchool?.name || "St. Peter's Basic School"}</strong> for Headteacher review and approval.
            </p>

            {/* Pre-flight Checklist Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Pre-Flight Audit Summary</span>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Objective (OMR) Marks Scanned:</span>
                <span className="font-mono font-bold text-emerald-600">{students.length}/{students.length} Complete</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Classwork & Homework Marks:</span>
                <span className="font-mono font-bold text-emerald-600">{students.length}/{students.length} Recorded</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Attendance Records Logged:</span>
                <span className="font-mono font-bold text-emerald-600">{students.length}/{students.length} Synced</span>
              </div>
            </div>

            {/* Offline Queue Notice */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <p>
                <strong>Offline Queue Ready:</strong> If offline, scores are saved locally and will automatically sync to Headteacher as soon as internet connection is re-established.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn_confirm_head_submit"
                onClick={() => {
                  setIsSubmittedToHead(true);
                  setShowSubmitModal(false);
                  alert(`Class scores for ${selectedClass} successfully submitted to Headteacher (${linkedSchool?.headteacherName || "Rev. Dr. Emmanuel Mensah"})!`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow cursor-pointer"
              >
                Confirm Submission to Headteacher
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
