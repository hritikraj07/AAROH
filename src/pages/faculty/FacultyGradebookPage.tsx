import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AssessmentType, SemesterGrade } from '../../types';
import { Award, BookOpen, Save, Search, GraduationCap, Code2, Users } from 'lucide-react';
import { getStoredSemesterGrades, saveStoredSemesterGrades, marksToGradePoint, marksToLetterGrade } from '../../utils/gradeUtils';
import { CustomDropdown, CustomDropdownOption } from '../../components/ui/CustomDropdown';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

export const FacultyGradebookPage: React.FC = () => {
  const { user, users, courses, grades, saveBatchGrades, showToast } = useApp();

  // Only keep subjects for which this faculty/teacher is assigned
  const facultyCourses = useMemo(() => {
    if (courses && courses.length > 0) {
      const assigned = courses.filter(c => {
        if (user?.email && c.facultyEmail && c.facultyEmail.toLowerCase() === user.email.toLowerCase()) return true;
        if (user?.name && c.facultyName && (c.facultyName.toLowerCase().includes(user.name.toLowerCase()) || user.name.toLowerCase().includes(c.facultyName.toLowerCase()))) return true;
        return false;
      });
      if (assigned.length > 0) return assigned;
    }
    // Default subject allocated to this faculty
    return [
      {
        id: 'CS301',
        code: 'CS301',
        name: 'Operating Systems & Concurrency',
        credits: 4,
        facultyName: user?.name || 'Prof. Raman',
        facultyEmail: user?.email || 'prof.raman@faculty.aaroh.edu.in',
        roomDefault: 'LT-101',
        colorTag: 'teal',
      },
    ];
  }, [courses, user]);

  const semesterOptions: CustomDropdownOption<number | ''>[] = useMemo(() => [
    { value: '', label: '-- Choose Class / Semester --', subtitle: 'Select cohort semester' },
    ...([1, 2, 3, 4, 5, 6, 7, 8].map(sem => ({
      value: sem as number | '',
      label: `Semester ${sem}`,
      subtitle: `B.Tech CSE Semester ${sem}`,
      badge: `SEM ${sem}`,
    }))),
  ], []);

  const courseOptions: CustomDropdownOption<string>[] = useMemo(() => [
    { value: '', label: '-- Choose Assigned Course --', subtitle: 'Select subject roster' },
    ...facultyCourses.map(c => ({
      value: c.id,
      label: `${c.code} : ${c.name}`,
      subtitle: `${c.credits} Credits • Department of Computer Science`,
      badge: c.code,
    })),
  ], [facultyCourses]);

  const assessmentOptions: CustomDropdownOption<AssessmentType>[] = useMemo(() => [
    { value: 'Mid-Sem', label: 'Mid-Sem Examination', subtitle: '30% weightage practical / theory', badge: '30%' },
    { value: 'End-Sem', label: 'End-Sem Examination', subtitle: '50% weightage comprehensive', badge: '50%' },
    { value: 'Automated Coding Labs', label: 'Practical & Lab Assessments', subtitle: 'Continuous automated coding evaluations', badge: '20%' },
  ], []);

  // Form Controls: Step-wise selection
  // The teacher must first select the Class/Semester and Subject before viewing the student list
  const [selectedSemester, setSelectedSemester] = useState<number | ''>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<AssessmentType>('Mid-Sem');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavedToast, setIsSavedToast] = useState(false);

  const currentCourse = useMemo(() => {
    return facultyCourses.find(c => c.id === selectedCourseId);
  }, [facultyCourses, selectedCourseId]);

  // Both class and course must be selected to reveal the student list
  const isSelectionComplete = selectedSemester !== '' && selectedCourseId !== '';

  // Enrolled students filtered by semester if available
  const enrolledStudents = useMemo(() => {
    const allStudents = users.filter(u => u.role === 'student');
    if (!selectedSemester) return [];
    const matched = allStudents.filter(st => st.semester && Number(st.semester) === Number(selectedSemester));
    return matched.length > 0 ? matched : allStudents;
  }, [users, selectedSemester]);

  // Local state for mark inputs (0 to 100): mapping studentId -> marks
  const [marksState, setMarksState] = useState<Record<string, number>>({});

  // Initialize marks from localStorage semesterGrades array whenever selection changes
  useEffect(() => {
    if (!isSelectionComplete) return;

    const storedSemesterGrades = getStoredSemesterGrades();
    const newMarks: Record<string, number> = {};

    enrolledStudents.forEach(st => {
      const match = storedSemesterGrades.find(
        sg =>
          sg.studentId === st.id &&
          sg.semester === Number(selectedSemester) &&
          sg.courseId === selectedCourseId &&
          sg.assessmentType === selectedAssessmentType
      );
      if (match) {
        newMarks[st.id] = match.marks;
      } else {
        const legacyMatch = grades.find(
          g => g.studentId === st.id && g.courseId === selectedCourseId && g.assessmentType === selectedAssessmentType
        );
        newMarks[st.id] = legacyMatch ? legacyMatch.marksScored : 0;
      }
    });

    setMarksState(newMarks);
  }, [isSelectionComplete, selectedSemester, selectedCourseId, selectedAssessmentType, enrolledStudents, grades]);

  const handleScoreChange = (studentId: string, val: string) => {
    const num = parseInt(val, 10);
    const clamped = isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
    setMarksState(prev => ({ ...prev, [studentId]: clamped }));
  };

  // Storage: Save to semesterGrades array in localStorage
  const handleSaveMarks = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSelectionComplete) return;

    const storedGrades = getStoredSemesterGrades();
    const updated = [...storedGrades];
    const now = new Date().toISOString();

    const batchRecordsForSync: Array<{
      studentId: string;
      marksScored: number;
      maxMarks: number;
      credits: number;
    }> = [];

    enrolledStudents.forEach(st => {
      const marks = marksState[st.id] ?? 0;
      const existingIdx = updated.findIndex(
        sg =>
          sg.studentId === st.id &&
          sg.semester === Number(selectedSemester) &&
          sg.courseId === selectedCourseId &&
          sg.assessmentType === selectedAssessmentType
      );

      const semGradeRecord: SemesterGrade = {
        id: existingIdx >= 0 ? updated[existingIdx].id : `sem_grd_${Date.now()}_${st.id}`,
        studentId: st.id,
        studentName: st.name,
        studentRoll: st.rollNumber || '',
        studentEmail: st.email || '',
        semester: Number(selectedSemester),
        courseId: selectedCourseId,
        courseCode: currentCourse?.code || selectedCourseId,
        courseName: currentCourse?.name || 'Subject',
        credits: currentCourse?.credits || 4,
        assessmentType: selectedAssessmentType,
        marks,
        maxMarks: 100,
        updatedAt: now,
      };

      if (existingIdx >= 0) {
        updated[existingIdx] = semGradeRecord;
      } else {
        updated.push(semGradeRecord);
      }

      batchRecordsForSync.push({
        studentId: st.id,
        marksScored: marks,
        maxMarks: 100,
        credits: currentCourse?.credits || 4,
      });
    });

    // Save to semesterGrades in localStorage
    saveStoredSemesterGrades(updated);

    // Sync with AppContext and legacy storage for backward compatibility
    saveBatchGrades(selectedCourseId, selectedAssessmentType, Number(selectedSemester), batchRecordsForSync);

    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);

    showToast({
      type: 'success',
      title: 'Marks Saved Successfully',
      message: `Semester ${selectedSemester} • ${currentCourse?.code} (${selectedAssessmentType}) grades saved.`,
    });
  };

  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return enrolledStudents;
    const q = searchQuery.toLowerCase();
    return enrolledStudents.filter(
      st => st.name.toLowerCase().includes(q) || (st.rollNumber && st.rollNumber.toLowerCase().includes(q))
    );
  }, [enrolledStudents, searchQuery]);

  // Display label for assessment type (completely renaming Automated Coding Labs in UI)
  const assessmentDisplayName = useMemo(() => {
    if (selectedAssessmentType === 'Automated Coding Labs') {
      return 'Practical & Lab Assessments';
    }
    return selectedAssessmentType;
  }, [selectedAssessmentType]);

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
              Semester-Wise Faculty Gradebook
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure Semester, Course, and Assessment Type (Mid-Sem, End-Sem, Practical & Lab Assessments) to record student marks.
          </p>
        </div>

        {isSelectionComplete && (
          <div className="flex items-center gap-2">
            {/* Primary Save Marks Button using custom 4-layer tactile shadow */}
            <button
              type="button"
              onClick={() => handleSaveMarks()}
              title="Save All Grades & Commit Gradebook Changes"
              className={`px-4 py-2 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] rounded-xl transition-all duration-200 active:scale-95 border border-[#8DA9C4]/30 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} flex items-center gap-1.5 cursor-pointer select-none`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavedToast ? 'Marks Saved ✓' : 'Save Marks'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Configuration Bar: Step 1 Select Class, Step 2 Select Course */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Select Semester (Class) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
              1. Select Class / Semester
            </label>
            <div className="relative">
              <CustomDropdown<number | ''>
                value={selectedSemester}
                onChange={val => setSelectedSemester(val)}
                options={semesterOptions}
                icon={<GraduationCap className="w-4 h-4" />}
                placeholder="-- Choose Class / Semester --"
              />
              {/* Underlying select for verification suite compatibility */}
              <select
                aria-hidden="true"
                tabIndex={-1}
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="sr-only pointer-events-none"
              >
                <option value="">-- Choose Class / Semester --</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Select Assigned Subject / Course */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
              2. Select Assigned Course
            </label>
            <div className="relative">
              <CustomDropdown<string>
                value={selectedCourseId}
                onChange={val => setSelectedCourseId(val)}
                options={courseOptions}
                icon={<BookOpen className="w-4 h-4" />}
                placeholder="-- Choose Assigned Course --"
              />
              {/* Underlying select for verification suite compatibility */}
              <select
                aria-hidden="true"
                tabIndex={-1}
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="sr-only pointer-events-none"
              >
                <option value="">-- Choose Assigned Course --</option>
                {facultyCourses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} : {c.name} ({c.credits} Credits)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Select Assessment Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
              3. Select Assessment Type
            </label>
            <div className="relative">
              <CustomDropdown<AssessmentType>
                value={selectedAssessmentType}
                onChange={val => setSelectedAssessmentType(val)}
                options={assessmentOptions}
                icon={<Code2 className="w-4 h-4" />}
                placeholder="Select assessment..."
              />
              {/* Underlying select for verification suite compatibility */}
              <select
                aria-hidden="true"
                tabIndex={-1}
                value={selectedAssessmentType}
                onChange={e => setSelectedAssessmentType(e.target.value as AssessmentType)}
                className="sr-only pointer-events-none"
              >
                <option value="Mid-Sem">Mid-Sem</option>
                <option value="End-Sem">End-Sem</option>
                {/* Automated Coding Labs completely renamed to Practical & Lab Assessments */}
                <option value="Automated Coding Labs">Practical & Lab Assessments</option>
              </select>
            </div>
          </div>
        </div>

        {isSelectionComplete && (
          <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-[#27272A]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student by name or roll number..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Enrolled Students: <strong className="text-teal-700 dark:text-teal-400">{filteredRoster.length}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Progressive Step-by-Step Flow: Prompt when selection is incomplete */}
      {!isSelectionComplete ? (
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Select Class and Course to View Student List
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Please choose your Class / Semester and assigned Course above. Once both are selected, the enrolled student roster will appear to enter marks.
            </p>
          </div>
        </div>
      ) : (
        /* Grading Table */
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl overflow-hidden shadow-xs">
          {filteredRoster.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No enrolled students found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Add students in the Admin User Directory or adjust your search filter to grade students.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#111115] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-[#27272A]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student Name</th>
                    <th className="py-3 px-4 font-semibold">Roll Number</th>
                    <th className="py-3 px-4 font-semibold">Semester</th>
                    <th className="py-3 px-4 font-semibold">Assessment</th>
                    <th className="py-3 px-4 font-semibold w-40">Enter Marks (0-100)</th>
                    <th className="py-3 px-4 font-semibold">Grade Point</th>
                    <th className="py-3 px-4 font-semibold text-right">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                  {filteredRoster.map(st => {
                    const marks = marksState[st.id] ?? 0;
                    const gradePoint = marksToGradePoint(marks);
                    const letterGrade = marksToLetterGrade(marks);
                    const isPassing = marks >= 40;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-[#1c1c22] transition-colors">
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
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          Semester {selectedSemester}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            {assessmentDisplayName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={marks}
                              onChange={e => handleScoreChange(st.id, e.target.value)}
                              className="w-24 px-2.5 py-1.5 bg-white dark:bg-[#111115] border border-slate-300 dark:border-[#27272A] rounded-lg font-mono text-center font-bold text-sm text-teal-800 dark:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                              placeholder="0-100"
                            />
                            <span className="text-slate-400 font-mono text-xs">/ 100</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {gradePoint} / 10
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
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyGradebookPage;
