# Rozgar Radar

An AI job-hunting platform for India, aimed at students and freshers. It checks
your profile against every opening, explains the verdict in plain English, puts
the whole market on a 3D board, and emails you a shortlist every morning.

Job listings are **fictional mock data** — nothing is scraped.

## What it does

1. **Backend** — Supabase tables (`profiles`, `jobs`, `job_matches`, `saved_jobs`)
   with RLS, auth, 20 seeded mock jobs, `GET /api/jobs` and `POST /api/profile`.
2. **Eligibility AI** — `POST /api/match`. Fixed rules check degree, branch,
   graduation year and marks. The LLM only extracts requirements from the job
   description and writes a two-line explanation. Verdicts are **Confirmed**,
   **Likely**, **Not eligible** or **Needs review**, with reasons.
3. **3D scene** — React Three Fiber job cards floating in a ring around an AI
   orb that pulses when idle, spins while thinking, bursts green when you are
   eligible and shakes red when you are not.
4. **Alerts + dashboard** — a daily cron route re-matches every profile and
   emails the shortlist via Resend, plus a dashboard of saved jobs and verdicts.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · React Three Fiber ·
Supabase (Auth, Postgres, RLS) · any OpenAI-compatible LLM API · Resend

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

With no configuration the app runs in **local mode**: it uses a file-backed
store in `.data/` and the same 20 mock jobs, so you can try the whole flow
without any accounts. Sign in with any email, fill in the profile, and press
**Run AI match**.

For real auth, Postgres and RLS, follow `RUN_CHECKLIST.md` section B.

## Configuration

Copy `.env.example` to `.env`. Every key is optional — the app degrades
gracefully instead of crashing.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Switches the app out of local mode |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron job and admin queries |
| `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL` | Requirement extraction and explanations |
| `RESEND_API_KEY` / `EMAIL_FROM` | Daily alert emails |
| `CRON_SECRET` | Secures `/api/cron/daily-alerts` |
| `NEXT_PUBLIC_APP_URL` | Links inside the alert email |

## Routes

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Landing page and setup steps |
| `/login` | GET | Sign up / sign in |
| `/onboarding` | GET | Build your profile |
| `/jobs` | GET | 3D job board + list view |
| `/dashboard` | GET | Saved jobs and match verdicts |
| `/auth/callback` | GET | Supabase auth code exchange |
| `/api/jobs` | GET | Jobs with your match verdicts |
| `/api/profile` | GET, POST | Read and save your profile |
| `/api/match` | POST | Run matching across all jobs |
| `/api/saved` | GET, POST, DELETE | Saved jobs |
| `/api/auth/local` | POST | Local-mode sign in |
| `/api/cron/daily-alerts` | GET | Daily matching + email job |

## Project layout

```
app/                       pages and API routes (Next.js App Router)
  hirepulse/               HirePulse job aggregator pages
    page.tsx               Multi-source job board
    embed/page.tsx         Embeddable job board for iFrames
    admin/sources/page.tsx Source health & ingestion admin
components/three/          JobBoard, JobCard, AIOrb (3D scene)
components/hirepulse/      HirePulse UI components
lib/                       rules, matching, llm, email, data layer, Supabase clients
lib/hirepulse/             HirePulse API client and TypeScript types
backend/                   HirePulse FastAPI backend (Python)
  app/api/                 REST endpoints (jobs, sources, sync)
  app/models/              SQLAlchemy ORM models
  app/schemas/             Pydantic v2 validation schemas
  static/widget.js         Universal embeddable JS widget
services/job_ingestion/    Multi-source job ingestion pipeline
  connectors/              Greenhouse, Lever, Ashby connectors
  normalizer.py            Schema mapping & cleaning
  deduplicator.py          3-tier duplicate detection
  freshness.py             Freshness & expiry state engine
  scheduler.py             Scheduled crawler & sync worker
tests/                     Backend test suite
docs/                      Architecture & integration documentation
supabase/                  schema.sql (tables + RLS) and seed.sql (20 mock jobs)
PLAN.md                    the 4-stage build plan
RUN_CHECKLIST.md           how to run and verify everything
```

## HirePulse Engine

HirePulse is a multi-source job aggregation engine integrated into Rozgar Radar.
It collects job listings from verified ATS platforms (Greenhouse, Lever, Ashby)
and aggregators, normalizes them into a unified schema, performs 3-tier
deduplication, tracks listing freshness, and provides direct links to original
application pages.

### Running the HirePulse Backend

```bash
# From project root
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs at: `http://localhost:8000/docs`

### Seeding Jobs

```bash
python -m services.job_ingestion.scheduler --run-now
```

### HirePulse Routes

| Route | Purpose |
|---|---|
| `/hirepulse` | Multi-source job board with search, filters, pagination |
| `/hirepulse/embed` | Lightweight embeddable job board for iFrames |
| `/hirepulse/admin/sources` | Source registry health & sync admin |

## Notes

- The verdict is always decided by the deterministic rules in `lib/rules.ts`.
  The LLM writes prose and pulls out requirements — it never decides who is
  eligible, so results are reproducible.
- The 3D board is the showpiece; the **All jobs** list under it carries the same
  data for actually scanning roles.
- HirePulse runs as a separate FastAPI backend on port 8000. The Next.js
  frontend talks to it via `NEXT_PUBLIC_HIREPULSE_API_URL`.

