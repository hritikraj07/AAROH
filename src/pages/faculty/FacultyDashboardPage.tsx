import React, { useState } from 'react';
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
  ArrowRight,
  ClipboardList,
  Bell,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { EarlyWarningSystemCard } from '../../components/modules/faculty/EarlyWarningSystemCard';
import { PublishCodingLabSection } from '../../components/modules/faculty/PublishCodingLabSection';
import { CampusMap } from '../../components/modules/campus/CampusMap';
import { SmartResolveModal } from '../../components/modules/campus/SmartResolveModal';
import { CampusBuilding } from '../../types';

export const FacultyDashboardPage: React.FC = () => {
  const { user, users, courses, timetable, assignments, notices, attendance, showToast } = useApp();
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding>('Academic Blocks');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTriggerIntervention = (studentName: string) => {
    showToast({
      type: 'success',
      title: `Automated check-in email sent to ${studentName} and parent portal.`,
      message: 'Class coordinator intervention logged and dispatched.',
    });
  };

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Banner with Decorative Elements */}
      <div className="relative overflow-hidden bg-[#0F766E] bg-gradient-to-r from-[#134074] via-[#244970] to-[#355B82] border border-[#8DA9C4]/30 shadow-lg text-white rounded-3xl p-6 sm:p-10 transition-all duration-300 select-none">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full border-[20px] border-white/10 pointer-events-none" />
        <div className="absolute right-28 -top-16 w-52 h-52 rounded-full border-[14px] border-white/10 pointer-events-none" />
        <div className="absolute top-6 right-16 text-white/20 pointer-events-none select-none">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
        <div className="absolute bottom-8 right-52 text-white/15 pointer-events-none select-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/20 font-mono uppercase tracking-wider">
            <span>Faculty Portal • {APP_CONFIG.academicSession}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Welcome back, {user?.name || 'Dr. K. Ramanujam'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 font-normal leading-relaxed max-w-xl">
            {user?.department || 'Department of Computer Science & Engineering'} • Manage your lecture schedules, student roll calls, and coursework submissions.
          </p>

          <div className="pt-3 flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate('/faculty/attendance')}
              className="rounded-full bg-white text-teal-800 hover:bg-teal-50 text-xs px-4 py-2.5 min-h-[44px] font-semibold transition-colors active:scale-95 inline-flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Mark Roll Call</span>
            </button>
            <button
              onClick={() => navigate('/faculty/notices')}
              className="rounded-full bg-teal-800/80 hover:bg-teal-800 text-white border border-white/30 text-xs px-4 py-2.5 min-h-[44px] font-semibold transition-colors active:scale-95 inline-flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span>Post Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Class Coordinator Early Warning System: Intervention Required Panel */}
      <EarlyWarningSystemCard
        currentUser={user}
        users={users}
        attendance={attendance}
        assignments={assignments}
        onTriggerIntervention={handleTriggerIntervention}
      />

      {/* Quick Actions Row */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A] mb-3">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Quick Faculty Actions
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Faculty Task Suite</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/faculty/attendance')}
            className="p-3 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#0E0E11] hover:bg-teal-50/50 dark:hover:bg-[#27272A] hover:border-teal-300 dark:hover:border-teal-700 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-teal-100/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-2 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-teal-400">
                Mark Attendance
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Take class roll call
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/faculty/notices')}
            className="p-3 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#0E0E11] hover:bg-teal-50/50 dark:hover:bg-[#27272A] hover:border-teal-300 dark:hover:border-teal-700 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center mb-2 group-hover:bg-blue-700 group-hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-teal-400">
                Post Department Notice
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Issue academic memo
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/faculty/assignments')}
            className="p-3 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#0E0E11] hover:bg-teal-50/50 dark:hover:bg-[#27272A] hover:border-teal-300 dark:hover:border-teal-700 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-2 group-hover:bg-amber-700 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-teal-400">
                Manage Coursework
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Assignments & submissions
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/faculty/classes')}
            className="p-3 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#0E0E11] hover:bg-teal-50/50 dark:hover:bg-[#27272A] hover:border-teal-300 dark:hover:border-teal-700 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-900 dark:group-hover:text-teal-400">
                Assigned Courses
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Curriculum & syllabus
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Classes</span>
            <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {effectiveTimetable.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Weekly teaching sessions</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Lectures</span>
            <Clock className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {todayClasses.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{todayName} schedule</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Coursework</span>
            <FileText className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {assignments.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Assignments assigned</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Department Circulars</span>
            <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {departmentNotices.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Published notices</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Classes Today Widget */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {isShowingFutureDay
                  ? `${dayNames[nextTeachingDayNum]}'s Lectures (Next Scheduled Day)`
                  : "Today's Teaching Schedule"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isShowingFutureDay
                  ? `No remaining classes today (${todayName}). Displaying upcoming session roster.`
                  : `${todayClasses.length} scheduled lecture sessions for ${todayName}`}
              </p>
            </div>
            <Link
              to="/faculty/attendance"
              className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-1 hover:underline"
            >
              <span>Roll Call Page</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {(isShowingFutureDay ? nextTeachingDayClasses : todayClasses).length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 dark:border-[#27272A] rounded-xl bg-slate-50/50 dark:bg-[#0E0E11]">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No lectures scheduled</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
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
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#0E0E11] hover:bg-white dark:hover:bg-[#18181B] hover:border-teal-700 dark:hover:border-teal-500 transition-all duration-150 ease-in-out flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-teal-900 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          {code}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {name}
                        </span>
                        <Badge variant="slate" size="sm">
                          {cls.type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex-wrap">
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
                            <span className="text-teal-800 dark:text-teal-400 font-sans font-medium">
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
            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-t border-slate-200 dark:border-[#27272A]">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Today's instruction period concluded. Showing upcoming lecture slots.</span>
            </div>
          )}
        </div>

        {/* Right: Department Circulars & Coursework Submissions */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Department Circulars & Notices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official updates issued to students</p>
            </div>
            <Link
              to="/faculty/notices"
              className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-1 hover:underline"
            >
              <span>Manage Circulars</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {departmentNotices.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 dark:border-[#27272A] rounded-xl bg-slate-50/50 dark:bg-[#0E0E11]">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No department circulars posted</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
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
                  className="p-3 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/40 dark:bg-[#0E0E11] hover:bg-slate-50 dark:hover:bg-[#27272A]/50 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {notice.title}
                      </span>
                      {notice.isPinned && (
                        <span className="text-[10px] bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded font-semibold">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {notice.content}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      <span>{notice.category}</span>
                      <span>•</span>
                      <span>{notice.publishedDate}</span>
                      <span>•</span>
                      <span>{notice.department}</span>
                    </div>
                  </div>

                  <Link
                    to="/faculty/notices"
                    className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 shrink-0 mt-0.5"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Publish New Coding Lab Section & Lifecycle */}
      <PublishCodingLabSection />

      {/* Interactive Campus Map (Faculty View) */}
      <CampusMap
        onSelectBuilding={b => {
          setSelectedBuilding(b);
          setIsModalOpen(true);
        }}
      />

      {/* Smart Resolve Modal */}
      <SmartResolveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedBuilding={selectedBuilding}
      />
    </div>
  );
};

export default FacultyDashboardPage;
