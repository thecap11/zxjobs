import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { scrapeWithBrowser } from "./browser-scraper";
import { buildSearchQuery } from "./search-helpers";
import * as cheerio from "cheerio";

export class SimplyHiredSource implements JobSource {
  name = "SimplyHired India";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const q = encodeURIComponent(query);
      const loc = encodeURIComponent(criteria.location || "");

      // SimplyHired uses cursor based pagination usually, but for browser scrape we can just scrape the first couple of pages using cursor if we knew it, or just generic urls. 
      // Actually SimplyHired often loads a lot of jobs or uses pn=2
      const allJobs: NormalizedJob[] = [];
      for (const page of [1, 2]) { // Reduced to 2 pages to be faster
        const jobs = await this.fetchPage(q, loc, page);
        allJobs.push(...jobs);
      }

      return allJobs;
    } catch (e) {
      console.error("SimplyHired search failed:", e);
      return [];
    }
  }

  private async fetchPage(query: string, location: string, page: number): Promise<NormalizedJob[]> {
    const url = `https://www.simplyhired.co.in/search?q=${query}&l=${location}&pn=${page}`;

    try {
      const html = await scrapeWithBrowser(url, undefined, 10000);
      console.log(`SimplyHired HTML len: ${html.length}, Cloudflare: ${html.includes("Cloudflare")}`);
      return this.parseHTML(html);
    } catch (e) {
      console.error(`SimplyHired fetch failed for page ${page}`, e);
      return [];
    }
  }

  private parseHTML(html: string): NormalizedJob[] {
    const jobs: NormalizedJob[] = [];
    const $ = cheerio.load(html);

    $("#job-list li").each((_, el) => {
      try {
        const titleTag = $(el).find("a").first();
        const title = titleTag.text().trim();
        const company = $(el).find("[data-testid='companyName']").text().trim();
        const location = $(el).find("[data-testid='searchSerpJobLocation']").text().trim();
        const snippet = $(el).find("p").text().trim() || title;
        
        let link = titleTag.attr("href") || "";
        if (link && !link.startsWith("http")) {
          link = `https://www.simplyhired.co.in${link}`;
        }
        
        const sourceJobId = $(el).attr("data-job-key") || link;

        if (title && company && link) {
          jobs.push({
            title,
            company,
            location: location || "India",
            description: snippet,
            applicationUrl: link,
            source: this.name,
            sourceJobId,
            skills: [],
            postedAt: new Date(),
          });
        }
      } catch (e) {
        // Skip malformed
      }
    });

    console.log(`SimplyHired parsed: ${$("#job-list li").length} elements -> ${jobs.length} jobs`);
    return jobs;
  }
}
