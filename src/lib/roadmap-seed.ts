import type { SkillCategory } from "./types";

export type SeedSkill = {
  phase: 1 | 2 | 3;
  category: SkillCategory;
  title: string;
  description: string;
  drill_hint: string;
  sort_order: number;
};

/** Canonical curriculum — also mirrored in supabase/seed.sql */
export const ROADMAP_SEED: SeedSkill[] = [
  // Phase 1 — Foundations
  {
    phase: 1,
    category: "technique",
    title: "Reliable forehand & backhand from mid-court",
    description:
      "Clean contact and directional control under moderate pace — the base for every other shot.",
    drill_hint: "Cross-court rallies focusing on height over the net and depth.",
    sort_order: 1,
  },
  {
    phase: 1,
    category: "technique",
    title: "Serve consistency (first ball in)",
    description:
      "Get 80%+ first serves in with a clear target (body / T / wide) rather than pace.",
    drill_hint: "Bucket serves: 20 to each target zone before adding spin.",
    sort_order: 2,
  },
  {
    phase: 1,
    category: "technique",
    title: "Return patterns — deep and neutral",
    description:
      "Neutralise strong serves; avoid floaters that invite smash.",
    drill_hint: "Return to the server’s feet / middle, then recover to ready.",
    sort_order: 3,
  },
  {
    phase: 1,
    category: "technique",
    title: "Lob — height, depth, and disguise",
    description:
      "Build a reliable defensive and offensive lob; hide intent until late so opponents can’t camp under it.",
    drill_hint: "Feed mid-court; lob cross and down the line aiming for the back glass.",
    sort_order: 4,
  },
  {
    phase: 1,
    category: "technique",
    title: "Volley fundamentals (forehand & backhand)",
    description:
      "Compact punch volleys at the net — block pace, take early, and keep the ball low.",
    drill_hint: "Partner feeds soft then firm; volley to feet then recover split-step.",
    sort_order: 5,
  },
  {
    phase: 1,
    category: "technique",
    title: "Bandeja basics",
    description:
      "Defensive-offensive overhead that keeps you at net without forcing winners.",
    drill_hint: "Lob feed → bandeja cross-court, recover split-step.",
    sort_order: 6,
  },
  {
    phase: 1,
    category: "technique",
    title: "Víbora introduction",
    description:
      "Side-spin overhead to open the court; distinguish when bandeja vs víbora.",
    drill_hint: "Shadow + soft feed focusing on grip and contact point.",
    sort_order: 7,
  },
  {
    phase: 1,
    category: "technique",
    title: "Wall defence — back glass",
    description:
      "Read bounce off glass; stay balanced and rebuild the rally.",
    drill_hint: "Partner feeds deep; you play off glass to lob or rebuild.",
    sort_order: 8,
  },
  {
    phase: 1,
    category: "technique",
    title: "Wall defence — side / parallel glass",
    description:
      "Handle balls that skim or bounce off the side wall without opening the middle.",
    drill_hint: "Feed parallel; take side-wall balls early or after bounce to a safe lob/rebuild.",
    sort_order: 9,
  },
  {
    phase: 1,
    category: "tactics",
    title: "Court positioning & diamond shape",
    description:
      "Know your side, cover the middle, and move as a unit with your partner.",
    drill_hint: "Video one club set; mark where you stood on each point.",
    sort_order: 10,
  },
  {
    phase: 1,
    category: "tactics",
    title: "When to lob vs drive",
    description:
      "Use lob to reset net pressure; drive when opponents are deep.",
    drill_hint: "Constraint game: only lob when both opponents are at net.",
    sort_order: 11,
  },
  {
    phase: 1,
    category: "physical",
    title: "Aerobic base for long sessions",
    description:
      "Handle 90–120 min court blocks without technique collapse.",
    drill_hint: "2× zone-2 cardio sessions (bike/run) of 30–40 min weekly.",
    sort_order: 12,
  },
  {
    phase: 1,
    category: "physical",
    title: "Shoulder & rotator cuff resilience",
    description:
      "Protect overhead volume — critical for bandeja/víbora longevity.",
    drill_hint: "Band external rotations + face pulls 3×/week.",
    sort_order: 13,
  },
  {
    phase: 1,
    category: "physical",
    title: "Lateral agility & split-step",
    description: "Explode to wide balls and recover to centre.",
    drill_hint: "Ladder + lateral bounds before court sessions.",
    sort_order: 14,
  },
  {
    phase: 1,
    category: "mental",
    title: "Point-by-point reset",
    description:
      "Drop the last error; play the next ball with a clear intention.",
    drill_hint: "After every point, say one cue word before the next serve.",
    sort_order: 15,
  },
  {
    phase: 1,
    category: "competition",
    title: "Northampton club match rhythm",
    description:
      "Play regular club sets locally — build match toughness before travelling.",
    drill_hint: "Book 1–2 competitive club sessions per week at your home club.",
    sort_order: 16,
  },
  {
    phase: 1,
    category: "competition",
    title: "First club / box league events",
    description:
      "Enter low-stakes local events to learn formats, scoring pressure, and partnering.",
    drill_hint: "Target one club box or social tournament this quarter.",
    sort_order: 17,
  },
  {
    phase: 1,
    category: "mental",
    title: "Warm-up routine you own",
    description:
      "Same 10–12 min activation every session so competition feels familiar.",
    drill_hint: "Write and stick to a fixed warm-up checklist.",
    sort_order: 18,
  },

  // Phase 2 — UK ladder (shot arsenal expands)
  {
    phase: 2,
    category: "technique",
    title: "Flat smash (remate) — finish short lobs",
    description:
      "Kill high, short lobs with a flat overhead when the bounce-out or putaway is on.",
    drill_hint: "Soft lob feed into the service box; aim 8/10 winners without spraying long.",
    sort_order: 1,
  },
  {
    phase: 2,
    category: "technique",
    title: "Kick smash — topspin bounce-out",
    description:
      "Topspin overhead that kicks high off the back glass so opponents can’t rebuild.",
    drill_hint: "Brush up on contact; aim deep middle so the ball jumps over the fence/glass.",
    sort_order: 2,
  },
  {
    phase: 2,
    category: "technique",
    title: "Rulo / gancho — around-the-head finish",
    description:
      "Slice/hook overhead from a closed or awkward shoulder position when a flat smash isn’t available.",
    drill_hint: "Feed slightly behind you; rulo cross-court and recover without over-rotating.",
    sort_order: 3,
  },
  {
    phase: 2,
    category: "technique",
    title: "Aggressive vibora & overhead selection",
    description:
      "Choose bandeja vs víbora vs flat vs kick vs rulo in under a second — pressure without forced errors.",
    drill_hint: "Mixed high-ball feeds; call the shot before contact, then execute.",
    sort_order: 4,
  },
  {
    phase: 2,
    category: "technique",
    title: "Bajada — attack from deep after the bounce",
    description:
      "Drive or cut aggressively from the back after the ball bounces (often off glass) to seize the initiative.",
    drill_hint: "Deep feed off glass; take a bajada to the feet or open court, then move forward.",
    sort_order: 5,
  },
  {
    phase: 2,
    category: "technique",
    title: "Chiquita & low volleys",
    description:
      "Keep balls at opponents’ feet from the net to force weak replies.",
    drill_hint: "Soft feed to feet; aim for second bounce before service line.",
    sort_order: 6,
  },
  {
    phase: 2,
    category: "technique",
    title: "Drop shot (dejarla)",
    description:
      "Soft touch that dies at the net — punish deep opponents and break rhythm.",
    drill_hint: "From mid-court after a high ball, drop short cross; only when they are deep.",
    sort_order: 7,
  },
  {
    phase: 2,
    category: "technique",
    title: "Counter-lob under pressure",
    description:
      "Survive smash pressure with height and depth, not panic.",
    drill_hint: "Partner smashes; you only counter-lob deep cross.",
    sort_order: 8,
  },
  {
    phase: 2,
    category: "technique",
    title: "Transition defence → net",
    description:
      "Move forward as a pair after a deep lob or weak reply.",
    drill_hint: "Constraint: after every successful lob, both must reach net.",
    sort_order: 9,
  },
  {
    phase: 2,
    category: "tactics",
    title: "Serve + 1 patterns",
    description:
      "Plan the first two shots of every point with your partner.",
    drill_hint: "Pre-agree three serve+1 patterns and use only those in a set.",
    sort_order: 10,
  },
  {
    phase: 2,
    category: "tactics",
    title: "Exploiting the weaker opponent",
    description:
      "Identify and pressure the lower-level player without tunnel vision.",
    drill_hint: "Post-match note: who did you target and did it work?",
    sort_order: 11,
  },
  {
    phase: 2,
    category: "tactics",
    title: "Switching & poaching communication",
    description:
      "Verbal cues and trust so you cover middle without collisions.",
    drill_hint: "Practice ‘mine/yours/switch’ calls in every warm-up point.",
    sort_order: 12,
  },
  {
    phase: 2,
    category: "physical",
    title: "Periodised gym — strength block",
    description:
      "Lower-body and rotational power for tournament weeks.",
    drill_hint: "2 strength sessions focusing squat/hinge/rotational med-ball.",
    sort_order: 13,
  },
  {
    phase: 2,
    category: "physical",
    title: "In-season recovery discipline",
    description:
      "Sleep, mobility, and load management when playing multiple events/month.",
    drill_hint: "Log recovery every tournament weekend; protect Monday rest.",
    sort_order: 14,
  },
  {
    phase: 2,
    category: "mental",
    title: "Competitive partner chemistry",
    description:
      "Fixed or semi-fixed partner for ranking events; shared language and roles.",
    drill_hint: "Agree roles (server patterns, who takes middle) before each event.",
    sort_order: 15,
  },
  {
    phase: 2,
    category: "mental",
    title: "Handling bad calls & momentum swings",
    description:
      "Stay process-focused when a set flips 2–2 to 2–5.",
    drill_hint: "Timeout routine: breath + one tactical adjust + next point cue.",
    sort_order: 16,
  },
  {
    phase: 2,
    category: "competition",
    title: "Midlands regional tournament circuit",
    description:
      "Travel within the Midlands for stronger opposition and ranking exposure.",
    drill_hint: "Plan a quarterly Midlands event calendar from Northampton.",
    sort_order: 17,
  },
  {
    phase: 2,
    category: "competition",
    title: "LTA / national ranking event entries",
    description:
      "Start collecting national ranking points; learn draw formats and seeding.",
    drill_hint: "Enter first graded national event; note ranking points earned.",
    sort_order: 18,
  },
  {
    phase: 2,
    category: "competition",
    title: "Trajectory toward UK top 300–150",
    description:
      "Track ranking after each event; set volume targets for points.",
    drill_hint: "Update UK ranking in Profile after every ranking list refresh.",
    sort_order: 19,
  },

  // Phase 3 — Top 100 + FIP
  {
    phase: 3,
    category: "competition",
    title: "National calendar volume",
    description:
      "Consistent national events — points come from volume + deep runs.",
    drill_hint: "Block 1–2 national weekends per month in season.",
    sort_order: 1,
  },
  {
    phase: 3,
    category: "competition",
    title: "Push into UK top 100",
    description:
      "Secondary goal: crack the UK top 100 through ranking events and results.",
    drill_hint: "Set milestone ranks (200 → 150 → 100) with target dates.",
    sort_order: 2,
  },
  {
    phase: 3,
    category: "competition",
    title: "FIP Promotion / Rise pathway awareness",
    description:
      "Understand entry criteria, wildcards, and qualifying routes for first FIP event.",
    drill_hint: "Research next accessible FIP Promotion; note entry window.",
    sort_order: 3,
  },
  {
    phase: 3,
    category: "competition",
    title: "First FIP points",
    description:
      "Primary goal: earn your first official FIP ranking points.",
    drill_hint: "Peak for one target FIP event; taper gym the week before.",
    sort_order: 4,
  },
  {
    phase: 3,
    category: "tactics",
    title: "Peak-week tournament templates",
    description:
      "Know exactly what court, gym, and recovery look like 7 days out.",
    drill_hint: "Write a peak-week checklist and reuse it for every A-event.",
    sort_order: 5,
  },
  {
    phase: 3,
    category: "tactics",
    title: "Scouting stronger pairs",
    description:
      "Watch top UK pairs’ patterns; adapt returns and lob height.",
    drill_hint: "Film or note one top-100 pair’s serve+1 each month.",
    sort_order: 6,
  },
  {
    phase: 3,
    category: "technique",
    title: "Salida de pared — attack after the glass",
    description:
      "Turn wall defence into offence: step in after the bounce and drive or lob with intent.",
    drill_hint: "Deep smash feed; play off glass then immediately attack the next ball.",
    sort_order: 7,
  },
  {
    phase: 3,
    category: "technique",
    title: "High-percentage finishing under fatigue",
    description:
      "Convert short balls late in third sets without spraying — choose the right finish shot.",
    drill_hint: "End practice with ‘finish 8/10’ short-ball challenges (flat / kick / rulo).",
    sort_order: 8,
  },
  {
    phase: 3,
    category: "technique",
    title: "Shot variety & change of pace",
    description:
      "Mix bandeja, víbora, bajada, drop, and smash options so ranked opponents can’t sit on one pattern.",
    drill_hint: "Add one ‘chaos’ set per week with forced variety — no two identical finishes.",
    sort_order: 9,
  },
  {
    phase: 3,
    category: "physical",
    title: "Tournament-ready conditioning",
    description:
      "Repeat high-intensity efforts across multi-match days.",
    drill_hint: "Court-specific intervals: 4× 4-min high effort, 2-min easy.",
    sort_order: 10,
  },
  {
    phase: 3,
    category: "physical",
    title: "Injury prevention under load",
    description:
      "Manage shoulder, knee, and lower-back load across a national calendar.",
    drill_hint: "Weekly physio/mobility block non-negotiable in season.",
    sort_order: 11,
  },
  {
    phase: 3,
    category: "mental",
    title: "Big-match routines",
    description:
      "Pre-match visualisation, partner huddle, and emotional regulation.",
    drill_hint: "Same arrival timeline for every ranking final / FIP day.",
    sort_order: 12,
  },
  {
    phase: 3,
    category: "mental",
    title: "Long-horizon patience",
    description:
      "Trust the 3-year arc — ranking climbs are noisy week to week.",
    drill_hint: "Monthly review: process metrics over single results.",
    sort_order: 13,
  },
];
