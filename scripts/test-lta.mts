import { fetchLtaRanking, resolveLtaProfileGuid } from "../src/lib/lta/client.ts";

async function main() {
  const resolved = await resolveLtaProfileGuid("136873792");
  console.log("resolved", resolved);
  const snap = await fetchLtaRanking("136873792", resolved?.guid);
  console.log(JSON.stringify(snap, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
