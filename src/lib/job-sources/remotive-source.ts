import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery } from "./search-helpers";

export class RemotiveSource implements JobSource {
  name = "Remotive";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const q = encodeURIComponent(query);
      const url = `https://remotive.com/api/remote-jobs?search=${q}&limit=40`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
          "Accept": "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const data = await response.json();
      const jobsList = data.jobs || [];

      const jobs: NormalizedJob[] = jobsList.slice(0, 30).map((item: any) => ({
        source: "Remotive",
        sourceJobId: `remotive-${item.id}`,
        title: item.title,
        company: item.company_name || "Remote Tech",
        location: item.candidate_required_location || "Worldwide / Remote",
        remoteType: "Remote",
        experienceMin: 1,
        experienceMax: 5,
        skills: Array.isArray(item.tags) ? item.tags.slice(0, 8) : [],
        description: (item.description || "").replace(/<[^>]*>?/gm, "").substring(0, 400),
        applicationUrl: item.url || "https://remotive.com",
        employmentType: item.job_type === "full_time" ? "Full-time" : "Contract",
        postedAt: item.publication_date ? new Date(item.publication_date) : new Date(),
      }));

      console.log(`✓ Remotive: ${jobs.length} jobs`);
      return jobs;
    } catch (err) {
      console.warn("Remotive source warning:", err instanceof Error ? err.message : err);
      return [];
    }
  }
}
