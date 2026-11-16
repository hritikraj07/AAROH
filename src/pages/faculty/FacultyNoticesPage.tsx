import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Bell,
  Pin,
  Trash2,
  Plus,
  Search,
  X,
  FileText,
  Building,
  Calendar,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { Notice, NoticeCategory } from '../../types';

export const FacultyNoticesPage: React.FC = () => {
  const { user, notices, createNotice, deleteNotice, togglePinNotice } = useApp();

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Academic');
  const [department, setDepartment] = useState(
    user?.department || 'Department of Computer Science & Engineering'
  );
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');

  const categories: (NoticeCategory | 'all')[] = ['all', 'Academic', 'Exams', 'General'];

  // Filter notices for department view
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
              size: '380 KB',
              type: 'application/pdf',
            },
          ]
        : [],
    });

    setTitle('');
    setContent('');
    setAttachmentName('');
    setIsPinned(false);
    setIsDraftModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Department Circulars & Notices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Draft, publish, and manage academic notices, syllabus circulars, and exam advisories for students.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsDraftModalOpen(true)}
        >
          Draft Department Notice
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#18181B] p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars, department memos, syllabus updates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 uppercase text-[10px]">
            Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded transition-all duration-150 ease-in-out whitespace-nowrap capitalize ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Table */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#27272A]/50 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Published Bulletins ({filteredNotices.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {user?.department || 'Department Notices'}
          </span>
        </div>

        {filteredNotices.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-2 bg-white dark:bg-[#18181B]">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">No department notices found</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Draft a circular to broadcast lab scheduling changes, class notes, or faculty office hours.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsDraftModalOpen(true)}
            >
              Draft Circular Now
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#27272A]/70 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">Pin</th>
                  <th className="py-3 px-4">Subject / Title</th>
                  <th className="py-3 px-4 w-32">Category</th>
                  <th className="py-3 px-4 w-44">Department</th>
                  <th className="py-3 px-4 w-28">Date</th>
                  <th className="py-3 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#27272A]">
                {filteredNotices.map(notice => (
                  <tr key={notice.id} className="hover:bg-slate-50/70 dark:hover:bg-[#27272A]/40 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePinNotice(notice.id)}
                        className={`p-1 rounded transition-colors ${
                          notice.isPinned
                            ? 'text-teal-700 dark:text-teal-400 hover:text-teal-900 bg-teal-50 dark:bg-teal-950/40'
                            : 'text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                        title={notice.isPinned ? 'Unpin notice' : 'Pin to top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{notice.title}</span>
                          {notice.attachments && notice.attachments.length > 0 && (
                            <span className="text-[10px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-1 rounded flex items-center gap-0.5">
                              <Paperclip className="w-2.5 h-2.5" />
                              PDF
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {notice.content}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="teal" size="sm">
                        {notice.category}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {notice.department}
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {notice.publishedDate}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteNotice(notice.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete notice"
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

      {/* Draft & Publish Notice Modal */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#27272A]/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-800 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Draft Department Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDraftModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishNotice} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS301 Laboratory Schedule Change & Viva Dates"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as NoticeCategory)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Exams">Exams</option>
                    <option value="General">General</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Issuing Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Circular Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write notice body, instructions for students, relevant deadlines, and faculty contact info..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Attachment Name (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Lab_Experiment_Manual_2026.pdf"
                    value={attachmentName}
                    onChange={e => setAttachmentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="facultyPinNotice"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded border-slate-200 text-teal-700 focus:ring-teal-700"
                />
                <label htmlFor="facultyPinNotice" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Pin to top of student notice board
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#27272A]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDraftModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Publish Notice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyNoticesPage;
