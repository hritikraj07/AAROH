import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs } from '../components/ui/Tabs';
import { TimetableTab } from '../components/modules/academics/TimetableTab';
import { AttendanceTab } from '../components/modules/academics/AttendanceTab';
import { AssignmentsTab } from '../components/modules/academics/AssignmentsTab';
import { AcademicResultsTab } from '../components/modules/academics/AcademicResultsTab';
import { SkillTreeTab } from '../components/modules/academics/SkillTreeTab';
import { useApp } from '../context/AppContext';
import { Clock, CheckSquare, Calendar, Award, Network } from 'lucide-react';

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
      label: 'Timetable',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      count: lowAttendanceCount > 0 ? lowAttendanceCount : undefined,
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'assignments',
      label: 'Assignments',
      count: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : undefined,
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'results',
      label: 'Results & GPA',
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: 'skill-tree',
      label: 'Course Syllabus',
      icon: <Network className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Tab Bar */}
      <div>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Academic Operations</h2>
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
        {(activeTab === 'skill-tree' || activeTab === 'curriculum' || activeTab === 'courses') && <SkillTreeTab />}
      </div>
    </div>
  );
};
