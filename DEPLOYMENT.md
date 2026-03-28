# Event App — Deployment Guide

Complete guide for deploying the Event Digital Platform to production.

---

## Prerequisites

Before starting, ensure you have:

- [ ] [Supabase](https://supabase.com) project (Free tier works; Pro required for pgvector)
- [ ] [Vercel](https://vercel.com) account
- [ ] [QPay](https://qpay.mn) merchant account with API credentials
- [ ] [SocialPay](https://socialpay.mn) merchant account *(optional)*
- [ ] [OpenAI](https://platform.openai.com) API key *(for AI chatbot)*
- [ ] GitHub repository with this codebase

---

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a region close to your users (e.g., `ap-southeast-1` for Mongolia)
3. Note your **Project URL** and **API keys** from **Settings → API**

### 1.2 Enable pgvector Extension

1. Go to **Database → Extensions**
2. Search for `vector` → Enable it
   > ⚠️ pgvector requires **Supabase Pro** plan or above.

### 1.3 Run Migrations

Run all migration files **in order** from `supabase/migrations/`. See [`supabase/MIGRATIONS.md`](supabase/MIGRATIONS.md) for the full list with descriptions.

**Quick method (Supabase CLI):**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Manual method (SQL Editor):**
Paste and run each `.sql` file in the Supabase dashboard SQL editor, in numeric order.

### 1.4 Run Seeds

```bash
supabase db reset   # runs migrations + seed.sql
# OR
psql "$DATABASE_URL" -f supabase/seed.sql
```

### 1.5 Set Up Storage Buckets

Go to **Storage → New bucket** and create:

| Bucket | Public? | Purpose |
|--------|---------|---------|
| `avatars` | ✅ Public | User profile photos |
| `floor-plans` | ✅ Public | Indoor venue SVG floor plans |
| `kb-documents` | ❌ Private | AI knowledge base source files |

For each bucket, set appropriate RLS policies:
- `avatars`: Users can upload their own; anyone can read
- `floor-plans`: Admins upload; anyone can read
- `kb-documents`: Service role only

### 1.6 Configure Auth

1. Go to **Authentication → Settings**
2. Set **Site URL** to your production URL (e.g., `https://yourevent.com`)
3. Add redirect URLs: `https://yourevent.com/**`
4. Enable **Email OTP** (passwordless):
   - Authentication → Providers → Email
   - Enable "Enable Email OTP"
5. Customize email templates if needed

---

## Step 2: Environment Variables

Create a `.env.local` file for local development (never commit this):

```env
# ──────────────────────────────────────────────
# Supabase
# ──────────────────────────────────────────────
# Found in: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ──────────────────────────────────────────────
# App
# ──────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://yourevent.com

# ──────────────────────────────────────────────
# QPay (https://qpay.mn → Merchant Portal)
# ──────────────────────────────────────────────
QPAY_BASE_URL=https://merchant.qpay.mn/v2
QPAY_CLIENT_ID=your_client_id
QPAY_CLIENT_SECRET=your_client_secret
QPAY_INVOICE_CODE=your_invoice_code

# ──────────────────────────────────────────────
# SocialPay (optional — https://socialpay.mn)
# ──────────────────────────────────────────────
SOCIALPAY_BASE_URL=https://socialpay.mn
SOCIALPAY_TOKEN=your_token
SOCIALPAY_MERCHANT_ID=your_merchant_id

# ──────────────────────────────────────────────
# AI Chatbot (https://platform.openai.com)
# ──────────────────────────────────────────────
OPENAI_API_KEY=sk-...

# ──────────────────────────────────────────────
# Admin Bootstrap
# Comma-separated list of emails that get super_admin on first login
# ──────────────────────────────────────────────
INTERNAL_OPS_EMAILS=admin@yourevent.com
```

> 🔒 **Security:** Never expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to the browser. Only variables prefixed with `NEXT_PUBLIC_` are client-safe.

---

## Step 3: Vercel Deployment

### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Vercel will auto-detect Next.js — settings are pre-configured in `vercel.json`

### 3.2 Set Environment Variables

In Vercel Dashboard → **Settings → Environment Variables**, add all variables from Step 2.

For Vercel secret references (used in `vercel.json`), create matching secrets:
```bash
vercel secrets add supabase_url "https://xxxx.supabase.co"
vercel secrets add supabase_anon_key "eyJ..."
vercel secrets add app_url "https://yourevent.com"
```

### 3.3 Deploy

```bash
# Via CLI
npx vercel --prod

# Or push to main branch — Vercel auto-deploys
git push origin main
```

### 3.4 Pre-deploy Validation

Run the deploy check script before pushing:

```bash
# Export your env vars first, then:
bash scripts/deploy-check.sh

# Or via npm:
npm run deploy:check
```

---

## Step 4: Flutter App Build

### 4.1 Android APK

```bash
cd flutter/

flutter build apk --release \
  --dart-define=SUPABASE_URL=https://xxxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=APP_URL=https://yourevent.com
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### 4.2 iOS IPA

```bash
cd flutter/

flutter build ipa --release \
  --dart-define=SUPABASE_URL=https://xxxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=APP_URL=https://yourevent.com
```

> ⚠️ Requires Apple Developer account and valid provisioning profiles.

### 4.3 Firebase Push Notifications

See [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md) for FCM setup instructions.

Quick steps:
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Android app (package name from `flutter/android/app/build.gradle`)
3. Add iOS app (bundle ID from Xcode)
4. Download `google-services.json` → `flutter/android/app/`
5. Download `GoogleService-Info.plist` → `flutter/ios/Runner/`

---

## Step 5: Post-Deploy Checklist

After your first successful deployment, complete these steps:

### Admin Setup
- [ ] **Bootstrap super admin:** Visit `https://yourevent.com/admin` and sign in with an email listed in `INTERNAL_OPS_EMAILS`
- [ ] Verify super admin role is assigned in Supabase → `system_admins` table

### Content Setup
- [ ] **Create subscription plans** — run seed SQL or insert via Supabase dashboard into `plans` table
- [ ] **Upload floor plans** — go to Storage → `floor-plans`, upload SVG files; then insert records into `floor_plans` table
- [ ] **Add AI knowledge base documents** — upload to `kb-documents` bucket; insert into `kb_documents` table and trigger embedding generation

### Payments
- [ ] **Configure QPay webhook** — set webhook URL in QPay Merchant Portal:
  `https://yourevent.com/api/webhooks/qpay`
- [ ] **Test QPay flow** — create a test order and verify payment callback
- [ ] **Configure SocialPay webhook** (if enabled):
  `https://yourevent.com/api/webhooks/socialpay`

### Verification
- [ ] Sign up as a test user via Email OTP
- [ ] Browse programme, book a session
- [ ] Submit a test complaint
- [ ] Test AI chatbot response
- [ ] Verify map loads with POIs

---

## Useful Commands

```bash
# Run type checks
npm run typecheck

# Run linter
npm run lint

# Run tests
npm run test

# Full validation (typecheck + lint + test + build)
npm run validate

# Pre-deploy env check
npm run deploy:check

# Local Supabase dev
supabase start
supabase status
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| pgvector not available | Upgrade to Supabase Pro or enable the extension manually |
| RLS infinite recursion | Make sure migration `...0011_fix_rls_recursion.sql` ran successfully |
| Auth redirect not working | Check Site URL and allowed redirect URLs in Supabase Auth settings |
| QPay webhook 401 | Verify `webhook_verify_token` matches between DB and QPay portal |
| Flutter build fails | Run `flutter doctor` and ensure all required tools are installed |
| Embeddings not generating | Verify `OPENAI_API_KEY` is set and the `vector` extension is enabled |
