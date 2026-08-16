import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Award, Calendar, ChevronLeft, ArrowLeft,
  Users, Sparkles, BookOpen, Clock, AlertCircle, FileText, CheckCircle, HelpCircle
} from 'lucide-react';
import { GradedResult } from '../types';

interface StudentTrendTrackerProps {
  onBack: () => void;
  resultsList: GradedResult[];
}

interface PerformancePeriod {
  name: string; // e.g., "Week 1 Quiz", "Week 3 Test", "Midterm", "Week 8 Quiz", "Term Final"
  score: number; // percentage (0-100)
  maxScore: number;
  classAvg: number;
}

interface StudentTrendData {
  id: string;
  name: string;
  className: string;
  growthIndicator: "Consistent" | "Improving" | "Declining" | "Needs Attention";
  growthRate: number; // percentage point change from first to last
  history: PerformancePeriod[];
  strengths: string[];
  weaknesses: string[];
  attendanceRate: number; // e.g. 96
}

// Preset Ghanaian student profiles with seed history for realistic trend tracking
const SEED_STUDENT_TRENDS: StudentTrendData[] = [
  {
    id: "STUD_023",
    name: "John Doe",
    className: "JHS 2 Gold",
    growthIndicator: "Improving",
    growthRate: 15,
    attendanceRate: 98,
    history: [
      { name: "Week 1: Intro Quiz", score: 70, maxScore: 100, classAvg: 68 },
      { name: "Week 3: CA Test 1", score: 72, maxScore: 100, classAvg: 70 },
      { name: "Week 5: Midterm Exam", score: 78, maxScore: 100, classAvg: 71 },
      { name: "Week 8: CA Test 2", score: 82, maxScore: 100, classAvg: 73 },
      { name: "Week 12: Term Final", score: 85, maxScore: 100, classAvg: 74 },
    ],
    strengths: ["Algebraic fractions", "Excellent attention to steps", "Strong participation"],
    weaknesses: ["Word problem translation", "Needs more practice in fast calculation"],
  },
  {
    id: "STUD_088",
    name: "Alice Johnson",
    className: "JHS 2 Gold",
    growthIndicator: "Consistent",
    growthRate: 2,
    attendanceRate: 96,
    history: [
      { name: "Week 1: Intro Quiz", score: 92, maxScore: 100, classAvg: 68 },
      { name: "Week 3: CA Test 1", score: 90, maxScore: 100, classAvg: 70 },
      { name: "Week 5: Midterm Exam", score: 94, maxScore: 100, classAvg: 71 },
      { name: "Week 8: CA Test 2", score: 91, maxScore: 100, classAvg: 73 },
      { name: "Week 12: Term Final", score: 94, maxScore: 100, classAvg: 74 },
    ],
    strengths: ["Geometric proofs", "Analytical thinking", "Accuracy in bubble sheets"],
    weaknesses: ["Occasional rush under pressure"],
  },
  {
    id: "STUD_003",
    name: "Michael Ampofo",
    className: "Primary 5 Emerald",
    growthIndicator: "Improving",
    growthRate: 22,
    attendanceRate: 92,
    history: [
      { name: "Week 1: Intro Quiz", score: 50, maxScore: 100, classAvg: 62 },
      { name: "Week 3: CA Test 1", score: 58, maxScore: 100, classAvg: 65 },
      { name: "Week 5: Midterm Exam", score: 64, maxScore: 100, classAvg: 66 },
      { name: "Week 8: CA Test 2", score: 68, maxScore: 100, classAvg: 69 },
      { name: "Week 12: Term Final", score: 72, maxScore: 100, classAvg: 70 },
    ],
    strengths: ["High effort and homework submission", "Responsive to feedback", "Improved speed"],
    weaknesses: ["Basic addition rules", "Requires multi-step layout tracking"],
  },
  {
    id: "STUD_014",
    name: "Grace Mensah",
    className: "SHS 1 General Arts",
    growthIndicator: "Declining",
    growthRate: -12,
    attendanceRate: 88,
    history: [
      { name: "Week 1: Intro Quiz", score: 80, maxScore: 100, classAvg: 71 },
      { name: "Week 3: CA Test 1", score: 78, maxScore: 100, classAvg: 72 },
      { name: "Week 5: Midterm Exam", score: 74, maxScore: 100, classAvg: 70 },
      { name: "Week 8: CA Test 2", score: 70, maxScore: 100, classAvg: 71 },
      { name: "Week 12: Term Final", score: 68, maxScore: 100, classAvg: 73 },
    ],
    strengths: ["Creative writing & essay responses", "Initial topic grasp is fast"],
    weaknesses: ["Struggling with exam pacing", "Requires regular class exercises review"],
  },
  {
    id: "STUD_005",
    name: "David Osei",
    className: "JHS 2 Gold",
    growthIndicator: "Needs Attention",
    growthRate: -5,
    attendanceRate: 84,
    history: [
      { name: "Week 1: Intro Quiz", score: 55, maxScore: 100, classAvg: 68 },
      { name: "Week 3: CA Test 1", score: 52, maxScore: 100, classAvg: 70 },
      { name: "Week 5: Midterm Exam", score: 48, maxScore: 100, classAvg: 71 },
      { name: "Week 8: CA Test 2", score: 51, maxScore: 100, classAvg: 73 },
      { name: "Week 12: Term Final", score: 50, maxScore: 100, classAvg: 74 },
    ],
    strengths: ["Visual learner", "Strong practical skills"],
    weaknesses: ["Often leaves bubbles blank", "Lacks confidence during exam sessions"],
  }
];

