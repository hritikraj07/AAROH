import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { AssessmentType, GradeRecord } from '../../../types';
import { Award, Sliders, TrendingUp, BookOpen, CheckCircle, Sparkles, Filter } from 'lucide-react';

export const AcademicResultsTab: React.FC = () => {
  const { user, grades, courses } = useApp();

  // Filter grades for current logged-in student
  const studentGrades = useMemo(() => {
    const studentId = user?.id || 'usr_std_demo';
    const email = user?.email?.toLowerCase();
    const userGrades = grades.filter(
      g => g.studentId === studentId || (email && g.studentEmail?.toLowerCase() === email)
    );
    return userGrades.length > 0 ? userGrades : grades;
  }, [user, grades]);

  // Filters for Part A
  const [assessmentFilter, setAssessmentFilter] = useState<'All' | AssessmentType>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');

  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    studentGrades.forEach(g => set.add(g.courseCode || g.courseId));
    return Array.from(set);
  }, [studentGrades]);

  const filteredGrades = useMemo(() => {
    return studentGrades.filter(g => {
      if (assessmentFilter !== 'All' && g.assessmentType !== assessmentFilter) return false;
      if (subjectFilter !== 'All' && (g.courseCode || g.courseId) !== subjectFilter) return false;
      return true;
    });
  }, [studentGrades, assessmentFilter, subjectFilter]);

  // Grade point helper
  const getGradePoint = (percentage: number): number => {
    if (percentage >= 90) return 10;
    if (percentage >= 80) return 9;
    if (percentage >= 70) return 8;
    if (percentage >= 60) return 7;
    if (percentage >= 50) return 6;
    return 0;
  };

  // Base CGPA from actual grades
  const { currentCGPA, totalCreditsEarned } = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    studentGrades.forEach(g => {
      const credits = g.credits || 4;
      const pct = g.maxMarks > 0 ? (g.marksScored / g.maxMarks) * 100 : 0;
      const gp = getGradePoint(pct);
      totalPoints += gp * credits;
      totalCredits += credits;
    });

    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '8.40';
    return { currentCGPA: parseFloat(cgpa), totalCreditsEarned: totalCredits || 19 };
  }, [studentGrades]);

  // ==========================================
  // Part B: GPA Scenario Simulator Sliders State
  // ==========================================
  const [simulatedScenarios, setSimulatedScenarios] = useState([
    {
      id: 'sim_1',
      title: 'Automated Coding Lab 3: Distributed Consensus',
      type: 'Automated Coding Lab',
      credits: 4,
      targetScore: 92,
      maxScore: 100,
    },
    {
      id: 'sim_2',
      title: 'Algorithms & Dynamic Programming Capstone',
      type: 'Lab Assessment',
      credits: 4,
      targetScore: 88,
      maxScore: 100,
    },
    {
      id: 'sim_3',
      title: 'Database Performance & Query Optimization End-Sem',
      type: 'End-Sem Theory',
      credits: 4,
      targetScore: 85,
      maxScore: 100,
    },
    {
      id: 'sim_4',
      title: 'Computer Networks Protocol Implementation',
      type: 'Automated Coding Lab',
      credits: 3,
      targetScore: 95,
      maxScore: 100,
    },
  ]);

  const handleSliderChange = (id: string, newScore: number) => {
    setSimulatedScenarios(prev =>
      prev.map(sc => (sc.id === id ? { ...sc, targetScore: newScore } : sc))
    );
  };

  // Projected CGPA on the fly
  const { projectedCGPA, gpaDelta } = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    // Actual grades
    studentGrades.forEach(g => {
      const credits = g.credits || 4;
      const pct = g.maxMarks > 0 ? (g.marksScored / g.maxMarks) * 100 : 0;
      totalPoints += getGradePoint(pct) * credits;
      totalCredits += credits;
    });

    // Simulated additions
    simulatedScenarios.forEach(sc => {
      const pct = (sc.targetScore / sc.maxScore) * 100;
      totalPoints += getGradePoint(pct) * sc.credits;
      totalCredits += sc.credits;
    });

    const projected = totalCredits > 0 ? totalPoints / totalCredits : currentCGPA;
    const rounded = parseFloat(projected.toFixed(2));
    const delta = parseFloat((rounded - currentCGPA).toFixed(2));

    return { projectedCGPA: rounded, gpaDelta: delta };
  }, [studentGrades, simulatedScenarios, currentCGPA]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
            <span>CURRENT VERIFIED CGPA</span>
            <Award className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl sm:text-5xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {currentCGPA.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Cumulative across {studentGrades.length} recorded assessments
          </span>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
            <span>CREDITS EARNED</span>
            <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl sm:text-5xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {totalCreditsEarned}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3" />
            100% Core Requirements on Track
          </span>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
            <span>ACADEMIC STANDING</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              First Class Distinction
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Dean&apos;s Honor Roll Eligible
          </span>
        </div>
      </div>

      {/* Part A: Official Grades Filter & Table */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#27272A]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Official Assessment Results
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified Mid-Sem and End-Sem scorecards signed by department faculty.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono uppercase text-[11px]">Assessment:</span>
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-[#27272A] border border-slate-200 dark:border-[#323236]">
                {(['All', 'Mid-Sem', 'End-Sem'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setAssessmentFilter(tab)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      assessmentFilter === tab
                        ? 'bg-white dark:bg-[#18181B] text-teal-700 dark:text-teal-400 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {uniqueSubjects.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono uppercase text-[11px]">Subject:</span>
                <select
                  value={subjectFilter}
                  onChange={e => setSubjectFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#27272A] rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  <option value="All">All Subjects</option>
                  {uniqueSubjects.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#27272A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-[#27272A]">
              <tr>
                <th className="py-3 px-4 font-semibold">Course Code</th>
                <th className="py-3 px-4 font-semibold">Course Title</th>
                <th className="py-3 px-4 font-semibold">Assessment</th>
                <th className="py-3 px-4 font-semibold">Credits</th>
                <th className="py-3 px-4 font-semibold">Marks Scored</th>
                <th className="py-3 px-4 font-semibold">Percentage</th>
                <th className="py-3 px-4 font-semibold text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
              {filteredGrades.map(g => {
                const ratio = g.maxMarks > 0 ? g.marksScored / g.maxMarks : 0;
                const pct = Math.round(ratio * 100);
                const grade = g.grade || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F');

                return (
                  <tr key={g.id} className="hover:bg-slate-50/60 dark:hover:bg-[#222226] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800 dark:text-teal-400">
                      {g.courseCode || g.courseId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {g.courseName || 'Course'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#323236]">
                        {g.assessmentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {g.credits || 4}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {g.marksScored} <span className="text-slate-400 font-normal">/ {g.maxMarks}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {pct}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                          grade === 'A+' || grade === 'A'
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : grade === 'B+' || grade === 'B'
                            ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                            : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part B: The "GPA Scenario Simulator" */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
                <Sliders className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                GPA Scenario Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Adjust projected marks for upcoming Automated Coding Labs and capstones to dynamically model graduation honors.
            </p>
          </div>

          {/* Large Glowing Dynamic CGPA Display */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#222226] border border-slate-200 dark:border-[#323236] flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-mono font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                PROJECTED CGPA
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(15,118,110,0.35)]">
                {projectedCGPA.toFixed(2)}
              </div>
            </div>

            <div className="border-l border-slate-200 dark:border-[#323236] pl-3">
              <span
                className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                  gpaDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {gpaDelta >= 0 ? `+${gpaDelta.toFixed(2)}` : gpaDelta.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">vs current</span>
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {simulatedScenarios.map(sc => (
            <div
              key={sc.id}
              className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#222226]/50 border border-slate-200/80 dark:border-[#27272A] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {sc.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-teal-800 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800/60">
                      {sc.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {sc.credits} Credits
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold font-mono text-teal-700 dark:text-teal-400">
                    {sc.targetScore}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/{sc.maxScore}</span>
                </div>
              </div>

              {/* Range Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={sc.maxScore}
                  step="1"
                  value={sc.targetScore}
                  onChange={e => handleSliderChange(sc.id, parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 dark:bg-[#323236] rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0 (F)</span>
                  <span>50 (C)</span>
                  <span>75 (B+)</span>
                  <span>90+ (A+)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademicResultsTab;
