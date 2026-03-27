# SaaS Base Template

Multi-tenant SaaS application-ийн production-ready суурь.  
Шинэ SaaS product-ийг энэ template-аас ганц командаар эхлүүл.

---

## Агуулж буй зүйлс

| Бүрэлдэхүүн | Дэлгэрэнгүй |
|---|---|
| ✅ Next.js 16+ | Web dashboard + Super Admin control plane |
| ✅ Flutter mobile | iOS/Android mobile app scaffold |
| ✅ Supabase Auth | Email OTP + session management |
| ✅ Organization + Members | Multi-tenant, role-based access |
| ✅ Plans + Subscriptions | Flexible plan system + usage counters |
| ✅ QPay billing + webhook | Монгол payment (qpay.mn) |
| ✅ Generic job queue | Background task processing |
| ✅ Super Admin dashboard | Operator control plane |
| ✅ Audit logs + Observability | Operator audit trail |
| ✅ Integration slot | `src/modules/integrations/` — plug-in pattern |

---

## Шинэ SaaS үүсгэх (хурдан)

```bash
./scripts/new-saas.sh my-new-saas
```

Script нь автоматаар:
- Бүх файлыг `~/Projects/my-new-saas/` руу хуулна
- Template-only файлуудыг устгана (энэ README, `.git`, `.vercel` г.м)
- `package.json` болон `pubspec.yaml` дахь нэрийг солино
- Шинэ git repo эхлүүлнэ

---

## Customize хийх

### 1. Нэр солих
```
web/package.json          → "name": "my-new-saas"
flutter/pubspec.yaml      → name: my_new_saas
src/app/layout.tsx        → title, metadata
src/app/icon.tsx          → favicon/icon
src/app/globals.css       → --color-*, --brand-* variables
```

### 2. Database (Supabase)
```
supabase/migrations/      → шинэ domain table нэм
supabase/seeds/           → plan pricing, seed data өөрчлөх
```

Migration нэмэх жишээ:
```sql
-- supabase/migrations/YYYYMMDDNNNN_my_domain_foundation.sql
CREATE TABLE my_domain_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  ...
);
```

### 3. Integration нэмэх
```
src/modules/integrations/<provider-name>/
  handler.ts      — OAuth callback / webhook handler
  actions.ts      — Server actions
  types.ts        — Type definitions
```

`src/modules/integrations/README.md`-г уншина уу.

### 4. Web Dashboard
```
src/app/(dashboard)/dashboard/page.tsx   → placeholder-г өөрийн component-оор солих
src/components/dashboard/               → шинэ dashboard component
src/app/(dashboard)/layout.tsx          → navigation items
```

### 5. Flutter
```
flutter/lib/features/<name>/            → шинэ feature screen
flutter/lib/core/api/                   → API client
```

### 6. Plans (үнэ, лимит)
```
supabase/seeds/202603220001_plans.sql   → plan pricing болон usage limits
```

---

## Файлын бүтэц

```
saas-base/
├── web/                        ← Next.js (restructure хийгдсэний дараа)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/   — Protected user pages
│   │   │   ├── (public)/      — Public pages (login, pricing)
│   │   │   ├── admin/         — Super admin control plane
│   │   │   └── api/           — API routes (webhooks, health)
│   │   ├── components/        — React components
│   │   ├── modules/           — Business logic
│   │   │   ├── auth/
│   │   │   ├── organizations/
│   │   │   ├── subscriptions/
│   │   │   ├── billing/
│   │   │   ├── admin/
│   │   │   └── integrations/  ← Шинэ integration энд нэм
│   │   ├── lib/               — Utilities (supabase, env, qpay, jobs)
│   │   └── types/
│   ├── package.json
│   ├── next.config.ts
│   └── .env.example
├── flutter/                    ← Flutter mobile app
│   ├── lib/
│   │   ├── core/
│   │   ├── features/
│   │   └── main.dart
│   └── pubspec.yaml
├── supabase/                   ← DB migrations + seeds
│   ├── migrations/
│   ├── seeds/
│   └── config.toml
├── scripts/
│   └── new-saas.sh             ← Шинэ SaaS үүсгэх script
├── docs/                       ← Architecture, billing, ops docs
├── tests/                      ← e2e, integration, unit
└── SAAS_BASE_README.md         ← Энэ файл
```

> 📋 Одоогийн бүтэц болон restructure алхмуудыг харахыг хүсвэл `REPO_STRUCTURE.md`-г уншина уу.

---

## Database Migrations (эрэмбэ)

```bash
# Supabase CLI-г ашиглах
supabase db push

# Эсвэл dashboard-аас дараах эрэмбэд ажиллуулах:
supabase/migrations/202603220001_phase2_auth_org.sql
supabase/migrations/202603220002_phase3_subscriptions.sql
supabase/migrations/202603220003_phase2_phase3_hardening.sql
supabase/migrations/202603220008_phase7_billing_qpay.sql
supabase/migrations/202603220009_phase7_billing_hardening.sql
supabase/migrations/202603220010_operator_audit.sql
supabase/migrations/202603220011_fix_rls_recursion.sql
supabase/migrations/202603220012_system_admins.sql

# Seed data
supabase/seeds/202603220001_plans.sql
```

---

## Super Admin тохируулах

1. `.env.local` дотор: `INTERNAL_OPS_EMAILS=you@example.com`
2. `/admin` хуудас руу нэвтрэх → auto-bootstrap

Дэлгэрэнгүй: `docs/admin-bootstrap.md`

---

## Deploy

| Platform | Тэмдэглэл |
|---|---|
| Vercel | `rootDirectory: web` тохируулах (restructure хийгдсэний дараа) |
| Supabase | migrations + seeds ажиллуул |
| QPay | webhook URL: `POST /api/webhooks/qpay?invoice_id=...&token=...` |

---

## Шинжилгээ + Тест

```bash
cd web
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm test            # Vitest
npm run validate    # Бүгдийг хамт ажиллуулах
```

---

## Баримт бичиг

| Файл | Агуулга |
|---|---|
| `docs/architecture.md` | System architecture |
| `docs/database-schema.md` | DB schema overview |
| `docs/billing-qpay.md` | QPay integration |
| `docs/admin-bootstrap.md` | Super admin setup |
| `docs/admin-auth-v1.md` | Admin auth details |
| `docs/automation/` | Multi-agent development guide |
| `REPO_STRUCTURE.md` | Restructure төлөвлөгөө |
