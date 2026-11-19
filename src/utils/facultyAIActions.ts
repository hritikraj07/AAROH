import { User, Course, Assignment, ClassSession, Notice, NoticeCategory } from '../types';
import { getEnrolledStudentsForCourse } from './courseEnrollmentUtils';
import { StorageService } from '../services/storage';

export interface FacultyActionContext {
  user: User | null;
  role: string | null;
  courses: Course[];
  assignments: Assignment[];
  timetable: ClassSession[];
  users: User[];
  recordBatchAttendance?: (courseId: string, studentMarks: { studentId: string; isPresent: boolean }[]) => void;
  createAssignment?: (asg: Omit<Assignment, 'id' | 'status'>) => Assignment;
  createNotice?: (notice: Omit<Notice, 'id' | 'publishedDate' | 'readByCurrentUser'>) => Notice;
  showToast?: (toast: { type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string }) => void;
}

export interface FacultyActionResult {
  handled: boolean;
  message: string;
}

/**
 * Helper to match a natural language string to an assigned course
 */
function resolveFacultyCourse(text: string, facultyCourses: Course[], defaultCourse?: Course): Course | null {
  if (!text || facultyCourses.length === 0) return defaultCourse || facultyCourses[0] || null;
  const q = text.toLowerCase();

  // Match by code (e.g. CS101, CS103, CS301)
  const codeMatch = facultyCourses.find(c => c.code && q.includes(c.code.toLowerCase()));
  if (codeMatch) return codeMatch;

  // Match by common subject keywords
  if (q.includes('python')) {
    const py = facultyCourses.find(c => c.id.includes('python') || c.name.toLowerCase().includes('python'));
    if (py) return py;
  }
  if (q.includes('web') || q.includes('webdev') || q.includes('html') || q.includes('css')) {
    const web = facultyCourses.find(c => c.id.includes('web') || c.name.toLowerCase().includes('web'));
    if (web) return web;
  }
  if (q.includes('stat') || q.includes('prob') || q.includes('math')) {
    const st = facultyCourses.find(c => c.id.includes('prob') || c.name.toLowerCase().includes('stat') || c.name.toLowerCase().includes('prob'));
    if (st) return st;
  }
  if (q.includes('electronic') || q.includes('digital') || q.includes('hardware')) {
    const el = facultyCourses.find(c => c.id.includes('electronic') || c.name.toLowerCase().includes('electronic'));
    if (el) return el;
  }
  if (q.includes('maker') || q.includes('lab') || q.includes('hardware')) {
    const mk = facultyCourses.find(c => c.id.includes('maker') || c.name.toLowerCase().includes('maker'));
    if (mk) return mk;
  }

  // Match by course name words
  for (const c of facultyCourses) {
    const words = c.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (words.some(w => q.includes(w))) {
      return c;
    }
  }

  return defaultCourse || facultyCourses[0] || null;
}

/**
 * Check if the query is an action intent (marking attendance, creating assignment, creating coding lab, or publishing bulletins/circulars)
 */
export function isFacultyActionIntent(query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase().trim();

  // 1. Attendance Action Intent
  const isAttendance =
    (q.includes('mark') && (q.includes('present') || q.includes('absent') || q.includes('attendance'))) ||
    ((q.startsWith('mark ') || q.startsWith('set ')) && (q.includes('present') || q.includes('absent')));

  // 2. Standard Assignment Action Intent
  const isAssignment =
    (q.includes('create assignment') || q.includes('post assignment') || q.includes('publish assignment') || q.includes('new assignment') || q.includes('assign coursework')) &&
    !q.includes('coding lab') && !q.includes('code lab');

  // 3. Coding Lab Action Intent
  const isCodingLab =
    q.includes('coding lab') || q.includes('code lab') || q.includes('coding assignment') ||
    q.includes('create lab') || q.includes('publish lab') || q.includes('new lab') || q.includes('live lab');

  // 4. Bulletin / Circular / Notice Action Intent
  const hasNoticeTerm =
    q.includes('bulletin') || q.includes('notice') || q.includes('circular') ||
    q.includes('memo') || q.includes('advisory');

  const hasActionVerb =
    q.includes('upload') || q.includes('publish') || q.includes('post') ||
    q.includes('create') || q.includes('draft') || q.includes('issue') ||
    q.includes('broadcast') || q.includes('add') || q.includes('make') ||
    q.includes('announce') || q.includes('release') || q.includes('send out');

  const isReadQuery =
    q.startsWith('list ') || q.startsWith('show ') || q.startsWith('what ') ||
    q.startsWith('view ') || q.startsWith('check ') || q.startsWith('how many') ||
    q.includes('any notice') || q.includes('any circular') || q.includes('active circulars') ||
    q.includes('active notices') || q.includes('read notice') || q.includes('show circular');

  const isBulletinOrNotice = hasNoticeTerm && hasActionVerb && !isReadQuery;

  return isAttendance || isAssignment || isCodingLab || isBulletinOrNotice;
}

