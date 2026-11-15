import { Assignment, Opportunity, User } from '../types';

export interface UrgentDeadlineItem {
  id: string;
  type: 'assignment' | 'opportunity';
  title: string;
  subtitle: string;
  deadlineDate: string;
  hoursRemaining: number;
  timeRemainingLabel: string;
  formattedText: string;
  route: string;
}

/**
 * Pure TypeScript utility to calculate approaching deadlines within a 48-hour window.
 * Uses vanilla JavaScript Date math (no external date libraries).
 *
 * Rules:
 * 1. Checks current student's pending assignments (status === 'pending').
 * 2. Checks current student's saved opportunities (via savedOpportunityIds or isSaved).
 * 3. Filters for items strictly in the future BUT less than 48 hours away (0 < diffMs <= 48h).
 * 4. Sorts by closest deadline first.
 */
export const getApproachingDeadlines = (
  assignments: Assignment[],
  opportunities: Opportunity[],
  user?: User | null,
  now: Date = new Date()
): UrgentDeadlineItem[] => {
  const currentMs = now.getTime();
  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
  const items: UrgentDeadlineItem[] = [];

  // 1. Check Pending Coursework Assignments
  const pendingAssignments = (assignments || []).filter(a => a.status === 'pending');

  pendingAssignments.forEach(asg => {
    // If dueDate has no time part (YYYY-MM-DD), assume end of day (23:59:59)
    const dateObj = asg.dueDate.includes('T')
      ? new Date(asg.dueDate)
      : new Date(`${asg.dueDate}T23:59:59`);
    const dueMs = dateObj.getTime();
    const diffMs = dueMs - currentMs;

    // Strictly in the future BUT less than 48 hours away
    if (diffMs > 0 && diffMs <= FORTY_EIGHT_HOURS_MS) {
      const hoursRemaining = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
      const timeRemainingLabel =
        hoursRemaining === 1
          ? 'due in 1 hour'
          : `due in ${hoursRemaining} hours`;

      items.push({
        id: asg.id,
        type: 'assignment',
        title: asg.title,
        subtitle: 'Coursework Assignment',
        deadlineDate: asg.dueDate,
        hoursRemaining,
        timeRemainingLabel,
        formattedText: `Assignment: ${asg.title} ${timeRemainingLabel}`,
        route: '/student/assignments',
      });
    }
  });

  // 2. Check Saved Opportunities (using user's savedOpportunityIds array or isSaved flag)
  const savedIds = user?.savedOpportunityIds || [];
  const savedOpportunities = (opportunities || []).filter(
    opp => savedIds.includes(opp.id) || opp.isSaved
  );

  savedOpportunities.forEach(opp => {
    const dateObj = opp.deadline.includes('T')
      ? new Date(opp.deadline)
      : new Date(`${opp.deadline}T23:59:59`);
    const dueMs = dateObj.getTime();
    const diffMs = dueMs - currentMs;

    // Strictly in the future BUT less than 48 hours away
    if (diffMs > 0 && diffMs <= FORTY_EIGHT_HOURS_MS) {
      const hoursRemaining = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
      const timeRemainingLabel =
        hoursRemaining === 1
          ? 'due in 1 hour'
          : `due in ${hoursRemaining} hours`;

      items.push({
        id: opp.id,
        type: 'opportunity',
        title: opp.title,
        subtitle: `${opp.organization} · ${opp.type}`,
        deadlineDate: opp.deadline,
        hoursRemaining,
        timeRemainingLabel,
        formattedText: `Opportunity: ${opp.title} ${timeRemainingLabel}`,
        route: '/student/opportunities',
      });
    }
  });

  // Sort with closest deadline first
  items.sort((a, b) => a.hoursRemaining - b.hoursRemaining);

  return items;
};
