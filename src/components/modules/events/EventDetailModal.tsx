import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { CampusEvent } from '../../../types';
import { Badge } from '../../ui/Badge';
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
} from 'lucide-react';

export interface EventDetailModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isOpen, onClose }) => {
  const { timetable, courses, toggleEventRegistration } = useApp();

  if (!event) return null;

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const isFull = seatsLeft === 0 && !event.isRegistered;
  const capacityPct = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

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
      title={event.title}
      subtitle={`Campus Activity • ${event.category}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500">
            {event.isRegistered ? (
              <span className="text-teal-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                You hold an active pass for this event
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
              disabled={isFull && !event.isRegistered}
              onClick={handleToggle}
              className={event.isRegistered ? 'text-rose-600 hover:bg-rose-50 border-rose-200' : ''}
            >
              {event.isRegistered
                ? 'Cancel My Registration'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>
                Date: <strong className="font-mono text-slate-900 dark:text-slate-100">{event.date}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>
                Time: <strong className="font-mono text-slate-900 dark:text-slate-100">{event.startTime} – {event.endTime}</strong>
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
        <div className="p-3 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-md space-y-2">
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
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Event Overview & Guidelines
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-1">
            {event.description}
          </p>
        </div>

        {/* Registration Slip if Registered */}
        {event.isRegistered && (
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-md text-xs text-teal-900 flex items-center justify-between">
            <div>
              <p className="font-bold">E-Pass ID: {event.registrationId || 'REG-ACTIVE'}</p>
              <p className="text-[11px] text-teal-800">Pass holder: Aarav Sharma (22CS042)</p>
            </div>
            <UserCheck className="w-5 h-5 text-teal-700" />
          </div>
        )}
      </div>
    </Modal>
  );
};
