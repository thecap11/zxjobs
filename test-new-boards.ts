import { scrapeWithBrowser } from "./src/lib/job-sources/browser-scraper";
import * as cheerio from "cheerio";

async function testInternshala() {
  console.log("\nTesting Internshala...");
  // Internshala has a dedicated fresher jobs section
  const html = await scrapeWithBrowser("https://internshala.com/jobs/fresher-jobs/", undefined, 15000);
  const $ = cheerio.load(html);
  const jobs = $(".individual_internship, .job-internship-name").length;
  console.log(`Internshala found ${jobs} job elements. Cloudflare: ${html.includes("Cloudflare")}`);
  if (jobs > 0) console.log("Internshala is WORKING!");
}

async function testSimplyHired() {
  console.log("\nTesting SimplyHired...");
  const html = await scrapeWithBrowser("https://www.simplyhired.co.in/search?q=developer", undefined, 15000);
  const $ = cheerio.load(html);
  const jobs = $("#job-list li, .SerpJob-jobCard").length;
  console.log(`SimplyHired found ${jobs} job elements. Cloudflare: ${html.includes("Cloudflare")}`);
  if (jobs > 0) console.log("SimplyHired is WORKING!");
}

async function testApna() {
  console.log("\nTesting Apna...");
  const html = await scrapeWithBrowser("https://apna.co/jobs?search=developer", undefined, 15000);
  const $ = cheerio.load(html);
  const jobs = $(".JobCardList_jobCard__xyz, [data-testid='job-card']").length;
  // Let's just count general links if specific class isn't found
  const links = $("a[href*='/job/']").length;
  console.log(`Apna found ${jobs} job elements (Links: ${links}). Cloudflare: ${html.includes("Cloudflare")}`);
  if (links > 0) console.log("Apna is WORKING!");
}

async function run() {
  await testInternshala();
  await testSimplyHired();
  await testApna();
  process.exit(0);
}

run().catch(console.error);
