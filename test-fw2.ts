import { scrapeWithBrowser } from "./src/lib/job-sources/browser-scraper";
import * as cheerio from "cheerio";

async function testFreshersworld() {
  console.log("\nTesting Freshersworld...");
  const html = await scrapeWithBrowser("https://www.freshersworld.com/jobs/jobsearch?keyword=digital%20marketing", undefined, 15000);
  const $ = cheerio.load(html);
  const jobs = $(".job-container, .jobs-list li, .job-card, .seo-job-post").length;
  console.log(`Freshersworld found ${jobs} job elements. Cloudflare: ${html.includes("Cloudflare")}`);
  if (jobs > 0) {
     console.log("Freshersworld is WORKING!");
  } else {
     console.log("Failed. Trying another URL format...");
     const html2 = await scrapeWithBrowser("https://www.freshersworld.com/jobs/jobsearch/digital-marketing-jobs-for-freshers?location=Hyderabad", undefined, 15000);
     const $2 = cheerio.load(html2);
     const jobs2 = $2(".job-container, .jobs-list li, .job-card, .seo-job-post").length;
     console.log(`Format 2 found ${jobs2} jobs`);
  }
}

testFreshersworld().catch(console.error);