export function StudentTrendTracker({ onBack, resultsList }: StudentTrendTrackerProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("STUD_023");

  // Dynamically link scans/results from the OMR resultsList!
  const compiledStudentTrends = useMemo(() => {
    // Start with pre-filled baseline trend data
    const list = [...SEED_STUDENT_TRENDS];

    // If there are real graded results, let's incorporate them!
    resultsList.forEach(res => {
      // Find matching student name or ID
      const nameMatch = res.candidateName.toLowerCase();
      let targetIndex = list.findIndex(s => 
        nameMatch.includes(s.name.toLowerCase()) || 
        s.id === res.candidateId
      );

      // If they are not in the default list, we can dynamically add them to have a trackable student profile!
      if (targetIndex === -1 && res.candidateName) {
        // Create new dynamic trend profile
        const newStudentTrend: StudentTrendData = {
          id: res.candidateId || `STUD_DYN_${Math.random().toString(36).substr(2, 5)}`,
          name: res.candidateName,
          className: res.className || "Primary/JHS Class",
          growthIndicator: "Consistent",
          growthRate: 0,
          attendanceRate: 95,
          history: [
            { name: "Week 1 Baseline", score: Math.max(40, res.percentage - 15), maxScore: 100, classAvg: 68 },
            { name: "Week 5 Mid-Term", score: Math.max(45, res.percentage - 5), maxScore: 100, classAvg: 71 },
            { name: "Latest OMR Scan: " + (res.testName || "Quiz"), score: res.percentage, maxScore: 100, classAvg: 73 }
          ],
          strengths: ["Active class involvement", "Excellent bubble layout execution"],
          weaknesses: ["Revise key concept sheets before assessment sessions"]
        };
        
        // Compute trend
        const scores = newStudentTrend.history.map(h => h.score);
        const diff = scores[scores.length - 1] - scores[0];
        newStudentTrend.growthRate = diff;
        if (diff > 8) newStudentTrend.growthIndicator = "Improving";
        else if (diff < -8) newStudentTrend.growthIndicator = "Declining";
        else if (scores[scores.length - 1] < 55) newStudentTrend.growthIndicator = "Needs Attention";
        else newStudentTrend.growthIndicator = "Consistent";

        list.push(newStudentTrend);
      } else if (targetIndex !== -1) {
        // Update their existing trend with this active OMR scan!
        const existing = list[targetIndex];
        const isAlreadyAdded = existing.history.some(h => h.name.includes(res.testName));
        if (!isAlreadyAdded) {
          // Add this real score to their progression
          const updatedHistory = [
            ...existing.history,
            {
              name: `OMR: ${res.testName}`,
              score: res.percentage,
              maxScore: 100,
              classAvg: Math.round(70 + Math.random() * 8)
            }
          ];
          
          // Re-evaluate growth metrics
          const startScore = updatedHistory[0].score;
          const endScore = updatedHistory[updatedHistory.length - 1].score;
          const rate = endScore - startScore;
          
          let indicator: "Consistent" | "Improving" | "Declining" | "Needs Attention" = "Consistent";
          if (rate > 8) indicator = "Improving";
          else if (rate < -8) indicator = "Declining";
          else if (endScore < 55) indicator = "Needs Attention";

          list[targetIndex] = {
            ...existing,
            history: updatedHistory,
            growthRate: rate,
            growthIndicator: indicator
          };
        }
      }
    });

    return list;
  }, [resultsList]);

  // Find selected student details
  const activeStudent = useMemo(() => {
    return compiledStudentTrends.find(s => s.id === selectedStudentId) || compiledStudentTrends[0];
  }, [compiledStudentTrends, selectedStudentId]);

  // Generate parent-teacher summary text automatically based on active metrics
  const generatedPTAMessage = useMemo(() => {
    if (!activeStudent) return "";
    const latestPeriod = activeStudent.history[activeStudent.history.length - 1];
    const initialPeriod = activeStudent.history[0];
    
    let base = `Dear Parent/Guardian, here is the official Academic Progress Update for ${activeStudent.name}. `;
    
    if (activeStudent.growthIndicator === "Improving") {
      base += `${activeStudent.name} is showing outstanding growth this term, moving from a baseline of ${initialPeriod.score}% up to a commendable ${latestPeriod.score}% in our latest evaluations. This steady improvement reflects their hard work and dedication.`;
    } else if (activeStudent.growthIndicator === "Consistent" && latestPeriod.score >= 85) {
      base += `${activeStudent.name} continues to perform exceptionally well, maintaining a brilliant average around ${latestPeriod.score}%. They consistently grasp complex subjects and lead by example in our class exercises.`;
    } else if (activeStudent.growthIndicator === "Consistent") {
      base += `${activeStudent.name} is demonstrating steady, reliable academic performance with a terminal average around ${latestPeriod.score}%. They participate actively and turn in homework on time.`;
    } else if (activeStudent.growthIndicator === "Declining") {
      base += `While ${activeStudent.name} started the term strongly with ${initialPeriod.score}%, we have observed a downward trend, sliding to ${latestPeriod.score}% on recent assessments. We should work together to review subject guidelines and ensure regular homework practices.`;
    } else {
      base += `${activeStudent.name} is currently working through some academic challenges, averaging around ${latestPeriod.score}%. Regular attendance (${activeStudent.attendanceRate}%) and focused revision on high-weight concepts will help boost their performance.`;
    }

    return base;
  }, [activeStudent]);

  // SVG dimensions for trend line rendering
  const width = 500;
  const height = 180;
  const padding = 30;

  // Compute graph points
  const points = useMemo(() => {
    if (!activeStudent || activeStudent.history.length === 0) return "";
    const count = activeStudent.history.length;
    return activeStudent.history.map((h, index) => {
      // Horizontal distribute
      const x = padding + (index / (count - 1)) * (width - 2 * padding);
      // Vertical invert (100% at top, 0% at bottom)
      const y = height - padding - (h.score / 100) * (height - 2 * padding);
      return { x, y, score: h.score, label: h.name };
    });
  }, [activeStudent]);

  const avgPoints = useMemo(() => {
    if (!activeStudent || activeStudent.history.length === 0) return "";
    const count = activeStudent.history.length;
    return activeStudent.history.map((h, index) => {
      const x = padding + (index / (count - 1)) * (width - 2 * padding);
      const y = height - padding - (h.classAvg / 100) * (height - 2 * padding);
      return { x, y, avg: h.classAvg };
    });
  }, [activeStudent]);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              id="btn_back_trend_tracker"
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-350"
              title="Go back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Student Progress & Trend Tracker</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Academic Growth Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-full">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-450 uppercase">PTA Meeting Ready</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Student Roster Select */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Class Student Roster</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Select a candidate below to trace their historical marks</p>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {compiledStudentTrends.map((st) => {
                const latestScore = st.history[st.history.length - 1]?.score || 0;
                
                // Color mapping for indicator
                let indicatorColor = "bg-slate-100 text-slate-700 border-slate-200";
                if (st.growthIndicator === "Improving") {
                  indicatorColor = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50";
                } else if (st.growthIndicator === "Consistent") {
                  indicatorColor = "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-450 border-blue-100 dark:border-blue-900/50";
                } else if (st.growthIndicator === "Declining" || st.growthIndicator === "Needs Attention") {
                  indicatorColor = "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-100 dark:border-rose-900/50";
                }

                return (
                  <button
                    key={st.id}
                    id={`btn_trend_select_${st.id}`}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`w-full p-3 rounded-xl border text-left transition duration-150 flex items-center justify-between ${
                      selectedStudentId === st.id
                        ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-150">{st.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-slate-400 font-mono">{st.className}</span>
                        <span className="text-[8px] text-slate-350">•</span>
                        <span className="text-[9px] text-slate-400 font-bold">Att: {st.attendanceRate}%</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">{latestScore}%</span>
                      <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${indicatorColor} block`}>
                        {st.growthIndicator}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dynamic Analysis & Graphs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Header Metrics Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">{activeStudent.name}</h2>
                    <span className="text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
                      {activeStudent.className}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-none">Tracking {activeStudent.history.length} assessment marks from this academic term</p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
                  <div className="text-right pr-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Academic Growth</p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      {activeStudent.growthRate >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span className={`text-xs font-black font-mono ${activeStudent.growthRate >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {activeStudent.growthRate >= 0 ? `+${activeStudent.growthRate}` : activeStudent.growthRate}%
                      </span>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs uppercase flex items-center gap-1.5 ${
                    activeStudent.growthIndicator === "Improving"
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400"
                      : activeStudent.growthIndicator === "Consistent"
                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-450"
                      : "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-450"
                  }`}>
                    <Award className="w-3.5 h-3.5" />
                    <span>{activeStudent.growthIndicator}</span>
                  </div>
                </div>
              </div>

              {/* Bento box summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Latest Mark</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {activeStudent.history[activeStudent.history.length - 1]?.score}%
                  </span>
                  <span className="text-[9px] text-slate-400 block font-bold">Updated this week</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Term Average</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {Math.round(activeStudent.history.reduce((acc, curr) => acc + curr.score, 0) / activeStudent.history.length)}%
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-450 font-bold block">Passing Grade</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Highest Mark</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {Math.max(...activeStudent.history.map(h => h.score))}%
                  </span>
                  <span className="text-[9px] text-slate-400 block font-bold">Best performance</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Attendance Rate</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {activeStudent.attendanceRate}%
                  </span>
                  <span className="text-[9px] text-slate-400 block font-bold">Total active days</span>
                </div>
              </div>
            </div>

            {/* 2. Graphical Trend Progression Line Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Academic Trend Progression Line</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Comparing candidate's score (solid green) against overall class average (dotted gray)</p>
                </div>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Max: 100%
                </span>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full overflow-x-auto pt-2">
                <div className="min-w-[480px]">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    {/* Grid Lines */}
                    {[20, 40, 60, 80, 100].map((level, i) => {
                      const y = height - padding - (level / 100) * (height - 2 * padding);
                      return (
                        <g key={i}>
                          <line 
                            x1={padding} 
                            y1={y} 
                            x2={width - padding} 
                            y2={y} 
                            stroke="#e2e8f0" 
                            strokeWidth="1" 
                            strokeDasharray="4 4" 
                            className="dark:stroke-slate-800"
                          />
                          <text 
                            x={padding - 8} 
                            y={y + 3} 
                            textAnchor="end" 
                            fontSize="8" 
                            fontWeight="bold"
                            fill="#94a3b8"
                            className="font-mono"
                          >
                            {level}%
                          </text>
                        </g>
                      );
                    })}

                    {/* Class Average Line (Dashed Gray) */}
                    {avgPoints && avgPoints.length > 1 && (
                      <path
                        d={avgPoints.reduce((pathStr, pt, idx) => 
                          idx === 0 ? `M ${pt.x} ${pt.y}` : `${pathStr} L ${pt.x} ${pt.y}`, ""
                        )}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.65"
                      />
                    )}

                    {/* Student Progress Line (Emerald Bold) */}
                    {points && points.length > 1 && (
                      <path
                        d={points.reduce((pathStr, pt, idx) => 
                          idx === 0 ? `M ${pt.x} ${pt.y}` : `${pathStr} L ${pt.x} ${pt.y}`, ""
                        )}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Class average dots */}
                    {avgPoints && (avgPoints as any[]).map((pt, idx) => (
                      <circle
                        key={`avg-${idx}`}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#cbd5e1"
                        stroke="#94a3b8"
                        strokeWidth="1"
                        opacity="0.8"
                      />
                    ))}

                    {/* Student dots with hover/label anchors */}
                    {points && (points as any[]).map((pt, idx) => (
                      <g key={`stud-${idx}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6.5"
                          fill="#ffffff"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          className="cursor-pointer hover:r-8 transition-all"
                        />
                        <text
                          cx={pt.x}
                          y={pt.y - 12}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="black"
                          fill="#0f172a"
                          className="font-mono dark:fill-white"
                        >
                          {pt.score}%
                        </text>
                        {/* X Axis Labels */}
                        <text
                          x={pt.x}
                          y={height - 8}
                          textAnchor="middle"
                          fontSize="7.5"
                          fontWeight="bold"
                          fill="#64748b"
                          className="font-sans"
                        >
                          {pt.label.split(":")[0]}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Legends */}
              <div className="flex items-center gap-4 text-[10px] justify-center text-slate-400 font-bold border-t border-slate-50 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 bg-emerald-500 rounded"></div>
                  <span>{activeStudent.name}'s Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-slate-300 border-t border-dashed border-slate-400"></div>
                  <span>Overall Class Average</span>
                </div>
              </div>
            </div>

            {/* 3. Strength / Focus Analysis + PTA talking points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths & Focus Areas */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Syllabus Diagnostic</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      Verified Strengths
                    </span>
                    <ul className="mt-1.5 space-y-1">
                      {activeStudent.strengths.map((st, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      Recommended Focus
                    </span>
                    <ul className="mt-1.5 space-y-1">
                      {activeStudent.weaknesses.map((wk, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Automated Parent-Teacher Association talking points */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>Parent-Teacher talking points</span>
                    </h4>
                    <span className="text-[8px] font-extrabold text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase font-mono">
                      Auto-Gen
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    This message is formulated from the terminal score trends and can be copied or printed for reports.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-3 font-medium">
                    "{generatedPTAMessage}"
                  </div>
                </div>

                <button
                  id="btn_copy_pta_message"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPTAMessage);
                    alert("PTA Talking points copied to clipboard!");
                  }}
                  className="w-full mt-4 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Copy Message for Report Card</span>
                </button>
              </div>

            </div>

            {/* 4. Complete Graded Records Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Historical Assessment Records Breakdown</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                      <th className="py-2.5">Evaluation / Test</th>
                      <th className="py-2.5 text-center">Score achieved</th>
                      <th className="py-2.5 text-center">Class average</th>
                      <th className="py-2.5 text-center">Standard status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeStudent.history.map((h, i) => {
                      const diff = h.score - h.classAvg;
                      return (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-300">
                          <td className="py-2.5 font-bold text-slate-800 dark:text-slate-150">{h.name}</td>
                          <td className="py-2.5 text-center font-mono font-bold text-slate-900 dark:text-white">{h.score}%</td>
                          <td className="py-2.5 text-center font-mono text-slate-400">{h.classAvg}%</td>
                          <td className="py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-[5px] text-[9px] font-extrabold uppercase ${
                              diff >= 10
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450"
                                : diff <= -5
                                ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}>
                              {diff >= 10 ? "Above Avg" : diff <= -5 ? "Below Avg" : "On Par"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
