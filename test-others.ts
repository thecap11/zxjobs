import { scrapeWithBrowser } from "./src/lib/job-sources/browser-scraper";
import * as cheerio from "cheerio";

async function testShine() {
  console.log("Testing Shine...");
  const html = await scrapeWithBrowser("https://www.shine.com/job-search/software-developer-jobs?q=software%20developer&loc_query=India", undefined, 15000);
  const $ = cheerio.load(html);
  const jobs = $(".job-listing, .joblisting, .job_listing, article.job, .jobCard_jobCard__jjUmu").length;
  console.log(`Shine found ${jobs} job elements. Cloudflare: ${html.includes("Cloudflare")}`);
  if (jobs > 0) {
     console.log("Shine is WORKING!");
  } else {
     console.log(html.substring(0, 300));
  }
}

async function testFoundit() {
  console.log("\nTesting Foundit...");
  const html = await scrapeWithBrowser("https://www.foundit.in/srp/results?query=software%20developer", undefined, 15000);
  const $ = cheerio.load(html);
  const jobs = $(".srpResultCardContainer, .card-apply-content, .job-tittle").length;
  console.log(`Foundit found ${jobs} job elements. Cloudflare: ${html.includes("Cloudflare")}`);
  if (jobs > 0) {
     console.log("Foundit is WORKING!");
  }
}

async function testFreshersworld() {
  console.log("\nTesting Freshersworld...");
  const html = await scrapeWithBrowser("https://www.freshersworld.com/jobs/jobsearch/software-developer-jobs-for-freshers", undefined, 15000);
  const $ = cheerio.load(html);
  const jobs = $(".job-container, .jobs-list li, .job-card, .seo-job-post").length;
  console.log(`Freshersworld found ${jobs} job elements. Cloudflare: ${html.includes("Cloudflare")}`);
  if (jobs > 0) {
     console.log("Freshersworld is WORKING!");
  }
}

async function run() {
  await testShine();
  await testFoundit();
  await testFreshersworld();
  process.exit(0);
}

run().catch(console.error);
