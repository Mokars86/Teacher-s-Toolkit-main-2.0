import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Trash2, Edit3, Calendar, Download, Sparkles, CheckCircle2,
  Bookmark, ArrowLeft, Layers, Printer, Save, CheckCircle, FileText, FileCheck, RefreshCw
} from 'lucide-react';

interface LessonPlan {
  id: string;
  week: number;
  subject: string;
  className: string;
  topic: string;
  objectives: string;
  tlms: string; // Teaching & Learning Materials
  activities: string;
  evaluation: string;
  isCompleted: boolean;
}

interface LessonPlannerProps {
  onBack: () => void;
}

// Curriculum Presets aligned with Ghanaian Educational Standard (GES) syllabus guidelines
const GHANA_CURRICULUM_PRESETS: Omit<LessonPlan, 'id' | 'isCompleted'>[] = [
  {
    week: 1,
    subject: "Mathematics",
    className: "Primary 5 Emerald",
    topic: "Proper and Improper Fractions",
    objectives: "By the end of the lesson, pupils will be able to:\n1. Identify proper and improper fractions using concrete visual shapes.\n2. Convert improper fractions into mixed numbers with 90% accuracy.",
    tlms: "Fraction charts, paper circular cutouts, and OMR math cards.",
    activities: "Teacher leads pupils to shade fractions of circle shapes. Pupils interact in pairs converting visual cards to improper fractions on the board. Classroom exercise follows.",
    evaluation: "Interactive OMR Quiz (10 Questions on identifying proper, improper fractions and conversion)."
  },
  {
    week: 2,
    subject: "Integrated Science",
    className: "JHS 2 Gold",
    topic: "Photosynthesis and Plant Starch",
    objectives: "By the end of the lesson, students will be able to:\n1. Formulate the chemical equation for photosynthesis.\n2. Outline the steps to test a green leaf for starch using iodine solution.",
    tlms: "Fresh green leaves, iodine solution, beaker, Bunsen burner, test tubes, and OMR science quiz keys.",
    activities: "Teacher conducts leaf bleach experiment demonstration safety-first. Students record color changes. Class discusses chlorophyll synthesis under sunlight.",
    evaluation: "Rapid 15-question OMR check on Photosynthesis reactants and laboratory safety protocols."
  },
  {
    week: 3,
    subject: "English Language",
    className: "SHS 1 Arts",
    topic: "Argumentative Writing Structure",
    objectives: "By the end of the lesson, students will be able to:\n1. Differentiate between debate and prose argumentative formats.\n2. Construct a coherent thesis statement on the topic 'Is Mobile Technology Helpful or Destructive to High School Students?'.",
    tlms: "Model argumentative essay booklet, whiteboard markers, and evaluation check sheets.",
    activities: "Group brainstorming on pros and cons. Teacher defines paragraph structure: introduction, body arguments, counter-argument, and conclusion. Students practice introductory paragraph drafts.",
    evaluation: "Classroom debate presentation peer-review followed by a 10-question OMR grammar and transition words test."
  }
];

