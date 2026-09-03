import { scrapeWithBrowser } from "./src/lib/job-sources/browser-scraper";
import * as cheerio from "cheerio";

async function run() {
  const url3 = `https://apna.co/jobs?search=developer`;
  const html3 = await scrapeWithBrowser(url3, undefined, 15000);
  const $3 = cheerio.load(html3);
  const jobs3 = $3("a[href*='/job/']");
  console.log("Apna Jobs:", jobs3.length);
  if (jobs3.length > 0) {
    jobs3.each((i, el) => {
      if (i > 3) return;
      console.log(`Job ${i}:`, $3(el).text().trim().substring(0, 50));
      console.log(` Link:`, $3(el).attr('href'));
    });
  }
}
run().catch(console.error);
