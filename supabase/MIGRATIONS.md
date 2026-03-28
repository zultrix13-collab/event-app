# Database Migrations

Run these migrations **in order** using the Supabase dashboard (SQL editor) or Supabase CLI (`supabase db push`).

## Migration Order & Descriptions

| # | File | Description |
|---|------|-------------|
| 1 | `202603220001_phase2_auth_org.sql` | Core auth foundation: `profiles` table (extends auth.users), `organizations`, `organization_members`. Includes `set_updated_at()` trigger, RLS policies, and `pgcrypto` extension. |
| 2 | `202603220002_phase3_subscriptions.sql` | SaaS billing foundation: `plans` table (feature limits), `subscriptions` table (org-level subscription lifecycle: trialing → active → canceled). |
| 3 | `202603220003_phase2_phase3_hardening.sql` | Hardening pass: adds `bootstrap_pending_billing` subscription status, removes insecure direct-write policies, replaces multi-step org creation with atomic `create_organization_with_starter()` RPC (SECURITY DEFINER). |
| 4 | `202603220008_phase7_billing_qpay.sql` | QPay billing: `invoices` table with webhook verification tokens, `payment_transactions` table, `billing_events` audit log. Includes idempotency keys and indexes. |
| 5 | `202603220009_phase7_billing_hardening.sql` | Invoice verification audit trail: adds `verification_attempt_count`, `last_verification_at`, `last_verification_outcome` columns to `invoices` for retry/reconciliation tracking. |
| 6 | `202603220010_operator_audit.sql` | Operator/support audit log: `operator_audit_events` table (append-only, service-role-only access) for tracking support actions like invoice reverification and job retries. |
| 7 | `202603220011_fix_rls_recursion.sql` | Bug fix: resolves RLS infinite recursion (Postgres error 42P17) on `organization_members`. Introduces `is_org_member()` SECURITY DEFINER helper to safely check membership without triggering recursive policy evaluation. |
| 8 | `202603220012_system_admins.sql` | System admin control plane: `system_admins` table with roles (`super_admin`, `operator`, `viewer`). Replaces env-var-only admin check with DB-backed model. No client RLS — service role only. |
| 9 | `20260327001_event_auth.sql` | Event-specific user roles: adds `role` enum (`super_admin`, `specialist`, `vip`, `participant`) to `profiles`. Adds event fields: `phone`, `country`, `organization`, `is_approved`, `last_login_at`. Creates `vip_applications` table with approval workflow. |
| 10 | `20260327002_programme.sql` | Event programme module: `venues` (rooms/halls), `speakers`, `sessions` (schedule), `session_speakers` (M2M), `bookmarks`, `notifications`. |
| 11 | `20260327003_services_payment.sql` | Marketplace & payments: `products` (merchandise/food/tickets), `orders`, `order_items`, QPay invoice integration for event commerce. |
| 12 | `20260327004_ai_chatbot.sql` | AI chatbot knowledge base: enables `pgvector` extension, creates `kb_documents` and `kb_chunks` tables with `vector(1536)` embeddings (OpenAI text-embedding-3-small). IVFFlat cosine index for similarity search. |
| 13 | `20260327005_map.sql` | Venue mapping: `map_pois` (outdoor GPS points of interest with categories), `floor_plans` (indoor SVG floor plans linked to Supabase Storage). |
| 14 | `20260327006_green_admin.sql` | Green participation: `step_logs` (daily step tracking with CO2 savings), `badges` (achievement system), `user_badges` (awarded badges). Source tracking: HealthKit, Health Connect, manual. |
| 15 | `20260327007_green_leaderboard.sql` | Leaderboard RPCs: `get_step_leaderboard()` for ranked step counts, `check_and_award_badges()` for automatic badge evaluation. Adds service-role policy for badge awarding. |
| 16 | `20260327008_complaints_support.sql` | Support system: `complaints` table with categories (general, service, technical, safety), status workflow (open → in_progress → resolved → closed), admin assignment and notes. RLS: users see own complaints; admins/specialists see all. |
| 17 | `20260327009_socialpay.sql` | SocialPay integration: `socialpay_invoices` table linked to `orders`, stores payment URLs, QR codes, status, and callback payloads. RLS: users see own invoices. |

## Running Migrations

### Option A: Supabase Dashboard (SQL Editor)

1. Go to your Supabase project → **SQL Editor**
2. Open each file from `supabase/migrations/` in order
3. Paste and run each one

### Option B: Supabase CLI

```bash
# Link to your project
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push
```

### Option C: psql direct

```bash
for f in supabase/migrations/*.sql; do
  echo "Running $f..."
  psql "$DATABASE_URL" -f "$f"
done
```

## Seed Data

After running migrations, apply seeds:

```bash
# Via Supabase CLI
supabase db reset  # runs migrations + seeds

# Or manually
psql "$DATABASE_URL" -f supabase/seed.sql
```

## Required Extensions

These are enabled within the migrations themselves, but verify they're available on your Supabase plan:

| Extension | Migration | Purpose |
|-----------|-----------|---------|
| `pgcrypto` | `...0001...` | UUID generation helpers |
| `vector` | `...0004_ai_chatbot.sql` | pgvector for AI embeddings (requires Supabase Pro or enabling in dashboard) |
