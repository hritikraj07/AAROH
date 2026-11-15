import { AttendanceRecord, ClassSession, Course } from '../types';

export interface AttendanceAnalysis {
  courseId: string;
  course: Course;
  attended: number;
  total: number;
  percentage: number;
  isBelowThreshold: boolean;
  hint: string;
  classesToAttend: number;
  classesCanMiss: number;
}

export const AcademicService = {
  // Compute attendance stats with exact formula
  analyzeAttendance(
    records: AttendanceRecord[],
    courses: Course[],
    threshold = 75
  ): AttendanceAnalysis[] {
    const courseMap = new Map(courses.map(c => [c.id, c]));

    return records.map(rec => {
      const course = courseMap.get(rec.courseId) || {
        id: rec.courseId,
        code: 'COURSE',
        name: 'Course',
        credits: 3,
        facultyName: 'TBA',
        facultyEmail: '',
        roomDefault: '',
        colorTag: 'slate',
      };

      const percentage = rec.total > 0 ? (rec.attended / rec.total) * 100 : 100;
      const isBelowThreshold = percentage < threshold;

      let classesToAttend = 0;
      let classesCanMiss = 0;
      let hint = '';

      if (isBelowThreshold) {
        // (attended + x) / (total + x) >= T / 100
        // (100 - T) * x >= T * total - 100 * attended
        const numerator = threshold * rec.total - 100 * rec.attended;
        const denominator = 100 - threshold;
        classesToAttend = Math.max(1, Math.ceil(numerator / denominator));
        hint = `Attend ${classesToAttend} more ${classesToAttend === 1 ? 'class' : 'classes'} to reach ${threshold}%`;
      } else {
        // attended / (total + y) >= T / 100
        // T * y <= 100 * attended - T * total
        const numerator = 100 * rec.attended - threshold * rec.total;
        classesCanMiss = Math.max(0, Math.floor(numerator / threshold));
        if (classesCanMiss === 0) {
          hint = `On threshold: cannot miss next class without dropping below ${threshold}%`;
        } else {
          hint = `Can miss ${classesCanMiss} more ${classesCanMiss === 1 ? 'class' : 'classes'}`;
        }
      }

      return {
        courseId: rec.courseId,
        course,
        attended: rec.attended,
        total: rec.total,
        percentage: Number(percentage.toFixed(1)),
        isBelowThreshold,
        hint,
        classesToAttend,
        classesCanMiss,
      };
    });
  },

  // Get classes for a specific day of week
  getSessionsForDay(timetable: ClassSession[], dayOfWeek: number): ClassSession[] {
    return timetable
      .filter(s => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  // Find next class today, or next day with classes
  getNextUpcomingClass(
    timetable: ClassSession[],
    referenceDate = new Date()
  ): {
    session: ClassSession | null;
    isToday: boolean;
    dayLabel: string;
    isHappeningNow: boolean;
    minutesUntil: number;
  } {
    const currentDayOfWeek = referenceDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
    const currentHours = referenceDate.getHours();
    const currentMinutes = referenceDate.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

    // 1. Check today's remaining classes
    if (currentDayOfWeek >= 1 && currentDayOfWeek <= 6) {
      const todayClasses = this.getSessionsForDay(timetable, currentDayOfWeek);
      
      // Is any class happening right now?
      const inProgress = todayClasses.find(c => c.startTime <= currentTimeStr && c.endTime >= currentTimeStr);
      if (inProgress) {
        return {
          session: inProgress,
          isToday: true,
          dayLabel: 'Today',
          isHappeningNow: true,
          minutesUntil: 0,
        };
      }

      // Find first class starting after now
      const upcomingToday = todayClasses.find(c => c.startTime > currentTimeStr);
      if (upcomingToday) {
        const [startH, startM] = upcomingToday.startTime.split(':').map(Number);
        const diffMinutes = (startH * 60 + startM) - (currentHours * 60 + currentMinutes);
        return {
          session: upcomingToday,
          isToday: true,
          dayLabel: 'Today',
          isHappeningNow: false,
          minutesUntil: diffMinutes,
        };
      }
    }

    // 2. No more classes today or today has no classes (e.g. Sunday or late evening):
    // Search next days in the week
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let offset = 1; offset <= 7; offset++) {
      const nextDayNum = (currentDayOfWeek + offset) % 7;
      if (nextDayNum === 0) continue; // Skip Sunday

      const nextDayClasses = this.getSessionsForDay(timetable, nextDayNum);
      if (nextDayClasses.length > 0) {
        const nextFirstClass = nextDayClasses[0];
        const dayLabel = offset === 1 ? 'Tomorrow' : daysMap[nextDayNum];
        return {
          session: nextFirstClass,
          isToday: false,
          dayLabel,
          isHappeningNow: false,
          minutesUntil: -1,
        };
      }
    }

    return {
      session: null,
      isToday: false,
      dayLabel: 'None',
      isHappeningNow: false,
      minutesUntil: -1,
    };
  },

  // Check if an event clashes with student's timetable classes
  checkEventClash(
    eventDateStr: string,
    eventStartTime: string,
    eventEndTime: string,
    timetable: ClassSession[],
    courses: Course[]
  ): {
    hasClash: boolean;
    clashingSession?: ClassSession;
    clashingCourse?: Course;
  } {
    // Parse event date to determine day of week
    // Date constructor for "YYYY-MM-DD" in local time
    const [year, month, day] = eventDateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) {
      return { hasClash: false }; // No classes on Sunday
    }

    const dayClasses = this.getSessionsForDay(timetable, dayOfWeek);
    const courseMap = new Map(courses.map(c => [c.id, c]));

    for (const session of dayClasses) {
      // Overlap condition: start1 < end2 AND start2 < end1
      if (eventStartTime < session.endTime && eventEndTime > session.startTime) {
        return {
          hasClash: true,
          clashingSession: session,
          clashingCourse: courseMap.get(session.courseId),
        };
      }
    }

    return { hasClash: false };
  },
};
