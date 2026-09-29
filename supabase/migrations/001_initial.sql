-- Road to FIP schema
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  home_base text not null default 'Northampton, Northamptonshire',
  started_padel_at date not null,
  goal_fip_at date not null,
  goal_uk_top100_at date not null,
  uk_ranking integer,
  weekly_targets jsonb not null default '{"court":3,"gym":2,"coaching":1}'::jsonb,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roadmap_skills (
  id uuid primary key default gen_random_uuid(),
  phase smallint not null check (phase between 1 and 3),
  category text not null check (category in ('technique','tactics','physical','mental','competition')),
  title text not null,
  description text not null,
  drill_hint text,
  sort_order integer not null default 0
);

create table public.skill_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.roadmap_skills (id) on delete cascade,
  status text not null default 'todo' check (status in ('todo','learning','practiced','solid')),
  notes text,
  updated_at timestamptz not null default now(),
  unique (user_id, skill_id)
);

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null default current_date,
  duration_mins integer not null check (duration_mins > 0),
  focus text,
  session_type text not null default 'drill' check (session_type in ('drill','match','mixed')),
  intensity smallint check (intensity between 1 and 10),
  rpe smallint check (rpe between 1 and 10),
  notes text,
  created_at timestamptz not null default now()
);

create table public.coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null default current_date,
  duration_mins integer not null check (duration_mins > 0),
  coach_name text,
  focus text,
  takeaways text,
  homework text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.gym_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null default current_date,
  duration_mins integer not null check (duration_mins > 0),
  focus text not null default 'full' check (focus in ('legs','core','shoulders','cardio','full','mobility')),
  session_type text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_date date not null default current_date,
  name text not null,
  level text not null check (level in ('club','midlands','national','fip')),
  result text,
  partner text,
  ranking_notes text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.recovery_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null default current_date,
  sleep_hours numeric(3,1),
  soreness smallint check (soreness between 1 and 10),
  readiness smallint check (readiness between 1 and 10),
  activity text check (activity in ('rest','mobility','light','other')),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null default current_date,
  protein_focus boolean not null default false,
  hydration_litres numeric(3,1),
  energy smallint check (energy between 1 and 10),
  pre_court text,
  post_court text,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index skill_progress_user_idx on public.skill_progress (user_id);
create index practice_sessions_user_date_idx on public.practice_sessions (user_id, session_date desc);
create index coaching_sessions_user_date_idx on public.coaching_sessions (user_id, session_date desc);
create index gym_sessions_user_date_idx on public.gym_sessions (user_id, session_date desc);
create index competitions_user_date_idx on public.competitions (user_id, event_date desc);
create index recovery_logs_user_date_idx on public.recovery_logs (user_id, log_date desc);
create index nutrition_logs_user_date_idx on public.nutrition_logs (user_id, log_date desc);

alter table public.profiles enable row level security;
alter table public.roadmap_skills enable row level security;
alter table public.skill_progress enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.coaching_sessions enable row level security;
alter table public.gym_sessions enable row level security;
alter table public.competitions enable row level security;
alter table public.recovery_logs enable row level security;
alter table public.nutrition_logs enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "roadmap_skills_read" on public.roadmap_skills for select using (true);

create policy "skill_progress_own" on public.skill_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "practice_own" on public.practice_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "coaching_own" on public.coaching_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "gym_own" on public.gym_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "competitions_own" on public.competitions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recovery_own" on public.recovery_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "nutrition_own" on public.nutrition_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user_skills()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.skill_progress (user_id, skill_id, status)
  select new.id, s.id, 'todo'
  from public.roadmap_skills s
  on conflict (user_id, skill_id) do nothing;
  return new;
end;
$$;

create trigger on_profile_created_seed_skills
  after insert on public.profiles
  for each row execute function public.handle_new_user_skills();
