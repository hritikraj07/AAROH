-- ==============================================================================
-- AAROH CAMPUS PLATFORM: TIMETABLE ENGINE & MIGRATION SCHEMA
-- Semester 1 (Autumn) - B.Tech CSE (AI & ML)
-- K.R. Mangalam University
-- ==============================================================================

-- 1. Create Timetable Table (if not exists)
CREATE TABLE IF NOT EXISTS public.aaroh_timetable (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 1 = Mon ... 6 = Sat, 0 = Sun
    start_time TEXT NOT NULL, -- e.g. "09:10"
    end_time TEXT NOT NULL,   -- e.g. "10:00"
    room TEXT NOT NULL,
    faculty_name TEXT NOT NULL,
    faculty_email TEXT,
    type TEXT NOT NULL DEFAULT 'PP', -- 'PP' (Theory/Practice) or 'PR' (Lab/Practical)
    program TEXT NOT NULL DEFAULT 'B.Tech CSE (AI & ML)',
    semester INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.aaroh_timetable ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated read policy
CREATE POLICY "Allow public read access to timetable"
    ON public.aaroh_timetable
    FOR SELECT
    USING (true);

-- Faculty and admin write policy
CREATE POLICY "Allow authorized users to manage timetable"
    ON public.aaroh_timetable
    FOR ALL
    USING (auth.role() = 'authenticated');

-- 2. Seed / Upsert the 21 Lecture Sessions for B.Tech CSE AI & ML (Semester 1)
INSERT INTO public.aaroh_timetable (
    id, course_id, course_code, course_name, day_of_week, start_time, end_time, room, faculty_name, faculty_email, type, program, semester
) VALUES
-- Tuesday (3 Periods)
('ts_tue_1', 'c_python_aiml', 'CS101-AIML', 'Programming for Problem Solving Using Python', 2, '13:30', '14:20', 'D-113', 'Jain Swati', 'swati.jain@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_tue_2', 'c_prob_stats', 'MA101-AIML', 'Probability, Statistics & Linear Algebra', 2, '14:20', '15:10', 'D-321', 'Bansal Pooja', 'pooja.bansal@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_tue_3', 'c_prob_stats', 'MA101-AIML', 'Probability, Statistics & Linear Algebra', 2, '15:10', '16:00', 'D-321', 'Bansal Pooja', 'pooja.bansal@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),

-- Wednesday (6 Periods)
('ts_wed_1', 'c_webdev_aiml', 'CS103-AIML', 'Web Dev I (HTML, CSS, JS Basics)', 3, '09:10', '10:00', 'LAB-21 (D301)', 'Rawat Neeraj', 'neeraj.rawat@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_wed_2', 'c_webdev_aiml', 'CS103-AIML', 'Web Dev I (HTML, CSS, JS Basics)', 3, '10:05', '10:55', 'LAB-21 (D301)', 'Rawat Neeraj', 'neeraj.rawat@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_wed_3', 'c_prob_stats', 'MA101-AIML', 'Probability, Statistics & Linear Algebra', 3, '11:00', '11:50', 'D-321', 'Bansal Pooja', 'pooja.bansal@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_wed_4', 'c_electronics_aiml', 'EC101-AIML', 'Basics of Electronics & Digital Logic Design', 3, '13:30', '14:20', 'D-321', 'Kumar Ritesh', 'ritesh.kumar@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_wed_5', 'c_python_aiml', 'CS101-AIML', 'Programming for Problem Solving Using Python', 3, '14:20', '15:10', 'LAB-21 (D301)', 'Jain Swati', 'swati.jain@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_wed_6', 'c_python_aiml', 'CS101-AIML', 'Programming for Problem Solving Using Python', 3, '15:10', '16:00', 'LAB-21 (D301)', 'Jain Swati', 'swati.jain@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),

-- Thursday (5 Periods)
('ts_thu_1', 'c_python_aiml', 'CS101-AIML', 'Programming for Problem Solving Using Python', 4, '09:10', '10:00', 'D-321', 'Jain Swati', 'swati.jain@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_thu_2', 'c_cs_fundamentals', 'CS102-AIML', 'CS Fundamentals & Career Pathways', 4, '11:50', '12:40', 'D-321', 'Gupta Ankita', 'ankita.gupta@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_thu_3', 'c_prob_stats', 'MA101-AIML', 'Probability, Statistics & Linear Algebra', 4, '13:30', '14:20', 'D-321', 'Bansal Pooja', 'pooja.bansal@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_thu_4', 'c_prob_stats', 'MA101-AIML', 'Probability, Statistics & Linear Algebra', 4, '14:20', '15:10', 'D-321', 'Bansal Pooja', 'pooja.bansal@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_thu_5', 'c_webdev_aiml', 'CS103-AIML', 'Web Dev I (HTML, CSS, JS Basics)', 4, '15:10', '16:00', 'D-321', 'Rawat Neeraj', 'neeraj.rawat@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),

-- Friday (7 Periods)
('ts_fri_1', 'c_python_aiml', 'CS101-AIML', 'Programming for Problem Solving Using Python', 5, '09:10', '10:00', 'D-321', 'Jain Swati', 'swati.jain@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_fri_2', 'c_cs_fundamentals', 'CS102-AIML', 'CS Fundamentals & Career Pathways', 5, '10:05', '10:55', 'D-321', 'Gupta Ankita', 'ankita.gupta@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_fri_3', 'c_electronics_aiml', 'EC101-AIML', 'Basics of Electronics & Digital Logic Design', 5, '11:00', '11:50', 'D-321', 'Kumar Ritesh', 'ritesh.kumar@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_fri_4', 'c_electronics_aiml', 'EC101-AIML', 'Basics of Electronics & Digital Logic Design', 5, '11:50', '12:40', 'D-321', 'Kumar Ritesh', 'ritesh.kumar@faculty.aaroh.edu.in', 'PP', 'B.Tech CSE (AI & ML)', 1),
('ts_fri_5', 'c_maker_lab', 'ME101-AIML', 'Maker Lab: Tinkering with Technology', 5, '13:30', '14:20', 'D-102', 'Mehta Ankush', 'ankush.mehta@faculty.aaroh.edu.in', 'PR', 'B.Tech CSE (AI & ML)', 1),
('ts_fri_6', 'c_maker_lab', 'ME101-AIML', 'Maker Lab: Tinkering with Technology', 5, '14:20', '15:10', 'D-102', 'Mehta Ankush', 'ankush.mehta@faculty.aaroh.edu.in', 'PR', 'B.Tech CSE (AI & ML)', 1),
('ts_fri_7', 'c_maker_lab', 'ME101-AIML', 'Maker Lab: Tinkering with Technology', 5, '15:10', '16:00', 'D-102', 'Mehta Ankush', 'ankush.mehta@faculty.aaroh.edu.in', 'PR', 'B.Tech CSE (AI & ML)', 1)
ON CONFLICT (id) DO UPDATE SET
    course_id = EXCLUDED.course_id,
    course_code = EXCLUDED.course_code,
    course_name = EXCLUDED.course_name,
    day_of_week = EXCLUDED.day_of_week,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    room = EXCLUDED.room,
    faculty_name = EXCLUDED.faculty_name,
    faculty_email = EXCLUDED.faculty_email,
    type = EXCLUDED.type,
    program = EXCLUDED.program,
    semester = EXCLUDED.semester,
    updated_at = NOW();
