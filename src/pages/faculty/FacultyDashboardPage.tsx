import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Plus,
  Building,
  GraduationCap,
  ArrowRight,
  ClipboardList,
  Bell,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const FacultyDashboardPage: React.FC = () => {
  const { user, courses, timetable, assignments, notices } = useApp();
  const navigate = useNavigate();

  const courseMap = new Map(courses.map(c => [c.id, c]));

  // Filter timetable to classes where this teacher is assigned
  const facultyTimetable = timetable.filter(s => {
    if (user?.email && s.facultyEmail && s.facultyEmail.toLowerCase() === user.email.toLowerCase()) {
      return true;
    }
    if (user?.name && s.facultyName && (s.facultyName.toLowerCase().includes(user.name.toLowerCase()) || user.name.toLowerCase().includes(s.facultyName.toLowerCase()))) {
      return true;
    }
    return false;
  });

  // Fallback to all timetable classes if none specifically tagged (to support quick demoing)
  const effectiveTimetable = facultyTimetable.length > 0 ? facultyTimetable : timetable;

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[currentDayOfWeek];

  const todayClasses = effectiveTimetable
    .filter(s => s.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // If today has no classes, determine the next teaching day
  let nextTeachingDayNum = currentDayOfWeek;
  let nextTeachingDayClasses = todayClasses;
  let isShowingFutureDay = false;

  if (todayClasses.length === 0 && effectiveTimetable.length > 0) {
    for (let offset = 1; offset <= 6; offset++) {
      const targetDay = (currentDayOfWeek + offset) % 7;
      if (targetDay === 0) continue; // Sunday
      const found = effectiveTimetable
        .filter(s => s.dayOfWeek === targetDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (found.length > 0) {
        nextTeachingDayNum = targetDay;
        nextTeachingDayClasses = found;
        isShowingFutureDay = true;
        break;
      }
    }
  }

  // Filter notices for this faculty's department or general
  const departmentNotices = notices.filter(n =>
    n.category === 'Academic' ||
    n.category === 'Exams' ||
    (user?.department && n.department.toLowerCase().includes(user.department.toLowerCase()))
  );

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
                  {user?.designation || 'Faculty In-Charge'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-mono">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {user?.department || 'Department of Computer Science & Engineering'}
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
              Mark Roll Call
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Bell className="w-3.5 h-3.5" />}
              onClick={() => navigate('/faculty/notices')}
            >
              Post Notice
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="bg-white border border-border rounded-lg p-4 shadow-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Quick Faculty Actions
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Faculty Task Suite</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/faculty/attendance')}
            className="p-3 rounded-md border border-border bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-300 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded bg-teal-100/80 text-teal-800 flex items-center justify-center mb-2 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-900">
                Mark Attendance
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Take class roll call
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/faculty/notices')}
            className="p-3 rounded-md border border-border bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-300 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded bg-blue-100/80 text-blue-800 flex items-center justify-center mb-2 group-hover:bg-blue-700 group-hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-900">
                Post Department Notice
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Issue academic memo
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/faculty/assignments')}
            className="p-3 rounded-md border border-border bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-300 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded bg-amber-100/80 text-amber-800 flex items-center justify-center mb-2 group-hover:bg-amber-700 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-900">
                Manage Coursework
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Assignments & submissions
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/faculty/classes')}
            className="p-3 rounded-md border border-border bg-slate-50/60 hover:bg-teal-50/50 hover:border-teal-300 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded bg-emerald-100/80 text-emerald-800 flex items-center justify-center mb-2 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-900">
                Assigned Courses
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Curriculum & syllabus
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-lg p-4 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Classes</span>
            <BookOpen className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {effectiveTimetable.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Weekly teaching sessions</p>
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
            <span className="text-xs font-semibold uppercase tracking-wider">Active Coursework</span>
            <FileText className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {assignments.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Assignments assigned</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4 shadow-subtle">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Department Circulars</span>
            <Bell className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {departmentNotices.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Published notices</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Classes Today Widget */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {isShowingFutureDay
                  ? `${dayNames[nextTeachingDayNum]}'s Lectures (Next Scheduled Day)`
                  : "Today's Teaching Schedule"}
              </h3>
              <p className="text-xs text-slate-500">
                {isShowingFutureDay
                  ? `No remaining classes today (${todayName}). Displaying upcoming session roster.`
                  : `${todayClasses.length} scheduled lecture sessions for ${todayName}`}
              </p>
            </div>
            <Link
              to="/faculty/attendance"
              className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
            >
              <span>Roll Call Page</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {(isShowingFutureDay ? nextTeachingDayClasses : todayClasses).length === 0 ? (
            <div className="py-10 text-center border border-dashed border-border rounded-md bg-slate-50/50">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No lectures scheduled</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                No active timetable sessions allocated to your faculty account for this period.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(isShowingFutureDay ? nextTeachingDayClasses : todayClasses).map(cls => {
                const course = courseMap.get(cls.courseId);
                const code = cls.courseCode || course?.code || 'CRS';
                const name = cls.courseName || course?.name || 'Curriculum Course';

                return (
                  <div
                    key={cls.id}
                    className="p-3.5 rounded-lg border border-border bg-slate-50/50 hover:bg-white hover:border-teal-400/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {code}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          {name}
                        </span>
                        <Badge variant="slate" size="sm">
                          {cls.type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {cls.startTime} – {cls.endTime}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {cls.room}
                        </span>
                        {(cls.program || cls.semester) && (
                          <>
                            <span>•</span>
                            <span className="text-teal-800 font-sans font-medium">
                              {cls.program || 'All Programs'} {cls.semester ? `(Sem ${cls.semester})` : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ClipboardList className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/faculty/attendance?sessionId=${cls.id}`)}
                    >
                      Mark Roll Call
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {isShowingFutureDay && (
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5 border-t border-border">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Today's instruction period concluded. Showing upcoming lecture slots.</span>
            </div>
          )}
        </div>

        {/* Right: Department Circulars & Coursework Submissions */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Department Circulars & Notices</h3>
              <p className="text-xs text-slate-500">Official updates issued to students</p>
            </div>
            <Link
              to="/faculty/notices"
              className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
            >
              <span>Manage Circulars</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {departmentNotices.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-border rounded-md bg-slate-50/50">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No department circulars posted</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                Issue memos, lab schedule changes, or exam announcements to enrolled students.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                icon={<Plus className="w-3 h-3" />}
                onClick={() => navigate('/faculty/notices')}
              >
                Draft First Notice
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {departmentNotices.slice(0, 4).map(notice => (
                <div
                  key={notice.id}
                  className="p-3 rounded-md border border-border bg-slate-50/40 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 line-clamp-1">
                        {notice.title}
                      </span>
                      {notice.isPinned && (
                        <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-semibold">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {notice.content}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span>{notice.category}</span>
                      <span>•</span>
                      <span>{notice.publishedDate}</span>
                      <span>•</span>
                      <span>{notice.department}</span>
                    </div>
                  </div>

                  <Link
                    to="/faculty/notices"
                    className="text-xs font-medium text-teal-700 hover:text-teal-900 shrink-0 mt-0.5"
                  >
                    View
                  </Link>
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
