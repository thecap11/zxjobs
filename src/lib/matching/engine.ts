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
  const isSenior = isSeniorJob(job);
  const isEntryJob = /\b(fresher|entry[- ]level|junior|jr\.?|associate|graduate)\b/i.test(job.title + " " + (job.description || ""));
  const isCandidateFresher = candidate.experienceYears === 0 || candidate.experienceYears === null || candidate.experienceYears <= 1;

  // Experience (25%)
  if (isCandidateFresher) {
    if (isSenior) {
      experienceScore = 0;
    } else if (isEntryJob || (job.experienceMin !== undefined && job.experienceMin <= 1) || (job.experienceMax !== undefined && job.experienceMax <= 2)) {
      experienceScore = 100;
    } else {
      experienceScore = 60;
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
      // Partial match on meaningful terms
      const hasOverlap = candidate.preferredRoles.some(role => {
        const parts = role.toLowerCase().split(/[\s/]+/);
        return parts.some(p => p.length > 2 && jobTitleLower.includes(p));
      });

      // Synonym mappings (Developer / Engineer / Software / Web)
      const isCandidateDev = candidate.preferredRoles.some(r => /developer|engineer|programmer|full\s*stack|frontend|backend/i.test(r));
      const isJobDev = /developer|engineer|programmer|software|frontend|backend|fullstack|web|react|node|python|java|application/i.test(jobTitleLower);

      const isCandidateDesigner = candidate.preferredRoles.some(r => /designer|design|ui|ux|product/i.test(r));
      const isJobDesigner = /designer|design|ui|ux|product|creative|visual/i.test(jobTitleLower);

      if (hasOverlap) {
        roleScore = 80;
      } else if ((isCandidateDev && isJobDev) || (isCandidateDesigner && isJobDesigner)) {
        roleScore = 65;
      } else {
        roleScore = 0;
      }
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
  if (isCandidateFresher && isSenior) {
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

export function isInternship(job: NormalizedJob): boolean {
  const internRegex = /\b(intern|internship|trainee|stagiere|apprentice|fellowship)\b/i;
  if (internRegex.test(job.title)) return true;
  if (job.employmentType && internRegex.test(String(job.employmentType))) return true;
  if (job.description && /\b(internship\s+(?:program|role|opportunity)|intern\s+position)\b/i.test(job.description)) return true;
  return false;
}

export function isSeniorJob(job: NormalizedJob): boolean {
  // Reject if min experience is 2 or higher
  if (job.experienceMin !== undefined && job.experienceMin >= 2) return true;

  // Senior titles, levels, and ranks
  const seniorTitleRegex = /\b(senior|sr\.?|lead|principal|staff|architect|director|head|vp|manager|specialist|expert|mid[- ]senior|experienced|consultant|\bii\b|\biii\b|\biv\b|level\s*[2-9]|l[3-9])\b/i;
  if (seniorTitleRegex.test(job.title)) return true;

  // Check description for required 3+, 4+, 5+ years of experience
  if (job.description) {
    const expMatch = job.description.match(/\b([3-9]|\d{2,})\+?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:experience|exp)/i);
    if (expMatch) return true;
  }

  return false;
}

export function rankJobs(candidate: CandidateData, jobs: NormalizedJob[]): MatchResult[] {
  const isCandidateFresher = candidate.experienceYears === 0 || candidate.experienceYears === null || candidate.experienceYears <= 1;

  return jobs
    .filter((job) => {
      // 1. NEVER SHOW INTERNSHIPS (per explicit user requirement)
      if (isInternship(job)) {
        return false;
      }

      // 2. FOR FRESHERS: NEVER SHOW SENIOR / EXPERIENCED JOBS
      if (isCandidateFresher && isSeniorJob(job)) {
        return false;
      }

      return true;
    })
    .map((job) => calculateMatch(candidate, job))
    .filter((match) => match.overallScore >= 40)
    .sort((a, b) => b.overallScore - a.overallScore);
}
