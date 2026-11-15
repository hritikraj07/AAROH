import React, { useState, useRef } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useApp } from '../../../context/AppContext';
import { LostFoundCategory, LostFoundType } from '../../../types';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export interface ReportLostFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: LostFoundType;
}

export const ReportLostFoundModal: React.FC<ReportLostFoundModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'lost',
}) => {
  const { createLostFoundItem, student, user, showToast } = useApp();

  const [type, setType] = useState<LostFoundType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LostFoundCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Image Upload State (Base64)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoFileSize, setPhotoFileSize] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB Storage Protection Limit

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Storage Protection: Enforce strict 1MB limit for localStorage safety
    if (file.size > MAX_FILE_SIZE) {
      showToast({
        type: 'error',
        title: 'Image exceeds 1MB limit',
        message: `Selected file is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please choose an image under 1MB to preserve browser offline storage.`,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Type validation
    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'Unsupported file type',
        message: 'Please select an image file (PNG, JPG, WebP, etc.).',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Read via HTML5 FileReader API to Base64
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoBase64(reader.result);
        setPhotoFileName(file.name);
        setPhotoFileSize((file.size / 1024).toFixed(0) + ' KB');
      }
    };
    reader.onerror = () => {
      showToast({
        type: 'error',
        title: 'Upload failed',
        message: 'Could not process the uploaded photo file. Please try another image.',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoBase64(null);
    setPhotoFileName('');
    setPhotoFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    const currentUser = user || student;

    createLostFoundItem({
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      date,
      reportedBy: {
        id: currentUser?.id,
        email: currentUser?.email,
        name: currentUser?.name || 'Aaroh Student',
        studentId: currentUser?.rollNumber || currentUser?.id || '22CS042',
        isCurrentUser: true,
      },
      imageUrl: photoBase64 || undefined,
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setLocation('');
    handleRemovePhoto();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
      subtitle="Your post will be visible across the campus registry. Privacy is protected."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-md border border-border">
          <button
            type="button"
            onClick={() => setType('lost')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
              type === 'lost'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setType('found')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
              type === 'found'
                ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Found Something
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Item Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Casio fx-991EX Scientific Calculator"
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as LostFoundCategory)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900"
            >
              <option value="Electronics">Electronics</option>
              <option value="ID & Cards">ID & Cards</option>
              <option value="Keys & Wallets">Keys & Wallets</option>
              <option value="Books & Notes">Books & Notes</option>
              <option value="Personal Belongings">Personal Belongings</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date {type === 'lost' ? 'Lost' : 'Found'}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Campus Location <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Central Library 2nd Floor Reading Room or CS Lab 3"
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Detailed Description & Distinguishing Marks
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Include color, brand, unique stickers, markings, serial hints, or condition..."
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900 resize-none"
          />
        </div>

        {/* Offline Base64 Photo Upload (Strict 1MB Limit) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Item Photo (Optional)
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Max 1MB (Offline Base64)</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="lostFoundPhotoUpload"
          />

          {photoBase64 ? (
            <div className="p-3 bg-slate-50 border border-border rounded-lg space-y-2">
              <div className="relative rounded overflow-hidden border border-border bg-slate-100 max-h-48 flex items-center justify-center">
                <img
                  src={photoBase64}
                  alt="Item preview"
                  className="w-full h-40 object-cover"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5 truncate text-slate-700">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="truncate font-mono text-[11px]">{photoFileName}</span>
                  <span className="text-slate-400 font-mono text-[10px]">({photoFileSize})</span>
                </div>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-rose-700 hover:text-rose-900 font-medium flex items-center gap-1 px-2 py-0.5 rounded hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="lostFoundPhotoUpload"
              className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 hover:border-teal-600 rounded-lg bg-slate-50/50 hover:bg-teal-50/20 cursor-pointer transition-colors group"
            >
              <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-teal-700 mb-1 transition-colors" />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-teal-900">
                Choose an image file from device
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, or WebP under 1MB (persisted offline in browser)
              </span>
            </label>
          )}
        </div>

        {/* Notice on Privacy */}
        <div className="p-2.5 bg-slate-50 border border-border rounded text-[11px] text-slate-500 leading-relaxed">
          <p>
            <strong className="text-slate-700">Privacy Protection:</strong> Phone numbers and personal email addresses are never displayed publicly. Other students coordinate with you through the in-app "Request Contact" exchange.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Publish to Board
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportLostFoundModal;
