import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import {
  Bell,
  Pin,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  FileText,
  Building,
  Calendar,
  Paperclip
} from 'lucide-react';
import { Notice, NoticeCategory } from '../../types';

export const AdminNoticesPage: React.FC = () => {
  const { notices, createNotice, deleteNotice, togglePinNotice } = useApp();

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Administration');
  const [department, setDepartment] = useState('Office of the Registrar');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');

  const categories: (NoticeCategory | 'all')[] = [
    'all',
    'Academic',
    'Exams',
    'Administration',
    'Placements',
    'General',
  ];

  const filteredNotices = notices.filter(n => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createNotice({
      title: title.trim(),
      category,
      department: department.trim(),
      content: content.trim(),
      isPinned,
      attachments: attachmentName.trim()
        ? [
            {
              name: attachmentName.trim(),
              size: '420 KB',
              type: 'application/pdf',
            },
          ]
        : [],
    });

    setTitle('');
    setContent('');
    setAttachmentName('');
    setIsPinned(false);
    setIsPublishModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Campus Circulars & Notice Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish official university notifications, pin administrative decrees, and manage circular broadcasts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsPublishModalOpen(true)}
        >
          Publish Circular
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-border">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors whitespace-nowrap capitalize ${
                selectedCategory === cat
                  ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-border'
              }`}
            >
              {cat === 'all' ? 'All Circulars' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Table */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-10 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No circulars found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery || selectedCategory !== 'all'
              ? 'No notices match your active query. Try clearing filters.'
              : 'The official campus notice board is currently empty. Click "Publish Circular" to issue your first university circular.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsPublishModalOpen(true)}
          >
            Publish First Notice
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-lg overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-500 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">Pin</th>
                  <th className="py-3 px-4">Circular Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Issuing Authority</th>
                  <th className="py-3 px-4">Date Issued</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredNotices.map(notice => (
                  <tr key={notice.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => togglePinNotice(notice.id)}
                        className={`p-1 rounded transition-colors ${
                          notice.isPinned
                            ? 'text-teal-700 hover:text-teal-900 bg-teal-50'
                            : 'text-slate-300 hover:text-slate-600'
                        }`}
                        title={notice.isPinned ? 'Unpin notice' : 'Pin to top of notice board'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{notice.title}</span>
                        {notice.isPinned && (
                          <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-mono">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {notice.content}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        {notice.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {notice.department}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                      {notice.publishedDate}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Delete circular"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Publish Notice Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-lg shadow-modal max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-800" />
                <h3 className="text-sm font-semibold text-slate-900">Publish Campus Circular</h3>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Circular Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for End-Semester Practical Examinations"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as NoticeCategory)}
                    className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Academic">Academic</option>
                    <option value="Exams">Exams</option>
                    <option value="Placements">Placements</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Circular Text & Directives <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the official notification details, guidelines, venue instructions, and dates..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Attachment Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. End_Sem_TimeTable_Nov2026.pdf"
                  value={attachmentName}
                  onChange={e => setAttachmentName(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-border rounded bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinToTop"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded border-border text-teal-700 focus:ring-teal-700"
                />
                <label htmlFor="pinToTop" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Pin this circular to the top of all student and faculty feeds
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPublishModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Publish Circular
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticesPage;
