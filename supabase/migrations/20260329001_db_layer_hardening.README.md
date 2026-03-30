# Migration: 20260329001_db_layer_hardening.sql

## Status
✅ Migration file written — **manual apply required** (DB password not available to CLI)

## How to Apply

### Option A: Supabase Dashboard SQL Editor (easiest)
1. Go to https://supabase.com/dashboard/project/infosxkgsrmqmbkoutgq/sql
2. Open `20260329001_db_layer_hardening.sql`
3. Paste and run the full SQL

### Option B: supabase CLI with DB password
```bash
cd /Users/marktech/Projects/event-app
supabase db push --db-url "postgresql://postgres.[project-ref]:[DB_PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```
Get the DB password from: Supabase Dashboard → Settings → Database → Database password

### Option C: psql direct
```bash
psql "postgresql://postgres:[password]@db.infosxkgsrmqmbkoutgq.supabase.co:5432/postgres" \
  -f supabase/migrations/20260329001_db_layer_hardening.sql
```

## What This Migration Contains

### New Tables
| Table | Purpose |
|-------|---------|
| `session_feedback` | Session ratings (1-5) + comments per user |
| `vendors` | Vendor/booth directory |
| `announcements` | CMS-managed notifications/news |
| `notification_preferences` | Per-user notification toggles |
| `user_notifications` | Per-user inbox (inserted by broadcast_notification RPC) |

### New RPCs
| Function | Purpose |
|----------|---------|
| `check_otp_rate_limit(p_email)` | OTP brute-force: 5 attempts / 10 min window |
| `register_session(p_session_id, p_user_id?)` | Race-safe seat registration (SELECT FOR UPDATE) |
| `wallet_transfer(p_user_id, p_amount, p_type, p_idempotency_key, p_description?)` | ACID wallet debit/credit |
| `broadcast_notification(p_title, p_body, p_type?, p_target_roles[]?)` | Fan-out to all matching users |

### Helper Functions
- `get_current_user_role()` — SECURITY DEFINER, prevents RLS recursion in announcements policy
- `current_user_role()` — SECURITY DEFINER, used for profiles admin policy

### RLS Policies Added
- `session_feedback`: users own their feedback; admins see all
- `vendors`: public read (active only); admins manage
- `announcements`: users see published + not expired + matching role; admins manage
- `notification_preferences`: users own their prefs; super_admin can read all
- `user_notifications`: users own their inbox; admins manage

### RLS Recursion Notes
- Existing event-app policies use `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (...))` — this is **safe** because it queries profiles by PK (`auth.uid()`), not recursively
- New `get_current_user_role()` + `current_user_role()` SECURITY DEFINER functions provide recursion-safe role checks for cross-table policies
- The DO block adds an "Admins can view all profiles safe" policy using the SECURITY DEFINER helper (only if it doesn't exist yet)

## Notes
- `wallet_transfer` replaces nothing — existing `wallet_debit`/`wallet_credit` functions remain
- `user_notifications` is separate from the existing `notifications` broadcast log table
- All RPCs: `SECURITY DEFINER` + `SET search_path = public`
