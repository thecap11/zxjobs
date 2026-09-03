import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery, getExperienceRange } from "./search-helpers";
import { scrapeWithBrowser } from "./browser-scraper";
import * as cheerio from "cheerio";

export class IndeedIndiaSource implements JobSource {
  name = "Indeed India";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const q = encodeURIComponent(query);
      const location = encodeURIComponent(criteria.location || "");
      const expRange = getExperienceRange(criteria.experience);

      const pages = [0, 10, 20, 30, 40]; // Fetch up to 50 jobs
      const pagePromises = pages.map((start) => this.fetchPage(q, location, start, expRange));
      const results = await Promise.allSettled(pagePromises);

      let allJobs: NormalizedJob[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") allJobs = allJobs.concat(r.value);
      }

      console.log(`Indeed India total: ${allJobs.length} jobs`);
      return allJobs;
    } catch (error) {
      console.error("Indeed India source error:", error);
      return [];
    }
  }

  private async fetchPage(q: string, location: string, start: number, expRange: { min: number; max: number }): Promise<NormalizedJob[]> {
    let expLevel = "entry_level";
    if (expRange.min >= 5) expLevel = "senior_level";
    else if (expRange.min >= 2) expLevel = "mid_level";
    
    const url = `https://in.indeed.com/jobs?q=${q}&l=${location}&fromage=14&start=${start}&explvl=${expLevel}`;

    try {
      const html = await scrapeWithBrowser(url, undefined, 15000);

      // Try JSON extraction first (most reliable)
      const jsonJobs = this.extractFromScript(html);
      if (jsonJobs.length > 0) return jsonJobs;

      // Fallback to HTML
      return this.parseHTML(html);
    } catch (error) {
      console.error(`Indeed India page ${start} error:`, error);
      return [];
    }
  }

  private extractFromScript(html: string): NormalizedJob[] {
    try {
      const match = html.match(/window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*(\{[\s\S]+?\});/);
      if (!match) return [];
      const data = JSON.parse(match[1]);
      const results = data?.metaData?.mosaicProviderJobCardsModel?.results || [];
      return results.filter((job: any) => job.title).map((job: any) => ({
        source: "Indeed India",
        sourceJobId: `indeed-${job.jobkey || job.jk}`,
        title: job.title,
        company: job.company || "Unknown",
        location: job.formattedLocation || "India",
        remoteType: (job.remoteLocation || "").toLowerCase().includes("remote") ? "Remote" : "On-site",
        salaryMin: job.extractedSalary?.min,
        salaryMax: job.extractedSalary?.max,
        experienceMin: undefined,
        experienceMax: undefined,
        employmentType: job.jobTypes?.[0] || "Full-time",
        skills: [],
        description: (job.snippet || "").substring(0, 500),
        applicationUrl: `https://in.indeed.com/viewjob?jk=${job.jobkey || job.jk}`,
        postedAt: job.pubDate ? new Date(job.pubDate) : undefined,
      }));
    } catch (e) {
      return [];
    }
  }

  private parseHTML(html: string): NormalizedJob[] {
    const $ = cheerio.load(html);
    const jobs: NormalizedJob[] = [];
    $(".job_seen_beacon, .tapItem, [data-jk]").each((_, el) => {
      try {
        const $el = $(el);
        const jk = $el.attr("data-jk") || $el.find("[data-jk]").first().attr("data-jk");
        const title = $el.find("h2 a span, .jobTitle span").first().text().trim();
        if (!title || !jk) return;
        const company = $el.find("[data-testid='company-name'], .companyName").first().text().trim() || "Unknown";
        const location = $el.find("[data-testid='text-location'], .companyLocation").first().text().trim() || "India";
        jobs.push({
          source: "Indeed India",
          sourceJobId: `indeed-${jk}`,
          title, company, location,
          remoteType: location.toLowerCase().includes("remote") ? "Remote" : "On-site",
          skills: [],
          applicationUrl: `https://in.indeed.com/viewjob?jk=${jk}`,
          employmentType: "Full-time",
        });
      } catch (e) { /* skip */ }
    });
    return jobs;
  }
}
