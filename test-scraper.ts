import { JoobleSource } from "./src/lib/job-sources/jooble-source";

async function run() {
  const jooble = new JoobleSource();
  const url = `https://in.jooble.org/SearchResult?p=1&rgns=India&ukw=software%20developer`;
  const res = await fetch(url);
  const html = await res.text();
  console.log("HTML length:", html.length);
  console.log("Has script?", html.includes("application/ld+json"));
  console.log("Has article?", html.includes("article"));
  console.log("Has Cloudflare/bot?", html.includes("Cloudflare") || html.includes("Just a moment"));
}
run().catch(console.error);
