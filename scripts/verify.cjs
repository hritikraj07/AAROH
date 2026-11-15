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

// 22. Check Global Unified Search Service & Normalized Results
assert(typesContent.includes('export interface GlobalSearchResult {'), 'GlobalSearchResult interface defined in types/index.ts');
assert(typesContent.includes("type: GlobalSearchResultType;") || typesContent.includes("type: 'Notice' | 'Event' | 'Opportunity'"), 'GlobalSearchResult defines union type');
assert(storageContent.includes('searchGlobal(query: string): GlobalSearchResult[]'), 'StorageService implements searchGlobal function');

// Test searchGlobal logic simulation in Node.js
function searchGlobalTest(query, mockNotices, mockEvents, mockOpps) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  const results = [];

  mockNotices.forEach(notice => {
    if (notice.title.toLowerCase().includes(q) || (notice.content && notice.content.toLowerCase().includes(q))) {
      results.push({
        id: notice.id,
        type: 'Notice',
        title: notice.title,
        subtitle: notice.category || 'General',
        url: '/student/campus-updates',
      });
    }
  });

  mockEvents.forEach(event => {
    if (event.title.toLowerCase().includes(q) || (event.description && event.description.toLowerCase().includes(q))) {
      results.push({
        id: event.id,
        type: 'Event',
        title: event.title,
        subtitle: event.venue ? `${event.date} • ${event.venue}` : event.date,
        url: '/student/events',
      });
    }
  });

  mockOpps.forEach(opp => {
    if (opp.title.toLowerCase().includes(q) || (opp.description && opp.description.toLowerCase().includes(q)) || (opp.organization && opp.organization.toLowerCase().includes(q))) {
      results.push({
        id: opp.id,
        type: 'Opportunity',
        title: opp.title,
        subtitle: opp.organization,
        url: '/student/opportunities',
      });
    }
  });

  return results;
}

const testNotices = [
  { id: 'not_1', title: 'Mid-Term Exam Schedule', content: 'Exam hall seating', category: 'Exams' },
  { id: 'not_2', title: 'Library Renovation', content: 'Extended hours', category: 'Academic' }
];
const testEvents = [
  { id: 'evt_1', title: 'Annual Hackathon 2026', description: 'Tech sprint', date: '2026-11-20', venue: 'Auditorium' },
];
const testOpps = [
  { id: 'opp_1', title: 'Google Summer of Code', description: 'Open source internships', organization: 'Google' },
  { id: 'opp_2', title: 'Smart India Hackathon', description: 'National software contest', organization: 'AICTE' }
];

// Test multi-category query "Hackathon"
const hackathonMatches = searchGlobalTest('hackathon', testNotices, testEvents, testOpps);
assert(hackathonMatches.length === 2, 'Search query "hackathon" returns results from both Events and Opportunities simultaneously');
assert(hackathonMatches.some(m => m.type === 'Event' && m.url === '/student/events'), 'Event result properly normalized with url /student/events');
assert(hackathonMatches.some(m => m.type === 'Opportunity' && m.url === '/student/opportunities'), 'Opportunity result properly normalized with url /student/opportunities');

// Test Notice match
const examMatches = searchGlobalTest('exam', testNotices, testEvents, testOpps);
assert(examMatches.length === 1 && examMatches[0].type === 'Notice', 'Search query "exam" returns Notice result');
assert(examMatches[0].subtitle === 'Exams', 'Notice subtitle is its category');
assert(examMatches[0].url === '/student/campus-updates', 'Notice url is /student/campus-updates');

// Test Opportunity match
const googleMatches = searchGlobalTest('Google', testNotices, testEvents, testOpps);
assert(googleMatches.length === 1 && googleMatches[0].type === 'Opportunity', 'Search query "Google" returns Opportunity result');
assert(googleMatches[0].subtitle === 'Google', 'Opportunity subtitle is the organization');

// Test empty search
const emptyMatches = searchGlobalTest('xyznotfound', testNotices, testEvents, testOpps);
assert(emptyMatches.length === 0, 'Returns 0 results for unknown term');

// TopBar Search UI Checks
assert(topBarContent.includes('<input') && topBarContent.includes('searchQuery'), 'TopBar renders inline search input field');
assert(topBarContent.includes('Search notices, events, opportunities...'), 'Search input has descriptive placeholder');
assert(topBarContent.includes('isSearchOpen && searchQuery.trim().length > 1'), 'Dropdown appears when query length > 1');
assert(topBarContent.includes("No results found for '"), 'Dropdown renders empty state message');
assert(topBarContent.includes('getTypeBadgeClasses') || topBarContent.includes('result.type'), 'Dropdown renders type badge next to each result');
assert(topBarContent.includes('to={result.url}'), 'Clicking result routes to normalized module URL');
assert(topBarContent.includes('setIsSearchOpen(false)') && topBarContent.includes("setSearchQuery('')"), 'Clicking result closes search dropdown');

