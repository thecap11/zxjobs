import { db } from "../db";
import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";
import { IndeedIndiaSource } from "./indeed-india-source";
import { LinkedInJobsSource } from "./linkedin-source";
import { JoobleSource } from "./jooble-source";
import { FounditSource } from "./foundit-source";
import { NaukriSource } from "./naukri-source";
import { ShineSource } from "./shine-source";
import { FreshersworldSource } from "./freshersworld-source";
import { InstahyreSource } from "./instahyre-source";
import { InternshalaSource } from "./internshala-source";
import { SimplyHiredSource } from "./simplyhired-source";
import { getFallbackJobs } from "./fallback-data";

const sources: JobSource[] = [
  new FounditSource(),
  new InstahyreSource(),
  new LinkedInJobsSource(),
  new JoobleSource(),
  new IndeedIndiaSource(),     
  new FreshersworldSource(),
  new InternshalaSource(),
  new SimplyHiredSource(),
];

const SEARCH_TIMEOUT_MS = 6500;

const searchCache = new Map<string, { data: NormalizedJob[]; expiresAt: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCacheKey(criteria: JobSearchCriteria): string {
  // Exclude 'skills' from cache key because scrapers only use jobTitles, location, and experience.
  // This allows User A and User B searching for "Software Developer" to share the same DB cache.
  const coreCriteria = {
    jobTitles: criteria.jobTitles || [],
    location: criteria.location || "",
    experience: criteria.experience || 0
  };
  return JSON.stringify(coreCriteria);
}

function generateJobFingerprint(job: NormalizedJob): string {
  if (job.sourceJobId) return `${job.source}::${job.sourceJobId}`;
  // Normalize: lowercase, remove spaces
  const title = job.title.toLowerCase().replace(/\s+/g, "");
  const company = job.company.toLowerCase().replace(/\s+/g, "");
  return `${company}::${title}`;
}

export class JobAggregator {
  static async search(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    const cacheKey = getCacheKey(criteria);
    
    // Check Database Cache first (valid for 24 hours)
    try {
      const dbCache = await db.cachedJobSearch.findUnique({ where: { cacheKey } });
      if (dbCache && dbCache.expiresAt.getTime() > Date.now()) {
        console.log(`[DB Cache Hit] ${cacheKey} - Returning scraped jobs from DB`);
        return dbCache.results as unknown as NormalizedJob[];
      }
    } catch (e) {
      console.warn("DB Cache Error:", e);
    }

    const enabledSources = sources.filter((s) => s.enabled);
    console.log(`Searching ${enabledSources.length} sources: ${enabledSources.map(s => s.name).join(", ")}`);

    const searchPromises = enabledSources.map(async (source) => {
      try {
        const result = await Promise.race([
          source.searchJobs(criteria),
          new Promise<NormalizedJob[]>((_, reject) =>
            setTimeout(() => reject(new Error(`${source.name} timed out`)), SEARCH_TIMEOUT_MS)
          ),
        ]);
        console.log(`✓ ${source.name}: ${result.length} jobs`);
        return result;
      } catch (error) {
        console.error(`✗ ${source.name}:`, error instanceof Error ? error.message : error);
        return [];
      }
    });

    const results = await Promise.allSettled(searchPromises);

    let allJobs: NormalizedJob[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        allJobs = allJobs.concat(result.value);
      }
    });

    // Deduplicate by fingerprint
    const uniqueJobsMap = new Map<string, NormalizedJob>();
    allJobs.forEach((job) => {
      const fp = generateJobFingerprint(job);
      if (!uniqueJobsMap.has(fp)) {
        uniqueJobsMap.set(fp, job);
      }
    });

    let dedupedJobs = Array.from(uniqueJobsMap.values());
    console.log(`Total: ${allJobs.length} raw → ${dedupedJobs.length} after dedup`);

    if (dedupedJobs.length === 0) {
      console.log(`[JobAggregator] Using curated jobs fallback for: ${cacheKey}`);
      dedupedJobs = getFallbackJobs(criteria);
    }

    // Save to DB Cache (24 hours TTL)
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.cachedJobSearch.upsert({
        where: { cacheKey },
        update: { results: dedupedJobs as any, expiresAt },
        create: { cacheKey, results: dedupedJobs as any, expiresAt },
      });
      console.log(`[DB Cache Miss] Saved ${dedupedJobs.length} jobs to DB for ${cacheKey}`);
    } catch (e) {
      console.warn("Failed to save jobs to DB Cache:", e);
    }

    return dedupedJobs;
  }
}
