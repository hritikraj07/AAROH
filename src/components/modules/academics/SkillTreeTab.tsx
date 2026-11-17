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
      {/* Dynamic Interactive Curriculum Tracker (Primary Section) */}
      <CurriculumTracker onOpenModal={() => setIsModalOpen(true)} />

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