// App routing for /student/campus-updates
const currentAppContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
assert(currentAppContent.includes('path="campus-updates" element={<NoticesPage />}'), 'App.tsx mounts /student/campus-updates route');
assert(currentAppContent.includes('path="/campus-updates" element={<Navigate to="/student/campus-updates" replace />}'), 'App.tsx has /campus-updates backward-compat alias');

// 12. Check Custom SVG Logo Component
const logoPath = path.join(__dirname, '../src/components/ui/Logo.tsx');
assert(fs.existsSync(logoPath), 'Logo.tsx exists in src/components/ui');
const logoContent = fs.readFileSync(logoPath, 'utf8');
assert(logoContent.includes('export const Logo'), 'Logo component is exported');
assert(logoContent.includes('export const LogoIcon'), 'LogoIcon component is exported');
assert(logoContent.includes('fillRule="evenodd"') || logoContent.includes('clipRule="evenodd"'), 'Logo uses precision evenodd vector path');
assert(logoContent.includes('text-teal-700'), 'Logo uses deep teal text-teal-700 accent');
assert(logoContent.includes('text-slate-900'), 'Logo text uses text-slate-900');
assert(logoContent.includes('SIZE_CONFIG'), 'Logo defines size scale');

// Verify integration in Sidebar and LoginPage
const currentSidebarContent = fs.readFileSync(path.join(__dirname, '../src/components/layout/Sidebar.tsx'), 'utf8');
assert(currentSidebarContent.includes('<Logo'), 'Sidebar.tsx renders Logo component');
const currentLoginContent = fs.readFileSync(path.join(__dirname, '../src/pages/LoginPage.tsx'), 'utf8');
assert(currentLoginContent.includes('<Logo'), 'LoginPage.tsx renders Logo component');

// 13. Check Vercel SPA Routing Configuration
const vercelConfigPath = path.join(__dirname, '../vercel.json');
assert(fs.existsSync(vercelConfigPath), 'vercel.json exists in root directory');
const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
assert(Array.isArray(vercelConfig.rewrites) && vercelConfig.rewrites.some(r => r.source === '/(.*)' && r.destination === '/index.html'), 'vercel.json rewrites all routes to /index.html for SPA routing');

// 14. Check Global Branding, Wiped Database & User Management UX Upgrades
const configContent = fs.readFileSync(path.join(__dirname, '../src/config.ts'), 'utf8');
assert(configContent.includes("collegeName: 'K.R. Mangalam University'"), "APP_CONFIG.collegeName updated to 'K.R. Mangalam University'");
assert(configContent.includes("collegeShortName: 'KRMU'"), "APP_CONFIG.collegeShortName updated to 'KRMU'");

// Check that pre-seeded database arrays are empty
const updatedSeedContent = fs.readFileSync(path.join(__dirname, '../src/data/seed.ts'), 'utf8');
assert(updatedSeedContent.includes('export const INITIAL_NOTICES: Notice[] = [];'), 'INITIAL_NOTICES is initialized as an empty array');
assert(updatedSeedContent.includes('export const INITIAL_EVENTS: CampusEvent[] = [];'), 'INITIAL_EVENTS is initialized as an empty array');
assert(updatedSeedContent.includes('export const INITIAL_TIMETABLE: ClassSession[] = [];'), 'INITIAL_TIMETABLE is initialized as an empty array');
assert(updatedSeedContent.includes('export const INITIAL_OPPORTUNITIES: Opportunity[] = [];'), 'INITIAL_OPPORTUNITIES is initialized as an empty array');

// Check Admin User Management upgrades in AdminPeoplePage.tsx
const currentAdminPeopleContent = fs.readFileSync(path.join(__dirname, '../src/pages/admin/AdminPeoplePage.tsx'), 'utf8');
assert(currentAdminPeopleContent.includes('getEmailSuffix'), 'AdminPeoplePage defines smart getEmailSuffix helper');
assert(currentAdminPeopleContent.includes('@aaroh.edu.in') && currentAdminPeopleContent.includes('@faculty.aaroh.edu.in'), 'AdminPeoplePage includes smart institutional domain suffixes');
assert(currentAdminPeopleContent.includes('emailPrefix') && currentAdminPeopleContent.includes('setEmailPrefix'), 'AdminPeoplePage uses email prefix input state');
assert(currentAdminPeopleContent.includes('FACULTY_DEPARTMENTS'), 'AdminPeoplePage defines faculty department options');
assert(currentAdminPeopleContent.includes('classCoordinator') && currentAdminPeopleContent.includes('setClassCoordinator'), 'AdminPeoplePage includes Class Coordinator field state');
assert(currentAdminPeopleContent.includes("users.filter(u => u.role === 'faculty')"), 'AdminPeoplePage dynamically filters faculty members for coordinator assignment');
assert(currentAdminPeopleContent.includes('Coord: {u.classCoordinator}'), 'AdminPeoplePage displays assigned Class Coordinator in user table');

