import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery } from "./search-helpers";
import * as cheerio from "cheerio";

/**
 * LinkedIn public jobs scraper with pagination and experience filtering.
 */
export class LinkedInJobsSource implements JobSource {
  name = "LinkedIn Jobs";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const keywords = encodeURIComponent(query);
      const location = encodeURIComponent(criteria.location || "India");

      // Experience level filter for LinkedIn:
      // 1=Internship, 2=Entry level, 3=Associate, 4=Mid-Senior, 5=Director, 6=Executive
      let expFilter = "";
      if (criteria.experience !== undefined && criteria.experience <= 1) {
        expFilter = "&f_E=1%2C2"; // Internship + Entry level
      } else if (criteria.experience !== undefined && criteria.experience <= 3) {
        expFilter = "&f_E=2%2C3"; // Entry level + Associate
      }

      // Fetch top 2 pages concurrently for speed
      const pages = [0, 25];
      const pagePromises = pages.map((start) =>
        this.fetchPage(keywords, location, start, expFilter)
      );

      const results = await Promise.allSettled(pagePromises);
      let allJobs: NormalizedJob[] = [];
      for (const result of results) {
        if (result.status === "fulfilled") {
          allJobs = allJobs.concat(result.value);
        }
      }

      console.log(`LinkedIn total: ${allJobs.length} jobs`);
      return allJobs;
    } catch (error) {
      console.error("LinkedIn Jobs source error:", error);
      return [];
    }
  }

  private async fetchPage(keywords: string, location: string, start: number, expFilter: string): Promise<NormalizedJob[]> {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keywords}&location=${location}&f_TPR=r604800${expFilter}&start=${start}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html",
          "Accept-Language": "en-IN,en;q=0.9",
        },
      });
      clearTimeout(timeoutId);
      if (!response.ok) return [];
      const html = await response.text();
      return this.parseHTML(html, start);
    } catch (error) {
      clearTimeout(timeoutId);
      return [];
    }
  }

  private parseHTML(html: string, startOffset: number): NormalizedJob[] {
    const $ = cheerio.load(html);
    const jobs: NormalizedJob[] = [];

    $("li").each((index, el) => {
      try {
        const $el = $(el);
        const title = $el.find(".base-search-card__title").first().text().trim();
        if (!title) return;

        const company = $el.find(".base-search-card__subtitle").first().text().trim() || "Unknown";
        const location = $el.find(".job-search-card__location").first().text().trim() || "India";

        let applicationUrl = $el.find("a.base-card__full-link").first().attr("href") || $el.find("a").first().attr("href") || "";
        if (applicationUrl.includes("?")) applicationUrl = applicationUrl.split("?")[0];
        
        const urn = $el.find("[data-entity-urn]").attr("data-entity-urn") || $el.attr("data-entity-urn") || "";
        const jobIdMatch = (applicationUrl + " " + urn).match(/(\d{7,})/);
        const jobId = jobIdMatch ? jobIdMatch[1] : `${startOffset + index}`;
        
        // Always build the direct, canonical application page URL
        if (jobId && /^\d+$/.test(jobId)) {
          applicationUrl = `https://www.linkedin.com/jobs/view/${jobId}`;
        }
        if (!applicationUrl) return;

        const dateText = $el.find("time").first().attr("datetime") || "";

        jobs.push({
          source: "LinkedIn",
          sourceJobId: `li-${jobId}`,
          title,
          company,
          location,
          remoteType: location.toLowerCase().includes("remote") ? "Remote" : "On-site",
          skills: [],
          applicationUrl,
          employmentType: "Full-time",
          postedAt: dateText ? new Date(dateText) : undefined,
        });
      } catch (e) { /* skip */ }
    });

    return jobs;
  }
}
