
# Plan: Generate CLAUDE.md handover report

Produce a single comprehensive technical report covering the entire codebase + backend, written to `CLAUDE.md` at project root and copied to `/mnt/documents/CLAUDE.md` for download.

## Scope per section

1. **File inventory**
   - Exhaustive (one line per file) for: `src/pages/`, `src/hooks/`, `src/lib/`, `src/contexts/`, `src/integrations/`, `src/types/` (if present), `supabase/functions/`
   - Grouped for `src/components/` — directory-level summary + callouts for key/cross-cutting components (layout, dashboard, parent, instructor, sales, ops, ui)
   - For pages: include route (cross-ref `src/App.tsx`) and required role (from route guards / role checks)

2. **Database schema** — live introspection via `supabase--read_query` on `information_schema` + `pg_catalog`:
   - All `public` tables: columns, types, defaults, nullability, FKs, RLS on/off, indexes, attached triggers

3. **Edge functions** — read each `supabase/functions/*/index.ts`:
   - Purpose, auth method (cron secret / JWT / service-role), tables touched, cross-function calls, cron schedule (matched to pg_cron)

4. **DB functions / RPCs** — query `pg_proc` for `public` schema:
   - Signature, SECURITY DEFINER/INVOKER, GRANTs (from `information_schema.routine_privileges`), purpose, tables read/written (from source)

5. **Triggers** — query `pg_trigger`:
   - Name, table, timing, event, function, behaviour

6. **Realtime subscriptions** — `rg "supabase\.channel\(|postgres_changes" src/`:
   - File:line, table, filter, side-effect

7. **Cron jobs** — query `cron.job` + `cron.job_run_details` (recent):
   - Jobname, schedule, command/target

8. **Storage** — query `storage.buckets` + `storage.policies`:
   - Bucket, public/private, policy summary, expected contents (inferred from code)

9. **Patterns & conventions** — derive from code:
   - RLS auth pattern (has_role + SECURITY DEFINER), notifications (notifyRoleGroup), credits movement (credits + credit_transactions), timezone handling (`lib/timezone.ts`), PostgREST embed rules (auth.users FK blocks embed → use batched IN queries), edge function error handling (`_shared/errors.ts`), shared utilities

10. **Known issues** — `rg "TODO|FIXME|XXX|HACK|console\.log" src/ supabase/functions/`:
    - List with file:line + context; call out hardcoded values, partial features, dead code

## Execution order

1. Run all DB introspection queries in parallel (sections 2, 4, 5, 7, 8) + filesystem listings + ripgrep scans (sections 1, 6, 10).
2. Read every file in the exhaustive buckets (pages, hooks, lib, contexts, integrations, edge functions) in parallel batches.
3. Sample components by directory for grouped summaries.
4. Assemble single markdown report.
5. Write to `CLAUDE.md` (project root) and copy to `/mnt/documents/CLAUDE.md`.
6. Emit `<presentation-artifact>` so you can download.

## Caveats

- This is a large report — expect a long file (likely 50–150 KB markdown) and many tool calls during generation.
- Report reflects state at generation time; re-run if schema or routes change materially.
- Component coverage is grouped per your choice; if you later want one-liners for every component file, I can expand that section.

Approve to proceed.