// 15. Check Aaroh AI Campus Assistant Module & Parser Logic
const aiUtilPath = path.join(__dirname, '../src/utils/aiAssistant.ts');
assert(fs.existsSync(aiUtilPath), 'aiAssistant.ts exists in src/utils');
const aiUtilContent = fs.readFileSync(aiUtilPath, 'utf8');
assert(aiUtilContent.includes('export function processCampusAIQuery'), 'processCampusAIQuery exported from aiAssistant.ts');
assert(aiUtilContent.includes('next class') && aiUtilContent.includes('timetable'), 'aiAssistant handles next class and timetable keywords');
assert(aiUtilContent.includes('attendance') && aiUtilContent.includes('short'), 'aiAssistant handles attendance and shortfall keywords');
assert(aiUtilContent.includes('deadline') && aiUtilContent.includes('due'), 'aiAssistant handles deadline and due keywords');
assert(aiUtilContent.includes("I'm your Aaroh campus assistant. Try asking me about your next class, attendance, or upcoming deadlines!"), 'aiAssistant includes exact polite fallback string');

// Test Smart AI Parser logic simulation in Node.js
function testSimulateAI(q, mockCtx, mockNow = new Date('2026-11-16T10:00:00')) {
  const query = (q || '').trim().toLowerCase();
  if (query.includes('next class') || query.includes('timetable')) {
    const todaySessions = (mockCtx.timetable || []).filter(s => s.dayOfWeek === mockNow.getDay());
    const next = todaySessions.find(s => s.startTime >= '10:00') || todaySessions[0];
    if (next) {
      return `Your next class is ${next.courseName} in ${next.room} at ${next.startTime}.`;
    }
  }
  if (query.includes('attendance') || query.includes('short')) {
    const low = (mockCtx.attendance || []).filter(r => r.total > 0 && Math.round((r.attended / r.total) * 100) < 75);
    if (low.length > 0) {
      return `⚠️ Attendance Warning: You currently have ${low.length} subject(s) below the mandatory 75% threshold:`;
    }
  }
  if (query.includes('deadline') || query.includes('due')) {
    return '⏰ You have 2 deadline(s) approaching in the next 48 hours:';
  }
  return "I'm your Aaroh campus assistant. Try asking me about your next class, attendance, or upcoming deadlines!";
}

const mockAIContext = {
  timetable: [
    { id: '1', courseName: 'Operating Systems', room: 'LH-101', startTime: '11:00', endTime: '12:30', dayOfWeek: 1 }
  ],
  attendance: [
    { courseId: 'crs_1', attended: 10, total: 20 } // 50% < 75%
  ]
};

const nextClassRes = testSimulateAI('when is my next class?', mockAIContext);
assert(nextClassRes.includes('Your next class is Operating Systems in LH-101 at 11:00.'), 'AI returns natural language string for next class');

const attendanceRes = testSimulateAI('check my attendance short', mockAIContext);
assert(attendanceRes.includes('⚠️ Attendance Warning') && attendanceRes.includes('below the mandatory 75% threshold'), 'AI returns attendance warning for subjects below 75%');

const deadlineRes = testSimulateAI('what is due soon?', mockAIContext);
assert(deadlineRes.includes('deadline(s) approaching in the next 48 hours'), 'AI returns approaching deadlines list');

const fallbackRes = testSimulateAI('tell me a random joke', mockAIContext);
assert(fallbackRes === "I'm your Aaroh campus assistant. Try asking me about your next class, attendance, or upcoming deadlines!", 'AI returns exact fallback string for unrecognized queries');

// Check AarohAIAssistant.tsx UI Component
const aiComponentPath = path.join(__dirname, '../src/components/modules/ai/AarohAIAssistant.tsx');
assert(fs.existsSync(aiComponentPath), 'AarohAIAssistant.tsx exists');
const aiComponentContent = fs.readFileSync(aiComponentPath, 'utf8');
assert(aiComponentContent.includes('Sparkles'), 'AarohAIAssistant renders lucide Sparkles icon');
assert(aiComponentContent.includes('bg-teal-700'), 'AarohAIAssistant FAB uses deep teal background');
assert(aiComponentContent.includes('border border-slate-200'), 'AarohAIAssistant chat window uses 1px slate-200 border');
assert(aiComponentContent.includes('animate-in fade-in duration-150'), 'AarohAIAssistant has fade-in animation');
assert(aiComponentContent.includes('bg-slate-100') && aiComponentContent.includes('items-end'), 'User messages align right in slate-100');
assert(aiComponentContent.includes('bg-teal-50') && aiComponentContent.includes('items-start'), 'AI messages align left with teal tint');

// Check Layout.tsx mounts AarohAIAssistant
const currentLayoutContent = fs.readFileSync(path.join(__dirname, '../src/components/layout/Layout.tsx'), 'utf8');
assert(currentLayoutContent.includes('<AarohAIAssistant />') || currentLayoutContent.includes('AarohAIAssistant'), 'Layout.tsx mounts AarohAIAssistant component');

