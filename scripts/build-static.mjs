import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(rootDirectory, "dist");

const staticFiles = [
  "index.html",
  "privacy.html",
  "style.css",
  "robots.txt",
  "sitemap.txt",
  "sitemap.xml",
  "ogp.png",
  "ogp.svg",
];

const experimentAssets = [
  "experiments/absence-message-maker/index.html",
  "experiments/event-items-checklist/index.html",
  "experiments/school-print-checker/index.html",
  "experiments/school-print-checker/checker.js",
  "experiments/school-terms-dictionary/index.html",
];

async function copyFile(relativePath, destinationPath = relativePath) {
  const source = path.join(rootDirectory, relativePath);
  const destination = path.join(outputDirectory, destinationPath);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination);
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all([
  ...staticFiles.map((file) => copyFile(file)),
  ...experimentAssets.map((file) => copyFile(file)),
  copyFile("cloudflare/_headers", "_headers"),
]);

const outputEntries = await readdir(outputDirectory, { recursive: true });
console.log(`Built ${outputEntries.filter((entry) => !entry.endsWith(path.sep)).length} static entries in dist/.`);
