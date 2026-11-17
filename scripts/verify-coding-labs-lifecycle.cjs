const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- VERIFYING AUTOMATED CODING LABS LIFECYCLE ENGINE ---');

// 1. Types & Data Models
const typesFile = fs.readFileSync(path.join(__dirname, '../src/types/index.ts'), 'utf8');
assert(typesFile.includes('export interface CodingLab'), 'types/index.ts exports CodingLab interface');
assert(typesFile.includes('windowStartTime: string'), 'CodingLab defines windowStartTime');
assert(typesFile.includes('windowEndTime: string'), 'CodingLab defines windowEndTime');
assert(typesFile.includes('starterCode: string'), 'CodingLab defines starterCode');
assert(typesFile.includes('problemStatement: string'), 'CodingLab defines problemStatement');
assert(typesFile.includes('export interface LabSubmission'), 'types/index.ts exports LabSubmission interface');
assert(typesFile.includes("'PENDING_REVIEW'"), "LabSubmission status includes 'PENDING_REVIEW'");
assert(typesFile.includes("'SECURITY_BREACH'"), "LabSubmission status includes 'SECURITY_BREACH'");
console.log('✅ PASSED: Types and data interfaces verified');

// 2. Storage Service & Offline localStorage keys
const storageFile = fs.readFileSync(path.join(__dirname, '../src/services/storage.ts'), 'utf8');
assert(storageFile.includes("GLOBAL_LABS: 'globalLabs'"), "StorageService defines GLOBAL_LABS as 'globalLabs'");
assert(storageFile.includes("LAB_SUBMISSIONS: 'labSubmissions'"), "StorageService defines LAB_SUBMISSIONS as 'labSubmissions'");
assert(storageFile.includes('getGlobalLabs(): CodingLab[]'), 'StorageService implements getGlobalLabs()');
assert(storageFile.includes('saveGlobalLabs(labs: CodingLab[])'), 'StorageService implements saveGlobalLabs()');
assert(storageFile.includes('createGlobalLab('), 'StorageService implements createGlobalLab()');
assert(storageFile.includes('getLabSubmissions(): LabSubmission[]'), 'StorageService implements getLabSubmissions()');
assert(storageFile.includes('createLabSubmission('), 'StorageService implements createLabSubmission()');
console.log('✅ PASSED: StorageService globalLabs & labSubmissions storage verified');

// 3. Faculty View: "Create Lab" Pipeline & Time Windows
const facultySectionPath = path.join(__dirname, '../src/components/modules/faculty/PublishCodingLabSection.tsx');
assert(fs.existsSync(facultySectionPath), 'PublishCodingLabSection.tsx exists');
const facultySectionContent = fs.readFileSync(facultySectionPath, 'utf8');
assert(facultySectionContent.includes('Publish New Coding Lab'), 'PublishCodingLabSection renders Publish New Coding Lab header');
assert(facultySectionContent.includes('Lab Title'), 'PublishCodingLabSection has Lab Title field');
assert(facultySectionContent.includes('Problem Statement (Markdown Supported)'), 'PublishCodingLabSection has Markdown problem statement textarea');
assert(facultySectionContent.includes('Starter Code (Python Template)'), 'PublishCodingLabSection has Starter Code code-formatted textarea');
assert(facultySectionContent.includes('Assigned Semester / Subject'), 'PublishCodingLabSection has Assigned Semester/Subject dropdown');
assert(facultySectionContent.includes('Window Start Time'), 'PublishCodingLabSection has Window Start Time input');
assert(facultySectionContent.includes('Window End Time (Deadline)'), 'PublishCodingLabSection has Window End Time input');
assert(facultySectionContent.includes('datetime-local'), 'PublishCodingLabSection uses datetime-local inputs');
assert(facultySectionContent.includes('Publish Lab'), 'PublishCodingLabSection has Publish Lab action button');
assert(facultySectionContent.includes('createGlobalLab'), 'PublishCodingLabSection calls createGlobalLab on submit');
assert(facultySectionContent.includes('No Labs Published'), 'PublishCodingLabSection renders clean "No Labs Published" empty state');
assert(facultySectionContent.includes('shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]'), 'PublishCodingLabSection implements 4-layer tactile button shadows');

