-- AI recaps history
create table if not exists public.recaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  period text not null check (period in ('week', 'month')),
  period_start date not null,
  period_end date not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists recaps_user_created_idx
  on public.recaps (user_id, created_at desc);

alter table public.recaps enable row level security;

create policy "recaps_own" on public.recaps
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
