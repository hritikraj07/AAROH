import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NoticeCategory, Notice } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { NoticeDetailModal } from '../components/modules/notices/NoticeDetailModal';
import { TopographicBg } from '../components/ui/TopographicBg';
import {
  Search,
  Pin,
  FileText,
  CheckCheck,
  Building,
  Filter,
  Calendar,
} from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const { notices, markNoticeRead, markAllNoticesRead } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categoryFilter, setCategoryFilter] = useState<'All' | NoticeCategory>('All');
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Sync selected notice with query param ?id=
  const noticeIdFromUrl = searchParams.get('id');
  useEffect(() => {
    if (noticeIdFromUrl) {
      const match = notices.find(n => n.id === noticeIdFromUrl);
      if (match) {
        setSelectedNotice(match);
        markNoticeRead(match.id, true);
      }
    }
  }, [noticeIdFromUrl, notices, markNoticeRead]);

  const categories: ('All' | NoticeCategory)[] = [
    'All',
    'Academic',
    'Exams',
    'Administration',
    'Placements',
    'General',
  ];

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('November') || dateStr.includes('Dec')) return dateStr;
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        if (months[monthIndex]) {
          return `${day} ${months[monthIndex]} ${year}`;
        }
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const filteredNotices = useMemo(() => {
    const list = notices.filter(n => {
      // Category filter
      if (categoryFilter !== 'All' && n.category !== categoryFilter) return false;

      // Read filter
      if (readFilter === 'unread' && n.readByCurrentUser) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchDept = n.department.toLowerCase().includes(q);
        const matchSummary = n.summary?.toLowerCase().includes(q);
        const matchIssued = n.issuedBy?.toLowerCase().includes(q);
        const matchPriority = n.priorityTag?.toLowerCase().includes(q);
        const matchWindow = n.startWindow?.toLowerCase().includes(q);
        const matchPoints = n.circularPoints?.some(p => p.label.toLowerCase().includes(q) || p.text.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchDept && !matchSummary && !matchIssued && !matchPriority && !matchWindow && !matchPoints) return false;
      }

      return true;
    });

    // Pinned notices first, then sorted by publishedDate descending
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return b.publishedDate.localeCompare(a.publishedDate);
    });
  }, [notices, categoryFilter, readFilter, searchQuery]);

  const unreadTotal = notices.filter(n => !n.readByCurrentUser).length;

  const handleOpenNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    markNoticeRead(notice.id, true);
    setSearchParams({ id: notice.id });
  };

  const handleCloseModal = () => {
    setSelectedNotice(null);
    setSearchParams({});
  };

  return (
    <div className="space-y-5">
      {/* Header with Title and Global Mark-as-read */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Campus Notice Board</h2>
        </div>

        {unreadTotal > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<CheckCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />}
            onClick={markAllNoticesRead}
            className="self-start sm:self-auto"
          >
            Mark all {unreadTotal} as read
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-3.5 space-y-3 relative overflow-hidden">
        <TopographicBg />
        <div className="relative z-10 space-y-3">
          {/* Category Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => {
              const count =
                cat === 'All'
                  ? notices.length
                  : notices.filter(n => n.category === cat).length;
              const isSelected = categoryFilter === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 tabular-nums">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & Read Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-200 dark:border-[#27272A]">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search circulars by subject, department, or keyword..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50/70 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
              <button
                onClick={() => setReadFilter('all')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  readFilter === 'all'
                    ? 'bg-slate-200 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All Notices
              </button>
              <button
                onClick={() => setReadFilter('unread')}
                className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                  readFilter === 'unread'
                    ? 'bg-teal-100 dark:bg-teal-950/40 font-semibold text-teal-900 dark:text-teal-300'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Unread Only</span>
                {unreadTotal > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Cards Feed */}
      {filteredNotices.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-white/5 dark:text-slate-400 rounded-2xl p-8 relative overflow-hidden">
          <TopographicBg />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-400 dark:text-teal-400 mb-3 border border-slate-200 dark:border-white/5">
              <FileText className="w-5 h-5 text-slate-400 dark:text-teal-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {notices.length === 0 ? 'No institutional notices published yet.' : 'No matching circulars found'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              {notices.length === 0
                ? 'Official academic circulars, exam schedules, and administration memos will be listed here.'
                : 'Try modifying your search query or category filters above.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map(notice => {
            const isExams = notice.category === 'Exams';
            const isAcademic = notice.category === 'Academic';

            return (
              <div
                key={notice.id}
                onClick={() => handleOpenNotice(notice)}
                className={`bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer select-none ${
                  isExams
                    ? 'border-l-4 border-l-rose-500'
                    : isAcademic
                    ? 'border-l-4 border-l-blue-600'
                    : 'border-l-4 border-l-slate-400'
                } ${!notice.readByCurrentUser ? 'bg-gradient-to-r from-blue-50/15 via-white to-transparent dark:from-blue-950/10 dark:via-[#18181B]' : ''}`}
              >
                {/* Top row: Category pill, Priority tag, Unread blue dot indicator, and Published Date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category pill */}
                    <Badge
                      variant={
                        isExams
                          ? 'rose'
                          : isAcademic
                          ? 'indigo'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {notice.category}
                    </Badge>

                    {/* Priority tag */}
                    {notice.priorityTag && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                        {notice.priorityTag}
                      </span>
                    )}

                    {/* Unread blue dot indicator */}
                    {!notice.readByCurrentUser && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        <span>Unread</span>
                      </span>
                    )}

                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full font-mono">
                        <Pin className="w-2.5 h-2.5 rotate-45" />
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>

                  {/* Published Date */}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {formatDateDisplay(notice.publishedDate)}
                  </span>
                </div>

                {/* Middle: Bold circular title, Issued by metadata line, and 2-line summary */}
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                    {notice.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Issued by:{' '}
                      <strong className="text-slate-700 dark:text-slate-300 font-medium">
                        {notice.issuedBy || notice.department}
                      </strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notice.summary || notice.content}
                  </p>
                </div>

                {/* Bottom row: Key date highlight pill on left, and Read Circular button on right */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between gap-3 text-xs">
                  <div>
                    {notice.startWindow ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200/80 dark:border-[#27272A] text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                          {notice.startWindow}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Ref: CIR-{notice.id.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNotice(notice);
                      }}
                      className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-xs"
                    >
                      Read Circular →
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Detail Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        isOpen={!!selectedNotice}
        onClose={handleCloseModal}
      />
    </div>
  );
};
