export type KourtosOverview = {
  total_sessions: number;
  games_count: number;
  lesson_count: number;
  tournament_count: number;
  league_count: number;
  wins: number;
  losses: number;
  win_rate: number | null;
  total_spend_gbp: string;
  my_total_spend_gbp: string;
  playtomic_level_value: string | null;
  playtomic_level_confidence: string | null;
  auth_mode?: "partner" | "user";
};

export type KourtosMatchPlayer = {
  name: string;
  team: number;
  is_me: boolean;
  playtomic_level_value?: string | null;
};

export type KourtosMatch = {
  id: string;
  started_at: string;
  activity_type: string;
  competition_mode: string | null;
  won: boolean | null;
  venue_name?: string | null;
  court_name?: string | null;
  source?: string | null;
  players?: KourtosMatchPlayer[];
  sets?: { set_number: number; team1_games: number; team2_games: number }[];
};

export type KourtosConfig = {
  apiBase: string;
  partnerToken?: string;
  playerId?: string;
  playerName?: string;
  email?: string;
  password?: string;
  accessToken?: string;
};

type PartnerResult = {
  fixtureid: string;
  date: string;
  time: string;
  player_a1: string;
  id_a1: string;
  player_a2: string;
  id_a2: string;
  player_b1: string;
  id_b1: string;
  player_b2: string;
  id_b2: string;
  games_score: string;
  result: string;
  matchtype: string;
  format: string;
  matchstatus: string;
  club_a1?: string;
};

function isPartnerKey(token: string): boolean {
  return token.startsWith("kos_live_");
}

export function getKourtosConfig(): KourtosConfig | null {
  const apiBase = (
    process.env.KOURTOS_API_BASE || "https://app.kourtos.com/api/v1"
  ).replace(/\/$/, "");

  const partnerToken =
    process.env.KOURTOS_PARTNER_API_TOKEN?.trim() ||
    (process.env.KOURTOS_ACCESS_TOKEN?.trim() &&
    isPartnerKey(process.env.KOURTOS_ACCESS_TOKEN.trim())
      ? process.env.KOURTOS_ACCESS_TOKEN.trim()
      : undefined);

  const accessToken =
    process.env.KOURTOS_ACCESS_TOKEN?.trim() &&
    !isPartnerKey(process.env.KOURTOS_ACCESS_TOKEN.trim())
      ? process.env.KOURTOS_ACCESS_TOKEN.trim()
      : undefined;

  const email = process.env.KOURTOS_EMAIL?.trim() || undefined;
  const password = process.env.KOURTOS_PASSWORD || undefined;
  const playerId = process.env.KOURTOS_PLAYER_ID?.trim() || undefined;
  const playerName = process.env.KOURTOS_PLAYER_NAME?.trim() || undefined;

  if (!partnerToken && !accessToken && !(email && password)) {
    return null;
  }

  return {
    apiBase,
    partnerToken,
    playerId,
    playerName,
    email,
    password,
    accessToken,
  };
}

