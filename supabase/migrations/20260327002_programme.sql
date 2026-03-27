-- ============================================================
-- Sprint 2: Programme Module + Notifications
-- ============================================================

-- Venues/Rooms
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  capacity int NOT NULL DEFAULT 0,
  location text,
  floor int,
  map_coordinates jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Speakers
CREATE TABLE IF NOT EXISTS speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  full_name_en text,
  title text,
  title_en text,
  organization text,
  organization_en text,
  bio text,
  bio_en text,
  avatar_url text,
  country text,
  social_links jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Event sessions (programme items)
CREATE TABLE IF NOT EXISTS event_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text,
  description text,
  description_en text,
  session_type text DEFAULT 'general' CHECK (session_type IN ('general', 'keynote', 'workshop', 'panel', 'exhibition', 'networking', 'other')),
  venue_id uuid REFERENCES venues(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  capacity int DEFAULT 0,
  registered_count int DEFAULT 0,
  is_registration_open boolean DEFAULT true,
  zone text DEFAULT 'green' CHECK (zone IN ('green', 'blue', 'both')),
  tags text[],
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Session speakers (many-to-many)
CREATE TABLE IF NOT EXISTS session_speakers (
  session_id uuid REFERENCES event_sessions(id) ON DELETE CASCADE,
  speaker_id uuid REFERENCES speakers(id) ON DELETE CASCADE,
  role text DEFAULT 'speaker',
  sort_order int DEFAULT 0,
  PRIMARY KEY (session_id, speaker_id)
);

-- Seat registrations
CREATE TABLE IF NOT EXISTS seat_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES event_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
  registered_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  UNIQUE(session_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_seat_reg_session ON seat_registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_seat_reg_user ON seat_registrations(user_id);

-- Attendance (QR/NFC check-in)
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES event_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  checked_in_at timestamptz DEFAULT now(),
  check_in_method text DEFAULT 'qr' CHECK (check_in_method IN ('qr', 'nfc', 'manual')),
  UNIQUE(session_id, user_id)
);

-- Session surveys
CREATE TABLE IF NOT EXISTS session_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES event_sessions(id) ON DELETE CASCADE,
  user_id uuid, -- nullable for anonymous
  rating int CHECK (rating BETWEEN 1 AND 5),
  feedback text,
  submitted_at timestamptz DEFAULT now()
);

-- User agenda (saved sessions)
CREATE TABLE IF NOT EXISTS user_agenda (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES event_sessions(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, session_id)
);

-- Notifications log
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text,
  body text NOT NULL,
  body_en text,
  notification_type text DEFAULT 'general' CHECK (notification_type IN ('general', 'programme', 'emergency', 'system')),
  target_roles text[], -- null = all
  target_countries text[],
  sent_by uuid REFERENCES profiles(id),
  sent_at timestamptz DEFAULT now(),
  is_emergency boolean DEFAULT false
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read for published sessions, venues, speakers
CREATE POLICY "Public can read venues" ON venues FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read speakers" ON speakers FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read published sessions" ON event_sessions FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read session speakers" ON session_speakers FOR SELECT USING (true);

-- Seat registrations
CREATE POLICY "Users can view own registrations" ON seat_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register" ON seat_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own registration" ON seat_registrations FOR UPDATE USING (auth.uid() = user_id);

-- User agenda
CREATE POLICY "Users can manage own agenda" ON user_agenda FOR ALL USING (auth.uid() = user_id);

-- Surveys - allow anonymous insert
CREATE POLICY "Anyone can submit survey" ON session_surveys FOR INSERT WITH CHECK (true);

-- Attendance
CREATE POLICY "Users can view own attendance" ON attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert attendance" ON attendance FOR INSERT WITH CHECK (true);

-- Notifications
CREATE POLICY "Users can read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);

-- Admin full access
CREATE POLICY "Admins manage venues" ON venues FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage speakers" ON speakers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage sessions" ON event_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);

-- ============================================================
-- Helper Functions
-- ============================================================

-- increment_otp_attempts function (fix from Sprint 1 TODO)
CREATE OR REPLACE FUNCTION increment_otp_attempts(p_email text)
RETURNS void AS $$
BEGIN
  INSERT INTO otp_attempts (email, attempt_count, last_attempt_at)
  VALUES (p_email, 1, now())
  ON CONFLICT (email) DO UPDATE
    SET attempt_count = otp_attempts.attempt_count + 1,
        last_attempt_at = now(),
        blocked_until = CASE
          WHEN otp_attempts.attempt_count + 1 >= 5
          THEN now() + interval '30 minutes'
          ELSE otp_attempts.blocked_until
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment/decrement session registered count
CREATE OR REPLACE FUNCTION increment_session_count(p_session_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE event_sessions SET registered_count = registered_count + 1 WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_session_count(p_session_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE event_sessions SET registered_count = GREATEST(registered_count - 1, 0) WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
