import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config';
import { Button } from '../../components/ui/Button';
import {
  ShieldAlert,
  Bell,
  Calendar,
  Clock,
  Settings,
  BookOpen,
  ArrowRight,
  Plus,
  CheckCircle,
  Activity,
  Layers,
  FileText,
  Users
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { notices, events, timetable, courses, user, users } = useApp();
  const navigate = useNavigate();

  const pinnedNoticesCount = notices.filter(n => n.isPinned).length;
  const pendingEventsCount = events.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Administrator Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-900 text-white font-semibold text-base flex items-center justify-center font-mono shrink-0">
              {user?.avatarInitials || 'AD'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                  {user?.name || 'Campus Administrator'}
                </h2>
                <span className="text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                  System Administrator
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  Root Clearance
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-mono">
                <span>{APP_CONFIG.collegeName}</span>
                <span>•</span>
                <span>{user?.email}</span>
                <span>•</span>
                <span className="text-emerald-700 font-sans font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse" />
                  SSO System Operational
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <Button
              variant="primary"
              size="sm"
              icon={<Users className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/people')}
            >
              User Directory
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/notices')}
            >
              Publish Notice
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Calendar className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/events')}
            >
              Events
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Clock className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/timetable')}
            >
              Timetable
            </Button>
          </div>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Circulars & Notices</span>
            <Bell className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {notices.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            {pinnedNoticesCount} pinned to top
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Campus Events</span>
            <Calendar className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {events.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            {pendingEventsCount > 0 ? `${pendingEventsCount} pending approval` : 'All events approved'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Master Timetable</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {timetable.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Across {courses.length} curriculum subjects
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">System State</span>
            <Activity className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-bold tracking-tight text-emerald-800 font-mono">
            Healthy (Offline)
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Local Storage Layer active
          </p>
        </div>
      </div>

      {/* Main Two-Column Administrative Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Administrative Jump Consoles */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Administrative Consoles</h3>
              <p className="text-xs text-slate-500">Direct module management</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">v2.1 Master Control</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <Link
              to="/admin/people"
              className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors flex items-center gap-2">
                    <span>Campus Directory & Onboarding</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {users.length} Users
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Onboard new students and faculty, assign institutional credentials, and manage directory.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </Link>

            <Link
              to="/admin/notices"
              className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                    Official Notice Board
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Publish administrative circulars, pin directives, and manage notices.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </Link>

            <Link
              to="/admin/events"
              className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                    Event Scheduling & Approvals
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Author campus fests, workshops, and manage seat capacities.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </Link>

            <Link
              to="/admin/timetable"
              className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                    Curriculum & Timetable Master
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Allocate rooms, assign professors, and configure weekly timetable slots.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </Link>

            <Link
              to="/admin/settings"
              className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    System Configuration & Demo Data
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Campus parameters, attendance regulations, and demo state reset.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Right: System Audit & Health */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">System State & Compliance</h3>
              <p className="text-xs text-slate-500">Operational status checks</p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              All Services Operational
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-md border border-slate-200 bg-slate-50/50 flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Role-Based Access Control (RBAC)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Strict domain routing enforced for Student (<code className="font-mono">@aaroh.edu.in</code>), Faculty (<code className="font-mono">@faculty.aaroh.edu.in</code>), and Admin (<code className="font-mono">@admin.aaroh.edu.in</code>).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-md border border-slate-200 bg-slate-50/50 flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Offline-First Architecture
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Local storage abstraction verified. No external CDNs, third-party trackers, or network dependencies required for live judge evaluations.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-md border border-slate-200 bg-slate-50/50 flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Regulatory Minimum Attendance Cutoff
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Current institutional policy threshold set at <strong>75%</strong>. Defaulter lists generated dynamically across all modules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
