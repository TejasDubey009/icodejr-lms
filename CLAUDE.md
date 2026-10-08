# CLAUDE.md — iCodeJr Academy LMS

> Definitive technical reference for the iCodeJr Academy LMS codebase.
> Merged from: (1) live DB introspection + codebase scan by Lovable, 2026-05-22,
> and (2) architectural context from the full build session.
> Regenerate Section 2 (schema) when tables change materially.

---

## 0. Project Snapshot

- **Product**: iCodeJr Academy LMS — K-12 coding education platform for iCodeJr (brand of Cognify Labs). Programs delivered in English and Arabic.
- **Stack**: React 18 + Vite 5 + TypeScript 5 + Tailwind v3 + shadcn/ui + react-router-dom v6
- **Backend**: Supabase project ref `uvgiqbierroqjrtpnkjz` (self-managed, NOT Lovable Cloud)
- **Client import**: `import { supabase } from "@/integrations/supabase/client"` — single instance, never re-create
- **URLs**: live `new.icodejr.com` / Lovable `icodejrlms.lovable.app`
- **Roles** (`app_role` enum): `admin`, `instructor`, `parent`, `student`, `ops`, `curriculum_head`, `curriculum_contributor`, `sales_exec`, `sales_manager`, `counsellor`, `finance`
- **Scale**: 105+ tables, 110 DB functions, 11 cron jobs, 26 edge functions, 7 storage buckets
- **Feature work**: done via Lovable prompts
- **Performance / refactoring / complex logic**: done via Claude Code (this tool)

---

## 1. CRITICAL DB CONVENTIONS

Read these before touching any query or migration. These are the most common sources of bugs.

### 1.1 users.id vs users.user_id

Two different UUID columns on the `users` table:

| Column | Meaning | Used by |
|---|---|---|
| `users.id` | Surrogate PK (internal) | emergency_credits.added_by, complimentary_credit_requests.requested_by, credit_reversal_requests.requested_by, credit_reversal_requests.reviewed_by, pending_report_alerts.instructor_id, student_lifecycle_events.changed_by, kb_document_versions.uploaded_by, kb_documents.uploaded_by/approved_by, kb_folders.created_by |
| `users.user_id` | Auth UID (= auth.users.id) | credits.student_id, classes.student_id/instructor_id, attendance, credit_reversal_requests.student_id, student_lifecycle_events.student_id, interaction_logs.student_id/counsellor_id, enrolments (student_id → auth.users) |

**Always verify which FK a table uses before inserting. Check the schema section below.**

### 1.2 auth.users FK limitation — CRITICAL for PostgREST embeds

`classes.student_id`, `classes.instructor_id`, `enrolments.student_id`, `credits.student_id`, `parent_student_links.student_id/parent_id` all FK to `auth.users(id)`, NOT `public.users`. PostgREST cannot embed across the `auth` schema boundary.

**You CANNOT do:**
```ts
supabase.from("classes").select("*, student:users(*)")  // BROKEN
supabase.from("enrolments").select("*, student:users(*)")  // BROKEN
```

**Correct pattern — batched IN query:**
```ts
const { data: classes } = await supabase.from("classes").select("id, student_id, ...")
const studentIds = [...new Set(classes.map(c => c.student_id).filter(Boolean))]
const { data: users } = await supabase
  .from("users").select("user_id, full_name").in("user_id", studentIds)
const userMap = new Map(users.map(u => [u.user_id, u.full_name]))
```

**Confirmed working PostgREST embeds (FK to public schema):**
```
course:course_templates!program_id ( title )    ✅ confirmed working
```

Several RPCs exist as embed workarounds: `get_activity_user_names`, `get_curriculum_user_names`, `get_kb_uploader_names`, `get_lead_user_names`.

### 1.3 parent_student_links — no users.parent_id column

Parent-student relationship lives in `parent_student_links` table. The column `users.parent_id` does NOT exist.

Primary parent query:
```sql
SELECT DISTINCT ON (student_id) * FROM parent_student_links
ORDER BY student_id, is_primary DESC, created_at
```

### 1.4 Timezone — CRITICAL

All session scheduling save paths MUST use `localToUtcIso(str, academyTz)` from `@/lib/timezone.ts`.

**NEVER use:**
- `new Date().toISOString()`
- Raw string date values in scheduled_at saves

Academy timezone: `system_settings.academy_timezone` (default `Asia/Dubai`). Per-user override: `users.timezone`. Both read via `useSiteSettings()`.

Files already fixed: `ScheduleSessionPage.tsx`, `ScheduleSessionDialog.tsx`, `CreateSessionPage.tsx`, `EditSessionDialog.tsx`.

### 1.5 Credits formula

```
available = total_credits - used_credits - blocked_credits
```

`enrolled_credits` also exists on the credits table — used for enrolled-but-not-yet-started credit accounting. Do not confuse with available.

### 1.6 Notification duplicates

Always invoke `send-notification` edge function. **Never** do direct `notifications.insert()` alongside invoking `send-notification` — this causes duplicates. The edge function handles deduplication via `notification_log` (default 60s window).

```ts
await supabase.functions.invoke('send-notification', { body: { user_id, type, payload } })
// OR for role-wide fanout:
await notifyRoleGroup(['admin', 'ops'], { type, payload })  // from @/lib/notifyRoleGroup
```

### 1.7 GUC flag for protected lifecycle writes

Direct writes to `lifecycle_stage IN ('credits_exhausted', 'not_renewed')` are blocked by `enforce_users_privileged_field_updates` trigger. These stages must go through dedicated RPCs which set a transaction-scoped GUC:

```sql
PERFORM set_config('app.lifecycle_rpc', 'on', true);  -- SET LOCAL, auto-cleared at txn end
```

RPCs that set this flag: `mark_student_not_renewed`, `unmark_student_not_renewed`, `system_set_lifecycle_stage` (sweeper only).

---

## 2. ROUTING

Single `<AppRoutes>` inside `<AuthProvider>`. `<ProtectedRoute allowedRoles={[...]}>` gates all authenticated routes. `<RoleBasedRedirect>` sends authenticated users to their role landing page. Special flags: `mustChangePassword` forces `/change-password`; instructors with `needsOnboarding` forced to `/instructor/onboarding`.

Key routes by role:

| Role | Landing | Notable routes |
|---|---|---|
| student | `/dashboard` | `/courses`, `/courses/:courseId`, `/quizzes`, `/certificates` |
| parent | `/parent` | `/parent/student-journey`, `/parent/payments`, `/parent/recordings`, `/parent/schedule` |
| instructor | `/instructor` | `/instructor/schedule`, `/instructor/homework`, `/instructor/penalties`, `/instructor/availability` |
| ops | `/ops/dashboard` | `/ops/students/:id`, `/ops/renewals`, `/ops/credit-exceptions`, `/ops/schedule` |
| admin | `/admin` | `/admin/retention`, `/admin/approvals/*`, `/admin/sessions`, `/admin/students/:id` |
| counsellor | `/counsellor` | `/counsellor/students`, `/counsellor/student/:id`, `/counsellor/checkins/*` |
| sales_exec / sales_manager | `/sales` | `/sales/leads`, `/sales/pipeline`, `/sales/team` |
| finance | `/finance` | `/finance/gateway`, `/finance/bank-recon`, `/finance/installments` |
| curriculum_head / _contributor | `/curriculum/dashboard` | `/curriculum/templates`, `/curriculum/courses/:id/build` |

Public routes: `/login`, `/join/:token` (trial join), `/verify/:certId` (certificate verify), `/forgot-password`, `/reset-password`.

---

## 3. ROLES AND AUTH

- Roles live in `user_roles(user_id, role app_role)` — separate from `users`. Never check role from `users` table or localStorage.
- `has_role(_user_id uuid, _role app_role)` is `SECURITY DEFINER STABLE` — used in every RLS policy to prevent recursive RLS on `user_roles`.
- In React: `useAuth()` from `@/contexts/AuthContext` exposes `isAdmin`, `isInstructor`, `isOps`, etc. — derived from a single `user_roles` row fetched on auth state change.
- `is_active` on `users` is a cross-role account suspension flag (login gate in `AuthContext`). NOT a lifecycle signal. Do not use for student activity filtering.

---

## 4. APP ROLES — STATUS

| Role | Portal | Status |
|---|---|---|
| admin | /admin | Complete |
| ops | /ops | Complete |
| instructor | /instructor | Complete |
| parent | /parent | Complete |
| student | /dashboard | Complete |
| counsellor | /counsellor | Complete |
| sales_exec | /sales | Complete |
| sales_manager | /sales | Complete |
| curriculum | /curriculum | Complete |
| curriculum_head | /curriculum | Complete |
| curriculum_contributor | /curriculum | Complete |
| finance | /finance | Complete |
| hr | — | NOT STARTED |

---

## 5. EDGE FUNCTIONS

All in `supabase/functions/`. All deploy automatically on commit. Auth: most use service-role key internally; cron-invoked functions validate `x-cron-secret` header OR `Authorization: Bearer <CRON_SECRET>`. Only `sweep-lifecycle-stage` has `verify_jwt = false` in config.toml.

