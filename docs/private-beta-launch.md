# Private beta — launch & operations

Production-minded checklist for operating the MarTech MVP in a **private beta**. Pair with `docs/operations/idempotency-checklist.md` and `docs/billing-qpay.md`.

## Environment variables (production)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser-safe key; RLS applies |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Server only.** Never expose to client. Used for sync execution, AI persistence, billing writes, internal ops reads |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical public origin (webhooks, OAuth redirects, QPay callback URL) |
| `MARTECH_INTERNAL_OPS_EMAILS` | Beta ops | Comma-separated emails allowed to access `/internal/ops` |
| Meta: `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`, `META_TOKEN_ENCRYPTION_KEY` | Yes for Meta | Redirect URI must match Meta app settings |
| QPay: `QPAY_BASE_URL`, `QPAY_CLIENT_ID`, `QPAY_CLIENT_SECRET`, `QPAY_INVOICE_CODE` | Yes for billing | Sandbox vs production host |
| `OPENAI_API_KEY`, `AI_MODEL` | Optional | AI narrative refinement only |

Copy from `.env.example` and verify **no** service role or Meta secret in client bundles.

## Deployment notes

- Run **all** SQL migrations in `supabase/migrations/` in order (including `202603220010_operator_audit.sql` for operator audit).
- Seed plans via `supabase/seeds/` where applicable.
- Use a single stable `NEXT_PUBLIC_APP_URL` per environment so QPay callbacks and Meta redirect URIs stay valid.
- Prefer hosting that supports **long enough** HTTP timeouts for inline sync/analysis if jobs are still executed from server actions (or move execution to a worker with the same `executeMetaSyncJob` / `executeAnalysisJob` entrypoints).

## Webhook requirements (QPay)

- Register callback URL pattern: `POST {NEXT_PUBLIC_APP_URL}/api/webhooks/qpay?invoice_id=…&token=…` (see `docs/billing-qpay.md`).
- Ensure the app is reachable from QPay (no localhost in production).
- Duplicate deliveries are expected; dedupe uses `billing_events.provider_event_id` where set, and payment activation remains **idempotent** (see idempotency doc).

## Service role usage

The **service role** bypasses RLS. It is appropriate only on the **server** for:

- Executing Meta sync and AI analysis jobs
- Creating/updating billing rows and processing webhooks
- Internal ops queries (`/internal/ops`) after **email allowlist** check (`MARTECH_INTERNAL_OPS_EMAILS` + `requireInternalOpsActor`)

Never pass the service role key to the browser or edge functions that serve untrusted callers.

## Internal ops UI (`/internal/ops`)

- **Overview** — org count, pending invoice reconciliation signals, failed sync/analysis (24h), recent `operator_audit_events`
- **Organizations** — subscription + Meta connection snapshot
- **Sync & analysis** — recent jobs, operator retry (audited)
- **Billing** — pending invoices with stale markers, re-verify payment (same path as webhook verification), global invoice/txn/event lists

Operator actions write to `operator_audit_events` (migration `010`). Table has **no** RLS policies for authenticated users — intended for service-role inserts only.

## Private beta operational checklist

- [ ] Migrations applied; plans seeded
- [ ] Env vars set; service role only on server
- [ ] `MARTECH_INTERNAL_OPS_EMAILS` set to real operators
- [ ] QPay sandbox/prod credentials match `QPAY_BASE_URL`
- [ ] Webhook URL tested end-to-end (invoice → pay → verify → subscription active)
- [ ] Meta OAuth redirect URI matches environment
- [ ] Spot-check `/internal/ops` overview after first real customers
- [ ] Process for **stale pending invoices**: use Billing page markers + “Re-verify QPay” before manual refunds/chargebacks
- [ ] Process for **failed sync/analysis**: dashboard banner + customer retry; operator retry from Jobs page if needed

## Launch-readiness notes

- **No heavy cron** in this slice: reconciliation is **operator-driven** via internal UI + hooks (`runInvoicePaymentReverification`, job execute entrypoints).
- **Customer-facing** failures surface on the dashboard (`OperationalHealthBanner`) and per-job error text in lists.
- **Support** should prefer auditable operator actions over ad-hoc SQL for retries.
