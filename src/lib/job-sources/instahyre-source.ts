import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery, getExperienceRange } from "./search-helpers";
import * as cheerio from "cheerio";

/**
 * Instahyre scraper - Tech-focused job portal popular in India.
 */
export class InstahyreSource implements JobSource {
  name = "Instahyre";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const expRange = getExperienceRange(criteria.experience);
      const q = encodeURIComponent(query);
      const loc = encodeURIComponent(criteria.location || "India");

      const url = `https://www.instahyre.com/search-jobs/?q=${q}&location=${loc}&experience_min=${expRange.min}&experience_max=${expRange.max}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
      const jobs = this.parseHTML(html);
      console.log(`Instahyre: ${jobs.length} jobs`);
      return jobs;
    } catch (error) {
      console.error("Instahyre source error:", error);
      return [];
    }
  }

  private parseHTML(html: string): NormalizedJob[] {
    const $ = cheerio.load(html);
    const jobs: NormalizedJob[] = [];

    // Try to extract from embedded JSON first
    const scriptMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]+?})\s*;/) ||
                        html.match(/window\.__PRELOADED_STATE__\s*=\s*({[\s\S]+?})\s*;/);
    if (scriptMatch) {
      try {
        const data = JSON.parse(scriptMatch[1]);
        const jobsData = data?.jobs?.items || data?.search?.jobs || [];
        if (jobsData.length > 0) {
          return jobsData.map((job: any, index: number) => ({
            source: "Instahyre",
            sourceJobId: `ih-${job.id || index}`,
            title: job.designation || job.title || "",
            company: job.company?.name || job.companyName || "Unknown",
            location: job.location || job.city || "India",
            remoteType: "On-site",
            experienceMin: job.min_experience,
            experienceMax: job.max_experience,
            skills: job.skills?.map((s: any) => s.name || s) || [],
            description: (job.description || "").substring(0, 500),
            applicationUrl: `https://www.instahyre.com/candidate/jobs/${job.id}/`,
            employmentType: "Full-time",
          })).filter((j: any) => j.title);
        }
      } catch (e) { /* fall through */ }
    }

    $(".job-listing, .job-card, .opportunity-card, [data-job-id]").each((index, el) => {
      try {
        const $el = $(el);
        const titleEl = $el.find("h2 a, h3 a, .job-title a, .designation a").first();
        const title = titleEl.text().trim();
        if (!title) return;

        let applicationUrl = titleEl.attr("href") || `https://www.instahyre.com/search-jobs/?q=${title}`;
        if (!applicationUrl.startsWith("http")) applicationUrl = `https://www.instahyre.com${applicationUrl}`;

        const company = $el.find(".company-name, .org-name").first().text().trim() || "Unknown";
        const location = $el.find(".location, .city").first().text().trim() || "India";
        const skills = $el.find(".skill, .skills span")
          .map((_: any, s: any) => $(s).text().trim()).get().filter(Boolean).slice(0, 8);

        jobs.push({
          source: "Instahyre",
          sourceJobId: `ih-${index}`,
          title, company, location,
          remoteType: "On-site",
          skills,
          applicationUrl,
          employmentType: "Full-time",
        });
      } catch (e) { /* skip */ }
    });

    return jobs;
  }
}
