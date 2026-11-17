import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Notice } from '../../../types';
import { Badge } from '../../ui/Badge';
import {
  FileText,
  Download,
  Calendar,
  Building,
  CheckCheck,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { summarizeNoticeAI } from '../../../utils/noticeSummarizer';

export interface NoticeDetailModalProps {
  notice: Notice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({ notice, isOpen, onClose }) => {
  const { markNoticeRead, showToast } = useApp();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string[] | null>(null);

  // Reset summary state whenever the selected notice changes
  useEffect(() => {
    setIsSummarizing(false);
    setSummary(null);
  }, [notice?.id]);

  if (!notice) return null;

  const handleSummarize = () => {
    if (isSummarizing) return;
    setIsSummarizing(true);

    // Simulate AI processing time with fast spinner for exactly 1.5 seconds
    setTimeout(() => {
      if (notice) {
        const bullets = summarizeNoticeAI(notice);
        setSummary(bullets);
      }
      setIsSummarizing(false);
    }, 1500);
  };

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
      headerAction={
        <button
          type="button"
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] active:scale-95 transition-all duration-150 rounded-md select-none disabled:opacity-60 shrink-0 border border-[#8DA9C4]/30"
        >
          {isSummarizing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating summary...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>AI Summarize</span>
            </>
          )}
        </button>
      }
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
        {/* TL;DR AI Notice Summary (Smoothly expanding tinted box directly below the title) */}
        {summary && (
          <div className="bg-[#F0F7F6] border border-teal-200 rounded-lg p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>TL;DR AI Executive Summary</span>
              </div>
              <span className="text-[10px] font-mono text-teal-800 bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded font-semibold">
                AI Synthesized
              </span>
            </div>
            <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc marker:text-teal-700">
              {summary.map((point, idx) => (
                <li key={idx} className="leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

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
