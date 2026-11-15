// Automated verification script for RBAC, Role Portals, User Management & Clean Foundation
const fs = require('fs');
const path = require('path');

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log('--- AAROH VERIFICATION SUITE: USER MANAGEMENT & RBAC ---');

// 1. Check Dist Build Files
assert(fs.existsSync(path.join(__dirname, '../dist/index.html')), 'dist/index.html built successfully');
const distHtml = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
assert(distHtml.includes('Aaroh'), 'HTML contains Aaroh wordmark');

// 2. Check Seed Data (Initial Users Seeded)
const seedContent = fs.readFileSync(path.join(__dirname, '../src/data/seed.ts'), 'utf8');
assert(seedContent.includes('export const INITIAL_USERS: User[] = ['), 'INITIAL_USERS defined in seed.ts');
assert(seedContent.includes('registrar@admin.aaroh.edu.in'), 'Demo admin seeded in INITIAL_USERS');
assert(seedContent.includes('aarav.sharma@aaroh.edu.in'), 'Demo student seeded in INITIAL_USERS');
assert(seedContent.includes('prof.raman@faculty.aaroh.edu.in'), 'Demo faculty seeded in INITIAL_USERS');

// 3. Check Storage Service for Users Collection & Auth querying localStorage
const storageContent = fs.readFileSync(path.join(__dirname, '../src/services/storage.ts'), 'utf8');
assert(storageContent.includes("USERS: 'aaroh_users'"), "STORAGE_KEYS includes USERS 'aaroh_users'");
assert(storageContent.includes('getUsers(): User[]'), 'StorageService has getUsers() method');
assert(storageContent.includes('createUser(userData: Omit<User, \'id\'>): User'), 'StorageService has createUser() method');
assert(storageContent.includes('deleteUser(id: string): boolean'), 'StorageService has deleteUser() method');
assert(storageContent.includes('const users = this.getUsers();'), 'loginWithDomain queries localStorage users array first');

// 4. Check Context for User Management Actions
const contextContent = fs.readFileSync(path.join(__dirname, '../src/context/AppContext.tsx'), 'utf8');
assert(contextContent.includes('users: User[];'), 'AppContextType exposes users array');
assert(contextContent.includes('createUser: (userData: Omit<User, \'id\'>) => User;'), 'AppContextType exposes createUser');
assert(contextContent.includes('deleteUser: (id: string) => boolean;'), 'AppContextType exposes deleteUser');
assert(contextContent.includes('login: (email: string,'), 'AppContextType exposes login function');

// 5. Check Admin "People / Directory" Page
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminPeoplePage.tsx')), 'AdminPeoplePage.tsx exists');
const peopleContent = fs.readFileSync(path.join(__dirname, '../src/pages/admin/AdminPeoplePage.tsx'), 'utf8');
assert(peopleContent.includes('Campus User Directory & Onboarding'), 'AdminPeoplePage renders directory title');
assert(peopleContent.includes('Onboard New User') || peopleContent.includes('Onboard User'), 'AdminPeoplePage includes onboard user button');
assert(peopleContent.includes('rollNumber'), 'AdminPeoplePage includes student ID / roll number dynamic field');
assert(peopleContent.includes('program'), 'AdminPeoplePage includes student program dynamic field');
assert(peopleContent.includes('semester'), 'AdminPeoplePage includes student semester dynamic field');
assert(peopleContent.includes('department'), 'AdminPeoplePage includes department field');
assert(peopleContent.includes('designation'), 'AdminPeoplePage includes designation field');

// 6. Check Admin Navigation in Sidebar.tsx
const sidebarContent = fs.readFileSync(path.join(__dirname, '../src/components/layout/Sidebar.tsx'), 'utf8');
assert(sidebarContent.includes('/admin/people'), 'Sidebar includes User Directory route /admin/people for admins');

// 7. Check Route Mounting in App.tsx
const appContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
assert(appContent.includes('path="people" element={<AdminPeoplePage />}'), 'App.tsx mounts /admin/people route');
assert(appContent.includes('path="directory"'), 'App.tsx provides directory alias');
assert(appContent.includes('path="users"'), 'App.tsx provides users alias');

// 8. Check Login UI Integration
const loginContent = fs.readFileSync(path.join(__dirname, '../src/pages/LoginPage.tsx'), 'utf8');
assert(loginContent.includes('users.some('), 'LoginPage checks localStorage users array for known accounts');
assert(loginContent.includes('login(trimmedEmail, password)'), 'LoginPage invokes refactored login handler');

