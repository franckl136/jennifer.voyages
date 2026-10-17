/**
 * Copie le logo depuis assets Cursor → public/images/logo.png
 * (favicon avec fond : node scripts/import-favicon.mjs)
 *
 * Priorité :
 * 1. PNG dont le nom contient "JV2" (logo pied de page / version actuelle)
 * 2. Sinon "removebg" (sans fond)
 * 3. Sinon "JV" / "_images_jv"
 * 4. Sinon le PNG le plus récent
 *
 * Usage : node scripts/import-logo.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const candidates = [
  path.join(
    process.env.USERPROFILE || "",
    ".cursor",
    "projects",
    "d-DEV-jennifer-voyages",
    "assets",
  ),
  path.join(root, "assets"),
];

function pickLogoFile(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.png$/i.test(f))
    .map((name) => ({
      name,
      full: path.join(dir, name),
      mtime: fs.statSync(path.join(dir, name)).mtimeMs,
    }));

  if (!files.length) return null;

  const jv2 = files.filter((f) => /jv2/i.test(f.name));
  if (jv2.length) {
    jv2.sort((a, b) => b.mtime - a.mtime);
    return jv2[0].full;
  }

  const removebg = files.filter((f) => /removebg|remove-bg/i.test(f.name));
  if (removebg.length) {
    removebg.sort((a, b) => b.mtime - a.mtime);
    return removebg[0].full;
  }

  const jv = files.filter(
    (f) =>
      /(^|[^a-z])jv([^a-z]|$)/i.test(f.name) || /_images_jv/i.test(f.name),
  );
  if (jv.length) {
    jv.sort((a, b) => b.mtime - a.mtime);
    return jv[0].full;
  }

  files.sort((a, b) => b.mtime - a.mtime);
  return files[0].full;
}

let srcPath = null;
for (const dir of candidates) {
  if (!fs.existsSync(dir)) continue;
  srcPath = pickLogoFile(dir);
  if (srcPath) break;
}

if (!srcPath) {
  console.error(
    "Aucun PNG trouvé. Placez logo.png dans public/images/ manuellement.",
  );
  process.exit(1);
}

const destLogo = path.join(root, "public", "images", "logo.png");

fs.mkdirSync(path.dirname(destLogo), { recursive: true });
fs.copyFileSync(srcPath, destLogo);
console.log("Logo copié depuis :\n", srcPath);
