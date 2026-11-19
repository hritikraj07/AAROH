-- ==============================================================================
-- Migration: Create public.aaroh_events and seed AARAMBHATHON 2.0 hackathon event
-- Execute this script in your Supabase Project SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.aaroh_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Tech', 'Cultural', 'Sports', 'Workshops', 'Clubs')),
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    event_date TEXT,
    time_window TEXT,
    venue TEXT NOT NULL,
    organizer TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100,
    registered_count INTEGER NOT NULL DEFAULT 0,
    is_registered BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    itinerary JSONB,
    guidelines JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.aaroh_events ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated and anonymous clients
DROP POLICY IF EXISTS "Allow public read access to aaroh_events" ON public.aaroh_events;
CREATE POLICY "Allow public read access to aaroh_events"
    ON public.aaroh_events
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users / admins to manage events
DROP POLICY IF EXISTS "Allow authenticated insert update to aaroh_events" ON public.aaroh_events;
CREATE POLICY "Allow authenticated insert update to aaroh_events"
    ON public.aaroh_events
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Upsert AARAMBHATHON 2.0 Hackathon Record
INSERT INTO public.aaroh_events (
    id,
    title,
    description,
    category,
    date,
    start_time,
    end_time,
    event_date,
    time_window,
    venue,
    organizer,
    capacity,
    registered_count,
    is_registered,
    status,
    itinerary,
    guidelines
)
VALUES (
    'evt_aarambhathon_2026',
    'AARAMBHATHON 2.0',
    'AARAMBHATHON 2.0 is K.R. Mangalam University''s premier 24-hour national hackathon, bringing together innovative minds to develop cutting-edge solutions across AI/ML, Web3, Smart Automation, and Campus Tech.',
    'Tech',
    '2026-11-19',
    '16:00',
    '15:00',
    '19th - 20th November 2026',
    '19 Nov, 4:00 PM - 20 Nov, 3:00 PM',
    'Reception & Moot Court, K.R. Mangalam University',
    'Organising Team, AARAMBHATHON 2.0 (K.R. Mangalam University)',
    300,
    142,
    false,
    'approved',
    '[
        {
            "day": "Day 1",
            "date": "19th November 2026",
            "slots": [
                { "time": "4:00 PM - 5:00 PM", "activity": "Team Registration Desk & Check-in", "location": "Reception" },
                { "time": "4:00 PM - 5:00 PM", "activity": "Luggage, Backpacks & Baggage Deposit", "location": "Moot Court" },
                { "time": "5:00 PM - 6:00 PM", "activity": "Inaugural Ceremony, Keynote & Rules Briefing", "location": "Auditorium" },
                { "time": "6:00 PM", "activity": "Hacking Begins & Problem Statement Finalization", "location": "Innovation Labs" },
                { "time": "8:30 PM - 9:30 PM", "activity": "Dinner & Mentor Check-in Round 1", "location": "Dining Hall" },
                { "time": "11:30 PM - 12:00 AM", "activity": "Midnight Refreshments & Power Snack Break", "location": "Cafeteria" }
            ]
        },
        {
            "day": "Day 2",
            "date": "20th November 2026",
            "slots": [
                { "time": "2:00 AM - 4:00 AM", "activity": "Night Coding Sprints & Technical Mentorship", "location": "Innovation Labs" },
                { "time": "8:00 AM - 9:00 AM", "activity": "Morning Breakfast & Evaluation Progress Sync", "location": "Dining Hall" },
                { "time": "11:00 AM - 12:30 PM", "activity": "Mentor Round 2 & Preliminary Code Freeze", "location": "Innovation Labs" },
                { "time": "1:00 PM - 2:00 PM", "activity": "Lunch & Final Pitch Deck Preparation", "location": "Dining Hall" },
                { "time": "2:00 PM - 3:00 PM", "activity": "Grand Finale Pitching, Valedictory Ceremony & Awards", "location": "Moot Court / Auditorium" }
            ]
        }
    ]'::jsonb,
    '[
        "Attendance on both days is mandatory for all registered participants.",
        "Registration Desk at Reception opens from 4:00 PM - 5:00 PM on 19th November 2026.",
        "Full team must report together; strictly no entry permitted after 4:45 PM.",
        "Luggage, backpacks, and personal baggage must be deposited in the Moot Court only.",
        "Signed NOC (No Objection Certificate) is mandatory for every team member at check-in.",
        "Valid QR code from student portal registration is mandatory for lab and room entry."
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    date = EXCLUDED.date,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    event_date = EXCLUDED.event_date,
    time_window = EXCLUDED.time_window,
    venue = EXCLUDED.venue,
    organizer = EXCLUDED.organizer,
    capacity = EXCLUDED.capacity,
    registered_count = EXCLUDED.registered_count,
    itinerary = EXCLUDED.itinerary,
    guidelines = EXCLUDED.guidelines,
    updated_at = timezone('utc'::text, now());
