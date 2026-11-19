export const APP_CONFIG = {
  appName: 'Aaroh',
  tagline: 'One platform for college life',
  collegeName: 'K.R. Mangalam University',
  collegeShortName: 'KRMU',
  academicSession: '2026-2027',
  currentSemester: 'Semester 1 (Autumn)',
  supportEmail: 'support@aaroh.krmu.edu.in',
  defaultAttendanceThreshold: 75, // percentage
  version: '1.0.0',
} as const;

export type AppConfig = typeof APP_CONFIG;
