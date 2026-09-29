-- Kourtos sync cache on profiles
alter table public.profiles
  add column if not exists playtomic_level numeric,
  add column if not exists playtomic_level_confidence numeric,
  add column if not exists kourtos_overview jsonb,
  add column if not exists kourtos_recent_matches jsonb,
  add column if not exists kourtos_synced_at timestamptz;
