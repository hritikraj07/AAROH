import React, { useState } from 'react';
import { ProfileHeader } from '../components/modules/dashboard/ProfileHeader';
import { QuickActionsRow } from '../components/modules/dashboard/QuickActionsRow';
import { TodayClassesCard } from '../components/modules/dashboard/TodayClassesCard';
import { AttendanceAlertsWidget } from '../components/modules/dashboard/AttendanceAlertsWidget';
import { WeekAssignmentsWidget } from '../components/modules/dashboard/WeekAssignmentsWidget';
import { PinnedNoticesWidget } from '../components/modules/dashboard/PinnedNoticesWidget';
import { UpcomingEventsWidget } from '../components/modules/dashboard/UpcomingEventsWidget';
import { ReportLostFoundModal } from '../components/modules/lostfound/ReportLostFoundModal';

export const DashboardPage: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. Compact Profile Header */}
      <ProfileHeader />

      {/* 2. Quick Actions Row */}
      <QuickActionsRow onReportLostItem={() => setIsReportModalOpen(true)} />

      {/* 3. Grid of Core Action Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's / Next Classes */}
        <TodayClassesCard />

        {/* Attendance Summary */}
        <AttendanceAlertsWidget />

        {/* Assignments Due */}
        <WeekAssignmentsWidget />

        {/* Split Column: Pinned Notices & Events */}
        <div className="grid grid-cols-1 gap-6">
          <PinnedNoticesWidget />
          <UpcomingEventsWidget />
        </div>
      </div>

      {/* Report Modal */}
      <ReportLostFoundModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
