import React from 'react';
import { Link } from 'react-router-dom';
import { Pin, ArrowRight, FileText, Bell } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../ui/Badge';

export const PinnedNoticesWidget: React.FC = () => {
  const { notices, markNoticeRead } = useApp();

  const pinnedNotices = notices.filter(n => n.isPinned);

  return (
    <div className="bg-white border border-border rounded-lg shadow-subtle overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-teal-700 rotate-45" />
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Pinned Campus Notices
          </h3>
        </div>
        <Link
          to="/notices"
          className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
        >
          <span>Notice Board</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Notices / Empty State */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {pinnedNotices.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <Pin className="w-4 h-4 rotate-45" />
            </div>
            <p className="text-xs font-semibold text-slate-800">No pinned notices</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 leading-relaxed">
              Official circulars, examination memos, and high-priority announcements will be pinned here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pinnedNotices.map(notice => (
              <Link
                key={notice.id}
                to={`/notices?id=${notice.id}`}
                onClick={() => markNoticeRead(notice.id)}
                className="block p-3 rounded-md border border-border hover:border-slate-300 hover:bg-slate-50/70 transition-all text-xs group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {!notice.readByCurrentUser && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" title="Unread notice" />
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
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {notice.publishedDate}
                  </span>
                </div>

                <p className="font-semibold text-slate-900 group-hover:text-teal-900 line-clamp-1">
                  {notice.title}
                </p>

                <p className="text-slate-500 text-[11px] line-clamp-2 mt-1">
                  {notice.content}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="truncate max-w-[200px]">{notice.department}</span>
                  {notice.attachments && notice.attachments.length > 0 && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <FileText className="w-3 h-3" />
                      {notice.attachments.length} attachment{notice.attachments.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {notices.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-slate-500">
            <span>{notices.filter(n => !n.readByCurrentUser).length} unread notices in feed</span>
            <Link to="/notices" className="text-teal-700 hover:underline">
              View All Updates
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
