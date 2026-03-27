-- User roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'specialist', 'vip', 'participant');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'participant';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- VIP applications
CREATE TABLE IF NOT EXISTS vip_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  organization text,
  position text,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Digital IDs (QR/NFC for VIP)
CREATE TABLE IF NOT EXISTS digital_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  qr_payload text NOT NULL,
  nfc_payload text,
  issued_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_revoked boolean DEFAULT false,
  hmac_signature text NOT NULL
);

-- OTP rate limiting
CREATE TABLE IF NOT EXISTS otp_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempt_count int DEFAULT 1,
  last_attempt_at timestamptz DEFAULT now(),
  blocked_until timestamptz
);
CREATE INDEX IF NOT EXISTS idx_otp_attempts_email ON otp_attempts(email);

-- RLS
ALTER TABLE vip_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own vip application" ON vip_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vip application" ON vip_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage vip applications" ON vip_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'specialist'))
);

CREATE POLICY "Users can view own digital id" ON digital_ids FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage digital ids" ON digital_ids FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);
