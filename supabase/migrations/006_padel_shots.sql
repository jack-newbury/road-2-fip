-- Expand roadmap with common padel shots without wiping existing skill_progress.
-- Safe to re-run: inserts by title, updates renamed skills, backfills progress.

-- Rename / refresh existing skills that were broadened
update public.roadmap_skills
set
  title = 'Aggressive vibora & overhead selection',
  description = 'Choose bandeja vs víbora vs flat vs kick vs rulo in under a second — pressure without forced errors.',
  drill_hint = 'Mixed high-ball feeds; call the shot before contact, then execute.',
  sort_order = 4
where title = 'Aggressive vibora & smash selection';

update public.roadmap_skills
set
  title = 'Shot variety & change of pace',
  description = 'Mix bandeja, víbora, bajada, drop, and smash options so ranked opponents can’t sit on one pattern.',
  drill_hint = 'Add one ‘chaos’ set per week with forced variety — no two identical finishes.',
  sort_order = 9
where title = 'Variety: bajada, drop, and change of pace';

update public.roadmap_skills
set
  description = 'Convert short balls late in third sets without spraying — choose the right finish shot.',
  drill_hint = 'End practice with ‘finish 8/10’ short-ball challenges (flat / kick / rulo).',
  sort_order = 8
where title = 'High-percentage finishing under fatigue';

-- Re-order existing phase-1 skills that shift after new inserts
update public.roadmap_skills set sort_order = 6 where title = 'Bandeja basics' and phase = 1;
update public.roadmap_skills set sort_order = 7 where title = 'Víbora introduction' and phase = 1;
update public.roadmap_skills set sort_order = 8 where title = 'Wall defence — back glass' and phase = 1;
update public.roadmap_skills set sort_order = 10 where title = 'Court positioning & diamond shape' and phase = 1;
update public.roadmap_skills set sort_order = 11 where title = 'When to lob vs drive' and phase = 1;
update public.roadmap_skills set sort_order = 12 where title = 'Aerobic base for long sessions' and phase = 1;
update public.roadmap_skills set sort_order = 13 where title = 'Shoulder & rotator cuff resilience' and phase = 1;
update public.roadmap_skills set sort_order = 14 where title = 'Lateral agility & split-step' and phase = 1;
update public.roadmap_skills set sort_order = 15 where title = 'Point-by-point reset' and phase = 1;
update public.roadmap_skills set sort_order = 16 where title = 'Northampton club match rhythm' and phase = 1;
update public.roadmap_skills set sort_order = 17 where title = 'First club / box league events' and phase = 1;
update public.roadmap_skills set sort_order = 18 where title = 'Warm-up routine you own' and phase = 1;

-- Re-order existing phase-2 skills
update public.roadmap_skills set sort_order = 6 where title = 'Chiquita & low volleys' and phase = 2;
update public.roadmap_skills set sort_order = 8 where title = 'Counter-lob under pressure' and phase = 2;
update public.roadmap_skills set sort_order = 9 where title = 'Transition defence → net' and phase = 2;
update public.roadmap_skills set sort_order = 10 where title = 'Serve + 1 patterns' and phase = 2;
update public.roadmap_skills set sort_order = 11 where title = 'Exploiting the weaker opponent' and phase = 2;
update public.roadmap_skills set sort_order = 12 where title = 'Switching & poaching communication' and phase = 2;
update public.roadmap_skills set sort_order = 13 where title = 'Periodised gym — strength block' and phase = 2;
update public.roadmap_skills set sort_order = 14 where title = 'In-season recovery discipline' and phase = 2;
update public.roadmap_skills set sort_order = 15 where title = 'Competitive partner chemistry' and phase = 2;
update public.roadmap_skills set sort_order = 16 where title = 'Handling bad calls & momentum swings' and phase = 2;
update public.roadmap_skills set sort_order = 17 where title = 'Midlands regional tournament circuit' and phase = 2;
update public.roadmap_skills set sort_order = 18 where title = 'LTA / national ranking event entries' and phase = 2;
update public.roadmap_skills set sort_order = 19 where title = 'Trajectory toward UK top 300–150' and phase = 2;

-- Re-order existing phase-3 skills
update public.roadmap_skills set sort_order = 8 where title = 'High-percentage finishing under fatigue' and phase = 3;
update public.roadmap_skills set sort_order = 10 where title = 'Tournament-ready conditioning' and phase = 3;
update public.roadmap_skills set sort_order = 11 where title = 'Injury prevention under load' and phase = 3;
update public.roadmap_skills set sort_order = 12 where title = 'Big-match routines' and phase = 3;
update public.roadmap_skills set sort_order = 13 where title = 'Long-horizon patience' and phase = 3;

-- Insert new shot skills (skip if already present by title)
insert into public.roadmap_skills (phase, category, title, description, drill_hint, sort_order)
select * from (values
  (1::smallint, 'technique', 'Lob — height, depth, and disguise',
   'Build a reliable defensive and offensive lob; hide intent until late so opponents can’t camp under it.',
   'Feed mid-court; lob cross and down the line aiming for the back glass.', 4),
  (1::smallint, 'technique', 'Volley fundamentals (forehand & backhand)',
   'Compact punch volleys at the net — block pace, take early, and keep the ball low.',
   'Partner feeds soft then firm; volley to feet then recover split-step.', 5),
  (1::smallint, 'technique', 'Wall defence — side / parallel glass',
   'Handle balls that skim or bounce off the side wall without opening the middle.',
   'Feed parallel; take side-wall balls early or after bounce to a safe lob/rebuild.', 9),
  (2::smallint, 'technique', 'Flat smash (remate) — finish short lobs',
   'Kill high, short lobs with a flat overhead when the bounce-out or putaway is on.',
   'Soft lob feed into the service box; aim 8/10 winners without spraying long.', 1),
  (2::smallint, 'technique', 'Kick smash — topspin bounce-out',
   'Topspin overhead that kicks high off the back glass so opponents can’t rebuild.',
   'Brush up on contact; aim deep middle so the ball jumps over the fence/glass.', 2),
  (2::smallint, 'technique', 'Rulo / gancho — around-the-head finish',
   'Slice/hook overhead from a closed or awkward shoulder position when a flat smash isn’t available.',
   'Feed slightly behind you; rulo cross-court and recover without over-rotating.', 3),
  (2::smallint, 'technique', 'Bajada — attack from deep after the bounce',
   'Drive or cut aggressively from the back after the ball bounces (often off glass) to seize the initiative.',
   'Deep feed off glass; take a bajada to the feet or open court, then move forward.', 5),
  (2::smallint, 'technique', 'Drop shot (dejarla)',
   'Soft touch that dies at the net — punish deep opponents and break rhythm.',
   'From mid-court after a high ball, drop short cross; only when they are deep.', 7),
  (3::smallint, 'technique', 'Salida de pared — attack after the glass',
   'Turn wall defence into offence: step in after the bounce and drive or lob with intent.',
   'Deep smash feed; play off glass then immediately attack the next ball.', 7)
) as v(phase, category, title, description, drill_hint, sort_order)
where not exists (
  select 1 from public.roadmap_skills s where s.title = v.title
);

-- Backfill progress rows for every profile + new skill
insert into public.skill_progress (user_id, skill_id, status)
select p.id, s.id, 'todo'
from public.profiles p
cross join public.roadmap_skills s
on conflict (user_id, skill_id) do nothing;
