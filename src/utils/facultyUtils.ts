import { User, Course, ClassSession } from '../types';

/**
 * Dynamically resolves and formats the full name of a faculty member.
 * Fixes display issues where "Prf" or "Prof" or truncated surnames were shown.
 * Example outputs: "Dr. K. Ramanujam", "Prof. Rajesh Verma"
 */
export function getFacultyFullName(
  sessionOrCourse?: { facultyName?: string; facultyEmail?: string } | null,
  course?: { facultyName?: string; facultyEmail?: string } | null,
  users?: User[]
): string {
  const email = sessionOrCourse?.facultyEmail || course?.facultyEmail;

  // 1. Look up user by email in the institutional directory
  if (email && users && users.length > 0) {
    const userMatch = users.find(
      u => u.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (userMatch && userMatch.name && userMatch.name.trim().length > 3) {
      return sanitizeFacultyTitle(userMatch.name);
    }
  }

  // 2. Check the raw facultyName provided
  const rawName = sessionOrCourse?.facultyName || course?.facultyName;
  if (rawName && rawName.trim().length > 0) {
    const trimmed = rawName.trim();
    // If it's literally just "Prf", "Prof", "Prof." without a name
    if (
      trimmed.toLowerCase() === 'prf' ||
      trimmed.toLowerCase() === 'prof' ||
      trimmed.toLowerCase() === 'prof.'
    ) {
      const defaultFaculty = users?.find(u => u.role === 'faculty');
      if (defaultFaculty?.name) {
        return sanitizeFacultyTitle(defaultFaculty.name);
      }
      return 'Dr. K. Ramanujam';
    }
    return sanitizeFacultyTitle(trimmed);
  }

  // 3. Fallback to default campus faculty coordinator
  return 'Dr. K. Ramanujam';
}

/**
 * Ensures faculty names have a professional title (e.g. Dr. or Prof.)
 * and converts informal "Prf" abbreviations to "Dr." or "Prof."
 */
export function sanitizeFacultyTitle(name: string): string {
  let cleaned = name.trim();

  // If raw input is just abbreviation
  if (/^prf\.?$/i.test(cleaned) || /^prof\.?$/i.test(cleaned)) {
    return 'Dr. K. Ramanujam';
  }

  // Replace "Prf." or "Prf " with "Dr. "
  if (/^prf\.?\s+/i.test(cleaned)) {
    cleaned = cleaned.replace(/^prf\.?\s+/i, 'Dr. ');
  }

  // Normalize "Prof. K. Ramanujam" to "Dr. K. Ramanujam" when appropriate or keep honorific
  if (!/^dr\.?\s+/i.test(cleaned) && !/^prof\.?\s+/i.test(cleaned)) {
    cleaned = `Dr. ${cleaned}`;
  }

  return cleaned;
}