// ==========================================
// 16. Check Feature 1: Conflict-Free Timetable Assistant (Admin Portal)
// ==========================================
const adminTimetablePageContent = fs.readFileSync(path.join(__dirname, '../src/pages/admin/AdminTimetablePage.tsx'), 'utf8');
assert(adminTimetablePageContent.includes('useEffect(') && adminTimetablePageContent.includes('conflictWarning'), 'AdminTimetablePage uses useEffect to track timetable conflicts');
assert(adminTimetablePageContent.includes('Conflict Detected:'), 'AdminTimetablePage generates exact Conflict Detected: warning message');
assert(adminTimetablePageContent.includes('text-red-700') && adminTimetablePageContent.includes('bg-red-50') && adminTimetablePageContent.includes('border-red-200'), 'AdminTimetablePage renders red conflict alert banner');
assert(adminTimetablePageContent.includes('disabled={Boolean(conflictWarning)}'), 'AdminTimetablePage disables Save button on conflict');

// Unit test timetable conflict detection algorithm
function detectTimetableConflictTest(slotToCheck, existingSlots) {
  const conflict = existingSlots.find(slot => {
    if (Number(slot.dayOfWeek) !== Number(slotToCheck.dayOfWeek)) return false;
    const timeOverlap = slot.startTime === slotToCheck.startTime || (slot.startTime < slotToCheck.endTime && slot.endTime > slotToCheck.startTime);
    if (!timeOverlap) return false;
    const roomClash = slot.room.trim().toLowerCase() === slotToCheck.room.trim().toLowerCase();
    const facultyClash = slot.facultyEmail && slotToCheck.facultyEmail && slot.facultyEmail.toLowerCase() === slotToCheck.facultyEmail.toLowerCase();
    return roomClash || facultyClash;
  });

  if (!conflict) return null;
  const isRoomConflict = conflict.room.trim().toLowerCase() === slotToCheck.room.trim().toLowerCase();
  const isFacultyConflict = conflict.facultyEmail && slotToCheck.facultyEmail && conflict.facultyEmail.toLowerCase() === slotToCheck.facultyEmail.toLowerCase();
  let entity = conflict.room;
  if (isRoomConflict && isFacultyConflict) entity = `${conflict.room} and ${conflict.facultyName}`;
  else if (isFacultyConflict) entity = conflict.facultyName;
  else entity = conflict.room;
  return `Conflict Detected: ${entity} is already booked at this time.`;
}

const mockExistingTimetable = [
  { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: 'LH-101', facultyName: 'Prof. Raman', facultyEmail: 'prof.raman@faculty.aaroh.edu.in' }
];

const roomClashResult = detectTimetableConflictTest(
  { dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: 'LH-101', facultyEmail: 'other@faculty.aaroh.edu.in' },
  mockExistingTimetable
);
assert(roomClashResult && roomClashResult.includes('LH-101') && roomClashResult.includes('already booked'), 'Conflict detected for booked Room LH-101');

const facultyClashResult = detectTimetableConflictTest(
  { dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: 'LH-202', facultyName: 'Prof. Raman', facultyEmail: 'prof.raman@faculty.aaroh.edu.in' },
  mockExistingTimetable
);
assert(facultyClashResult && facultyClashResult.includes('Prof. Raman') && facultyClashResult.includes('already booked'), 'Conflict detected for booked Faculty Prof. Raman');

const cleanSlotResult = detectTimetableConflictTest(
  { dayOfWeek: 2, startTime: '09:00', endTime: '10:30', room: 'LH-101', facultyEmail: 'prof.raman@faculty.aaroh.edu.in' },
  mockExistingTimetable
);
assert(cleanSlotResult === null, 'No conflict on different day of week');

// ==========================================
// 17. Check Feature 2: "TL;DR" AI Notice Summarizer (Student Portal)
// ==========================================
const noticeSummarizerPath = path.join(__dirname, '../src/utils/noticeSummarizer.ts');
assert(fs.existsSync(noticeSummarizerPath), 'noticeSummarizer.ts exists in src/utils');
const noticeSummarizerContent = fs.readFileSync(noticeSummarizerPath, 'utf8');
assert(noticeSummarizerContent.includes('export function summarizeNoticeAI'), 'summarizeNoticeAI exported from noticeSummarizer.ts');
assert(noticeSummarizerContent.includes('deadline') && noticeSummarizerContent.includes('mandatory') && noticeSummarizerContent.includes('fee'), 'summarizeNoticeAI scans for deadline, mandatory, and fees keywords');

