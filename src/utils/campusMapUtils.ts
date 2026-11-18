import { ClassSession, User, CampusTicket, CampusBuilding } from '../types';

export interface BuildingMeta {
  id: CampusBuilding;
  name: string;
  code: string;
  tagline: string;
  coordinates: { x: number; y: number; width: number; height: number };
  gridArea?: string;
  floorCount: number;
  departments: string[];
}

export const CAMPUS_BUILDINGS: BuildingMeta[] = [
  {
    id: 'Academic Blocks',
    name: 'Academic Blocks',
    code: 'AB-MAIN',
    tagline: 'Lecture Theatres, Engineering Labs & Seminar Halls',
    coordinates: { x: 50, y: 40, width: 280, height: 160 },
    gridArea: 'academic',
    floorCount: 5,
    departments: ['Computer Science', 'Mechanical', 'Management', 'Law'],
  },
  {
    id: 'Library',
    name: 'Library',
    code: 'LIB-CENTRAL',
    tagline: 'Knowledge Commons, Digital Stacks & Quiet Zones',
    coordinates: { x: 380, y: 40, width: 220, height: 160 },
    gridArea: 'library',
    floorCount: 3,
    departments: ['Central Stacks', 'Digital Media Lab', 'Doctoral Studies'],
  },
  {
    id: 'Hostels',
    name: 'Hostels',
    code: 'HST-RES',
    tagline: 'Scholar Residences, Common Lounges & Study Pods',
    coordinates: { x: 50, y: 240, width: 280, height: 150 },
    gridArea: 'hostels',
    floorCount: 8,
    departments: ['Boys Wing A & B', 'Girls Wing C & D', 'Dining Hall'],
  },
  {
    id: 'Canteen',
    name: 'Canteen',
    code: 'CNT-HUB',
    tagline: 'Student Food Court, Pavilion & Recreation Annex',
    coordinates: { x: 380, y: 240, width: 220, height: 150 },
    gridArea: 'canteen',
    floorCount: 2,
    departments: ['Central Cafeteria', 'Juice Bar', 'Activity Deck'],
  },
];

/**
 * Checks whether a timetable class room/venue corresponds to a specific campus building.
 */
export function matchRoomToBuilding(roomStr: string = ''): CampusBuilding {
  const r = (roomStr || '').toLowerCase();
  if (r.includes('hostel') || r.includes('dorm') || r.includes('residence')) {
    return 'Hostels';
  }
  if (r.includes('library') || r.includes('reading') || r.includes('digital lab') || r.includes('ref')) {
    return 'Library';
  }
  if (r.includes('canteen') || r.includes('cafeteria') || r.includes('mess') || r.includes('food')) {
    return 'Canteen';
  }
  // Default to Academic Blocks (Rooms, Labs, Theatres, AB codes)
  return 'Academic Blocks';
}

export interface NextClassScheduleResult {
  hasClassInNext30Min: boolean;
  minutesUntilStart: number;
  session: ClassSession | null;
  building: CampusBuilding | null;
}
export type NextClassSynergyResult = NextClassScheduleResult;

/**
 * Next Class Building Locator:
 * Checks if the student or faculty member has a class scheduled in the target building
 * within the next 30 minutes (0 <= minutesUntilStart <= 30).
 */
export function checkNextClassInBuilding(
  building: string,
  timetable: ClassSession[],
  user?: User | null,
  now: Date = new Date()
): NextClassScheduleResult {
  if (!timetable || timetable.length === 0) {
    return {
      hasClassInNext30Min: false,
      minutesUntilStart: -1,
      session: null,
      building: null,
    };
  }

  const currentDay = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Filter timetable for this user's program/semester or assigned faculty classes
  const relevantClasses = timetable.filter(s => {
    if (user?.role === 'student') {
      if (s.program && user.program && !s.program.toLowerCase().includes(user.program.toLowerCase()) && !user.program.toLowerCase().includes(s.program.toLowerCase())) {
        return false;
      }
      if (s.semester && user.semester && Number(s.semester) !== Number(user.semester)) {
        return false;
      }
    } else if (user?.role === 'faculty') {
      if (user.email && s.facultyEmail && s.facultyEmail.toLowerCase() === user.email.toLowerCase()) {
        return true;
      }
      if (user.name && s.facultyName && s.facultyName.toLowerCase().includes(user.name.toLowerCase())) {
        return true;
      }
    }
    return true;
  });

  // Evaluate classes on today or next available teaching day
  const effectiveDay = currentDay === 0 ? 1 : currentDay;
  const dayClasses = relevantClasses.filter(s => s.dayOfWeek === effectiveDay);

  for (const session of dayClasses) {
    const sessionBuilding = matchRoomToBuilding(session.room);
    if (sessionBuilding.toLowerCase() === building.toLowerCase()) {
      // Parse "HH:MM"
      const [startHour, startMin] = (session.startTime || '09:00').split(':').map(Number);
      const sessionMinutes = (startHour || 0) * 60 + (startMin || 0);

      const diff = sessionMinutes - currentMinutes;

      // In the next 30 minutes (or just starting/currently active in first 30 mins)
      if (diff >= 0 && diff <= 30) {
        return {
          hasClassInNext30Min: true,
          minutesUntilStart: diff,
          session,
          building: sessionBuilding,
        };
      }
    }
  }

  return {
    hasClassInNext30Min: false,
    minutesUntilStart: -1,
    session: null,
    building: null,
  };
}

/**
 * Returns health monitor stats for a specific building based on the global campusTickets array.
 * If an unresolved "Critical" ticket exists, the building enters the critical state.
 */
export function getBuildingHealth(building: string, tickets: CampusTicket[]) {
  const bLower = (building || '').toLowerCase();
  const buildingTickets = (tickets || []).filter(t => (t.location || '').toLowerCase() === bLower);

  const unresolved = buildingTickets.filter(t => t.status !== 'Resolved');
  const criticalTickets = unresolved.filter(t => t.priority === 'Critical');
  const inProgressCount = unresolved.filter(t => t.status === 'In Progress').length;
  const reportedCount = unresolved.filter(t => t.status === 'Reported').length;

  return {
    hasCritical: criticalTickets.length > 0,
    criticalCount: criticalTickets.length,
    unresolvedCount: unresolved.length,
    inProgressCount,
    reportedCount,
    totalCount: buildingTickets.length,
    tickets: buildingTickets,
  };
}
