-- ==============================================================================
-- AAROH CAMPUS PLATFORM: NOTICES & CIRCULARS MIGRATION
-- Table: public.notices
-- K.R. Mangalam University
-- ==============================================================================

-- 1. Create table public.notices
CREATE TABLE IF NOT EXISTS public.notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Academic', 'Exams', 'Administration', 'Placements', 'General')),
    department TEXT NOT NULL,
    published_date TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    content TEXT NOT NULL,
    summary TEXT,
    priority_tag TEXT,
    issued_by TEXT,
    start_window TEXT,
    effective_date TEXT,
    circular_points JSONB,
    attachments JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies
DROP POLICY IF EXISTS "Allow public read access to notices" ON public.notices;
CREATE POLICY "Allow public read access to notices"
    ON public.notices
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert update to notices" ON public.notices;
CREATE POLICY "Allow authenticated insert update to notices"
    ON public.notices
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Seed Official Institutional Circulars into public.notices
INSERT INTO public.notices (
  id,
  title,
  category,
  department,
  published_date,
  is_pinned,
  content,
  summary
) VALUES
(
  'not_exams_odd_sem_2026',
  'End-Semester Theory Examinations: Odd Semester (2026-27)',
  'Exams',
  'Office of the Controller of Examinations (COE), K.R. Mangalam University',
  '2026-11-19',
  true,
  'End-semester theory examinations for all undergraduate and postgraduate programmes will commence in the third week of December 2026. Students must ensure attendance and fee compliance before admit card issuance.

Official Examination Guidelines:
1. Commencement: Beginning of the third week of December 2026 (subject-wise date sheet will be published shortly).
2. Eligibility: Minimum 75% attendance is mandatory as per university norms to sit for the examinations.
3. Admit Cards: Downloadable from the student portal one week prior to the exams after clearing all academic and departmental dues.
4. Exam Hall Guidelines: Carry your valid KRMU Student ID card and printed Admit Card; report to the allotted examination hall at least 30 minutes before the scheduled start time.',
  'End-semester theory examinations for all undergraduate and postgraduate programmes will commence in the third week of December 2026. Students must ensure attendance and fee compliance before admit card issuance.'
),
(
  'not_acad_practical_viva_2026',
  'Commencement of End-Semester Practical Examinations & Viva-Voce',
  'Academic',
  'Office of the Dean Academics, K.R. Mangalam University',
  '2026-11-19',
  true,
  'Internal and external practical examinations, lab evaluations, and viva-voce for the current semester will begin in the first week of December 2026.

Academic Directives:
1. Commencement: First week of December 2026 (batch-wise lab slots and room allocations will be shared by respective School/Department coordinators).
2. Lab Records & Files: All students must bring their completed and faculty-signed Practical Files / Lab Manuals on the day of evaluation.
3. Coding Labs: Students enrolled in Automated Coding Labs must ensure all pending lab modules are submitted before their scheduled practical slot.
4. Attendance: Absence during practical examinations without prior approved medical/official leave will be marked absent with no automatic re-test.',
  'Internal and external practical examinations, lab evaluations, and viva-voce for the current semester will begin in the first week of December 2026.'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  department = EXCLUDED.department,
  published_date = EXCLUDED.published_date,
  is_pinned = EXCLUDED.is_pinned,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  updated_at = timezone('utc'::text, now());
