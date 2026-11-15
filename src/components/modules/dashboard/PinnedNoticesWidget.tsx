import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pin, FileText } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../ui/Badge';

export const PinnedNoticesWidget: React.FC = () => {
  const { notices, markNoticeRead } = useApp();
  const pinnedNotices = notices.filter(n => n.isPinned);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              PINNED CIRCULARS
            </span>
          </div>
          <Link
            to="/student/notices"
            className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 active:scale-95 transition-transform duration-150"
          >
            <span>Notice Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-6">
          {pinnedNotices.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-slate-900">No pinned notices</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">Official memos will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pinnedNotices.slice(0, 3).map(notice => (
                <Link
                  key={notice.id}
                  to={`/notices?id=${notice.id}`}
                  onClick={() => markNoticeRead(notice.id)}
                  className="py-3.5 first:pt-0 last:pb-0 block group active:scale-95 transition-transform duration-150"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {!notice.readByCurrentUser && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
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

                  <p className="text-xs font-semibold text-slate-900 group-hover:text-teal-800 line-clamp-1">
                    {notice.title}
                  </p>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
                    <span className="truncate max-w-[200px]">{notice.department}</span>
                    {notice.attachments && notice.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <FileText className="w-3 h-3" />
                        {notice.attachments.length}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {notices.length > 0 && (
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{notices.length} total circulars</span>
          <span>{notices.filter(n => !n.readByCurrentUser).length} unread</span>
        </div>
      )}
    </div>
  );
};
