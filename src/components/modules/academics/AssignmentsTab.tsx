import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { AssignmentStatus } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { CheckCircle2, Filter, Search, Calendar, Code, ArrowRight } from 'lucide-react';

export const AssignmentsTab: React.FC = () => {
  const { assignments, courses, toggleAssignmentSubmission } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | AssignmentStatus>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'soonest' | 'furthest'>('soonest');
  const [searchQuery, setSearchQuery] = useState('');

  const courseMap = new Map(courses.map(c => [c.id, c]));

  // Counts for status tabs
  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const overdueCount = assignments.filter(a => a.status === 'overdue').length;
  const submittedCount = assignments.filter(a => a.status === 'submitted').length;

  const filteredAssignments = useMemo(() => {
    return assignments
      .filter(asg => {
        // Status filter
        if (statusFilter !== 'all' && asg.status !== statusFilter) return false;

        // Course filter
        if (courseFilter !== 'all' && asg.courseId !== courseFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const course = courseMap.get(asg.courseId);
          const matchTitle = asg.title.toLowerCase().includes(q);
          const matchDesc = asg.description.toLowerCase().includes(q);
          const matchCode = course?.code.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCode) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'soonest') {
          return a.dueDate.localeCompare(b.dueDate);
        } else {
          return b.dueDate.localeCompare(a.dueDate);
        }
      });
  }, [assignments, statusFilter, courseFilter, sortOrder, searchQuery, courseMap]);

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-3.5 space-y-3">
        {/* Status Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All', count: assignments.length },
              { id: 'pending', label: 'Pending', count: pendingCount },
              { id: 'overdue', label: 'Overdue', count: overdueCount },
              { id: 'submitted', label: 'Submitted', count: submittedCount },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as 'all' | AssignmentStatus)}
                className={`px-3 py-2 min-h-[40px] text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 tabular-nums">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-400 font-medium">Sort:</span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'soonest' | 'furthest')}
              className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="soonest">Due Date (Soonest first)</option>
              <option value="furthest">Due Date (Furthest first)</option>
            </select>
          </div>
        </div>

        {/* Search & Subject Dropdown Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-slate-200 dark:border-[#27272A]">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search assignments by topic or problem title..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/70 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="w-full sm:w-56 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Subjects ({courses.length})</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white border border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-white/5 dark:text-slate-400 rounded-2xl divide-y divide-slate-200 dark:divide-[#27272A]">
        {filteredAssignments.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-white/5 dark:text-slate-400 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-400 dark:text-teal-400 mb-3 border border-slate-200 dark:border-white/5">
              <Code className="w-5 h-5 text-slate-400 dark:text-teal-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {assignments.length === 0 ? 'No Automated Coding Labs assigned yet.' : 'No matching assignments found'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {assignments.length === 0
                ? 'Interactive coding assignments, test suites, and proctored workspaces will be listed here when scheduled by faculty.'
                : 'Try adjusting your subject selection or status filters above.'}
            </p>
          </div>
        ) : (
          filteredAssignments.map(asg => {
            const course = courseMap.get(asg.courseId);
            const isSubmitted = asg.status === 'submitted';
            const isOverdue = asg.status === 'overdue';

            return (
              <div
                key={asg.id}
                className={`p-4 transition-colors hover:bg-slate-50/70 dark:hover:bg-[#27272A]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isOverdue ? 'bg-rose-50/15 dark:bg-rose-950/10' : isSubmitted ? 'bg-slate-50/30 dark:bg-[#27272A]/20' : ''
                }`}
              >
                {/* Left Info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-400">
                      {course?.code}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {course?.name}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Max: {asg.maxMarks} Marks
                    </span>

                    {/* Coding Live Lab Badge */}
                    {asg.type === 'coding' && (
                      <span className="text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        <span>LIVE LAB ({asg.language || 'python'})</span>
                      </span>
                    )}

                    {/* Status Badge */}
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
                    {asg.status === 'pending' && (
                      <Badge variant="amber" size="sm" dot>
                        Pending
                      </Badge>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {asg.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                    {asg.description}
                  </p>

                  {/* Submission note or Due date line */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      Due: {asg.dueDate}
                    </span>
                    {asg.submittedAt && (
                      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Submitted on {asg.submittedAt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                  {asg.type === 'coding' ? (
                    <Link
                      to={`/student/assignments/code/${asg.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] active:scale-95 transition-all duration-150 rounded-md shadow-sm select-none border border-[#8DA9C4]/30"
                    >
                      <Code className="w-3.5 h-3.5 text-teal-200" />
                      <span>Launch Live Lab</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Button
                      variant={isSubmitted ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => toggleAssignmentSubmission(asg.id)}
                      className={
                        isSubmitted
                          ? 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : ''
                      }
                    >
                      {isSubmitted ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Mark Pending
                        </span>
                      ) : (
                        'Mark as Submitted'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
