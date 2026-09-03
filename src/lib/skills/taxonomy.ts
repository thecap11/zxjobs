/**
 * Advanced Knowledge Graph for Job Matching
 * Maps high-level domains down to specific tools and frameworks.
 * This allows the matching engine to score you highly for a "Frontend" job
 * if you know "React", even if the word "Frontend" isn't in your resume.
 */

export const TAXONOMY = {
  "Frontend": [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", 
    "Angular", "Vue", "Svelte", "Tailwind CSS", "Bootstrap", "Redux"
  ],
  "Backend": [
    "Node.js", "Express", "Python", "Django", "Flask", "Java", 
    "Spring Boot", "C#", ".NET", "Go", "Ruby on Rails", "PHP", "Laravel"
  ],
  "Database": [
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "NoSQL", "Redis", 
    "Elasticsearch", "Cassandra", "Prisma"
  ],
  "DevOps & Cloud": [
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", 
    "Jenkins", "GitHub Actions", "Terraform", "Linux", "Nginx"
  ],
  "Mobile": [
    "React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin"
  ],
  "Data Science & AI": [
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", 
    "Pandas", "NumPy", "Data Analytics", "Power BI", "Tableau", "AI"
  ],
  "Security": [
    "Cybersecurity", "Penetration Testing", "Cryptography", "Network Security"
  ],
  "Design": [
    "UI/UX", "Figma", "Adobe XD", "Photoshop", "Web Design"
  ]
};

/**
 * Given a list of skills the user has, this function figures out which
 * parent domains they are proficient in (e.g., scoring 2+ frontend skills = proficient in Frontend).
 */
export function inferDomains(userSkills: string[]): string[] {
  const domains = new Set<string>();
  const lowercaseUserSkills = userSkills.map(s => s.toLowerCase());

  for (const [domain, domainSkills] of Object.entries(TAXONOMY)) {
    let matchCount = 0;
    for (const skill of domainSkills) {
      if (lowercaseUserSkills.includes(skill.toLowerCase())) {
        matchCount++;
      }
    }
    // If they have at least 2 skills in a domain (or 1 for smaller domains), they "know" that domain
    if (matchCount >= 2 || (domain === "Mobile" && matchCount >= 1)) {
      domains.add(domain);
    }
  }

  return Array.from(domains);
}
