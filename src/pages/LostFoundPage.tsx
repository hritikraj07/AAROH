import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LostFoundCategory, LostFoundItem, LostFoundType } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ReportLostFoundModal } from '../components/modules/lostfound/ReportLostFoundModal';
import { LostFoundDetailModal } from '../components/modules/lostfound/LostFoundDetailModal';
import {
  Search,
  PlusCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  Laptop,
  CreditCard,
  Key,
  Watch,
  Package,
  Check,
} from 'lucide-react';

export const LostFoundPage: React.FC = () => {
  const { lostFound, student } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [typeFilter, setTypeFilter] = useState<'all' | LostFoundType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'All' | LostFoundCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);

  // Sync with ?id= and ?action=report
  const idFromUrl = searchParams.get('id');
  const actionFromUrl = searchParams.get('action');

  useEffect(() => {
    if (idFromUrl) {
      const match = lostFound.find(i => i.id === idFromUrl);
      if (match) setSelectedItem(match);
    }
  }, [idFromUrl, lostFound]);

  useEffect(() => {
    if (actionFromUrl === 'report') {
      setIsReportOpen(true);
    }
  }, [actionFromUrl]);

  const categories: ('All' | LostFoundCategory)[] = [
    'All',
    'Electronics',
    'ID & Cards',
    'Keys & Wallets',
    'Books & Notes',
    'Personal Belongings',
  ];

  const filteredItems = useMemo(() => {
    return lostFound.filter(item => {
      // Type
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Category
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;

      // Status
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }

      return true;
    });
  }, [lostFound, typeFilter, categoryFilter, statusFilter, searchQuery]);

  const getCategoryIcon = (cat: LostFoundCategory) => {
    switch (cat) {
      case 'Electronics':
        return <Laptop className="w-4 h-4 text-teal-700" />;
      case 'ID & Cards':
        return <CreditCard className="w-4 h-4 text-indigo-700" />;
      case 'Keys & Wallets':
        return <Key className="w-4 h-4 text-amber-700" />;
      case 'Personal Belongings':
        return <Watch className="w-4 h-4 text-violet-700" />;
      default:
        return <Package className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleOpenDetail = (item: LostFoundItem) => {
    setSelectedItem(item);
    setSearchParams({ id: item.id });
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    setSearchParams({});
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Campus Lost & Found Registry</h2>
          <p className="text-xs text-slate-500">
            A peer-to-peer lost property clearinghouse with privacy-protected contact exchange.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsReportOpen(true)}
          className="self-start sm:self-auto"
        >
          Report an Item
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-border rounded-lg p-3.5 shadow-subtle space-y-3">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'all'
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-border'
              }`}
            >
              All Items ({lostFound.length})
            </button>
            <button
              onClick={() => setTypeFilter('lost')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                typeFilter === 'lost'
                  ? 'bg-rose-50 text-rose-900 border border-rose-200 font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-border'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Lost ({lostFound.filter(i => i.type === 'lost').length})</span>
            </button>
            <button
              onClick={() => setTypeFilter('found')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                typeFilter === 'found'
                  ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-border'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>Found ({lostFound.filter(i => i.type === 'found').length})</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | 'open' | 'resolved')}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-border rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Statuses</option>
              <option value="open">Active / Open Only</option>
              <option value="resolved">Resolved Only</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-1 border-t border-border">
          {categories.map(cat => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative pt-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items by name, location, brand, or description..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/70 border border-border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white border border-border rounded-lg">
            No lost or found items found matching your current filters.
          </div>
        ) : (
          filteredItems.map(item => {
            const isResolved = item.status === 'resolved';
            const isPoster = item.reportedBy.isCurrentUser;

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-lg shadow-subtle p-4 hover:border-slate-300 transition-all flex flex-col justify-between ${
                  isResolved ? 'opacity-80 border-slate-200 bg-slate-50/40' : 'border-border'
                }`}
              >
                <div className="space-y-2">
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={item.type === 'lost' ? 'rose' : 'teal'} size="sm">
                        {item.type.toUpperCase()}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        {item.category}
                      </Badge>
                    </div>

                    {isResolved ? (
                      <Badge variant="emerald" size="sm" dot>
                        Resolved
                      </Badge>
                    ) : (
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.date}
                      </span>
                    )}
                  </div>

                  {/* Title & Icon Header */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <div className="p-2 rounded bg-slate-50 border border-border shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h3
                        onClick={() => handleOpenDetail(item)}
                        className={`text-xs font-bold leading-snug cursor-pointer hover:text-teal-800 line-clamp-1 ${
                          isResolved ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Location & Poster Details */}
                  <div className="space-y-1 pt-2 text-xs text-slate-500 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium text-slate-700">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Posted by {item.reportedBy.name}</span>
                      {isPoster && (
                        <span className="text-teal-700 font-semibold">(Your post)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-slate-400">
                    {item.contactRequestsCount} inquiry{item.contactRequestsCount === 1 ? '' : 'ies'}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenDetail(item)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Modal */}
      <ReportLostFoundModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setSearchParams({});
        }}
      />

      {/* Detail Modal */}
      <LostFoundDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={handleCloseDetail}
      />
    </div>
  );
};
