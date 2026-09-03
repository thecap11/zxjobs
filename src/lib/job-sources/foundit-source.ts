import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { buildSearchQuery } from "./search-helpers";

export class FounditSource implements JobSource {
  name = "Foundit";
  enabled = true;

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      const query = buildSearchQuery(criteria);
      const q = encodeURIComponent(query);
      const location = encodeURIComponent(criteria.location || "");

      const offsets = [0, 40];
      const pagePromises = offsets.map(async (offset) => {
        const url = `https://www.foundit.in/middleware/jobsearch?searchId=&query=${q}&location=${location}&sort=1&limit=40&offset=${offset}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "*/*",
              "Accept-Language": "en-IN,en;q=0.9",
              "Referer": "https://www.foundit.in/",
            },
          });
          clearTimeout(timeoutId);

          if (!response.ok) return [];

          const data = await response.json();
          const results = data?.jobSearchResponse?.data || [];
          return results
            .filter((j: any) => j && j.title)
            .map((job: any) => {
              const rawSkills = typeof job.skills === "string"
                ? job.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                : (Array.isArray(job.skills) ? job.skills : []);

              const expMin = job.minimumExperience?.years ?? job.minimumExperienceFilter;
              const expMax = job.maximumExperience?.years ?? job.maximumExperienceFilter;
              const appUrl = job.redirectUrl || job.applyUrl || (job.jdUrl ? `https://www.foundit.in${job.jdUrl}` : `https://www.foundit.in/job/${job.jobId || job.id}`);

              return {
                source: "Foundit",
                sourceJobId: `foundit-${job.jobId || job.id}`,
                title: job.title,
                company: job.companyName || "Leading Company",
                location: typeof job.locations === "string" ? job.locations : (Array.isArray(job.locations) ? job.locations.join(", ") : (criteria.location || "India")),
                remoteType: (job.employmentTypes || []).includes("Remote") ? "Remote" : "Hybrid",
                experienceMin: typeof expMin === "number" ? expMin : undefined,
                experienceMax: typeof expMax === "number" ? expMax : undefined,
                salaryMin: job.minimumSalary?.absoluteValue || undefined,
                salaryMax: job.maximumSalary?.absoluteValue || undefined,
                skills: rawSkills,
                description: typeof job.skills === "string" ? `Required skills: ${job.skills}` : (job.title || ""),
                applicationUrl: appUrl,
                employmentType: "Full-time",
                postedAt: job.createdAt ? new Date(job.createdAt) : new Date(),
              } as NormalizedJob;
            });
        } catch {
          clearTimeout(timeoutId);
          return [];
        }
      });

      const settled = await Promise.allSettled(pagePromises);
      let allJobs: NormalizedJob[] = [];
      for (const res of settled) {
        if (res.status === "fulfilled") {
          allJobs = allJobs.concat(res.value);
        }
      }

      console.log(`✓ Foundit: ${allJobs.length} jobs`);
      return allJobs;
    } catch (error) {
      console.warn("Foundit source warning:", error instanceof Error ? error.message : error);
      return [];
    }
  }
}
