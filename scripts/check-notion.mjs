/**
 * Diagnostic Notion (API data sources) : schéma + articles listés.
 *
 * Usage : node scripts/check-notion.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const p = path.join(root, ".env.local");
  if (!fs.existsSync(p)) {
    console.error("Fichier .env.local introuvable à la racine du projet.");
    process.exit(1);
  }
  const txt = fs.readFileSync(p, "utf8");
  for (const line of txt.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const {
  listBlogPosts,
  getDatabaseId,
  isNotionConfigured,
  resolveBlogDataSource,
} = await import(pathToFileURL(path.join(root, "lib", "notion.js")).href);

async function main() {
  if (!isNotionConfigured()) {
    console.error("NOTION_TOKEN ou NOTION_DATABASE_ID manquant dans .env.local");
    process.exit(1);
  }

  console.log("NOTION_DATABASE_ID (normalisé) :", getDatabaseId());
  if (process.env.NOTION_DATA_SOURCE_ID) {
    console.log("NOTION_DATA_SOURCE_ID :", process.env.NOTION_DATA_SOURCE_ID);
  }

  try {
    const { dataSourceId, schema } = await resolveBlogDataSource();
    console.log("data_source_id utilisé :", dataSourceId);
    console.log("Propriétés (schéma data source) :");
    for (const cfg of Object.values(schema.properties)) {
      console.log(`  - ${cfg.name} (${cfg.type})`);
    }
  } catch (e) {
    console.error("resolveBlogDataSource :", e?.message || e);
    process.exit(1);
  }

  try {
    const posts = await listBlogPosts();
    console.log(`Articles listés (publiés) : ${posts.length}`);
    for (const p of posts) {
      console.log(`  · ${p.title} → /blog/${p.slug}`);
    }
  } catch (e) {
    console.error("listBlogPosts :", e?.message || e);
    process.exit(1);
  }
}

main();