| Function | Purpose | Cron schedule |
|---|---|---|
| `add-student` | Creates parent (auth+users) + student (auth+users+user_roles+credits+student_settings) + parent_student_links. Sends Brevo welcome email. | — |
| `approve-won-lead` | Sales Manager/Admin approves Won lead: creates student auth user, seeds credits from credit_packages, posts finance_receipts/lead_installments, fires webhook_log to n8n. Inserts finance_receipts {status:'pending'} synchronously. | — |
| `class-reminders` | Upcoming class notifications to student+parents. Respects notification_settings. | `*/15 * * * *`, `0 * * * *`, `0 4 * * *` |
| `cleanup-test-data` | Admin utility: wipes test data by email prefix. **Should be restricted in production.** | — |
| `complete-class-report` | Instructor submits post-class report. Inserts post_class_reports, marks classes.post_report_submitted=true, inserts attendance, calls decrement_blocked_increment_used RPC. | — |
| `confirm-installment` | Finance confirms installment: marks finance_receipts.status=received, updates lead_installments. Triggers auto_offset_emergency_credits. | — |
| `create-admin` | Creates admin auth user. In-memory rate limit 5/min (resets on cold start). | — |
| `delete-user` | Hard-delete user. Pre-flight via check_user_dependencies RPC. Deletes auth.users last. | — |
| `detect-noshow` | For scheduled classes past start+threshold: status=no_show, edit_locked=true, blocked_credits--, credit_transactions insert (instructor_noshow_release), penalties insert. Notifies instructor+ops+admin only. | `*/5 * * * *` |
| `detect-overdue-installments` | Scans lead_installments past due_date → mark overdue, notify Finance. | `0 21 * * *` |
| `detect-penalties` | Late start / short session / same-day cancellation penalties. Skips classes with status=no_show. Notifies instructor+ops+admin. | `*/10 * * * *` |
| `expire-recordings` | Clears GCS path/url/status on expired recordings, notifies parents. | `0 21 * * *` |
| `fetch-zoom-attendance` | For classes with attendance_fetch_pending=true: calls Zoom API, inserts zoom_participants, derives attendance rows. Accepts cron secret OR JWT. | `*/5 * * * *` |
| `flag-pending-reports` | Completed classes >24h with post_report_submitted=false → refresh pending_report_alerts, email instructor. | `0 5 * * *` |
| `generate-recording-url` | Signs 2-hour GCS URL. Validates viewer via has_role + parent_student_links + class ownership. | — |
| `invite-user` | Admin invites Ops/Finance/Counsellor/Curriculum/Sales: creates auth user + users + user_roles + role-specific row. Sends Brevo email. | — |
| `n8n-webhook-dispatcher` | Polls webhook_events status=pending, retry_count<3, POSTs to n8n_webhook_url. | `*/2 * * * *` |
| `release-full-payment-credits` | Credits student total_credits from credit_packages on full-payment confirmation. | — |
| `release-installment-credits` | Per-installment credit release on payment confirmation. | — |
| `release-renewal-credits` | Credits student from credit_packages on renewal payment. | — |
| `reset-user-password` | Admin resets password. Sets users.must_change_password=true. | — |
| `send-notification` | **Central fanout.** Bell + Brevo email + WhatsApp. Deduplicates via notification_log (60s window). Enqueues webhook_events for n8n downstream. | — |
| `sweep-lifecycle-stage` | Flips users.lifecycle_stage between active/credits_exhausted/not_renewed based on available credits. Uses system_set_lifecycle_stage RPC. verify_jwt=false. | `0 22 * * *` |
| `zoom-meeting-manager` | Create/update/delete Zoom meetings. Reads credentials from system_settings. | — |
| `zoom-recording-to-gcs` | Downloads Zoom recording → uploads to GCS → writes classes.gcs_path/recording_status/recording_expires_at → notifies parents. | — |
| `zoom-webhook-receiver` | Public Zoom webhook endpoint. Validates HMAC signature. Dispatches to fetch-zoom-attendance or zoom-recording-to-gcs. | — |

**Shared utilities in `supabase/functions/_shared/`:**
- `errors.ts` — `sanitizeError(err, context)` maps Postgres error codes to safe messages with correlation logId. `getCorsHeaders(origin)` allow-lists icodejr.com, lovable.app, localhost.
- `emailTemplates.ts` — Brevo HTML template builders
- `siteUrl.ts` — resolves canonical app URL from site_settings

---

## 6. KEY RPCS (SECURITY DEFINER)

All 110 DB functions are SECURITY DEFINER unless noted. GRANTs managed explicitly — see security section. Trigger functions (return type `trigger`) are not directly callable via RPC.

| RPC | Args | Purpose | Caller |
|---|---|---|---|
| `decrement_blocked_increment_used` | p_student_id uuid | Atomic: blocked--, used++ | service_role |
| `reverse_credit_utilisation` | p_class_id, p_admin_surrogate_id, p_student_surrogate_id | Reverse credit deduction | authenticated (admin) |
| `mark_student_not_renewed` | p_student_id, p_reason_code, p_notes | Lifecycle: credits_exhausted → not_renewed. Sets app.lifecycle_rpc GUC. | authenticated (ops/counsellor/admin) |
| `unmark_student_not_renewed` | p_student_id, p_reason | Reverse not_renewed → credits_exhausted within 24h | authenticated (ops/admin) |
| `system_set_lifecycle_stage` | p_student_id, p_from_stage, p_to_stage, p_reason_code, p_notes | Sweeper lifecycle transitions. Sets GUC flag. | service_role only |
| `log_lifecycle_event` | p_student_id, p_from_stage, p_to_stage, p_source, p_reason_code, p_notes, p_changed_by | Append lifecycle event. SECURITY DEFINER, called by other RPCs via owner privileges. | service_role only |
| `admin_override_noshow` | p_class_id, p_revert_status, p_credit_action, p_reason | Override no-show: revert status, handle credit (utilize/release), void penalties, unlock session | authenticated (admin) |
| `get_parent_deal_summary` | p_student_id | Returns {entries: plan rows, transactions: payment rows} for parent payments page | authenticated (parent) |
| `get_retention_dashboard_summary` | — | Admin retention widget data | authenticated (admin) |
| `get_credits_exhausted_list` | — | Full credits_exhausted student list | authenticated (admin) |
| `get_not_renewed_events` | p_scope text | Not-renewed events by time scope | authenticated (admin) |
| `get_retention_trend_sparkline` | p_metric text | 6-month sparkline data | authenticated (admin) |
| `get_pending_report_exceptions` | — | Overdue unsubmitted reports | authenticated (ops/admin) |
| `get_pending_report_exceptions_count` | — | Lightweight count for sidebar badge | authenticated |
| `get_finance_deals` | — | Full joined finance dataset for finance portal | authenticated (finance) |
| `counsellor_create_course_instance` | p_template_id, p_instance_name, p_student_id | Deep-copies template to course instance | authenticated (counsellor) |
| `count_concurrent_zoom_hosts` | p_start, p_end | Zoom license concurrency check | authenticated |
| `get_class_host_credentials` | p_class_id | Returns zoom_start_url etc. | authenticated |
| `has_role` | _user_id uuid, _role app_role | Role check used in all RLS policies. STABLE. | all |
| `check_user_dependencies` | p_user_id | Pre-flight before delete-user | authenticated (admin) |
| `can_update_own_profile_safe` | see signature | Used in RLS policy for self-profile edits | authenticated |

---

## 7. CREDIT UTILISATION FLOW

1. Session scheduled → `credits.blocked_credits + 1`
2. Instructor submits post-class report → `complete-class-report` edge function → `decrement_blocked_increment_used` RPC → `blocked - 1`, `used + 1`, `classes.credit_utilised = true`
3. Ops raises reversal request → pending admin approval
4. Admin approves → `reverse_credit_utilisation` RPC → `used - 1` (or `blocked - 1` if used=0), `credit_utilised = false`, credit_transactions reversal row
5. Session cancelled → `blocked - 1`
6. Instructor no-show (auto, detect-noshow cron) → `blocked - 1`, `credit_transactions` insert (type=`instructor_noshow_release`, amount=1), `classes.status=no_show`, `edit_locked=true`
7. Admin override no-show → `admin_override_noshow` RPC → revert status, utilize or release credit, void penalty, unlock

**Credits NOT released on manager approval — only after finance gateway confirmation.**

Every credit movement logs a `credit_transactions` row with `transaction_type` (enum), `reference_id` (class/renewal/package), `notes`, `created_by`.

`transaction_type` enum values: `purchase`, `used`, `refund`, `adjustment`, `emergency`, `complimentary`, `renewal`, `reversal`, `instructor_noshow_release`, `admin_override_utilize`, `admin_override_release`.

---

## 8. STUDENT LIFECYCLE SYSTEM

**Canonical column:** `users.lifecycle_stage` (text, CHECK constraint)

**Valid values ONLY:** `trial`, `active`, `credits_exhausted`, `not_renewed`

Any other value will be rejected by both the `validate_rag_status` trigger and the CHECK constraint `users_lifecycle_stage_check`. **Adding a new lifecycle_stage value requires updating the validate_rag_status trigger whitelist AND the CHECK constraint.**

**Transitions:**
- `active` → `credits_exhausted`: system (nightly sweeper, available credits = 0)
- `credits_exhausted` → `active`: system (sweeper, when credits added)
- `not_renewed` → `active`: system (sweeper, when credits added — covers comped/emergency/renewal)
- `credits_exhausted` → `not_renewed`: manual via `mark_student_not_renewed` RPC (ops/counsellor/admin)
- `not_renewed` → `credits_exhausted`: manual via `unmark_student_not_renewed` RPC (ops/admin, 24h window)

**Direct writes to credits_exhausted or not_renewed are BLOCKED** by `enforce_users_privileged_field_updates` trigger. Must go through the designated RPCs which set `app.lifecycle_rpc` GUC.

