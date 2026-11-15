import { User, AttendanceRecord, Assignment } from '../types';

export interface AtRiskStudentItem {
  student: User;
  overallAttendance: number | null;
  hasLowAttendance: boolean;
  hasConsecutiveFailedLabs: boolean;
  issues: string[]; // e.g. ["Attendance: 68%", "Failing Automated Labs"]
}

/**
 * Checks whether the logged-in faculty user has coordinator privileges.
 */
export function hasCoordinatorPrivileges(user: User | null, allUsers: User[] = []): boolean {
  if (!user || user.role !== 'faculty') return false;

  if (user.designation?.toLowerCase().includes('coordinator')) return true;
  if (user.email === 'prof.raman@faculty.aaroh.edu.in' || user.name === 'Prof. K. Ramanujam') return true;

  const facultyName = user.name?.toLowerCase().trim() || '';
  const facultyEmail = user.email?.toLowerCase().trim() || '';

  // Check if any student in the directory is assigned to this faculty member
  return allUsers.some(u => {
    if (u.role !== 'student' || !u.classCoordinator) return false;
    const coord = u.classCoordinator.toLowerCase().trim();
    return (
      coord === facultyName ||
      coord === facultyEmail ||
      coord.includes(facultyName) ||
      facultyName.includes(coord)
    );
  });
}

/**
 * Scans the users array in localStorage (or provided array) and filters for students
 * assigned to this specific coordinator.
 */
export function getAssignedStudentsForCoordinator(
  coordinatorUser: User | null,
  allUsers: User[] = []
): User[] {
  if (!coordinatorUser || coordinatorUser.role !== 'faculty') return [];

  const coordName = coordinatorUser.name?.toLowerCase().trim() || '';
  const coordEmail = coordinatorUser.email?.toLowerCase().trim() || '';

  return allUsers.filter(u => {
    if (u.role !== 'student') return false;

    if (u.classCoordinator) {
      const assigned = u.classCoordinator.toLowerCase().trim();
      if (
        assigned === coordName ||
        assigned === coordEmail ||
        coordName.includes(assigned) ||
        assigned.includes(coordName) ||
        (coordEmail === 'prof.raman@faculty.aaroh.edu.in' && assigned.includes('raman'))
      ) {
        return true;
      }
    }

    // Default matching for demo coordinator if students are in same department / program
    if (coordEmail === 'prof.raman@faculty.aaroh.edu.in' || coordName.includes('raman')) {
      return u.program === 'B.Tech CSE' || u.department?.includes('Computer Science');
    }

    return false;
  });
}

/**
 * Calculates overall attendance rate for a student.
 */
export function calculateStudentAttendanceRate(
  student: User,
  attendanceRecords: AttendanceRecord[] = []
): number | null {
  const records = attendanceRecords.filter(r => {
    if (r.studentId && r.studentId === student.id) return true;
    if (r.studentEmail && r.studentEmail.toLowerCase() === student.email.toLowerCase()) return true;
    if (!r.studentId && !r.studentEmail && student.id === 'usr_std_demo') return true;
    return false;
  });

  if (records.length === 0) return null;

  const totalAttended = records.reduce((acc, r) => acc + (r.attended || 0), 0);
  const totalClasses = records.reduce((acc, r) => acc + (r.total || 0), 0);

  if (totalClasses === 0) return null;
  return Math.round((totalAttended / totalClasses) * 100);
}

/**
 * Checks if a student has failed 2 or more "Automated Coding Labs" consecutively.
 */
export function hasFailedConsecutiveAutomatedLabs(
  student: User,
  assignments: Assignment[] = []
): boolean {
  // Filter for completed/submitted coding assignments associated with this student
  const studentLabs = assignments.filter(a => {
    const isCoding = a.type === 'coding' || Boolean(a.starterCode) || Boolean(a.testCases);
    if (!isCoding) return false;

    if (a.studentId && a.studentId !== student.id) return false;
    if (a.studentEmail && a.studentEmail.toLowerCase() !== student.email.toLowerCase()) return false;

    // Must be completed / submitted with test output
    return (
      a.status === 'submitted' ||
      a.status === 'graded' ||
      a.status === 'failed' ||
      Boolean(a.submittedAt) ||
      Boolean(a.testResultsSummary)
    );
  });

  // Sort chronologically by submission time or dueDate
  studentLabs.sort((a, b) => {
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return timeA - timeB;
  });

  let consecutiveFails = 0;
  let maxConsecutive = 0;

  for (const lab of studentLabs) {
    const summary = (lab.testResultsSummary || '').toLowerCase();
    const isFailed = summary.includes('❌') || summary.includes('fail') || lab.status === 'failed';

    if (isFailed) {
      consecutiveFails += 1;
      if (consecutiveFails > maxConsecutive) {
        maxConsecutive = consecutiveFails;
      }
    } else {
      consecutiveFails = 0;
    }
  }

  return maxConsecutive >= 2;
}

/**
 * Scans assigned students and calculates at-risk status.
 */
export function analyzeAtRiskStudents(
  assignedStudents: User[],
  attendanceRecords: AttendanceRecord[] = [],
  assignments: Assignment[] = []
): AtRiskStudentItem[] {
  const atRiskList: AtRiskStudentItem[] = [];

  for (const student of assignedStudents) {
    const attendanceRate = calculateStudentAttendanceRate(student, attendanceRecords);
    const hasLowAttendance = attendanceRate !== null && attendanceRate < 75;
    const hasConsecutiveFailedLabs = hasFailedConsecutiveAutomatedLabs(student, assignments);

    const issues: string[] = [];
    if (hasLowAttendance) {
      issues.push(`Attendance: ${attendanceRate}%`);
    }
    if (hasConsecutiveFailedLabs) {
      issues.push('Failing Automated Labs');
    }

    if (hasLowAttendance || hasConsecutiveFailedLabs) {
      atRiskList.push({
        student,
        overallAttendance: attendanceRate,
        hasLowAttendance,
        hasConsecutiveFailedLabs,
        issues,
      });
    }
  }

  return atRiskList;
}
