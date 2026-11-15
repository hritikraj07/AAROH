# Aaroh: One Platform for College Life

> A unified, role-secured internal operating system for campus life at **K.R. Mangalam University (KRMU)**, featuring dedicated portals for **Students**, **Faculty**, and **Administration**.

Students traditionally navigate fragmented portals, paper notice boards, unofficial WhatsApp groups, and chaotic spreadsheets. **Aaroh** consolidates academics, campus circulars, events, timetable scheduling, coursework, and career opportunities behind institutional Single Sign-On (SSO) with strict Role-Based Access Control (RBAC).

---

## 🔑 Role-Based Access Control & Domain Routing (`/login`)

The app enforces institutional domain routing to partition permissions across three dedicated portals:

| Portal | Domain Rule | Default Landing | Demo Evaluator Email | Permissions |
|---|---|---|---|---|
| **Student Portal** | `@aaroh.edu.in` | `/student` | `aarav.sharma@aaroh.edu.in` | Academics, Timetable, Notices, Events, Lost & Found, Opportunities |
| **Faculty Portal** | `@faculty.aaroh.edu.in` | `/faculty` | `prof.raman@faculty.aaroh.edu.in` | Course Curriculum, Lecture Attendance Logger, Assignments, Notices |
| **Admin Console** | `@admin.aaroh.edu.in` | `/admin` | `registrar@admin.aaroh.edu.in` | Notice Board Publishing, Event Approvals, Timetable Scheduler, Reset Data |

- **Single Sign-On (SSO) Login Screen:** Accessible at `/login`, with 1-click evaluator pills for Student, Faculty, and Admin accounts.
- **Root Dispatcher (`/`):** Dynamically redirects authenticated users to `/student`, `/faculty`, or `/admin` according to their verified role.
- **`<RoleProtectedRoute>` Guard:** Restricts subpaths by role; unauthorized attempts are safely intercepted and redirected to a clean institutional `/unauthorized` (HTTP 403) state.
- **Dynamic Navigation:** The sidebar and topbar conditionally adapt navigation links, badges, action buttons, and user status chips according to the active role.

---

## 🏛️ Role Portals & Core Modules

### 1. Student Portal (`/student/*`)
- **Dashboard (`/student`):** Student profile, today's lecture schedule with live next-class highlighting, attendance compliance widget, week's assignments due, pinned circulars, registered events, and quick-action row.
- **Academics (`/student/academics`):**
  - *Class Timetable:* Weekly timetable matrix and day view.
  - *Attendance Monitor:* Detailed course-by-course breakdown with visual progress bars plotted against the mandatory minimum (75%) and remediation math (classes you can safely miss or must attend).
  - *Assignments:* Coursework deadlines, filter by subject and status, sort by due date, and mark as submitted.
- **Campus Updates (`/student/notices`):** Notice feed with category filters (*Academic*, *Exams*, *Administration*, *Placements*, *General*), search, unread state tracking, and attachments.
- **Campus Events (`/student/events`):** List and calendar views, seat capacity checks, one-click registration/cancellation, and automated class-clash warnings.
- **Lost & Found (`/student/lost-found`):** Post lost or found items, search/filter, privacy-preserving in-app contact requests, and item resolution.
- **Opportunity Board (`/student/opportunities`):** Internships, hackathons, and competitions with deadlines, compensation, filters, and saved listings.

### 2. Faculty Portal (`/faculty/*`)
- **Faculty Overview (`/faculty`):** Teaching schedule for today, quick metrics (assigned subjects, enrolled students, active assignments), and quick actions.
- **Assigned Classes (`/faculty/classes`):** Curriculum management, credit allocations, and course session rosters.
- **Attendance Logger (`/faculty/attendance`):** Interactive roll-call logger to record lectures and update student attendance thresholds in real time.
- **Coursework & Grading (`/faculty/assignments`):** Create new laboratory/homework assignments with due dates and rubrics, and track student submission statuses.

### 3. Admin Console (`/admin/*`)
- **Administration Overview (`/admin`):** Institutional metrics (published circulars, campus events, scheduled timetable blocks, system state), audit logs, and direct console shortcuts.
- **Campus User Directory & Onboarding (`/admin/people`):** Complete user management table listing all registered students, faculty, and administrators. Includes live search, role-based filters, account deletion, and a dynamic modal form to onboard new students (with Program, Semester, Student ID) and faculty (with Department and Designation). Newly added accounts are stored in `localStorage` under `aaroh_users` and can immediately sign in.
- **Notice Board Publisher (`/admin/notices`):** Comprehensive circular management table with search, category filtering, pin/unpin toggles, delete action, and a full modal form to author official college directives.
- **Events & Approvals (`/admin/events`):** Oversee campus-wide events, approve student club proposals, schedule venues, and adjust capacities.
- **Timetable Scheduler (`/admin/timetable`):** Master weekly scheduling engine across Monday–Saturday, allowing administrators to allocate lecture halls, laboratory periods, and faculty assignments.
- **System Configuration (`/admin/settings`):** Institutional parameters, attendance regulation threshold adjuster (50%–90%), RBAC domain policy review, and a cleanly styled **"Reset Demo Data"** action.

---

## 📦 Tech Stack & Architecture

- **Frontend Framework:** React 18 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS with an internal tool aesthetic (Warm off-white `#FBFBFA` canvas, clean `#FFFFFF` surfaces, crisp 1px borders `#E2E8F0`, and deep teal `#0F766E` primary accent)
- **Typography:** Self-hosted IBM Plex Sans via `@fontsource/ibm-plex-sans` (14px base, tabular numerals `font-mono`)
- **Icons:** Lucide React
- **Routing:** React Router v6 with `<RoleProtectedRoute>` role-level protection
- **Offline-First Storage Layer:** Clean service abstraction in `src/services/storage.ts` that persists all state to `localStorage` without external API or CDN requirements.
- **Empty States:** Designed empty states across every single module for zero layout shifts or console errors.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in your browser
http://localhost:5173
```

### Production Build & Test
```bash
# Production bundle
npm run build

# Run RBAC verification test suite
node scripts/verify.cjs
```

---

## 🧑‍💻 Demo Credentials for Evaluators

Quick-fill pills are available on the `/login` screen for immediate 1-click evaluation:

| Role | Email | Password |
|---|---|---|
| **Student** | `aarav.sharma@aaroh.edu.in` | Any string |
| **Faculty** | `prof.raman@faculty.aaroh.edu.in` | Any string |
| **Admin** | `registrar@admin.aaroh.edu.in` | Any string |
