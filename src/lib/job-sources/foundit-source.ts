import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery, getExperienceRange } from "./search-helpers";
import * as cheerio from "cheerio";

export class FounditSource implements JobSource {
  name = "Foundit";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const q = encodeURIComponent(query);
      const location = encodeURIComponent(criteria.location || "");
      const expRange = getExperienceRange(criteria.experience);

      const url = `https://www.foundit.in/middleware/jobsearch?searchId=&query=${q}&location=${location}&sort=1&limit=30&offset=0&experienceRanges=${expRange.min}%7C${expRange.max}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Accept-Language": "en-IN,en;q=0.9",
          "Referer": "https://www.foundit.in/",
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const results = data?.jobSearchResponse?.data || data?.data || [];
        if (results.length > 0) {
          const jobs = results.filter((j: any) => j.title).map((job: any) => ({
            source: "Foundit",
            sourceJobId: `foundit-${job.jobId}`,
            title: job.title,
            company: job.companyName || "Unknown",
            location: Array.isArray(job.locations) ? job.locations.join(", ") : (job.locations || "India"),
            remoteType: "On-site",
            experienceMin: job.minExperience,
            experienceMax: job.maxExperience,
            salaryMin: job.minSalary,
            salaryMax: job.maxSalary,
            skills: job.skills || [],
            description: (job.jobDescription || "").substring(0, 500),
            applicationUrl: job.jobUrl || `https://www.foundit.in/job/${job.jobId}`,
            employmentType: "Full-time",
            postedAt: job.createdDate ? new Date(job.createdDate) : undefined,
          }));
          console.log(`Foundit: ${jobs.length} jobs`);
          return jobs;
        }
      }

      // Fallback to HTML
      return this.scrapeHTML(q, location, expRange);
    } catch (error) {
      console.error("Foundit source error:", error);
      return [];
    }
  }

  private async scrapeHTML(q: string, location: string, expRange: { min: number; max: number }): Promise<NormalizedJob[]> {
    try {
      const url = `https://www.foundit.in/srp/results?query=${q}&locations=${location}&sort=1&experienceRanges=${expRange.min}%7C${expRange.max}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html",
        },
      });
      clearTimeout(timeoutId);
      if (!response.ok) return [];

      const html = await response.text();
      const $ = cheerio.load(html);
      const jobs: NormalizedJob[] = [];

      $(".srpResultCardContainer, .card-apply-content").each((index, el) => {
        try {
          const $el = $(el);
          const titleEl = $el.find("a.jobTitle, .job-tittle a, h2 a").first();
          const title = titleEl.text().trim();
          if (!title) return;
          let applicationUrl = titleEl.attr("href") || "";
          if (!applicationUrl.startsWith("http")) applicationUrl = `https://www.foundit.in${applicationUrl}`;
          const company = $el.find(".company-name, .comp-name").first().text().trim() || "Unknown";
          const loc = $el.find(".loc, .location-text").first().text().trim() || "India";
          jobs.push({
            source: "Foundit",
            sourceJobId: `foundit-html-${index}`,
            title, company,
            location: loc,
            remoteType: "On-site",
            skills: [],
            applicationUrl,
            employmentType: "Full-time",
          });
        } catch (e) { /* skip */ }
      });

      console.log(`Foundit HTML: ${jobs.length} jobs`);
      return jobs;
    } catch (error) {
      return [];
    }
  }
}
