import { JobSearchCriteria } from "./types";

/**
 * Builds a search query string from criteria, adding experience-level keywords.
 */
export function buildSearchQuery(criteria: JobSearchCriteria): string {
  const parts: string[] = [];

  // Add role/title
  const roles = criteria.jobTitles || [];
  let query = roles.length > 0 ? roles[0].toLowerCase() : "software developer";
  
  // Return clean query - aggregator engines handle experience parsing downstream
  return query;
}

/**
 * Returns experience filter parameters for Indian job sites.
 */
export function getExperienceRange(experience?: number): { min: number; max: number } {
  if (experience === undefined || experience === null) return { min: 0, max: 99 };
  if (experience <= 0) return { min: 0, max: 1 };
  if (experience <= 1) return { min: 0, max: 2 };
  if (experience <= 3) return { min: 1, max: 4 };
  if (experience <= 5) return { min: 3, max: 6 };
  return { min: Math.max(0, experience - 2), max: experience + 3 };
}
