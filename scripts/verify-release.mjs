import { readFile } from "node:fs/promises";
import vm from "node:vm";

const pkg = JSON.parse(await readFile("package.json", "utf8"));
if (pkg.version !== "1.5.2") throw new Error(`Unexpected release version: ${pkg.version}`);

const manifest = JSON.parse(await readFile("manifest.webmanifest", "utf8"));
for (const key of ["name", "short_name", "start_url", "display", "icons"]) {
  if (!manifest[key]) throw new Error(`Manifest missing: ${key}`);
}
if (!manifest.icons.length) throw new Error("Manifest has no icons");

const capacitor = JSON.parse(await readFile("capacitor.config.json", "utf8"));
if (capacitor.webDir !== "www") throw new Error("Capacitor webDir must be www");

const html = await readFile("index.html", "utf8");
const scripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(m => m[1]).filter(Boolean);
if (!scripts.length) throw new Error("No inline application scripts found");
scripts.forEach((code, i) => {
  try { new vm.Script(code, { filename: `index.html#script-${i + 1}` }); }
  catch (error) { throw new Error(`JavaScript syntax error in script ${i + 1}: ${error.message}`); }
});

const sw = await readFile("sw.js", "utf8");
if (!sw.includes("self.addEventListener")) throw new Error("Service worker registration missing");
if (!sw.includes("lifeos-v1-5-2")) throw new Error("Service worker cache is not aligned to v1.5.2");

await import("./build.mjs");

const required = ["index.html", "manifest.webmanifest", "sw.js", "icon.svg", "version.json"];
for (const file of required) {
  try { await readFile(`www/${file}`); } catch { throw new Error(`Production output missing: www/${file}`); }
}

console.log("LIFEOS release gate: PASS");
console.log(`Version: v${pkg.version}`);
console.log(`JavaScript blocks checked: ${scripts.length}`);
console.log("Production output: www/");
