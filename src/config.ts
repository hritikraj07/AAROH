export const APP_CONFIG = {
  appName: 'Aaroh',
  tagline: 'One platform for college life',
  collegeName: 'Apex Institute of Technology',
  collegeShortName: 'AIT',
  academicSession: '2026-2027',
  currentSemester: 'Semester 5 (Autumn)',
  supportEmail: 'support@aaroh.ait.edu',
  defaultAttendanceThreshold: 75, // percentage
  version: '1.0.0',
} as const;

export type AppConfig = typeof APP_CONFIG;
