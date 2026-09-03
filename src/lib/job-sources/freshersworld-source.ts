import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery } from "./search-helpers";
import { scrapeWithBrowser } from "./browser-scraper";
import * as cheerio from "cheerio";

/**
 * Freshersworld.com - Dedicated fresher job portal for India.
 * Best source for candidates with 0-2 years of experience.
 */
export class FreshersworldSource implements JobSource {
  name = "Freshersworld";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      // Only enable for freshers
      const experience = criteria.experience ?? 0;
      if (experience > 5) return [];

      const query = buildSearchQuery(criteria);
      const q = encodeURIComponent(query);
      const loc = encodeURIComponent(criteria.location || "");

      const allJobs: NormalizedJob[] = [];
      for (const page of [1, 2]) { // Reduced to 2 pages
        const jobs = await this.fetchPage(q, loc, page);
        allJobs.push(...jobs);
      }

      console.log(`Freshersworld total: ${allJobs.length} jobs`);
      return allJobs;
    } catch (error) {
      console.error("Freshersworld source error:", error);
      return [];
    }
  }

  private async fetchPage(query: string, location: string, page: number): Promise<NormalizedJob[]> {
    // Use the keyword and location query parameters instead of path slugs which are brittle
    const url = `https://www.freshersworld.com/jobs/jobsearch?keyword=${query}&location=${location}&page=${page}`;
    
    try {
      const html = await scrapeWithBrowser(url, undefined, 15000);
      return this.parseHTML(html);
    } catch (error) {
      console.error(`Freshersworld page ${page} error:`, error);
      return [];
    }
  }

  private parseHTML(html: string): NormalizedJob[] {
    const $ = cheerio.load(html);
    const jobs: NormalizedJob[] = [];

    $(".job-container, .jobs-list li, .job-card, article.job-listing, .seo-job-post").each((index, el) => {
      try {
        const $el = $(el);
        const titleEl = $el.find("h3 a, h2 a, .job-title a, a.position").first();
        const title = titleEl.text().trim();
        if (!title) return;

        let applicationUrl = titleEl.attr("href") || "";
        if (!applicationUrl) return;
        if (!applicationUrl.startsWith("http")) applicationUrl = `https://www.freshersworld.com${applicationUrl}`;

        const company = $el.find(".company-name, .comp, .employer-name").first().text().trim() || "Unknown";
        const location = $el.find(".location, .loc, .job-location").first().text().trim() || "India";

        const skills = $el.find(".skills span, .skill-tag, .key-skills li")
          .map((_: any, s: any) => $(s).text().trim())
          .get().filter(Boolean).slice(0, 8);

        jobs.push({
          source: "Freshersworld",
          sourceJobId: `fw-${index}-${title.substring(0, 15).replace(/\s/g, "")}`,
          title, company, location,
          remoteType: location.toLowerCase().includes("remote") ? "Remote" : "On-site",
          experienceMin: 0,
          experienceMax: 2,
          skills,
          description: $el.find(".job-desc, .description, .summary").first().text().trim().substring(0, 500),
          applicationUrl,
          employmentType: "Full-time",
        });
      } catch (e) { /* skip */ }
    });

    return jobs;
  }
}
