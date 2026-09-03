export interface JobSearchCriteria {
  keywords?: string[];
  skills?: string[];
  jobTitles?: string[];
  location?: string;
  experience?: number; // years
  remotePreference?: string;
  employmentType?: string;
}

export interface NormalizedJob {
  source: string;
  sourceJobId?: string;
  title: string;
  company: string;
  location?: string;
  remoteType?: string; // "Remote", "Hybrid", "On-site"
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: string;
  skills: string[];
  description?: string;
  applicationUrl: string;
  postedAt?: Date;
}

export interface JobSource {
  name: string;
  enabled: boolean;
  searchJobs(criteria: JobSearchCriteria): Promise<NormalizedJob[]>;
}
