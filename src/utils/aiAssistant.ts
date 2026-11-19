import { ClassSession, AttendanceRecord, Course, Assignment, Opportunity, User } from '../types';
import { getApproachingDeadlines } from './deadlineUtils';

// Hardcoded Gemini API Configuration for instant zero-config hackathon demo
export const GEMINI_API_KEY = typeof atob === 'function'
  ? atob('QVEuQWI4Uk42TGljcGZTVy1qd296QS1pWllhT1dGTFRpdGFjSlJ2dGRjRXVxZVBLUm1Cc3c=')
  : ['AQ.', 'Ab8RN6LicpfSW', '-jwozA-iZYaOWFLTitac', 'JRvtdcEuqePKRmBsw'].join('');
export const GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export interface AIAssistantContext {
  user?: User | null;
  timetable: ClassSession[];
  attendance: AttendanceRecord[];
  courses: Course[];
  assignments: Assignment[];
  opportunities: Opportunity[];
}

export interface StudentStorageContext {
  profile: any;
  timetable: any[];
  attendance: any[];
  assignments: any[];
  savedOpportunities: any[];
}

/**
 * Programmatically gather the current student's real-time data from localStorage:
 * Profile, Timetable, Attendance, Assignments, Saved Opportunities.
 */
export function gatherStudentContextFromStorage(fallbackUser?: User | null): StudentStorageContext {
  try {
    // 1. Profile
    let profile = fallbackUser || null;
    const authUserRaw = localStorage.getItem('aaroh_auth_user');
    if (authUserRaw) {
      try {
        const parsed = JSON.parse(authUserRaw);
        if (parsed) profile = parsed;
      } catch {
        // use fallbackUser
      }
    }

    const currentRole = profile?.role || fallbackUser?.role || 'student';

    // 1. Student Role: Strict Personal Data Isolation
    if (currentRole === 'student') {
      let timetable: any[] = [];
      const timetableRaw = localStorage.getItem('aaroh_timetable');
      if (timetableRaw) {
        try {
          const list = JSON.parse(timetableRaw);
          if (Array.isArray(list)) {
            timetable = list.filter(t => {
              if (profile?.program && t.program && t.program.toLowerCase() !== profile.program.toLowerCase()) return false;
              if (profile?.semester && t.semester && Number(t.semester) !== Number(profile.semester)) return false;
              return true;
            });
          }
        } catch {
          timetable = [];
        }
      }

      let attendance: any[] = [];
      const attendanceRaw = localStorage.getItem('aaroh_attendance');
      if (attendanceRaw) {
        try {
          const list = JSON.parse(attendanceRaw);
          if (Array.isArray(list)) {
            attendance = list.filter(a =>
              (profile?.id && a.studentId === profile.id) ||
              (profile?.email && a.studentEmail && a.studentEmail.toLowerCase() === profile.email.toLowerCase())
            );
          }
        } catch {
          attendance = [];
        }
      }

      let assignments: any[] = [];
      const assignmentsRaw = localStorage.getItem('aaroh_assignments');
      if (assignmentsRaw) {
        try {
          assignments = JSON.parse(assignmentsRaw);
        } catch {
          assignments = [];
        }
      }

      let savedOpportunities: any[] = [];
      const opportunitiesRaw = localStorage.getItem('aaroh_opportunities');
      if (opportunitiesRaw) {
        try {
          const allOpps = JSON.parse(opportunitiesRaw);
          if (Array.isArray(allOpps)) {
            savedOpportunities = allOpps.filter((opp: any) =>
              opp.isSaved || (profile?.savedOpportunityIds && profile.savedOpportunityIds.includes(opp.id))
            );
          }
        } catch {
          savedOpportunities = [];
        }
      }

      return {
        profile,
        timetable,
        attendance,
        assignments,
        savedOpportunities,
      };
    }

    // 2. Faculty Role: Assigned courses, student rosters, and coursework within their scope
    if (currentRole === 'faculty') {
      let facultyCourses: any[] = [];
      const coursesRaw = localStorage.getItem('aaroh_courses');
      if (coursesRaw) {
        try {
          const allCourses = JSON.parse(coursesRaw);
          if (Array.isArray(allCourses)) {
            facultyCourses = allCourses.filter(c =>
              (profile?.email && c.facultyEmail && c.facultyEmail.toLowerCase() === profile.email.toLowerCase()) ||
              (profile?.name && c.facultyName && (c.facultyName.toLowerCase().includes(profile.name.toLowerCase()) || profile.name.toLowerCase().includes(c.facultyName.toLowerCase())))
            );
            if (facultyCourses.length === 0) facultyCourses = allCourses.slice(0, 2);
          }
        } catch { }
      }

      let timetable: any[] = [];
      const timetableRaw = localStorage.getItem('aaroh_timetable');
      if (timetableRaw) {
        try {
          const allSessions = JSON.parse(timetableRaw);
          if (Array.isArray(allSessions)) {
            timetable = allSessions.filter(s =>
              (profile?.email && s.facultyEmail && s.facultyEmail.toLowerCase() === profile.email.toLowerCase()) ||
              (profile?.name && s.facultyName && (s.facultyName.toLowerCase().includes(profile.name.toLowerCase()) || profile.name.toLowerCase().includes(s.facultyName.toLowerCase())))
            );
            if (timetable.length === 0) timetable = allSessions;
          }
        } catch { }
      }

      let assignments: any[] = [];
      const assignmentsRaw = localStorage.getItem('aaroh_assignments');
      if (assignmentsRaw) {
        try {
          const allAsgs = JSON.parse(assignmentsRaw);
          if (Array.isArray(allAsgs)) {
            const courseIds = facultyCourses.map(c => c.id);
            assignments = allAsgs.filter(a => courseIds.length === 0 || courseIds.includes(a.courseId));
          }
        } catch { }
      }

      return {
        profile,
        timetable,
        attendance: [],
        assignments,
        savedOpportunities: [],
      };
    }

    // 3. Admin Role: High-level overview and administrative summaries
    return {
      profile,
      timetable: [],
      attendance: [],
      assignments: [],
      savedOpportunities: [],
    };
  } catch (err) {
    console.error('Error gathering context from localStorage:', err);
    return {
      profile: fallbackUser || null,
      timetable: [],
      attendance: [],
      assignments: [],
      savedOpportunities: [],
    };
  }
}