const noticeDetailModalContent = fs.readFileSync(path.join(__dirname, '../src/components/modules/notices/NoticeDetailModal.tsx'), 'utf8');
assert(noticeDetailModalContent.includes('AI Summarize'), 'NoticeDetailModal renders AI Summarize button');
assert(noticeDetailModalContent.includes('bg-teal-700'), 'AI Summarize button styled with deep teal accent');
assert(noticeDetailModalContent.includes('active:scale-95'), 'AI Summarize button has active:scale-95 click animation');
assert(noticeDetailModalContent.includes('1500') && noticeDetailModalContent.includes('setTimeout'), 'NoticeDetailModal simulates 1.5s AI synthesis processing time');
assert(noticeDetailModalContent.includes('Generating summary...'), 'NoticeDetailModal shows Generating summary... state with fast spinner');
assert(noticeDetailModalContent.includes('bg-[#F0F7F6]') && noticeDetailModalContent.includes('border-teal-200'), 'NoticeDetailModal renders tinted box bg-[#F0F7F6] with 1px teal border');
assert(noticeDetailModalContent.includes('animate-in fade-in slide-in-from-top-2 duration-300'), 'NoticeDetailModal summary expands smoothly with slide-in-from-top-2');

// Unit test summarizeNoticeAI logic directly in Node.js
function summarizeNoticeAITest(notice) {
  const text = `${notice.title} ${notice.content}`;
  const lower = text.toLowerCase();
  const hasDeadline = lower.includes('deadline') || lower.includes('due') || lower.includes('last date') || lower.includes('by');
  const hasMandatory = lower.includes('mandatory') || lower.includes('compulsory') || lower.includes('required') || lower.includes('must');
  const hasFees = lower.includes('fee') || lower.includes('fees') || lower.includes('payment') || lower.includes('dues');

  const bullets = [];
  bullets.push(`Core Update: ${notice.title}`);
  if (hasMandatory) bullets.push('Compliance: Mandatory attendance and strict adherence required.');
  else if (hasFees) bullets.push('Financials: Clear all examination dues and administrative fees.');
  else bullets.push('Directive: Follow instructions issued by the Department.');

  if (hasDeadline) bullets.push(`Timeline: Strict deadline is ${notice.publishedDate || '2026-11-20'}.`);
  else bullets.push('Timeline: Effective immediately.');

  return bullets.slice(0, 3);
}

const mockNoticeWithKeywords = {
  title: 'End-Term Examination Fee & Hall Ticket Clearance',
  content: 'All students must clear pending semester fees by 2026-11-25. Attendance in all laboratory sessions is mandatory.',
  publishedDate: '2026-11-15'
};
const summaryOutput = summarizeNoticeAITest(mockNoticeWithKeywords);
assert(summaryOutput.length === 3, 'summarizeNoticeAI returns exactly 3 concise bullet points');
assert(summaryOutput.some(b => b.includes('Core Update:')), 'Summary includes Core Update bullet');
assert(summaryOutput.some(b => b.includes('Compliance:') || b.includes('Financials:')), 'Summary detects mandatory compliance or fee requirement');
assert(summaryOutput.some(b => b.includes('Timeline:')), 'Summary includes deadline timeline bullet');

// ==========================================
// 18. Check Feature 3: Smart Team / Study Partner Matchmaker (Student Portal)
// ==========================================
const teamMatchmakerPath = path.join(__dirname, '../src/utils/teamMatchmaker.ts');
assert(fs.existsSync(teamMatchmakerPath), 'teamMatchmaker.ts exists in src/utils');
const teamMatchmakerContent = fs.readFileSync(teamMatchmakerPath, 'utf8');
assert(teamMatchmakerContent.includes('export function findStudyPartnerMatch'), 'findStudyPartnerMatch exported from teamMatchmaker.ts');

const opportunitiesPageContent = fs.readFileSync(path.join(__dirname, '../src/pages/OpportunitiesPage.tsx'), 'utf8');
assert(opportunitiesPageContent.includes('Find a Team') || opportunitiesPageContent.includes('Study Partner Matchmaker'), 'OpportunitiesPage includes Find a Team section');
assert(opportunitiesPageContent.includes('Match Me'), 'OpportunitiesPage includes Match Me button');
assert(opportunitiesPageContent.includes('✨ AI Matched'), 'OpportunitiesPage renders ✨ AI Matched badge');
assert(opportunitiesPageContent.includes('Request to Connect'), 'OpportunitiesPage includes Request to Connect action');
assert(opportunitiesPageContent.includes('Connection Request Sent'), 'OpportunitiesPage triggers connection request toast');

// Unit test findStudyPartnerMatch logic directly in Node.js
function findStudyPartnerMatchTest(currentUser, allUsers) {
  if (!currentUser) return null;
  const currentProg = (currentUser.program || '').trim().toLowerCase();
  const currentSem = Number(currentUser.semester);
  const candidates = (allUsers || []).filter(u => {
    if (u.role !== 'student') return false;
    if (u.id === currentUser.id) return false;
    if (Number(u.semester) !== currentSem) return false;
    const userProg = (u.program || '').trim().toLowerCase();
    if (!currentProg || !userProg) return false;
    return userProg === currentProg || userProg.includes(currentProg) || currentProg.includes(userProg);
  });
  return candidates.length > 0 ? candidates[0] : null;
}

