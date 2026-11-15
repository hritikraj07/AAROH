import { ClassSession, AttendanceRecord, Course, Assignment, Opportunity, User } from '../types';
import { getApproachingDeadlines } from './deadlineUtils';

export interface AIAssistantContext {
  user?: User | null;
  timetable: ClassSession[];
  attendance: AttendanceRecord[];
  courses: Course[];
  assignments: Assignment[];
  opportunities: Opportunity[];
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
      return "No classes have been added to your timetable yet. Check back once your department administrator posts the schedule.";
    }

    // Today's day of week (0 = Sunday, 1 = Monday ... 6 = Saturday)
    const currentDay = now.getDay();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Classes scheduled for today
    const todaySessions = relevantSessions
      .filter(s => s.dayOfWeek === currentDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todaySessions.length === 0) {
      // Find the next day with classes
      for (let offset = 1; offset <= 7; offset++) {
        const nextDay = ((currentDay + offset) % 7);
        const nextDaySessions = relevantSessions
          .filter(s => s.dayOfWeek === nextDay)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (nextDaySessions.length > 0) {
          const firstNext = nextDaySessions[0];
          const subject = firstNext.courseName || firstNext.courseCode || 'Class';
          const room = firstNext.room || 'Classroom';
          const time = firstNext.startTime;
          return `You have no lectures scheduled for today. Your next upcoming class is ${subject} in ${room} at ${time}.`;
        }
      }
      return "You have no classes scheduled on your timetable.";
    }

    // Find next chronological class today (startTime >= currentTimeStr or ongoing)
    const nextClass = todaySessions.find(s => s.startTime >= currentTimeStr) || todaySessions.find(s => s.endTime > currentTimeStr);

    if (nextClass) {
      const subject = nextClass.courseName || nextClass.courseCode || 'Lecture';
      const room = nextClass.room || 'Classroom';
      const time = nextClass.startTime;
      return `Your next class is ${subject} in ${room} at ${time}.`;
    }

    // If all classes for today are finished
    return `All your scheduled classes for today have concluded. Great job!`;
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
        .map(c => `• ${c.name} — ${c.attended}/${c.total} attended (${c.pct}%). Need ${c.needed} more class(es) to reach 75%.`)
        .join('\n');
      return `⚠️ Attendance Warning: You currently have ${lowAttendanceList.length} subject(s) below the mandatory 75% threshold:\n\n${details}`;
    }

    return "Good news! Your attendance is in good standing across all enrolled subjects (all ≥ 75%). Keep it up!";
  }

  // 3. Check for Deadlines or Due Dates
  if (q.includes('deadline') || q.includes('due') || q.includes('urgent') || q.includes('assignment') || q.includes('submit')) {
    const urgentItems = getApproachingDeadlines(context.assignments, context.opportunities, context.user, now);

    if (urgentItems.length > 0) {
      const itemsList = urgentItems
        .map(item => `• [${item.type === 'assignment' ? 'Coursework' : 'Opportunity'}] ${item.title} — ${item.formattedText}`)
        .join('\n');
      return `⏰ You have ${urgentItems.length} deadline(s) approaching in the next 48 hours:\n\n${itemsList}`;
    }

    return "You're all caught up! You have no assignments or saved opportunities due in the next 48 hours.";
  }

  // 4. Default Fallback
  return "I'm your Aaroh campus assistant. Try asking me about your next class, attendance, or upcoming deadlines!";
}