export function LessonPlanner({ onBack }: LessonPlannerProps) {
  const [plans, setPlans] = useState<LessonPlan[]>(() => {
    const cached = localStorage.getItem("omr_lesson_plans");
    if (cached) return JSON.parse(cached);
    // Seed default presets with unique IDs
    return GHANA_CURRICULUM_PRESETS.map((p, i) => ({
      ...p,
      id: `lesson_${Date.now()}_${i}`,
      isCompleted: i === 0 // Mark first one as completed/approved
    }));
  });

  const [activePlanId, setActivePlanId] = useState<string>(plans[0]?.id || "");
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form State
  const [formWeek, setFormWeek] = useState<number>(1);
  const [formSubject, setFormSubject] = useState<string>("Mathematics");
  const [formClass, setFormClass] = useState<string>("JHS 2 Gold");
  const [formTopic, setFormTopic] = useState<string>("");
  const [formObjectives, setFormObjectives] = useState<string>("");
  const [formTlms, setFormTlms] = useState<string>("");
  const [formActivities, setFormActivities] = useState<string>("");
  const [formEvaluation, setFormEvaluation] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("omr_lesson_plans", JSON.stringify(plans));
  }, [plans]);

  // Find active plan details
  const activePlan = plans.find(p => p.id === activePlanId);

  // Apply Ghanaian curriculum preset helper
  const handleLoadPreset = (preset: typeof GHANA_CURRICULUM_PRESETS[0]) => {
    setFormWeek(preset.week);
    setFormSubject(preset.subject);
    setFormClass(preset.className);
    setFormTopic(preset.topic);
    setFormObjectives(preset.objectives);
    setFormTlms(preset.tlms);
    setFormActivities(preset.activities);
    setFormEvaluation(preset.evaluation);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim()) {
      alert("Please provide a Lesson Topic!");
      return;
    }

    if (editingPlanId) {
      // Editing Mode
      setPlans(prev => prev.map(p => p.id === editingPlanId ? {
        ...p,
        week: formWeek,
        subject: formSubject,
        className: formClass,
        topic: formTopic,
        objectives: formObjectives,
        tlms: formTlms,
        activities: formActivities,
        evaluation: formEvaluation
      } : p));
      setEditingPlanId(null);
    } else {
      // Create Mode
      const newPlan: LessonPlan = {
        id: `lesson_${Date.now()}`,
        week: formWeek,
        subject: formSubject,
        className: formClass,
        topic: formTopic,
        objectives: formObjectives,
        tlms: formTlms,
        activities: formActivities,
        evaluation: formEvaluation,
        isCompleted: false
      };
      setPlans(prev => [newPlan, ...prev]);
      setActivePlanId(newPlan.id);
      setIsAddingNew(false);
    }
    
    // Clear form
    resetForm();
  };

  const resetForm = () => {
    setFormWeek(1);
    setFormSubject("Mathematics");
    setFormClass("JHS 2 Gold");
    setFormTopic("");
    setFormObjectives("");
    setFormTlms("");
    setFormActivities("");
    setFormEvaluation("");
  };

  const handleStartEdit = (p: LessonPlan) => {
    setEditingPlanId(p.id);
    setFormWeek(p.week);
    setFormSubject(p.subject);
    setFormClass(p.className);
    setFormTopic(p.topic);
    setFormObjectives(p.objectives);
    setFormTlms(p.tlms);
    setFormActivities(p.activities);
    setFormEvaluation(p.evaluation);
    setIsAddingNew(true); // Share the same form screen
  };

  const handleDeletePlan = (id: string) => {
    if (confirm("Are you sure you want to remove this weekly lesson plan?")) {
      const remaining = plans.filter(p => p.id !== id);
      setPlans(remaining);
      if (activePlanId === id && remaining.length > 0) {
        setActivePlanId(remaining[0].id);
      }
    }
  };

  const toggleApproveStatus = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isCompleted: !p.isCompleted } : p));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100">
      
      {/* Upper Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              id="btn_back_lesson_planner"
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-350"
              title="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Weekly Lesson Planner & Scheme of Work</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Digital Syllabus Notebook</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isAddingNew && (
              <button
                id="btn_planner_add_new"
                onClick={() => {
                  resetForm();
                  setEditingPlanId(null);
                  setIsAddingNew(true);
                }}
                className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Weekly Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        
        {isAddingNew ? (
          /* Form to Add / Customize Lesson Plan */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {editingPlanId ? "Edit Lesson Plan Detail" : "Build Weekly Lesson Plan"}
                </h2>
                <p className="text-[11px] text-slate-400">Provide weekly evaluation and specific teaching & learning materials (TLMs)</p>
              </div>
              <button
                type="button"
                id="btn_cancel_form"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingPlanId(null);
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
              >
                Cancel
              </button>
            </div>

            {/* Ghanaian Syllabus Templates Section */}
            {!editingPlanId && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-450 uppercase tracking-wide">
                    GES Curriculum Quick Presets
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Select a template to auto-populate curriculum-aligned objectives, teacher actions, and appropriate evaluation metrics:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {GHANA_CURRICULUM_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      id={`btn_load_preset_${index}`}
                      onClick={() => handleLoadPreset(preset)}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-emerald-500 text-left transition duration-150"
                    >
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white">{preset.subject}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{preset.topic}</p>
                      <span className="text-[8px] font-mono text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.2 rounded mt-1 inline-block">
                        {preset.className}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Week selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Week</label>
                  <select
                    value={formWeek}
                    onChange={(e) => setFormWeek(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(wk => (
                      <option key={wk} value={wk}>Week {wk}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject / Course</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                    required
                  />
                </div>

                {/* Class Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Level</label>
                  <input
                    type="text"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    placeholder="e.g. JHS 2 Gold"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                    required
                  />
                </div>

              </div>

              {/* Topic Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lesson Topic / Core Focus</label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. Fractions Addition or Laws of Thermodynamics"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  required
                />
              </div>

              {/* Specific Objectives */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specific Objectives (Syllabus Standard)</label>
                <textarea
                  rows={3}
                  value={formObjectives}
                  onChange={(e) => setFormObjectives(e.target.value)}
                  placeholder="What will students learn or construct? Formulate in measurable bullet points."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  required
                />
              </div>

              {/* Teaching Aids / TLMs */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teaching & Learning Materials (TLMs)</label>
                <input
                  type="text"
                  value={formTlms}
                  onChange={(e) => setFormTlms(e.target.value)}
                  placeholder="e.g. Bubble sheet models, fresh plants, metric scale meters"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  required
                />
              </div>

              {/* Activities Flow */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teacher & Student Interactive Activities</label>
                <textarea
                  rows={4}
                  value={formActivities}
                  onChange={(e) => setFormActivities(e.target.value)}
                  placeholder="Step-by-step curriculum instructions, pair-shares, and blackboard notes..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  required
                />
              </div>

              {/* Evaluation strategy */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evaluation & Assessment Plan</label>
                <input
                  type="text"
                  value={formEvaluation}
                  onChange={(e) => setFormEvaluation(e.target.value)}
                  placeholder="e.g. Standard 15-question OMR bubble sheet, workbook evaluation"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  id="btn_reset_form"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Clear Form
                </button>

                <button
                  type="submit"
                  id="btn_submit_form"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Save to Notebook
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Main Notebook Layout */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Hand: Saved Plans Directory */}
            <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Syllabus Notebook Directory</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Click a plan to review and edit its complete objectives</p>
              </div>

              {plans.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-slate-150 rounded-xl">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 mt-2">No weekly lesson plans logged yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      className={`w-full p-3 rounded-xl border transition-all text-left relative group ${
                        activePlanId === p.id
                          ? "border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/10 ring-2 ring-emerald-500/10"
                          : "border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      <button
                        type="button"
                        id={`btn_select_plan_${p.id}`}
                        onClick={() => setActivePlanId(p.id)}
                        className="w-full text-left focus:outline-none"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                            Week {p.week} • {p.subject}
                          </span>
                          
                          {p.isCompleted && (
                            <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded uppercase">
                              Approved
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-slate-800 dark:text-slate-150 mt-1 line-clamp-1">{p.topic}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{p.className}</p>
                      </button>

                      {/* Small action tools inside directory */}
                      <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-slate-50 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          id={`btn_edit_plan_small_${p.id}`}
                          onClick={() => handleStartEdit(p)}
                          className="p-1 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition text-slate-400"
                          title="Edit plan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`btn_delete_plan_small_${p.id}`}
                          onClick={() => handleDeletePlan(p.id)}
                          className="p-1 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition text-slate-400"
                          title="Delete plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Hand: Detailed Weekly Plan Presenter (PTA/Inspection Ready) */}
            <div className="md:col-span-8 space-y-6">
              {activePlan ? (
                <div className="space-y-6">
                  
                  {/* Action Bar */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="btn_toggle_approve_plan"
                        onClick={() => toggleApproveStatus(activePlan.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                          activePlan.isCompleted
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                        }`}
                      >
                        {activePlan.isCompleted ? (
                          <>
                            <FileCheck className="w-4 h-4 text-emerald-500" />
                            <span>Approved by Administration</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 text-slate-400" />
                            <span>Mark as Approved / Inspector Signed</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="btn_edit_active_plan"
                        onClick={() => handleStartEdit(activePlan)}
                        className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        id="btn_print_plan"
                        onClick={() => {
                          window.print();
                        }}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Outline</span>
                      </button>
                    </div>
                  </div>

                  {/* High fidelity Paper/Document-look Printable Lesson Plan Sheet */}
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-6 printable-sheet">
                    {/* Background faint grid look */}
                    <div className="absolute inset-0 bg-slate-100/10 dark:bg-slate-900/10 pointer-events-none" />

                    <div className="border-b-4 border-emerald-600 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black font-mono tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded uppercase">
                          Official Curriculum Lesson Plan
                        </span>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight uppercase">
                          {activePlan.topic}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium">Prepared for administration review</p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">WEEK {activePlan.week}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activePlan.subject}</p>
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900 mt-1 inline-block">
                          {activePlan.className}
                        </span>
                      </div>
                    </div>

                    {/* Detailed section grids */}
                    <div className="grid grid-cols-1 gap-6 relative z-10 text-xs leading-relaxed">
                      
                      {/* Objectives */}
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          I. Specific Objectives
                        </h4>
                        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium pl-1">
                          {activePlan.objectives}
                        </div>
                      </div>

                      {/* TLMs */}
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          II. Teaching & Learning Materials (TLMs)
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 font-semibold pl-1">
                          {activePlan.tlms}
                        </p>
                      </div>

                      {/* Lesson Activities */}
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          III. Teacher & Student Activities
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium pl-1 leading-relaxed">
                          {activePlan.activities}
                        </p>
                      </div>

                      {/* Evaluation */}
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          IV. Evaluation & Assessment Criteria
                        </h4>
                        <div className="text-slate-700 dark:text-slate-300 font-semibold pl-1 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{activePlan.evaluation}</span>
                        </div>
                      </div>

                    </div>

                    {/* Official Stamp & Signature Block for Inspection */}
                    <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-800 pt-6 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 text-[10px]">
                      
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 space-y-3">
                        <p className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">I. Teacher Declaration</p>
                        <div className="pt-6 border-b border-slate-200 dark:border-slate-700"></div>
                        <div className="flex justify-between font-mono text-slate-400">
                          <span>Signature of Classroom Teacher</span>
                          <span>Date Logged</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 space-y-3 relative overflow-hidden">
                        
                        {/* Approval watermark stamp */}
                        {activePlan.isCompleted && (
                          <div className="absolute top-2 right-2 border-4 border-emerald-500/30 text-emerald-500/30 font-black uppercase tracking-widest text-[11px] rotate-12 p-1.5 px-3 rounded pointer-events-none">
                            APPROVED
                          </div>
                        )}

                        <p className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">II. Administration / Headteacher Inspection</p>
                        <div className="pt-6 border-b border-slate-200 dark:border-slate-700"></div>
                        <div className="flex justify-between font-mono text-slate-400">
                          <span>Head of School Stamp / Seal</span>
                          <span>Date Approved</span>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">Select a Weekly Lesson Plan</h3>
                  <p className="text-xs text-slate-500">Choose a weekly outline from the directory sidebar on the left, or create a new plan.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
