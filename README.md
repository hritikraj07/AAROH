# Aaroh: One Platform for College Life

> Built for the college hackathon. A unified, offline-first internal operating system for undergraduate campus life at **Apex Institute of Technology (AIT)**.

Students traditionally navigate fragmented portals, paper notice boards, unofficial WhatsApp groups, and chaotic spreadsheets. **Aaroh** consolidates academics, campus circulars, events, lost & found, and career opportunities behind a single student login.

---

## 🔑 Demo Credentials
The application is pre-seeded with an active demo undergraduate profile:

- **Student Name:** Aarav Sharma
- **Roll Number:** `22CS042`
- **Department:** Computer Science & Engineering (B.Tech, Semester 5, Section A)
- **Demo Mode:** Click **"Enter Demo as Aarav Sharma"** on the login screen for instant one-click access.
- **Reset State:** Use the **"Reset Demo"** button in the top bar or settings modal at any time to restore fresh seed data.

---

## 📦 Tech Stack & Architecture

- **Frontend Framework:** React 18 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS with an institutional palette (Warm off-white `#FBFBFA` canvas, clean `#FFFFFF` surfaces, crisp 1px borders `#E2E8F0`, and deep teal `#0F766E` primary accent)
- **Typography:** Self-hosted IBM Plex Sans via `@fontsource/ibm-plex-sans` (14px base, tabular numerals `font-mono`)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Offline & Storage Architecture:** 100% standalone and offline-capable. No remote APIs, CDNs, or external tracking. Typed service layer (`src/services/`) backed by browser `localStorage` persistence with dynamic date generation relative to today so the demo never looks stale.
- **Centralized Configuration:** Brand name (`Aaroh`) and institution name (`Apex Institute of Technology`) are configured in `src/config.ts`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in your browser
http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🏛️ Core Modules & Functional Walkthrough

### 1. Dashboard (`/`)
- **Compact Profile Header:** Displays student identity, roll number, section, semester, enrolled credit hours, low attendance warnings, and pending task count.
- **Today's Classes:** Real-time next class highlighting with countdown (`Starts in Xm` or `In Progress`), room number, and instructor. If today has no classes (or after hours/weekends), dynamically shows the next active instruction day.
- **Attendance Summary Widget:** Highlights courses below the mandatory threshold (e.g. 75%) with exact mathematical remediation ("Attend 8 more classes to reach 75%").
- **Week's Assignments:** Pending and overdue assignments with one-click "Mark Done" toggle.
- **Pinned Official Circulars:** Critical college memos and examination schedules with unread badges.
- **Upcoming Events:** Registered campus activities with real-time class clash warnings.
- **Quick Action Bar:** Direct triggers to *Report Lost Item*, *Browse Events*, and *Open Timetable*.

### 2. Academics Hub (`/academics`)
Divided into three dedicated functional tabs:
1. **Class Timetable:**
   - **Weekly Grid Matrix:** Monday–Saturday schedule organized by lecture periods, with subject codes, classroom locations (`LH-102`, `CS Lab 3`), and faculty names.
   - **Day View:** Linear daily timeline with easy day switching.
2. **Attendance Monitor:**
   - **Regulation Compliance:** Full course breakdown with attended/total hours and visual progress bars plotted against the threshold.
   - **Remediation Math:**
     - If below threshold: computes minimum consecutive lectures required to regain eligibility: $\lceil \frac{T \cdot \text{total} - 100 \cdot \text{attended}}{100 - T} \rceil$.
     - If above threshold: computes maximum safe absences without falling below: $\lfloor \frac{100 \cdot \text{attended} - T \cdot \text{total}}{T} \rfloor$.
   - **Configurable Policy Adjuster:** Test regulations at 70%, 75%, 80%, or 85% to see immediate recalculations.
3. **Assignments & Deadlines:**
   - Filter by status (*All*, *Pending*, *Submitted*, *Overdue*) and by enrolled subject.
   - Sort by due date (soonest / furthest).
   - "Mark as Submitted" action instantly updates the status and marks the record.

### 3. Campus Updates (`/notices`)
- **Notice Feed:** Official circulars categorized into *Academic*, *Exams*, *Administration*, *Placements*, and *General*.
- **Search & Unread Tracking:** Filter circulars by department or keywords; track unread items with teal indicator dots.
- **Circular Modal & Attachments:** Read full notices with formatted PDF/DOC attachment listings and simulated offline document downloads.
- **Global Actions:** Single-click "Mark all as read" capability.

### 4. Campus Events & Activities (`/events`)
- **Dual Views:** Switch seamlessly between Grid List view and Month/Week Calendar view.
- **Capacity Enforcement:** Live seat count tracking ($142 / 150$ attendees) and housefull locking.
- **Cross-Module Timetable Clash Detection:** Cross-references the event's date and time slot against the student's personal class schedule, displaying an amber warning alert if an overlap is detected (e.g., *Hands-on Linux Workshop* overlapping with *Computer Networks Lab*).
- **Registration Management:** One-click registration and pass cancellation with instant e-pass token generation and a dedicated "My Registrations" view.

### 5. Lost & Found Registry (`/lost-found`)
- **Peer-to-Peer Clearinghouse:** Report lost or found articles with category, location, date, description, and visual category icon tags.
- **Privacy-First In-App Contact:** No public exposure of personal phone numbers. Interested students submit a "Request Contact" token, notifying the poster in-app with verified student credentials.
- **Lifecycle Resolution:** Item posters can mark their listings as "Resolved" when claimed, keeping the campus registry clean.

### 6. Opportunity Board (`/opportunities`)
- **Curated Openings:** Internships, hackathons, and engineering competitions with organization names, compensation/prizes, eligibility rules, and application links.
- **Urgency Indicators:** Dynamic "X days left" countdown badges.
- **Expired Item Handling:** Passed deadlines are automatically muted, grayscaled, and sorted to the bottom archived section.
- **Bookmark & Save:** Save opportunities to a persistent "Saved Listings" tab.

---

## 🌐 Universal System Capabilities

- **Global Omnisearch (`Cmd+K` / `Ctrl+K`):** Search instantly across circulars, events, opportunities, lost & found items, and course syllabi with arrow key navigation.
- **Notification Dropdown:** Real-time notifications for low attendance warnings, upcoming assignment deadlines, and exam circular releases.
- **Reset Demo Data:** Safely restores default mock records, dates relative to today, and student profile states with a single click.
- **Fully Responsive:** Tested and verified from 390px mobile viewports (with sliding navigation drawer) to high-resolution desktop displays.

---

## 📄 License
MIT License. Built for hackathon presentation and campus operations.
