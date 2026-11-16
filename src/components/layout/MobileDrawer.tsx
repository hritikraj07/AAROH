import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#18181B] h-full z-10 flex flex-col border-r border-slate-200 dark:border-[#27272A] shadow-sm animate-in fade-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-3 p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202025] z-20"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="h-full">
          <Sidebar onCloseMobile={onClose} />
        </div>
      </div>
    </div>
  );
};
