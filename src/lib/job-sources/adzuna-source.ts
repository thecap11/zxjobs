import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";

/**
 * Adzuna - Job search API with a free developer tier.
 * Docs: https://developer.adzuna.com/
 * Requires free API key (sign up at https://developer.adzuna.com/)
 * Has a dedicated India endpoint: /api/version/jobs/in/search
 */
export class AdzunaJobSource implements JobSource {
  name = "Adzuna";
  enabled = !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_API_KEY);

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    if (!this.enabled) return [];

    const appId = process.env.ADZUNA_APP_ID!;
    const apiKey = process.env.ADZUNA_API_KEY!;

    try {
      const params = new URLSearchParams();
      params.set("app_id", appId);
      params.set("app_key", apiKey);
      params.set("results_per_page", "25");
      params.set("content-type", "application/json");

      // Build search query
      const searchParts: string[] = [];
      if (criteria.jobTitles && criteria.jobTitles.length > 0) {
        searchParts.push(...criteria.jobTitles);
      }
      if (criteria.skills && criteria.skills.length > 0) {
        searchParts.push(...criteria.skills.slice(0, 3)); // top 3 skills
      }
      if (criteria.keywords && criteria.keywords.length > 0) {
        searchParts.push(...criteria.keywords);
      }

      if (searchParts.length > 0) {
        params.set("what", searchParts.join(" "));
      }

      if (criteria.location) {
        params.set("where", criteria.location);
      }

      // Use India endpoint
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?${params.toString()}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Adzuna API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const jobs = data.results || [];

      return jobs.map((job: any) => this.normalize(job));
    } catch (error) {
      console.error("Adzuna source error:", error);
      return [];
    }
  }

  private normalize(job: any): NormalizedJob {
    let salaryMin: number | undefined;
    let salaryMax: number | undefined;

    if (job.salary_min) salaryMin = Math.round(job.salary_min);
    if (job.salary_max) salaryMax = Math.round(job.salary_max);

    return {
      source: "Adzuna",
      sourceJobId: `adzuna-${job.id}`,
      title: job.title || "Untitled",
      company: job.company?.display_name || "Unknown",
      location: job.location?.display_name || "India",
      remoteType: "On-site",
      experienceMin: undefined,
      experienceMax: undefined,
      salaryMin,
      salaryMax,
      employmentType: job.contract_time === "full_time" ? "Full-time" :
                      job.contract_time === "part_time" ? "Part-time" :
                      job.contract_type === "contract" ? "Contract" : "Full-time",
      skills: job.category?.tag ? [job.category.tag.replace("it-jobs", "IT").replace("-", " ")] : [],
      description: job.description?.substring(0, 500),
      applicationUrl: job.redirect_url || "",
      postedAt: job.created ? new Date(job.created) : undefined,
    };
  }
}
