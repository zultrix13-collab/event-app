# Integrations

Шинэ SaaS-д domain-specific integration нэмэх газар.

## Нэмэх заавар

1. `src/modules/integrations/<name>/` folder үүсгэ
2. `connection.ts`, `sync.ts`, `types.ts` файлуудыг нэм
3. Job pattern-г `src/modules/jobs/` -аас хуулж ашиглана

## Файлын бүтэц

```
src/modules/integrations/
  <name>/
    connection.ts   — OAuth/API холболт, token хадгалах
    sync.ts         — Өгөгдөл татах, normalize хийх
    types.ts        — TypeScript type definitions
    actions.ts      — Server actions (connect, disconnect, manual sync)
    data.ts         — DB read functions
```

## Жишээ integration

```typescript
// connection.ts
export async function connectIntegration(orgId: string, credentials: MyCredentials) {
  // 1. Validate credentials
  // 2. Store encrypted tokens in DB
  // 3. Enqueue initial sync
}

// sync.ts
export async function executeSync(integrationId: string) {
  // 1. Load connection from DB
  // 2. Fetch data from external API
  // 3. Normalize + store in domain tables
}
```

## DB migration нэмэх

`supabase/migrations/` дотор шинэ migration file нэм:
```
YYYYMMDDNNNN_<integration_name>_foundation.sql
```

## Жишээ integrations

- `slack/` — Slack webhook notification
- `stripe/` — Stripe billing (QPay-г орлох)
- `hubspot/` — CRM sync
- `shopify/` — E-commerce data
