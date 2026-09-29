# Road to FIP

Personal padel training OS for a dual goal: **first FIP points** (primary) and **UK top 100** (secondary), based in Northampton, Northamptonshire.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase Auth (email/password + optional magic link) + Postgres + RLS

## Setup

1. Create a free [Supabase](https://supabase.com) project.
2. In the SQL Editor, run in order:
   - [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql)
   - [`supabase/seed.sql`](supabase/seed.sql)
   - [`supabase/migrations/002_recaps.sql`](supabase/migrations/002_recaps.sql) (AI coach history)
   - [`supabase/migrations/003_kourtos.sql`](supabase/migrations/003_kourtos.sql) (Kourtos / Playtomic cache)
   - [`supabase/migrations/004_meal_prep.sql`](supabase/migrations/004_meal_prep.sql) (weekly meal prep)
   - [`supabase/migrations/005_body_gym.sql`](supabase/migrations/005_body_gym.sql) (body metrics + padel gym plans)
3. Under **Authentication → Providers → Email**, enable Email sign-in and leave **Confirm email** on or off (off = instant password login after sign-up).
4. Add redirect URLs: `http://localhost:3000/auth/callback` and your production URL (same path). For password reset, the app uses `/auth/callback?next=/auth/update-password`.
5. Copy `.env.example` → `.env.local` and fill in:
   - Supabase URL + anon key
   - `OPENAI_API_KEY` for AI recaps
   - **Kourtos partner token (recommended):** `KOURTOS_PARTNER_API_TOKEN=kos_live_…` from the Kourtos `/partner` portal, plus `KOURTOS_PLAYER_NAME` (exact name on fixtures) or `KOURTOS_PLAYER_ID`
   - Optional user email/password (or JWT) only if you also want Playtomic level enrichment from `/stats/overview`
6. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without env vars you’ll see the setup guide.

## What’s included

- Dashboard with dual-goal strip and weekly checklist
- Guided 3-phase roadmap (foundations → UK ladder → top 100 + FIP)
- Logs: practice, competitions, coaching, gym, recovery, nutrition
- **AI coach**: weekly/monthly recaps with progress notes and tips (OpenAI)
- **Kourtos sync**: Playtomic level, win rate, and recent games from app.kourtos.com
- **Meal prep**: weekly plan tailored to weight/BF% + body goal; supermarket order list
- **Body**: weight, body fat %, measurements, composition goal
- **Gym**: padel-performance weekly plans (COD, shoulders, engine) from readiness + comps
- Profile: home base, goal dates, self-reported UK ranking, weekly targets

Dark athletic UI by default (court green on near-black).
