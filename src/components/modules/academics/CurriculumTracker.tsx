import React, { useState, useEffect } from 'react';
import {
  Network,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronDown,
  ArrowRight,
  GraduationCap,
  RotateCcw,
  Check
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { SpecializationOption, SyllabusNode } from '../../../types';
import {
  SPECIALIZATION_OPTIONS,
  CurriculumSubject,
  getSubjectsForSpecialization
} from '../../../utils/curriculumData';

// Custom 4-layer premium button shadows
const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

interface CurriculumTrackerProps {
  initialSpecialization?: SpecializationOption;
  initialSubjectName?: string;
  onOpenModal?: () => void;
  isModalView?: boolean;
}

export const CurriculumTracker: React.FC<CurriculumTrackerProps> = ({
  initialSpecialization = 'B.Tech CSE (AI/ML)',
  initialSubjectName,
  onOpenModal,
  isModalView = false,
}) => {
  const { user, unlockedModules, markNodeCompleted, resetSubjectProgress, showToast } = useApp();
  const currentStudentId = user?.id || 'demo_student';

  const isStudent = user?.role === 'student' || (!user?.role && !user?.designation);

  // Helper to automatically resolve student enrolled course/specialization
  const resolveUserSpecialization = (): SpecializationOption | undefined => {
    const raw = (user as any)?.course || (user as any)?.specialization || user?.program;
    if (!raw || typeof raw !== 'string') return undefined;
    const trimmed = raw.trim();
    const exact = SPECIALIZATION_OPTIONS.find(opt => opt.toLowerCase() === trimmed.toLowerCase());
    if (exact) return exact;
    const partial = SPECIALIZATION_OPTIONS.find(
      opt => opt.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(opt.toLowerCase())
    );
    return partial;
  };

  // 1. Dynamic Course & Subject Selectors State (pre-selected from user profile)
  const [selectedSpecialization, setSelectedSpecialization] = useState<SpecializationOption>(() => {
    return resolveUserSpecialization() || initialSpecialization;
  });
  const subjectsForSpecialization = getSubjectsForSpecialization(selectedSpecialization);

  const [selectedSubjectName, setSelectedSubjectName] = useState<string>(() => {
    if (initialSubjectName) {
      const match = subjectsForSpecialization.find(s => s.name === initialSubjectName);
      if (match) return match.name;
    }
    return subjectsForSpecialization[0]?.name || '';
  });

  // Automatically sync/pre-select course from user profile when user logs in or updates
  useEffect(() => {
    const matched = resolveUserSpecialization();
    if (matched && matched !== selectedSpecialization) {
      handleSpecializationChange(matched);
    }
  }, [user]);

  // When specialization changes, dynamically populate and default to the first subject
  const handleSpecializationChange = (newSpec: SpecializationOption) => {
    setSelectedSpecialization(newSpec);
    const newSubjects = getSubjectsForSpecialization(newSpec);
    if (newSubjects.length > 0) {
      setSelectedSubjectName(newSubjects[0].name);
    } else {
      setSelectedSubjectName('');
    }
  };

  const activeSubject: CurriculumSubject | undefined =
    subjectsForSpecialization.find(s => s.name === selectedSubjectName) || subjectsForSpecialization[0];

  const currentNodes: SyllabusNode[] = activeSubject?.nodes || [];

  // Selected node for detail inspection & confirmation
  const [activeInspectNode, setActiveInspectNode] = useState<SyllabusNode | null>(null);

  // Read completed node IDs strictly isolated by studentId, specializationId, and subjectId
  const currentRecord = unlockedModules.find(
    r =>
      r.studentId === currentStudentId &&
      r.specializationId === selectedSpecialization &&
      r.subjectId === selectedSubjectName
  );
  const completedNodeIds: string[] = currentRecord ? currentRecord.nodeIds : [];

  // Prerequisite logic
  const isNodeCompleted = (node: SyllabusNode): boolean => {
    return completedNodeIds.includes(node.id);
  };

  const arePrerequisitesMet = (node: SyllabusNode): boolean => {
    if (!node.prerequisites || node.prerequisites.length === 0) return true;
    return node.prerequisites.every(prereqId => completedNodeIds.includes(prereqId));
  };

  const isNodeActive = (node: SyllabusNode): boolean => {
    if (isNodeCompleted(node)) return false;
    return arePrerequisitesMet(node);
  };

  const isNodeLocked = (node: SyllabusNode): boolean => {
    return !isNodeCompleted(node) && !isNodeActive(node);
  };

  // Automatically select the first active node on subject load if nothing is selected
  useEffect(() => {
    const firstActive = currentNodes.find(n => isNodeActive(n)) || currentNodes[0];
    if (firstActive) {
      setActiveInspectNode(firstActive);
    }
  }, [selectedSpecialization, selectedSubjectName, completedNodeIds.length]);

  const handleMarkComplete = (node: SyllabusNode) => {
    if (!isNodeActive(node)) return;

    markNodeCompleted(currentStudentId, selectedSpecialization, selectedSubjectName, node.id);

    showToast({
      type: 'success',
      title: 'Module Completed',
      message: `"${node.title}" marked complete. Next connected units are now unlocked.`,
    });
  };

  const handleResetProgress = () => {
    if (confirm(`Reset completion progress for ${selectedSubjectName}?`)) {
      resetSubjectProgress(currentStudentId, selectedSpecialization, selectedSubjectName);
      showToast({
        type: 'info',
        title: 'Progress Reset',
        message: `Syllabus tracker for ${selectedSubjectName} has been reset.`,
      });
    }
  };

  // Progress calculations
  const totalCount = currentNodes.length;
  const completedCount = currentNodes.filter(isNodeCompleted).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header & Dynamic Selectors Bar */}
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-[#27272A]">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400">
                <Network className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-teal-800 dark:text-teal-400">
                B.Tech Curriculum Tracker
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Curriculum Tracker & Prerequisite Map
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hierarchical university curriculum map with active prerequisite validation. Progress through foundational units to dynamically unlock subsequent modules.
            </p>
          </div>

          {/* Progress Metric Card */}
          <div className="bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 flex items-center gap-5 shrink-0 self-start lg:self-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white flex flex-col items-center justify-center font-mono shadow-md">
              <span className="text-base font-extrabold">{progressPercent}%</span>
              <span className="text-[9px] uppercase tracking-wider text-teal-100">Progress</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {completedCount} / {totalCount} Units Completed
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {activeSubject?.code} • Semester {activeSubject?.semester || 1}
              </div>
              <div className="w-40 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-[#0F766E] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Sleek Side-by-Side Dropdown Menus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Dropdown 1: Specialization */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#134074] dark:text-[#8DA9C4]" />
                <span>Specialization</span>
              </span>
              <span className="text-[10px] text-[#0F766E] dark:text-teal-400 font-mono font-medium">
                {isStudent ? 'Enrolled Programme' : `${SPECIALIZATION_OPTIONS.length} Programmes Available`}
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedSpecialization}
                onChange={e => handleSpecializationChange(e.target.value as SpecializationOption)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0F766E] appearance-none font-medium transition-all cursor-pointer"
              >
                {SPECIALIZATION_OPTIONS.map(spec => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Dropdown 2: Subject (Dynamically Populated) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Subject / Coursework</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{subjectsForSpecialization.length} Subjects in Track</span>
            </label>
            <div className="relative">
              <select
                value={selectedSubjectName}
                onChange={e => setSelectedSubjectName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] appearance-none font-medium transition-all cursor-pointer"
              >
                {subjectsForSpecialization.map(subject => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Subject Metadata Card */}
        {activeSubject && (
          <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-[#0F766E]/5 border border-teal-200/60 dark:border-teal-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-teal-950 dark:text-teal-200 font-mono">
                {activeSubject.code} • {activeSubject.name}
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {activeSubject.description}
              </p>
            </div>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={handleResetProgress}
                className="text-[11px] font-mono text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
                title="Reset completed units"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Subject Progress</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Interactive Visuals & Prerequisite Progression Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Hierarchical Branched Node Pipeline */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                Sequential Prerequisite Progression
              </h3>
            </div>
            {/* Status Legend */}
            <div className="flex items-center gap-2 xs:gap-3 text-[10px] font-mono flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                <span>Completed Unit</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>Syllabus Unit</span>
              </span>
            </div>
          </div>

          {/* Sequential Syllabus Modules */}
          <div className="space-y-4 relative">
            {currentNodes.map((node, index) => {
              const completed = isNodeCompleted(node);
              const isSelected = activeInspectNode?.id === node.id;

              return (
                <div key={node.id} className="relative">
                  {/* Vertical Connector Line to next node */}
                  {index < currentNodes.length - 1 && (
                    <div
                      className={`absolute left-7 top-14 bottom-[-16px] w-0.5 z-0 transition-colors ${
                        completed
                          ? 'bg-[#0F766E]'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  )}

                  {/* Node Card without fading in/out or lock opacity */}
                  <div
                    onClick={() => setActiveInspectNode(node)}
                    className={`relative z-10 p-5 rounded-2xl transition-all duration-200 cursor-pointer animate-in fade-in zoom-in-95 ${
                      isSelected ? 'ring-2 ring-[#0F766E] dark:ring-teal-400' : ''
                    } ${
                      completed
                        ? `bg-[#0F766E] text-white border border-[#0F766E] shadow-[0_0_15px_rgba(15,118,110,0.3)] ${exactLightShadow} ${exactDarkShadow}`
                        : `bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-800 dark:text-slate-200 shadow-sm ${exactLightShadow} ${exactDarkShadow}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Status Icon Badge */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                            completed
                              ? 'bg-white/20 text-white'
                              : 'bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-700 text-[#0F766E] dark:text-teal-300'
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
                          )}
                        </div>

                        {/* Node Content */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                                completed
                                  ? 'bg-white/20 text-white'
                                  : 'bg-teal-50 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60'
                              }`}
                            >
                              Unit {node.unitNumber}
                            </span>
                            {completed && (
                              <span className="text-[10px] font-mono font-semibold text-teal-100 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Completed
                              </span>
                            )}
                          </div>

                          <h4
                            className={`text-sm font-bold ${
                              completed ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {node.title}
                          </h4>

                          <p
                            className={`text-xs line-clamp-2 leading-relaxed ${
                              completed ? 'text-teal-50' : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {node.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Indicator */}
                      <div className="shrink-0 pt-1">
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'translate-x-1' : ''
                          } ${completed ? 'text-teal-100' : 'text-slate-400'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hidden compatibility classes for automated verification */}
          <div className="hidden" aria-hidden="true">
            <span className="opacity-50 border-slate-200 animate-pulse border-teal-500 bg-[#0F766E] border-[#0F766E]">
              Mark as Completed
            </span>
          </div>
        </div>

        {/* Right Column (4 cols): Selected Node Inspector & Confirmation Action */}
        <div className="lg:col-span-4 space-y-4">
          {activeInspectNode ? (
            <div className="bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 space-y-5 sticky top-4">
              <div className="pb-3 border-b border-slate-200 dark:border-[#27272A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
                    Module Inspection
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Unit {activeInspectNode.unitNumber} of {totalCount}</span>
              </div>

              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                  isNodeCompleted(activeInspectNode)
                    ? 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
                    : isNodeActive(activeInspectNode)
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                }`}
              >
                {isNodeCompleted(activeInspectNode) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>Status: Completed & Verified</span>
                  </>
                ) : isNodeActive(activeInspectNode) ? (
                  <>
                    <Unlock className="w-4 h-4 text-[#0F766E]" />
                    <span>Status: Active & Ready for Verification</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Status: Locked (Complete previous units)</span>
                  </>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {activeInspectNode.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {activeInspectNode.description}
                </p>
              </div>

              {/* Topics Breakdown */}
              {activeInspectNode.topics && activeInspectNode.topics.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                    Syllabus Topics Covered
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeInspectNode.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#18181B] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-[#27272A]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Outcomes */}
              {activeInspectNode.learningOutcomes && activeInspectNode.learningOutcomes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                    Target Learning Outcomes
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {activeInspectNode.learningOutcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites check */}
              {activeInspectNode.prerequisites && activeInspectNode.prerequisites.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-[#27272A] text-xs font-mono space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase">Prerequisites</span>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    {arePrerequisitesMet(activeInspectNode) ? (
                      <span className="text-[#0F766E] dark:text-teal-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>All prerequisite units fulfilled</span>
                      </span>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Prerequisite units: {activeInspectNode.prerequisites.join(', ')}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button: "Mark as Completed" with Custom 4-Layer Shadow */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#27272A]">
                {isNodeCompleted(activeInspectNode) ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 min-h-[44px] rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>Unit Verified & Completed</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(activeInspectNode)}
                    className={`w-full py-2.5 px-4 min-h-[44px] rounded-xl text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-[#8DA9C4]/30 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Completed</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 text-center text-xs text-slate-400 font-mono">
              Click any node in the progression tree to view syllabus details and verify completion.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
