-- Auto-approve all users: event participants should access immediately after OTP login
ALTER TABLE profiles ALTER COLUMN is_approved SET DEFAULT true;

-- Approve existing users
UPDATE profiles SET is_approved = true WHERE is_approved = false OR is_approved IS NULL;
