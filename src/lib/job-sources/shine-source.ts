import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery, getExperienceRange } from "./search-helpers";
import * as cheerio from "cheerio";

/**
 * Shine.com - Popular Indian job board.
 */
export class ShineSource implements JobSource {
  name = "Shine";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const expRange = getExperienceRange(criteria.experience);
      const q = encodeURIComponent(query);
      const loc = encodeURIComponent(criteria.location || "");

      const pagePromises = [1, 2].map(page =>
        this.fetchPage(q, loc, expRange, page)
      );
      const results = await Promise.allSettled(pagePromises);

      let allJobs: NormalizedJob[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") allJobs = allJobs.concat(r.value);
      }

      console.log(`Shine total: ${allJobs.length} jobs`);
      return allJobs;
    } catch (error) {
      console.error("Shine source error:", error);
      return [];
    }
  }

  private async fetchPage(query: string, location: string, expRange: { min: number; max: number }, page: number): Promise<NormalizedJob[]> {
    const url = `https://www.shine.com/job-search/${query.replace(/%20/g, "-")}-jobs?q=${query}&loc_query=${location}&exp_min=${expRange.min}&exp_max=${expRange.max}&page=${page}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
      return this.parseHTML(html);
    } catch (error) {
      clearTimeout(timeoutId);
      return [];
    }
  }

  private parseHTML(html: string): NormalizedJob[] {
    const $ = cheerio.load(html);
    const jobs: NormalizedJob[] = [];

    $(".job-listing, .joblisting, .job_listing, article.job").each((index, el) => {
      try {
        const $el = $(el);
        const titleEl = $el.find("h2 a, h3 a, .job-title a, a.title").first();
        const title = titleEl.text().trim();
        if (!title) return;

        let applicationUrl = titleEl.attr("href") || "";
        if (!applicationUrl) return;
        if (!applicationUrl.startsWith("http")) applicationUrl = `https://www.shine.com${applicationUrl}`;

        const company = $el.find(".company, .comp-name, .company-name").first().text().trim() || "Unknown";
        const location = $el.find(".location, .loc, .job-location").first().text().trim() || "India";

        const expText = $el.find(".exp, .experience, .exp-range").first().text().trim();
        let experienceMin: number | undefined;
        let experienceMax: number | undefined;
        const expMatch = expText.match(/(\d+)\s*-\s*(\d+)/);
        if (expMatch) {
          experienceMin = parseInt(expMatch[1]);
          experienceMax = parseInt(expMatch[2]);
        }

        const skills = $el.find(".skill, .skills span, .key-skills li")
          .map((_: any, s: any) => $(s).text().trim())
          .get().filter(Boolean).slice(0, 8);

        jobs.push({
          source: "Shine",
          sourceJobId: `shine-${index}-${title.substring(0, 15).replace(/\s/g, "")}`,
          title, company, location,
          remoteType: location.toLowerCase().includes("remote") ? "Remote" : "On-site",
          experienceMin, experienceMax,
          skills,
          description: $el.find(".desc, .description, .job-desc").first().text().trim().substring(0, 500),
          applicationUrl,
          employmentType: "Full-time",
        });
      } catch (e) { /* skip */ }
    });

    return jobs;
  }
}