**Lifecycle event log:** `student_lifecycle_events` table.
- `student_id` → `users.user_id` (auth UID)
- `changed_by` → `users.id` (surrogate PK) — NULL for system/backfill
- `source`: `system` | `manual` | `backfill`

**Retired/dropped columns:** `credits.status`, `credits.zero_credits_since`, `users.is_at_risk`. Do not reference them. `users.is_active` is retained as account suspension flag only (not lifecycle).

**Retention reason codes:** stored in `retention_reason_codes` table (not hardcoded). Codes: `price`, `schedule_conflict`, `child_lost_interest`, `switched_competitor`, `moved`, `family_circumstance`, `dissatisfied`, `no_response`, `other` (requires notes).

---

## 9. NO-SHOW SYSTEM

**Thresholds:** `system_settings.noshow_threshold_minutes_regular` and `noshow_threshold_minutes_trial` (both = 20 min). Admin-editable via PenaltyManagement UI.

**Auto no-show flow (detect-noshow, every 5 min):**
1. `classes.status = 'no_show'`, `no_show_flagged = true`, `no_show_at = now()`, `edit_locked = true`
2. `credits.blocked_credits - 1` (credit returned to student)
3. `credit_transactions` insert: `transaction_type='instructor_noshow_release'`, `amount=1`
4. `penalties` insert: `type='instructor_noshow'`, `status='draft'`
5. Notifications via `send-notification` with `type='instructor_noshow_auto'` → instructor + all ops + all admin. **NO student. NO parent.**

**Edit lock on sessions:**
- `classes.edit_locked = true` blocks all non-admin edits except `notes` field
- Enforced by `enforce_session_edit_lock` (BEFORE UPDATE) and `enforce_session_delete_lock` (BEFORE DELETE) triggers
- Admin bypasses entirely. Service role bypasses entirely (auth.uid() IS NULL).

**Admin override:** `admin_override_noshow(p_class_id, p_revert_status, p_credit_action, p_reason)` RPC.
- `p_revert_status`: `'completed'` | `'scheduled'` | `'cancelled'`
- `p_credit_action`: `'utilize'` (used+1) | `'release'` (no change, already released)
- Voids all `instructor_noshow` penalties for the class
- Unlocks session (`edit_locked = false`, `no_show_at = NULL`, `no_show_flagged = false`)
- Appends reason to `classes.notes`

**Penalty logic (mutually exclusive):**
- Instructor joins late but completes: `late_start` penalty
- Instructor never joins: `no_show` penalty only — `detect-penalties` skips with `.neq("status","no_show")`
- Never both on the same session

**Notification types:**
- `instructor_noshow_auto` → instructor + ops + admin (bell + email)
- `late_start_penalty` → instructor + ops + admin (bell + email)
- `penalty_voided` → instructor + ops + admin (bell + email) when admin overrides

---

## 10. FINANCE CONVENTIONS

- **Source of truth for payments:** `finance_receipts` table (not installment statuses)
- **Canonical labels:** "Full Payment", "Installment", "Pending Gateway", "Pending Bank Recon", "Confirmed", "Upcoming", "Overdue"
- **Shared component:** `FinanceStatusBadge` — use for all finance status displays
- `finance_receipts.status` values: `pending`, `pending_gateway`, `gateway_confirmed`, `confirmed`, `received`, `flagged`
- `finance_receipts` transaction date: `COALESCE(confirmed_at, gateway_confirmed_at, created_at)`
- Finance sidebar: uses 6 lightweight count queries (not `get_finance_deals` RPC — that is page-level only)

---

## 11. ZOOM INTEGRATION

- Credentials in `system_settings` table: `zoom_account_id`, `zoom_client_id`, `zoom_client_secret`, `zoom_webhook_secret_token`
- NOT in env vars — edge functions read credentials from DB via service role query
- GCS bucket: `lms-recordings-videos` (private, us-east1)
- GCS path format: `Regular/YYYY/MM/DD/{class_id}_{meeting_id}_partN.mp4` (or `Trial/`)
- Date uses `academy_timezone` from system_settings
- Recording display: filter on `recording_status='available'` (NOT `recording_url IS NOT NULL`)
- `download_token` forwarded from Zoom webhook payload for authenticated download

---

## 12. SESSION SCHEDULING RULES

- All time pickers use `QuarterTimePicker` or `QuarterDateTimePicker` components (15-min intervals: 00/15/30/45)
- Bulk scheduling uses `src/lib/timeSlots.ts` (96 entries, 00:00–23:45, single source of truth)
- All `scheduled_at` saves MUST use `localToUtcIso(str, academyTz)` from `src/lib/timezone.ts`
- Session edit lock: `classes.edit_locked=true` prevents non-admin edits on no-show sessions (notes-only allowed)

---

## 13. NOTIFICATION SYSTEM

Two complementary tables: `notifications` (in-app bell items) and `notification_log` (dedupe ledger).

`notification_settings` schema: **one row per event_type** (no `recipient_role` column). Recipient control is in the caller, not the settings table. This is a known limitation — per-role notification preferences would require a schema extension.

**Notification event types:**

| Event | Recipients | Channel |
|---|---|---|
| `instructor_noshow_auto` | instructor, ops, admin | bell + email |
| `late_start_penalty` | instructor, ops, admin | bell + email |
| `penalty_voided` | instructor, ops, admin | bell + email |
| `instructor_noshow_detected` | LEGACY — no longer emitted, kept for historical display only | — |
| `course_approved` | instructor/curriculum | bell + email |
| `course_rejected` | instructor/curriculum | bell + email |

`webhook_events` table is the outbound queue; `n8n-webhook-dispatcher` cron drains it every 2 min.

---

## 14. STORAGE BUCKETS

| Bucket | Public | Purpose | Path |
|---|---|---|---|
| `logos` | yes | Academy/site logos | `logos/{filename}` |
| `course-resources` | no | Lesson materials | `course-resources/{course_id}/{filename}` |
| `submissions` | no | Student homework/assignment submissions | `submissions/{user_id}/{assignment_id}/...` |
| `project-files` | no | Student project uploads | `project-files/{course_id}/{filename}` |
| `kb-documents` | no | Sales knowledge-base documents | `kb-documents/{folder_id}/{filename}` |
| `renewal-screenshots` | no | Renewal proof images | `renewal-screenshots/{renewal_id}/...` |
| `complimentary-approvals` | no | Complimentary credit attachments | `complimentary-approvals/{request_id}/...` |

Storage policies scope access by role and/or `(storage.foldername(name))[1] = auth.uid()::text`.

---

## 15. KEY SOURCE FILES

### Utility files (always import from these, never duplicate)

| File | Exports |
|---|---|
| `src/integrations/supabase/client.ts` | `supabase` — single Supabase client |
| `src/contexts/AuthContext.tsx` | `useAuth()` — auth state, role flags |
| `src/hooks/useSiteSettings.ts` | `useSiteSettings()` — module-level cached site config |
| `src/lib/timezone.ts` | `localToUtcIso`, `utcToLocal` — timezone conversions |
| `src/lib/notifyRoleGroup.ts` | `notifyRoleGroup`, `notifyUser` — role-based notification fanout |
| `src/lib/students.ts` | `LIFECYCLE_LABELS`, `isActiveStudent`, `countActiveStudents` |
| `src/lib/interactions.ts` | `CHANNEL_LABELS` — interaction log channel display names |
| `src/lib/retentionErrors.ts` | `mapRetentionError` — maps RPC exceptions to friendly toast messages |
| `src/lib/timeSlots.ts` | `TIME_SLOTS` — 96-entry 15-min interval array for bulk scheduling |
| `src/lib/utils.ts` | `cn` — Tailwind class merge |

Toasts via `sonner`: `import { toast } from 'sonner'`

### Files with known complexity

| File | Notes |
|---|---|
| `src/components/layout/AppSidebar.tsx` | 16 useEffect blocks (14 role-gated, 2 ancillary), 11 channel() calls with 36 .on() subscription bindings. Top performance priority for Claude Code. |
| `src/components/admin/LiveSessionsManagement.tsx` | ~36 queries on Sessions tab mount. Suspected N+1 per row. |
| `src/components/admin/ApprovalsManagement.tsx` | L830: in-loop N+1 in leave-conflict enrichment |
| `src/pages/ops/OpsStudentDetailPage.tsx` | ~25 queries on mount |
| `src/pages/admin/AdminStudentDetailPage.tsx` | ~22 queries on mount |
| `src/components/instructor/InstructorStatCards.tsx` | Partially optimized — still has sequential dependency chains |
| `supabase/functions/detect-noshow/index.ts` | Full rewrite in May 2026 — handles credit release, lock, notifications |
| `supabase/functions/detect-penalties/index.ts` | No-show guard added — skips sessions with status=no_show |

### Recently optimized — do NOT regress

| File | Optimization |
|---|---|
| `src/hooks/useSiteSettings.ts` | Module-level cache + inflight dedup. 26 mounts → 1 fetch per TTL |
| `src/components/parent/ChildAvatarSelector.tsx` | Nested N+1 fixed. Was 4×N queries, now constant 4 |
| `src/components/instructor/TodaysClasses.tsx` | N+1 fixed. Was 4×N queries, now constant 4 |
| `src/components/instructor/InstructorScheduleColumn.tsx` | N+1 fixed. Was 2×N queries, now constant 2 |
| `src/components/instructor/WeeklySchedule.tsx` | N+1 fixed. Was 2×N queries, now constant 2 |
| `src/pages/sales/SalesDashboardPage.tsx` | sales_pipeline_stages lifted to page, 8 fetches → 1 |
| `src/components/sales/NewLeadsWidget.tsx` | Fallback fetch removed — uses prop |
| `src/components/sales/OpenLeadsWidget.tsx` | Fallback fetch removed — uses prop |
| `src/components/sales/RejectedDealsWidget.tsx` | Fallback fetch removed — uses prop |
| `src/components/admin/AdminTeamDeliverablesWidget.tsx` | 4 pipeline stage fetches → 1 |
| `src/components/layout/AppSidebar.tsx` | Finance: get_finance_deals RPC replaced with 6 count queries; trial_feedback scoped via .in() |
| `src/components/admin/KpiCards.tsx` | class_ratings capped at 500 rows |
| `src/pages/CreateSessionPage.tsx` | enrolments select * narrowed to 7 columns |

