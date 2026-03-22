# Meta Integration

Phase 4 foundation adds organization-level Meta authorization and page discovery.

- Platform auth is handled by Supabase Auth.
- Meta OAuth authorizes external datasource access for the organization.
- **One Meta connection per organization in v1** (`meta_connections.organization_id` is unique). No multi-connection model.
- Accessible pages are discovered and persisted into `meta_pages`.
- **Plan page limits** use the count of selected, active rows in `meta_pages` only. Do **not** use `usage_counters` as the source of truth for how many pages are connected/selected.
- Tokens and encrypted blobs stay server-side; API routes and server components must not forward provider tokens to client components.

## Separated concerns (code layout)

| Concern | Location |
|--------|----------|
| OAuth URL + state cookie | `modules/meta/actions.ts` (`createMetaOAuthUrl`, `validateMetaOAuthState`) |
| Token exchange → connection row | `modules/meta/connection.ts`, orchestrated by `modules/meta/oauth-callback.ts` |
| Page discovery → `meta_pages` upsert | `modules/meta/discovery.ts` |
| Selection + RPC enforcement | `modules/meta/selection.ts` + `actions.ts` |
| Phase 5 initial sync hook (no-op) | `modules/jobs/meta-sync-placeholder.ts` (`onMetaPageSelectionChanged`) |

Sync job creation and execution are described in [sync-pipeline.md](./sync-pipeline.md) (Phase 5). AI summaries are still out of scope. Phase 5 should enqueue work from `onMetaPageSelectionChanged` (or equivalent) once `meta_sync_jobs` exists.
