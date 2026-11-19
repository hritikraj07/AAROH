import { Notice } from '../types';

export const DEFAULT_CAMPUS_NOTICES: Notice[] = [
  {
    id: 'not_exams_odd_sem_2026',
    title: 'End-Semester Theory Examinations: Odd Semester (2026-27)',
    category: 'Exams',
    priorityTag: 'Important / Official Circular',
    issuedBy: 'Office of the Controller of Examinations (COE), K.R. Mangalam University',
    department: 'Office of the Controller of Examinations (COE)',
    publishedDate: '2026-11-19',
    startWindow: 'Starts: 3rd Week of Dec 2026',
    effectiveDate: 'Starting from the Third Week of December 2026 (Tentatively 14 December 2026 onwards)',
    summary: 'End-semester theory examinations for all undergraduate and postgraduate programmes will commence in the third week of December 2026. Students must ensure attendance and fee compliance before admit card issuance.',
    content: `End-semester theory examinations for all undergraduate and postgraduate programmes will commence in the third week of December 2026. Students must ensure attendance and fee compliance before admit card issuance.

Official Examination Guidelines:
1. Commencement: Beginning of the third week of December 2026 (subject-wise date sheet will be published shortly).
2. Eligibility: Minimum 75% attendance is mandatory as per university norms to sit for the examinations.
3. Admit Cards: Downloadable from the student portal one week prior to the exams after clearing all academic and departmental dues.
4. Exam Hall Guidelines: Carry your valid KRMU Student ID card and printed Admit Card; report to the allotted examination hall at least 30 minutes before the scheduled start time.`,
    circularPoints: [
      {
        label: 'Commencement',
        text: 'Beginning of the third week of December 2026 (subject-wise date sheet will be published shortly).',
      },
      {
        label: 'Eligibility',
        text: 'Minimum 75% attendance is mandatory as per university norms to sit for the examinations.',
      },
      {
        label: 'Admit Cards',
        text: 'Downloadable from the student portal one week prior to the exams after clearing all academic and departmental dues.',
      },
      {
        label: 'Exam Hall Guidelines',
        text: 'Carry your valid KRMU Student ID card and printed Admit Card; report to the allotted examination hall at least 30 minutes before the scheduled start time.',
      },
    ],
    isPinned: true,
    readByCurrentUser: false,
    attachments: [
      {
        name: 'COE_Theory_Exams_Schedule_Notice_2026.pdf',
        size: '245 KB',
        type: 'application/pdf',
      },
    ],
  },
  {
    id: 'not_acad_practical_viva_2026',
    title: 'Commencement of End-Semester Practical Examinations & Viva-Voce',
    category: 'Academic',
    priorityTag: 'Academic Schedule',
    issuedBy: 'Office of the Dean Academics, K.R. Mangalam University',
    department: 'Office of the Dean Academics',
    publishedDate: '2026-11-19',
    startWindow: 'Starts: 1st Week of Dec 2026',
    effectiveDate: 'Starting from the First Week of December 2026 (1 December 2026 onwards)',
    summary: 'Internal and external practical examinations, lab evaluations, and viva-voce for the current semester will begin in the first week of December 2026.',
    content: `Internal and external practical examinations, lab evaluations, and viva-voce for the current semester will begin in the first week of December 2026.

Academic Directives:
1. Commencement: First week of December 2026 (batch-wise lab slots and room allocations will be shared by respective School/Department coordinators).
2. Lab Records & Files: All students must bring their completed and faculty-signed Practical Files / Lab Manuals on the day of evaluation.
3. Coding Labs: Students enrolled in Automated Coding Labs must ensure all pending lab modules are submitted before their scheduled practical slot.
4. Attendance: Absence during practical examinations without prior approved medical/official leave will be marked absent with no automatic re-test.`,
    circularPoints: [
      {
        label: 'Commencement',
        text: 'First week of December 2026 (batch-wise lab slots and room allocations will be shared by respective School/Department coordinators).',
      },
      {
        label: 'Lab Records & Files',
        text: 'All students must bring their completed and faculty-signed Practical Files / Lab Manuals on the day of evaluation.',
      },
      {
        label: 'Coding Labs',
        text: 'Students enrolled in Automated Coding Labs must ensure all pending lab modules are submitted before their scheduled practical slot.',
      },
      {
        label: 'Attendance',
        text: 'Absence during practical examinations without prior approved medical/official leave will be marked absent with no automatic re-test.',
      },
    ],
    isPinned: true,
    readByCurrentUser: false,
    attachments: [
      {
        name: 'Dean_Academics_Practical_Viva_Schedule_2026.pdf',
        size: '198 KB',
        type: 'application/pdf',
      },
    ],
  },
];
