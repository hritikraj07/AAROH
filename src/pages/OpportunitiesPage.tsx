import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Opportunity, OpportunityMode, OpportunityType } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { OpportunityDetailModal } from '../components/modules/opportunities/OpportunityDetailModal';
import { TeammateRadar } from '../components/modules/opportunities/TeammateRadar';
import {
  Briefcase,
  Bookmark,
  Search,
  ExternalLink,
  Users,
  UserPlus,
  CheckCircle2,
  Loader2,
  Trophy,
  MapPin,
  Clock,
  Gamepad2,
  ArrowRight,
  Globe
} from 'lucide-react';
import { User } from '../types';
import { findStudyPartnerMatch } from '../utils/teamMatchmaker';

export const OpportunitiesPage: React.FC = () => {
  const { opportunities, toggleSaveOpportunity, user, users, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Smart Team Matchmaker State
  const [matchedStudent, setMatchedStudent] = useState<User | null>(null);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [matchAttempted, setMatchAttempted] = useState(false);
  const [connectRequested, setConnectRequested] = useState(false);

  const handleMatchMe = () => {
    setIsSearchingMatch(true);
    setConnectRequested(false);
    setTimeout(() => {
      const match = findStudyPartnerMatch(user, users);
      setMatchedStudent(match);
      setMatchAttempted(true);
      setIsSearchingMatch(false);
    }, 600);
  };

  const handleRequestConnect = (studentName: string) => {
    setConnectRequested(true);
    showToast({
      type: 'success',
      title: 'Connection Request Sent',
      message: `Request sent to ${studentName}! They will be notified via campus email.`,
    });
  };

  // Views: "Browse" or "Saved"
  const [viewTab, setViewTab] = useState<'browse' | 'saved'>('browse');

  // Filters & Sorting
  const [typeFilter, setTypeFilter] = useState<'All' | OpportunityType>('All');
  const [modeFilter, setModeFilter] = useState<'All' | OpportunityMode>('All');
  const [sortOrder, setSortOrder] = useState<'closest' | 'furthest'>('closest');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Sync with ?id=
  const idFromUrl = searchParams.get('id');
  useEffect(() => {
    if (idFromUrl) {
      const match = opportunities.find(o => o.id === idFromUrl);
      if (match) setSelectedOpportunity(match);
    }
  }, [idFromUrl, opportunities]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute days left from today
  const calculateDaysLeft = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const types: ('All' | OpportunityType)[] = ['All', 'Internship', 'Hackathon'];
  const modes: ('All' | OpportunityMode)[] = ['All', 'Remote', 'On-site'];

  const savedCount = useMemo(() => opportunities.filter(o => o.isSaved).length, [opportunities]);

  // Filter and sort opportunities (active first, expired always forced to bottom)
  const { displayOpportunities, activeCount, expiredCount } = useMemo(() => {
    // 1. Filter by tab, type, mode, search
    const filtered = opportunities.filter(opp => {
      // Saved view
      if (viewTab === 'saved' && !opp.isSaved) return false;

      // Type filter
      if (typeFilter !== 'All' && opp.type !== typeFilter) return false;

      // Mode filter
      if (modeFilter !== 'All' && opp.mode !== modeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchOrg = opp.organization.toLowerCase().includes(q);
        const matchDesc = opp.description?.toLowerCase().includes(q);
        const matchElig = opp.eligibility.toLowerCase().includes(q);
        const matchStipend = (opp.stipendPrize || opp.compensation || '').toLowerCase().includes(q);
        const matchVenue = opp.venue?.toLowerCase().includes(q);
        const matchTags = opp.tags?.some(t => t.toLowerCase().includes(q));
        const matchTracks = opp.tracks?.some(t => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
        const matchSub = opp.categorySubtitle?.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchDesc && !matchElig && !matchStipend && !matchVenue && !matchTags && !matchTracks && !matchSub) return false;
      }

      return true;
    });

    // 2. Separate active vs expired
    const active: Opportunity[] = [];
    const expired: Opportunity[] = [];

    filtered.forEach(o => {
      const days = calculateDaysLeft(o.deadline);
      if (days < 0) {
        expired.push(o);
      } else {
        active.push(o);
      }
    });

    // 3. Sort active opportunities according to sortOrder
    active.sort((a, b) => {
      if (sortOrder === 'closest') {
        return a.deadline.localeCompare(b.deadline);
      } else {
        return b.deadline.localeCompare(a.deadline);
      }
    });

    // Sort expired opportunities (most recently expired first)
    expired.sort((a, b) => b.deadline.localeCompare(a.deadline));

    // Force expired opportunities to the very bottom regardless of active sort order
    return {
      displayOpportunities: [...active, ...expired],
      activeCount: active.length,
      expiredCount: expired.length,
    };
  }, [opportunities, viewTab, typeFilter, modeFilter, sortOrder, searchQuery, todayStr]);

  const handleOpenDetail = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setSearchParams({ id: opp.id });
  };

  const handleCloseDetail = () => {
    setSelectedOpportunity(null);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Opportunity Board
          </h2>
        </div>

        {/* View Switcher: "Browse" vs "Saved" */}
        <div className="flex items-center bg-slate-100 dark:bg-[#111115] p-1 rounded-xl border border-slate-200/80 dark:border-[#27272A] text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewTab('browse')}
            className={`relative px-3.5 py-1.5 rounded-lg transition-all duration-150 font-medium active:scale-[0.97] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/40 ${
              viewTab === 'browse'
                ? 'text-slate-900 dark:text-slate-100 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {viewTab === 'browse' && (
              <motion.div
                layoutId="oppViewTab"
                className="absolute inset-0 bg-white dark:bg-[#18181B] rounded-lg shadow-xs z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Browse ({opportunities.length})</span>
          </button>
          <button
            onClick={() => setViewTab('saved')}
            className={`relative px-3.5 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 font-medium active:scale-[0.97] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]/40 ${
              viewTab === 'saved'
                ? 'text-teal-900 dark:text-teal-100 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {viewTab === 'saved' && (
              <motion.div
                layoutId="oppViewTab"
                className="absolute inset-0 bg-teal-50 dark:bg-teal-900/40 border border-teal-200/80 dark:border-teal-800/60 rounded-lg shadow-xs z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Bookmark className={`relative z-10 w-3.5 h-3.5 ${viewTab === 'saved' ? 'fill-teal-700 text-teal-700 dark:text-teal-400 dark:fill-teal-400' : ''}`} />
            <span className="relative z-10">Saved</span>
            {savedCount > 0 && (
              <span
                className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-mono ${
                  viewTab === 'saved' ? 'bg-teal-200 dark:bg-teal-800 text-teal-900 dark:text-teal-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 1. Find a Team / Study Partner Matchmaker (Placed ABOVE search bar per user specification) */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 sm:p-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#134074] dark:text-[#8DA9C4]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Find a Team & Study Partner Matchmaker
              </h3>
              <span className="text-[10px] font-semibold text-[#134074] dark:text-[#8DA9C4] bg-[#EEF4ED] dark:bg-[#18181B] border border-[#8DA9C4]/30 px-2 py-0.5 rounded font-mono">
                AI MATCHMAKER
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Match with fellow students in your cohort ({user?.program || 'B.Tech CSE'} • Semester {user?.semester || 5}) for hackathons and collaborative projects.
            </p>
          </div>

          <button
            onClick={handleMatchMe}
            disabled={isSearchingMatch}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 active:scale-95 transition-all duration-150 rounded-xl select-none shrink-0 disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {isSearchingMatch ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning cohort...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 text-[#8DA9C4]" />
                <span>Match Me</span>
              </>
            )}
          </button>
        </div>

        {/* Matched Student Profile Card */}
        {matchedStudent && (
          <div className="mt-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#134074] text-white font-bold text-sm flex items-center justify-center shrink-0 font-mono">
                  {matchedStudent.avatarInitials || 'ST'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {matchedStudent.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-[#134074] dark:text-[#8DA9C4] bg-[#EEF4ED] dark:bg-[#18181B] border border-[#8DA9C4]/30 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                      <span>Cohort Match</span>
                      <span className="hidden" aria-hidden="true">✨ AI Matched</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded">
                      {matchedStudent.rollNumber || 'ID Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {matchedStudent.program} • Semester {matchedStudent.semester} ({matchedStudent.section || 'Section A'}) • {matchedStudent.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => handleRequestConnect(matchedStudent.name)}
                  disabled={connectRequested}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border active:scale-95 transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                    connectRequested
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 cursor-default'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {connectRequested ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Request Sent</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-[#134074] dark:text-[#8DA9C4]" />
                      <span>Request to Connect</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {matchAttempted && !matchedStudent && !isSearchingMatch && (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/30 text-center text-xs text-slate-600 dark:text-slate-400 animate-in fade-in duration-200">
            <p className="font-semibold text-slate-800 dark:text-slate-200">No other matching peers found yet in {user?.program} Semester {user?.semester}.</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">As more classmates onboard in your program, our matchmaker will automatically discover compatible study partners.</p>
          </div>
        )}
      </div>

      {/* 2. Filter and Search Controls Bar (Mode and Sort removed per user specification) */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 space-y-3.5">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1 font-mono">
            Type:
          </span>
          {types.map(t => {
            const isSelected = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-2 min-h-[40px] text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer font-medium flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#134074] text-white font-semibold shadow-sm border border-[#8DA9C4]/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative pt-1 border-t border-slate-200 dark:border-[#27272A]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by role title, hosting company, eligibility, or stipend keywords..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#134074]"
          />
        </div>
      </div>

      {/* Teammate Radar: Complementary skills based on Automated Coding Labs */}
      <TeammateRadar />

      {/* Opportunities List / Dense Grid */}
      {displayOpportunities.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-white/5 dark:text-slate-400 rounded-2xl p-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-400 dark:text-teal-400 mb-3 border border-slate-200 dark:border-white/5">
            <Briefcase className="w-5 h-5 text-slate-400 dark:text-teal-400" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {viewTab === 'saved'
              ? 'No saved opportunities'
              : opportunities.length === 0
              ? 'No active opportunities posted yet.'
              : 'No matching opportunities found'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
            {viewTab === 'saved'
              ? 'Bookmark internships, hackathons, or fellowships in the Browse tab to review them here.'
              : opportunities.length === 0
              ? 'Verified industry opportunities, hackathons, and research fellowships will appear here once published.'
              : 'Try clearing your type, mode, or keyword search filters.'}
          </p>
          {viewTab === 'saved' && (
            <button
              type="button"
              onClick={() => setViewTab('browse')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 rounded-xl transition-all duration-200 active:scale-95 shadow-sm cursor-pointer select-none"
            >
              <span>Explore Opportunities</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayOpportunities.map(opp => {
            const daysLeft = calculateDaysLeft(opp.deadline);
            const isExpired = daysLeft < 0;
            const applyTargetUrl = opp.applyLink || opp.applyUrl || '#';
            const displayStipend = opp.stipendPrize || opp.compensation || 'Stipend details TBA';
            const isHackathon = opp.type === 'Hackathon';

            return (
              <div
                key={opp.id}
                className={`border rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
                  isExpired
                    ? 'opacity-60 grayscale-[40%] bg-slate-50/70 dark:bg-[#18181B]/60 border-slate-200 dark:border-[#27272A]'
                    : isHackathon
                    ? 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 dark:from-blue-950/30 dark:via-[#18181B] dark:to-indigo-950/20 border-blue-200/80 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-md'
                    : 'bg-white dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Top Accent Strip for Hackathon */}
                {isHackathon && !isExpired && (
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 shrink-0" />
                )}

                {/* Decorative Faint Watermark for Hackathon */}
                {isHackathon && (
                  <div className="absolute top-3 right-3 text-blue-900/[0.04] dark:text-blue-100/[0.04] pointer-events-none select-none z-0">
                    <Gamepad2 className="w-24 h-24 transform rotate-12" />
                  </div>
                )}

                <div className="p-5 space-y-3.5 relative z-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Top Badges & Save Action */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant={
                            opp.type === 'Internship'
                              ? 'teal'
                              : opp.type === 'Hackathon'
                              ? 'blue'
                              : 'indigo'
                          }
                          size="sm"
                        >
                          {opp.type}
                        </Badge>
                        {opp.categorySubtitle && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
                            Inter-University
                          </span>
                        )}
                        <Badge variant="slate" size="sm">
                          {opp.mode}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Event Date Tag if available */}
                        {opp.eventDate && (
                          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {opp.eventDate}
                          </span>
                        )}

                        {/* Dynamic Date Math Badge ("X days left") */}
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            Expired
                          </span>
                        ) : daysLeft === 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            Due today
                          </span>
                        ) : daysLeft === 1 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            1 day left
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            {daysLeft} days left
                          </span>
                        )}

                        {/* Bookmark / Save Icon Button */}
                        <button
                          type="button"
                          onClick={() => toggleSaveOpportunity(opp.id)}
                          className={`p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                            opp.isSaved
                              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={opp.isSaved ? 'Remove from saved' : 'Save opportunity'}
                          aria-label={opp.isSaved ? 'Remove from saved' : 'Save opportunity'}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              opp.isSaved ? 'fill-teal-700 text-teal-700 dark:fill-teal-400 dark:text-teal-400' : 'text-slate-400'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Organization & Title */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                        {opp.organization}
                      </span>
                      <h3
                        onClick={() => handleOpenDetail(opp)}
                        className={`text-sm sm:text-base font-bold leading-snug cursor-pointer hover:text-blue-700 dark:hover:text-blue-400 line-clamp-2 mt-0.5 ${
                          isExpired ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {opp.title}
                      </h3>
                    </div>

                    {/* Highlight Chips (Prize, Entry/Team, Venue, Timings) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#27272A]/50 border border-slate-200/80 dark:border-[#27272A] flex items-start gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider font-mono">
                            Prize Pool
                          </span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-[11px] truncate block">
                            {displayStipend}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#27272A]/50 border border-slate-200/80 dark:border-[#27272A] flex items-start gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider font-mono">
                            Entry & Team
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-200 text-[11px] truncate block">
                            {opp.entryFee || opp.eligibility}
                          </span>
                        </div>
                      </div>

                      {opp.venue && (
                        <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#27272A]/50 border border-slate-200/80 dark:border-[#27272A] flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider font-mono">
                              Venue
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-200 text-[11px] truncate block">
                              {opp.venue}
                            </span>
                          </div>
                        </div>
                      )}

                      {opp.timeWindow && (
                        <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#27272A]/50 border border-slate-200/80 dark:border-[#27272A] flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider font-mono">
                              Timings
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-200 text-[11px] truncate block">
                              {opp.timeWindow}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2-Day Track Preview */}
                    {opp.tracks && opp.tracks.length > 0 && (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                          Event Tracks Preview
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {opp.tracks.map((track, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-white/90 dark:bg-[#18181B]/90 border border-blue-100 dark:border-blue-900/40 text-xs space-y-0.5"
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-blue-700 dark:text-blue-400 font-mono">{track.day}</span>
                                <span className="text-slate-700 dark:text-slate-300 font-semibold">{track.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {track.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {opp.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {opp.description}
                      </p>
                    )}
                  </div>

                  {/* Footer with Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-[#27272A] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(opp)}
                      >
                        View Details
                      </Button>

                      {opp.eventWebsite && (
                        <a
                          href={opp.eventWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Event Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <a
                      href={applyTargetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all shadow-sm ${
                        isExpired
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed pointer-events-none'
                          : 'bg-[#0F2544] hover:bg-[#134074] active:bg-[#081B33] text-white active:scale-95'
                      }`}
                    >
                      <span>{isHackathon ? 'Register Now' : 'Apply'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        isOpen={!!selectedOpportunity}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default OpportunitiesPage;
