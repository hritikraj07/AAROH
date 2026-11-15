import { User } from '../types';

/**
 * Offline Mock AI Team / Study Partner Matchmaker
 * Filters users array from localStorage to discover peers with role 'student'
 * who share the exact same semester and academic program as the logged-in student.
 */
export function findStudyPartnerMatch(
  currentUser: { id?: string; role?: string; semester?: number | string; program?: string } | null,
  allUsers: User[]
): User | null {
  if (!currentUser) return null;

  const currentProg = (currentUser.program || '').trim().toLowerCase();
  const currentSem = Number(currentUser.semester);

  // Filter students who are not the logged-in user and share the same semester and program
  const candidates = (allUsers || []).filter(u => {
    if (u.role !== 'student') return false;
    if (u.id === currentUser.id) return false;
    if (Number(u.semester) !== currentSem) return false;

    const userProg = (u.program || '').trim().toLowerCase();
    if (!currentProg || !userProg) return false;

    return userProg === currentProg || userProg.includes(currentProg) || currentProg.includes(userProg);
  });

  if (candidates.length === 0) return null;

  // Pick the best match (first or deterministic candidate)
  return candidates[0];
}
