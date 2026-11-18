import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NoticeCategory, Notice } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { NoticeDetailModal } from '../components/modules/notices/NoticeDetailModal';
import {
  Search,
  Pin,
  FileText,
  CheckCheck,
  Building,
  Filter,
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

  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
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
        if (!matchTitle && !matchContent && !matchDept) return false;
      }

      return true;
    });
  }, [notices, categoryFilter, readFilter, searchQuery]);

  const pinnedList = filteredNotices.filter(n => n.isPinned);
  const regularList = filteredNotices.filter(n => !n.isPinned);
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
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-3.5 space-y-3">
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

      {/* 1. Pinned Notices Section */}
      {pinnedList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            <Pin className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 rotate-45" />
            <span>Pinned Official Circulars</span>
          </div>

          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg divide-y divide-slate-200 dark:divide-[#27272A]">
            {pinnedList.map(notice => (
              <div
                key={notice.id}
                onClick={() => handleOpenNotice(notice)}
                className={`p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#27272A]/40 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  !notice.readByCurrentUser ? 'bg-teal-50/20 dark:bg-teal-950/20' : ''
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {!notice.readByCurrentUser && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" title="Unread" />
                    )}
                    <Badge
                      variant={
                        notice.category === 'Exams'
                          ? 'rose'
                          : notice.category === 'Academic'
                          ? 'indigo'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {notice.category}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {notice.publishedDate}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {notice.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      {notice.department}
                    </span>
                    {notice.attachments && notice.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <FileText className="w-3 h-3 text-teal-700 dark:text-teal-400" />
                        {notice.attachments.length} attached file{notice.attachments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  <Button variant="ghost" size="sm" className="text-teal-700 dark:text-teal-400">
                    Read Circular →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Regular Feed List */}
      <div className="space-y-2">
        {pinnedList.length > 0 && regularList.length > 0 && (
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 pt-2">
            General Notice Archive
          </div>
        )}

        <div className="bg-white border border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-white/5 dark:text-slate-400 rounded-2xl divide-y divide-slate-200 dark:divide-[#27272A]">
          {filteredNotices.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-8">
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
          ) : (
            regularList.map(notice => (
              <div
                key={notice.id}
                onClick={() => handleOpenNotice(notice)}
                className={`p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#27272A]/40 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  !notice.readByCurrentUser ? 'bg-teal-50/20 dark:bg-teal-950/20' : ''
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {!notice.readByCurrentUser && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" title="Unread" />
                    )}
                    <Badge variant="slate" size="sm">
                      {notice.category}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {notice.publishedDate}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {notice.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      {notice.department}
                    </span>
                    {notice.attachments && notice.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <FileText className="w-3 h-3 text-teal-700 dark:text-teal-400" />
                        {notice.attachments.length} attachment{notice.attachments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  <Button variant="ghost" size="sm" className="text-teal-700 dark:text-teal-400">
                    Read Circular →
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notice Detail Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        isOpen={!!selectedNotice}
        onClose={handleCloseModal}
      />
    </div>
  );
};