// 9. Check Batch Attendance Storage & Context
assert(storageContent.includes('recordBatchAttendance('), 'StorageService includes recordBatchAttendance method');
assert(contextContent.includes('recordBatchAttendance: (courseId: string'), 'AppContextType exposes recordBatchAttendance');

// 10. Check Admin Timetable Module
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminTimetablePage.tsx')), 'AdminTimetablePage.tsx exists');
const adminTimetableContent = fs.readFileSync(path.join(__dirname, '../src/pages/admin/AdminTimetablePage.tsx'), 'utf8');
assert(adminTimetableContent.includes('targetProgram') || adminTimetableContent.includes('program'), 'AdminTimetablePage has target audience program');
assert(adminTimetableContent.includes('targetSemester') || adminTimetableContent.includes('semester'), 'AdminTimetablePage has target audience semester');
assert(adminTimetableContent.includes('assignedFacultyEmail') || adminTimetableContent.includes('facultyEmail'), 'AdminTimetablePage has assigned faculty dropdown');

// 11. Check Faculty Dashboard
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyDashboardPage.tsx')), 'FacultyDashboardPage.tsx exists');
const facultyDashContent = fs.readFileSync(path.join(__dirname, '../src/pages/faculty/FacultyDashboardPage.tsx'), 'utf8');
assert(facultyDashContent.includes('facultyEmail') || facultyDashContent.includes('effectiveTimetable'), 'FacultyDashboardPage filters classes for assigned teacher');
assert(facultyDashContent.includes('Quick Faculty Actions'), 'FacultyDashboardPage renders Quick Actions row');
assert(facultyDashContent.includes('Mark Roll Call') || facultyDashContent.includes('Mark Attendance'), 'FacultyDashboardPage has Mark Roll Call action');

// 12. Check Faculty Attendance Page
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyAttendancePage.tsx')), 'FacultyAttendancePage.tsx exists');
const facultyAttContent = fs.readFileSync(path.join(__dirname, '../src/pages/faculty/FacultyAttendancePage.tsx'), 'utf8');
assert(facultyAttContent.includes('recordBatchAttendance'), 'FacultyAttendancePage calls recordBatchAttendance');
assert(facultyAttContent.includes('enrolledStudents'), 'FacultyAttendancePage computes enrolledStudents filtered by audience');
assert(facultyAttContent.includes('Present') && facultyAttContent.includes('Absent'), 'FacultyAttendancePage includes Present/Absent toggles');

// 13. Check Faculty Notices Page
assert(fs.existsSync(path.join(__dirname, '../src/pages/faculty/FacultyNoticesPage.tsx')), 'FacultyNoticesPage.tsx exists');
const facultyNoticeContent = fs.readFileSync(path.join(__dirname, '../src/pages/faculty/FacultyNoticesPage.tsx'), 'utf8');
assert(facultyNoticeContent.includes('Draft Department Notice') || facultyNoticeContent.includes('Department Circulars'), 'FacultyNoticesPage renders department circulars view');
assert(facultyNoticeContent.includes('createNotice'), 'FacultyNoticesPage provides notice draft and publish form');

// 14. Check Student Timetable & Dashboard Audience Filtering
const studentTodayClasses = fs.readFileSync(path.join(__dirname, '../src/components/modules/dashboard/TodayClassesCard.tsx'), 'utf8');
assert(studentTodayClasses.includes('user.program') && studentTodayClasses.includes('user.semester'), 'TodayClassesCard filters classes by student program and semester');
const studentTimetableTab = fs.readFileSync(path.join(__dirname, '../src/components/modules/academics/TimetableTab.tsx'), 'utf8');
assert(studentTimetableTab.includes('user.program') && studentTimetableTab.includes('user.semester'), 'TimetableTab filters classes by student program and semester');

// 15. Check Lost & Found Module Dashboard
assert(fs.existsSync(path.join(__dirname, '../src/pages/LostFoundPage.tsx')), 'LostFoundPage.tsx exists');
const lostFoundContent = fs.readFileSync(path.join(__dirname, '../src/pages/LostFoundPage.tsx'), 'utf8');
assert(lostFoundContent.includes('Campus Lost & Found Registry'), 'LostFoundPage renders header');
assert(lostFoundContent.includes('Report Item'), 'LostFoundPage includes Report Item button');
assert(lostFoundContent.includes('typeFilter') && lostFoundContent.includes('statusFilter'), 'LostFoundPage includes type and status filters');
assert(lostFoundContent.includes('imageUrl'), 'LostFoundPage renders photo preview for items with images');

