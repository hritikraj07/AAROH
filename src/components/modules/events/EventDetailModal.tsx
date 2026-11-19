import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { CampusEvent } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { AcademicService } from '../../../services/academicService';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Building,
  UserCheck,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

export interface EventDetailModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isOpen, onClose }) => {
  const { timetable, courses, toggleEventRegistration } = useApp();
  const [activeItineraryTab, setActiveItineraryTab] = useState<number>(0);

  if (!event) return null;

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const isFull = seatsLeft === 0 && !event.isRegistered;
  const capacityPct = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  const todayStr = new Date().toISOString().split('T')[0];
  const eventStartDate = event.startDate || event.date;
  const eventEndDate = event.endDate || (
    event.itinerary && event.itinerary.length > 1 && event.itinerary[event.itinerary.length - 1].date.includes('20th')
      ? '2026-11-20'
      : eventStartDate
  );
  const isEventOngoing = todayStr >= eventStartDate && todayStr <= eventEndDate;
  const isEventPast = todayStr > eventEndDate;
  const isRegistrationClosed = isEventOngoing || isEventPast;

  // Clash check
  const clash = AcademicService.checkEventClash(
    event.date,
    event.startTime,
    event.endTime,
    timetable,
    courses
  );

  const handleToggle = () => {
    toggleEventRegistration(event.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <span>{event.title}</span>
          {isEventOngoing && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              Ongoing Event
            </span>
          )}
        </div>
      }
      subtitle={`Campus Activity • ${event.category} • ${event.venue}`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500">
            {event.isRegistered ? (
              <span className="text-teal-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                You hold an active pass for this event
              </span>
            ) : isRegistrationClosed ? (
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                {isEventOngoing ? 'Event currently in progress • Registrations Closed' : 'Event concluded'}
              </span>
            ) : isFull ? (
              <span className="text-rose-600 font-medium">All seats reserved</span>
            ) : (
              <span className="font-mono">{seatsLeft} seats remaining</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant={event.isRegistered ? 'outline' : 'primary'}
              size="sm"
              disabled={!event.isRegistered && (isFull || isRegistrationClosed)}
              onClick={handleToggle}
              className={event.isRegistered ? 'text-rose-600 hover:bg-rose-50 border-rose-200' : ''}
            >
              {event.isRegistered
                ? 'Cancel My Registration'
                : isRegistrationClosed
                ? 'Registrations Closed'
                : isFull
                ? 'Capacity Full'
                : 'Confirm Registration'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Class Clash Warning Banner */}
        {clash.hasClash && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">
                Academic Timetable Clash Detected!
              </p>
              <p className="mt-0.5 text-amber-900/90 leading-relaxed">
                This event timing overlaps directly with your scheduled class:{' '}
                <strong className="font-mono">{clash.clashingCourse?.code} - {clash.clashingCourse?.name}</strong>{' '}
                ({clash.clashingSession?.type} in {clash.clashingSession?.room} from {clash.clashingSession?.startTime} to {clash.clashingSession?.endTime}).
              </p>
              <p className="text-[11px] text-amber-800 mt-1">
                Attending without an approved On-Duty (OD) pass will affect your subject attendance percentage.
              </p>
            </div>
          </div>
        )}

        {/* Schedule & Venue Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-xl text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>
                Date: <strong className="font-mono text-slate-900 dark:text-slate-100">{event.event_date || event.date}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>
                Time Window: <strong className="font-mono text-slate-900 dark:text-slate-100">{event.time_window || `${event.startTime} - ${event.endTime}`}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>
                Venue: <strong className="text-slate-900 dark:text-slate-100">{event.venue}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Building className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>
                Organizer: <strong className="text-slate-900 dark:text-slate-100">{event.organizer}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="p-3 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Registration Capacity
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-slate-100">{event.registeredCount}</strong> / {event.capacity} Attendees ({capacityPct}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-[#111115] rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isFull ? 'bg-rose-500' : capacityPct > 80 ? 'bg-amber-500' : 'bg-teal-600'
              }`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Entry with Student ID barcode</span>
            <span className={isFull ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
              {isFull ? 'Housefull' : `${seatsLeft} spots available`}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Event Overview
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pt-0.5">
            {event.description}
          </p>
        </div>

        {/* Itinerary Section: Full Day 1 & Day 2 Schedule */}
        {event.itinerary && event.itinerary.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Hackathon Itinerary & Schedule</span>
              </h4>

              {/* Day Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111115] p-0.5 rounded-lg border border-slate-200 dark:border-[#27272A] text-xs">
                {event.itinerary.map((dayItem, idx) => (
                  <button
                    key={dayItem.day}
                    type="button"
                    onClick={() => setActiveItineraryTab(idx)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeItineraryTab === idx
                        ? 'bg-white dark:bg-[#18181B] text-teal-700 dark:text-teal-400 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {dayItem.day} ({dayItem.date.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>

            {/* Current Day Schedule Table */}
            {event.itinerary[activeItineraryTab] && (
              <div className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B]">
                <div className="bg-slate-50 dark:bg-[#111115] px-3.5 py-2 border-b border-slate-200 dark:border-[#27272A] flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {event.itinerary[activeItineraryTab].day} Schedule - {event.itinerary[activeItineraryTab].date}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {event.itinerary[activeItineraryTab].slots.length} Activities Planned
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-[#27272A] text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#111115]/50">
                        <th className="py-2 px-3.5 font-semibold w-40">Time Window</th>
                        <th className="py-2 px-3.5 font-semibold">Activity & Milestones</th>
                        <th className="py-2 px-3.5 font-semibold w-44">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                      {event.itinerary[activeItineraryTab].slots.map((slot, sIdx) => (
                        <tr key={sIdx} className="hover:bg-slate-50/80 dark:hover:bg-[#202025]/50 transition-colors">
                          <td className="py-2 px-3.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {slot.time}
                          </td>
                          <td className="py-2 px-3.5 text-slate-800 dark:text-slate-200 font-medium">
                            {slot.activity}
                          </td>
                          <td className="py-2 px-3.5 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span>{slot.location || event.venue}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mandatory Guidelines Section */}
        {event.guidelines && event.guidelines.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Mandatory Participation Guidelines (Strict Compliance Required)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {event.guidelines.map((guideline, gIdx) => (
                <div
                  key={gIdx}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-[#27272A] bg-slate-50/70 dark:bg-[#111115] flex items-start gap-2.5 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {gIdx + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {guideline}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registration Slip if Registered */}
        {event.isRegistered && (
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-teal-700 shrink-0" />
              <div>
                <p className="font-bold">E-Pass ID: {event.registrationId || 'REG-ACTIVE'}</p>
                <p className="text-[11px] text-teal-800">Pass verified for entry at Reception & Moot Court</p>
              </div>
            </div>
            <UserCheck className="w-5 h-5 text-teal-700" />
          </div>
        )}
      </div>
    </Modal>
  );
};
