import React, { useState, useRef } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useApp } from '../../../context/AppContext';
import { LostFoundCategory, LostFoundType } from '../../../types';
import { compressImage } from '../../../utils/imageUtils';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';

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

  // Image Upload & Compression State
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoSizeKB, setPhotoSizeKB] = useState<number>(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setIsCompressing(true);

    try {
      // Compress using HTML5 Canvas utility
      const compressedDataUrl = await compressImage(file, 800, 0.7);

      // Calculate Base64 size in KB: Math.round((compressedDataUrl.length * 3) / 4) / 1024
      const sizeInKB = Math.round((compressedDataUrl.length * 3) / 4) / 1024;

      if (sizeInKB > 500) {
        const errorMsg = `Compressed image size (${sizeInKB.toFixed(1)} KB) exceeds the 500 KB storage safety limit. Please choose a smaller photo.`;
        setPhotoError(errorMsg);
        showToast({
          type: 'error',
          title: 'Image exceeds 500KB',
          message: errorMsg,
        });
        setPhotoBase64(null);
        setPhotoSizeKB(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setPhotoBase64(compressedDataUrl);
        setPhotoSizeKB(Number(sizeInKB.toFixed(1)));
        setPhotoFileName(file.name);
      }
    } catch (err) {
      const errorMsg = 'Failed to compress image. Please select a valid image file.';
      setPhotoError(errorMsg);
      showToast({
        type: 'error',
        title: 'Compression Error',
        message: errorMsg,
      });
      setPhotoBase64(null);
      setPhotoSizeKB(0);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoBase64(null);
    setPhotoFileName('');
    setPhotoSizeKB(0);
    setPhotoError(null);
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

    // Reset form
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
      subtitle="Your post will be cataloged in the campus registry. Privacy is strictly protected."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {/* Type Radio Group */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Listing Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md">
            <label
              className={`flex items-center gap-2.5 p-2.5 min-h-[44px] rounded cursor-pointer transition-colors border ${
                type === 'lost'
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200 font-semibold'
                  : 'bg-white dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202025]'
              }`}
            >
              <input
                type="radio"
                name="itemType"
                value="lost"
                checked={type === 'lost'}
                onChange={() => setType('lost')}
                className="text-rose-600 focus:ring-rose-500 border-slate-200 dark:border-[#27272A]"
              />
              <span className="text-xs">Lost Item</span>
            </label>

            <label
              className={`flex items-center gap-2.5 p-2.5 min-h-[44px] rounded cursor-pointer transition-colors border ${
                type === 'found'
                  ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200 font-semibold'
                  : 'bg-white dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202025]'
              }`}
            >
              <input
                type="radio"
                name="itemType"
                value="found"
                checked={type === 'found'}
                onChange={() => setType('found')}
                className="text-teal-700 focus:ring-teal-600 border-slate-200 dark:border-[#27272A]"
              />
              <span className="text-xs">Found Item</span>
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Item Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Casio fx-991EX Scientific Calculator"
            className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as LostFoundCategory)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 text-slate-900 dark:text-slate-100"
            >
              <option value="Electronics">Electronics</option>
              <option value="ID & Cards">ID & Cards</option>
              <option value="Keys & Wallets">Keys & Wallets</option>
              <option value="Books & Notes">Books & Notes</option>
              <option value="Personal Belongings">Personal Belongings</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Campus Location <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Central Library 2nd Floor Reading Room or CS Lab 3"
            className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Detailed Description & Distinguishing Marks
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Include color, brand, unique stickers, markings, serial hints, or condition..."
            className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
          />
        </div>

        {/* Photo Upload with Canvas Compression & 500KB Guard */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Photo (Optional)
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              Auto-compressed &bull; Max 500KB
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            id="reportItemPhotoInput"
          />

          {isCompressing ? (
            <div className="p-6 border border-dashed border-teal-300 dark:border-teal-700 rounded-lg bg-teal-50/30 dark:bg-teal-950/30 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-teal-700 dark:text-teal-400 animate-spin" />
              <span className="text-xs font-medium text-teal-900 dark:text-teal-200">
                Compressing photo with HTML5 Canvas...
              </span>
            </div>
          ) : photoBase64 ? (
            <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-lg space-y-2">
              <div className="relative rounded overflow-hidden border border-slate-200 dark:border-[#27272A] bg-slate-100 dark:bg-[#18181B] h-48 w-full flex items-center justify-center">
                <img
                  src={photoBase64}
                  alt="Cropped item preview"
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5 truncate text-slate-700 dark:text-slate-300">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                  <span className="truncate font-mono text-[11px]">{photoFileName}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-semibold">
                    ({photoSizeKB} KB compressed)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-medium flex items-center gap-1 px-2 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="reportItemPhotoInput"
                className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-600 dark:hover:border-teal-400 rounded-lg bg-slate-50/50 dark:bg-[#111115]/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 cursor-pointer transition-colors group"
              >
                <UploadCloud className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-teal-700 dark:group-hover:text-teal-400 mb-1 transition-colors" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-teal-900 dark:group-hover:text-teal-200">
                  Select image file to upload
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Resized to 800px &amp; compressed below 500KB for offline storage
                </span>
              </label>

              {photoError && (
                <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded text-xs text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{photoError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notice on Privacy */}
        <div className="p-2.5 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <p>
            <strong className="text-slate-700 dark:text-slate-300">Privacy Protection:</strong> Phone numbers and emails are never displayed publicly. Other students connect with you via in-app "Request Contact" tokens.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#27272A]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isCompressing}>
            Publish to Board
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportLostFoundModal;
