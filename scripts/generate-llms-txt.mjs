// Builds /llms.txt from sitemap.xml and each listed page's title, heading and description.
// Runs before every commit via .githooks/pre-commit (enable once: git config core.hooksPath .githooks).
// Or run by hand: node scripts/generate-llms-txt.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const pick = (html, re) => {
  const m = html.match(re);
  return m ? decode(m[1]) : "";
};

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

const pages = urls.map((url) => {
  let path = new URL(url).pathname;
  if (path.endsWith("/")) path += "index.html";
  const html = readFileSync(join(root, decodeURIComponent(path)), "utf8");
  return {
    url,
    path,
    title: pick(html, /<title>([\s\S]*?)<\/title>/i),
    heading: pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    description: pick(html, /<meta\s+name="description"\s+content="([^"]*)"/i),
  };
});

const kindOf = ({ path }) => {
  if (path === "/index.html") return "Home";
  if (/^\/product/.test(path)) return "Product";
  if (/^\/pricing/.test(path)) return "Pricing";
  if (/^\/docs\//.test(path)) return "Docs";
  if (/^\/(blog|guides)\//.test(path)) return "Guides";
  return "Company";
};

const home = pages.find((p) => kindOf(p) === "Home");
const [name, ...taglineParts] = home.title.split(": ");
const tagline = taglineParts.join(": ");

const sections = ["Product", "Pricing", "Docs", "Guides", "Company"];
const out = [`# ${name}`, ""];
if (tagline) out.push(`> ${tagline}`, "");
out.push(home.description, "");

for (const section of sections) {
  const items = pages.filter((p) => kindOf(p) === section);
  if (!items.length) continue;
  out.push(`## ${section}`, "");
  for (const p of items) {
    const label = p.heading || p.title;
    out.push(`- [${label}](${p.url})${p.description ? `: ${p.description}` : ""}`);
  }
  out.push("");
}

writeFileSync(join(root, "llms.txt"), out.join("\n").trimEnd() + "\n");
console.log(`Wrote llms.txt (${pages.length} pages)`);
