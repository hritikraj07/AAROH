import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { BookOpen, Plus, Clock, Building, X, Trash2, Network, ClipboardList } from 'lucide-react';
import { Course } from '../../types';
import { getFacultyFullName } from '../../utils/facultyUtils';
import { SkillTreeModal } from '../../components/modules/academics/SkillTreeModal';

export const FacultyClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const { courses, timetable, createCourse, deleteCourse, user, users, role } = useApp();
  const currentUser = user;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCourseForTree, setSelectedCourseForTree] = useState<Course | null>(null);

  // Form State (Admin course creation modal)
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(4);
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [room, setRoom] = useState('Room 402');
  const [scheduleDesc, setScheduleDesc] = useState('Mon, Wed, Fri 09:00 - 10:00');

  const isFaculty = currentUser?.role === 'faculty' || role === 'faculty';

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    createCourse({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      credits: Number(credits) || 4,
      facultyName: currentUser?.name || 'Prof. Faculty Member',
      facultyEmail: currentUser?.email || 'faculty@faculty.aaroh.edu.in',
      roomDefault: room.trim(),
      colorTag: 'teal',
    });

    setCode('');
    setName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Assigned Courses & Curriculum
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your teaching subjects, credit allocations, and class assignments.
          </p>
        </div>

        {/* RBAC: Faculty cannot create/assign courses. Strictly hidden for faculty role */}
        {!isFaculty && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] rounded-xl transition-all duration-200 active:scale-95 shadow-sm border border-[#8DA9C4]/30 cursor-pointer select-none"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-white border border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-white/5 dark:text-slate-400 rounded-2xl p-12 text-center space-y-3 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-400 dark:text-teal-400 mb-1 border border-slate-200 dark:border-white/5">
            <BookOpen className="w-5 h-5 text-slate-400 dark:text-teal-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No courses enrolled for this academic term.</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            No courses currently assigned. Your department admin will allocate your subjects here.
          </p>
          {/* RBAC: Strictly hidden for faculty role */}
          {!isFaculty && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] rounded-xl transition-all duration-200 active:scale-95 shadow-sm border border-[#8DA9C4]/30 cursor-pointer select-none"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Assign Course</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const courseSessions = timetable.filter(s => s.courseId === course.id);
            return (
              <div
                key={course.id}
                className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 ease-in-out"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-teal-900 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                      {course.code}
                    </span>
                    {!isFaculty && (
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                        title="Remove Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{course.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                      <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {getFacultyFullName(course, null, users)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-[#27272A] grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Credits:</span>
                      <span className="font-semibold text-slate-800">{course.credits}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Room:</span>
                      <span className="font-semibold text-slate-800">{course.roomDefault}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{courseSessions.length > 0 ? `${courseSessions.length} weekly sessions scheduled` : 'Scheduled as per master timetable'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-[#27272A] flex items-center justify-between text-xs gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetSessionId = courseSessions[0]?.id || '';
                      navigate(`/faculty/attendance?sessionId=${targetSessionId}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 min-h-[40px] sm:min-h-[36px] rounded-xl bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white border border-[#8DA9C4]/30 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-[#8DA9C4]" />
                    <span>Take Attendance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCourseForTree(course)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-3 py-2 min-h-[40px] sm:min-h-[36px] rounded-full bg-slate-50 dark:bg-[#18181B] hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#27272A] transition-colors cursor-pointer"
                  >
                    <Network className="w-3.5 h-3.5 text-[#134074] dark:text-[#8DA9C4]" />
                    <span>Syllabus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Course Modal (Admin only) */}
      {!isFaculty && isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm max-w-md w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-800 dark:text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Add Curriculum Course</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Code <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS301"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures and Algorithms"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={credits}
                    onChange={e => setCredits(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Room</label>
                  <input
                    type="text"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Schedule Overview
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mon, Wed, Fri 09:00 - 10:00"
                  value={scheduleDesc}
                  onChange={e => setScheduleDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#27272A]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Course
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCourseForTree && (
        <SkillTreeModal
          courseId={selectedCourseForTree.id}
          courseCode={selectedCourseForTree.code}
          courseName={selectedCourseForTree.name}
          isOpen={Boolean(selectedCourseForTree)}
          onClose={() => setSelectedCourseForTree(null)}
        />
      )}
    </div>
  );
};

export default FacultyClassesPage;
