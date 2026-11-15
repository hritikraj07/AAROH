import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs } from '../components/ui/Tabs';
import { TimetableTab } from '../components/modules/academics/TimetableTab';
import { AttendanceTab } from '../components/modules/academics/AttendanceTab';
import { AssignmentsTab } from '../components/modules/academics/AssignmentsTab';
import { AcademicResultsTab } from '../components/modules/academics/AcademicResultsTab';
import { useApp } from '../context/AppContext';
import { Clock, CheckSquare, Calendar, Award } from 'lucide-react';

export const AcademicsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'timetable';
  const { pendingAssignmentsCount, lowAttendanceCount } = useApp();

  const handleTabChange = (id: string) => {
    setSearchParams({ tab: id });
  };

  const tabs = [
    {
      id: 'timetable',
      label: 'Class Timetable',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'attendance',
      label: 'Attendance Monitor',
      count: lowAttendanceCount > 0 ? lowAttendanceCount : undefined,
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'assignments',
      label: 'Assignments & Deadlines',
      count: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : undefined,
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'results',
      label: 'Academic Results & GPA',
      icon: <Award className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Tab Bar */}
      <div>
        <div className="mb-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Academic Operations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View section timetables, track attendance regulations, submit assignments, and predict graduation GPA.
          </p>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          variant="underline"
        />
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'timetable' && <TimetableTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'assignments' && <AssignmentsTab />}
        {activeTab === 'results' && <AcademicResultsTab />}
      </div>
    </div>
  );
};
