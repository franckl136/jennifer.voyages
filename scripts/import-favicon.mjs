/**
 * Copie le PNG favicon (fond inclus) depuis assets Cursor → app/icon.png + app/apple-icon.png
 * Cherche un fichier dont le nom contient "favicon".
 *
 * Usage : node scripts/import-favicon.mjs
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

function pickFaviconPng(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.png$/i.test(f))
    .map((name) => ({
      name,
      full: path.join(dir, name),
      mtime: fs.statSync(path.join(dir, name)).mtimeMs,
    }));

  const named = files.filter((f) => /favicon/i.test(f.name));
  const list = named.length ? named : files;
  if (!list.length) return null;
  list.sort((a, b) => b.mtime - a.mtime);
  return list[0].full;
}

const srcPath = candidates.map(pickFaviconPng).find(Boolean);

if (!srcPath) {
  console.error(
    "Aucun PNG favicon trouvé (nom contenant « favicon »). Placez le fichier dans assets ou app/icon.png manuellement.",
  );
  process.exit(1);
}

const destIcon = path.join(root, "app", "icon.png");
const destApple = path.join(root, "app", "apple-icon.png");
const legacyIco = path.join(root, "app", "favicon.ico");

fs.copyFileSync(srcPath, destIcon);
fs.copyFileSync(srcPath, destApple);

if (fs.existsSync(legacyIco)) {
  fs.unlinkSync(legacyIco);
  console.log(
    "Supprimé app/favicon.ico (favicon Next par défaut — il masquait icon.png).",
  );
}
console.log("Favicon copié depuis :\n", srcPath);
console.log("→ app/icon.png, app/apple-icon.png");
