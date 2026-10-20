# Run Checklist — Rozgar Radar

Two ways to run: **local mode** (zero config) and **Supabase mode** (real auth + DB).

---

## A. Local mode (no accounts needed)

The app falls back to a file-backed store in `.data/` when Supabase env vars are missing.

- [x] `npm install`
- [x] `npm run dev` → http://localhost:3000
- [x] Go to `/login`, enter any email (password optional), press Sign in
- [x] On `/onboarding` fill degree, branch, batch year, marks, skills → Continue
- [x] On `/jobs` press **Run AI match** → verdicts appear on the cards
- [x] Click a card → eligibility report, AI explanation, Save job
- [x] On `/dashboard` see match counts, filters and saved jobs
- [x] `npm run build` passes with no errors

Expected match result for a B.Tech / CSE / 2026 / 60% profile:

| Status | Count | Why |
|---|---|---|
| Confirmed | 5 | degree, branch, batch and marks all pass, skills overlap |
| Likely | 9 | academics pass, no listed skill matches yet |
| Needs review | 2 | job names a non-technical degree (BBA) but accepts any branch |
| Not eligible | 4 | branch or marks cut-off fails |

Notes:
- No LLM key → rules-only verdicts with a template explanation. Nothing breaks.
- `.data/local-db.json` holds local profiles/matches/saved jobs. Delete it to reset.
- `POST /api/cron/daily-alerts` still works locally, but reports
  `RESEND_API_KEY is not configured` instead of emailing.

---

## B. Supabase mode (real auth, RLS, Postgres)

- [x] Create a project at https://supabase.com
- [x] SQL Editor → run `supabase/schema.sql` (tables, RLS policies, triggers)
- [x] Seed jobs: run `npm run db:seed` (or run `supabase/seed.sql` in SQL Editor)
- [x] Project Settings → API → copy the project URL, anon key and service role key
- [x] Set in `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

- [ ] `npm run dev` → sign up at `/login`, complete `/onboarding`
- [ ] Confirm the profile row exists in Supabase → Table Editor → `profiles`
- [ ] Confirm verdicts land in `job_matches` after running the match
- [ ] Check RLS: signed out, `GET /api/jobs` returns jobs; `GET /api/profile` returns 401

---

## C. LLM (optional but recommended)

Any OpenAI-compatible chat completions endpoint.

```
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

- [ ] With the key set, `POST /api/match` returns a two-line AI explanation per job
- [ ] Without the key, the same request still returns verdicts (rules-only fallback)

The LLM only extracts requirements and writes the explanation. It never sets the
verdict — `lib/rules.ts` does that, so the outcome is deterministic.

---

## D. Email alerts (Resend)

```
RESEND_API_KEY=re_...
EMAIL_FROM=Rozgar Radar <alerts@yourdomain.com>
CRON_SECRET=<random string>
NEXT_PUBLIC_APP_URL=https://your-deployment.vercel.app
```

- [ ] Resend → Domains → verify `yourdomain.com` (or use `onboarding@resend.dev`)
- [ ] Trigger the job manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/daily-alerts
```

- [ ] Response JSON shows `emailed: true` for each user
- [ ] Inbox receives the shortlist email
- [ ] Running the cron twice in one day → second run reports `already sent today`
- [ ] Without `RESEND_API_KEY` → `emailed: false` with a clear error, no crash

### Deploy and schedule the cron

- [ ] `vercel --prod` (the `crons` block in `vercel.json` runs the job at 02:30 UTC = 08:00 IST)
- [ ] Add the same env vars in Vercel → Settings → Environment Variables
- [ ] Vercel sends `Authorization: Bearer $CRON_SECRET` automatically for cron hits

---

## E. Troubleshooting

| Symptom | Fix |
|---|---|
| "Supabase env vars missing" | `.env` is missing the `NEXT_PUBLIC_SUPABASE_*` keys |
| 404 on `/` or `MODULE_NOT_FOUND` | `next dev` and `next build` share `.next/` — stop the dev server, `rm -rf .next`, start it again. Never run the build while the dev server is up. |
| Sign-in bounces back to `/login` | Supabase email confirmation is on — confirm the email, or disable it in Auth settings |
| `npm install` fails with EACCES | Use a project-local cache: `npm install --cache ./.npm-cache` |
| Every job is "Needs review" | Profile is missing branch or batch year — fill the onboarding form |
| Cards unreadable in 3D | Use the **All jobs** list under the board; it has the same data |
