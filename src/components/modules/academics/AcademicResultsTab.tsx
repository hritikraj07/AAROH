import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { AssessmentType, SemesterGrade } from '../../../types';
import {
  Award,
  Sliders,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  Calculator,
  Code2
} from 'lucide-react';
import {
  getStoredSemesterGrades,
  computeStudentSemesterMetrics,
  marksToGradePoint,
  marksToLetterGrade,
  SemesterMetric
} from '../../../utils/gradeUtils';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

export const AcademicResultsTab: React.FC = () => {
  const { user, grades, courses } = useApp();

  // Active student identification
  const studentId = user?.id || 'usr_std_demo';
  const studentEmail = user?.email || 'piyush@krmu.edu.in';
  const currentActiveSemester = user?.semester ? Number(user.semester) : 5;

  // Real-time synchronization with localStorage semesterGrades
  const [localVersion, setLocalVersion] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => setLocalVersion(v => v + 1);
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Compute student metrics via gradeUtils Math Engine
  const studentSummary = useMemo(() => {
    return computeStudentSemesterMetrics(studentId, studentEmail);
  }, [studentId, studentEmail, localVersion, grades]);

  // All 8 Semesters list
  const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Selected Semester in the Breakdown UI
  const [selectedSemester, setSelectedSemester] = useState<number>(() => {
    // Default to student's current active semester or latest semester with data
    if (studentSummary.semesters.length > 0) {
      return studentSummary.semesters[studentSummary.semesters.length - 1].semester;
    }
    return currentActiveSemester;
  });

  // Active semester grades data
  const currentSemesterMetric = useMemo(() => {
    return studentSummary.semesters.find(s => s.semester === selectedSemester);
  }, [studentSummary, selectedSemester]);

  // Overall Verified CGPA
  const currentCGPA = studentSummary.overallCGPA > 0 ? studentSummary.overallCGPA : 0;
  const totalCreditsEarned = studentSummary.totalCreditsEarned;

  // ==========================================
  // Part B: Active Semester "What-If" Simulator
  // ==========================================
  // Sliders for upcoming End-Sem exams and pending Automated Coding Labs for CURRENT semester
  const [simulatedScenarios, setSimulatedScenarios] = useState([
    {
      id: 'sim_end_sem_1',
      title: 'Current Semester End-Sem Theory Examination',
      type: 'End-Sem',
      credits: 4,
      targetScore: 85,
      maxScore: 100,
    },
    {
      id: 'sim_coding_lab_1',
      title: 'Automated Coding Labs: Full-Stack Microservices',
      type: 'Automated Coding Labs',
      credits: 4,
      targetScore: 92,
      maxScore: 100,
    },
    {
      id: 'sim_end_sem_2',
      title: 'Operating Systems & Architecture End-Sem',
      type: 'End-Sem',
      credits: 3,
      targetScore: 88,
      maxScore: 100,
    },
    {
      id: 'sim_coding_lab_2',
      title: 'Automated Coding Labs: Algorithmic Verification',
      type: 'Automated Coding Labs',
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

  // Real-time Math for What-If Simulator:
  // Predicts SGPA for the current active semester and projects overall CGPA
  const { predictedCurrentSGPA, projectedCGPA, gpaDelta } = useMemo(() => {
    // 1. Gather baseline marks already recorded for the current active semester
    const activeSemData = studentSummary.semesters.find(s => s.semester === currentActiveSemester);
    let activeSemPoints = 0;
    let activeSemCredits = 0;

    if (activeSemData && activeSemData.courses.length > 0) {
      activeSemData.courses.forEach(c => {
        activeSemPoints += c.gradePoint * c.credits;
        activeSemCredits += c.credits;
      });
    }

    // 2. Add simulated additions for active semester
    simulatedScenarios.forEach(sc => {
      const pct = (sc.targetScore / sc.maxScore) * 100;
      const gp = marksToGradePoint(pct);
      activeSemPoints += gp * sc.credits;
      activeSemCredits += sc.credits;
    });

    const predictedSGPA = activeSemCredits > 0 ? Number((activeSemPoints / activeSemCredits).toFixed(2)) : 0;

    // 3. Overall Projected CGPA = Average of completed past semesters SGPAs + predicted current semester SGPA
    const pastCompletedSemesters = studentSummary.semesters.filter(
      s => s.semester !== currentActiveSemester && s.isCompleted && s.sgpa > 0
    );

    const allSGPAs = pastCompletedSemesters.map(s => s.sgpa);
    if (predictedSGPA > 0) {
      allSGPAs.push(predictedSGPA);
    }

    const calculatedProjectedCGPA =
      allSGPAs.length > 0
        ? Number((allSGPAs.reduce((sum, val) => sum + val, 0) / allSGPAs.length).toFixed(2))
        : predictedSGPA;

    const delta = currentCGPA > 0 ? Number((calculatedProjectedCGPA - currentCGPA).toFixed(2)) : 0;

    return {
      predictedCurrentSGPA: predictedSGPA,
      projectedCGPA: calculatedProjectedCGPA,
      gpaDelta: delta,
    };
  }, [studentSummary, currentActiveSemester, simulatedScenarios, currentCGPA]);

  // Check if active semester has any grades published
  const activeSemesterHasGrades = Boolean(
    studentSummary.semesters.find(s => s.semester === currentActiveSemester)?.courses.length
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Top Metrics Banner with Large Glowing Dynamic CGPA Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Large Glowing Dynamic CGPA Display */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
            <span>CURRENT VERIFIED CGPA</span>
            <Award className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="my-3">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(15,118,110,0.35)]">
              {currentCGPA > 0 ? currentCGPA.toFixed(2) : '0.00'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Average of {studentSummary.completedSemestersCount} completed semester{studentSummary.completedSemestersCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* Total Credits */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
            <span>TOTAL CREDITS EARNED</span>
            <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="my-3">
            <span className="text-4xl sm:text-5xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {totalCreditsEarned}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3" />
            Active Semester: Semester {currentActiveSemester}
          </span>
        </div>

        {/* Academic Standing */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
            <span>ACADEMIC HONORS</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="my-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {currentCGPA >= 8.5
                ? 'First Class with Distinction'
                : currentCGPA >= 7.0
                ? 'First Class Standing'
                : currentCGPA >= 5.0
                ? 'Good Academic Standing'
                : 'Progressing'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Dean&apos;s Honor Roll Threshold: 8.50 CGPA
          </span>
        </div>
      </div>

      {/* 2. Sleek SGPA Bar Chart & Visual List of Completed Semesters */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#27272A]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Semester-Wise Performance Trajectory (SGPA)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cumulative progression tracked across all 8 undergraduate academic semesters.
            </p>
          </div>
          <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
            Scale: 10.0 Maximum
          </div>
        </div>

        {/* Sleek SGPA Bars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {allSemesters.map(semNum => {
            const match = studentSummary.semesters.find(s => s.semester === semNum);
            const sgpa = match ? match.sgpa : 0;
            const isCompleted = match && match.isCompleted && sgpa > 0;
            const isCurrent = semNum === currentActiveSemester;
            const isSelected = selectedSemester === semNum;
            const barHeightPct = isCompleted ? Math.min(100, Math.round((sgpa / 10) * 100)) : 0;

            return (
              <button
                key={semNum}
                type="button"
                onClick={() => setSelectedSemester(semNum)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 dark:border-teal-600 shadow-sm'
                    : 'border-slate-200 dark:border-[#27272A] bg-slate-50/40 dark:bg-[#202025]/40 hover:bg-slate-100/50 dark:hover:bg-[#25252b]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    Sem {semNum}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold">
                      Active
                    </span>
                  )}
                </div>

                {/* Vertical Progress Bar */}
                <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-lg flex flex-col justify-end p-1 overflow-hidden">
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={`w-full rounded-md transition-all duration-500 ${
                      isCompleted
                        ? 'bg-teal-600 dark:bg-[#0F766E]'
                        : 'bg-transparent'
                    }`}
                  />
                </div>

                <div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                    {isCompleted ? sgpa.toFixed(2) : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {isCompleted ? `${match.totalCredits} credits` : 'Pending'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Part A: Official Assessment Results with Semester Tabs */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#27272A]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Official Assessment Results
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified scorecards for Mid-Sem, End-Sem, and Automated Coding Labs signed by department faculty.
            </p>
          </div>

          {/* Semester Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-100 dark:bg-[#27272A] border border-slate-200 dark:border-[#323236]">
            {allSemesters.map(sem => (
              <button
                key={sem}
                type="button"
                onClick={() => setSelectedSemester(sem)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedSemester === sem
                    ? 'bg-white dark:bg-[#18181B] text-teal-800 dark:text-teal-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Semester Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#202025]/50 border border-slate-200/80 dark:border-[#27272A]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800/60">
              Semester {selectedSemester} Scorecard
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {currentSemesterMetric?.courses.length || 0} enrolled course{(currentSemesterMetric?.courses.length || 0) === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 uppercase text-[10px] mr-1">Semester SGPA:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {currentSemesterMetric && currentSemesterMetric.sgpa > 0
                  ? currentSemesterMetric.sgpa.toFixed(2)
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] mr-1">Credits:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {currentSemesterMetric?.totalCredits || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Results Data Table OR Empty State */}
        {!currentSemesterMetric || currentSemesterMetric.courses.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#18181B] border border-slate-200 dark:border-white/5 rounded-xl flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#27272A] flex items-center justify-center text-slate-400 dark:text-teal-400">
              <Calendar className="w-5 h-5 text-slate-400 dark:text-teal-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                No grades published yet for this semester.
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
                Faculty marks for Semester {selectedSemester} assessments and Automated Coding Labs will appear here once finalized.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#27272A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-[#27272A]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Course Code</th>
                  <th className="py-3 px-4 font-semibold">Subject / Title</th>
                  <th className="py-3 px-4 font-semibold">Assessment Type</th>
                  <th className="py-3 px-4 font-semibold">Credits</th>
                  <th className="py-3 px-4 font-semibold">Marks Scored</th>
                  <th className="py-3 px-4 font-semibold">Grade Point</th>
                  <th className="py-3 px-4 font-semibold text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {currentSemesterMetric.courses.map(c => {
                  return (
                    <tr
                      key={c.courseId}
                      className="hover:bg-slate-50/60 dark:hover:bg-[#222226] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800 dark:text-teal-400">
                        {c.courseCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {c.courseName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.assessments.map((a, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#323236]"
                            >
                              {a.assessmentType}: {a.marks}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {c.credits}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {c.finalScore} <span className="text-slate-400 font-normal">/ 100</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {c.gradePoint} / 10
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                            c.letterGrade === 'A+' || c.letterGrade === 'A'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : c.letterGrade === 'B+' || c.letterGrade === 'B'
                              ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {c.letterGrade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Part B: Current Semester "What-If" GPA Scenario Simulator */}
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
              Active Semester {currentActiveSemester} &quot;What-If&quot; engine. Adjust projected scores for upcoming End-Sem exams and pending Automated Coding Labs to forecast honors.
            </p>
          </div>

          {/* Large Glowing Dynamic Projected CGPA Display */}
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
              <div className="text-[10px] text-slate-400 uppercase font-mono">Predicted SGPA</div>
              <div className="text-base font-bold font-mono text-teal-700 dark:text-teal-400">
                {predictedCurrentSGPA.toFixed(2)}
              </div>
              <span
                className={`text-[11px] font-mono font-bold flex items-center gap-0.5 mt-0.5 ${
                  gpaDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {gpaDelta >= 0 ? `+${gpaDelta.toFixed(2)}` : gpaDelta.toFixed(2)} vs current
              </span>
            </div>
          </div>
        </div>

        {/* Warning / Notice when no baseline grades are published for this semester */}
        {!activeSemesterHasGrades && (
          <div className="p-4 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-white/5 rounded-xl flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <Calculator className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                No grades published yet for this semester.
              </span>{' '}
              Simulator is computing projections from a clean baseline using your anticipated scores below.
            </div>
          </div>
        )}

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
                  <span>40 (E)</span>
                  <span>60 (B)</span>
                  <span>80 (A)</span>
                  <span>90+ (A+ 10-pt)</span>
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
