import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";

/**
 * Arbeitnow - Free public job board API.
 * Docs: https://www.arbeitnow.com/api/job-board-api
 * No API key required.
 */
export class ArbeitnowJobSource implements JobSource {
  name = "Arbeitnow";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const url = "https://www.arbeitnow.com/api/job-board-api";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const data = await response.json();
      const jobs = data.data || [];

      // Filter by skills/keywords client-side since this API doesn't support search params well
      const searchTerms = [
        ...(criteria.skills || []),
        ...(criteria.keywords || []),
        ...(criteria.jobTitles || []),
      ].map(s => s.toLowerCase());

      let filtered = jobs;

      // Filter to India-eligible jobs only
      filtered = filtered.filter((job: any) => {
        const loc = (job.location || "").toLowerCase();
        const remote = job.remote === true;
        return (
          loc.includes("india") ||
          loc.includes("bangalore") ||
          loc.includes("bengaluru") ||
          loc.includes("hyderabad") ||
          loc.includes("mumbai") ||
          loc.includes("delhi") ||
          loc.includes("pune") ||
          loc.includes("chennai") ||
          loc.includes("kolkata") ||
          loc.includes("noida") ||
          loc.includes("gurugram") ||
          loc.includes("gurgaon") ||
          loc.includes("anywhere") ||
          loc.includes("worldwide") ||
          loc.includes("global") ||
          loc.includes("remote") ||
          remote
        );
      });

      // Then filter by skills/keywords
      if (searchTerms.length > 0) {
        filtered = jobs.filter((job: any) => {
          const text = `${job.title} ${job.description} ${(job.tags || []).join(" ")}`.toLowerCase();
          return searchTerms.some(term => text.includes(term));
        });
      }

      return filtered.slice(0, 25).map((job: any) => this.normalize(job));
    } catch (error) {
      console.error("Arbeitnow source error:", error);
      return [];
    }
  }

  private normalize(job: any): NormalizedJob {
    return {
      source: "Arbeitnow",
      sourceJobId: `arbeitnow-${job.slug}`,
      title: job.title || "Untitled",
      company: job.company_name || "Unknown",
      location: job.location || "Not specified",
      remoteType: job.remote ? "Remote" : "On-site",
      experienceMin: undefined,
      experienceMax: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      employmentType: "Full-time",
      skills: job.tags || [],
      description: job.description?.substring(0, 500),
      applicationUrl: job.url || "",
      postedAt: job.created_at ? new Date(job.created_at * 1000) : undefined,
    };
  }
}