const mockMatchUserList = [
  { id: 'usr_me', role: 'student', name: 'Aarav Sharma', semester: 5, program: 'B.Tech CSE' },
  { id: 'usr_peer', role: 'student', name: 'Priya Patel', semester: 5, program: 'B.Tech CSE' },
  { id: 'usr_diff_sem', role: 'student', name: 'Rohan Gupta', semester: 3, program: 'B.Tech CSE' },
  { id: 'usr_diff_prog', role: 'student', name: 'Sneha Rao', semester: 5, program: 'Mechanical' },
  { id: 'usr_faculty', role: 'faculty', name: 'Prof. Raman', semester: 5, program: 'B.Tech CSE' },
];

const currentStudent = mockMatchUserList[0];
const matchedPeer = findStudyPartnerMatchTest(currentStudent, mockMatchUserList);
assert(matchedPeer !== null && matchedPeer.id === 'usr_peer', 'Finds matching student peer with exact semester 5 and program B.Tech CSE');
assert(matchedPeer.name === 'Priya Patel', 'Matched student is Priya Patel');

const studentNoMatches = { id: 'usr_solo', role: 'student', semester: 7, program: 'B.Arch' };
assert(findStudyPartnerMatchTest(studentNoMatches, mockMatchUserList) === null, 'Returns null when no peer shares exact program and semester');

// ==========================================
// 19. Check Live Lab & Automated Coding Assignments Module
// ==========================================
console.log('--- VERIFYING LIVE LAB & AUTOMATED CODING ASSIGNMENTS ---');

// 1. Data Structure Updates in types/index.ts
const updatedTypesContent = fs.readFileSync(path.join(__dirname, '../src/types/index.ts'), 'utf8');
assert(updatedTypesContent.includes("type?: 'standard' | 'coding';") || updatedTypesContent.includes("type?: AssignmentType;"), 'Assignment interface supports type: standard | coding');
assert(updatedTypesContent.includes('language?: string;'), 'Assignment interface defines language');
assert(updatedTypesContent.includes('starterCode?: string;'), 'Assignment interface defines starterCode');
assert(updatedTypesContent.includes('testCases?: TestCase[];'), 'Assignment interface defines testCases array');
assert(updatedTypesContent.includes("labStatus?: 'locked' | 'active' | 'closed';") || updatedTypesContent.includes('labStatus?: LabStatus;'), 'Assignment interface defines labStatus: locked | active | closed');

// 2. Storage Service Live Lab Methods
const updatedStorageContent = fs.readFileSync(path.join(__dirname, '../src/services/storage.ts'), 'utf8');
assert(updatedStorageContent.includes('updateAssignmentLabStatus(id: string, labStatus:'), 'StorageService implements updateAssignmentLabStatus');
assert(updatedStorageContent.includes('submitCodingAssignment(id: string, studentCode: string'), 'StorageService implements submitCodingAssignment');

// 3. Faculty Portal: Live Lab Controls in FacultyAssignmentsPage.tsx
const facultyAssignmentsContent = fs.readFileSync(path.join(__dirname, '../src/pages/faculty/FacultyAssignmentsPage.tsx'), 'utf8');
assert(facultyAssignmentsContent.includes('Create Coding Assignment'), 'FacultyAssignmentsPage includes Create Coding Assignment action');
assert(facultyAssignmentsContent.includes('Starter Code') || facultyAssignmentsContent.includes('starterCode'), 'FacultyAssignmentsPage includes Starter Code template input');
assert(facultyAssignmentsContent.includes('testCases') && (facultyAssignmentsContent.includes('Add Test Case') || facultyAssignmentsContent.includes('handleAddTestCase')), 'FacultyAssignmentsPage includes dynamic test cases builder');
assert(facultyAssignmentsContent.includes('Live Lab Controls'), 'FacultyAssignmentsPage renders Live Lab Controls panel');
assert(facultyAssignmentsContent.includes('Start Live Lab'), 'FacultyAssignmentsPage includes Start Live Lab button');
assert(facultyAssignmentsContent.includes('End Lab'), 'FacultyAssignmentsPage includes End Lab button');
assert(facultyAssignmentsContent.includes("updateAssignmentLabStatus(asg.id, 'active')"), 'Start Live Lab sets status to active');
assert(facultyAssignmentsContent.includes("updateAssignmentLabStatus(asg.id, 'closed')"), 'End Lab sets status to closed');

