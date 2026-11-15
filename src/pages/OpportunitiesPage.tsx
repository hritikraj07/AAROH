import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Opportunity, OpportunityMode, OpportunityType } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { OpportunityDetailModal } from '../components/modules/opportunities/OpportunityDetailModal';
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
  Info
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const { opportunities, toggleSaveOpportunity } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Opportunity Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated engineering internships, competitive hackathons, and national design challenges.
          </p>
        </div>

        {/* View Switcher: "Browse" vs "Saved" */}
        <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewTab('browse')}
            className={`px-3 py-1.5 rounded transition-colors font-medium ${
              viewTab === 'browse'
                ? 'bg-white text-slate-900  font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Browse ({opportunities.length})
          </button>
          <button
            onClick={() => setViewTab('saved')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 font-medium ${
              viewTab === 'saved'
                ? 'bg-teal-700 text-white  font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${viewTab === 'saved' ? 'fill-white' : ''}`} />
            <span>Saved</span>
            {savedCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-mono ${
                  viewTab === 'saved' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3.5">
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
                      ? 'bg-teal-800 text-white font-semibold '
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              <span className="text-slate-500 font-medium">Mode:</span>
              <select
                value={modeFilter}
                onChange={e => setModeFilter(e.target.value as 'All' | OpportunityMode)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                {modes.map(m => (
                  <option key={m} value={m}>
                    {m === 'All' ? 'All Modes' : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'closest' | 'furthest')}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="closest">Deadline: Closest First</option>
                <option value="furthest">Deadline: Furthest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative pt-1 border-t border-slate-200">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by role title, hosting company, eligibility, or stipend keywords..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Opportunities List / Dense Grid */}
      {displayOpportunities.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-lg p-6">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Briefcase className="w-5 h-5 text-slate-400" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">
            {viewTab === 'saved'
              ? 'No saved opportunities'
              : opportunities.length === 0
              ? 'No opportunities cataloged'
              : 'No matching opportunities found'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
            {viewTab === 'saved'
              ? 'Bookmark internships, hackathons, or fellowships in the Browse tab to review them here.'
              : opportunities.length === 0
              ? 'Verified industry opportunities will appear here once published by the Career Development Cell.'
              : 'Try clearing your type, mode, or keyword search filters.'}
          </p>
          {viewTab === 'saved' && (
            <Button variant="secondary" size="sm" onClick={() => setViewTab('browse')}>
              Explore Opportunities
            </Button>
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
                className={`bg-white border rounded-lg  p-4 transition-all flex flex-col justify-between ${
                  isExpired
                    ? 'opacity-60 grayscale-[40%] bg-slate-50/70 border-slate-200'
                    : 'border-slate-200 hover:border-slate-300'
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-slate-200 text-slate-600 border border-slate-300">
                          Expired
                        </span>
                      ) : daysLeft === 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-amber-50 text-amber-900 border border-amber-300">
                          Due today
                        </span>
                      ) : daysLeft === 1 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-amber-50 text-amber-900 border border-amber-300">
                          1 day left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-teal-50 text-teal-800 border border-teal-200">
                          {daysLeft} days left
                        </span>
                      )}

                      {/* Bookmark / Save Icon Button */}
                      <button
                        type="button"
                        onClick={() => toggleSaveOpportunity(opp.id)}
                        className={`p-1.5 rounded transition-colors ${
                          opp.isSaved
                            ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title={opp.isSaved ? 'Remove from saved' : 'Save opportunity'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            opp.isSaved ? 'fill-teal-700 text-teal-700' : 'text-slate-400'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Organization & Title */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
                      {opp.organization}
                    </span>
                    <h3
                      onClick={() => handleOpenDetail(opp)}
                      className={`text-sm font-bold leading-snug cursor-pointer hover:text-teal-800 line-clamp-1 mt-0.5 ${
                        isExpired ? 'text-slate-600' : 'text-slate-900'
                      }`}
                    >
                      {opp.title}
                    </h3>
                  </div>

                  {/* Stipend / Prize & Eligibility Box */}
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Stipend / Prize</span>
                      <span className="font-bold text-emerald-800 font-mono text-[11px]">
                        {displayStipend}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">
                      <strong className="text-slate-700 font-medium">Eligibility:</strong>{' '}
                      {opp.eligibility}
                    </p>
                  </div>

                  {opp.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>
                  )}
                </div>

                {/* Footer with Apply in New Tab & Details */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-[11px] text-slate-400">
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
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none'
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
