import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Briefcase,
  ExternalLink,
  Plus,
  Trash2,
  Search
} from 'lucide-react';
import { Opportunity, OpportunityMode, OpportunityType } from '../../types';

export const AdminOpportunitiesPage: React.FC = () => {
  const { opportunities, createOpportunity, deleteOpportunity } = useApp();

  // Form State
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [type, setType] = useState<OpportunityType>('Internship');
  const [mode, setMode] = useState<OpportunityMode>('Remote');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [eligibility, setEligibility] = useState('');
  const [stipendPrize, setStipendPrize] = useState('');
  const [applyLink, setApplyLink] = useState('');
  const [description, setDescription] = useState('');

  // Table Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organization.trim() || !applyLink.trim()) return;

    createOpportunity({
      title: title.trim(),
      organization: organization.trim(),
      type,
      mode,
      deadline,
      eligibility: eligibility.trim() || 'Open to all enrolled students',
      stipendPrize: stipendPrize.trim() || 'Stipend details upon shortlisting',
      applyLink: applyLink.trim(),
      description: description.trim(),
    });

    // Reset Form Fields
    setTitle('');
    setOrganization('');
    setType('Internship');
    setMode('Remote');
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDeadline(d.toISOString().split('T')[0]);
    setEligibility('');
    setStipendPrize('');
    setApplyLink('');
    setDescription('');
  };

  const filteredOpportunities = opportunities.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      o.organization.toLowerCase().includes(q) ||
      o.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Opportunity Board Publisher
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Post verified internships, national hackathons, and algorithmic competitions to the student board.
          </p>
        </div>
      </div>

      {/* 1. Add Opportunity Form (Single-Column White Card Layout) */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 sm:p-6">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200 dark:border-[#27272A]">
          <Briefcase className="w-4 h-4 text-teal-800 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Publish New Opportunity
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl font-sans">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Opportunity Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Google Summer of Code 2026 or Software Engineering Summer Intern"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Hosting Organization / Company <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="e.g. Google Open Source or Microsoft India R&D"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Type & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Opportunity Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as OpportunityType)}
                className="w-full text-xs px-3 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700 font-medium"
              >
                <option value="Internship">Internship</option>
                <option value="Hackathon">Hackathon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Engagement Mode <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 border border-slate-200 rounded">
                <label
                  className={`flex items-center justify-center gap-1.5 py-2 min-h-[44px] text-xs font-semibold rounded cursor-pointer transition-colors ${
                    mode === 'Remote'
                      ? 'bg-teal-700 text-white '
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="adminMode"
                    value="Remote"
                    checked={mode === 'Remote'}
                    onChange={() => setMode('Remote')}
                    className="hidden"
                  />
                  <span>Remote</span>
                </label>

                <label
                  className={`flex items-center justify-center gap-1.5 py-2 min-h-[44px] text-xs font-semibold rounded cursor-pointer transition-colors ${
                    mode === 'On-site'
                      ? 'bg-teal-700 text-white '
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="adminMode"
                    value="On-site"
                    checked={mode === 'On-site'}
                    onChange={() => setMode('On-site')}
                    className="hidden"
                  />
                  <span>On-site</span>
                </label>
              </div>
            </div>
          </div>

          {/* Deadline & Stipend / Prize */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Application Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full text-xs px-3 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Stipend / Prize Pool <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={stipendPrize}
                onChange={e => setStipendPrize(e.target.value)}
                placeholder="e.g. ₹45,000 / month or ₹1,00,000 Prize Pool"
                className="w-full text-xs px-3 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Eligibility Criteria <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={eligibility}
              onChange={e => setEligibility(e.target.value)}
              placeholder="e.g. Pre-final & Final Year B.Tech / MCA students (Batch of 2026/2027)"
              className="w-full text-xs px-3 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Apply Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Official Application Portal Link <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={applyLink}
              onChange={e => setApplyLink(e.target.value)}
              placeholder="https://company.com/careers/apply-opportunity"
              className="w-full text-xs px-3 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Brief Overview & Program Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a summary of core technical responsibilities, skills sought, and application steps..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              Post Opportunity
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Currently Active Opportunities Data Table */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#111115] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Published Opportunities ({opportunities.length})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live listings accessible to all undergraduate students on their opportunity board.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search published listings..."
              className="w-full text-xs pl-8 pr-3 py-2 min-h-[44px] bg-white dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
            />
          </div>
        </div>

        {filteredOpportunities.length === 0 ? (
          <div className="py-12 text-center p-6 text-xs text-slate-500">
            No opportunities match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Title & Organization</th>
                  <th className="py-3 px-4 w-28">Type</th>
                  <th className="py-3 px-4 w-24">Mode</th>
                  <th className="py-3 px-4 w-28">Deadline</th>
                  <th className="py-3 px-4 w-40">Stipend / Prize</th>
                  <th className="py-3 px-4 w-28">Link</th>
                  <th className="py-3 px-4 w-20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOpportunities.map(opp => (
                  <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 line-clamp-1">{opp.title}</div>
                      <div className="text-[11px] text-slate-500">{opp.organization}</div>
                    </td>

                    <td className="py-3 px-4">
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
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="slate" size="sm">
                        {opp.mode}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {opp.deadline}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-emerald-800 text-[11px]">
                      {opp.stipendPrize || opp.compensation}
                    </td>

                    <td className="py-3 px-4">
                      <a
                        href={opp.applyLink || opp.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 hover:underline font-mono text-[11px]"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteOpportunity(opp.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOpportunitiesPage;
