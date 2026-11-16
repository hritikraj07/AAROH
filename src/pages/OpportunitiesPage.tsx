import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Opportunity, OpportunityMode, OpportunityType } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { OpportunityDetailModal } from '../components/modules/opportunities/OpportunityDetailModal';
import { TeammateRadar } from '../components/modules/opportunities/TeammateRadar';
import {
  Briefcase,
  Building,
  Bookmark,
  Calendar,
  Search,
  ExternalLink,
  Clock,
  MapPin,
  Award,
  DollarSign,
  ChevronRight,
  Sparkles,
  Info,
  Users,
  UserPlus,
  CheckCircle2,
  Loader2
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

  const types: ('All' | OpportunityType)[] = ['All', 'Internship', 'Hackathon', 'Competition'];
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
        if (!matchTitle && !matchOrg && !matchDesc && !matchElig && !matchStipend) return false;
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Curated engineering internships, competitive hackathons, and national design challenges.
          </p>
        </div>

        {/* View Switcher: "Browse" vs "Saved" */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewTab('browse')}
            className={`px-3 py-1.5 rounded transition-colors font-medium ${
              viewTab === 'browse'
                ? 'bg-white dark:bg-[#18181B] text-slate-900 dark:text-slate-100 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Browse ({opportunities.length})
          </button>
          <button
            onClick={() => setViewTab('saved')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 font-medium ${
              viewTab === 'saved'
                ? 'bg-teal-700 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${viewTab === 'saved' ? 'fill-white' : ''}`} />
            <span>Saved</span>
            {savedCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-mono ${
                  viewTab === 'saved' ? 'bg-teal-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-4 space-y-3.5">
        {/* Type & Mode & Sort Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
              Type:
            </span>
            {types.map(t => {
              const isSelected = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-800 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Mode & Sort Dropdowns */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Mode:</span>
              <select
                value={modeFilter}
                onChange={e => setModeFilter(e.target.value as 'All' | OpportunityMode)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                {modes.map(m => (
                  <option key={m} value={m}>
                    {m === 'All' ? 'All Modes' : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Sort:</span>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'closest' | 'furthest')}
                className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="closest">Deadline: Closest First</option>
                <option value="furthest">Deadline: Furthest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative pt-1 border-t border-slate-200 dark:border-[#27272A]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by role title, hosting company, eligibility, or stipend keywords..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Teammate Radar: Complementary skills based on Automated Coding Labs */}
      <TeammateRadar />

      {/* Find a Team / Study Partner Matchmaker (Above Hackathons / Opportunities List) */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 sm:p-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Find a Team & Study Partner Matchmaker
              </h3>
              <span className="text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded font-mono">
                AI MATCHMAKER
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Match with fellow students in your cohort ({user?.program || 'B.Tech CSE'} • Semester {user?.semester || 5}) for hackathons, engineering competitions, and collaborative projects.
            </p>
          </div>

          <button
            onClick={handleMatchMe}
            disabled={isSearchingMatch}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-[#0D6861] active:scale-95 transition-transform duration-150 rounded-md select-none shrink-0 disabled:opacity-60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]"
          >
            {isSearchingMatch ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning cohort...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                <span>Match Me</span>
              </>
            )}
          </button>
        </div>

        {/* Matched Student Profile Card */}
        {matchedStudent && (
          <div className="mt-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 sm:p-5 rounded-lg border border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#27272A]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-teal-700 text-white font-bold text-sm flex items-center justify-center shrink-0 font-mono">
                  {matchedStudent.avatarInitials || 'ST'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {matchedStudent.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <span>✨ AI Matched</span>
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
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md border active:scale-95 transition-transform duration-150 flex items-center gap-1.5 ${
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
                      <UserPlus className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                      <span>Request to Connect</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {matchAttempted && !matchedStudent && !isSearchingMatch && (
          <div className="mt-4 p-4 rounded-lg border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/30 text-center text-xs text-slate-600 dark:text-slate-400 animate-in fade-in duration-200">
            <p className="font-semibold text-slate-800 dark:text-slate-200">No other matching peers found yet in {user?.program} Semester {user?.semester}.</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">As more classmates onboard in your program, our matchmaker will automatically discover compatible study partners.</p>
          </div>
        )}
      </div>

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
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] cursor-pointer select-none"
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

            return (
              <div
                key={opp.id}
                className={`bg-white dark:bg-[#18181B] border rounded-lg p-4 transition-all flex flex-col justify-between ${
                  isExpired
                    ? 'opacity-60 grayscale-[40%] bg-slate-50/70 dark:bg-[#18181B]/60 border-slate-200 dark:border-[#27272A]'
                    : 'border-slate-200 dark:border-[#27272A] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
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
                      <Badge variant="slate" size="sm">
                        {opp.mode}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
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
                        className={`p-1.5 rounded transition-colors ${
                          opp.isSaved
                            ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={opp.isSaved ? 'Remove from saved' : 'Save opportunity'}
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
                      className={`text-sm font-bold leading-snug cursor-pointer hover:text-teal-800 dark:hover:text-teal-300 line-clamp-1 mt-0.5 ${
                        isExpired ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {opp.title}
                    </h3>
                  </div>

                  {/* Stipend / Prize & Eligibility Box */}
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-[#27272A]/40 border border-slate-100 dark:border-[#27272A] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-400 text-[11px]">Stipend / Prize</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 font-mono text-[11px]">
                        {displayStipend}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      <strong className="text-slate-700 dark:text-slate-300 font-medium">Eligibility:</strong>{' '}
                      {opp.eligibility}
                    </p>
                  </div>

                  {opp.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>
                  )}
                </div>

                {/* Footer with Apply in New Tab & Details */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#27272A] flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                    Deadline: {opp.deadline}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetail(opp)}
                    >
                      Details
                    </Button>

                    <a
                      href={applyTargetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1.5 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors ${
                        isExpired
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed pointer-events-none'
                          : 'bg-teal-700 hover:bg-teal-800 text-white '
                      }`}
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
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
