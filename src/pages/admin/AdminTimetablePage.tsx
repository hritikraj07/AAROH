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
  BookOpen
} from 'lucide-react';
import { ClassSession, ClassType } from '../../types';

export const AdminTimetablePage: React.FC = () => {
  const { timetable, courses, createTimetableSession, deleteTimetableSession } = useApp();

  const [activeDay, setActiveDay] = useState<number>(1); // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('LH-101');
  const [faculty, setFaculty] = useState('Prof. Ramanujam');
  const [sessionType, setSessionType] = useState<ClassType>('Lecture');

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
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find(c => c.id === selectedCourseId) || courses[0];
    if (!course) return;

    createTimetableSession({
      courseId: course.id,
      dayOfWeek: Number(dayOfWeek) as 1 | 2 | 3 | 4 | 5 | 6,
      startTime,
      endTime,
      room: room.trim(),
      facultyName: faculty.trim(),
      type: sessionType,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Institutional Timetable Scheduler
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure weekly lecture halls, assign laboratory blocks, and manage master college timetables.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          disabled={courses.length === 0}
          onClick={() => {
            if (courses.length > 0 && !selectedCourseId) {
              setSelectedCourseId(courses[0].id);
            }
            setIsAddModalOpen(true);
          }}
        >
          Add Timetable Slot
        </Button>
      </div>

      {courses.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Prerequisite: No Curriculum Courses Found</span>
            Before creating timetable slots, please add active courses in the faculty curriculum.
          </div>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-border overflow-x-auto">
        {days.map(d => {
          const count = timetable.filter(s => s.dayOfWeek === d.num).length;
          return (
            <button
              key={d.num}
              onClick={() => setActiveDay(d.num)}
              className={`flex-1 min-w-[100px] py-2 px-3 text-xs font-medium rounded-md transition-colors text-center ${
                activeDay === d.num
                  ? 'bg-teal-700 text-white font-semibold shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div>{d.label}</div>
              <div
                className={`text-[10px] font-mono mt-0.5 ${
                  activeDay === d.num ? 'text-teal-100' : 'text-slate-400'
                }`}
              >
                {count} {count === 1 ? 'slot' : 'slots'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Timetable Grid / Table for Active Day */}
      {currentDaySessions.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-10 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">
            No lecture slots scheduled for {days.find(d => d.num === activeDay)?.label}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Click "Add Timetable Slot" to schedule lectures, laboratory sessions, or tutorial hours for this day.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            disabled={courses.length === 0}
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
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Hall / Room</th>
                  <th className="py-3 px-4">Faculty In-Charge</th>
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
                            {course?.code || 'CRS'}
                          </span>
                          <span className="font-medium text-slate-900">{course?.name || 'Curriculum Course'}</span>
                        </div>
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
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <div className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.room}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.facultyName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => deleteTimetableSession(slot.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
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
          <div className="bg-white border border-border rounded-lg shadow-modal max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-800" />
                <h3 className="text-sm font-semibold text-slate-900">Add Timetable Slot</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Curriculum Course <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
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

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={e => setRoom(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty In-Charge
                </label>
                <input
                  type="text"
                  required
                  value={faculty}
                  onChange={e => setFaculty(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
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
                  Save Timetable Slot
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
