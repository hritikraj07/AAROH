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
  Image as ImageIcon
} from 'lucide-react';

export const LostFoundPage: React.FC = () => {
  const { lostFound, user, student, toggleResolveItem } = useApp();
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

  const currentUser = user || student;

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
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc && !matchCat) return false;
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Campus Lost & Found Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            A peer-to-peer lost property clearinghouse with privacy-protected contact exchange.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => setIsReportOpen(true)}
          className="self-start sm:self-auto"
        >
          Report Item
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3.5">
        {/* Type Filter Buttons & Status Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                typeFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold '
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Items ({lostFound.length})
            </button>
            <button
              onClick={() => setTypeFilter('lost')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                typeFilter === 'lost'
                  ? 'bg-rose-700 text-white font-semibold '
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${typeFilter === 'lost' ? 'bg-white' : 'bg-rose-500'}`} />
              <span>Lost ({lostFound.filter(i => i.type === 'lost').length})</span>
            </button>
            <button
              onClick={() => setTypeFilter('found')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                typeFilter === 'found'
                  ? 'bg-teal-700 text-white font-semibold '
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${typeFilter === 'found' ? 'bg-white' : 'bg-teal-500'}`} />
              <span>Found ({lostFound.filter(i => i.type === 'found').length})</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'all' | 'open' | 'resolved')}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Statuses</option>
              <option value="open">Active / Open Only</option>
              <option value="resolved">Resolved Only</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-2 border-t border-slate-200">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Category:
          </span>
          {categories.map(cat => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-teal-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items by name, campus location, description, or category..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-lg p-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <HelpCircle className="w-5 h-5 text-slate-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              {lostFound.length === 0 ? 'No lost or found items reported' : 'No items match your filter'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
              {lostFound.length === 0
                ? 'Misplaced personal belongings, electronics, and student IDs reported on campus will be cataloged here.'
                : 'Try adjusting your search query or clearing the category and status filters.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-3.5 h-3.5" />}
              onClick={() => setIsReportOpen(true)}
            >
              Report an Item
            </Button>
          </div>
        ) : (
          filteredItems.map(item => {
            const isResolved = item.status === 'resolved';
            const isPoster =
              item.reportedBy.isCurrentUser ||
              (currentUser?.id && item.reportedBy.id === currentUser.id) ||
              (currentUser?.email && item.reportedBy.email === currentUser.email) ||
              (currentUser?.name && item.reportedBy.name.toLowerCase() === currentUser.name.toLowerCase());

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-lg  hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden ${
                  isResolved ? 'opacity-85 border-slate-200 bg-slate-50/40' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Photo Thumbnail if present */}
                  {item.imageUrl ? (
                    <div
                      onClick={() => handleOpenDetail(item)}
                      className="h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-200 cursor-pointer relative group"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <Badge variant={item.type === 'lost' ? 'rose' : 'teal'} size="sm">
                          {item.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleOpenDetail(item)}
                      className="h-24 w-full bg-slate-50/80 border-b border-slate-200 flex items-center justify-between px-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded bg-white border border-slate-200">
                          {getCategoryIcon(item.category)}
                        </div>
                        <Badge variant={item.type === 'lost' ? 'rose' : 'teal'} size="sm">
                          {item.type.toUpperCase()}
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
                  )}

                  {/* Card Content Area */}
                  <div className="p-4 space-y-2.5">
                    {item.imageUrl && (
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="slate" size="sm">
                          {item.category}
                        </Badge>
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
                    )}

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
                        {item.description || 'No detailed description provided.'}
                      </p>
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
                </div>

                {/* Footer Action */}
                <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.contactRequestsCount} inquiry{item.contactRequestsCount === 1 ? '' : 'ies'}
                  </span>

                  <div className="flex items-center gap-2">
                    {isPoster && (
                      <button
                        type="button"
                        onClick={() => toggleResolveItem(item.id)}
                        className={`px-2 py-1 text-[11px] rounded font-semibold border transition-colors ${
                          isResolved
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isResolved ? 'Re-open' : 'Mark Resolved'}
                      </button>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDetail(item)}
                    >
                      View Details
                    </Button>
                  </div>
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

export default LostFoundPage;
