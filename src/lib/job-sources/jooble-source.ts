import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery } from "./search-helpers";
import * as cheerio from "cheerio";

export class JoobleSource implements JobSource {
  name = "Jooble";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const q = encodeURIComponent(query);
      const location = encodeURIComponent(criteria.location || "India");

      const pages = [1, 2, 3];
      const pagePromises = pages.map((page) => this.fetchPage(q, location, page));
      const results = await Promise.allSettled(pagePromises);

      let allJobs: NormalizedJob[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") allJobs = allJobs.concat(r.value);
      }

      console.log(`Jooble total: ${allJobs.length} jobs`);
      return allJobs;
    } catch (error) {
      console.error("Jooble source error:", error);
      return [];
    }
  }

  private async fetchPage(query: string, location: string, page: number): Promise<NormalizedJob[]> {
    const url = `https://in.jooble.org/SearchResult?p=${page}&rgns=${location}&ukw=${query}`;

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
      return this.parseHTML(html, page);
    } catch (error) {
      clearTimeout(timeoutId);
      return [];
    }
  }

  private parseHTML(html: string, page: number): NormalizedJob[] {
    const $ = cheerio.load(html);
    const jobs: NormalizedJob[] = [];

    // Try JSON-LD first
    const scriptTags = $('script[type="application/ld+json"]').toArray();
    for (const el of scriptTags) {
      try {
        const json = JSON.parse($(el).html() || "{}");
        if (json["@type"] === "JobPosting") {
          const title = json.title;
          const company = json.hiringOrganization?.name || "Unknown";
          const loc = json.jobLocation?.address?.addressLocality || json.jobLocation?.address?.addressRegion || "India";
          let applicationUrl = json.url || "";
          
          if (title && applicationUrl) {
            jobs.push({
              source: "Jooble",
              sourceJobId: `jooble-${applicationUrl.split("/").pop() || title}`,
              title,
              company,
              location: loc,
              remoteType: loc.toLowerCase().includes("remote") ? "Remote" : "On-site",
              description: cheerio.load(json.description || "").text().substring(0, 500),
              applicationUrl,
              skills: [],
              employmentType: json.employmentType || "Full-time",
              postedAt: json.datePosted ? new Date(json.datePosted) : undefined,
            });
          }
        }
      } catch (e) { /* skip */ }
    }

    if (jobs.length > 0) return jobs;

    // Fallback to HTML
    $("article").each((index, el) => {
      try {
        const $el = $(el);
        const titleEl = $el.find("a").first();
        const title = titleEl.text().trim();
        if (!title) return;

        let applicationUrl = titleEl.attr("href") || "";
        if (!applicationUrl) return;

        const company = $el.find("p").first().text().trim() || "Unknown";
        const location = $el.find(".caption").first().text().trim() || "India";

        jobs.push({
          source: "Jooble",
          sourceJobId: `jooble-html-${page}-${index}`,
          title,
          company,
          location,
          remoteType: location.toLowerCase().includes("remote") ? "Remote" : "On-site",
          description: $el.text().substring(0, 500),
          applicationUrl,
          skills: [],
          employmentType: "Full-time",
        });
      } catch (e) { /* skip */ }
    });

    return jobs;
  }
}
