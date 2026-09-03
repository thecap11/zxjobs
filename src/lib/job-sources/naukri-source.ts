import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery, getExperienceRange } from "./search-helpers";
import { scrapeWithBrowser } from "./browser-scraper";
import * as cheerio from "cheerio";

export class NaukriSource implements JobSource {
  name = "Naukri";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const expRange = getExperienceRange(criteria.experience);

      const q = encodeURIComponent(query);
      const loc = encodeURIComponent(criteria.location || "");
      const expMin = expRange.min;
      const expMax = expRange.max;

      // 2 pages to save resources
      const pagePromises = [1, 2].map(page =>
        this.scrapeHTML(query, criteria.location || "", expMin, expMax, page)
      );
      const results = await Promise.allSettled(pagePromises);

      let allJobs: NormalizedJob[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") allJobs = allJobs.concat(r.value);
      }

      console.log(`Naukri total: ${allJobs.length} jobs`);
      return allJobs;
    } catch (error) {
      console.error("Naukri source error:", error);
      return [];
    }
  }

  private normalizeJob(job: any): NormalizedJob | null {
    if (!job.title) return null;
    return {
      source: "Naukri",
      sourceJobId: `naukri-${job.jobId}`,
      title: job.title,
      company: job.companyName || "Unknown",
      location: Array.isArray(job.placeholders)
        ? job.placeholders.find((p: any) => p.type === "location")?.label || "India"
        : "India",
      remoteType: (job.tagsAndSkills || "").toLowerCase().includes("remote") ? "Remote" : "On-site",
      experienceMin: job.experienceText?.match(/(\d+)/)?.[1] ? parseInt(job.experienceText.match(/(\d+)/)[1]) : undefined,
      experienceMax: job.experienceText?.match(/(\d+)\s*-\s*(\d+)/)?.[2] ? parseInt(job.experienceText.match(/(\d+)\s*-\s*(\d+)/)[2]) : undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      skills: job.tagsAndSkills ? job.tagsAndSkills.split(",").map((s: string) => s.trim()).filter(Boolean).slice(0, 8) : [],
      description: (job.jobDescription || job.shortDescription || "").substring(0, 500),
      applicationUrl: job.jdURL || `https://www.naukri.com${job.jobId}`,
      employmentType: "Full-time",
      postedAt: job.modifiedOn ? new Date(job.modifiedOn) : undefined,
    };
  }

  private async scrapeHTML(query: string, location: string, expMin: number, expMax: number, page: number): Promise<NormalizedJob[]> {
    const url = `https://www.naukri.com/${query.replace(/\s+/g, "-")}-jobs-${page}?k=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&experience=${expMin}&xp=${expMax}&jobAge=15`;

    try {
      // Using headless browser
      const html = await scrapeWithBrowser(url, undefined, 15000);
      
      const $ = cheerio.load(html);
      const jobs: NormalizedJob[] = [];

      // Extract JSON from script tag (Naukri hydrates jobs in __INITIAL_STATE__)
      const scriptMatch = html.match(/"jobDetails"\s*:\s*(\[[\s\S]+?\])\s*,\s*"(?:filteredCount|suggestedCount)"/);
      if (scriptMatch) {
        try {
          const jobsData = JSON.parse(scriptMatch[1]);
          return jobsData.map((job: any) => this.normalizeJob(job)).filter(Boolean);
        } catch (e) { /* fall through to HTML */ }
      }

      $(".srp-jobtuple-wrapper, .jobTuple, article.jobTupleHeader").each((_, el) => {
        try {
          const $el = $(el);
          const titleEl = $el.find("a.title, .jobTitle a, a[title]").first();
          const title = titleEl.text().trim() || titleEl.attr("title") || "";
          if (!title) return;

          let applicationUrl = titleEl.attr("href") || "";
          if (!applicationUrl.startsWith("http")) applicationUrl = `https://www.naukri.com${applicationUrl}`;

          const company = $el.find(".comp-name, .companyInfo a, .subTitle").first().text().trim() || "Unknown";
          const loc = $el.find(".loc, .locWdth, .ni-job-tuple-icon-srp-loc").first().text().trim() || "India";
          const skills = $el.find(".tags-gt li, .skills-list li, .tag").map((_: any, s: any) => $(s).text().trim()).get().slice(0, 8);

          jobs.push({
            source: "Naukri",
            sourceJobId: undefined,
            title, company, location: loc,
            remoteType: loc.toLowerCase().includes("remote") ? "Remote" : "On-site",
            skills,
            applicationUrl,
            employmentType: "Full-time",
          });
        } catch (e) { /* skip */ }
      });

      return jobs;
    } catch (error) {
      console.error("Naukri HTML fallback error:", error);
      return [];
    }
  }
}
