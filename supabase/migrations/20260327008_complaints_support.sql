-- Complaints / feedback table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('general', 'service', 'technical', 'safety', 'other')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Users can submit and view own complaints
CREATE POLICY "Users can insert complaints" ON complaints FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view own complaints" ON complaints FOR SELECT USING (auth.uid() = user_id);
-- Admins/specialists can manage all
CREATE POLICY "Admins manage complaints" ON complaints FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);
