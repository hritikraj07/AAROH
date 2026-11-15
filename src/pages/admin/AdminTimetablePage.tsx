import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  Building,
  User,
  X,
  BookOpen,
  Filter,
  GraduationCap
} from 'lucide-react';
import { ClassSession, ClassType } from '../../types';

export const AdminTimetablePage: React.FC = () => {
  const { timetable, courses, users, createTimetableSession, deleteTimetableSession } = useApp();

  const [activeDay, setActiveDay] = useState<number>(1); // 1=Mon ... 6=Sat
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [programFilter, setProgramFilter] = useState<string>('all');

  // Filter existing faculty members from users directory
  const facultyMembers = users.filter(u => u.role === 'faculty');

  // Form State
  const [subjectMode, setSubjectMode] = useState<'select' | 'custom'>(courses.length > 0 ? 'select' : 'custom');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [customSubjectCode, setCustomSubjectCode] = useState('');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [room, setRoom] = useState('LH-101');
  const [selectedFacultyEmail, setSelectedFacultyEmail] = useState<string>(facultyMembers[0]?.email || 'prof.raman@faculty.aaroh.edu.in');
  const [customFacultyName, setCustomFacultyName] = useState('Prof. K. Ramanujam');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [sessionType, setSessionType] = useState<ClassType>('Lecture');
  const [program, setProgram] = useState('B.Tech CSE');
  const [semester, setSemester] = useState<number>(5);

  const days = [
    { num: 1, label: 'Monday', short: 'Mon' },
    { num: 2, label: 'Tuesday', short: 'Tue' },
    { num: 3, label: 'Wednesday', short: 'Wed' },
    { num: 4, label: 'Thursday', short: 'Thu' },
    { num: 5, label: 'Friday', short: 'Fri' },
    { num: 6, label: 'Saturday', short: 'Sat' },
  ];

  const currentDaySessions = timetable
    .filter(s => s.dayOfWeek === activeDay)
    .filter(s => {
      if (programFilter === 'all') return true;
      return s.program?.toLowerCase().includes(programFilter.toLowerCase());
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();

    let courseId = '';
    let courseCode = '';
    let courseName = '';

    if (subjectMode === 'select' && courses.length > 0) {
      const selected = courses.find(c => c.id === selectedCourseId) || courses[0];
      courseId = selected.id;
      courseCode = selected.code;
      courseName = selected.name;
    } else {
      courseCode = customSubjectCode.trim().toUpperCase() || 'CS301';
      courseName = customSubjectName.trim() || courseCode;
      courseId = `crs_${courseCode.toLowerCase()}`;
    }

    const assignedFaculty = facultyMembers.find(f => f.email === selectedFacultyEmail);
    const facultyName = assignedFaculty ? assignedFaculty.name : customFacultyName.trim();
    const facultyEmail = assignedFaculty ? assignedFaculty.email : selectedFacultyEmail;

    createTimetableSession({
      courseId,
      courseCode,
      courseName,
      dayOfWeek: Number(dayOfWeek) as 1 | 2 | 3 | 4 | 5 | 6,
      startTime,
      endTime,
      room: room.trim() || 'LH-101',
      facultyName,
      facultyEmail,
      type: sessionType,
      program: program.trim() || 'B.Tech CSE',
      semester: Number(semester) || 5,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Institutional Master Timetable
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure lecture halls, assign teachers to subjects, and establish weekly schedules for target student cohorts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => {
            setDayOfWeek(activeDay);
            setIsAddModalOpen(true);
          }}
        >
          Add Timetable Entry
        </Button>
      </div>

      {/* Program Filter Bar & Day Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-border">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {days.map(d => {
            const count = timetable.filter(s => s.dayOfWeek === d.num).length;
            return (
              <button
                key={d.num}
                onClick={() => setActiveDay(d.num)}
                className={`py-1.5 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeDay === d.num
                    ? 'bg-teal-700 text-white font-semibold shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-border'
                }`}
              >
                <span>{d.label}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded-full ${
                    activeDay === d.num ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={programFilter}
            onChange={e => setProgramFilter(e.target.value)}
            className="text-xs font-mono px-3 py-1.5 bg-slate-50 border border-border rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          >
            <option value="all">All Cohorts ({timetable.length} slots)</option>
            <option value="B.Tech CSE">B.Tech CSE</option>
            <option value="B.Tech ECE">B.Tech ECE</option>
            <option value="B.Sc IT">B.Sc IT</option>
          </select>
        </div>
      </div>

      {/* Timetable Table for Active Day */}
      {currentDaySessions.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-10 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">
            No lecture slots scheduled for {days.find(d => d.num === activeDay)?.label}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Click "Add Timetable Entry" to schedule lectures, laboratory sessions, or tutorial hours for this day.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setDayOfWeek(activeDay);
              setIsAddModalOpen(true);
            }}
          >
            Schedule Slot
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-500 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Hall / Room</th>
                  <th className="py-3 px-4">Faculty Assigned</th>
                  <th className="py-3 px-4">Target Audience</th>
                  <th className="py-3 px-4">Session Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentDaySessions.map(slot => {
                  const course = courses.find(c => c.id === slot.courseId);
                  return (
                    <tr key={slot.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-900 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                            {slot.courseCode || course?.code || 'CRS'}
                          </span>
                          <span className="font-medium text-slate-900">
                            {slot.courseName || course?.name || 'Curriculum Subject'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <div className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.room}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.facultyName}</span>
                        </div>
                        {slot.facultyEmail && (
                          <div className="text-[10px] text-slate-400 font-mono pl-4.5">
                            {slot.facultyEmail}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-[10px] font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          {slot.program || 'B.Tech CSE'} • Sem {slot.semester || 5}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                            slot.type === 'Lab'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold'
                              : slot.type === 'Tutorial'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {slot.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => deleteTimetableSession(slot.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
                          title="Remove session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-lg shadow-modal max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-800" />
                <h3 className="text-sm font-semibold text-slate-900">Add Master Timetable Entry</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSession} className="space-y-4">
              {/* Subject Selection / Creation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Subject & Curriculum Course <span className="text-rose-600">*</span>
                  </label>
                  {courses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSubjectMode(prev => prev === 'select' ? 'custom' : 'select')}
                      className="text-[11px] text-teal-700 hover:underline font-mono"
                    >
                      {subjectMode === 'select' ? '+ Enter New Subject' : 'Select Existing Course'}
                    </button>
                  )}
                </div>

                {subjectMode === 'select' && courses.length > 0 ? (
                  <select
                    value={selectedCourseId}
                    onChange={e => setSelectedCourseId(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Code (e.g. CS301)"
                        value={customSubjectCode}
                        onChange={e => setCustomSubjectCode(e.target.value)}
                        className="w-full text-xs font-mono uppercase px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Subject Title (e.g. Operating Systems)"
                        value={customSubjectName}
                        onChange={e => setCustomSubjectName(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Faculty Assigned Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Assigned <span className="text-rose-600">*</span>
                </label>
                {facultyMembers.length > 0 ? (
                  <select
                    value={selectedFacultyEmail}
                    onChange={e => setSelectedFacultyEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {facultyMembers.map(f => (
                      <option key={f.id} value={f.email}>
                        {f.name} ({f.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. K. Ramanujam"
                    value={customFacultyName}
                    onChange={e => setCustomFacultyName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Only assigned faculty will see this lecture in their faculty dashboard and attendance logger.
                </p>
              </div>

              {/* Day and Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Day of the Week <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {days.map(d => (
                      <option key={d.num} value={d.num}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room / Lecture Hall <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LH-101 or CS Lab 2"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={sessionType}
                    onChange={e => setSessionType(e.target.value as ClassType)}
                    className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Laboratory</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              {/* Target Audience: Program & Semester */}
              <div className="p-3 bg-slate-50 border border-border rounded-md space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-900">
                  Target Student Audience (Cohort)
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Program <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={program}
                      onChange={e => setProgram(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                    >
                      <option value="B.Tech CSE">B.Tech Computer Science</option>
                      <option value="B.Tech ECE">B.Tech Electronics & Comm.</option>
                      <option value="B.Sc IT">B.Sc Information Tech</option>
                      <option value="M.Tech">M.Tech AI & Data Science</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Semester <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={semester}
                      onChange={e => setSemester(Number(e.target.value))}
                      className="w-full text-xs font-mono px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Only enrolled students matching this Program and Semester will see this class on their timetable and dashboard.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Timetable Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimetablePage;
