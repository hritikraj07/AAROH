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
  DollarSign,
  Search,
  Filter,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const { opportunities, toggleSaveOpportunity } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [typeFilter, setTypeFilter] = useState<'All' | OpportunityType>('All');
  const [modeFilter, setModeFilter] = useState<'All' | OpportunityMode>('All');
  const [sortOrder, setSortOrder] = useState<'soonest' | 'furthest'>('soonest');
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

  const todayStr = new Date().toISOString().split('T')[0];

  const calculateDaysLeft = (deadlineStr: string) => {
    const d1 = new Date(todayStr).getTime();
    const d2 = new Date(deadlineStr).getTime();
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  };

  const types: ('All' | OpportunityType)[] = ['All', 'Internship', 'Hackathon', 'Competition'];

  const savedCount = opportunities.filter(o => o.isSaved).length;

  const { activeOpportunities, expiredOpportunities } = useMemo(() => {
    // 1. Filter
    const filtered = opportunities.filter(opp => {
      // Saved tab
      if (activeTab === 'saved' && !opp.isSaved) return false;

      // Type
      if (typeFilter !== 'All' && opp.type !== typeFilter) return false;

      // Mode
      if (modeFilter !== 'All' && opp.mode !== modeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchOrg = opp.organization.toLowerCase().includes(q);
        const matchDesc = opp.description.toLowerCase().includes(q);
        const matchElig = opp.eligibility.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchDesc && !matchElig) return false;
      }

      return true;
    });

    // 2. Separate active vs expired
    const active: Opportunity[] = [];
    const expired: Opportunity[] = [];

    filtered.forEach(o => {
      if (o.deadline < todayStr) {
        expired.push(o);
      } else {
        active.push(o);
      }
    });

    // 3. Sort by deadline
    const sorter = (a: Opportunity, b: Opportunity) => {
      if (sortOrder === 'soonest') {
        return a.deadline.localeCompare(b.deadline);
      } else {
        return b.deadline.localeCompare(a.deadline);
      }
    };

    active.sort(sorter);
    expired.sort(sorter);

    return { activeOpportunities: active, expiredOpportunities: expired };
  }, [opportunities, activeTab, typeFilter, modeFilter, sortOrder, searchQuery, todayStr]);

  const handleOpenDetail = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setSearchParams({ id: opp.id });
  };

  const handleCloseDetail = () => {
    setSelectedOpportunity(null);
    setSearchParams({});
  };

  const renderOpportunityCard = (opp: Opportunity, isExpired: boolean) => {
    const daysLeft = calculateDaysLeft(opp.deadline);

    return (
      <div
        key={opp.id}
        className={`bg-white border rounded-lg shadow-subtle p-4 transition-all flex flex-col justify-between ${
          isExpired
            ? 'opacity-65 grayscale-[30%] border-slate-200 bg-slate-50/50'
            : 'border-border hover:border-slate-300'
        }`}
      >
        <div className="space-y-2">
          {/* Top Row: Type, Mode, Save Bookmark */}
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
              {/* Days left badge */}
              {isExpired ? (
                <Badge variant="rose" size="sm">
                  Expired
                </Badge>
              ) : daysLeft === 0 ? (
                <Badge variant="amber" size="sm" dot>
                  Closes Today
                </Badge>
              ) : daysLeft <= 3 ? (
                <Badge variant="amber" size="sm" dot>
                  {daysLeft}d left
                </Badge>
              ) : (
                <span className="font-mono text-xs text-slate-500 font-medium">
                  {daysLeft} days left
                </span>
              )}

              <button
                type="button"
                onClick={() => toggleSaveOpportunity(opp.id)}
                className="p-1 rounded text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors"
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

          {/* Org & Role Title */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block truncate">
              {opp.organization}
            </span>
            <h3
              onClick={() => handleOpenDetail(opp)}
              className="text-sm font-bold text-slate-900 hover:text-teal-800 cursor-pointer leading-snug line-clamp-1 mt-0.5"
            >
              {opp.title}
            </h3>
          </div>

          {/* Compensation & Eligibility */}
          <div className="p-2.5 rounded bg-slate-50 border border-slate-100 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Stipend / Prize</span>
              <span className="font-bold text-emerald-800 font-mono">
                {opp.compensation}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 truncate">
              <strong className="text-slate-700">Eligibility:</strong> {opp.eligibility}
            </p>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {opp.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
          <span className="font-mono text-[11px] text-slate-400">
            Deadline: {opp.deadline}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenDetail(opp)}
          >
            {isExpired ? 'View Details' : 'Details & Apply'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Opportunities Board</h2>
          <p className="text-xs text-slate-500">
            Curated engineering internships, competitive programming hackathons, and research fellowships.
          </p>
        </div>

        {/* Saved Items Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-md border border-border text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-subtle font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Listings ({opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-teal-700 text-white shadow-subtle font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Listings</span>
            {savedCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  activeTab === 'saved' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-border rounded-lg p-3.5 shadow-subtle space-y-3">
        {/* Type Filter Buttons & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {types.map(t => {
              const isSelected = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-border'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Mode & Sort Dropdowns */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-medium">Mode:</span>
              <select
                value={modeFilter}
                onChange={e => setModeFilter(e.target.value as 'All' | OpportunityMode)}
                className="text-xs px-2 py-1 bg-slate-50 border border-border rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="All">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-medium">Sort:</span>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'soonest' | 'furthest')}
                className="text-xs px-2 py-1 bg-slate-50 border border-border rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="soonest">Deadline (Soonest first)</option>
                <option value="furthest">Deadline (Furthest first)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative pt-1 border-t border-border">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by role, company name, skill, or eligibility..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/70 border border-border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* 1. Active Opportunities */}
      <div className="space-y-3">
        {activeOpportunities.length === 0 && expiredOpportunities.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-white border border-border rounded-lg">
            {activeTab === 'saved'
              ? "You haven't bookmarked any opportunities yet."
              : 'No opportunities found matching your current filter criteria.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOpportunities.map(opp => renderOpportunityCard(opp, false))}
          </div>
        )}
      </div>

      {/* 2. Expired Opportunities (Muted and listed last) */}
      {expiredOpportunities.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Closed & Expired Opportunities ({expiredOpportunities.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Archived for reference</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiredOpportunities.map(opp => renderOpportunityCard(opp, true))}
          </div>
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
