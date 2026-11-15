import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Opportunity } from '../../../types';
import { Badge } from '../../ui/Badge';
import { useApp } from '../../../context/AppContext';
import {
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  isOpen,
  onClose,
}) => {
  const { toggleSaveOpportunity, showToast } = useApp();

  if (!opportunity) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = opportunity.deadline < todayStr;

  const calculateDaysLeft = (deadlineStr: string) => {
    const d1 = new Date(todayStr).getTime();
    const d2 = new Date(deadlineStr).getTime();
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft(opportunity.deadline);

  const handleApply = () => {
    showToast({
      type: 'info',
      title: 'Application Portal Gateway',
      message: `Simulating redirect to ${opportunity.organization}'s official application form.`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={opportunity.title}
      subtitle={`${opportunity.organization} • ${opportunity.type}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => toggleSaveOpportunity(opportunity.id)}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <Bookmark
              className={`w-4 h-4 ${
                opportunity.isSaved ? 'fill-teal-700 text-teal-700' : 'text-slate-400'
              }`}
            />
            <span>{opportunity.isSaved ? 'Saved to Bookmarks' : 'Save for Later'}</span>
          </button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            {isExpired ? (
              <Button variant="primary" size="sm" disabled>
                Applications Closed
              </Button>
            ) : (
              <a
                href={opportunity.applyLink || opportunity.applyUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold rounded inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-subtle"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner with Org, Mode, Compensation */}
        <div className="p-4 bg-slate-50 border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  opportunity.type === 'Internship'
                    ? 'teal'
                    : opportunity.type === 'Hackathon'
                    ? 'blue'
                    : 'indigo'
                }
                size="md"
              >
                {opportunity.type}
              </Badge>
              <Badge variant="slate" size="md">
                {opportunity.mode}
              </Badge>
            </div>
            <h4 className="text-base font-bold text-slate-900">{opportunity.organization}</h4>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
              Stipend / Prize Pool
            </span>
            <span className="text-sm font-bold text-emerald-700 font-mono">
              {opportunity.stipendPrize || opportunity.compensation}
            </span>
          </div>
        </div>

        {/* Deadline Notice */}
        <div
          className={`p-3 rounded-md border text-xs flex items-center justify-between ${
            isExpired
              ? 'bg-rose-50/50 border-rose-200 text-rose-900'
              : daysLeft <= 2
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-teal-50/40 border-teal-200 text-teal-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              Application Deadline: <strong className="font-mono">{opportunity.deadline}</strong>
            </span>
          </div>

          <div className="font-semibold font-mono">
            {isExpired ? (
              <span className="text-rose-700">Expired ({Math.abs(daysLeft)} days ago)</span>
            ) : daysLeft === 0 ? (
              <span className="text-amber-700">Closes Today!</span>
            ) : (
              <span>{daysLeft} days remaining</span>
            )}
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="space-y-1.5 p-3 bg-white border border-border rounded-md">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Eligibility & Prerequisites
          </h4>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {opportunity.eligibility}
          </p>
        </div>

        {/* Role & Problem Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Description & Key Deliverables
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {opportunity.description}
          </p>
        </div>
      </div>
    </Modal>
  );
};
