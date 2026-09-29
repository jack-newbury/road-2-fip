-- Weekly meal prep plans
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  title text not null default 'Week meal prep',
  preferences jsonb not null default '{}'::jsonb,
  plan jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists meal_plans_user_week_idx
  on public.meal_plans (user_id, week_start desc);

alter table public.meal_plans enable row level security;

create policy "meal_plans_own" on public.meal_plans
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
