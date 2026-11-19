import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Mail } from 'lucide-react';
import { User, AttendanceRecord, Assignment } from '../../../types';
import {
  hasCoordinatorPrivileges,
  getAssignedStudentsForCoordinator,
  analyzeAtRiskStudents,
} from '../../../utils/coordinatorAnalyzer';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

interface EarlyWarningSystemCardProps {
  currentUser: User | null;
  users: User[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  onTriggerIntervention: (studentName: string) => void;
}

export const EarlyWarningSystemCard: React.FC<EarlyWarningSystemCardProps> = ({
  currentUser,
  users,
  attendance,
  assignments,
  onTriggerIntervention,
}) => {
  const [isSimulatedClear, setIsSimulatedClear] = useState<boolean>(false);

  // 1. Check if logged-in faculty member has coordinator privileges
  const isCoordinator = hasCoordinatorPrivileges(currentUser, users);
  if (!isCoordinator) {
    return null;
  }

  // 2. Scan users array and filter for students assigned to this coordinator
  const assignedStudents = getAssignedStudentsForCoordinator(currentUser, users);

  // 3. Calculate metrics and filter for at-risk students
  const analyzedAtRisk = analyzeAtRiskStudents(assignedStudents, attendance, assignments);
  const atRiskStudents = isSimulatedClear ? [] : analyzedAtRisk;

  return (
    <div className="space-y-4">
      {atRiskStudents.length === 0 ? (
        /* Empty State: Green Success State */
        <div className="bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/50 rounded-2xl p-6 transition-all duration-200 select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-green-950 dark:text-green-300">
                  Early Warning System: All Students on Track
                </h3>
                <p className="text-xs mt-0.5 opacity-90 font-medium text-green-800 dark:text-green-400">
                  All assigned students are currently on track.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-green-100/70 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 font-semibold">
                {assignedStudents.length} Students Monitored
              </span>
              {isSimulatedClear && (
                <button
                  type="button"
                  onClick={() => setIsSimulatedClear(false)}
                  className="text-xs font-semibold underline ml-2 cursor-pointer hover:opacity-80"
                >
                  View Live Alerts
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Prominent At-Risk Card: Subtle Danger Colors */
        <div className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 border rounded-2xl p-6 sm:p-7 transition-all duration-200 select-none space-y-4">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-200/60 dark:border-red-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-950 dark:text-red-200 tracking-tight">
                  ⚠️ Early Warning System: Intervention Required
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                  Coordinator Alert: {atRiskStudents.length} assigned {atRiskStudents.length === 1 ? 'student requires' : 'students require'} proactive academic intervention
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSimulatedClear(true)}
                className="text-[11px] font-mono text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 underline px-2 py-1 cursor-pointer"
                title="Toggle clear state for demonstration"
              >
                Simulate Clear State
              </button>
            </div>
          </div>

          {/* Clean, Borderless List of At-Risk Students */}
          <div className="space-y-2.5">
            {atRiskStudents.map(({ student, issues }) => (
              <div
                key={student.id}
                className="bg-white/90 dark:bg-[#18181B] border border-red-200/60 dark:border-red-900/40 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                {/* Left: Avatar & Student Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {student.avatarInitials || student.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {student.name}
                      </span>
                      {student.rollNumber && (
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          ({student.rollNumber})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {student.program || 'B.Tech CSE'} • Sem {student.semester || 1} • {student.email}
                    </p>
                  </div>
                </div>

                {/* Right: Red Badges & Pill-Shaped Action Button */}
                <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-center shrink-0">
                  {issues.map(issue => (
                    <span
                      key={issue}
                      className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                    >
                      {issue}
                    </span>
                  ))}

                  <button
                    type="button"
                    onClick={() => onTriggerIntervention(student.name)}
                    className={`rounded-full px-3.5 py-2 min-h-[44px] text-xs font-semibold bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white transition-all duration-200 active:scale-95 border border-[#8DA9C4]/30 inline-flex items-center justify-center gap-1.5 cursor-pointer select-none ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Trigger Intervention</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EarlyWarningSystemCard;
