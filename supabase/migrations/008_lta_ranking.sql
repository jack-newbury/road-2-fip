-- LTA Padel ranking sync on profiles
alter table public.profiles
  add column if not exists lta_player_number text,
  add column if not exists lta_profile_guid text,
  add column if not exists lta_ranking jsonb,
  add column if not exists lta_synced_at timestamptz;