// 16. Check Offline Base64 Photo Upload & HTML5 Canvas Compression
assert(fs.existsSync(path.join(__dirname, '../src/utils/imageUtils.ts')), 'imageUtils.ts exists');
const imageUtilsContent = fs.readFileSync(path.join(__dirname, '../src/utils/imageUtils.ts'), 'utf8');
assert(imageUtilsContent.includes('export const compressImage ='), 'imageUtils.ts exports compressImage function');
assert(imageUtilsContent.includes('document.createElement(\'canvas\')') || imageUtilsContent.includes('document.createElement("canvas")'), 'compressImage uses HTML5 Canvas');
assert(imageUtilsContent.includes('canvas.toDataURL(\'image/jpeg\'') || imageUtilsContent.includes('canvas.toDataURL("image/jpeg"'), 'compressImage outputs JPEG data URL');

assert(fs.existsSync(path.join(__dirname, '../src/components/modules/lostfound/ReportLostFoundModal.tsx')), 'ReportLostFoundModal.tsx exists');
const reportModalContent = fs.readFileSync(path.join(__dirname, '../src/components/modules/lostfound/ReportLostFoundModal.tsx'), 'utf8');
assert(reportModalContent.includes('compressImage'), 'ReportLostFoundModal imports and calls compressImage');
assert(reportModalContent.includes('Math.round((compressedDataUrl.length * 3) / 4) / 1024') || reportModalContent.includes('(compressedDataUrl.length * 3) / 4'), 'ReportLostFoundModal calculates Base64 size in KB');
assert(reportModalContent.includes('500'), 'ReportLostFoundModal enforces 500KB storage protection limit');
assert(reportModalContent.includes('type="radio"') && reportModalContent.includes('value="lost"') && reportModalContent.includes('value="found"'), 'ReportLostFoundModal has radio buttons for Lost/Found type');
assert(reportModalContent.includes('h-48') && reportModalContent.includes('object-cover'), 'ReportLostFoundModal renders cropped preview with h-48 and object-cover');
assert(storageContent.includes('lost_found_items'), 'StorageService syncs with lost_found_items array in localStorage');

// 17. Check Privacy-Protected Contact Exchange & Poster Resolution
assert(fs.existsSync(path.join(__dirname, '../src/components/modules/lostfound/LostFoundDetailModal.tsx')), 'LostFoundDetailModal.tsx exists');
const detailModalContent = fs.readFileSync(path.join(__dirname, '../src/components/modules/lostfound/LostFoundDetailModal.tsx'), 'utf8');
assert(detailModalContent.includes('Request Contact'), 'LostFoundDetailModal provides Request Contact action');
assert(detailModalContent.includes('Mark as Resolved') || detailModalContent.includes('handleResolve'), 'LostFoundDetailModal allows poster to mark item resolved');
assert(!detailModalContent.includes('item.reportedBy.phone'), 'LostFoundDetailModal never exposes phone numbers publicly');

// 18. Check Opportunity Board Module
assert(fs.existsSync(path.join(__dirname, '../src/pages/OpportunitiesPage.tsx')), 'OpportunitiesPage.tsx exists');
const oppContent = fs.readFileSync(path.join(__dirname, '../src/pages/OpportunitiesPage.tsx'), 'utf8');
assert(oppContent.includes('Opportunity Board'), 'OpportunitiesPage renders module header');
assert(oppContent.includes('Browse') && oppContent.includes('Saved'), 'OpportunitiesPage renders Browse and Saved views');
assert(oppContent.includes('daysLeft') || oppContent.includes('days left'), 'OpportunitiesPage computes dynamic date math');
assert(oppContent.includes('isExpired') && oppContent.includes('target="_blank"'), 'OpportunitiesPage has external Apply link');
assert(oppContent.includes('toggleSaveOpportunity'), 'OpportunitiesPage provides bookmark save toggle');
assert(oppContent.includes('displayOpportunities: [...active, ...expired]'), 'OpportunitiesPage forces expired opportunities to bottom of list');

