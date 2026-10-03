import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const files = ["index.html", "manifest.webmanifest", "sw.js", "icon.svg"];
await rm("www", { recursive: true, force: true });
await mkdir("www", { recursive: true });

for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing production asset: ${file}`);
  await cp(file, `www/${file}`);
}

const version = JSON.parse(await (await import("node:fs/promises")).readFile("package.json", "utf8")).version;
await writeFile("www/version.json", JSON.stringify({ name: "LIFEOS", version, build: "production" }, null, 2) + "\n");

console.log(`LIFEOS production build complete: v${version}`);
