# Event Digital Platform

Next.js + Supabase дээр суурилсан multi-tenant SaaS application-ийн суурь template.

## Багтсан зүйлс

- **Auth** — Supabase Auth (email OTP login)
- **Organizations** — Multi-tenant org bootstrap + owner membership
- **Subscriptions** — Plan/subscription foundation (`plans`, `subscriptions`, `usage_counters`)
- **Billing** — QPay checkout + webhook handler (see `docs/billing-qpay.md`)
- **Super Admin** — System admin control plane (`/admin`)
- **Audit log** — Operator audit events

## Хурдан эхлэх

1. Dependencies суулгах:
   ```bash
   npm install
   ```

2. Environment тохируулах:
   ```bash
   cp .env.example .env.local
   ```
   Дараах variables-г бөглөнө:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - QPay (billing): `QPAY_BASE_URL`, `QPAY_CLIENT_ID`, `QPAY_CLIENT_SECRET`, `QPAY_INVOICE_CODE`

3. Database migrations ажиллуулах:
   ```
   supabase/migrations/202603220001_phase2_auth_org.sql
   supabase/migrations/202603220002_phase3_subscriptions.sql
   supabase/migrations/202603220003_phase2_phase3_hardening.sql
   supabase/migrations/202603220008_phase7_billing_qpay.sql
   supabase/migrations/202603220009_phase7_billing_hardening.sql
   supabase/migrations/202603220010_operator_audit.sql
   supabase/migrations/202603220011_fix_rls_recursion.sql
   supabase/migrations/202603220012_system_admins.sql
   ```

4. Plans seed ажиллуулах:
   ```
   supabase/seeds/202603220001_plans.sql
   ```

5. Аппликейшн эхлүүлэх:
   ```bash
   npm run dev
   ```

6. Browser дээр нээх: `http://localhost:3000`

## Үндсэн урсгал

1. `/login` — email OTP login
2. `/auth/callback` — session exchange
3. `/setup-organization` — шинэ хэрэглэгчид org үүсгэх
4. `/dashboard` — protected main dashboard
5. `/billing` — QPay checkout + invoices
6. `/admin` — Super admin control plane (system admin role шаардана)

## Super Admin

`/admin` route-д system admin эрх шаардана. Bootstrap хийх заавар: `docs/admin-bootstrap.md`.

**Admin pages:**
- `/admin` — Overview (org count, active subs, recent failures)
- `/admin/organizations` — Organization directory + detail
- `/admin/billing` — Billing & reconciliation
- `/admin/jobs` — Background jobs monitor
- `/admin/plans` — Plan directory
- `/admin/audit` — Operator audit log
- `/admin/settings` — Settings

## Domain-specific integration нэмэх

`src/modules/integrations/README.md` -г уншина уу.

## Multi-agent development

Multi-agent operating docs: `docs/automation/`

## Архитектур

`docs/architecture.md` болон `docs/database-schema.md`-г үзнэ үү.