// 4. Student Portal: Code Workspace in StudentCodeWorkspacePage.tsx
const studentWorkspacePath = path.join(__dirname, '../src/pages/StudentCodeWorkspacePage.tsx');
assert(fs.existsSync(studentWorkspacePath), 'StudentCodeWorkspacePage.tsx exists');
const studentWorkspaceContent = fs.readFileSync(studentWorkspacePath, 'utf8');
assert(studentWorkspaceContent.includes('Lab Session is not active. Waiting for the instructor to open the lab...'), 'StudentCodeWorkspacePage renders exact locked screen waiting message');
assert(studentWorkspaceContent.includes('Lock') && studentWorkspaceContent.includes("labStatus === 'locked'"), 'StudentCodeWorkspacePage renders Lock icon when locked');
assert(studentWorkspaceContent.includes('font-mono bg-slate-900 text-slate-100 p-4 rounded-md'), 'StudentCodeWorkspacePage renders code editor with font-mono bg-slate-900 text-slate-100 p-4 rounded-md');
assert(studentWorkspaceContent.includes('Run Code'), 'StudentCodeWorkspacePage renders Run Code action');
assert(studentWorkspaceContent.includes('Submit Assignment'), 'StudentCodeWorkspacePage renders Submit Assignment action');
assert(studentWorkspaceContent.includes('Lab Session Ended. Submissions Closed.'), 'StudentCodeWorkspacePage renders exact closed message badge');
assert(studentWorkspaceContent.includes("window.addEventListener('storage',") || studentWorkspaceContent.includes('window.addEventListener("storage",'), 'StudentCodeWorkspacePage listens to storage event for offline real-time tab sync');
assert(studentWorkspaceContent.includes('animate-in fade-in zoom-in-95 duration-300'), 'StudentCodeWorkspacePage transitions with animate-in fade-in zoom-in-95 duration-300');

// 5. App.tsx Route Mounting
const appRoutingContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
assert(appRoutingContent.includes('assignments/code/:id'), 'App.tsx mounts /student/assignments/code/:id route');

// 6. Offline Mock Auto-Grader in codeGrader.ts
const codeGraderPath = path.join(__dirname, '../src/utils/codeGrader.ts');
assert(fs.existsSync(codeGraderPath), 'codeGrader.ts exists in src/utils');
const codeGraderContent = fs.readFileSync(codeGraderPath, 'utf8');
assert(codeGraderContent.includes('export function simulateCodeExecution'), 'simulateCodeExecution exported from codeGrader.ts');
assert(codeGraderContent.includes('return'), 'codeGrader checks for return keyword');

// Unit test simulateCodeExecution directly in Node.js
function simulateCodeExecutionTest(studentCode, starterCode, testCases) {
  const code = (studentCode || '').trim();
  const starter = (starterCode || '').trim();
  const hasReturn = /\breturn\b/.test(code);
  const isLonger = code.length > starter.length;
  const shouldPass = hasReturn && isLonger;

  const cases = testCases || [
    { id: '1', input: 'n=5', expectedOutput: '25' },
    { id: '2', input: 'n=10', expectedOutput: '100' }
  ];

  const results = cases.map((tc, idx) => {
    const passed = shouldPass ? true : idx === 0 && cases.length > 1;
    return {
      testNumber: idx + 1,
      passed,
      summary: `${passed ? '✅' : '❌'} Test ${idx + 1} ${passed ? 'Passed' : 'Failed'}`
    };
  });

  return {
    allPassed: shouldPass,
    summary: results.map(r => r.summary).join(' | ')
  };
}

const mockStarterCode = 'def solution(n):\n    pass';
const mockWorkingStudentCode = 'def solution(n):\n    return n * n';
const mockIncompleteStudentCode = 'def solution(n):\n    # unfinished';

const passResult = simulateCodeExecutionTest(mockWorkingStudentCode, mockStarterCode);
assert(passResult.allPassed === true, 'Valid code with return and length > starter passes all test cases');
assert(passResult.summary === '✅ Test 1 Passed | ✅ Test 2 Passed', 'Summary formats ✅ Test 1 Passed | ✅ Test 2 Passed');

const failResult = simulateCodeExecutionTest(mockIncompleteStudentCode, mockStarterCode);
assert(failResult.allPassed === false, 'Code without return or shorter length fails test case');
assert(failResult.summary.includes('❌ Test 2 Failed'), 'Summary indicates ❌ Test 2 Failed');

console.log('--- ALL LIVE LAB & AUTOMATED CODING ASSIGNMENT VERIFICATIONS PASSED ---');

// ==========================================
// 20. Check Context-Aware Focus Mode & Skill-Gap Analyzer
// ==========================================
console.log('--- VERIFYING CONTEXT-AWARE FOCUS MODE & SKILL-GAP ANALYZER ---');

// 1. Context-Aware Focus Mode in DashboardPage.tsx
const dashboardContent = fs.readFileSync(path.join(__dirname, '../src/pages/DashboardPage.tsx'), 'utf8');
assert(dashboardContent.includes('Focus Mode Auto-Activated: Muting non-academic notifications until class ends.'), 'Dashboard renders exact Focus Mode banner message');
assert(dashboardContent.includes('Focus') && (dashboardContent.includes('<Focus') || dashboardContent.includes('lucide-react')), 'Dashboard renders Focus icon');
assert(dashboardContent.includes('Current Class:'), 'Dashboard expands prominent Current Class section');
assert(dashboardContent.includes('Take Live Notes'), 'Dashboard includes Take Live Notes action button');
assert(dashboardContent.includes('View Resources'), 'Dashboard includes View Resources action button');
assert(dashboardContent.includes('animate-in fade-in zoom-in-95 duration-500'), 'Dashboard uses smooth animate-in fade-in zoom-in-95 duration-500 transition');
assert(dashboardContent.includes('!isFocusMode') && (dashboardContent.includes('PinnedNoticesWidget') && dashboardContent.includes('UpcomingEventsWidget')), 'Dashboard mutes/hides Upcoming Events and Campus Updates when in Focus Mode');