function extractAccessCookie(setCookieHeaders: string[]): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(/(?:^|,\s*)pt_access=([^;]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return null;
}

async function loginForUserToken(config: KourtosConfig): Promise<string> {
  if (config.accessToken) return config.accessToken;

  const res = await fetch(`${config.apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: config.email, password: config.password }),
  });

  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie")!]
        : [];

  const body = (await res.json().catch(() => ({}))) as {
    requires_2fa?: boolean;
    access_token?: string;
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    throw new Error(
      body.message || body.error || `Kourtos login failed (${res.status})`,
    );
  }

  if (body.requires_2fa) {
    throw new Error(
      "Kourtos account requires 2FA. Prefer KOURTOS_PARTNER_API_TOKEN (kos_live_…), or set a user JWT in KOURTOS_ACCESS_TOKEN.",
    );
  }

  if (body.access_token) return body.access_token;

  const fromCookie = extractAccessCookie(setCookies);
  if (fromCookie) return fromCookie;

  throw new Error(
    "Kourtos login succeeded but no access token was returned. Use KOURTOS_PARTNER_API_TOKEN instead.",
  );
}

async function kourtosFetch<T>(
  path: string,
  token: string,
  apiBase: string,
  mode: "partner" | "user",
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  if (mode === "partner") {
    headers["X-Api-Key"] = token;
  }

  const res = await fetch(`${apiBase}${path}`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Kourtos ${path} failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }

  return res.json() as Promise<T>;
}

type PaginatedMatches = {
  items?: KourtosMatch[];
  data?: KourtosMatch[];
  matches?: KourtosMatch[];
};

function normalizeMatches(
  payload: PaginatedMatches | KourtosMatch[],
): KourtosMatch[] {
  if (Array.isArray(payload)) return payload;
  return payload.items || payload.data || payload.matches || [];
}

function normName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function involvesPlayer(
  row: PartnerResult,
  playerId?: string,
  playerName?: string,
): { team: 1 | 2 } | null {
  const ids = [
    { id: row.id_a1, team: 1 as const },
    { id: row.id_a2, team: 1 as const },
    { id: row.id_b1, team: 2 as const },
    { id: row.id_b2, team: 2 as const },
  ];
  const names = [
    { name: row.player_a1, team: 1 as const },
    { name: row.player_a2, team: 1 as const },
    { name: row.player_b1, team: 2 as const },
    { name: row.player_b2, team: 2 as const },
  ];

  if (playerId) {
    const hit = ids.find((p) => p.id && p.id === playerId);
    if (hit) return { team: hit.team };
  }

  if (playerName) {
    const want = normName(playerName);
    const hit = names.find((p) => p.name && normName(p.name) === want);
    if (hit) return { team: hit.team };
    const soft = names.find(
      (p) => p.name && normName(p.name).includes(want),
    );
    if (soft) return { team: soft.team };
  }

  return null;
}

function parseSets(result: string): {
  set_number: number;
  team1_games: number;
  team2_games: number;
}[] {
  return result
    .split(/\s+/)
    .map((chunk, i) => {
      const m = chunk.match(/^(\d+)-(\d+)/);
      if (!m) return null;
      return {
        set_number: i + 1,
        team1_games: Number(m[1]),
        team2_games: Number(m[2]),
      };
    })
    .filter((s): s is NonNullable<typeof s> => s != null);
}

function wonFromGamesScore(gamesScore: string, team: 1 | 2): boolean | null {
  const m = gamesScore.trim().match(/^(\d+)\s*-\s*(\d+)/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === b) return null;
  const aWon = a > b;
  return team === 1 ? aWon : !aWon;
}

function partnerRowsToSnapshot(
  rows: PartnerResult[],
  playerId?: string,
  playerName?: string,
): { overview: KourtosOverview; matches: KourtosMatch[] } {
  const mine = rows
    .map((row) => {
      const hit = involvesPlayer(row, playerId, playerName);
      if (!hit) return null;
      return { row, team: hit.team };
    })
    .filter((x): x is { row: PartnerResult; team: 1 | 2 } => x != null);

  if (!mine.length && (playerId || playerName)) {
    throw new Error(
      `Partner feed returned ${rows.length} results, but none matched KOURTOS_PLAYER_ID / KOURTOS_PLAYER_NAME. Check the id or full name used on Kourtos fixtures.`,
    );
  }

  // If no player filter, keep recent platform rows but mark won unknown
  const selected = mine.length
    ? mine
    : rows.slice(0, 15).map((row) => ({ row, team: 1 as const }));

  let wins = 0;
  let losses = 0;
  const matches: KourtosMatch[] = selected.slice(0, 25).map(({ row, team }) => {
    const won = mine.length ? wonFromGamesScore(row.games_score, team) : null;
    if (won === true) wins += 1;
    if (won === false) losses += 1;

    const players: KourtosMatchPlayer[] = [
      { name: row.player_a1, id: row.id_a1, team: 1 as const },
      { name: row.player_a2, id: row.id_a2, team: 1 as const },
      { name: row.player_b1, id: row.id_b1, team: 2 as const },
      { name: row.player_b2, id: row.id_b2, team: 2 as const },
    ]
      .filter((p) => p.name)
      .map((p) => ({
        name: p.name,
        team: p.team,
        is_me:
          (!!playerId && p.id === playerId) ||
          (!!playerName && normName(p.name) === normName(playerName)),
      }));

    const time = row.time?.length === 5 ? `${row.time}:00` : row.time || "12:00:00";
    return {
      id: row.fixtureid,
      started_at: `${row.date}T${time}Z`,
      activity_type: "match",
      competition_mode: row.matchtype?.toLowerCase().includes("competitive")
        ? "competitive"
        : "friendly",
      won,
      venue_name: row.matchtype || row.club_a1 || null,
      source: "kourtos-partner",
      players,
      sets: parseSets(row.result),
    };
  });

  const decided = wins + losses;
  return {
    overview: {
      total_sessions: matches.length,
      games_count: matches.length,
      lesson_count: 0,
      tournament_count: 0,
      league_count: 0,
      wins,
      losses,
      win_rate: decided > 0 ? wins / decided : null,
      total_spend_gbp: "0",
      my_total_spend_gbp: "0",
      playtomic_level_value: null,
      playtomic_level_confidence: null,
      auth_mode: "partner",
    },
    matches,
  };
}

async function fetchViaPartner(config: KourtosConfig): Promise<{
  overview: KourtosOverview;
  matches: KourtosMatch[];
}> {
  if (!config.partnerToken) {
    throw new Error("Missing KOURTOS_PARTNER_API_TOKEN");
  }

  const payload = await kourtosFetch<{
    source?: string;
    results: PartnerResult[];
  }>(
    "/partners/padellevels/results?limit=500",
    config.partnerToken,
    config.apiBase,
    "partner",
  );

  const rows = payload.results || [];
  if (!rows.length) {
    throw new Error("Partner API returned no results yet.");
  }

  if (!config.playerId && !config.playerName) {
    throw new Error(
      "Partner token works, but set KOURTOS_PLAYER_NAME (or KOURTOS_PLAYER_ID) so we can filter your matches from the platform feed.",
    );
  }

  return partnerRowsToSnapshot(rows, config.playerId, config.playerName);
}

async function fetchViaUser(config: KourtosConfig): Promise<{
  overview: KourtosOverview;
  matches: KourtosMatch[];
}> {
  const token = await loginForUserToken(config);
  const [overview, matchesPayload] = await Promise.all([
    kourtosFetch<KourtosOverview>("/stats/overview", token, config.apiBase, "user"),
    kourtosFetch<PaginatedMatches | KourtosMatch[]>(
      "/matches?per_page=15&sort=started_at&order=desc",
      token,
      config.apiBase,
      "user",
    ),
  ]);

  return {
    overview: { ...overview, auth_mode: "user" },
    matches: normalizeMatches(matchesPayload).slice(0, 15),
  };
}

export async function fetchKourtosSnapshot(): Promise<{
  overview: KourtosOverview;
  matches: KourtosMatch[];
}> {
  const config = getKourtosConfig();
  if (!config) {
    throw new Error(
      "Kourtos not configured. Add KOURTOS_PARTNER_API_TOKEN=kos_live_… plus KOURTOS_PLAYER_NAME (recommended), or user email/password.",
    );
  }

  // Prefer partner API key — no password / 2FA needed
  if (config.partnerToken) {
    const partnerSnap = await fetchViaPartner(config);

    // Optionally enrich Playtomic level from user session if also configured
    if (config.accessToken || (config.email && config.password)) {
      try {
        const userSnap = await fetchViaUser(config);
        partnerSnap.overview.playtomic_level_value =
          userSnap.overview.playtomic_level_value;
        partnerSnap.overview.playtomic_level_confidence =
          userSnap.overview.playtomic_level_confidence;
        partnerSnap.overview.lesson_count = userSnap.overview.lesson_count;
        partnerSnap.overview.tournament_count =
          userSnap.overview.tournament_count;
        partnerSnap.overview.league_count = userSnap.overview.league_count;
      } catch {
        // Partner sync still succeeds without Playtomic enrichment
      }
    }

    return partnerSnap;
  }

  return fetchViaUser(config);
}
