/**
 * Import the migrated posts (seed/posts/*.json, produced by scripts/html-to-lexical.py from the
 * previous site's content) into Payload. `npm run seed` uses the local D1; existing slugs are
 * skipped, so it's safe to run more than once.
 */
import config from "@payload-config";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getPayload } from "payload";

const dir = join(process.cwd(), "seed/posts");
const payload = await getPayload({ config });

let created = 0;
let skipped = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const post = JSON.parse(readFileSync(join(dir, file), "utf8"));
  const existing = await payload.find({ collection: "posts", where: { slug: { equals: post.slug } }, limit: 1, depth: 0 });
  if (existing.docs.length) {
    skipped++;
    continue;
  }
  await payload.create({ collection: "posts", data: { ...post, _status: "published" }, draft: false });
  created++;
  if (created % 20 === 0) payload.logger.info(`… ${created} posts imported`);
}
payload.logger.info(`Seed done: ${created} created, ${skipped} already there.`);
process.exit(0);