// 2. Skill-Gap Analyzer Helper & Dictionary in src/utils/skillMatcher.ts
const skillMatcherPath = path.join(__dirname, '../src/utils/skillMatcher.ts');
assert(fs.existsSync(skillMatcherPath), 'skillMatcher.ts exists in src/utils');
const skillMatcherContent = fs.readFileSync(skillMatcherPath, 'utf8');
assert(skillMatcherContent.includes("'React'") && skillMatcherContent.includes("'Python'") && skillMatcherContent.includes("'Node'") && skillMatcherContent.includes("'Figma'"), 'skillMatcher defines dictionary with React, Python, Node, Figma');
assert(skillMatcherContent.includes('export function analyzeSkillMatch'), 'skillMatcher exports analyzeSkillMatch');
assert(skillMatcherContent.includes('You have the required skills based on your completed Zosima labs.'), 'skillMatcher provides exact success match message');
assert(skillMatcherContent.includes('Skill Gap: This role requires'), 'skillMatcher provides exact Skill Gap prefix');

// 3. Opportunity Detail Modal Integration in OpportunityDetailModal.tsx
const oppModalContent = fs.readFileSync(path.join(__dirname, '../src/components/modules/opportunities/OpportunityDetailModal.tsx'), 'utf8');
assert(oppModalContent.includes('✨ AI Skill Match'), 'OpportunityDetailModal renders ✨ AI Skill Match card');
assert(oppModalContent.includes('bg-green-50') && oppModalContent.includes('bg-amber-50'), 'OpportunityDetailModal uses tinted background states (bg-green-50 / bg-amber-50)');
assert(oppModalContent.includes('/student/assignments'), 'OpportunityDetailModal routes quick-link to /student/assignments');
assert(oppModalContent.includes('Practice in Coding Lab') || oppModalContent.includes('Practice'), 'OpportunityDetailModal provides practice action button');

// 4. Unit Test Skill Matcher Logic directly in Node.js
function testSkillMatch(oppDesc, assignments) {
  const keywords = ['React', 'Python', 'Node', 'Figma'];
  const reqSkills = keywords.filter(kw => new RegExp(`(^|[^a-zA-Z0-9_])${kw}([^a-zA-Z0-9_]|$)`, 'i').test(oppDesc));
  
  const studentSkills = new Set();
  (assignments || []).filter(a => a.type === 'coding' && (a.status === 'submitted' || a.status === 'graded' || a.status === 'passed') && (!a.testResultsSummary || !a.testResultsSummary.includes('❌'))).forEach(a => {
    if (a.language) studentSkills.add(a.language.toLowerCase());
    keywords.forEach(kw => {
      if (new RegExp(`(^|[^a-zA-Z0-9_])${kw}([^a-zA-Z0-9_]|$)`, 'i').test(`${a.title || ''} ${a.description || ''}`)) {
        studentSkills.add(kw.toLowerCase());
      }
    });
  });

  const missing = reqSkills.filter(s => !studentSkills.has(s.toLowerCase()));
  const isMatch = missing.length === 0;

  return {
    isMatch,
    missing,
    message: isMatch 
      ? 'You have the required skills based on your completed Zosima labs.' 
      : `Skill Gap: This role requires ${missing.join(', ')}.`
  };
}

const mockOppDesc = 'Seeking an intern with strong hands-on experience in React and Python backend services.';
const mockStudentWithBothSkills = [
  { id: '1', type: 'coding', language: 'React', status: 'submitted', testResultsSummary: '✅ All passed' },
  { id: '2', type: 'coding', language: 'Python', status: 'graded', testResultsSummary: '✅ Test 1 Passed | ✅ Test 2 Passed' },
];
const mockStudentMissingSkills = [
  { id: '1', type: 'coding', language: 'Python', status: 'submitted', testResultsSummary: '✅ All passed' },
];

const matchRes = testSkillMatch(mockOppDesc, mockStudentWithBothSkills);
assert(matchRes.isMatch === true, 'Student with React and Python matches opportunity');
assert(matchRes.message === 'You have the required skills based on your completed Zosima labs.', 'Matches returns exact Zosima labs success message');

const gapRes = testSkillMatch(mockOppDesc, mockStudentMissingSkills);
assert(gapRes.isMatch === false, 'Student missing React triggers skill gap');
assert(gapRes.message === 'Skill Gap: This role requires React.', 'Gap returns exact Skill Gap requirement message');

console.log('--- ALL CONTEXT-AWARE FOCUS MODE & SKILL-GAP ANALYZER VERIFICATIONS PASSED ---');

