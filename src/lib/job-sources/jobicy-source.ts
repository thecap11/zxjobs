import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery } from "./search-helpers";

export class JobicySource implements JobSource {
  name = "Jobicy";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria).toLowerCase();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch("https://jobicy.com/api/v2/remote-jobs?count=50&industry=engineering", {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
          "Accept": "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const data = await response.json();
      const items = data?.jobs || [];

      const queryWords = query.split(/[\s/]+/).filter(w => w.length > 2);

      const jobs: NormalizedJob[] = items
        .filter((item: any) => {
          if (!item.jobTitle) return false;
          const title = item.jobTitle.toLowerCase();
          // Filter out Senior/Lead for freshers
          if (criteria.experience !== undefined && criteria.experience <= 1) {
            if (/\b(senior|sr\.?|lead|principal|staff|architect|director|head|vp|manager)\b/i.test(title)) {
              return false;
            }
          }
          return queryWords.some(w => title.includes(w)) || true; // keep engineering jobs
        })
        .slice(0, 30)
        .map((item: any) => ({
          source: "Jobicy",
          sourceJobId: `jobicy-${item.id}`,
          title: item.jobTitle,
          company: item.companyName || "Tech Company",
          location: item.jobGeo || "Remote",
          remoteType: "Remote",
          experienceMin: 0,
          experienceMax: 2,
          skills: [],
          description: (item.jobExcerpt || "").replace(/<[^>]*>?/gm, "").substring(0, 400),
          applicationUrl: item.url || "https://jobicy.com",
          employmentType: item.jobType || "Full-time",
          postedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        }));

      console.log(`✓ Jobicy: ${jobs.length} jobs`);
      return jobs;
    } catch (err) {
      console.warn("Jobicy source warning:", err instanceof Error ? err.message : err);
      return [];
    }
  }
}
