-- User supplement stack + daily taken tracker
create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  dose text,
  timing text,
  notes text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists supplements_user_idx
  on public.supplements (user_id, sort_order, created_at);

alter table public.supplements enable row level security;

create policy "supplements_own" on public.supplements
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.supplement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  supplement_id uuid not null references public.supplements (id) on delete cascade,
  log_date date not null default current_date,
  taken boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, supplement_id, log_date)
);

create index if not exists supplement_logs_user_date_idx
  on public.supplement_logs (user_id, log_date desc);

alter table public.supplement_logs enable row level security;

create policy "supplement_logs_own" on public.supplement_logs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed default stack for existing profiles that have none yet
insert into public.supplements (user_id, name, dose, timing, notes, sort_order)
select p.id, v.name, v.dose, v.timing, v.notes, v.sort_order
from public.profiles p
cross join (
  values
    ('Creatine monohydrate', '5g', 'Daily (any time, consistent)', 'Supports power / repeated efforts on court', 1),
    ('Multivitamin', '1 serving', 'With breakfast', 'General micronutrient cover on training weeks', 2),
    ('Omega-3 (fish oil)', '1–2g EPA+DHA', 'With a meal containing fat', 'Recovery and general health support', 3)
) as v(name, dose, timing, notes, sort_order)
where not exists (
  select 1 from public.supplements s where s.user_id = p.id
);