---

## 16. PERFORMANCE — REMAINING WORK FOR CLAUDE CODE

The following architectural items could not be safely done in Lovable and are the first priority for Claude Code.

### HIGH — Do first

**1. React Query caching layer**

`@tanstack/react-query` is installed (`package.json`) but completely unused. No `QueryClientProvider` exists. Every navigation refetches all data from scratch.

Setup:
```ts
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    }
  }
})
```

Per-domain stale times:
- Site settings: `staleTime: Infinity` (manual invalidate only after admin save)
- Lists and dashboards: 60s
- Credit balances, lifecycle state, real-time class state: 0 or 5s

In `src/main.tsx`:
```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
// Wrap app in <QueryClientProvider client={queryClient}>
```

**2. Sidebar RPC consolidation**

`AppSidebar.tsx` fires 20 queries for admin, 14 for ops on every mount AND on every navigation (realtime channels trigger refetches). Replace per-role count bundles with one SECURITY DEFINER RPC per role returning all badge counts as JSON.

Current state per mount:
- Admin: ~20 queries + 5 realtime channels
- Ops: ~14 queries + 9 realtime channels
- Finance: ~12 queries + 5 realtime channels

Target: one `get_sidebar_counts()` RPC per role returning JSON, refreshed by React Query with 30s staleTime + 60s background refetch. Replace broad realtime channels with targeted ones or polling.

Realtime channels to narrow (all currently `event:'*'` with no filter):
- `reschedule_requests`, `class_cancellation_requests`, `instructor_change_requests` in ops sidebar — filter by status='pending'
- `users` subscription in counsellor sidebar — filter by `assigned_counsellor_id=eq.{auth.uid}`
- `trial_requests`, `trial_feedback` in admin sidebar — filter by relevant status

**3. Shared instructor teaching context**

`enrolments → lessons → assignments/homework → submissions` chain is fetched independently by 6 widgets: `InstructorStatCards`, `PendingGrades`, `PendingLessonConfirmations`, `HomeworkPage`, `PendingActionsCard`, `PendingWorkWidget`. Causes ~30 redundant queries per instructor dashboard mount.

Create `useInstructorTeachingContext()` hook using React Query, shared across all six widgets.

### HIGH — Added by audit pass P2-D

**1a. Notification subscription multiplication** — `notifications` is subscribed to by `AppSidebar` (per role), `NotificationBell`, `MessagesCard`, and `NotificationsPage` independently. Per arrival, 3-4 channels deliver the same event and each component re-runs its own fetch. `helpdesk_tickets` has the same shape across 8+ components. Replace with one `useNotifications(role)` React Query hook + one shared subscription that invalidates the cache key.

**1b. Unfiltered realtime watchers cause cross-tenant refetch storms** — `AppSidebar.tsx:481` (`users` no filter), `AppSidebar.tsx:586` (`helpdesk_tickets` no filter), `AppSidebar.tsx:630-633` (parent watches 4 tables with no filter), `WeeklySchedule.tsx:107` (`classes` no filter), `OpsDashboardPage.tsx:82-86` (3 request tables no filter). Every academy-wide write fires every subscribed browser. Add `filter:` clauses scoped to the owning column.

**1c. Shared fetch hooks** — Same `supabase.from("users").select("user_id, full_name").in("user_id", ids)` pattern appears in 114 files. Same `user_roles WHERE role` pattern in 73 files (the `get_users_by_role` RPC already exists). Extract `useUsersByIds(ids)` and `useUsersByRole(role)` hooks with React Query cache dedup. Mechanical refactor; biggest single LOC reduction available.

### MEDIUM — Added by audit pass P2-A