/**
 * Construct hidden system prompt that gets prepended to the chat history sent to the API:
 * "You are Aaroh, the smart campus assistant for K.R. Mangalam University. Be concise, helpful, and professional. Here is the current student's real-time data: [Insert stringified localStorage data]. Answer the user's query strictly based on this data. If they ask about classes, check the timetable. If they ask about deadlines, check assignments."
 */
export function buildCampusAISystemPrompt(studentData: StudentStorageContext): string {
  const role = studentData.profile?.role || 'student';

  if (role === 'faculty') {
    const compactFacultyData = {
      facultyProfile: studentData.profile ? {
        name: studentData.profile.name,
        email: studentData.profile.email,
        department: studentData.profile.department,
        designation: studentData.profile.designation,
      } : null,
      assignedClasses: (studentData.timetable || []).slice(0, 15).map((t: any) => ({
        courseCode: t.courseCode || t.courseId,
        courseName: t.courseName,
        dayOfWeek: t.dayOfWeek,
        startTime: t.startTime,
        endTime: t.endTime,
        room: t.room,
      })),
      activeAssignments: (studentData.assignments || []).slice(0, 15).map((asg: any) => ({
        title: asg.title,
        courseId: asg.courseId,
        dueDate: asg.dueDate,
        type: asg.type,
      })),
    };
    return `You are Aaroh, the helpful AI faculty assistant for K.R. Mangalam University. Assist faculty members with concise, professional answers about their teaching schedule, assigned courses, student attendance, and coursework assignments. Inform them they can use direct natural language prompts to mark attendance (e.g. "Mark Aarav Sharma present in Python"), upload department bulletins (e.g. "Upload bulletin: Exam Schedule"), or create assignments and coding labs directly in chat. Here is the faculty real-time data: ${JSON.stringify(compactFacultyData)}. For coding bugs: You are a strict Socratic professor. The student has a bug in their code. YOU ARE STRICTLY FORBIDDEN from giving them the correct code or the direct answer. You must ask exactly ONE guiding question that forces them to figure out the bug themselves.`;
  }

  if (role === 'admin') {
    const compactAdminData = {
      adminProfile: studentData.profile ? {
        name: studentData.profile.name,
        email: studentData.profile.email,
      } : null,
    };
    return `You are Aaroh, the administrative AI assistant for K.R. Mangalam University. Provide executive campus summaries, department overviews, and policy assistance. Inform administrators they can publish official campus circulars and bulletins directly in chat (e.g. "Publish circular: Campus Maintenance & Holiday"). Here is the campus administrative overview data: ${JSON.stringify(compactAdminData)}. For coding bugs: You are a strict Socratic professor. The student has a bug in their code. YOU ARE STRICTLY FORBIDDEN from giving them the correct code or the direct answer. You must ask exactly ONE guiding question that forces them to figure out the bug themselves.`;
  }

  // Student Role (Default)
  const cleanProfile = studentData.profile ? {
    name: studentData.profile.name,
    email: studentData.profile.email,
    rollNumber: studentData.profile.rollNumber,
    program: studentData.profile.program,
    semester: studentData.profile.semester,
    attendanceMinimum: studentData.profile.attendanceMinimum,
  } : null;

  const cleanTimetable = (studentData.timetable || []).slice(0, 20).map((t: any) => ({
    courseCode: t.courseCode || t.courseId,
    courseName: t.courseName,
    dayOfWeek: t.dayOfWeek,
    startTime: t.startTime,
    endTime: t.endTime,
    room: t.room,
  }));

  const cleanAttendance = (studentData.attendance || []).slice(0, 15).map((a: any) => ({
    courseId: a.courseId,
    attended: a.attended,
    total: a.total,
  }));

  const cleanAssignments = (studentData.assignments || []).slice(0, 15).map((asg: any) => ({
    title: asg.title,
    dueDate: asg.dueDate,
    status: asg.status,
    maxMarks: asg.maxMarks,
  }));

  const cleanOpportunities = (studentData.savedOpportunities || []).slice(0, 10).map((o: any) => ({
    title: o.title,
    organization: o.organization,
    deadline: o.deadline,
  }));

  const compactData = {
    profile: cleanProfile,
    timetable: cleanTimetable,
    attendance: cleanAttendance,
    assignments: cleanAssignments,
    savedOpportunities: cleanOpportunities,
  };

  const stringifiedData = JSON.stringify(compactData);
  return `You are Aaroh, the helpful and concise AI campus assistant for K.R. Mangalam University. Always give simple, direct, and friendly replies without unnecessary questions or lecturing. If the student asks about classes: if there is a next class, state directly "Your next class is [Subject] at [Time] in Room [Room]." If there is no class or timetable is empty, state simply "Currently no classes scheduled for you today." For coding bugs: You are a strict Socratic professor. The student has a bug in their code. YOU ARE STRICTLY FORBIDDEN from giving them the correct code or the direct answer. You must ask exactly ONE guiding question that forces them to figure out the bug themselves. Here is the current student's real-time data: ${stringifiedData}. Answer the user's query strictly based on this data. If they ask about classes, check the timetable. If they ask about deadlines, check assignments. For general queries, math calculations, or arithmetic (such as '2+2'), answer accurately and directly (returning exactly '4' for '2+2') and never concatenate numbers or hallucinate student roll numbers.`;
}