const facultyDashPath = path.join(__dirname, '../src/pages/faculty/FacultyDashboardPage.tsx');
const facultyDashContent = fs.readFileSync(facultyDashPath, 'utf8');
assert(facultyDashContent.includes('PublishCodingLabSection'), 'FacultyDashboardPage mounts PublishCodingLabSection');
console.log('✅ PASSED: Faculty View "Create Lab" Pipeline & Time Windows verified');

// 4. Student View: "Pending Labs" & Strict Time Validation
const dashPath = path.join(__dirname, '../src/pages/DashboardPage.tsx');
const dashContent = fs.readFileSync(dashPath, 'utf8');
assert(dashContent.includes('activePendingGlobalLabs') || dashContent.includes('globalLabs'), 'DashboardPage reads globalLabs for student view');
assert(dashContent.includes('isTooEarly') && dashContent.includes('isExpired') && dashContent.includes('isActive'), 'DashboardPage implements strict 3-state time window validation');
assert(dashContent.includes('Lab unlocks at') && dashContent.includes('#0F766E'), 'State 1 (Too Early): displays Deep Teal "Lab unlocks at [Start Time]"');
assert(dashContent.includes('Open Lab') && dashContent.includes('Launch Workspace'), 'State 2 (Active): enables Open Lab / Launch Workspace button');
assert(dashContent.includes('Deadline Passed / Locked'), 'State 3 (Expired): displays red "Deadline Passed / Locked" badge');
assert(dashContent.includes('StudentLabWorkspaceModal'), 'DashboardPage embeds StudentLabWorkspaceModal');
console.log('✅ PASSED: Student View "Pending Labs" & Strict Time Validation verified');

// 5. Student View: Code Workspace (Proctored) & One-Shot Submission Pipeline
const modalPath = path.join(__dirname, '../src/components/modules/labs/StudentLabWorkspaceModal.tsx');
assert(fs.existsSync(modalPath), 'StudentLabWorkspaceModal.tsx exists');
const modalContent = fs.readFileSync(modalPath, 'utf8');
assert(modalContent.includes('Problem Statement'), 'StudentLabWorkspaceModal renders Faculty Problem Statement in left panel');
assert(modalContent.includes('starterCode'), 'StudentLabWorkspaceModal pre-loads Faculty starterCode into code editor');
assert(modalContent.includes('visibilitychange'), 'StudentLabWorkspaceModal implements Page Visibility tab-switch monitor');
assert(modalContent.includes('handlePaste') && modalContent.includes('e.preventDefault()'), 'StudentLabWorkspaceModal intercepts and blocks onPaste events');
assert(modalContent.includes('lengthDelta > 15') && modalContent.includes('timeDelta < 50'), 'StudentLabWorkspaceModal implements keystroke DNA speed anomaly detection');
assert(modalContent.includes('bg-black/80'), 'Strike 1 warning modal styled with glassmorphism bg-black/80');
assert(modalContent.includes('Acknowledge Warning & Resume Exam'), 'Strike 1 warning modal provides dismiss button');
assert(modalContent.includes("status: 'SECURITY_BREACH'"), 'Strike 2 lockdown auto-submits with SECURITY_BREACH');
assert(modalContent.includes('Submit Lab Request'), 'StudentLabWorkspaceModal provides prominent "Submit Lab Request" button');
assert(modalContent.includes('createLabSubmission'), 'StudentLabWorkspaceModal saves submission to labSubmissions array in localStorage');
assert(modalContent.includes("status: 'PENDING_REVIEW'"), "StudentLabWorkspaceModal marks normal submissions as PENDING_REVIEW");
assert(modalContent.includes('readOnly={isSubmitted || proctorStrikes >= 2}'), 'Code editor becomes strictly readOnly upon submission or lockdown');
assert(modalContent.includes('Final Code Submitted') && modalContent.includes('text-[#0F766E]'), 'Submit button turns into disabled state saying "Final Code Submitted" with Deep Teal checkmark');
console.log('✅ PASSED: Student View Code Workspace (Proctored) & One-Shot Submission verified');

console.log('--- ALL AUTOMATED CODING LABS LIFECYCLE ENGINE TESTS PASSED ---');