/**
 * Handle direct faculty and campus administrative actions with strict role-based permission verification
 */
export function handleFacultyAction(query: string, ctx: FacultyActionContext): FacultyActionResult {
  const q = query.trim();
  const qLower = q.toLowerCase();

  // =========================================================================
  // 0. Bulletin / Department Notice / Official Circular Action
  // =========================================================================
  const isBulletinActionIntent =
    (qLower.includes('bulletin') || qLower.includes('notice') || qLower.includes('circular') || qLower.includes('memo') || qLower.includes('advisory')) &&
    (qLower.includes('upload') || qLower.includes('publish') || qLower.includes('post') || qLower.includes('create') ||
     qLower.includes('draft') || qLower.includes('issue') || qLower.includes('broadcast') || qLower.includes('add') ||
     qLower.includes('make') || qLower.includes('announce') || qLower.includes('release') || qLower.includes('send out'));

  if (isBulletinActionIntent) {
    // Role Permission Check: Only faculty members and administrators are authorized to publish official circulars
    if (ctx.role !== 'faculty' && ctx.role !== 'admin') {
      return {
        handled: true,
        message: '⚠️ **Permission Denied**: Only faculty members and administrators are authorized to publish department bulletins or official circulars. Student accounts have view-only access to published bulletins.',
      };
    }

    // Extract Title & Content
    let noticeTitle = '';
    let noticeContent = '';

    // Check for explicit quotes: e.g. Upload bulletin "CS301 Viva Schedule"
    const quoteMatch = q.match(/["'`]([^"'`]+)["'`]/);
    if (quoteMatch && quoteMatch[1].trim().length >= 3) {
      noticeTitle = quoteMatch[1].trim();
    }

    // Check for colon separator: e.g. Upload bulletin: CS301 Laboratory Schedule Change & Viva Dates
    if (!noticeTitle) {
      const colonMatch = q.match(/(?:bulletin|notice|circular|memo|advisory)\s*:\s*([^,\n]+)/i);
      if (colonMatch && colonMatch[1].trim().length >= 3) {
        noticeTitle = colonMatch[1].trim();
      }
    }

    // Check for "titled" or "named"
    if (!noticeTitle) {
      const titledMatch = q.match(/(?:titled|title|named|name)\s+([^,.;\n]+)/i);
      if (titledMatch && titledMatch[1].trim().length >= 3) {
        noticeTitle = titledMatch[1].trim();
      }
    }

    // Check for action phrase: e.g. Upload a bulletin on Exam Schedule
    if (!noticeTitle) {
      const actionPhraseMatch = q.match(/(?:upload|publish|post|create|draft|issue|broadcast|add)\s+(?:a\s+|an\s+|the\s+)?(?:department\s+|campus\s+|official\s+)?(?:bulletin|notice|circular|memo|advisory)(?:\s+(?:for|on|about|regarding))?\s+([^,.;\n]+)/i);
      if (actionPhraseMatch && actionPhraseMatch[1].trim().length >= 3) {
        noticeTitle = actionPhraseMatch[1].trim();
      }
    }

    // Clean up title
    if (noticeTitle) {
      noticeTitle = noticeTitle.replace(/^(?:titled|named|about|for|regarding)\s+/i, '').replace(/^[:\s"'`]+|[:\s"'`]+$/g, '').trim();
    }

    // If still no meaningful title provided, prompt the user for clarification
    if (!noticeTitle || noticeTitle.length < 3) {
      return {
        handled: true,
        message: 'Please specify the title and details for the bulletin or circular you would like to publish.\n\n*Example:* `Upload bulletin: CS301 Laboratory Schedule Change & Viva Dates` or `Publish circular: Campus Placement Drive Registration Open`',
      };
    }

    // Extract explicit content if provided
    const contentMatch = q.match(/(?:content|body|details|description|message|guidelines)\s*:\s*([^]+)/i);
    if (contentMatch) {
      noticeContent = contentMatch[1].trim();
    }

    // Capitalize Title cleanly
    noticeTitle = noticeTitle.charAt(0).toUpperCase() + noticeTitle.slice(1);

    // Auto-detect Notice Category
    let category: NoticeCategory = 'Academic';
    const catSearch = (qLower + ' ' + noticeTitle.toLowerCase());
    if (catSearch.includes('exam') || catSearch.includes('test') || catSearch.includes('midterm') ||
        catSearch.includes('end-term') || catSearch.includes('endterm') || catSearch.includes('viva') ||
        catSearch.includes('evaluation') || catSearch.includes('quiz') || catSearch.includes('assessment')) {
      category = 'Exams';
    } else if (catSearch.includes('placement') || catSearch.includes('recruit') || catSearch.includes('drive') ||
               catSearch.includes('internship') || catSearch.includes('interview') || catSearch.includes('job') ||
               catSearch.includes('career') || catSearch.includes('hire')) {
      category = 'Placements';
    } else if (catSearch.includes('holiday') || catSearch.includes('fee') || catSearch.includes('transport') ||
               catSearch.includes('hostel') || catSearch.includes('closure') || catSearch.includes('maintenance') ||
               catSearch.includes('advisory') || catSearch.includes('administrative') || catSearch.includes('admin') ||
               catSearch.includes('registration')) {
      category = 'Administration';
    } else if (catSearch.includes('syllabus') || catSearch.includes('curriculum') || catSearch.includes('lecture') ||
               catSearch.includes('class') || catSearch.includes('course') || catSearch.includes('lab') ||
               catSearch.includes('laboratory') || catSearch.includes('academic') || catSearch.includes('faculty')) {
      category = 'Academic';
    } else {
      category = 'General';
    }

    // Auto-detect Priority Tag
    let priorityTag = 'Normal Circular';
    if (catSearch.includes('urgent') || catSearch.includes('emergency') || catSearch.includes('immediate') || catSearch.includes('crucial')) {
      priorityTag = 'Urgent Advisory';
    } else if (catSearch.includes('mandatory') || catSearch.includes('compulsory')) {
      priorityTag = 'Mandatory';
    } else if (catSearch.includes('important') || catSearch.includes('high priority')) {
      priorityTag = 'Important';
    }

    // Auto-detect Department & Target Audience
    let department = ctx.user?.department || (ctx.role === 'admin' ? 'Office of Academic Affairs' : 'Department of Computer Science & Engineering');
    let targetAudience = 'All B.Tech CSE Students';
    if (catSearch.includes('all student') || catSearch.includes('campus') || ctx.role === 'admin') {
      targetAudience = 'All Campus Students';
    } else if (catSearch.includes('faculty') || catSearch.includes('staff')) {
      targetAudience = 'Faculty & Staff';
    }

    const issuer = ctx.user?.name
      ? `${ctx.user.name} (${ctx.role === 'admin' ? 'Admin' : 'Faculty'})`
      : (ctx.role === 'admin' ? 'Office of the Registrar' : 'Department Coordinator');

    const finalContent = noticeContent ||
      `Official notice regarding ${noticeTitle}. All concerned students and faculty members are advised to take note of the scheduled instructions and comply accordingly. For further queries, please contact ${issuer}.`;

    try {
      const noticePayload: Omit<Notice, 'id' | 'publishedDate' | 'readByCurrentUser'> = {
        title: noticeTitle,
        content: finalContent,
        category,
        department,
        isPinned: false,
        priorityTag,
        issuedBy: issuer,
        summary: finalContent.length > 120 ? finalContent.slice(0, 117) + '...' : finalContent,
        effectiveDate: new Date().toISOString().split('T')[0],
      };

      let createdNotice: Notice | null = null;
      if (ctx.createNotice) {
        createdNotice = ctx.createNotice(noticePayload);
      } else {
        createdNotice = StorageService.createNotice(noticePayload);
      }

      // Sync and broadcast events so all active dashboards, tables, and tabs re-render
      try {
        window.dispatchEvent(new CustomEvent('notice-created', { detail: createdNotice }));
        window.dispatchEvent(new Event('aaroh_notices_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      ctx.showToast?.({
        type: 'success',
        title: 'Bulletin Published',
        message: noticeTitle,
      });

      return {
        handled: true,
        message: `📢 **Department Bulletin Published Successfully**\n\n• **Title:** ${noticeTitle}\n• **Category:** ${category}\n• **Department:** ${department}\n• **Priority:** ${priorityTag}\n• **Target Audience:** ${targetAudience}\n• **Issued By:** ${issuer}\n• **Status:** Live on campus notice board\n\nThe bulletin has been uploaded and is now visible across Student, Faculty, and Admin notice circulars.`,
      };
    } catch (err) {
      console.error('Failed to create bulletin via AI:', err);
      return {
        handled: true,
        message: `An error occurred while publishing the bulletin "${noticeTitle}". Please try again.`,
      };
    }
  }

  // Strict Permission Check on the Action Layer for Attendance & Coursework
  if (ctx.role !== 'faculty') {
    return {
      handled: true,
      message: '⚠️ **Permission Denied**: Only faculty members are authorized to mark attendance or create coursework assignments. Your current role does not have write access to faculty records.',
    };
  }

  // Filter assigned courses for this faculty
  const facultyCourses = ctx.courses && ctx.courses.length > 0
    ? ctx.courses.filter(c => {
        if (ctx.user?.email && c.facultyEmail && c.facultyEmail.toLowerCase() === ctx.user.email.toLowerCase()) return true;
        if (ctx.user?.name && c.facultyName && (c.facultyName.toLowerCase().includes(ctx.user.name.toLowerCase()) || ctx.user.name.toLowerCase().includes(c.facultyName.toLowerCase()))) return true;
        return false;
      })
    : [];

  const effectiveCourses = facultyCourses.length > 0 ? facultyCourses : ctx.courses;
  const defaultCourse = effectiveCourses[0];

  // =========================================================================
  // 1. Mark Attendance Action
  // =========================================================================
  const isAttendanceIntent =
    (qLower.includes('mark') && (qLower.includes('present') || qLower.includes('absent') || qLower.includes('attendance'))) ||
    ((qLower.startsWith('mark ') || qLower.startsWith('set ')) && (qLower.includes('present') || qLower.includes('absent')));

  if (isAttendanceIntent) {
    // Check status: Present vs Absent
    const hasPresent = qLower.includes('present');
    const hasAbsent = qLower.includes('absent');

    if (!hasPresent && !hasAbsent) {
      return {
        handled: true,
        message: 'Please clarify whether the student should be marked **Present** or **Absent**.\n\n*Example:* `Mark Aarav Sharma present in Python` or `Mark roll 22CS042 absent in CS101`',
      };
    }

    const isPresent = !hasAbsent;
    const targetCourse = resolveFacultyCourse(q, effectiveCourses, defaultCourse);

    if (!targetCourse) {
      return {
        handled: true,
        message: 'No active course found to record attendance for. Please ensure you are assigned to a course or specify a course code (e.g. `CS101-AIML`).',
      };
    }

    // Identify student from enrolled roster
    const roster = getEnrolledStudentsForCourse(targetCourse.id, null, ctx.users);
    const pool = roster.length > 0 ? roster : ctx.users.filter(u => u.role === 'student');

    // Extract potential roll number: e.g. 22CS042, 22CS001, etc.
    const rollMatch = q.match(/\b(22[a-z]{2}\d{3}|\d{2}[a-z]{2}\d{3})\b/i);
    let matchedStudent: User | undefined;

    if (rollMatch) {
      const roll = rollMatch[1].toUpperCase();
      matchedStudent = pool.find(st => st.rollNumber && st.rollNumber.toUpperCase() === roll);
    }

    if (!matchedStudent) {
      // Match by student name
      for (const st of pool) {
        if (!st.name) continue;
        const firstName = st.name.trim().split(/\s+/)[0].toLowerCase();
        const fullName = st.name.trim().toLowerCase();
        if (qLower.includes(fullName) || (firstName.length >= 3 && qLower.includes(firstName))) {
          matchedStudent = st;
          break;
        }
      }
    }

    if (!matchedStudent) {
      return {
        handled: true,
        message: `Which student would you like to mark ${isPresent ? 'Present' : 'Absent'} for ${targetCourse.code || targetCourse.name}? Please provide the student's name or roll number (e.g. \`Mark Aarav Sharma present in ${targetCourse.code || 'Python'}\`).`,
      };
    }

    // Execute Attendance Update
    try {
      // 1. Batch Attendance state update via AppContext
      if (ctx.recordBatchAttendance) {
        ctx.recordBatchAttendance(targetCourse.id, [{ studentId: matchedStudent.id, isPresent }]);
      }

      // 2. Sync with aaroh_qr_attendance_scans in localStorage for real-time live feed
      const scansRaw = localStorage.getItem('aaroh_qr_attendance_scans');
      const scansList: any[] = scansRaw ? JSON.parse(scansRaw) : [];
      const updatedScans = scansList.filter(
        (s: any) => !(s && (s.studentId === matchedStudent?.id || s.studentRoll === matchedStudent?.rollNumber) && (s.courseId === targetCourse.id || s.sessionCode === targetCourse.code))
      );

      if (isPresent) {
        updatedScans.push({
          studentId: matchedStudent.id,
          studentName: matchedStudent.name,
          studentRoll: matchedStudent.rollNumber,
          studentEmail: matchedStudent.email,
          courseId: targetCourse.id,
          subjectId: targetCourse.id,
          sessionCode: targetCourse.code || 'CS-5831',
          timestamp: Date.now(),
          isManual: true,
        });
      }

      localStorage.setItem('aaroh_qr_attendance_scans', JSON.stringify(updatedScans));
      window.dispatchEvent(new Event('aaroh_qr_scan_recorded'));
      window.dispatchEvent(new CustomEvent('aaroh_attendance_synced'));
      window.dispatchEvent(new CustomEvent('attendance-updated'));

      ctx.showToast?.({
        type: 'success',
        title: 'Attendance Updated',
        message: `${matchedStudent.name} marked ${isPresent ? 'Present' : 'Absent'} in ${targetCourse.code || targetCourse.name}`,
      });

      return {
        handled: true,
        message: `✅ **Attendance Recorded Successfully**\n\n• **Student:** ${matchedStudent.name} (${matchedStudent.rollNumber || 'ID: ' + matchedStudent.id})\n• **Course:** ${targetCourse.code} : ${targetCourse.name}\n• **Status:** **${isPresent ? 'Present' : 'Absent'}**\n• **Timestamp:** Just now\n\nThe faculty attendance roster and live check-in view have been updated immediately.`,
      };
    } catch (err) {
      console.error('Failed to record attendance via AI:', err);
      return {
        handled: true,
        message: `An error occurred while updating attendance for ${matchedStudent.name}. Please try again or use the manual roll call table.`,
      };
    }
  }

  // =========================================================================
  // 2. Create Coding Lab Action
  // =========================================================================
  const isCodingLabIntent =
    qLower.includes('coding lab') || qLower.includes('code lab') || qLower.includes('coding assignment') ||
    qLower.includes('create lab') || qLower.includes('publish lab') || qLower.includes('new lab') || qLower.includes('live lab');

  if (isCodingLabIntent) {
    const targetCourse = resolveFacultyCourse(q, effectiveCourses, defaultCourse);

    if (!targetCourse) {
      return {
        handled: true,
        message: 'Please specify the course for this coding lab (e.g. `Create coding lab for CS101-AIML: Binary Search`).',
      };
    }

    // Extract Title
    let labTitle = '';
    const quoteMatch = q.match(/["'`]([^"'`]+)["'`]/);
    if (quoteMatch) {
      labTitle = quoteMatch[1].trim();
    } else {
      const titleMatch = q.match(/(?:titled|title|named|name|lab:?|assignment:?)\s+([^,.;\n]+)/i);
      if (titleMatch) {
        labTitle = titleMatch[1].replace(/^(for|in)\s+[a-z0-9-]+\s*/i, '').trim();
      }
    }

    if (!labTitle || labTitle.length < 3) {
      return {
        handled: true,
        message: `What is the title of the coding lab you'd like to create for **${targetCourse.code || targetCourse.name}**?\n\n*Example:* \`Create coding lab for Python: Two Sum & Hash Map Lookup\` or \`Create coding lab titled 'Binary Search Implementation'\``,
      };
    }

    // Determine programming language
    let language = 'python';
    if (qLower.includes('javascript') || qLower.includes('js') || qLower.includes('node')) {
      language = 'javascript';
    } else if (qLower.includes('c++') || qLower.includes('cpp')) {
      language = 'cpp';
    } else if (qLower.includes('java')) {
      language = 'java';
    }

    // Determine due date (default +7 days)
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 7);
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    // Determine max marks (default 25)
    const marksMatch = q.match(/\b(\d+)\s*(?:marks|pts|points)\b/i);
    const maxMarks = marksMatch ? parseInt(marksMatch[1], 10) : 25;

    // Generate starter code template
    let starterCode = '';
    if (language === 'python') {
      starterCode = `def solution(*args):\n    # Write your solution below\n    # Return the expected result\n    pass`;
    } else if (language === 'javascript') {
      starterCode = `function solution(...args) {\n  // Write your solution below\n  return null;\n}`;
    } else if (language === 'cpp') {
      starterCode = `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}`;
    } else {
      starterCode = `public class Solution {\n    public static void main(String[] args) {\n        // Write your solution below\n    }\n}`;
    }

    const testCases = [
      { id: '1', input: 'sample_input_1', expectedOutput: 'expected_output_1' },
      { id: '2', input: 'sample_input_2', expectedOutput: 'expected_output_2' },
    ];

    const description = `Implement ${labTitle} following clean programming practices. Your solution will be validated against automated test cases.`;

    try {
      if (ctx.createAssignment) {
        ctx.createAssignment({
          courseId: targetCourse.id,
          title: labTitle,
          description,
          dueDate: dueDateStr,
          maxMarks,
          type: 'coding',
          language,
          starterCode,
          testCases,
          labStatus: 'active',
        });
      }

      // Sync with globalLabs in localStorage
      try {
        const storedLabsRaw = localStorage.getItem('aaroh_global_labs');
        const storedLabs: any[] = storedLabsRaw ? JSON.parse(storedLabsRaw) : [];
        const labItem = {
          id: `lab_${Date.now()}`,
          title: labTitle,
          courseId: targetCourse.id,
          language,
          problemStatement: description,
          starterCode,
          testCases,
          status: 'active',
          dueDate: dueDateStr,
          maxMarks,
          publishedAt: new Date().toISOString(),
        };
        localStorage.setItem('aaroh_global_labs', JSON.stringify([labItem, ...storedLabs]));
        window.dispatchEvent(new CustomEvent('global-labs-updated'));
        window.dispatchEvent(new CustomEvent('assignment-created'));
      } catch {}

      ctx.showToast?.({
        type: 'success',
        title: 'Coding Lab Published',
        message: `${labTitle} published for ${targetCourse.code || targetCourse.name}`,
      });

      return {
        handled: true,
        message: `💻 **Automated Coding Lab Published Successfully**\n\n• **Lab Title:** ${labTitle}\n• **Course:** ${targetCourse.code} : ${targetCourse.name}\n• **Language:** ${language.toUpperCase()}\n• **Due Date:** ${dueDateStr}\n• **Max Marks:** ${maxMarks}\n• **Automated Test Cases:** 2 test cases initialized\n\nThe coding lab is active and now open for student submissions in the proctored workspace.`,
      };
    } catch (err) {
      console.error('Failed to create coding lab via AI:', err);
      return {
        handled: true,
        message: `An error occurred while creating the coding lab "${labTitle}". Please try again.`,
      };
    }
  }

  // =========================================================================
  // 3. Create Standard Assignment Action
  // =========================================================================
  const isAssignmentIntent =
    qLower.includes('create assignment') || qLower.includes('post assignment') || qLower.includes('publish assignment') ||
    qLower.includes('new assignment') || qLower.includes('assign coursework') || qLower.startsWith('create assignment');

  if (isAssignmentIntent) {
    const targetCourse = resolveFacultyCourse(q, effectiveCourses, defaultCourse);

    if (!targetCourse) {
      return {
        handled: true,
        message: 'Please specify which course this assignment belongs to (e.g. `Create assignment for CS101: Problem Set 2`).',
      };
    }

    // Extract Title
    let asgTitle = '';
    const quoteMatch = q.match(/["'`]([^"'`]+)["'`]/);
    if (quoteMatch) {
      asgTitle = quoteMatch[1].trim();
    } else {
      const titleMatch = q.match(/(?:titled|title|named|name|assignment:?)\s+([^,.;\n]+)/i);
      if (titleMatch) {
        asgTitle = titleMatch[1].replace(/^(for|in)\s+[a-z0-9-]+\s*/i, '').trim();
      }
    }

    if (!asgTitle || asgTitle.length < 3) {
      return {
        handled: true,
        message: `Please specify a title for the assignment under **${targetCourse.code || targetCourse.name}**.\n\n*Example:* \`Create assignment for Python: Problem Set 3 on Recursion\` or \`Publish assignment titled 'Database Normalization Exercises'\``,
      };
    }

    // Determine due date (default +7 days)
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 7);
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    // Determine max marks (default 20)
    const marksMatch = q.match(/\b(\d+)\s*(?:marks|pts|points)\b/i);
    const maxMarks = marksMatch ? parseInt(marksMatch[1], 10) : 20;

    const description = `Complete the assigned coursework for ${asgTitle} and submit before the scheduled deadline. Review rubric guidelines prior to submission.`;

    try {
      if (ctx.createAssignment) {
        ctx.createAssignment({
          courseId: targetCourse.id,
          title: asgTitle,
          description,
          dueDate: dueDateStr,
          maxMarks,
          type: 'standard',
        });
      }

      window.dispatchEvent(new CustomEvent('assignment-created'));

      ctx.showToast?.({
        type: 'success',
        title: 'Assignment Published',
        message: `${asgTitle} published for ${targetCourse.code || targetCourse.name}`,
      });

      return {
        handled: true,
        message: `📋 **Standard Assignment Published Successfully**\n\n• **Title:** ${asgTitle}\n• **Course:** ${targetCourse.code} : ${targetCourse.name}\n• **Due Date:** ${dueDateStr}\n• **Max Marks:** ${maxMarks}\n• **Guidelines:** ${description}\n\nThe assignment is immediately visible on the Student and Faculty coursework portals.`,
      };
    } catch (err) {
      console.error('Failed to create assignment via AI:', err);
      return {
        handled: true,
        message: `An error occurred while creating the assignment "${asgTitle}". Please try again.`,
      };
    }
  }

  return {
    handled: false,
    message: '',
  };
}