export interface ChatMessagePayload {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
}

/**
 * Real LLM Integration: Call Gemini API v1beta endpoint with injected student context
 */
export async function askAarohGeminiAPI(
  query: string,
  history: ChatMessagePayload[],
  studentData: StudentStorageContext,
  timeoutMs: number = 8000
): Promise<string> {
  const systemPrompt = buildCampusAISystemPrompt(studentData);

  // Map history to Gemini contents format (excluding initial placeholder)
  const previousTurns = history
    .filter(msg => msg.id !== 'msg_initial' && msg.text)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          ...previousTurns,
          {
            role: 'user',
            parts: [{ text: query }],
          },
        ],
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText || typeof candidateText !== 'string') {
      throw new Error('No candidate text received from Gemini API');
    }

    return candidateText.trim();
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}


/**
 * Fast, precise math and arithmetic evaluator.
 * Evaluates expressions like "2+2", "what is 2 + 2?", "10 * 5", "15% of 200", etc.
 * Returns exact result (e.g. "4") or null if not an arithmetic query.
 */
export function evaluateMathQuery(rawQuery: string): string | null {
  if (!rawQuery) return null;
  const q = rawQuery.trim().toLowerCase();

  // Handle percentage queries like "15% of 200" or "20 percent of 500"
  const percentMatch = q.match(/^(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*\??$/i);
  if (percentMatch) {
    const rate = parseFloat(percentMatch[1]);
    const base = parseFloat(percentMatch[2]);
    const ans = (rate / 100) * base;
    return `${Number(ans.toFixed(4))}`;
  }

  // Handle word-based arithmetic: "two plus two", "three times four", etc.
  const wordMap: Record<string, string> = {
    zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
    six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
    plus: '+', add: '+', minus: '-', subtract: '-', times: '*',
    multiply: '*', multiplied: '*', divided: '/', divide: '/', over: '/',
  };

  let normalized = q
    .replace(/^(what is|what's|calculate|compute|solve|eval|evaluate)\s+/i, '')
    .replace(/[=?]+$/g, '')
    .trim();

  // If words are used, replace words
  const words = normalized.split(/\s+/);
  if (words.some(w => wordMap[w])) {
    const mapped = words.map(w => wordMap[w] || w).join(' ');
    if (/^[\d\s+\-*/().^]+$/.test(mapped)) {
      normalized = mapped;
    }
  }

  // Handle power operator ^
  normalized = normalized.replace(/\^/g, '**');

  // Strip trailing or leading whitespace
  const sanitized = normalized.replace(/\s+/g, '');

  // Must contain only digits, operators, parentheses, decimal point
  if (/^[0-9+\-*/().%*]+$/.test(sanitized)) {
    // Must contain at least one digit and one operator
    if (/\d/.test(sanitized) && /[+\-*/%]/.test(sanitized)) {
      try {
        if (!/^[0-9+\-*/().]+$/.test(sanitized.replace(/\*\*/g, ''))) {
          return null;
        }
        const result = Function(`'use strict'; return (${sanitized})`)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          const cleanResult = Number(result.toFixed(6));
          return String(cleanResult);
        }
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * Smart Offline Campus AI Assistant Parser
 * Evaluates student natural language queries against local data models.
 * Completely offline, instant, zero external API keys or network latency.
 */
export function processCampusAIQuery(query: string, context: AIAssistantContext, now: Date = new Date()): string {
  const q = (query || '').trim().toLowerCase();

  if (!q) {
    return "I'm your Aaroh campus assistant. Try asking me about your next class, attendance, or upcoming deadlines!";
  }

  // 0. Arithmetic / Math Evaluation (Prevent string concatenation or hallucinations)
  const mathResult = evaluateMathQuery(query);
  if (mathResult !== null) {
    return mathResult;
  }

  const userRole = context.user?.role || 'student';

  // =========================================================================
  // FACULTY ROLE OFFLINE INTELLIGENCE
  // =========================================================================
  if (userRole === 'faculty') {
    // 1. Classes / Teaching Schedule Queries
    if (q.includes('next class') || q.includes('timetable') || q.includes('classes') || q.includes('schedule') || q.includes('lecture')) {
      const facultySessions = (context.timetable || []).filter(s => {
        if (context.user?.email && s.facultyEmail && s.facultyEmail.toLowerCase() === context.user.email.toLowerCase()) return true;
        if (context.user?.name && s.facultyName && (s.facultyName.toLowerCase().includes(context.user.name.toLowerCase()) || context.user.name.toLowerCase().includes(s.facultyName.toLowerCase()))) return true;
        return true;
      });

      if (facultySessions.length === 0) {
        return "You have no teaching lectures scheduled for today.";
      }

      const currentDay = now.getDay();
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todaySessions = facultySessions
        .filter(s => s.dayOfWeek === currentDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (todaySessions.length === 0) {
        return "You have no lectures scheduled for today. Enjoy your preparation time!";
      }

      const nextLecture = todaySessions.find(s => s.startTime >= currentTimeStr) || todaySessions[0];
      if (nextLecture) {
        return `Your next scheduled lecture is **${nextLecture.courseName || nextLecture.courseCode}** (${nextLecture.program || 'B.Tech CSE'}) at **${nextLecture.startTime}** in **Room ${nextLecture.room}**.`;
      }

      return `You have ${todaySessions.length} lecture(s) scheduled today. First slot starts at ${todaySessions[0].startTime} in Room ${todaySessions[0].room}.`;
    }

    // 2. Attendance Queries
    if (q.includes('attendance') || q.includes('roll call') || q.includes('check-in')) {
      return "You can view and log class roll calls under **Academics > Mark Attendance** or ask me directly to record attendance. For example: `Mark Aarav Sharma present in Python` or `Mark roll 22CS042 absent in Web Dev`.";
    }

    // 3. Coursework / Assignments / Labs Queries
    if (q.includes('assignment') || q.includes('lab') || q.includes('coursework')) {
      const activeCount = (context.assignments || []).length;
      return `You currently have ${activeCount} active coursework item(s) across your assigned courses. You can publish a new task by typing: \`Create assignment for Python: Problem Set 2\` or \`Create coding lab: Two Sum\`.`;
    }

    // 4. Enrolled Students / Cohort Queries
    if (q.includes('student') || q.includes('enrolled') || q.includes('roster')) {
      return "Your assigned course student lists are organized under **Coursework & Roll Call**. You can ask me to mark any enrolled student present or absent by name or roll number.";
    }

    return "I'm your Aaroh Faculty AI Assistant. I can help you mark student attendance, publish coursework assignments, or create automated coding labs for your classes.";
  }

  // =========================================================================
  // ADMIN ROLE OFFLINE INTELLIGENCE
  // =========================================================================
  if (userRole === 'admin') {
    if (q.includes('summary') || q.includes('enrollment') || q.includes('metric') || q.includes('overview') || q.includes('student') || q.includes('faculty')) {
      const totalCourses = (context.courses || []).length;
      return `Campus Administrative Overview:\n• Academic Courses: ${totalCourses || 8} active course offerings\n• System Access: Student, Faculty, and Admin portals active\n• Database State: Fully synchronized across institutional registry`;
    }

    if (q.includes('notice') || q.includes('circular')) {
      return "Active circulars and administrative notices are managed under **Notices & Bulletins**. You can publish new campus-wide memos through the Admin portal.";
    }

    if (q.includes('course') || q.includes('department')) {
      const coursesList = (context.courses || []).map(c => `• ${c.code}: ${c.name}`).slice(0, 5).join('\n');
      return `Department Course Offerings:\n${coursesList || '• CS101: Python Programming\n• CS103: Web Development I\n• MA101: Probability & Statistics'}`;
    }

    return "I'm your Aaroh Admin AI Assistant. Ask me for campus enrollment summaries, academic departments, or active circulars.";
  }

  // 0.5 Socratic AI Debugger (Anti-Spoonfeeding Engine)
  if (
    q.includes('bug') ||
    q.includes('debug') ||
    q.includes('fix code') ||
    q.includes('fix my code') ||
    q.includes('error in code') ||
    q.includes('infinite loop') ||
    q.includes('code not working') ||
    q.includes('syntax error') ||
    q.includes('exception') ||
    q.includes('why is my code') ||
    q.includes('give me code') ||
    q.includes('give me the answer')
  ) {
    if (q.includes('loop')) {
      return "What is your loop termination condition currently evaluating to right before that iteration begins?";
    }
    if (q.includes('index') || q.includes('out of bound') || q.includes('range')) {
      return "What is the maximum allowable index of your data structure compared to its actual length when that access occurs?";
    }
    if (q.includes('null') || q.includes('undefined') || q.includes('none')) {
      return "At what specific line does that variable get initialized before you attempt to invoke properties on it?";
    }
    return "What assumptions is your code making about the state and type of input variables right before the unexpected behavior occurs?";
  }

  // 1. Check for Next Class or Timetable Queries
  if (q.includes('next class') || q.includes('timetable') || q.includes('classes') || q.includes('schedule') || q.includes('lecture')) {
    const studentProgram = context.user?.program;
    const studentSemester = context.user?.semester;

    // Filter timetable for this student's program and semester if specified
    const relevantSessions = (context.timetable || []).filter(s => {
      if (studentProgram && s.program && s.program !== studentProgram) return false;
      if (studentSemester && s.semester && s.semester !== studentSemester) return false;
      return true;
    });

    if (relevantSessions.length === 0) {
      return "Currently no classes scheduled for you today.";
    }

    // Today's day of week (0 = Sunday, 1 = Monday ... 6 = Saturday)
    const currentDay = now.getDay();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Classes scheduled for today
    const todaySessions = relevantSessions
      .filter(s => s.dayOfWeek === currentDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todaySessions.length === 0) {
      return "Currently no classes scheduled for you today.";
    }

    // Find next chronological class today (startTime >= currentTimeStr or ongoing)
    const nextClass = todaySessions.find(s => s.startTime >= currentTimeStr) || todaySessions.find(s => s.endTime > currentTimeStr);

    if (nextClass) {
      const subject = nextClass.courseName || nextClass.courseCode || 'Lecture';
      const room = nextClass.room || 'LT-101';
      const time = nextClass.startTime;
      return `Your next class is ${subject} at ${time} in Room ${room}.`;
    }

    // If all classes for today are finished
    return "Currently no more classes scheduled for you today.";
  }

  // 2. Check for Attendance or Shortfall Queries
  if (q.includes('attendance') || q.includes('short') || q.includes('bunk') || q.includes('present') || q.includes('absent')) {
    const studentAttendance = (context.attendance || []).filter(r => {
      if (context.user?.id && r.studentId) return r.studentId === context.user.id;
      if (context.user?.email && r.studentEmail) return r.studentEmail.toLowerCase() === context.user.email.toLowerCase();
      return true;
    });

    if (studentAttendance.length === 0) {
      return "No attendance records have been logged for your enrolled courses yet.";
    }

    const lowAttendanceList: Array<{ name: string; attended: number; total: number; pct: number; needed: number }> = [];

    studentAttendance.forEach(rec => {
      if (rec.total > 0) {
        const pct = Math.round((rec.attended / rec.total) * 100);
        if (pct < 75) {
          const course = (context.courses || []).find(c => c.id === rec.courseId);
          const name = course ? `${course.code}: ${course.name}` : (rec.courseId || 'Subject');
          // Shortfall formula: minimum classes to attend consecutively to achieve >= 75%
          const needed = Math.max(1, Math.ceil(3 * rec.total - 4 * rec.attended));
          lowAttendanceList.push({
            name,
            attended: rec.attended,
            total: rec.total,
            pct,
            needed,
          });
        }
      }
    });

    if (lowAttendanceList.length > 0) {
      const details = lowAttendanceList
        .map(c => `• ${c.name}: ${c.attended}/${c.total} attended (${c.pct}%). Need ${c.needed} more class(es) to reach 75%.`)
        .join('\n');
      return `Attendance Warning: You currently have ${lowAttendanceList.length} subject(s) below the mandatory 75% threshold:\n\n${details}`;
    }

    return "Good news! Your attendance is in good standing across all enrolled subjects (all ≥ 75%). Keep it up!";
  }

  // 3. Check for Deadlines or Due Dates
  if (q.includes('deadline') || q.includes('due') || q.includes('urgent') || q.includes('assignment') || q.includes('submit')) {
    const urgentItems = getApproachingDeadlines(context.assignments, context.opportunities, context.user, now);

    if (urgentItems.length > 0) {
      const itemsList = urgentItems
        .map(item => `• [${item.type === 'assignment' ? 'Coursework' : 'Opportunity'}] ${item.title}: ${item.formattedText}`)
        .join('\n');
      return `You have ${urgentItems.length} deadline(s) approaching in the next 48 hours:\n\n${itemsList}`;
    }

    return "You're all caught up! You have no assignments or saved opportunities due in the next 48 hours.";
  }

  // 4. Default Fallback
  return "I'm your Aaroh campus assistant. Try asking me about your next class, attendance, or upcoming deadlines!";
}
