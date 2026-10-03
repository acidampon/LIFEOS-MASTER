import{rm,writeFile}from"node:fs/promises";import{existsSync}from"node:fs";import{execFileSync}from"node:child_process";
await rm("dist",{recursive:true,force:true});
execFileSync("npx",["vite","build"],{stdio:"inherit"});
if(!existsSync("dist/index.html"))throw new Error("Vite did not produce dist/index.html");
const pkg=JSON.parse(await import("node:fs/promises").then(x=>x.readFile("package.json","utf8")));
await writeFile("dist/version.json",JSON.stringify({name:"LIFEOS",version:pkg.version,build:"production",generatedAt:new Date().toISOString()})+"\n");
console.log("LIFEOS production build complete: v"+pkg.version);