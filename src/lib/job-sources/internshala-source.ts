import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { scrapeWithBrowser } from "./browser-scraper";
import { buildSearchQuery } from "./search-helpers";
import * as cheerio from "cheerio";

export class InternshalaSource implements JobSource {
  name = "Internshala Jobs";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const urlQuery = query.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const allJobs: NormalizedJob[] = [];
      for (const page of [1, 2]) { // Reduced to 2 pages to be faster
        const jobs = await this.fetchPage(urlQuery, page);
        allJobs.push(...jobs);
      }
      return allJobs;
    } catch (e) {
      console.error("Internshala search failed:", e);
      return [];
    }
  }

  private async fetchPage(urlQuery: string, page: number): Promise<NormalizedJob[]> {
    // Note: Internshala uses page-X at the end of the URL, but the default URL brings back a lot of jobs anyway
    const url = page === 1 
      ? `https://internshala.com/jobs/keywords-${urlQuery}/` 
      : `https://internshala.com/jobs/keywords-${urlQuery}/page-${page}/`;

    try {
      const html = await scrapeWithBrowser(url, undefined, 10000);
      console.log(`Internshala HTML len: ${html.length}, Cloudflare: ${html.includes("Cloudflare")}`);
      return this.parseHTML(html);
    } catch (e) {
      console.error(`Internshala fetch failed for page ${page}`, e);
      return [];
    }
  }

  private parseHTML(html: string): NormalizedJob[] {
    const jobs: NormalizedJob[] = [];
    const $ = cheerio.load(html);

    $(".individual_internship").each((_, el) => {
      try {
        const title = $(el).find(".job-internship-name").text().trim();
        const company = $(el).find(".company-name").text().trim();
        const location = $(el).find(".locations a").text().trim() || $(el).find(".locations").text().trim();
        const urlStr = $(el).find(".job-internship-name a").attr("href");
        
        let link = urlStr || "";
        if (link && !link.startsWith("http")) {
          link = `https://internshala.com${link}`;
        }
        
        // If no explicit url, link to main page
        const applicationUrl = link || "https://internshala.com";
        const sourceJobId = $(el).attr("internshipid") || link;

        if (title && company) {
          jobs.push({
            title,
            company,
            location: location || "India",
            description: title,
            applicationUrl,
            source: this.name,
            sourceJobId: sourceJobId,
            skills: [],
            postedAt: new Date(),
          });
        }
      } catch (e) {
        // Skip malformed
      }
    });

    console.log(`Internshala parsed: ${$(".individual_internship").length} elements -> ${jobs.length} jobs`);
    return jobs;
  }
}
