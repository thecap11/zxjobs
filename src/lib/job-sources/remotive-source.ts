import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";

/**
 * Remotive.com - Free public API for remote jobs.
 * Docs: https://remotive.com/api/remote-jobs
 * No API key required. Explicitly provides a public API.
 */
export class RemotiveJobSource implements JobSource {
  name = "Remotive";
  enabled = true;

  private categoryMap: Record<string, string> = {
    "javascript": "software-dev",
    "typescript": "software-dev",
    "react": "software-dev",
    "node.js": "software-dev",
    "python": "software-dev",
    "java": "software-dev",
    "go": "software-dev",
    "rust": "software-dev",
    "c++": "software-dev",
    "c#": "software-dev",
    "ruby": "software-dev",
    "php": "software-dev",
    "devops": "devops",
    "data science": "data",
    "machine learning": "data",
    "data analytics": "data",
    "ui/ux": "design",
    "figma": "design",
    "product": "product",
    "marketing": "marketing",
    "customer support": "customer-support",
    "qa": "qa",
  };

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    try {
      // Build URL
      let url = "https://remotive.com/api/remote-jobs";
      const params = new URLSearchParams();

      // Try to find a matching category from skills
      if (criteria.skills && criteria.skills.length > 0) {
        for (const skill of criteria.skills) {
          const cat = this.categoryMap[skill.toLowerCase()];
          if (cat) {
            params.set("category", cat);
            break;
          }
        }
      }

      // Search term from keywords or job titles
      const searchTerm = criteria.keywords?.[0] || criteria.jobTitles?.[0] || criteria.skills?.[0];
      if (searchTerm) {
        params.set("search", searchTerm);
      }

      params.set("limit", "25");

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const data = await response.json();
      const jobs = data.jobs || [];

      // Filter to only India-eligible jobs
      const indiaJobs = jobs.filter((job: any) => {
        const loc = (job.candidate_required_location || "").toLowerCase();
        return (
          loc.includes("india") ||
          loc.includes("anywhere") ||
          loc.includes("worldwide") ||
          loc.includes("global") ||
          loc.includes("asia") ||
          loc === ""
        );
      });

      return indiaJobs.map((job: any) => this.normalize(job)).filter(Boolean);
    } catch (error) {
      console.error("Remotive source error:", error);
      return [];
    }
  }

  private normalize(job: any): NormalizedJob {
    // Extract salary if present in the title or description
    let salaryMin: number | undefined;
    let salaryMax: number | undefined;

    if (job.salary && job.salary !== "") {
      const salaryMatch = job.salary.match(/(\d[\d,]*)/g);
      if (salaryMatch) {
        const nums = salaryMatch.map((s: string) => parseInt(s.replace(/,/g, "")));
        if (nums.length >= 2) {
          salaryMin = nums[0];
          salaryMax = nums[1];
        } else if (nums.length === 1) {
          salaryMin = nums[0];
        }
      }
    }

    // Extract skills from tags
    const skills: string[] = job.tags || [];

    return {
      source: "Remotive",
      sourceJobId: `remotive-${job.id}`,
      title: job.title || "Untitled",
      company: job.company_name || "Unknown",
      location: job.candidate_required_location || "Remote",
      remoteType: "Remote",
      experienceMin: undefined,
      experienceMax: undefined,
      salaryMin,
      salaryMax,
      employmentType: job.job_type === "full_time" ? "Full-time" :
                      job.job_type === "contract" ? "Contract" :
                      job.job_type === "part_time" ? "Part-time" :
                      job.job_type === "internship" ? "Internship" : "Full-time",
      skills,
      description: job.description?.substring(0, 500),
      applicationUrl: job.url || "",
      postedAt: job.publication_date ? new Date(job.publication_date) : undefined,
    };
  }
}
