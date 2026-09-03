import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery } from "./search-helpers";

export class RemoteOKSource implements JobSource {
  name = "RemoteOK";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria).toLowerCase();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch("https://remoteok.com/api", {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
          "Accept": "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      // Filter relevant jobs (RemoteOK item[0] is disclaimer/legal)
      const queryWords = query.split(/[\s/]+/).filter(w => w.length > 2);

      const jobs: NormalizedJob[] = data
        .slice(1)
        .filter((item: any) => {
          if (!item.position) return false;
          const pos = item.position.toLowerCase();
          const tags = Array.isArray(item.tags) ? item.tags.join(" ").toLowerCase() : "";
          // Check if matches role or tags
          return queryWords.some(w => pos.includes(w) || tags.includes(w));
        })
        .slice(0, 40)
        .map((item: any) => ({
          source: "RemoteOK",
          sourceJobId: `remoteok-${item.id || item.slug}`,
          title: item.position,
          company: item.company || "Remote Co.",
          location: item.location || "Remote / Worldwide",
          remoteType: "Remote",
          experienceMin: 0,
          experienceMax: 3,
          skills: Array.isArray(item.tags) ? item.tags.slice(0, 6) : [],
          description: (item.description || "").replace(/<[^>]*>?/gm, "").substring(0, 400),
          applicationUrl: item.url || `https://remoteok.com/remote-jobs/${item.id}`,
          employmentType: "Full-time",
          postedAt: item.date ? new Date(item.date) : new Date(),
        }));

      console.log(`✓ RemoteOK: ${jobs.length} jobs`);
      return jobs;
    } catch (err) {
      console.warn("RemoteOK source warning:", err instanceof Error ? err.message : err);
      return [];
    }
  }
}
