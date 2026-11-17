import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { CampusBuilding } from '../../../types';
import { analyzeFacilityComplaint, FACILITY_AI_SYSTEM_PROMPT } from '../../../utils/smartResolveAI';
import {
  X,
  Sparkles,
  Lock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Send,
} from 'lucide-react';

export interface SmartResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBuilding: CampusBuilding | string;
}

export const SmartResolveModal: React.FC<SmartResolveModalProps> = ({
  isOpen,
  onClose,
  selectedBuilding,
}) => {
  const { user, createCampusTicket } = useApp();
  const [complaintText, setComplaintText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<{
    category: string;
    priority: string;
    summary: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setComplaintText('');
      setAnalyzedResult(null);
      setIsSubmitting(false);
    }
  }, [isOpen, selectedBuilding]);

  if (!isOpen) return null;

  // Custom 4-layer tactile button shadow constants
  const exactLightShadow =
    'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
  const exactDarkShadow =
    'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
  const exactLightHover =
    'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
  const exactDarkHover =
    'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

  const sampleSuggestions = [
    'No water on the 3rd floor washroom',
    'Projector broken in Room 204',
    'AC tripping electrical power socket',
    'Library digital portal WiFi down',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Analyze with hidden strict Gemini system prompt
      const aiAnalysis = await analyzeFacilityComplaint(complaintText.trim(), selectedBuilding);
      setAnalyzedResult(aiAnalysis);

      // 2. Persist to global campusTickets in localStorage
      createCampusTicket({
        location: selectedBuilding,
        description: complaintText.trim(),
        category: aiAnalysis.category,
        priority: aiAnalysis.priority,
        summary: aiAnalysis.summary,
        submitterRole: user?.role || 'student',
        submitterId: user?.id,
        submitterName: user?.name,
      });

      // Brief confirmation view before closing
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit facility ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden select-none font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <Sparkles className="w-5 h-5 text-[#0F766E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Smart Resolve
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 font-semibold">
                  AI Orchestrated
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated facility dispatch & complaint triage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* 1. Auto-Location Logic: Pre-filled and LOCKED */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
              Target Campus Location (Auto-Locked)
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 pointer-events-none">
                <Building2 className="w-4 h-4 text-[#0F766E]" />
              </div>
              <input
                type="text"
                readOnly
                disabled
                value={selectedBuilding}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 font-bold cursor-not-allowed select-none opacity-90 shadow-inner"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 pointer-events-none">
                <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Locked</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              Auto-selected based on interactive campus map coordinates.
            </p>
          </div>

          {/* 2. Textarea Complaint Input */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
              Infrastructure Issue Description
            </label>
            <textarea
              required
              rows={4}
              value={complaintText}
              onChange={e => setComplaintText(e.target.value)}
              placeholder="Describe the issue in detail (e.g. No water on the 3rd floor washroom, or Projector broken in Room 204)..."
              className="w-full p-3.5 bg-white dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setComplaintText(suggestion)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#202026] dark:hover:bg-[#272730] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 transition-colors cursor-pointer text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* AI Live Output Preview */}
          {analyzedResult && (
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-teal-800 dark:text-teal-300">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                  AI Triage Completed
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                  {analyzedResult.priority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Summary:</span>{' '}
                {analyzedResult.summary} • <span className="font-semibold">Category:</span>{' '}
                {analyzedResult.category}
              </p>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-4 py-2 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>

            {/* Custom 4-layer tactile button shadow applied */}
            <button
              type="submit"
              disabled={isSubmitting || !complaintText.trim()}
              className={`rounded-full bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] text-white text-xs px-5 py-2.5 font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing Complaint...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartResolveModal;
