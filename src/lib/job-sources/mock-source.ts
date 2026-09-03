import { JobSource, JobSearchCriteria, NormalizedJob } from "./types";

const MOCK_JOBS: NormalizedJob[] = [
  {
    source: "MockSource",
    sourceJobId: "mock-1",
    title: "Senior Frontend Developer",
    company: "TechNova",
    location: "Hyderabad",
    remoteType: "Hybrid",
    experienceMin: 4,
    experienceMax: 8,
    salaryMin: 1800000,
    salaryMax: 3000000,
    employmentType: "Full-time",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    description: "We are looking for an experienced Frontend Developer...",
    applicationUrl: "https://example.com/apply/mock-1",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    source: "MockSource",
    sourceJobId: "mock-2",
    title: "Full Stack Engineer",
    company: "DataSphere",
    location: "Bangalore",
    remoteType: "On-site",
    experienceMin: 2,
    experienceMax: 5,
    salaryMin: 1200000,
    salaryMax: 2000000,
    employmentType: "Full-time",
    skills: ["React", "Node.js", "PostgreSQL", "JavaScript"],
    description: "Join our core team building scalable backend services.",
    applicationUrl: "https://example.com/apply/mock-2",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    source: "MockSource",
    sourceJobId: "mock-3",
    title: "React Developer",
    company: "StartupInc",
    location: "Remote",
    remoteType: "Remote",
    experienceMin: 1,
    experienceMax: 3,
    salaryMin: 600000,
    salaryMax: 1200000,
    employmentType: "Full-time",
    skills: ["React", "JavaScript", "HTML", "CSS"],
    description: "Great opportunity for a junior/mid React developer.",
    applicationUrl: "https://example.com/apply/mock-3",
    postedAt: new Date(),
  },
  {
    source: "MockSource",
    sourceJobId: "mock-4",
    title: "Backend Developer",
    company: "CloudCore",
    location: "Pune",
    remoteType: "Remote",
    experienceMin: 3,
    experienceMax: 6,
    salaryMin: 1500000,
    salaryMax: 2500000,
    employmentType: "Full-time",
    skills: ["Node.js", "TypeScript", "MongoDB", "AWS"],
    description: "Looking for a backend engineer familiar with serverless.",
    applicationUrl: "https://example.com/apply/mock-4",
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
];

export class MockJobSource implements JobSource {
  name = "MockSource";
  enabled = process.env.NODE_ENV !== "production" || process.env.ENABLE_MOCK_SOURCE === "true";

  async searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]> {
    if (!this.enabled) return [];

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let results = MOCK_JOBS;

    if (criteria.location) {
      const loc = criteria.location.toLowerCase();
      results = results.filter(
        (job) => job.location?.toLowerCase().includes(loc) || job.remoteType === "Remote"
      );
    }

    if (criteria.skills && criteria.skills.length > 0) {
      const criteriaSkillsLower = criteria.skills.map((s) => s.toLowerCase());
      results = results.filter((job) =>
        job.skills.some((js) => criteriaSkillsLower.includes(js.toLowerCase()))
      );
    }

    if (criteria.experience !== undefined) {
      results = results.filter(
        (job) =>
          (!job.experienceMax || criteria.experience! <= job.experienceMax) &&
          (!job.experienceMin || criteria.experience! >= job.experienceMin - 1) // allow slight mismatch
      );
    }

    return results;
  }
}
