import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomDropdownOption<T extends string | number = string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: string;
}

export interface CustomDropdownProps<T extends string | number = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: CustomDropdownOption<T>[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function CustomDropdown<T extends string | number = string | number>({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  icon,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  'aria-label': ariaLabel,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = options.findIndex(opt => opt.value === value);
      const nextIndex =
        e.key === 'ArrowDown'
          ? (currentIndex + 1) % options.length
          : (currentIndex - 1 + options.length) % options.length;
      if (options[nextIndex]) {
        onChange(options[nextIndex].value);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        className={`w-full min-h-[42px] px-3.5 py-2 flex items-center justify-between gap-2.5 text-xs font-medium rounded-xl border transition-all duration-150 select-none cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#0F766E] ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A]'
            : 'bg-white dark:bg-[#18181B] hover:bg-slate-50 dark:hover:bg-[#222226] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-slate-100 shadow-sm'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <span className="text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>}
          {selectedOption?.icon && !icon && (
            <span className="text-slate-400 dark:text-slate-500 shrink-0">{selectedOption.icon}</span>
          )}
          <div className="min-w-0 flex-1">
            <span className="block truncate font-medium">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.subtitle && (
              <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {selectedOption.subtitle}
              </span>
            )}
          </div>
          {selectedOption?.badge && (
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 shrink-0 whitespace-nowrap">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-teal-700 dark:text-teal-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 right-0 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 font-sans ${menuClassName}`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic text-center">
              No options available
            </div>
          ) : (
            options.map(opt => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors duration-100 cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-100 font-semibold'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#222226]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {opt.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
                        {opt.icon}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{opt.label}</span>
                      {opt.subtitle && (
                        <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#27272A] text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
