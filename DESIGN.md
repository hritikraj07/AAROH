# Aaroh Design System: Visual Direction & Standards

## 1. Visual Direction and Vibe

- **Direction**: Crisp editorial utility, high data density, zero decorative fluff.
- **Personality**: Institutional, precise, dependable, calm, and legible. Aaroh is an academic operating platform for students and faculty, not a flashy SaaS marketing site.
- **Craftsmanship Standards**:
  - Intentionality (C-1): Every component, border, badge, and label has an articulable purpose.
  - Functional Completeness (C-2): Every interactive control works or is not rendered. No dead buttons.
  - Content-Driven Composition (C-3): Layout conforms to academic data (courses, attendance, labs, timetables), never AI template layouts.
  - Resilience (C-4): Robust states for empty, loading, error, and offline cache across light and dark themes.
  - Evidence Over Claims (C-5): All numbers reflect genuine student and institutional records. No fake stats.
- **Antislop Dials**: `Dial: ENERGY 1 / RHYTHM 1 / MOTION 1`
  - ENERGY 1: Calm, grounded academic utility.
  - RHYTHM 1: Predictable, structured, high-density tabular and card data grids.
  - MOTION 1: Instant transitions, functional hover states, zero floating or bobbing animations.

---

## 2. Color Tokens

### Light Mode (Primary Canvas)
- **Base Background**: `#FBFBFA` (warm off-white) / `#EEF4ED` (nordic mist)
- **Surfaces & Cards**: `#FFFFFF` (pure white)
- **Subtle Surface / Inset**: `#F4F7F4` / `#F8FAFC`
- **Borders**: 1px solid `#E2E8F0` (slate-200) / `#D8E2DC` (nordic border)
- **Primary Accent**: `#0F766E` (Deep Teal)
- **Secondary Accent / Structure**: `#355B82` (Nordic Steel)
- **Interactive Action Navy**: `#134074` (Nordic Navy for primary CTA buttons)
- **Text - Primary**: `#0B2545` (Nordic Dark Navy) / `#0F172A` (Slate-900)
- **Text - Secondary / Muted**: `#64748B` (Slate-500)
- **Text - Metadata / Mono**: `#355B82` / `#475569`

### Dark Mode (True Dark Mode Canvas)
- **Base Background**: `#0E0E11` (pure deep near-black)
- **Surfaces & Cards**: `#18181B` (zinc-900 solid surface)
- **Elevated Surfaces / Inset**: `#222226` / `#1F2937`
- **Borders**: 1px solid `#27272A` (dark slate border) / `#223145`
- **Form Input Background**: `#141D2B`
- **Primary Accent**: `#0F766E` (Deep Teal) / `#14B8A6` (Teal-500 on dark)
- **Text - Primary**: `#EEF4ED` (Nordic light) / `#F8FAFC`
- **Text - Secondary / Muted**: `#94A3B8` / `#A1A1AA`
- **Text - Metadata / Mono**: `#8DA9C4` / `#64748B`

### Status & Semantic Tokens
- **Success**: `#059669` (Emerald-600) light / `#10B981` dark. Background: `#ECFDF5` / `#064E3B`
- **Warning**: `#D97706` (Amber-600) light / `#F59E0B` dark. Background: `#FFFBEB` / `#78350F`
- **Danger**: `#DC2626` (Red-600) light / `#EF4444` dark. Background: `#FEF2F2` / `#7F1D1D`
- **Info**: `#2563EB` (Blue-600) light / `#3B82F6` dark. Background: `#EFF6FF` / `#1E3A8A`

---

## 3. Typography

- **UI & Body**: `IBM Plex Sans` (`font-sans`)
  - Weights: 400 (regular body), 500 (medium labels), 600 (semi-bold headings), 700 (bold titles)
  - Features: font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'
- **Codes, Metrics, Roll Numbers & Timestamps**: `JetBrains Mono` / monospace (`font-mono`)
  - Weights: 400 (data strings), 500 (status codes), 600 (numerical counts)
  - Numeric layout: `tabular-nums` required on all counts, percentages, and timetables.

### Type Scale Rules
- **Display Metric / Stat**: 24px - 30px (font-mono, font-bold, tabular-nums)
- **Page Title**: 20px - 22px (font-sans, font-bold, tracking-tight)
- **Section Heading**: 15px - 16px (font-sans, font-bold)
- **Component Subheading**: 13px - 14px (font-sans, font-semibold)
- **Body Text**: 13px - 14px (font-sans, font-normal, line-height 1.5)
- **Metadata / Form Labels**: 12px (font-sans, font-medium)
- **Code / Pill / Tag**: 10px - 11px (font-mono, font-medium, tracking-tight)

---

## 4. Layout and Component Standards

- **Borders over Shadows**: Always prefer 1px solid borders (`border border-slate-200 dark:border-[#27272A]`) over drop shadows. Drop shadows are forbidden on containers, cards, and panels.
- **Button Shadows**: Standard components remain flat. The only permitted elevation is the custom 4-layer tactile button depth (`.shadow-btn-tactile`) applied strictly to primary CTA buttons.
- **No Floating Cards**: Panels sit directly on their grid plane. Do not use blurred glowing backdrops or floating effects.
- **Glassmorphism Dose Cap (R-10)**: Strict limit of 1 to 2 elements per view (e.g., sticky navigation header only). Glassmorphism on cards, sidebars, or modals simultaneously is forbidden.
- **Spacing Scale**: Crisp, compact spacing (padding 12px to 20px on cards, gap 8px to 16px). Avoid giant empty white spaces.
- **Mobile Breakpoints (R-03)**:
  - Mobile (<640px): 1-column stack, zero horizontal overflow, minimum 44px tap target on buttons, comfortable touch padding.
  - Tablet (640px to 1024px): 2-column grids or horizontal scroll tracks with visible scrollbar hints.
  - Desktop (>1024px): Dense multi-column layouts, data tables, and side-by-side modules.

---

## 5. Anti-Patterns and Strict Project Rules

- **Zero Em Dashes (R-02)**: Never use the em dash character in any UI text, labels, messages, or copy. Use commas, periods, colons, or parentheses instead.
- **Zero Fake Metrics (R-17, C-5)**: Never hardcode fictional match percentages (e.g., "98% Match"), fictional uptime ("99.9%"), or simulated user counts. Display only verified local data or omit the metric.
- **Zero Buzzwords and AI Fluff (R-16)**: Banned terms: "AI Powered", "Synergy Match", "AI Skill Graph", "Next Generation", "Revolutionary", "Cutting Edge", "Seamless", "Intelligent". State the actual functional purpose clearly.
- **Zero Generic Sparkle Icons (R-04, R-09)**: Never use decorative sparkles, magic wands, or star badges for features. Use domain-specific icons (BookOpen, Code, Terminal, Calendar, Clock, CheckCircle).
- **Zero Generic Gradients (R-01)**: Do not use purple-to-blue, rainbow, or emerald-teal avatar gradients. Use solid neutral backgrounds or initial monograms.
- **Local Persistence Guarantee**: All user actions, submissions, and filters persist offline via browser localStorage.
