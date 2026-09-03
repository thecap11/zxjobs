import { NormalizedJob } from "../job-sources/types";

export interface CandidateData {
  skills: string[];
  experienceYears: number | null;
  location: string | null;
  preferredRoles: string[];
  education: string | null;
}

export interface MatchResult {
  job: NormalizedJob;
  overallScore: number;
  breakdown: {
    skills: number;
    experience: number;
    role: number;
    location: number;
    education: number;
  };
  matchingSkills: string[];
  missingSkills: string[];
}

export function calculateMatch(candidate: CandidateData, job: NormalizedJob): MatchResult {
  let skillsScore = 0;
  let experienceScore = 0;
  let roleScore = 0;
  let locationScore = 0;
  let educationScore = 100; // Default if not specified

  const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  // Extract skills from description if missing
  let jobSkills = [...job.skills];
  if (jobSkills.length === 0 && job.description) {
    const descLower = job.description.toLowerCase();
    const commonSkills = ["react", "node", "javascript", "typescript", "python", "java", "sql", "aws", "docker", "html", "css", "express", "mongodb", "postgres", "git", "linux", "c++", "c#", "php"];
    jobSkills = commonSkills.filter(s => descLower.includes(s));
  }

  // Skills (40%)
  if (jobSkills.length > 0) {
    let matches = 0;
    for (const skill of jobSkills) {
      if (candidateSkillsLower.includes(skill.toLowerCase())) {
        matches++;
        matchingSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }
    skillsScore = Math.round((matches / jobSkills.length) * 100);
  } else {
    // If job specifies no skills at all, don't penalize as heavily, but don't give 100
    skillsScore = 50;
  }

  const jobTitleLower = job.title.toLowerCase();
  const isSeniorJob = /\b(senior|sr\.?|lead|principal|staff|architect|director|head|vp|manager)\b/i.test(job.title);
  const isEntryJob = /\b(fresher|entry[- ]level|junior|jr\.?|trainee|intern|internship|associate|graduate)\b/i.test(job.title + " " + (job.description || ""));
  const isCandidateFresher = candidate.experienceYears === 0 || candidate.experienceYears === null || candidate.experienceYears <= 1;

  // Experience (25%)
  if (isCandidateFresher) {
    if (isSeniorJob || (job.experienceMin !== undefined && job.experienceMin >= 3)) {
      experienceScore = 0;
    } else if (isEntryJob || (job.experienceMin !== undefined && job.experienceMin <= 1) || (job.experienceMax !== undefined && job.experienceMax <= 2)) {
      experienceScore = 100;
    } else {
      experienceScore = 50;
    }
  } else if (job.experienceMin !== undefined && candidate.experienceYears !== null) {
    if (candidate.experienceYears >= job.experienceMin) {
      experienceScore = 100;
    } else {
      experienceScore = Math.max(0, Math.round((candidate.experienceYears / job.experienceMin) * 100));
    }
  } else if (job.experienceMax !== undefined && candidate.experienceYears !== null && candidate.experienceYears > job.experienceMax + 2) {
    experienceScore = 75;
  } else {
    experienceScore = 90;
  }

  // Role (20%)
  if (candidate.preferredRoles.length > 0) {
    const roleMatch = candidate.preferredRoles.some(role => jobTitleLower.includes(role.toLowerCase()));
    if (roleMatch) {
      roleScore = 100;
    } else {
      // Partial match on meaningful terms (e.g. "Designer", "UX", "Frontend")
      const hasOverlap = candidate.preferredRoles.some(role => {
        const parts = role.toLowerCase().split(/[\s/]+/);
        return parts.some(p => p.length > 2 && jobTitleLower.includes(p));
      });
      roleScore = hasOverlap ? 60 : 0;
    }
  } else {
    roleScore = 80;
  }

  // Location (10%)
  if (job.remoteType === "Remote") {
    locationScore = 100;
  } else if (job.location && candidate.location) {
    if (job.location.toLowerCase().includes(candidate.location.toLowerCase()) || candidate.location.toLowerCase().includes(job.location.toLowerCase())) {
      locationScore = 100;
    } else {
      locationScore = 0;
    }
  } else {
    locationScore = 100;
  }

  // Weighted calculation
  let overallScore = Math.round(
    (skillsScore * 0.40) +
    (experienceScore * 0.25) +
    (roleScore * 0.20) +
    (locationScore * 0.10) +
    (educationScore * 0.05)
  );

  // Strict Seniority Guard: Cap senior jobs for freshers so they never rank high
  if (isCandidateFresher && isSeniorJob) {
    overallScore = Math.min(overallScore, 30);
  }

  // Strong bonus for entry/fresher roles that match candidate's role
  if (isCandidateFresher && isEntryJob && roleScore >= 60) {
    overallScore = Math.min(100, overallScore + 15);
  }

  // Heavy penalty if candidate preferred roles are specified and job role does not match at all
  if (candidate.preferredRoles.length > 0 && roleScore === 0) {
    overallScore = Math.round(overallScore * 0.4);
  }

  return {
    job,
    overallScore,
    breakdown: {
      skills: skillsScore,
      experience: experienceScore,
      role: roleScore,
      location: locationScore,
      education: educationScore,
    },
    matchingSkills,
    missingSkills,
  };
}

export function rankJobs(candidate: CandidateData, jobs: NormalizedJob[]): MatchResult[] {
  const isCandidateFresher = candidate.experienceYears === 0 || candidate.experienceYears === null || candidate.experienceYears <= 1;

  return jobs
    .filter((job) => {
      // For freshers, filter out Senior/Lead/Staff/Principal roles completely
      if (isCandidateFresher) {
        if (/\b(senior|sr\.?|lead|principal|staff|architect|director|head|vp|manager)\b/i.test(job.title)) {
          return false;
        }
        if (job.experienceMin !== undefined && job.experienceMin >= 3) {
          return false;
        }
      }
      return true;
    })
    .map((job) => calculateMatch(candidate, job))
    .filter((match) => match.overallScore >= 40)
    .sort((a, b) => b.overallScore - a.overallScore);
}
