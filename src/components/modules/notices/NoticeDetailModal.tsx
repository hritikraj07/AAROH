import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Notice } from '../../../types';
import { Badge } from '../../ui/Badge';
import { FileText, Download, Calendar, Building, CheckCheck } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export interface NoticeDetailModalProps {
  notice: Notice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({ notice, isOpen, onClose }) => {
  const { markNoticeRead, showToast } = useApp();

  if (!notice) return null;

  const handleDownloadAttachment = (fileName: string) => {
    showToast({
      type: 'info',
      title: 'Downloading Attachment',
      message: `Simulating secure offline download of ${fileName}`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={notice.title}
      subtitle={`Circular Ref: CIR-${notice.id.toUpperCase()}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => {
              markNoticeRead(notice.id, !notice.readByCurrentUser);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>{notice.readByCurrentUser ? 'Mark as Unread' : 'Mark as Read'}</span>
          </button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Circular
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Meta Bar */}
        <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                notice.category === 'Exams'
                  ? 'rose'
                  : notice.category === 'Academic'
                  ? 'indigo'
                  : notice.category === 'Placements'
                  ? 'emerald'
                  : 'slate'
              }
              size="md"
            >
              {notice.category}
            </Badge>
            {notice.isPinned && (
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                Official Pinned Notice
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Published: {notice.publishedDate}
            </span>
          </div>
        </div>

        {/* Issuing Authority */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Issued by: <strong className="text-slate-900">{notice.department}</strong></span>
        </div>

        {/* Full Notice Content */}
        <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line py-2 border-t border-b border-slate-200">
          {notice.content}
        </div>

        {/* Attachments Section */}
        {notice.attachments && notice.attachments.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Attached Documents ({notice.attachments.length})
            </h4>
            <div className="space-y-2">
              {notice.attachments.map(att => (
                <div
                  key={att.name}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">{att.name}</p>
                      <p className="text-[11px] text-slate-400">{att.size}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownloadAttachment(att.name)}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
