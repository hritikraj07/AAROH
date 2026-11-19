import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 sm:p-6 flex flex-col justify-between transition-colors duration-200 min-h-[380px]">
      <div className="flex-1 flex flex-col">
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

        {sortedAssignments.length === 0 ? (
          <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden rounded-b-2xl px-6 py-10 text-center my-auto">
            {/* SVG Background Layer */}
            <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/60 dark:from-emerald-950/20 dark:via-slate-900 dark:to-blue-950/20" />
              <svg
                className="absolute inset-0 w-full h-full"
                style={{
                  maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
                }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="coursework-blueprint" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1D4ED8" strokeOpacity="0.07" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#coursework-blueprint)" />
              </svg>
              <svg
                className="absolute -bottom-6 -right-6 w-48 h-48 opacity-[0.08]"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="200" cy="200" r="60" stroke="#1D4ED8" strokeWidth="1.2" className="dark:stroke-[#60A5FA]" />
                <circle cx="200" cy="200" r="100" stroke="#0F2544" strokeWidth="1.2" className="dark:stroke-[#94A3B8]" />
                <circle cx="200" cy="200" r="140" stroke="#1D4ED8" strokeWidth="1.2" className="dark:stroke-[#60A5FA]" />
                <circle cx="200" cy="200" r="180" stroke="#0F2544" strokeWidth="1.2" className="dark:stroke-[#94A3B8]" />
              </svg>
            </div>

            {/* Foreground Empty-State Visual */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-center mb-3.5 shadow-xs">
                <CheckCircle2 className="w-7 h-7 text-[#15803D] dark:text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-[#0F2544] dark:text-slate-100">
                No active coursework
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Assignments and lab tasks will appear here
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 text-[11px] font-semibold text-[#15803D] dark:text-emerald-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                <span>All caught up for Semester 1</span>
              </div>
              <Link
                to="/student/academics?tab=assignments"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-slate-800/80 text-[#0F2544] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Open Coding Labs</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-1">
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
  );
};

export default WeekAssignmentsWidget;
