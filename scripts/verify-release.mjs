import fs from"node:fs";import path from"path";
const root=process.cwd();
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
const required=["dist/index.html","dist/manifest.webmanifest","dist/sw.js","dist/icon.svg","dist/version.json"];
for(const p of required)if(!fs.existsSync(path.join(root,p)))throw new Error("Missing release output: "+p);
const m=JSON.parse(fs.readFileSync(path.join(root,"dist/manifest.webmanifest"),"utf8"));
if(m.name!=="LIFEOS"||m.short_name!=="LIFEOS"||m.start_url!=="./"||m.scope!=="./"||m.display!=="standalone")throw new Error("Invalid PWA manifest");
const c=JSON.parse(fs.readFileSync(path.join(root,"capacitor.config.json"),"utf8"));
if(c.webDir!=="dist")throw new Error("Capacitor webDir must be dist");
const html=fs.readFileSync(path.join(root,"dist/index.html"),"utf8");
if(!html.includes('id="root"'))throw new Error("Invalid app entry");
if(html.includes("/src/main.tsx"))throw new Error("Unbuilt source entry leaked into production HTML");
const version=JSON.parse(fs.readFileSync(path.join(root,"dist/version.json"),"utf8"));
if(version.name!=="LIFEOS"||version.version!==pkg.version)throw new Error("Version metadata mismatch");
const sourceDir=path.join(root,"src");
const files=fs.readdirSync(sourceDir).filter(x=>x.endsWith(".ts")||x.endsWith(".tsx")).map(x=>path.join(sourceDir,x));
for(const file of files){const source=fs.readFileSync(file,"utf8");if(source.includes("localStorage"))throw new Error("localStorage usage found in "+file+"; LIFEOS persistence must use IndexedDB");}
console.log("LIFEOS "+pkg.version+" release verification passed.");