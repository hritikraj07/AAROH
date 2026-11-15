import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/Button';

export interface QuickActionsRowProps {
  onReportLostItem?: () => void;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({ onReportLostItem }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap mb-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
        Quick Actions:
      </span>

      <Button
        variant="primary"
        size="sm"
        icon={<PlusCircle className="w-3.5 h-3.5" />}
        onClick={() => {
          if (onReportLostItem) {
            onReportLostItem();
          } else {
            navigate('/student/lost-found?action=report');
          }
        }}
      >
        Report lost item
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={<Calendar className="w-3.5 h-3.5 text-slate-500" />}
        onClick={() => navigate('/student/events')}
      >
        Browse events
      </Button>

      <Button
        variant="secondary"
        size="sm"
        icon={<Clock className="w-3.5 h-3.5 text-slate-500" />}
        onClick={() => navigate('/student/academics?tab=timetable')}
      >
        Open timetable
      </Button>
    </div>
  );
};
