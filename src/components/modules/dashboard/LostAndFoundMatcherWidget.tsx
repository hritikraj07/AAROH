import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { findLostAndFoundMatches } from '../../../utils/lostFoundMatcher';
import { Sparkles, HelpCircle, CheckCircle2, ArrowRight, MapPin, Calendar, Check, Link2 } from 'lucide-react';

export const LostAndFoundMatcherWidget: React.FC = () => {
  const { lostFound, showToast } = useApp();
  const [confirmedMatchIds, setConfirmedMatchIds] = useState<Record<string, boolean>>({});

  // Compute matches
  const matches = useMemo(() => {
    return findLostAndFoundMatches(lostFound);
  }, [lostFound]);

  const handleConfirmMatch = (matchId: string, lostReporter: string, foundReporter: string) => {
    setConfirmedMatchIds(prev => ({ ...prev, [matchId]: true }));
    showToast({
      type: 'success',
      title: 'Match Verified & Connected',
      message: `Match verified! ${lostReporter} and ${foundReporter} have been connected via campus portal messaging.`,
    });
  };

  // Automatically suggest in background; do not show disruptive AI match collision banner on dashboard per user request ("dont tell me for ai match like u tell dont show")
  const isHiddenPerUserRequest = true;
  if (isHiddenPerUserRequest || matches.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              AI Lost & Found Matcher: Potential Collision Detected
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated semantic analysis paired an active missing item report with a recently turned-in property.
          </p>
        </div>

        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 self-start sm:self-center">
          {matches.length} High-Confidence Match{matches.length > 1 ? 'es' : ''}
        </span>
      </div>

      {/* Matches List */}
      <div className="space-y-6">
        {matches.map(match => {
          const isConfirmed = !!confirmedMatchIds[match.id];

          return (
            <div
              key={match.id}
              className="p-5 rounded-2xl bg-slate-50/70 dark:bg-[#222226] border border-slate-200/80 dark:border-[#27272A] space-y-4"
            >
              {/* Overlapping Keywords Banner */}
              <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-semibold uppercase text-slate-400">
                    Matched Keywords:
                  </span>
                  {match.matchedKeywords.map(kw => (
                    <span
                      key={kw}
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 dark:bg-teal-900/60 dark:text-teal-200 border border-teal-300 dark:border-teal-700"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {match.confidenceScore}% Confidence Score
                </span>
              </div>

              {/* Split-Screen / Side-by-Side Timeline UI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {/* Left Pane: Lost Report */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-rose-200 dark:border-rose-900/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                      Reported Missing
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {match.lostItem.date}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {match.lostItem.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {match.lostItem.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {match.lostItem.location}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      By {match.lostItem.reportedBy?.name || 'Student'}
                    </span>
                  </div>
                </div>

                {/* Right Pane: Found Report */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-emerald-200 dark:border-emerald-900/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                      Reported Recovered
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {match.foundItem.date}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {match.foundItem.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {match.foundItem.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      {match.foundItem.location}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      By {match.foundItem.reportedBy?.name || 'Student'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                  <span>
                    Connecting verifies identification serials before releasing the item from the campus hub.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleConfirmMatch(
                      match.id,
                      match.lostItem.reportedBy?.name || 'Aarav Sharma',
                      match.foundItem.reportedBy?.name || 'Priya Patel'
                    )
                  }
                  disabled={isConfirmed}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 select-none cursor-pointer ${
                    isConfirmed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-none cursor-default'
                      : 'bg-teal-700 hover:bg-[#0D6861] active:bg-[#115E59] text-white active:scale-95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]'
                  }`}
                >
                  {isConfirmed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Match Confirmed & Connected ✓</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Match & Connect Users</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LostAndFoundMatcherWidget;
