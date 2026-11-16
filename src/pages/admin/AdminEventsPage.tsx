import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  MapPin,
  Clock,
  Users,
  Search,
  X,
  Filter
} from 'lucide-react';
import { CampusEvent, EventCategory } from '../../types';

export const AdminEventsPage: React.FC = () => {
  const { events, createEvent, deleteEvent } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Tech');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');
  const [venue, setVenue] = useState('Auditorium Hall A');
  const [organizer, setOrganizer] = useState('Campus Technical Council');
  const [capacity, setCapacity] = useState<number>(120);
  const [description, setDescription] = useState('');

  const categories: (EventCategory | 'all')[] = [
    'all',
    'Tech',
    'Cultural',
    'Sports',
    'Workshops',
    'Clubs',
  ];

  const filteredEvents = events.filter(e => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    createEvent({
      title: title.trim(),
      category,
      date,
      startTime,
      endTime,
      venue: venue.trim(),
      organizer: organizer.trim(),
      capacity: Number(capacity) || 100,
      description: description.trim() || 'Official university sanctioned event open to all students.',
      status: 'approved',
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
            Campus Events & Approvals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule college fests, verify club workshops, and oversee seat reservations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Create Event
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#18181B] p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, venues..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors whitespace-nowrap capitalize ${selectedCategory === cat
                  ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold dark:bg-[#0F766E] dark:text-white dark:border-teal-700'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-[#111115] dark:border-[#27272A] dark:text-slate-300 dark:hover:bg-[#202025]'
                }`}
            >
              {cat === 'all' ? 'All Events' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-10 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No events found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {searchQuery || selectedCategory !== 'all'
              ? 'No events match your current filter parameters.'
              : 'There are currently no active campus events scheduled. Create a new event to publish it to student rosters.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Create First Event
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#111115] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Host / Organizer</th>
                  <th className="py-3 px-4">Seat Capacity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{event.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {event.description}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        {event.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      <div>{event.date}</div>
                      <div className="text-[11px] text-slate-400">{event.startTime} - {event.endTime}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {event.organizer}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-semibold text-slate-900">{event.registeredCount}</span>
                      <span className="text-slate-400"> / {event.capacity}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                        Approved
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-800 dark:text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create Campus Event</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Hackathon 2026: Build the Future"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as EventCategory)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Clubs">Clubs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditorium Hall A"
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={10}
                    max={2000}
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organizer / Host
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of CSE & IEEE Student Branch"
                  value={organizer}
                  onChange={e => setOrganizer(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Description & Registration Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Event agenda, keynote speaker details, prerequisites, and instructions..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 resize-none"
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
                  Publish Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;
