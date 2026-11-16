import { SemesterGrade, AssessmentType } from '../types';

export const SEMESTER_GRADES_STORAGE_KEY = 'semesterGrades';

/**
 * Convert 0-100 numeric marks into standard 10-point grade scale.
 */
export function marksToGradePoint(marks: number): number {
  const m = Math.max(0, Math.min(100, Math.round(marks)));
  if (m >= 90) return 10;
  if (m >= 80) return 9;
  if (m >= 70) return 8;
  if (m >= 60) return 7;
  if (m >= 50) return 6;
  if (m >= 40) return 5;
  return 0;
}

/**
 * Convert 0-100 numeric marks into letter grade.
 */
export function marksToLetterGrade(marks: number): string {
  const m = Math.max(0, Math.min(100, Math.round(marks)));
  if (m >= 90) return 'A+';
  if (m >= 80) return 'A';
  if (m >= 70) return 'B+';
  if (m >= 60) return 'B';
  if (m >= 50) return 'C';
  return 'F';
}

/**
 * Retrieve all semesterGrades from localStorage.
 * Initializes strictly with an empty array if not found.
 */
export function getStoredSemesterGrades(): SemesterGrade[] {
  try {
    const raw = localStorage.getItem(SEMESTER_GRADES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse semesterGrades from localStorage:', err);
    return [];
  }
}

/**
 * Persist semesterGrades to localStorage and dispatch custom storage sync event.
 */
export function saveStoredSemesterGrades(grades: SemesterGrade[]): void {
  try {
    localStorage.setItem(SEMESTER_GRADES_STORAGE_KEY, JSON.stringify(grades));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save semesterGrades to localStorage:', err);
  }
}

export interface CourseSemesterBreakdown {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  assessments: {
    assessmentType: AssessmentType;
    marks: number;
    maxMarks: number;
  }[];
  finalScore: number;
  gradePoint: number;
  letterGrade: string;
}

export interface SemesterMetric {
  semester: number;
  sgpa: number;
  totalCredits: number;
  courses: CourseSemesterBreakdown[];
  isCompleted: boolean;
}

export interface StudentAcademicSummary {
  overallCGPA: number;
  semesters: SemesterMetric[];
  completedSemestersCount: number;
  totalCreditsEarned: number;
}

/**
 * Math Engine: Computes semester-wise SGPA and overall CGPA from semesterGrades in localStorage.
 */
export function computeStudentSemesterMetrics(
  studentId?: string,
  studentEmail?: string
): StudentAcademicSummary {
  const allGrades = getStoredSemesterGrades();

  // Filter grades for this student
  const filtered = allGrades.filter(g => {
    if (studentId && g.studentId === studentId) return true;
    if (studentEmail && g.studentEmail && g.studentEmail.toLowerCase() === studentEmail.toLowerCase()) return true;
    return false;
  });

  if (filtered.length === 0) {
    return {
      overallCGPA: 0,
      semesters: [],
      completedSemestersCount: 0,
      totalCreditsEarned: 0,
    };
  }

  // Group by semester (1 to 8)
  const semesterMap = new Map<number, SemesterGrade[]>();
  filtered.forEach(g => {
    const list = semesterMap.get(g.semester) || [];
    list.push(g);
    semesterMap.set(g.semester, list);
  });

  const semesters: SemesterMetric[] = [];
  let cumulativeCredits = 0;

  // Process semesters in numerical order
  const sortedSemesters = Array.from(semesterMap.keys()).sort((a, b) => a - b);

  sortedSemesters.forEach(semNum => {
    const semGrades = semesterMap.get(semNum) || [];

    // Group by course
    const courseMap = new Map<string, SemesterGrade[]>();
    semGrades.forEach(g => {
      const list = courseMap.get(g.courseId) || [];
      list.push(g);
      courseMap.set(g.courseId, list);
    });

    const coursesBreakdown: CourseSemesterBreakdown[] = [];
    let semTotalPoints = 0;
    let semCredits = 0;

    courseMap.forEach((gradesList, cId) => {
      const first = gradesList[0];
      const courseCode = first?.courseCode || cId;
      const courseName = first?.courseName || 'Subject';
      const credits = first?.credits || 4;

      const assessments = gradesList.map(g => ({
        assessmentType: g.assessmentType,
        marks: g.marks,
        maxMarks: g.maxMarks || 100,
      }));

      // Average marks across all assessments recorded for this subject
      const totalMarksScored = assessments.reduce((sum, a) => sum + a.marks, 0);
      const totalMax = assessments.reduce((sum, a) => sum + a.maxMarks, 0);
      const finalScore = totalMax > 0 ? Math.round((totalMarksScored / totalMax) * 100) : 0;

      const gradePoint = marksToGradePoint(finalScore);
      const letterGrade = marksToLetterGrade(finalScore);

      coursesBreakdown.push({
        courseId: cId,
        courseCode,
        courseName,
        credits,
        assessments,
        finalScore,
        gradePoint,
        letterGrade,
      });

      semTotalPoints += gradePoint * credits;
      semCredits += credits;
    });

    const sgpa = semCredits > 0 ? Number((semTotalPoints / semCredits).toFixed(2)) : 0;
    cumulativeCredits += semCredits;

    semesters.push({
      semester: semNum,
      sgpa,
      totalCredits: semCredits,
      courses: coursesBreakdown,
      isCompleted: coursesBreakdown.length > 0,
    });
  });

  const completed = semesters.filter(s => s.isCompleted && s.sgpa > 0);
  const overallCGPA =
    completed.length > 0
      ? Number((completed.reduce((acc, curr) => acc + curr.sgpa, 0) / completed.length).toFixed(2))
      : 0;

  return {
    overallCGPA,
    semesters,
    completedSemestersCount: completed.length,
    totalCreditsEarned: cumulativeCredits,
  };
}
