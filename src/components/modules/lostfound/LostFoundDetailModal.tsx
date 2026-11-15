import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { LostFoundItem } from '../../../types';
import { Badge } from '../../ui/Badge';
import { useApp } from '../../../context/AppContext';
import {
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Send,
  Lock,
  Image as ImageIcon
} from 'lucide-react';

export interface LostFoundDetailModalProps {
  item: LostFoundItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LostFoundDetailModal: React.FC<LostFoundDetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { toggleResolveItem, requestContact, user, student } = useApp();

  if (!item) return null;

  const currentUser = user || student;
  const isPoster =
    item.reportedBy.isCurrentUser ||
    (currentUser?.id && item.reportedBy.id === currentUser.id) ||
    (currentUser?.email && item.reportedBy.email === currentUser.email) ||
    (currentUser?.name && item.reportedBy.name.toLowerCase() === currentUser.name.toLowerCase());

  const isResolved = item.status === 'resolved';

  const handleResolve = () => {
    toggleResolveItem(item.id);
  };

  const handleRequestContact = () => {
    requestContact(item.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.title}
      subtitle={`Registry Item #LF-${item.id.slice(-6).toUpperCase()}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500">
            {isResolved ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Case marked as resolved
              </span>
            ) : (
              <span>{item.contactRequestsCount} contact request(s) initiated</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>

            {isPoster ? (
              <Button
                variant={isResolved ? 'outline' : 'primary'}
                size="sm"
                onClick={handleResolve}
              >
                {isResolved ? 'Re-open Listing' : 'Mark as Resolved'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={isResolved || item.hasUserRequestedContact}
                onClick={handleRequestContact}
                icon={
                  item.hasUserRequestedContact ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )
                }
              >
                {item.hasUserRequestedContact
                  ? 'Contact Requested'
                  : 'Request Contact'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Photo Display if Present */}
        {item.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-border bg-slate-100 max-h-60 flex items-center justify-center">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-56 object-cover"
            />
          </div>
        )}

        {/* Status & Type Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-border rounded-md text-xs">
          <div className="flex items-center gap-2">
            <Badge variant={item.type === 'lost' ? 'rose' : 'teal'} size="md">
              {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
            </Badge>
            <Badge variant="slate" size="md">
              {item.category}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            {isResolved ? (
              <Badge variant="emerald" size="sm" dot>
                Resolved ({item.resolvedAt || 'Recent'})
              </Badge>
            ) : (
              <Badge variant="amber" size="sm" dot>
                Active Inquiry
              </Badge>
            )}
          </div>
        </div>

        {/* Location and Date */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/60 border border-border rounded-md text-xs text-slate-700">
          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] font-medium">Location</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{item.location}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] font-medium">Date Reported</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{item.date}</span>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1 py-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Description & Characteristics
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-1">
            {item.description || 'No detailed description provided for this item.'}
          </p>
        </div>

        {/* Poster Identity Card (Privacy Safe: No phone numbers or emails) */}
        <div className="p-3 bg-slate-50 border border-border rounded-md text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <div>
              <p className="font-semibold text-slate-900">
                Posted by {item.reportedBy.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {isPoster ? 'This is your listing' : 'Verified College Student'}
              </p>
            </div>
          </div>

          {isPoster && (
            <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-medium">
              You are the poster
            </span>
          )}
        </div>

        {/* In-App Contact Request Explanation */}
        <div className="p-3 bg-teal-50/50 border border-teal-200/60 rounded-md text-xs text-teal-950 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-teal-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy-First Contact Exchange</span>
          </div>
          <p className="text-[11px] text-teal-900/80 leading-relaxed">
            Phone numbers and personal identifiers are strictly protected. When you click "Request Contact", the poster receives an in-app alert with your student verification token so you can coordinate handover in person on campus.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default LostFoundDetailModal;
