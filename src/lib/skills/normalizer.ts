import { SKILL_ALIASES, ROLE_RULES } from "./dictionary";

export function normalizeSkill(rawSkill: string): string {
  const clean = rawSkill.trim().toLowerCase();
  return SKILL_ALIASES[clean] || rawSkill.trim();
}

export function extractSkillsFromText(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const foundSkills = new Set<string>();

  // Look for predefined skills
  for (const [alias, standardName] of Object.entries(SKILL_ALIASES)) {
    // Basic word boundary check
    const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    if (regex.test(normalizedText)) {
      foundSkills.add(standardName);
    }
  }

  return Array.from(foundSkills);
}

export function detectRoles(skills: string[]): string[] {
  const roles = new Set<string>();
  
  for (const rule of ROLE_RULES) {
    let matches = 0;
    for (const skill of skills) {
      if (rule.requiredSkills.includes(skill)) {
        matches++;
      }
    }
    
    if (matches >= rule.minMatches) {
      roles.add(rule.role);
    }
  }
  
  // Default fallback if no roles detected
  if (roles.size === 0) {
    roles.add("Software Engineer");
  }
  
  return Array.from(roles);
}
