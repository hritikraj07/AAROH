import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { FileText, Plus, Calendar, CheckCircle2, Clock, X, BookOpen, AlertCircle } from 'lucide-react';
import { Assignment } from '../../types';

export const FacultyAssignmentsPage: React.FC = () => {
  const { courses, assignments, createAssignment } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Form State
  const [courseId, setCourseId] = useState<string>(courses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [maxMarks, setMaxMarks] = useState<number>(20);

  const filteredAssignments = assignments.filter(a => {
    if (selectedCourseFilter === 'all') return true;
    return a.courseId === selectedCourseFilter;
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const targetCourse = courses.find(c => c.id === courseId) || courses[0];
    if (!targetCourse) return;

    createAssignment({
      courseId: targetCourse.id,
      title: title.trim(),
      description: description.trim() || 'Complete the assigned problem set and submit before deadline.',
      dueDate,
      maxMarks: Number(maxMarks) || 20,
    });

    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Assignment Management & Grading
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create laboratory assignments, coursework deadlines, and evaluate student submission statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {courses.length > 0 && (
            <select
              value={selectedCourseFilter}
              onChange={e => setSelectedCourseFilter(e.target.value)}
              className="text-xs font-mono px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Courses ({assignments.length})</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              if (courses.length > 0 && !courseId) {
                setCourseId(courses[0].id);
              }
              setIsAddModalOpen(true);
            }}
          >
            Post Assignment
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {assignments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No assignments created</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            There are currently no assignments or laboratory tasks created for the active term. Post your first assignment to notify enrolled students.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Post Assignment
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Assignment Title</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAssignments.map(asg => (
                  <tr key={asg.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-teal-900">
                      {courses.find(c => c.id === asg.courseId)?.code || 'CRS'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{asg.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
                        {asg.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {asg.dueDate}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {asg.maxMarks} pts
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          asg.status === 'submitted'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : asg.status === 'overdue'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {asg.status === 'submitted'
                          ? 'Graded'
                          : asg.status === 'overdue'
                          ? 'Overdue'
                          : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => alert(`Review submissions for: ${asg.title}`)}
                        className="text-teal-700 hover:text-teal-900 font-semibold px-2 py-1 rounded hover:bg-teal-50 transition-colors"
                      >
                        Review Submissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Assignment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm max-w-md w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-800" />
                <h3 className="text-sm font-semibold text-slate-900">Post Course Assignment</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Course <span className="text-rose-600">*</span>
                </label>
                {courses.length === 0 ? (
                  <p className="text-xs text-rose-600">Please add a course first before posting assignments.</p>
                ) : (
                  <select
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignment Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Experiment 4: Binary Search Trees"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Submission Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions, rubric criteria, or problem set links..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={maxMarks}
                    onChange={e => setMaxMarks(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={courses.length === 0}
                >
                  Publish to Students
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAssignmentsPage;
