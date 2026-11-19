import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../ui/Badge';

export const WeekAssignmentsWidget: React.FC = () => {
  const { assignments, courses, toggleAssignmentSubmission } = useApp();
  const courseMap = new Map(courses.map(c => [c.id, c]));

  const sortedAssignments = [...assignments]
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 4);

  const pendingCount = assignments.filter(a => a.status !== 'submitted').length;

  return (
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 sm:p-6 flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-300 uppercase font-mono">
              ACTIVE COURSEWORK
            </span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-1.5 py-0.5 rounded font-mono">
                {pendingCount} PENDING
              </span>
            )}
          </div>
          <Link
            to="/student/academics?tab=assignments"
            className="rounded-full bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white text-xs px-3.5 py-1.5 min-h-[36px] font-medium transition-colors flex items-center gap-1 active:scale-95 border border-[#8DA9C4]/30 shadow-sm"
          >
            <span>All Tasks</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="mt-6">
          {sortedAssignments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No active coursework</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono">Assignments and lab tasks will appear here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedAssignments.map(asg => {
                const course = courseMap.get(asg.courseId);
                const isSubmitted = asg.status === 'submitted';
                const isOverdue = asg.status === 'overdue';

                return (
                  <div
                    key={asg.id}
                    className="py-3 px-3 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {course?.code || 'COURSE'}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Due: {asg.dueDate}
                        </span>
                        {isOverdue && (
                          <Badge variant="rose" size="sm" dot>
                            Overdue
                          </Badge>
                        )}
                        {isSubmitted && (
                          <Badge variant="emerald" size="sm" dot>
                            Submitted
                          </Badge>
                        )}
                      </div>

                      <p
                        className={`text-xs font-semibold mt-1 truncate ${
                          isSubmitted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-200'
                        }`}
                      >
                        {asg.title}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleAssignmentSubmission(asg.id)}
                      className={`rounded-full text-xs px-3 py-1 font-medium transition-colors shrink-0 ${
                        isSubmitted
                          ? 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                          : 'bg-[#134074] text-white hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 shadow-sm'
                      }`}
                    >
                      {isSubmitted ? 'Mark Pending' : 'Submit'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeekAssignmentsWidget;