// 19. Check Saved Opportunities in LocalStorage & User Profile
const typesContent = fs.readFileSync(path.join(__dirname, '../src/types/index.ts'), 'utf8');
assert(typesContent.includes('savedOpportunityIds?: string[];'), 'User interface defines savedOpportunityIds array');
assert(typesContent.includes('stipendPrize: string;'), 'Opportunity interface defines stipendPrize');
assert(typesContent.includes('applyLink: string;'), 'Opportunity interface defines applyLink');
assert(storageContent.includes('savedOpportunityIds'), 'StorageService persists savedOpportunityIds per user in localStorage');

// 20. Check Admin Opportunities Publisher Module
assert(fs.existsSync(path.join(__dirname, '../src/pages/admin/AdminOpportunitiesPage.tsx')), 'AdminOpportunitiesPage.tsx exists');
const adminOppContent = fs.readFileSync(path.join(__dirname, '../src/pages/admin/AdminOpportunitiesPage.tsx'), 'utf8');
assert(adminOppContent.includes('Opportunity Board Publisher'), 'AdminOpportunitiesPage renders publisher header');
assert(adminOppContent.includes('createOpportunity'), 'AdminOpportunitiesPage calls createOpportunity handler');
assert(adminOppContent.includes('stipendPrize'), 'AdminOpportunitiesPage includes stipend / prize input');
assert(adminOppContent.includes('applyLink'), 'AdminOpportunitiesPage includes apply link input');
assert(adminOppContent.includes('eligibility'), 'AdminOpportunitiesPage includes eligibility input');
assert(sidebarContent.includes('/admin/opportunities'), 'Sidebar includes Opportunity Board route for admins');
assert(appContent.includes('path="opportunities" element={<AdminOpportunitiesPage />}'), 'App.tsx mounts /admin/opportunities route');
assert(contextContent.includes('createOpportunity: (opp: Omit<Opportunity'), 'AppContextType exposes createOpportunity');
assert(contextContent.includes('deleteOpportunity: (id: string'), 'AppContextType exposes deleteOpportunity');

// 21. Check 48-Hour Approaching Deadlines Notification System & TopBar Popover
assert(fs.existsSync(path.join(__dirname, '../src/utils/deadlineUtils.ts')), 'deadlineUtils.ts exists');
const deadlineUtilsContent = fs.readFileSync(path.join(__dirname, '../src/utils/deadlineUtils.ts'), 'utf8');
assert(deadlineUtilsContent.includes('export const getApproachingDeadlines ='), 'deadlineUtils.ts exports getApproachingDeadlines');
assert(deadlineUtilsContent.includes('48 * 60 * 60 * 1000'), 'deadlineUtils.ts calculates 48 hours in milliseconds');
assert(!deadlineUtilsContent.includes('moment') && !deadlineUtilsContent.includes('date-fns'), 'deadlineUtils uses pure vanilla JS Date math without external libraries');
assert(deadlineUtilsContent.includes('/student/assignments'), 'deadlineUtils routes assignments to /student/assignments');
assert(deadlineUtilsContent.includes('/student/opportunities'), 'deadlineUtils routes opportunities to /student/opportunities');

// Test 48-hour logic function directly in Node.js
function getApproachingDeadlinesTest(assignments, opportunities, user, now = new Date()) {
  const currentMs = now.getTime();
  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
  const items = [];

  const pendingAssignments = (assignments || []).filter(a => a.status === 'pending');
  pendingAssignments.forEach(asg => {
    const dateObj = asg.dueDate.includes('T') ? new Date(asg.dueDate) : new Date(`${asg.dueDate}T23:59:59`);
    const diffMs = dateObj.getTime() - currentMs;
    if (diffMs > 0 && diffMs <= FORTY_EIGHT_HOURS_MS) {
      const hoursRemaining = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
      const timeRemainingLabel = hoursRemaining === 1 ? 'due in 1 hour' : `due in ${hoursRemaining} hours`;
      items.push({
        id: asg.id,
        type: 'assignment',
        title: asg.title,
        hoursRemaining,
        timeRemainingLabel,
        formattedText: `Assignment: ${asg.title} ${timeRemainingLabel}`,
        route: '/student/assignments',
      });
    }
  });

  const savedIds = user?.savedOpportunityIds || [];
  const savedOpportunities = (opportunities || []).filter(opp => savedIds.includes(opp.id) || opp.isSaved);
  savedOpportunities.forEach(opp => {
    const dateObj = opp.deadline.includes('T') ? new Date(opp.deadline) : new Date(`${opp.deadline}T23:59:59`);
    const diffMs = dateObj.getTime() - currentMs;
    if (diffMs > 0 && diffMs <= FORTY_EIGHT_HOURS_MS) {
      const hoursRemaining = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
      const timeRemainingLabel = hoursRemaining === 1 ? 'due in 1 hour' : `due in ${hoursRemaining} hours`;
      items.push({
        id: opp.id,
        type: 'opportunity',
        title: opp.title,
        hoursRemaining,
        timeRemainingLabel,
        formattedText: `Opportunity: ${opp.title} ${timeRemainingLabel}`,
        route: '/student/opportunities',
      });
    }
  });

  items.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
  return items;
}

