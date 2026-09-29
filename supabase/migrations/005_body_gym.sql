-- Body composition logs + padel gym week plans
create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null default current_date,
  weight_kg numeric(5,2) not null,
  body_fat_pct numeric(4,1),
  waist_cm numeric(5,1),
  chest_cm numeric(5,1),
  hips_cm numeric(5,1),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists body_metrics_user_date_idx
  on public.body_metrics (user_id, log_date desc);

alter table public.body_metrics enable row level security;

create policy "body_metrics_own" on public.body_metrics
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.profiles
  add column if not exists height_cm numeric(5,1),
  add column if not exists sex text check (sex is null or sex in ('male','female','other')),
  add column if not exists body_goal text not null default 'recomp'
    check (body_goal in ('lose_fat','recomp','maintain','gain'));

create table if not exists public.gym_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  title text not null default 'Padel gym week',
  context jsonb not null default '{}'::jsonb,
  plan jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists gym_plans_user_week_idx
  on public.gym_plans (user_id, week_start desc);

alter table public.gym_plans enable row level security;

create policy "gym_plans_own" on public.gym_plans
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
