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

  // Experience (25%)
  if (job.experienceMin !== undefined && candidate.experienceYears !== null) {
    if (candidate.experienceYears >= job.experienceMin) {
      experienceScore = 100;
    } else {
      // Calculate drop-off. If requires 5, has 2 -> 40%
      experienceScore = Math.max(0, Math.round((candidate.experienceYears / job.experienceMin) * 100));
    }
  } else if (job.experienceMax !== undefined && candidate.experienceYears !== null && candidate.experienceYears > job.experienceMax + 2) {
      // Overqualified? slightly reduce score
      experienceScore = 80;
  } else {
    experienceScore = 100;
  }

  // Role (20%)
  if (candidate.preferredRoles.length > 0) {
    const jobTitleLower = job.title.toLowerCase();
    const roleMatch = candidate.preferredRoles.some(role => jobTitleLower.includes(role.toLowerCase()));
    if (roleMatch) {
      roleScore = 100;
    } else {
      // Partial match? 
      const hasOverlap = candidate.preferredRoles.some(role => {
          const parts = role.toLowerCase().split(' ');
          return parts.some(p => p.length > 3 && jobTitleLower.includes(p));
      });
      roleScore = hasOverlap ? 50 : 0;
    }
  } else {
    roleScore = 100; // No preference
  }

  // Location (10%)
  if (job.remoteType === "Remote") {
    locationScore = 100;
  } else if (job.location && candidate.location) {
    if (job.location.toLowerCase() === candidate.location.toLowerCase()) {
      locationScore = 100;
    } else {
      locationScore = 0; // Not remote and different location
    }
  } else {
    locationScore = 100;
  }

  // Weighted calculation
  const overallScore = Math.round(
    (skillsScore * 0.40) +
    (experienceScore * 0.25) +
    (roleScore * 0.20) +
    (locationScore * 0.10) +
    (educationScore * 0.05)
  );

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
    missingSkills
  };
}

export function rankJobs(candidate: CandidateData, jobs: NormalizedJob[]): MatchResult[] {
  // Hard filter: drop jobs that require significantly more experience than candidate has
  const experience = candidate.experienceYears ?? 0;
  const filtered = jobs.filter((job) => {
    if (job.experienceMin !== undefined && job.experienceMin > experience + 2) {
      return false; // Requires too much experience
    }
    return true;
  });

  const matches = filtered.map(job => calculateMatch(candidate, job));
  return matches.sort((a, b) => b.overallScore - a.overallScore);
}
