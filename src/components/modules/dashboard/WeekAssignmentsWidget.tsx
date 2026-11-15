import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
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
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              ACTIVE COURSEWORK
            </span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-mono">
                {pendingCount} PENDING
              </span>
            )}
          </div>
          <Link
            to="/student/academics?tab=assignments"
            className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 active:scale-95 transition-transform duration-150"
          >
            <span>All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-6">
          {sortedAssignments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-slate-900">No active coursework</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">Assignments and lab tasks will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedAssignments.map(asg => {
                const course = courseMap.get(asg.courseId);
                const isSubmitted = asg.status === 'submitted';
                const isOverdue = asg.status === 'overdue';

                return (
                  <div
                    key={asg.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {course?.code || 'COURSE'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 font-mono">
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
                          isSubmitted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {asg.title}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleAssignmentSubmission(asg.id)}
                      className={`text-xs px-2.5 py-1 rounded font-medium border active:scale-95 transition-transform duration-150 shrink-0 ${
                        isSubmitted
                          ? 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                          : 'border-teal-700 bg-teal-700 text-white hover:bg-[#0D6861]'
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

      {assignments.length > 0 && (
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{assignments.filter(a => a.status === 'submitted').length}/{assignments.length} completed</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Strict deadline enforcement</span>
          </span>
        </div>
      )}
    </div>
  );
};