**3a. Scheduler over-fetches all-students credits** — `CreateSessionPage.fetchStudentCredits()` ([L377-L385](src/pages/CreateSessionPage.tsx#L377-L385)) and `ScheduleSessionPage` both load the entire `credits` table to populate one student's available count. O(N) bytes per page open. Switch to lazy lookup on student-selection.

**3b. `users + user_roles` re-joined every page** — 73+ files repeat `user_roles WHERE role='X' → users WHERE user_id IN (...)`. Two roundtrips for what is `users JOIN user_roles`. Either a `students_view` view or PostgREST `users!inner(user_roles!inner)` embed; or use the existing `get_users_by_role` RPC consistently.

### MEDIUM — Do second

**4. LiveSessionsManagement payload bloat** — Audited 2026-05-23. Original "~36 queries / per-row fan-out" framing was inaccurate. Actual mount: **12 queries**, no mount-path N+1. Per-row fan-out exists only in action handlers (cancel/no-show/status-change notification loops), bounded by parent count (1-3) and not triggered on mount. **Real issue is payload, not query count**: `classes.select("*")` with no date filter pulls every class ever created — full wide rows for potentially thousands of historical sessions on each tab open. `enrolments.select("*")` similarly unbounded. **Fix plan**: rolling date window on `classes` (last 7 days + next 14 days default, with picker for older), narrow `classes.select("*")` and `enrolments.select("*")` to consumed columns, consolidate `fetchStudents` + `fetchInstructors` into one `user_roles` round-trip (4 queries → 2).

**5. ApprovalsManagement L814 in-loop N+1** — `for...of leaveDetails` loop fires one `classes` query per leave date per request. L830 is the inner `users` IN query which is already correctly batched. The N+1 is the `classes` fetch inside the loop. Restructure to batch-collect all (instructor, date) pairs upfront, then one bulk `classes` query.

**6. CounsellorStudentsPage per-student aggregation** — **Closed**: no N+1 exists — query is already batched with IN + `Promise.all`. Separate over-fetch issue (`monthly_checkins` and `interaction_logs` return all rows per student, JS keeps only latest) — would benefit from a `DISTINCT ON` RPC but not urgent. Audit confirmed 2026-05-23.

**7. select\* hotspots** — `CounsellorStudentProfilePage` and `AdminStudentDetailPage` narrowed (12 calls total, all column lists derived from grep + consumer audit). `SalesLeadDetailPage` deferred — ~10% over-fetch on single-row lead query, dynamic form-field tables (`lead_form_fields`, `lead_form_sections`) likely need all columns to drive the form, and the 2951-LOC file makes future column-list maintenance expensive. Audit completed 2026-05-23.

**8. auth.users FK schema** — consider adding `public.users` FK columns (mirroring auth.uid) or a view to enable PostgREST embeds for user lookups. Currently forces batched IN pattern everywhere student_id/parent_id joins are needed. Any change here would need careful migration of all existing consumers.

---

## 17. KNOWN ISSUES AND DEFERRED ITEMS

| Item | Status |
|---|---|
| HR role | NOT STARTED |
| uuid:"null" PostgREST errors (dozens/sec in logs) | Known, fix deferred |
| n8n webhook endpoint verification | Not verified |
| Codebase cleanup post-QA | Deferred |
| Backfill: timezone fix for historical sessions (scheduled before ScheduleSessionDialog fix) | Needs data cleanup before go-live |
| Backfill: credit_utilised=false on old completed sessions | Post go-live |
| cleanup-test-data edge function | Should be restricted in production — add admin role guard |
| Realtime publication missing tables | course_discussions etc not in realtime publication |
| Sales pipeline stage hardcoded UUIDs (5 files) | Known, deferred |
| `enrollments` table (American spelling) | Dead table — `enrolments` (British) is the active one. Verify before dropping. |
| `legacy_assignments` table | Historical, not referenced by current UI. Safe to drop after verifying. |
| `AdminContentApprovalsPage.tsx` | Exists but not wired into App.tsx routes — orphaned. |
| `pages/Index.tsx` | Original Lovable starter fallback — not reachable, safe to delete. |
| Two `generate_student_username` overloads exist | Confirm consumers before dropping unused one. |
| interaction_logs.counsellor_id | Misleading name — now used by ops too. Should be renamed `logged_by`. Deferred. |
| notification_settings recipient_role column | One row per event_type only (no role split). Per-role control is in callers. Schema extension deferred. |
| pg_cron jobs embed secrets in command text | Visible to anyone who can SELECT on cron.job. Rotate if either leaks. |
| AppSidebar Block A realtime channel | Watches table `approval_requests` but Block A query reads `approvals` — channel never fires for Block A. The `pendingApprovals` badge was stale until page refresh. Subsumed (channel removed) by the `get_admin_sidebar_counts` consolidation, which listens to `approvals` directly. Documented for history. |
| `src/components/instructor/PendingActionsCard.tsx` | Orphan — no file imports it. Chain logic largely duplicates `InstructorStatCards`. Flagged for deletion review during cleanup. |
| `src/components/instructor/PendingWorkWidget.tsx` | Orphan — no file imports it. Was a candidate for `useInstructorTeachingContext` migration but skipped because nothing mounts it. Flagged for deletion review during cleanup. |
| Per-request `leave_requests` fetch in approvals widgets | Deferred N+1 in BOTH `ApprovalsManagement.tsx` (legacy, L793) and `ApprovalsTypeTable.tsx` (live, L122): `requestsData.map(async request => ...)` issues one `leave_requests` query per `approvals` row of type leave_request, even when two rows share an instructor. Out of scope of the L814/L136 in-loop fix that batched the `classes` query. Future pass should batch upfront by collecting all `requester_id`s into one `leave_requests` IN query, then JS-partitioning. |
| Approvals: legacy vs live components | `src/components/admin/ApprovalsManagement.tsx` powers the deprecated `/admin/approvals-legacy` route. `src/pages/admin/approvals/_shared/ApprovalsTypeTable.tsx` powers the live `/admin/approvals/*` per-type pages (see §21). They share the same data-fetching pattern; when patching one, check whether the other also needs the change. |
| LiveSessionsManagement: unified picker-data RPC (deferred) | After §16 #4 Stage 1+2 land, the remaining 4 cold-mount queries (`user_roles`+`users` for student/instructor dropdowns, `enrolments`, `credits`) could be collapsed into a single `get_session_picker_data()` RPC returning `{students, instructors, enrolments_active, credits_all}`. Trade-off: 1 round-trip vs an SQL maintenance surface; defer until Stage 1+2 are measured. |
| LiveSessionsManagement: form-interaction parallelization (deferred) | `checkConflicts()` ([L267](src/components/admin/LiveSessionsManagement.tsx)) fires 6 sequential queries on every form change after 300ms debounce; all independent and could be `Promise.all`-ed. `checkZoomConcurrency()` ([L243](src/components/admin/LiveSessionsManagement.tsx)) has 2 sequential queries, same shape. Notification fan-outs at L608/L680/L854 are `for (link of parentLinks) await invoke(...)` — should be `Promise.all`. Bounded by parent count (1-3), small UX win but textbook fix. |
| `enrolments.template_id` vs `course_id` smell | `LiveSessionsManagement.fetchStudentCourses()` at L405/L415 uses `sc.template_id \|\| sc.course_id` — ambiguous which is canonical. Not a perf issue; flag for a schema audit ticket. |
| Edit-session form shows UTC time instead of academy time | `AdminStudentDetailPage.tsx:479` and `StudentManagement.tsx:312` — edit session form populates `scheduled_at` input from UTC value directly (`new Date(session.scheduled_at).toISOString().slice(0,16)`) causing the form to show UTC time rather than Dubai time. Save-side is now correct (`localToUtcIso` applied) but display is misleading. Fix: use `formatInTz` to convert UTC→Dubai before populating the `datetime-local` input, matching the pattern in `EditSessionDialog` and `ScheduleSessionPage`. |
| God components — 3 files with 42-78 useState hooks | `SalesLeadDetailPage.tsx` (2951 LOC, 78 useState, 25 `as any`, 29 `!` assertions), `ApprovalsManagement.tsx` (2205 LOC, 51 useState — covers legacy `/admin/approvals-legacy` route; per-category routes have replaced it), `CoursesManagement.tsx` (1904 LOC, 42 useState). See §23 BATCH-E (delete legacy) and §23 DEFER (split RW-1, RW-3). |
| 609 `as any` casts across 131 files | Generated `Tables<"foo">` types defeated. Highest-density offenders: SalesLeadDetailPage (25), FinanceTransactionsPage (26), ApprovalsManagement (26), FinanceDashboardPage (24), FinanceGatewayPage (23). Specific shape `transaction_type: "used" as any` already flagged in P2-A-011 — bypasses enum check. Mechanical fix; high churn touches. |
| Pipeline stage names hardcoded in 14 files | "Won", "Lost", "Manager Approval", "Finance Approval", "Trial Done", "Commit", "Upside", "Converted", "Rejected" appear as string literals in client + `approve-won-lead` edge function. Renaming a stage via PipelineStagesManager UI silently breaks won-lead approval. See §23 BATCH-E. |
| `format(new Date(...))` browser-local in 24 files | Bypasses `formatInTz` from `src/lib/timezone.ts`. Sample files: ApprovalsTypeTable (8 occurrences), AdminStudentDetailPage (2), CertificatePrintPage (1), each approval landing page. Same root cause as the `date.toISOString()` TZ bug already noted at §1.4. |
| `currency_symbol` lookup duplicated in 15 files | Each does `settings.currency_symbol \|\| "AED"` independently. Should be a `useCurrencyFormat()` or `formatCurrency(amount)` util. |
| `staleLeadsCount` only refetches on mount (sales sidebar badge) | `AppSidebar.tsx:416-449` fires once. New lead aging past 3 days won't appear until navigate/reload. Polish — add 15-min refresh or a leads realtime channel. |
| `enrolmentCount` for students never refreshed after mount | `AppSidebar.tsx:331-346`. New enrolment from won-lead flow won't surface until logout/login. |
| Parent no-show dismissals stored in localStorage | `src/components/parent/AttendanceSummary.tsx` uses `noshow_dismissed_${classId}` localStorage keys. Doesn't sync across devices, lost on browser reset, no audit trail. Consider a `notification_dismissals` table if "parent acknowledged" matters downstream. |
| `parent_student_links.relationship` not validated | String column read by UI but writes have no enum/check. Low blast radius today; risky if used as routing key later. |
| Channel names hardcoded without user-scoping | `NotificationBell.tsx:51` (`notifications-realtime`), `MessagesCard.tsx:50` (`messages-card-realtime`). Compare `WeeklySchedule.tsx:106` (`instructor-weekly-schedule-${user.id}`) which is correct. Channel-name collision in the same client instance silently aliases. |
| `useSiteSettings` uses `window.dispatchEvent("site-settings-updated")` | Manual event bus where React Query invalidation would do. `SiteSettingsCard.tsx:179` dispatches; `useSiteSettings.ts:90-94` + `AppSidebar.tsx:807-808` listen. Replace with `queryClient.invalidateQueries(['siteSettings'])` after the React Query migration lands. |
| `RescheduleDialog` retains reason/slots across closes | `src/components/parent/RescheduleDialog.tsx:101-102` only resets on successful submit. Closing the dialog without submitting leaks state to the next open. |
| `CreditBalanceCard` "No credits yet" misleads exhausted accounts | Empty-state copy doesn't distinguish "never had credits" from "ran out — please renew." `src/components/dashboard/CreditBalanceCard.tsx:101-106`. |
| `getRandomStemAvatar` failure blocks student-add | `src/pages/AddStudentPage.tsx:319-323` calls it synchronously inside submit; CDN failure aborts the whole submit. Fall back to a hardcoded default. |
| `add-student` / `invite-user` return tempPassword in response on Brevo failure | Plaintext password into browser network response + Sentry/HAR/log breadcrumbs. Defensible (operator needs the password) but document and audit. See §23 BATCH-C P2-E-008. |
| `confirm-installment` returns `logId` not `reference` field | Inconsistent with all other functions that use `sanitizeError`. Frontend support-ticket flows pattern-match `reference`. Cosmetic. |
| `fetch-zoom-attendance` uses wildcard CORS instead of `getCorsHeaders` | `supabase/functions/fetch-zoom-attendance/index.ts:3-7` — every other function uses the shared helper. Function is cron-callable + role-protected so the wildcard is benign; rename for consistency. |
| `n8n-webhook-dispatcher` no Idempotency-Key on n8n POST | If function crashes between successful POST and the `status='sent'` update, the next run re-delivers. n8n handler must be idempotent. Consider adding an idempotency key per `webhook_events.id`. |
| `flag-pending-reports` SCAN_LIMIT=500 silently caps backlog | `supabase/functions/flag-pending-reports/index.ts:6-46`. Backlogs past row 500 are skipped indefinitely. Paginate with a cursor or process incrementally. |
| `send-notification` retry-on-Brevo-fail has no max-attempts cap | `supabase/functions/send-notification/index.ts:281-302` — fire-and-forget setTimeout that re-invokes the same function; unbounded fanout during Brevo outage. Track retry count in the payload. |
| `release-installment-credits` idempotency weaker than full-payment sibling | Only checks `inst.status === "confirmed"`; if function fails between credit-update and installment-status-update, retry double-releases credits. Mirror `release-full-payment-credits` which checks `credit_transactions` for a prior matching row. |
| Vestigial `enrollments` (US spelling) table still referenced | `enrolments` (British) is canonical. Both schemas + types exist. `delete-user/index.ts:39` still cascades through `enrollments`. Drop after verification (already in §17 list above). |
| Counsellor RLS doesn't enforce `is_counsellor_of(student)` | Migration `20260313155819 L107-115, L153-161`: `monthly_checkins` and `interaction_logs` policies allow any counsellor to write about any student. Add `AND EXISTS (... assigned_counsellor_id = auth.uid())` to WITH CHECK. |
| `student_create_requests` / `student_edit_requests` policies don't check counsellor role | Migration `20260313155819 L303-324`: predicate is `requested_by = auth.uid()` — any authenticated user can insert. Add `AND has_role(auth.uid(), 'counsellor')`. Low blast radius today; small social-engineering vector. |
| `Ops can update credits` policy lacks explicit `WITH CHECK` | Migration `20260308183819 L14`. Postgres infers from USING but the convention drift hides intent. Same on `Ops can update classes`, `Ops can update enrolments`. |
| Sales manager A can view manager B's team in `/sales/team` and `/sales/reports` | Route guard allows any `sales_manager`. RLS on `leads` may scope correctly but the route is wider than the spec. Confirm product intent. |
| `interaction_logs.counsellor_id` (column name) | See existing entry above; reinforced by P2-B-011. |
| `add-student` allows sales_exec / sales_manager to create students with up to 1000 initial credits | Bypasses the comp-credits approval flow. Either restrict to admin or cap `initialCredits=0` when caller is sales-only. |
| `cleanup-test-data` callable by any admin | Already noted in §17 above; reinforced by P2-C-008. Either delete the function file or add a `BOOTSTRAP_SECRET_KEY` gate on top of the admin role check. |
| `ParentSchedulePage` `zoom_password` in SELECT — intentional | Used by passcode copy button at [ParentSchedulePage.tsx:301-321](src/pages/parent/ParentSchedulePage.tsx#L301-L321) as a desktop Zoom-app fallback (parent pastes Meeting ID + Passcode if the auto-join URL doesn't work). NOT a security exposure — parent is already authenticated and authorized to join the child's class. Do not remove from SELECT without also removing the UI block. |
| `AppSidebar` instructor branch (L586): `helpdesk_tickets` realtime watcher has no filter | Fires on ALL ticket changes system-wide. Per P2-D-002. Add `filter: assigned_to=eq.<instructorId>` or `student_id IN (instructor's students)`. Counsellor variant fixed 2026-05-26 (BATCH E E-10); instructor + parent variants deferred. |
| `AppSidebar` parent branch (L630-633): 4 table watchers unfiltered | `reschedule_requests`, `class_cancellation_requests`, `instructor_change_requests`, `helpdesk_tickets` — all fire on every row change in the academy, triggering a full parent-context refetch. Per P2-D-002 / P2-D-011. Add `parent_id` or `student_id` filters scoped to this parent's children. |
| `finance_edit_requests` UPDATE — VERIFIED CLEAN (2026-05-26) | Finance has SELECT + INSERT policies only; NO UPDATE policy means finance cannot update edit requests at all (Postgres denies by default). Only admin has UPDATE via "Admin full access edit requests" (FOR ALL). Self-approval is impossible by construction. The `/admin/approvals/finance` route (§21) is the canonical review surface — admin reviews, decides. F-3 spec proposed adding a finance UPDATE policy with self-approval guard, but applying it would GRANT finance new peer-approval capability — that's a product change, not a security tightening. Skipped. |

---

## 18. SECURITY — PRIORITY ITEMS BEFORE GO-LIVE

The Supabase advisor flags these. Address before production launch:

**HIGH:**
- `auto_cancel_trial_class` — callable by anon role. Should be internal trigger only.
- `get_class_host_credentials` — callable by anon. Contains Zoom credentials.
- `get_finance_deals` — callable by anon. Contains financial data.
- `resolve_username_to_email` — callable by anon. Privacy risk.

**Fix pattern:** For functions that should not be publicly callable:
```sql
REVOKE EXECUTE ON FUNCTION public.function_name FROM anon;
REVOKE EXECUTE ON FUNCTION public.function_name FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.function_name TO authenticated;
-- or service_role only for internal functions
```

**MEDIUM:**
- Enable leaked password protection in Supabase Auth settings (currently disabled)
- `logos` public bucket allows listing — clients can enumerate all logo files. Restrict the SELECT policy to remove listing permission while keeping object URL access.
- `create-admin` in-memory rate limit resets on cold start — not durable. Consider DB-backed rate limiting for production.

---

## 19. INFRASTRUCTURE

| Item | Value |
|---|---|
| Supabase instance | Nano (0.5GB RAM, shared CPU) — **upgrade to Small or Medium before go-live** |
| Academy timezone | Asia/Dubai |
| Zoom credentials storage | system_settings table (NOT env vars) |
| GCS bucket | lms-recordings-videos (private, us-east1) |
| n8n webhook | system_settings.n8n_webhook_url (not yet verified) |
| CRON_SECRET | Vault secret, referenced in pg_cron job command text |

The Nano instance hit 100% CPU under test load with minimal data. The 48-index migration and Lovable performance fixes should resolve most query inefficiency, but instance upgrade is still recommended before real user load.

---

## 20. PROGRESS WEIGHTS

| Component | Weight |
|---|---|
| Attendance | 30% |
| Homework | 10% |
| Quiz | 25% |
| Assignment | 35% |

---

## 21. APPROVALS STRUCTURE

| Route | Purpose |
|---|---|
| `/admin/approvals` | Landing page with 9 cards |
| `/admin/approvals/leave` | Instructor Leave Requests |
| `/admin/approvals/hours` | Working Hours Changes |
| `/admin/approvals/students` | Student Requests |
| `/admin/approvals/counsellor` | Counsellor Assignments |
| `/admin/approvals/finance` | Finance Edit Requests |
| `/admin/approvals/comp-credits` | Complimentary Credits |
| `/admin/approvals/renewals` | Renewal Approvals |
| `/admin/approvals/reversals` | Credit Reversals |
| `/admin/approvals-legacy` | Preserved ApprovalsManagement.tsx at legacy route |

Content Reviews moved to Academic/Courses (CoursesManagement.tsx Pending Approval tab). Not in the approvals section.

---

## 22. ADMIN RETENTION DASHBOARD

Route: `/admin/retention`

Two tabs: Credits Exhausted and Not Renewed. Four RPCs power it (all admin-only, SECURITY DEFINER, has_role gated):
- `get_retention_dashboard_summary()` — dashboard widget data
- `get_credits_exhausted_list()` — full list for Credits Exhausted tab
- `get_not_renewed_events(p_scope text)` — scopes: `90d` | `this_month` | `last_month` | `this_year` | `all_time`
- `get_retention_trend_sparkline(p_metric text)` — 6-month sparkline, current month is in-progress (rendered with dashed stroke, "MTD, running")

Retention section also on `/admin` overview (after KPI cards): two widgets — Credits Exhausted (operational) and Not Renewed (strategic with reason breakdown).

---

## 23. AUDIT FINDINGS — CONSOLIDATED

Source: 14 audit passes — P1-A through P1-H (per-role) and P2-A through P2-F (cross-cutting). Findings deduplicated and bucketed below. Per-finding detail lives in the individual audit reports; this section is the prioritized backlog.

**Cross-pass synthesis.** Four themes recur across multiple passes and warrant being read together rather than as individual line items:

1. **Credit ledger trust** — `P2-A-002` (created_by inconsistent), `P2-A-004` (client over-blocks), `P2-A-005` (block/release not in transactions), `P2-A-007` (read-then-write race), `P2-C-003` (no-show race double-refunds), `P2-E-005` (cancellation toast lies). The credit table is the system's revenue source AND the least trustworthy data surface. Fix as one program, not 6 line items.
2. **Concurrent-edit guard missing** — `P2-A-007`, `P2-C-003`, `P2-C-010`, `P2-E-002`. `complete-class-report` ([supabase/functions/complete-class-report/index.ts:149-163](supabase/functions/complete-class-report/index.ts#L149-L163)) is the gold-standard rowcount-guard pattern; every approval mutation, every credits write, and the no-show / attendance crons should adopt it.
3. **Silent failure surface** — `P2-D-006` (no rollback on notification mutations), `P2-D-012` (toast before fire-and-forget), `P2-E-001` (fetch errors look like empty data), `P2-E-003` (success toast even when fanout fails), `P2-E-004` (instructor_joined update unchecked → no-show penalty cascade). A single shared `<QueryStateBoundary>` + React Query `useMutation` consolidation addresses most of these at once.
4. **Lovable god-component cost** — `P2-F-001` (3 files, 42-78 useState each), `P2-F-002` (609 `as any` casts), `P2-D-003` (React Query at ~1%). Every fix in P2-A through P2-E is 5× more expensive while these components remain. Two of the three god components are deletable or splittable with low risk.

---

### 23.1 FIX NOW — Blocks QA / production readiness

Each item below is a P0 across the audits — either security escalation, data corruption, or invisible-failure mode that compounds.

| # | ID | Finding | Where | Effort |
|---|---|---|---|---|
| 1 | P2-B-001 | Ops can reset any admin's password — no target-role check | [reset-user-password/index.ts:52-63](supabase/functions/reset-user-password/index.ts#L52-L63) | SMALL |
| 2 | P2-B-002 | **VERIFIED CLEAN — Already remediated 2026-03-18.** Policy dropped in migration 20260318105736, replaced with `get_class_by_token()` SECURITY DEFINER RPC. `TrialJoinPage.tsx` already uses the RPC at L30. P2-B-002 was a false alarm — audit read the CREATE in 20260308150202 without scanning forward to the DROP in 20260318105736. | — | NONE |
| 3 | P2-B-003 | `approve-won-lead` / `confirm-installment` take `approved_by`/`confirmed_by` from body — audit-trail spoofing | [approve-won-lead/index.ts:72,89-100](supabase/functions/approve-won-lead/index.ts#L72-L100), [confirm-installment/index.ts:57-58,162-170](supabase/functions/confirm-installment/index.ts#L57-L170) | SMALL |
| 4 | P2-B-004 | `send-notification` allows any staff role to send branded mail/WhatsApp to any user (phishing surface) | [send-notification/index.ts:409-424](supabase/functions/send-notification/index.ts#L409-L424) | MEDIUM |
| 5 | P2-C-008 | `cleanup-test-data` still deployed — admin-callable total wipe; one click destroys non-admin data | [cleanup-test-data/index.ts](supabase/functions/cleanup-test-data/index.ts) | SMALL (delete) |
| 6 | P2-C-001 | `approve-won-lead` silently loses parent + student credentials on Brevo failure | [approve-won-lead/index.ts:502-548](supabase/functions/approve-won-lead/index.ts#L502-L548) | SMALL |
| 7 | P2-C-002 | `zoom-recording-to-gcs` orphans half-uploads; 10-min dedupe blocks Zoom from re-firing | [zoom-recording-to-gcs/index.ts:354-385](supabase/functions/zoom-recording-to-gcs/index.ts#L354-L385) | MEDIUM |
| 8 | P2-C-003 | `detect-noshow` race double-creates penalty + credit_transactions row | [detect-noshow/index.ts:97-194](supabase/functions/detect-noshow/index.ts#L97-L194) | SMALL |
| 9 | P2-A-004 | **AUDIT CORRECTION (2026-05-25):** Rollback math is correct under single-tenant execution. Real issues are: (1) race/lost-update on absolute `blocked_credits` writes, (2) no `credit_transactions` audit rows for block/release events. | `CreateSessionPage:451, 486, 559, 576`, `ScheduleSessionPage:472, 478, 502, 516` | MEDIUM |
| 10 | P2-A-005 | No `credit_transactions` row written when credits are BLOCKED — block/release silently invisible to ledger | All schedulers | MEDIUM |
| 11 | P2-D-001 | 3-4 components each open redundant realtime subscriptions to the same notifications rows | `AppSidebar`, `NotificationBell`, `MessagesCard`, `NotificationsPage` | MEDIUM |
| 12 | P2-D-002 | `users` / `helpdesk_tickets` / `classes` realtime watchers without `filter:` — every academy-wide write fires every browser | `AppSidebar.tsx:481, 586, 630-633`, `WeeklySchedule:107`, `OpsDashboardPage:82-86` | SMALL |
| 13 | P2-E-001 | Most fetches silently treat error as "empty" — RLS denial / network blip presents as "no data" | Endemic; affects every dashboard | MEDIUM |
| 14 | P2-E-002 | Approval mutations lack `.eq("status","pending")` guard — two ops users approving simultaneously double-notify | `ApprovalsTypeTable:282-296`, `ApprovalsManagement` (21 sites), `AdminCompCreditsApprovalsPage:66-83` | MEDIUM |

---

### 23.2 FIX BEFORE LAUNCH — User-facing, MEDIUM severity

| # | ID | Finding | Effort |
|---|---|---|---|
| 1 | P2-A-002 | `created_by` written inconsistently across `credit_transactions` writers; some omit it entirely | SMALL |
| 2 | P2-A-006 | `AdjustCreditsDialog.utilise` doesn't decrement `blocked_credits` — credit shows up as both used AND blocked | SMALL |
| 3 | P2-A-007 | Read-then-write on `credits.total_credits`/`used_credits` from React state — lost-update race | MEDIUM |
| 4 | P2-A-008 | `low_credit_alert_sent` not reset on refund / admin adjust → student stays silent under threshold | SMALL |
| 5 | P2-A-009 | Bulk session "success" toast includes Zoom failures → classes without meeting links count as success | SMALL |
| 6 | P2-A-012 | Credit flows non-atomic (update credits + insert tx are 2 statements) → divergence on failure | MEDIUM |
| 7 | P2-B-005 | Route guard for `/sales/leads/:id/won` allows sales_exec; server requires admin/sales_manager → confusing 403 | SMALL |
| 8 | P2-B-006 | `add-student` lets sales_exec/sales_manager create students + assign up to 1000 credits, bypassing comp-credits approval | SMALL |
| 9 | P2-B-007 | `/students/:id/courses/:cId` allows any parent without `is_parent_of(student)` check | SMALL |
| 10 | P2-B-008 | `credit_transactions.created_by` not enforced server-side (no RLS WITH CHECK) → audit forgery possible by an admin | SMALL |
| 11 | P2-B-011 | Counsellor RLS doesn't enforce `is_counsellor_of(student)` — counsellors can write notes about any student | SMALL |
| 12 | P2-B-013 | `student_create_requests` policy doesn't check counsellor role — any authenticated user can insert | SMALL |
| 13 | P2-C-004 | `detect-penalties`: no top-level error handling, no idempotency lock on penalty insert | SMALL |
| 14 | P2-C-005 | `class-reminders`: no try/catch, lossy webhook_events dedupe, no per-class inner try/catch | SMALL |
| 15 | P2-C-006 | `n8n-webhook-dispatcher` can re-deliver events on crash; no exponential backoff | MEDIUM |
| 16 | P2-C-007 | `zoom-webhook-receiver` fire-and-forget handoff to `zoom-recording-to-gcs` — recordings can be lost on cold start | SMALL |
| 17 | P2-C-009 | `zoom-recording-to-gcs` reuses `BOOTSTRAP_SECRET_KEY` for inter-function auth — rotation of bootstrap secret breaks pipeline | SMALL |
| 18 | P2-C-010 | `fetch-zoom-attendance` race window can duplicate `attendance` rows when cron + webhook trigger simultaneously | SMALL |
| 19 | P2-C-011 | `release-installment-credits` idempotency weaker than `release-full-payment-credits` sibling | SMALL |
| 20 | P2-C-018 | `flag-pending-reports` + `approve-won-lead` log Brevo response body containing recipient PII to function logs | SMALL |
| 21 | P2-D-003 | React Query migration: top-2 priorities are notifications + sidebar-counts for non-admin/ops/finance roles | LARGE |
| 22 | P2-D-004 | Mutations call `fetchAll()` (heavy refetch) instead of granular invalidate | MEDIUM (incremental, per page) |
| 23 | P2-D-006 | Notification mark-as-read / mark-all / delete have no rollback if server fails → ghost flicker on next load | SMALL |
| 24 | P2-D-012 | Toast says "success" before fire-and-forget edge function or fanout completes | SMALL |
| 25 | P2-E-003 | `RescheduleDialog` toasts success even when notification dispatch silently fails — ops never notified | SMALL |
| 26 | P2-E-004 | `TodaysClasses.handleJoin` updates `instructor_joined=true` without checking — silent failure triggers bogus no-show penalty | SMALL |
| 27 | P2-E-005 | `LiveClassCard` cancellation toast claims "credit preserved" but doesn't write `credit_transactions` row | SMALL |
| 28 | P2-E-006 | `handleCompleteClass`, `updateRag`, several others lack in-progress guards → double-submit creates duplicates | SMALL |
| 29 | P2-E-007 | `SalesPipelinePage` hides leads whose `stage_id` was deleted — no orphan bucket | SMALL |
| 30 | P2-E-008 | `add-student` tempPassword toast at 15s duration too short for secure operator handoff | SMALL |
| 31 | P2-F-005 | Pipeline stage names hardcoded in 14 files — renaming via PipelineStagesManager silently breaks `approve-won-lead` | MEDIUM |
| 32 | P2-F-RW-2 | Delete `ApprovalsManagement.tsx` (2205 LOC) + `/admin/approvals-legacy` route — per-category routes already replaced it | SMALL (mostly DELETE) |

---

### 23.3 FIX POST LAUNCH — LOW severity / polish

P2-A: `P2-A-003` (parent no-show dismissals localStorage), `P2-A-013` (50-row global tx cap), `P2-A-014` (parent_student_links.relationship unvalidated), `P2-A-015` (scheduler over-fetches credits), `P2-A-016` (`users`+`user_roles` re-joined per page).

P2-B: `P2-B-010` (`confirm-installment` inline `user_roles` query), `P2-B-012` (Ops update credits lacks WITH CHECK), `P2-B-014` (sales manager team scope), `P2-B-015` (tempPassword in add-student/invite-user response on email failure).

P2-C: `P2-C-012` (`flag-pending-reports` SCAN_LIMIT silent cap), `P2-C-013` (`detect-overdue-installments` O(N×M) sequential), `P2-C-014` (`String(err)` in cron error responses), `P2-C-015` (`send-notification` retry uncapped), `P2-C-016` (`fetch-zoom-attendance` wildcard CORS), `P2-C-017` (`confirm-installment` `logId` vs `reference`).

P2-D: `P2-D-005` (LiveControlRoom polling vs realtime), `P2-D-007` (useSiteSettings CustomEvent bus), `P2-D-008` (useSiteSettings.refetch dedup), `P2-D-009` (staleLeadsCount mount-only), `P2-D-010` (enrolmentCount mount-only), `P2-D-011` (parent_sidebar_counts whole-context refetch), `P2-D-013` (channel name collisions).

P2-E: `P2-E-009` (AddStudentPage no field-level server errors), `P2-E-010` (no "signed out elsewhere" detection), `P2-E-011` (instructor 0-students no welcome copy), `P2-E-012` (parent post-conversion lag empty-state), `P2-E-013` (CounsellorStudentProfilePage in-flight cancellation), `P2-E-014` (RescheduleDialog state leak), `P2-E-015` (CreditBalanceCard exhausted vs never-had copy), `P2-E-016` (getRandomStemAvatar blocks submit).

P2-F polish: `P2-F-008` (Brevo body PII logging — duplicates P2-C-018), `P2-F-009` (69 non-null assertions), `P2-F-010` (currency_symbol duplicated), `P2-F-011` (browser-local date formatting in 24 files), `P2-F-013` (`ensureCourseNotificationSettings` on every approval).

P2-A-001 / P2-B-009 (originally P0 student-leak of counsellor notes): **downgraded** — RLS blocks the read; UI bug only. Move CourseDetailPage data effect behind `if (role !== 'student')` guard. Effort: SMALL.

---

### 23.4 DEFER — Refactor, no functional impact

Cross-codebase patterns that require sustained engineering investment but no individual one is urgent:

- **`P2-F-001` god components** — `SalesLeadDetailPage` (RW-1, MEDIUM-HIGH risk rewrite), `CoursesManagement` (RW-3, LOW risk split), `AppSidebar` (RW-4, MEDIUM risk role-config extraction).
- **`P2-F-002` 609 `as any` casts** — type discipline pass. Re-run `supabase gen types` and remove casts one file at a time.
- **`P2-F-003` `useUsersByIds` hook** — touches 114 files; mechanical but high churn.
- **`P2-F-004` `useUsersByRole` / `get_users_by_role` adoption** — touches 73 files.
- **`P2-F-006` `useEffect(() => fetchData(), [])` + `eslint-disable-next-line` endemic** — clears up when React Query migration lands (P2-D-003).
- **`P2-F-007` vestigial `enrollments` table** — already documented in §17.
- **`P2-F-RW-5` CreateSessionPage + ScheduleSessionPage consolidation** — MEDIUM-risk dedup; prerequisite for clean credit-ledger fixes.
- **`P2-D-014`** — useCallback/useEffect dep cycles in NotificationBell (cosmetic).

---

### 23.5 PRIORITIZED FIX PLAN — Batched

Items below are grouped into batches where the fixes share a file, a security domain, or a refactor primitive. Effort labels: SMALL (<1h), MEDIUM (1-4h), LARGE (>4h).

#### BATCH A — Privilege-escalation hardening (do first, all P0 security)

Estimated total: 1 day of focused work.

| Step | What | Effort |
|---|---|---|
| A1 | `reset-user-password`: add target-role check — refuse if `userId` has admin role and caller is ops | SMALL |
| A2 | `classes` RLS: drop anon `USING (public_join_token IS NOT NULL)` policy; replace with `get_trial_class_by_token(p_token text)` SECURITY DEFINER RPC | SMALL |
| A3 | `approve-won-lead`: ignore `approved_by` from body, write `caller.id` directly | SMALL |
| A4 | `confirm-installment`: ignore `confirmed_by` from body, write `caller.id` directly | SMALL |
| A5 | `send-notification`: restrict caller to admin + service_role; require `type` from closed enum of templates | MEDIUM |
| A6 | Delete `cleanup-test-data` edge function file, OR gate with `BOOTSTRAP_SECRET_KEY` on top of admin role check | SMALL |

#### BATCH B — Credit-ledger remediation (program of work, ~2 days)

Estimated total: 2 days. Read §23 synthesis bullet 1 first. Do BATCH B as one PR or one stack — partial fixes leave the ledger in mixed state.

| Step | What | Effort |
|---|---|---|
| B1 | Move `credits` updates behind a `block_credits(p_student_id, p_count, p_class_ids[])` SECURITY DEFINER RPC. Single atomic statement: increment `blocked_credits`, insert N `credit_transactions` rows with `transaction_type='blocked'` (new enum value), return success | MEDIUM |
| B2 | Mirror with `release_credits(p_student_id, p_count, p_class_ids[])` RPC for cancellation / no-show paths | SMALL |
| B3 | Rewrite `CreateSessionPage` + `ScheduleSessionPage` to call `block_credits` RPC; delete the buggy rollback code paths entirely (fixes P2-A-004, P2-A-005, P2-A-007) | MEDIUM |
| B4 | `detect-noshow`: gate the per-row update with `.eq("no_show_flagged", false).select("id")` and skip downstream side effects if rowcount=0 (fixes P2-C-003, mirrors `complete-class-report` pattern) | SMALL |
| B5 | `AdjustCreditsDialog.utilise`: decrement `blocked_credits` in same RPC call as `used_credits` increment (fixes P2-A-006) | SMALL |
| B6 | Add `WITH CHECK (created_by = auth.uid() OR auth.role() = 'service_role')` to `credit_transactions` INSERT policy (fixes P2-A-002, P2-B-008) | SMALL |
| B7 | `LiveClassCard.handleCancelConfirm`: invoke a SECURITY DEFINER cancellation RPC that writes the `credit_transactions` refund row atomically (fixes P2-E-005) | SMALL |

#### BATCH C — Edge function reliability (~1 day)

| Step | What | Effort |
|---|---|---|
| C1 | `approve-won-lead`: return `{ emailFailed: true, parentTempPassword, studentTempPassword }` on Brevo throw, matching `add-student` shape (fixes P2-C-001) | SMALL |
| C2 | `zoom-recording-to-gcs`: track `recording_parts_uploaded` per-class, skip already-uploaded parts on retry, only call `trashZoomRecording` after all parts confirmed (fixes P2-C-002) | MEDIUM |
| C3 | `zoom-webhook-receiver`: use `EdgeRuntime.waitUntil(fetch(...))` for the handoff so the function doesn't return before the inner fetch dispatches (fixes P2-C-007) | SMALL |
| C4 | `fetch-zoom-attendance`: add `.eq("attendance_fetch_pending", true).select("id")` rowcount guard on per-class update; add unique index on `(class_id, student_id)` for `attendance` (fixes P2-C-010) | SMALL |
| C5 | `release-installment-credits`: add `credit_transactions` ledger pre-check before `credits` update (mirror `release-full-payment-credits`) (fixes P2-C-011) | SMALL |
| C6 | `detect-penalties`: wrap in top-level try/catch with `sanitizeError`; add unique index on `(class_id, type)` for `penalties` (fixes P2-C-004) | SMALL |
| C7 | `class-reminders`: wrap in top-level try/catch; add per-class inner try/catch (fixes P2-C-005) | SMALL |
| C8 | Replace `BOOTSTRAP_SECRET_KEY` reuse in `zoom-recording-to-gcs` with a dedicated `INTERNAL_FUNCTION_SECRET` (fixes P2-C-009) | SMALL |
| C9 | Sweep all crons for `JSON.stringify({ error: String(err) })` → replace with `sanitizeError` (fixes P2-C-014); strip Brevo response bodies from `console.warn` lines (fixes P2-C-018) | MEDIUM |

#### BATCH D — Subscription + cache architecture (~3 days)

| Step | What | Effort |
|---|---|---|
| D1 | Add `filter:` clauses to all unfiltered realtime watchers in `AppSidebar` (rows 481, 586, 630-633), `WeeklySchedule:107`, `OpsDashboardPage:82-86` (fixes P2-D-002) | SMALL |
| D2 | Centralise notifications in a `useNotifications(role)` React Query hook; consumers (`NotificationBell`, `MessagesCard`, `AppSidebar` per-role count, `NotificationsPage`) read from cache, one shared subscription invalidates the key (fixes P2-D-001) | MEDIUM |
| D3 | Build `<QueryStateBoundary>` component (`isLoading` / `error` / `empty` / `data` branches) and migrate top-traffic dashboards (`Dashboard`, `NextClassCard`, `CreditBalanceCard`, `TodaysClasses`, `UpcomingSchedule`) (fixes P2-E-001) | MEDIUM |
| D4 | Migrate the remaining sidebar roles (student / instructor / counsellor / parent / curriculum) to `get_*_sidebar_counts` RPCs matching the admin/ops/finance pattern (fixes P2-D-003 #2, partial P2-D-010, P2-D-011) | MEDIUM |
| D5 | Add `.eq("status","pending").select("id")` + rowcount check to every approval mutation site; short-circuit notifications when rowcount=0 (fixes P2-E-002) | MEDIUM |
| D6 | Convert notification optimistic updates to `useMutation({ onMutate, onError })` with proper rollback (fixes P2-D-006) | SMALL |

#### BATCH E — Quick wins (1-2 days)

| Step | What | Effort |
|---|---|---|
| E1 | Delete `src/components/admin/ApprovalsManagement.tsx` (2205 LOC) and remove the `/admin/approvals-legacy` route from `App.tsx:289`; verify no other consumers (fixes P2-F-RW-2) | SMALL |
| E2 | Add `system_key` column to `sales_pipeline_stages` with values `won`/`lost`/`manager_approval`/`finance_approval`/etc.; replace hardcoded stage-name literals across 14 files + `approve-won-lead/index.ts:80` (fixes P2-F-005) | MEDIUM |
| E3 | `TodaysClasses.handleJoin`: check the result of the `instructor_joined=true` UPDATE and toast on error (fixes P2-E-004) | SMALL |
| E4 | `SalesPipelinePage`: render an "Unassigned stage" column for leads whose `stage_id` doesn't match any stage (fixes P2-E-007) | SMALL |
| E5 | `RescheduleDialog`: wrap entire submit in try/catch; reset state on close (fixes P2-E-003 + P2-E-014) | SMALL |
| E6 | Move `CourseDetailPage` `interaction_logs` query behind `if (role !== 'student')` (fixes P2-A-001 / P2-B-009 — UI cleanup, RLS already blocks) | SMALL |
| E7 | Expand `add-student` tempPassword surface from 15s toast to modal with copy buttons and explicit dismissal (fixes P2-E-008) | SMALL |

---

**Recommended sequence:** BATCH A → BATCH C → BATCH B → BATCH D → BATCH E. Rationale: A unblocks the most serious security exposure with cheap one-line fixes; C stabilises the cron + edge layer; B is the largest piece of work but every other audit finding compounds on the credit ledger so it has to land before scale-up; D unlocks the React Query migration that makes the rest of the codebase cheaper to maintain; E is the quick-win sweep at the end. DEFER items wait for the dedicated rewrite passes per §23.4.

---

_End of CLAUDE.md. Regenerate Section 2 database schema when tables change materially. All other sections should be updated manually as features are built._
