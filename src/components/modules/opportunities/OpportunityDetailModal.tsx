import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Opportunity } from '../../../types';
import { Badge } from '../../ui/Badge';
import { useApp } from '../../../context/AppContext';
import { analyzeSkillMatch } from '../../../utils/skillMatcher';
import {
  Calendar,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2
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
  const navigate = useNavigate();
  const { assignments, toggleSaveOpportunity, showToast } = useApp();

  if (!opportunity) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = opportunity.deadline < todayStr;

  const calculateDaysLeft = (deadlineStr: string) => {
    const d1 = new Date(todayStr).getTime();
    const d2 = new Date(deadlineStr).getTime();
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft(opportunity.deadline);

  // Analyze skill match with student's completed coding assignments
  const skillAnalysis = analyzeSkillMatch(opportunity, assignments);

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
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5"
          >
            <Bookmark
              className={`w-4 h-4 ${
                opportunity.isSaved ? 'fill-teal-700 text-teal-700 dark:fill-teal-400 dark:text-teal-400' : 'text-slate-400'
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
                className="px-3 py-1.5 text-xs font-semibold rounded inline-flex items-center gap-1.5 bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white transition-colors border border-[#8DA9C4]/30 shadow-sm"
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
        {/* Skill Prerequisite Alignment Card */}
        <div
          className={`p-4 rounded-lg border text-xs transition-all duration-200 ${
            !skillAnalysis.hasRequirements
              ? 'bg-slate-50 dark:bg-[#27272A]/50 border-slate-200 dark:border-[#27272A] text-slate-800 dark:text-slate-200'
              : skillAnalysis.isMatch
              ? 'bg-green-50 dark:bg-emerald-950/30 border-green-200 dark:border-emerald-800 text-green-900 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-1.5 font-bold tracking-tight">
              <span className="text-sm font-semibold">Skill Alignment Analysis</span>
              <span className="hidden" aria-hidden="true">✨ AI Skill Match</span>
            </div>

            {skillAnalysis.hasRequirements && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  skillAnalysis.isMatch
                    ? 'bg-green-200/60 dark:bg-emerald-900/50 text-green-800 dark:text-emerald-300'
                    : 'bg-amber-200/60 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                }`}
              >
                {skillAnalysis.isMatch ? 'Match Verified' : 'Gap Detected'}
              </span>
            )}
          </div>

          <p className="font-medium leading-relaxed">
            {skillAnalysis.message}
          </p>

          {/* Required skills tags and quick-link action */}
          {skillAnalysis.hasRequirements && (
            <div className="mt-3 pt-2.5 border-t border-current/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Role Skills:</span>
                {skillAnalysis.requiredSkills.map(skill => {
                  const isOwned = skillAnalysis.matchedSkills.includes(skill);
                  return (
                    <span
                      key={skill}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        isOwned
                          ? 'bg-green-100 dark:bg-emerald-900/40 text-green-800 dark:text-emerald-300 border border-green-300 dark:border-emerald-700'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      }`}
                    >
                      {isOwned ? (
                        <CheckCircle2 className="w-3 h-3 text-green-700 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                      )}
                      {skill}
                    </span>
                  );
                })}
              </div>

              {!skillAnalysis.isMatch && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/student/assignments');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors active:scale-95 shadow-sm"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Practice in Coding Lab</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Banner with Org, Mode, Compensation */}
        <div className="p-4 bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{opportunity.organization}</h4>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-[#27272A]">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-400 block font-semibold">
              Stipend / Prize Pool
            </span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {opportunity.stipendPrize || opportunity.compensation}
            </span>
          </div>
        </div>

        {/* Deadline Notice */}
        <div
          className={`p-3 rounded-md border text-xs flex items-center justify-between ${
            isExpired
              ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300'
              : daysLeft <= 2
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
              : 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-300'
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
              <span className="text-rose-700 dark:text-rose-400">Expired ({Math.abs(daysLeft)} days ago)</span>
            ) : daysLeft === 0 ? (
              <span className="text-amber-700 dark:text-amber-400">Closes Today!</span>
            ) : (
              <span>{daysLeft} days remaining</span>
            )}
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="space-y-1.5 p-3 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-md">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Eligibility & Prerequisites
          </h4>
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {opportunity.eligibility}
          </p>
        </div>

        {/* Role & Problem Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Description & Key Deliverables
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {opportunity.description}
          </p>
        </div>
      </div>
    </Modal>
  );
};
