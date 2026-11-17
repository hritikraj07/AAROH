import React, { useState } from 'react';
import {
  Network,
  BookOpen,
  ArrowRight,
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
  Unlock,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Course } from '../../../types';
import { SkillTreeModal } from './SkillTreeModal';
import { CurriculumTracker } from './CurriculumTracker';
import { getFacultyFullName } from '../../../utils/facultyUtils';

// Custom 4-layer premium button shadows
const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

export const SkillTreeTab: React.FC = () => {
  const { courses, users, skillTrees, assignments } = useApp();

  const effectiveCourses: Course[] =
    courses.length > 0
      ? courses
      : [
          {
            id: 'all_cs',
            code: 'CS301',
            name: 'Operating Systems & System Architecture',
            credits: 4,
            facultyName: 'Dr. K. Ramanujam',
            facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
            roomDefault: 'Lab 402',
            colorTag: 'teal',
          },
          {
            id: 'cs_ds',
            code: 'CS201',
            name: 'Data Structures & Algorithms',
            credits: 4,
            facultyName: 'Dr. K. Ramanujam',
            facultyEmail: 'prof.raman@faculty.aaroh.edu.in',
            roomDefault: 'LH-101',
            colorTag: 'indigo',
          },
        ];

  const [activeCourseId, setActiveCourseId] = useState<string>(
    effectiveCourses[0]?.id || 'all_cs'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedCourse =
    effectiveCourses.find(c => c.id === activeCourseId) || effectiveCourses[0];

  const currentTree =
    skillTrees.find(
      t =>
        t.courseId === selectedCourse?.id ||
        t.courseCode.toLowerCase() === selectedCourse?.code.toLowerCase()
    ) || skillTrees[0];

  const nodes = currentTree?.nodes || [];

  // Determine completed nodes
  const passedCodingLabs = assignments.filter(
    a =>
      a.type === 'coding' &&
      (a.status === 'submitted' || a.status === 'graded') &&
      (!a.testResultsSummary || !a.testResultsSummary.includes('❌'))
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* 1. Dynamic Interactive Curriculum Tracker (Primary Section) */}
      <CurriculumTracker onOpenModal={() => setIsModalOpen(true)} />

      {/* 2. Course Syllabus & Prerequisite Browser */}
      <div className="bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-700">
                {selectedCourse?.code}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedCourse?.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Instructor: {getFacultyFullName(selectedCourse, null, users)} • {selectedCourse?.credits} Credits
            </p>
          </div>

          {/* Primary View Skill Tree Button with custom 4-layer tactile depth */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`rounded-full bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] text-white text-xs px-5 py-2.5 font-medium transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto`}
          >
            <Network className="w-4 h-4" />
            <span>View Skill Tree</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Course Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {effectiveCourses.map(course => {
            const isSelected = course.id === activeCourseId;
            return (
              <button
                key={course.id}
                onClick={() => setActiveCourseId(course.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F766E] text-white shadow-sm border border-teal-800'
                    : 'bg-slate-50 dark:bg-[#18181B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#27272A] hover:bg-slate-100 dark:hover:bg-[#27272A]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {course.code}: {course.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Node Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map(node => {
            const isCompleted =
              node.isCompleted ||
              passedCodingLabs.some(l =>
                (l.title || '').toLowerCase().includes((node.requiredLabKeyword || node.title).toLowerCase())
              );

            return (
              <div
                key={node.id}
                onClick={() => setIsModalOpen(true)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isCompleted
                    ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/60'
                    : 'bg-slate-50/60 dark:bg-[#18181B]/60 border-slate-200 dark:border-[#27272A]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold text-teal-800 dark:text-teal-400">
                      Tier {node.level}
                    </span>
                    {isCompleted && (
                      <span className="text-[9px] font-bold text-emerald-600 uppercase font-mono">
                        Mastered
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {node.title}
                  </h4>
                  {node.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {node.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curriculum Tracker & Mastery Modal */}
      <SkillTreeModal
        courseId={selectedCourse?.id || 'all_cs'}
        courseCode={selectedCourse?.code}
        courseName={selectedCourse?.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default SkillTreeTab;
