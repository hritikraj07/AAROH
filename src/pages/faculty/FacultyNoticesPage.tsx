import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Paperclip,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { Notice, NoticeCategory } from '../../types';

export const FacultyNoticesPage: React.FC = () => {
  const { user, notices, createNotice, deleteNotice, togglePinNotice, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const shouldAutoOpen = searchParams.get('openDraft') === 'true' || searchParams.get('draft') === 'true';
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(shouldAutoOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State with Safe Defaults
  const defaultDepartment = user?.department || 'Department of Computer Science & Engineering';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Academic');
  const [department, setDepartment] = useState(defaultDepartment);
  const [targetAudience, setTargetAudience] = useState('All B.Tech CSE Students');
  const [priorityTag, setPriorityTag] = useState('Normal Circular');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [hasDraftLoaded, setHasDraftLoaded] = useState(false);

  const categories: (NoticeCategory | 'all')[] = ['all', 'Academic', 'Exams', 'General', 'Administration', 'Placements'];

  // Sync modal state if query param changes
  useEffect(() => {
    if (searchParams.get('openDraft') === 'true' || searchParams.get('draft') === 'true') {
      setIsDraftModalOpen(true);
    }
  }, [searchParams]);

  // Restore saved draft when modal opens
  useEffect(() => {
    if (isDraftModalOpen) {
      try {
        const savedDraft = localStorage.getItem('aaroh_faculty_notice_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === 'object') {
            if (parsed.title) setTitle(parsed.title);
            if (parsed.category) setCategory(parsed.category);
            if (parsed.department) setDepartment(parsed.department);
            if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
            if (parsed.priorityTag) setPriorityTag(parsed.priorityTag);
            if (parsed.content) setContent(parsed.content);
            if (typeof parsed.isPinned === 'boolean') setIsPinned(parsed.isPinned);
            if (parsed.attachmentName) setAttachmentName(parsed.attachmentName);
            setHasDraftLoaded(true);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isDraftModalOpen]);

  // Filter notices for department view with safe string guards
  const filteredNotices = notices.filter(n => {
    if (!n) return false;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.department && n.department.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCloseModal = () => {
    setIsDraftModalOpen(false);
    if (searchParams.get('openDraft') || searchParams.get('draft')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('openDraft');
      nextParams.delete('draft');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const handleSaveDraft = () => {
    if (!title.trim() && !content.trim()) {
      showToast({
        type: 'info',
        title: 'Empty Draft',
        message: 'Please enter a notice title or content before saving draft.',
      });
      return;
    }

    try {
      const draftData = {
        title: title.trim(),
        category,
        department: department.trim(),
        targetAudience,
        priorityTag,
        content: content.trim(),
        isPinned,
        attachmentName: attachmentName.trim(),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('aaroh_faculty_notice_draft', JSON.stringify(draftData));
      setHasDraftLoaded(true);
      showToast({
        type: 'success',
        title: 'Draft Saved',
        message: 'Department notice draft has been saved locally.',
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Draft Save Failed',
        message: 'Could not write draft to local storage.',
      });
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem('aaroh_faculty_notice_draft');
    } catch {
      // ignore
    }
    setTitle('');
    setContent('');
    setAttachmentName('');
    setIsPinned(false);
    setCategory('Academic');
    setTargetAudience('All B.Tech CSE Students');
    setPriorityTag('Normal Circular');
    setDepartment(defaultDepartment);
    setHasDraftLoaded(false);
    showToast({
      type: 'info',
      title: 'Draft Discarded',
      message: 'Notice draft cleared and reset to blank.',
    });
  };

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast({
        type: 'error',
        title: 'Missing Title',
        message: 'Please provide a notice title before publishing.',
      });
      return;
    }
    if (!content.trim()) {
      showToast({
        type: 'error',
        title: 'Missing Content',
        message: 'Please provide circular content before publishing.',
      });
      return;
    }

    createNotice({
      title: title.trim(),
      category,
      department: department.trim() || defaultDepartment,
      content: content.trim(),
      isPinned,
      priorityTag,
      issuedBy: user?.name || user?.full_name || 'Prof. Ramanujan',
      summary: targetAudience ? `Target: ${targetAudience}` : undefined,
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

    try {
      localStorage.removeItem('aaroh_faculty_notice_draft');
    } catch {
      // ignore
    }

    setTitle('');
    setContent('');
    setAttachmentName('');
    setIsPinned(false);
    setHasDraftLoaded(false);
    handleCloseModal();
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
          <div className="flex flex-wrap items-center gap-2 pt-2 font-mono text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Faculty: {user?.full_name || user?.name || 'Faculty Member'} ({user?.username || 'FAC101'})
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-sans">
              Course: {user?.course || 'B.Tech CSE'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-sans">
              Division: {user?.division || 'A'}
            </span>
          </div>
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
            className="w-full pl-9 pr-4 py-2 min-h-[44px] text-xs bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
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
              className={`px-3 py-1.5 min-h-[36px] sm:min-h-[32px] text-xs rounded transition-all duration-150 ease-in-out whitespace-nowrap capitalize ${
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
              className="mt-3 min-h-[44px]"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsDraftModalOpen(true)}
            >
              Draft Circular Now
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs text-left">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#18181B] rounded-2xl shadow-xl border border-slate-200 dark:border-[#27272A] overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-[#27272A] shrink-0 bg-white dark:bg-[#18181B]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-800 dark:text-teal-300 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Draft Department Notice
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Publish academic circulars, memos, and scheduling advisories.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePublishNotice} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-w-0">
                {/* Draft Notification Banner */}
                {hasDraftLoaded && (
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between gap-2 text-xs">
                    <span className="text-teal-800 dark:text-teal-300 font-medium truncate">
                      Restored auto-saved draft from local storage.
                    </span>
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200 font-semibold underline text-[11px] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Discard Draft
                    </button>
                  </div>
                )}

                {/* Notice Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Notice Title <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Clear & descriptive headline
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS301 Laboratory Schedule Change & Viva Dates"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full min-w-0 box-border rounded-xl border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#18181B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
                  />
                </div>

                {/* Metadata Row 1: Category & Target Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
                        Category <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 whitespace-nowrap shrink-0">
                        {category}
                      </span>
                    </div>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as NoticeCategory)}
                      className="w-full min-w-0 box-border rounded-xl border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#18181B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Exams">Exams</option>
                      <option value="General">General</option>
                      <option value="Administration">Administration</option>
                      <option value="Placements">Placements</option>
                    </select>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
                        Target Audience <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap shrink-0">
                        Cohort
                      </span>
                    </div>
                    <select
                      value={targetAudience}
                      onChange={e => setTargetAudience(e.target.value)}
                      className="w-full min-w-0 box-border rounded-xl border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#18181B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
                    >
                      <option value="All B.Tech CSE Students">All B.Tech CSE Students</option>
                      <option value="B.Tech CSE (Sem 5) • Section A">B.Tech CSE (Sem 5) • Section A</option>
                      <option value="B.Tech CSE (AI & ML) Cohort">B.Tech CSE (AI & ML) Cohort</option>
                      <option value="All School of Engineering Students">All School of Engineering Students</option>
                      <option value="Campus-wide General Broadcast">Campus-wide General Broadcast</option>
                    </select>
                  </div>
                </div>

                {/* Metadata Row 2: Priority Tag & Issuing Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
                        Priority Level
                      </label>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 whitespace-nowrap shrink-0">
                        {priorityTag}
                      </span>
                    </div>
                    <select
                      value={priorityTag}
                      onChange={e => setPriorityTag(e.target.value)}
                      className="w-full min-w-0 box-border rounded-xl border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#18181B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
                    >
                      <option value="Normal Circular">Normal Circular</option>
                      <option value="Urgent Advisory">Urgent Advisory</option>
                      <option value="Action Required">Action Required</option>
                      <option value="Official Notification">Official Notification</option>
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 truncate">
                      Issuing Department <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full min-w-0 box-border rounded-xl border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#18181B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
                    />
                  </div>
                </div>

                {/* Circular Content */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Circular Content <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Instructions & deadlines
                    </span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    placeholder="Write notice body, instructions for students, relevant deadlines, and faculty contact info..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full min-w-0 box-border rounded-xl border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#18181B] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 min-h-[120px] resize-y leading-relaxed transition-colors font-sans"
                  />
                </div>

                {/* Attachment Name (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Attachment Name (Optional)
                  </label>
                  <div className="relative">
                    <Paperclip className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Lab_Experiment_Manual_2026.pdf"
                      value={attachmentName}
                      onChange={e => setAttachmentName(e.target.value)}
                      className="w-full min-w-0 box-border rounded-xl border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#18181B] pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
                    />
                  </div>
                </div>

                {/* Pin to Top Checkbox Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#27272A]/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="facultyPinNotice"
                      checked={isPinned}
                      onChange={e => setIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 cursor-pointer"
                    />
                    <label htmlFor="facultyPinNotice" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      Pin to top of student notice board
                    </label>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0">
                    High Visibility
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-[#27272A] bg-slate-50/80 dark:bg-[#18181B] shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                  className="whitespace-nowrap shrink-0"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSaveDraft}
                  className="whitespace-nowrap shrink-0"
                  icon={<Bookmark className="w-3.5 h-3.5" />}
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  className="whitespace-nowrap shrink-0"
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
