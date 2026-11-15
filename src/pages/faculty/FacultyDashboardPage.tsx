import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';
import { Button } from '../../components/ui/Button';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Users,
  Building,
  GraduationCap,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export const FacultyDashboardPage: React.FC = () => {
  const { user, courses, timetable, assignments, notices } = useApp();
  const navigate = useNavigate();

  // Determine current day of week (1=Monday ... 7=Sunday)
  const currentDay = new Date().getDay() || 7; // Convert 0 (Sun) to 7
  const todayClasses = timetable
    .filter(s => s.dayOfWeek === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];

  return (
    <div className="space-y-6">
      {/* Faculty Profile Banner */}
      <div className="bg-white border border-border rounded-lg p-5 sm:p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal-800 text-white font-semibold text-base flex items-center justify-center font-mono shrink-0 shadow-subtle">
              {user?.avatarInitials || 'FA'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                  {user?.name || 'Faculty Member'}
                </h2>
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {user?.designation || 'Assistant Professor'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-mono">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {user?.department || 'Department of Computer Science'}
                </span>
                <span>•</span>
                <span>{user?.email}</span>
                <span>•</span>
                <span>{APP_CONFIG.collegeShortName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              icon={<ClipboardList className="w-3.5 h-3.5" />}
              onClick={() => navigate('/faculty/attendance')}
            >
              Mark Attendance
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => navigate('/faculty/assignments')}
            >
              Post Assignment
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-lg p-4 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Courses</span>
            <BookOpen className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {courses.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active curriculum subjects</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Lectures</span>
            <Clock className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {todayClasses.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{todayName} schedule</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Course Modules</span>
            <FileText className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {assignments.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Assignments & coursework</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Campus Circulars</span>
            <GraduationCap className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {notices.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Published institutional notices</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Today's Teaching Schedule */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Today's Teaching Schedule</h3>
              <p className="text-xs text-slate-500">{todayName} sessions</p>
            </div>
            <Link
              to="/faculty/attendance"
              className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Session Logger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {todayClasses.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-border rounded-md bg-slate-50/50">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No lectures scheduled for today</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Enjoy your preparation and research time or review coursework submissions.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayClasses.map(cls => {
                const course = courses.find(c => c.id === cls.courseId);
                return (
                  <div
                    key={cls.id}
                    className="p-3 rounded-md border border-border bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          {course?.code || 'CRS'}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">{course?.name || 'Curriculum Course'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {cls.startTime} - {cls.endTime}
                        </span>
                        <span>•</span>
                        <span>Room {cls.room}</span>
                        <span>•</span>
                        <span className="capitalize">{cls.type}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/faculty/attendance?course=${cls.courseId}`)}
                    >
                      Take Roll
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Coursework & Assignment Submissions */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Coursework & Assignments</h3>
              <p className="text-xs text-slate-500">Active submissions & deadlines</p>
            </div>
            <Link
              to="/faculty/assignments"
              className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {assignments.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-border rounded-md bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No active assignments posted</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Post assignments to collect laboratory reports, homework, or project deliverables.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                icon={<Plus className="w-3 h-3" />}
                onClick={() => navigate('/faculty/assignments')}
              >
                Create First Assignment
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.slice(0, 4).map(asg => (
                <div
                  key={asg.id}
                  className="p-3 rounded-md border border-border flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-800 text-[11px]">
                        {courses.find(c => c.id === asg.courseId)?.code || 'CRS'}
                      </span>
                      <span className="font-medium text-slate-900">{asg.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Due: {asg.dueDate} • Max marks: {asg.maxMarks}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      asg.status === 'submitted'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : asg.status === 'overdue'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {asg.status === 'submitted' ? 'Graded / Submitted' : 'Pending Review'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboardPage;