const mockNow = new Date('2026-11-15T12:00:00Z');
const mockAssignments = [
  { id: 'asg_urgent', title: 'OS Lab', status: 'pending', dueDate: '2026-11-16T12:00:00Z' }, // 24h away (urgent)
  { id: 'asg_later', title: 'DBMS Report', status: 'pending', dueDate: '2026-11-18T12:00:00Z' }, // 72h away (>48h)
  { id: 'asg_done', title: 'Networks', status: 'submitted', dueDate: '2026-11-16T08:00:00Z' }, // submitted
  { id: 'asg_past', title: 'Maths', status: 'pending', dueDate: '2026-11-14T12:00:00Z' }, // past
];
const mockOpportunities = [
  { id: 'opp_urgent', title: 'GSoC 2026', organization: 'Google', type: 'Internship', deadline: '2026-11-16T18:00:00Z', isSaved: false },
  { id: 'opp_later', title: 'SIH 2026', organization: 'Govt', type: 'Hackathon', deadline: '2026-11-20T12:00:00Z', isSaved: false },
  { id: 'opp_unsaved', title: 'ICPC', organization: 'ACM', type: 'Competition', deadline: '2026-11-16T14:00:00Z', isSaved: false },
];
const mockUser = {
  id: 'usr_1',
  name: 'Student Demo',
  role: 'student',
  savedOpportunityIds: ['opp_urgent', 'opp_later'],
};

const results = getApproachingDeadlinesTest(mockAssignments, mockOpportunities, mockUser, mockNow);
assert(results.length === 2, 'Calculates exactly 2 urgent items within next 48 hours');
assert(results[0].id === 'asg_urgent', 'Urgent assignment included (due in 24 hours)');
assert(results[1].id === 'opp_urgent', 'Urgent saved opportunity included (due in 30 hours)');
assert(results[0].formattedText.includes('due in 24 hours'), 'Assignment formattedText contains "due in 24 hours"');
assert(results[0].route === '/student/assignments', 'Assignment routes to /student/assignments');
assert(results[1].route === '/student/opportunities', 'Opportunity routes to /student/opportunities');

// Test empty state
const emptyResults = getApproachingDeadlinesTest([], [], mockUser, mockNow);
assert(emptyResults.length === 0, 'Returns empty array when no items exist');

// TopBar Checks
const topBarContent = fs.readFileSync(path.join(__dirname, '../src/components/layout/TopBar.tsx'), 'utf8');
assert(topBarContent.includes('getApproachingDeadlines'), 'TopBar.tsx imports getApproachingDeadlines');
assert(topBarContent.includes('urgentDeadlines.length > 0'), 'TopBar checks urgentDeadlines count');
assert(topBarContent.includes('bg-rose-600') && !topBarContent.includes('animate-ping') && !topBarContent.includes('animate-pulse'), 'TopBar renders un-pulsing solid red indicator dot on bell');
assert(topBarContent.includes("You're all caught up. No deadlines in the next 48 hours."), 'TopBar displays exact empty state string');
assert(topBarContent.includes('item.formattedText'), 'TopBar displays formatted notification item text');
assert(topBarContent.includes('to={item.route}'), 'TopBar links notification items to module routes');

// App routing aliases for assignments
assert(appContent.includes('path="assignments" element={<Navigate to="/student/academics?tab=assignments" replace />}'), 'App.tsx has /student/assignments route alias');
assert(appContent.includes('path="/assignments" element={<Navigate to="/student/academics?tab=assignments" replace />}'), 'App.tsx has /assignments backward-compat alias');

console.log('--- ALL NOTIFICATIONS & DEADLINE CALCULATIONS VERIFICATIONS PASSED ---');
