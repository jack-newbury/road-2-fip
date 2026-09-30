export type LtaRankingRow = {
  category: string;
  rank: number;
  singles_points: number;
  doubles_points: number;
  tournaments: number;
  total_points: number;
  ranking_player_id: string | null;
};

export type LtaRankingSnapshot = {
  player_number: string;
  profile_guid: string;
  player_name: string | null;
  county: string | null;
  list_name: string;
  week_label: string | null;
  /** Preferred row used for uk_ranking (Open Male/Female when present). */
  primary: LtaRankingRow | null;
  rows: LtaRankingRow[];
  profile_url: string;
  ranking_url: string;
  synced_at: string;
};

const LTA_BASE = "https://competitions.lta.org.uk";

function cookieHeader(jar: Map<string, string>): string {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function absorbSetCookie(jar: Map<string, string>, res: Response) {
  // Node/undici may expose getSetCookie()
  const anyHeaders = res.headers as Headers & { getSetCookie?: () => string[] };
  const cookies =
    typeof anyHeaders.getSetCookie === "function"
      ? anyHeaders.getSetCookie()
      : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie")!]
        : [];
  for (const raw of cookies) {
    const part = raw.split(";")[0];
    const eq = part.indexOf("=");
    if (eq > 0) jar.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
}

async function ltaFetch(
  path: string,
  jar: Map<string, string>,
  init?: RequestInit,
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${LTA_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; RoadToFIP/1.0; +https://github.com/jack-newbury/road-2-fip)",
      Accept: "text/html,application/xhtml+xml",
      Cookie: cookieHeader(jar),
      ...(init?.headers || {}),
    },
    redirect: "follow",
  });
  absorbSetCookie(jar, res);
  return res;
}

/** Accept cookie wall so ranking HTML is public. */
async function acceptCookies(jar: Map<string, string>) {
  await ltaFetch("/cookiewall/Save", jar, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "ReturnUrl=%2Franking%2F&SettingsOpen=false&CookiePurposes=1&CookiePurposes=2",
  });
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export async function resolveLtaProfileGuid(
  playerNumber: string,
): Promise<{ guid: string; name: string | null } | null> {
  const jar = new Map<string, string>();
  await acceptCookies(jar);
  const res = await ltaFetch(
    `/find/player?q=${encodeURIComponent(playerNumber)}`,
    jar,
  );
  if (!res.ok) {
    throw new Error(`LTA player search failed (${res.status}).`);
  }
  const html = await res.text();
  // Prefer the card that explicitly shows (playerNumber)
  const cardRe =
    /href="\/player-profile\/([A-Fa-f0-9-]{36})"[^>]*>[\s\S]{0,1200}?\((\d{6,})\)/gi;
  let match: RegExpExecArray | null;
  while ((match = cardRe.exec(html))) {
    if (match[2] === playerNumber) {
      const chunk = match[0];
      const name =
        chunk.match(/nav-link__value">([^<]+)/)?.[1]?.trim() ||
        chunk.match(/>([A-Z][^<]{1,60})<\/span>/)?.[1]?.trim() ||
        null;
      return { guid: match[1], name };
    }
  }
  // Fallback: first profile link on the page
  const first = html.match(/href="\/player-profile\/([A-Fa-f0-9-]{36})"/i);
  if (!first) return null;
  return { guid: first[1], name: null };
}

function parseRankingRows(html: string): {
  listName: string;
  weekLabel: string | null;
  rows: LtaRankingRow[];
} {
  const listName =
    html.match(/LTA Padel Rankings/i)?.[0] || "LTA Padel Rankings";
  const weekLabel =
    html.match(/\b(\d{1,2}-\d{4})\b/)?.[1] ||
    html.match(/Publication[^<]{0,40}?(\d{1,2}-\d{4})/i)?.[1] ||
    null;

  const rows: LtaRankingRow[] = [];
  // Each category row in the ranking table
  const rowRe =
    /<tr>\s*<th[^>]*>\s*<a href="\/ranking\/player\.aspx\?id=\d+&(?:amp;)?player=(\d+)">([^<]+)<\/a>[\s\S]*?<\/th>\s*<td[^>]*>\s*<a[^>]*>\s*(\d+)\s*<\/a>[\s\S]*?<\/td>\s*<td[^>]*>\s*([\d.]+)\s*<\/td>\s*<td[^>]*>\s*([\d.]+)\s*<\/td>\s*<td[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*>\s*([\d.]+)\s*<\/td>/gi;

  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(html))) {
    rows.push({
      ranking_player_id: m[1],
      category: m[2].trim(),
      rank: Number(m[3]),
      singles_points: Number(m[4]),
      doubles_points: Number(m[5]),
      tournaments: Number(m[6]),
      total_points: Number(m[7]),
    });
  }

  return { listName, weekLabel, rows };
}

function pickPrimary(rows: LtaRankingRow[]): LtaRankingRow | null {
  if (!rows.length) return null;
  const open = rows.find((r) => /^Open\s+(Male|Female)$/i.test(r.category));
  return open || rows[0];
}

export async function fetchLtaRanking(
  playerNumber: string,
  knownGuid?: string | null,
): Promise<LtaRankingSnapshot> {
  const number = playerNumber.trim();
  if (!/^\d{6,}$/.test(number)) {
    throw new Error("LTA player number should be digits only (e.g. 136873792).");
  }

  const jar = new Map<string, string>();
  await acceptCookies(jar);

  let guid = knownGuid?.trim() || null;
  let playerName: string | null = null;
  if (!guid) {
    const resolved = await resolveLtaProfileGuid(number);
    if (!resolved) {
      throw new Error(
        `No LTA player found for number ${number}. Check the number on competitions.lta.org.uk.`,
      );
    }
    guid = resolved.guid;
    playerName = resolved.name;
  }

  const rankingUrl = `${LTA_BASE}/player-profile/${guid}/ranking`;
  const profileUrl = `${LTA_BASE}/player-profile/${guid}`;
  const res = await ltaFetch(`/player-profile/${guid}/ranking`, jar);
  if (!res.ok) {
    throw new Error(`LTA ranking page failed (${res.status}).`);
  }
  const html = await res.text();

  if (!playerName) {
    playerName =
      html.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i)?.[1]?.trim() || null;
  }
  const countyMatch = stripTags(html).match(
    new RegExp(`${number}\\)\\s*([A-Za-z][A-Za-z\\s'-]{2,40})`),
  );
  const county = countyMatch?.[1]?.trim() || null;

  const { listName, weekLabel, rows } = parseRankingRows(html);
  const primary = pickPrimary(rows);

  return {
    player_number: number,
    profile_guid: guid,
    player_name: playerName,
    county,
    list_name: listName,
    week_label: weekLabel,
    primary,
    rows,
    profile_url: profileUrl,
    ranking_url: rankingUrl,
    synced_at: new Date().toISOString(),
  };
}
