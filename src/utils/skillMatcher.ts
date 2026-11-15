import { Opportunity, Assignment } from '../types';

export const TECH_KEYWORDS = [
  'React',
  'Python',
  'Node',
  'Node.js',
  'Figma',
  'TypeScript',
  'JavaScript',
  'SQL',
  'Docker',
  'Go',
  'Golang',
  'Rust',
  'C++',
  'Java',
  'Git',
  'Next.js',
  'Express',
  'Tailwind',
  'PostgreSQL',
  'MongoDB',
  'GraphQL',
  'AWS',
  'Machine Learning',
  'AI',
] as const;

export interface SkillMatchAnalysis {
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  isMatch: boolean;
  hasRequirements: boolean;
  message: string;
}

/**
 * Normalizes and checks if a keyword exists as a discrete word or token in the target text.
 */
function containsKeyword(text: string, keyword: string): boolean {
  if (!text) return false;
  // Escape regex special chars for tokens like 'C++', 'Node.js'
  const escaped = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(^|[^a-zA-Z0-9_])${escaped}([^a-zA-Z0-9_]|$)`, 'i');
  return regex.test(text);
}

/**
 * Extract technology skills from the opportunity's description (and fallback to eligibility/title).
 */
export function extractRequiredSkills(opportunity: Opportunity): string[] {
  const desc = opportunity.description || '';
  const eligibility = opportunity.eligibility || '';
  const title = opportunity.title || '';
  const textToScan = `${desc} ${eligibility} ${title}`;

  const found: string[] = [];
  for (const kw of TECH_KEYWORDS) {
    if (containsKeyword(textToScan, kw)) {
      // Map synonyms like 'Node.js' to 'Node', 'Golang' to 'Go'
      const canonical = kw === 'Node.js' ? 'Node' : kw === 'Golang' ? 'Go' : kw;
      if (!found.includes(canonical)) {
        found.push(canonical);
      }
    }
  }
  return found;
}

/**
 * Extract verified skills from the student's completed and passed coding assignments.
 */
export function extractStudentVerifiedSkills(assignments: Assignment[]): Set<string> {
  const verifiedSkills = new Set<string>();

  const completedCodingAssignments = assignments.filter(a => {
    // Must be of type 'coding'
    if (a.type !== 'coding') return false;

    // Must be passed / submitted without errors
    const isPassedStatus = a.status === 'submitted' || a.status === 'graded' || (a.status as string) === 'passed';
    const noFailedTests = !a.testResultsSummary || !a.testResultsSummary.includes('❌');
    return isPassedStatus && noFailedTests;
  });

  completedCodingAssignments.forEach(a => {
    // 1. Check language field
    if (a.language) {
      const lang = a.language.trim();
      verifiedSkills.add(lang.toLowerCase());
      if (lang.toLowerCase().includes('node')) verifiedSkills.add('node');
      if (lang.toLowerCase().includes('react')) verifiedSkills.add('react');
      if (lang.toLowerCase().includes('python')) verifiedSkills.add('python');
    }

    // 2. Scan title and description of completed assignments
    const labContent = `${a.title || ''} ${a.description || ''} ${a.starterCode || ''}`;
    for (const kw of TECH_KEYWORDS) {
      if (containsKeyword(labContent, kw)) {
        const canonical = kw === 'Node.js' ? 'Node' : kw === 'Golang' ? 'Go' : kw;
        verifiedSkills.add(canonical.toLowerCase());
      }
    }
  });

  return verifiedSkills;
}

/**
 * Analyzes skill match between an opportunity and student's completed assignments.
 * 
 * Logic:
 * - Scans opportunity description for tech keywords ('React', 'Python', 'Node', 'Figma', etc.)
 * - Cross-references found keywords against student's completed coding assignments
 * - Returns match (green) or gap detected (amber) with actionable missing skills
 */
export function analyzeSkillMatch(
  opportunity: Opportunity,
  assignments: Assignment[]
): SkillMatchAnalysis {
  const requiredSkills = extractRequiredSkills(opportunity);
  const studentSkills = extractStudentVerifiedSkills(assignments);

  if (requiredSkills.length === 0) {
    return {
      requiredSkills: [],
      matchedSkills: [],
      missingSkills: [],
      isMatch: true,
      hasRequirements: false,
      message: 'No specific coding prerequisites detected. Open to all students!',
    };
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  requiredSkills.forEach(skill => {
    if (studentSkills.has(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const isMatch = missingSkills.length === 0;

  let message = '';
  if (isMatch) {
    message = 'You have the required skills based on your completed Zosima labs.';
  } else {
    const missingStr = missingSkills.length === 1 ? missingSkills[0] : missingSkills.join(', ');
    message = `Skill Gap: This role requires ${missingStr}.`;
  }

  return {
    requiredSkills,
    matchedSkills,
    missingSkills,
    isMatch,
    hasRequirements: true,
    message,
  };
}
