-- ============================================================
-- Sprint 5: Green Participation + Admin Polish
-- ============================================================

-- Step tracking
CREATE TABLE IF NOT EXISTS step_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  steps int NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  co2_saved_grams numeric(10,2) DEFAULT 0,
  source text DEFAULT 'manual' CHECK (source IN ('healthkit', 'health_connect', 'manual')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_step_logs_user ON step_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_step_logs_date ON step_logs(date);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  description_en text,
  icon text NOT NULL, -- emoji or image URL
  requirement_steps int NOT NULL DEFAULT 0,
  badge_type text DEFAULT 'steps' CHECK (badge_type IN ('steps', 'co2', 'attendance', 'special')),
  created_at timestamptz DEFAULT now()
);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Complaints / Feedback tickets
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('general', 'service', 'technical', 'safety', 'other')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  sla_deadline timestamptz,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed badges
INSERT INTO badges (name, name_en, description, description_en, icon, requirement_steps, badge_type) VALUES
('Эхлэгч', 'Starter', '1,000 алхам хийсэн', 'Walked 1,000 steps', '🌱', 1000, 'steps'),
('Идэвхтэн', 'Active', '5,000 алхам хийсэн', 'Walked 5,000 steps', '🚶', 5000, 'steps'),
('Спортч', 'Athlete', '10,000 алхам хийсэн', 'Walked 10,000 steps', '🏃', 10000, 'steps'),
('Ногоон тэмцэгч', 'Green Warrior', '500г CO₂ хэмнэсэн', 'Saved 500g CO₂', '🌿', 0, 'co2'),
('Байгаль хамгаалагч', 'Eco Champion', '1кг CO₂ хэмнэсэн', 'Saved 1kg CO₂', '🌍', 0, 'co2')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE step_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own steps" ON step_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Users read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own complaints" ON complaints FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage complaints" ON complaints FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage step_logs" ON step_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
CREATE POLICY "Admins manage badges" ON badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id as user_id,
  p.full_name,
  p.country,
  p.organization,
  COALESCE(SUM(s.steps), 0) as total_steps,
  COALESCE(SUM(s.co2_saved_grams), 0) as total_co2_saved,
  COUNT(DISTINCT ub.badge_id) as badge_count
FROM profiles p
LEFT JOIN step_logs s ON s.user_id = p.id
LEFT JOIN user_badges ub ON ub.user_id = p.id
WHERE p.is_approved = true
GROUP BY p.id, p.full_name, p.country, p.organization
ORDER BY total_steps DESC;
