import { scrapeWithBrowser } from "./src/lib/job-sources/browser-scraper";
import * as cheerio from "cheerio";

async function run() {
  const query = "developer";
  // Internshala
  const url1 = `https://internshala.com/jobs/keywords-${query}/`;
  console.log("Internshala URL:", url1);
  const html1 = await scrapeWithBrowser(url1, undefined, 15000);
  const $1 = cheerio.load(html1);
  const jobs1 = $1(".individual_internship");
  console.log("Internshala Jobs:", jobs1.length);
  if (jobs1.length > 0) {
    const first = jobs1.first();
    console.log("  Title:", first.find(".job-internship-name").text().trim());
    console.log("  Company:", first.find(".company-name").text().trim());
    console.log("  Location:", first.find(".locations a").text().trim() || first.find(".locations").text().trim());
  }

  // SimplyHired
  const url2 = `https://www.simplyhired.co.in/search?q=${query}&l=`;
  console.log("\nSimplyHired URL:", url2);
  const html2 = await scrapeWithBrowser(url2, undefined, 15000);
  const $2 = cheerio.load(html2);
  const jobs2 = $2("#job-list li");
  console.log("SimplyHired Jobs:", jobs2.length);
  if (jobs2.length > 0) {
    const first = jobs2.first();
    console.log("  Title:", first.find("a").text().trim());
    console.log("  Company:", first.find("[data-testid='companyName']").text().trim());
    console.log("  Location:", first.find("[data-testid='searchSerpJobLocation']").text().trim());
  }

  // Apna
  const url3 = `https://apna.co/jobs?search=${query}`;
  console.log("\nApna URL:", url3);
  const html3 = await scrapeWithBrowser(url3, undefined, 15000);
  const $3 = cheerio.load(html3);
  const jobs3 = $3("[data-testid='job-card']");
  console.log("Apna Jobs:", jobs3.length);
  if (jobs3.length > 0) {
    const first = jobs3.first();
    console.log("  Title:", first.find("h3").text().trim() || first.find("a").text().trim());
  }
}
run().catch(console.error);
