import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../ui/Badge';

export const WeekAssignmentsWidget: React.FC = () => {
  const { assignments, courses, toggleAssignmentSubmission } = useApp();
  const courseMap = new Map(courses.map(c => [c.id, c]));

  // Sort assignments: overdue first, then soonest due dates
  const sortedAssignments = [...assignments]
    .sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 4);

  const pendingCount = assignments.filter(a => a.status !== 'submitted').length;

  return (
    <div className="bg-white border border-border rounded-lg shadow-subtle overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50/50">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-700" />
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Assignments Due This Week
          </h3>
          {pendingCount > 0 && (
            <span className="text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        <Link
          to="/student/academics?tab=assignments"
          className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
        >
          <span>All Assignments</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* List / Empty State */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {sortedAssignments.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs font-semibold text-slate-800">No assignments due this week</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed">
              Course assignment submissions, lab problem sets, and submission portals will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedAssignments.map(asg => {
              const course = courseMap.get(asg.courseId);
              const isSubmitted = asg.status === 'submitted';
              const isOverdue = asg.status === 'overdue';

              return (
                <div
                  key={asg.id}
                  className={`p-3 rounded-md border text-xs transition-all flex items-start justify-between gap-3 ${
                    isSubmitted
                      ? 'border-border bg-slate-50/50 text-slate-500'
                      : isOverdue
                      ? 'border-rose-200 bg-rose-50/30'
                      : 'border-border bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
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
                      className={`font-medium mt-1 truncate ${
                        isSubmitted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {asg.title}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAssignmentSubmission(asg.id)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors shrink-0 ${
                      isSubmitted
                        ? 'text-slate-500 hover:text-slate-700 bg-white border border-border'
                        : 'text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200'
                    }`}
                    title={isSubmitted ? 'Click to mark unsubmitted' : 'Click to mark submitted'}
                  >
                    {isSubmitted ? 'Undo' : 'Mark Done'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {sortedAssignments.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-slate-500">
            <span>{assignments.filter(a => a.status === 'submitted').length} / {assignments.length} completed</span>
            <Link to="/student/academics?tab=assignments" className="text-teal-700 hover:underline">
              Manage Submissions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
