-- ============================================================
-- Sprint 5+: Green Leaderboard RPC + Badge Automation
-- ============================================================
-- Note: user_badges, badges, step_logs tables already exist
-- from 20260327006_green_admin.sql. This migration adds:
--   1. Index + service policy on user_badges
--   2. get_step_leaderboard() RPC
--   3. check_and_award_badges() RPC
--   4. Additional badge seed data (only if badges table is empty)
-- ============================================================

-- 1. Ensure index exists on user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- Add "Service can award badges" policy (allows backend/SECURITY DEFINER functions to insert)
DROP POLICY IF EXISTS "Service can award badges" ON user_badges;
CREATE POLICY "Service can award badges" ON user_badges FOR INSERT WITH CHECK (true);

-- 2. Leaderboard RPC
CREATE OR REPLACE FUNCTION get_step_leaderboard(limit_count int DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  total_steps bigint,
  total_co2_saved_grams numeric,
  rank bigint
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    COALESCE(p.full_name, split_part(p.email, '@', 1)) AS full_name,
    p.avatar_url,
    COALESCE(SUM(sl.steps), 0)::bigint AS total_steps,
    COALESCE(SUM(sl.co2_saved_grams), 0) AS total_co2_saved_grams,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(sl.steps), 0) DESC) AS rank
  FROM profiles p
  LEFT JOIN step_logs sl ON sl.user_id = p.id
  WHERE p.is_active = true
  GROUP BY p.id, p.full_name, p.avatar_url, p.email
  ORDER BY total_steps DESC
  LIMIT limit_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_step_leaderboard(int) TO authenticated;

-- 3. Check and award step-based badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id uuid)
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_steps bigint;
  v_badge RECORD;
BEGIN
  -- Get total steps for user
  SELECT COALESCE(SUM(steps), 0) INTO v_total_steps
  FROM step_logs
  WHERE user_id = p_user_id;

  -- Award step-based badges not yet earned
  FOR v_badge IN
    SELECT id FROM badges
    WHERE badge_type = 'steps'
      AND requirement_steps <= v_total_steps
      AND id NOT IN (
        SELECT badge_id FROM user_badges WHERE user_id = p_user_id
      )
  LOOP
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (p_user_id, v_badge.id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION check_and_award_badges(uuid) TO authenticated;

-- 4. Additional badge seed data (insert only if badges table is empty)
INSERT INTO badges (name, name_en, description, description_en, icon, requirement_steps, badge_type)
SELECT * FROM (VALUES
  ('Эхлэгч', 'Starter', 'Анхны 1,000 алхам', 'First 1,000 steps', '🥾', 1000, 'steps'),
  ('Алхагч', 'Walker', '10,000 алхам', '10,000 steps', '🚶', 10000, 'steps'),
  ('Гүйгч', 'Runner', '50,000 алхам', '50,000 steps', '🏃', 50000, 'steps'),
  ('Марафон', 'Marathon', '100,000 алхам', '100,000 steps', '🏅', 100000, 'steps'),
  ('Ногоон баатар', 'Green Hero', '500,000 алхам', '500,000 steps', '🌿', 500000, 'steps')
) AS v(name, name_en, description, description_en, icon, requirement_steps, badge_type)
WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1);
