import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../../types';
import { X, UserPen, Upload, Trash2, Link as LinkIcon, AlertCircle, Check, Shield, GraduationCap, Briefcase } from 'lucide-react';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  currentRole: UserRole | null;
  onSave: (updates: { name: string; avatarUrl?: string }) => void;
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize state when modal opens or currentUser changes
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      const existingAvatar = currentUser.avatarUrl || '';
      setAvatarUrl(existingAvatar);
      setCustomUrlInput(existingAvatar.startsWith('data:') ? '' : existingAvatar);
      setShowUrlField(Boolean(existingAvatar && !existingAvatar.startsWith('data:')));
      setErrorMessage(null);
      setIsSavedRecently(false);
    }
  }, [isOpen, currentUser]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate dynamic initials based on current name input
  const calculateInitials = (text: string): string => {
    const trimmed = text.trim();
    if (!trimmed) {
      if (currentRole === 'admin') return 'AD';
      if (currentRole === 'faculty') return 'FA';
      return 'ST';
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Selected image is too large. Maximum allowed size is 2MB.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        setCustomUrlInput('');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);

    // Reset input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setAvatarUrl('');
      return;
    }
    setErrorMessage(null);
    setAvatarUrl(trimmed);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setCustomUrlInput('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Name is required and cannot be empty.');
      return;
    }

    onSave({
      name: trimmedName,
      avatarUrl: avatarUrl.trim() || undefined,
    });

    setIsSavedRecently(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const initials = calculateInitials(name);

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
            <Shield className="w-3 h-3" />
            <span>Administrator Account</span>
          </span>
        );
      case 'faculty':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
            <Briefcase className="w-3 h-3" />
            <span>Faculty Account</span>
          </span>
        );
      case 'student':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
            <GraduationCap className="w-3 h-3" />
            <span>Student Account</span>
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#111115] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#27272A] overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#27272A] flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-transparent to-transparent dark:from-[#18181B]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-600/20">
              <UserPen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="edit-profile-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Edit Profile
                </h2>
                {getRoleBadge()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your display name and profile picture.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#18181B] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Avatar Preview & Actions Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-100 dark:border-[#27272A]">
            {/* Live Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-2 border-white dark:border-[#27272A] bg-[#134074] flex items-center justify-center text-white font-mono font-bold text-2xl">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name || 'Avatar Preview'}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setErrorMessage('The image URL could not be loaded. Please verify the URL or upload a file.');
                      setAvatarUrl('');
                    }}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </div>

            {/* Photo Actions */}
            <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Profile Photo
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Upload a JPEG, PNG, or WebP image under 2MB.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="profile-photo-upload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#111115] hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-[#27272A] shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlField(prev => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{showUrlField ? 'Hide URL' : 'Image URL'}</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Remove custom photo and use letter initials"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {/* Optional Direct Image URL Input */}
              {showUrlField && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <label htmlFor="edit-profile-name" className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage && e.target.value.trim()) {
                  setErrorMessage(null);
                }
              }}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-colors shadow-xs"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              This name will be displayed in the top bar, attendance check-ins, and activity logs.
            </p>
          </div>

          {/* Account Context (Read-Only) */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#18181B]/80 border border-slate-100 dark:border-[#27272A] grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block">
                Email
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                {currentUser?.email || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block">
                Department
              </span>
              <span className="text-slate-700 dark:text-slate-300 truncate block">
                {currentUser?.department || 'Computer Science & Engineering'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#18181B] border border-slate-300 dark:border-[#27272A] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSavedRecently}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0F2544] hover:bg-[#0B2545] disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
