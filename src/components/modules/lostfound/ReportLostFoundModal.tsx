import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useApp } from '../../../context/AppContext';
import { LostFoundCategory, LostFoundType } from '../../../types';
import { UploadCloud, Check } from 'lucide-react';

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
  const { createLostFoundItem, student } = useApp();

  const [type, setType] = useState<LostFoundType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LostFoundCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [icon, setIcon] = useState('box');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    createLostFoundItem({
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      date,
      reportedBy: {
        name: student.name,
        studentId: student.rollNumber,
        isCurrentUser: true,
      },
      imageIcon: icon,
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setLocation('');
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
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Item Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Casio fx-991EX Scientific Calculator"
            className="w-full text-xs px-3 py-2 bg-white border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as LostFoundCategory)}
              className="w-full text-xs px-3 py-2 bg-white border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900"
            >
              <option value="Electronics">Electronics</option>
              <option value="ID & Cards">ID & Cards</option>
              <option value="Keys & Wallets">Keys & Wallets</option>
              <option value="Books & Notes">Books & Notes</option>
              <option value="Personal Belongings">Personal Belongings</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date {type === 'lost' ? 'Lost' : 'Found'}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Location <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. CS Lab 3, LH-201, or Central Library Ground Floor"
            className="w-full text-xs px-3 py-2 bg-white border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Detailed Description & Distinguishing Marks
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Include color, brand, unique stickers, markings, or conditions..."
            className="w-full text-xs px-3 py-2 bg-white border border-border rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-900 resize-none"
          />
        </div>

        {/* Visual Tag Icon Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Item Icon Graphic
          </label>
          <div className="flex items-center gap-2">
            {[
              { id: 'mouse', label: 'Mouse/Gadget' },
              { id: 'calculator', label: 'Calculator' },
              { id: 'badge', label: 'ID Card' },
              { id: 'key', label: 'Key/Wallet' },
              { id: 'watch', label: 'Watch' },
              { id: 'box', label: 'General' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIcon(item.id)}
                className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
                  icon === item.id
                    ? 'bg-teal-50 text-teal-800 border-teal-600 font-semibold'
                    : 'bg-white text-slate-600 border-border hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notice on Privacy */}
        <div className="p-2.5 bg-slate-50 border border-border rounded text-[11px] text-slate-500">
          <p>
            <strong>Privacy Protection:</strong> Your personal phone number or email will never be exposed. Other students will reach you via in-app "Request Contact" tokens.
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
