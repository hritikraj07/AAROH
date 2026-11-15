import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AssessmentType } from '../../types';
import { Award, BookOpen, CheckCircle2, Save, Filter, Search, GraduationCap } from 'lucide-react';

export const FacultyGradebookPage: React.FC = () => {
  const { user, users, courses, grades, saveBatchGrades } = useApp();

  // Faculty courses or fallback courses
  const facultyCourses = useMemo(() => {
    if (!courses || courses.length === 0) {
      return [
        { id: 'CS301', code: 'CS301', name: 'Operating Systems & Concurrency', credits: 4, facultyName: user?.name || 'Faculty', facultyEmail: user?.email || '', roomDefault: 'LT-101', colorTag: 'teal' },
        { id: 'CS302', code: 'CS302', name: 'Database Management Systems', credits: 4, facultyName: user?.name || 'Faculty', facultyEmail: user?.email || '', roomDefault: 'LT-204', colorTag: 'indigo' },
        { id: 'CS303', code: 'CS303', name: 'Computer Networks & Protocols', credits: 3, facultyName: user?.name || 'Faculty', facultyEmail: user?.email || '', roomDefault: 'LT-302', colorTag: 'cyan' },
      ];
    }
    return courses;
  }, [courses, user]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(facultyCourses[0]?.id || 'CS301');
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<AssessmentType>('Mid-Sem');
  const [searchQuery, setSearchQuery] = useState('');

  const currentCourse = useMemo(() => {
    return facultyCourses.find(c => c.id === selectedCourseId) || facultyCourses[0];
  }, [facultyCourses, selectedCourseId]);

  const defaultMax = selectedAssessmentType === 'Mid-Sem' ? 50 : 100;

  // Filter enrolled students
  const enrolledStudents = useMemo(() => {
    return users.filter(u => u.role === 'student');
  }, [users]);

  // Local state for mark inputs: mapping studentId -> marksScored
  const [marksState, setMarksState] = useState<Record<string, number>>({});
  const [maxMarksState, setMaxMarksState] = useState<Record<string, number>>({});

  // Initialize or update marks from existing grades when selection changes
  React.useEffect(() => {
    const newMarks: Record<string, number> = {};
    const newMax: Record<string, number> = {};

    enrolledStudents.forEach(st => {
      const match = grades.find(
        g => g.studentId === st.id && g.courseId === selectedCourseId && g.assessmentType === selectedAssessmentType
      );
      if (match) {
        newMarks[st.id] = match.marksScored;
        newMax[st.id] = match.maxMarks;
      } else {
        // default placeholder scores
        newMarks[st.id] = selectedAssessmentType === 'Mid-Sem' ? 40 : 80;
        newMax[st.id] = defaultMax;
      }
    });

    setMarksState(newMarks);
    setMaxMarksState(newMax);
  }, [selectedCourseId, selectedAssessmentType, enrolledStudents, grades, defaultMax]);

  const handleScoreChange = (studentId: string, val: string) => {
    const num = parseInt(val, 10);
    const max = maxMarksState[studentId] || defaultMax;
    const clamped = isNaN(num) ? 0 : Math.min(Math.max(0, num), max);
    setMarksState(prev => ({ ...prev, [studentId]: clamped }));
  };

  const handleMaxChange = (studentId: string, val: string) => {
    const num = parseInt(val, 10);
    const valid = isNaN(num) || num <= 0 ? defaultMax : num;
    setMaxMarksState(prev => ({ ...prev, [studentId]: valid }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const records = enrolledStudents.map(st => {
      const scored = marksState[st.id] ?? (selectedAssessmentType === 'Mid-Sem' ? 40 : 80);
      const max = maxMarksState[st.id] ?? defaultMax;
      return {
        studentId: st.id,
        marksScored: scored,
        maxMarks: max,
        credits: currentCourse?.credits || 4,
      };
    });

    saveBatchGrades(selectedCourseId, selectedAssessmentType, selectedSemester, records);
  };

  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return enrolledStudents;
    const q = searchQuery.toLowerCase();
    return enrolledStudents.filter(
      st => st.name.toLowerCase().includes(q) || (st.rollNumber && st.rollNumber.toLowerCase().includes(q))
    );
  }, [enrolledStudents, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <Award className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Faculty Gradebook & Assessment Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Input, evaluate, and synchronize Mid-Sem and End-Sem marks directly with the student academic portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)] flex items-center gap-1.5 cursor-pointer select-none"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Grades</span>
          </button>
        </div>
      </div>

      {/* Control Configuration Bar */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Course Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
              Course
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
              >
                {facultyCourses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} – {c.name} ({c.credits} Credits)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Semester Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
              Semester
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedSemester}
                onChange={e => setSelectedSemester(parseInt(e.target.value, 10))}
                className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem} (Cohort 2024-2028)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assessment Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
              Assessment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Mid-Sem', 'End-Sem'] as AssessmentType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedAssessmentType(type)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                    selectedAssessmentType === type
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#27272A] hover:bg-slate-100 dark:hover:bg-[#323236]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Search */}
        <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-[#27272A]/60">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student by name or roll number..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#27272A] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Enrolled Students: <strong className="text-teal-700 dark:text-teal-400">{filteredRoster.length}</strong>
          </span>
        </div>
      </div>

      {/* Grade Entry Table */}
      <form onSubmit={handleSaveAll} className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#27272A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-[#27272A]">
              <tr>
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Roll Number</th>
                <th className="py-3 px-4 font-semibold">Max Marks</th>
                <th className="py-3 px-4 font-semibold">Marks Scored</th>
                <th className="py-3 px-4 font-semibold">Percentage</th>
                <th className="py-3 px-4 font-semibold text-right">Letter Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
              {filteredRoster.map(st => {
                const marks = marksState[st.id] ?? (selectedAssessmentType === 'Mid-Sem' ? 40 : 80);
                const max = maxMarksState[st.id] ?? defaultMax;
                const ratio = max > 0 ? marks / max : 0;
                const pct = Math.round(ratio * 100);

                const letterGrade =
                  pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';

                const isPassing = pct >= 50;

                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-[#222226] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {st.avatarInitials || st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{st.name}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{st.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {st.rollNumber || '22CS000'}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={max}
                        onChange={e => handleMaxChange(st.id, e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#27272A] rounded font-mono text-center font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-700"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={max}
                          value={marks}
                          onChange={e => handleScoreChange(st.id, e.target.value)}
                          className="w-24 px-2.5 py-1.5 bg-white dark:bg-[#27272A] border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-center font-bold text-sm text-teal-800 dark:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                        />
                        <span className="text-slate-400 font-mono">/ {max}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      <span className={isPassing ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'}>
                        {pct}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                          letterGrade === 'A+' || letterGrade === 'A'
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : letterGrade === 'B+' || letterGrade === 'B'
                            ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                            : isPassing
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {letterGrade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#27272A]/50 border-t border-slate-200 dark:border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
            <span>
              Saving marks records immediately synchronizes student GPA metrics and transcripts across localStorage.
            </span>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)] flex items-center justify-center gap-1.5 cursor-pointer select-none"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Commit Gradebook Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FacultyGradebookPage;
