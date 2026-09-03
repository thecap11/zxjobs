import { extractSkillsFromText } from "../skills/normalizer";

export interface ATSResult {
  overallScore: number;
  categoryScores: {
    contactInfo: number;    // 10
    structure: number;      // 15
    sectionHeadings: number;// 15
    skills: number;         // 15
    experience: number;     // 15
    keywordQuality: number; // 15
    formatting: number;     // 10
    textQuality: number;    // 5 (Total = 100)
  };
  strengths: string[];
  issues: string[];
  recommendations: string[];
}

export function analyzeResume(rawText: string): ATSResult {
  const result: ATSResult = {
    overallScore: 0,
    categoryScores: {
      contactInfo: 0, structure: 0, sectionHeadings: 0, skills: 0,
      experience: 0, keywordQuality: 0, formatting: 0, textQuality: 0
    },
    strengths: [],
    issues: [],
    recommendations: []
  };

  if (!rawText || rawText.trim().length < 50) {
    result.issues.push("Resume contains no extractable text. Please use a text-based PDF.");
    result.recommendations.push("Save your resume as a standard text-based PDF rather than an image or scanned document.");
    return result;
  }

  const textLower = rawText.toLowerCase();
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const first40Percent = rawText.substring(0, Math.floor(rawText.length * 0.4));
  const last30Percent = rawText.substring(Math.floor(rawText.length * 0.7));

  // 1. Contact Information (10 points)
  let contactScore = 0;
  // Universal email regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  // Universal phone regex: handles +91 98765 43210, +91-9876543210, (555) 123-4567, 10 consecutive digits, and column-split phone lines
  const phoneRegex = /(?:(?:\+|00)\d{1,3}[\s.-]*)?(?:\(?\d{2,5}\)?[\s.-]*)?\d{3,5}[\s.-]*\d{4,5}|\b[6-9]\d{9}\b|\b\d{10}\b|(?:\+91[\s.-]*[6-9]\d{4})/;
  const linkedinRegex = /linkedin\.com\/(?:in|pub)\/[a-zA-Z0-9_-]+/i;
  const portfolioRegex = /(github\.com|behance\.net|dribbble\.com|medium\.com|kaggle\.com|gitlab\.com|[a-zA-Z0-9_-]+\.(?:dev|me|design|io|vercel\.app|netlify\.app))/i;

  // Check email
  if (emailRegex.test(first40Percent) || emailRegex.test(last30Percent)) {
    contactScore += 4;
  } else if (emailRegex.test(rawText)) {
    contactScore += 3;
  } else {
    result.issues.push("Missing email address");
    result.recommendations.push("Ensure your email address is listed clearly in your contact header.");
  }

  // Check phone
  if (phoneRegex.test(first40Percent) || phoneRegex.test(last30Percent)) {
    contactScore += 4;
  } else if (phoneRegex.test(rawText)) {
    contactScore += 3;
  } else {
    result.issues.push("Missing phone number");
    result.recommendations.push("Add a standard phone number (e.g., +91 98765 43210 or (555) 123-4567) to your header.");
  }

  // Check online presence / portfolio
  if (linkedinRegex.test(rawText) || portfolioRegex.test(rawText)) {
    contactScore += 2;
  } else {
    result.recommendations.push("Add a LinkedIn profile or online portfolio link to boost credibility with recruiters.");
  }

  result.categoryScores.contactInfo = Math.min(10, contactScore);
  if (contactScore >= 8) {
    result.strengths.push("Contact information (email, phone, and profile links) is complete and well-placed");
  }

  // 2. Section Headings (15 points)
  let headingScore = 0;
  const isHeader = (keywords: string[]) => {
    return lines.some(line => {
      const lower = line.toLowerCase();
      // Section header should be relatively short (under 45 chars) and match section words
      return line.length < 45 && keywords.some(k => new RegExp(`(^|\\b)${k}(\\b|$)`, "i").test(lower));
    });
  };

  const hasExperience = isHeader(["experience", "employment", "work history", "career history", "work experience", "professional experience"]);
  const hasEducation = isHeader(["education", "academic", "academics", "qualifications", "educational background"]);
  const hasSkills = isHeader(["skills", "technologies", "tools", "competencies", "areas of expertise", "key skills", "technical skills"]);
  const hasProjectsOrCert = isHeader(["projects", "selected projects", "academic projects", "certifications", "licenses", "achievements", "summary"]);

  if (hasExperience) headingScore += 5;
  if (hasEducation) headingScore += 5;
  if (hasSkills) headingScore += 5;

  result.categoryScores.sectionHeadings = headingScore;
  if (headingScore === 15) {
    result.strengths.push("Clear, standard section headings detected (Experience, Education, Skills)");
  } else {
    if (!hasExperience) {
      result.issues.push("Could not clearly identify a standard 'Experience' section heading");
      result.recommendations.push("Ensure your work history is under a dedicated heading called 'Experience' or 'Professional Experience'.");
    }
    if (!hasEducation) {
      result.issues.push("Could not clearly identify an 'Education' section heading");
      result.recommendations.push("List your degrees under a clearly labeled 'Education' heading.");
    }
    if (!hasSkills) {
      result.issues.push("Could not clearly identify a 'Skills' section heading");
      result.recommendations.push("Create a clearly labeled 'Skills' section so applicant tracking systems can index your capabilities.");
    }
  }

  // 3. Resume Structure & Bullet Points (15 points)
  let structureScore = 15;
  // Matches all unicode bullets: •, -, *, ▪, ●, –, —, ✓, ▸, ➔, 1., 2.
  const bulletCount = (rawText.match(/(?:^|\n)\s*(?:[•\-\*▪●–—✓▸➔]|(?:\d+\.))\s+/g) || []).length;

  if (bulletCount >= 8) {
    result.strengths.push("Excellent use of concise bullet points for high readability");
  } else if (bulletCount >= 3) {
    structureScore = 10;
    result.issues.push("Resume uses relatively few bullet points");
    result.recommendations.push("Break down job descriptions into 3-5 concise bullet points per role.");
  } else {
    structureScore = 5;
    result.issues.push("Few or no standard bullet points detected");
    result.recommendations.push("ATS systems and hiring managers prefer bulleted lists over dense paragraphs for work experience.");
  }
  result.categoryScores.structure = structureScore;

  // 4. Skills Section (15 points)
  let skillsScore = 0;
  // Use dictionary extraction
  const dictionarySkills = extractSkillsFromText(rawText);
  const foundSkillsSet = new Set<string>(dictionarySkills);

  // Also parse skills directly under SKILLS heading if present
  const skillsHeaderIdx = lines.findIndex(l => /^(?:technical\s+)?skills(?:\s*[:&]|\s*$)/i.test(l));
  if (skillsHeaderIdx !== -1) {
    // Check next 6 lines under skills header
    for (let i = skillsHeaderIdx + 1; i < Math.min(lines.length, skillsHeaderIdx + 8); i++) {
      const line = lines[i];
      // stop if another major header is encountered
      if (/^(?:experience|education|projects|certifications|summary)/i.test(line)) break;
      const parts = line.split(/[,|•·\t]/).map(s => s.trim().replace(/^[^a-zA-Z0-9]+/, "")).filter(s => s.length >= 2 && s.length <= 30);
      parts.forEach(p => foundSkillsSet.add(p));
    }
  }

  const allSkills = Array.from(foundSkillsSet);

  if (allSkills.length > 50) {
    skillsScore = 11; // Keyword stuffing penalty
    result.issues.push("Extremely high skill count detected (Potential keyword stuffing)");
    result.recommendations.push("Limit your skills section to the 15-25 most relevant and strongest competencies to avoid looking like spam.");
  } else if (allSkills.length >= 8) {
    skillsScore = 15;
    result.strengths.push(`Strong, recognizable domain skills detected (${allSkills.length} relevant competencies found)`);
  } else if (allSkills.length >= 4) {
    skillsScore = 11;
  } else {
    skillsScore = 6;
    result.issues.push("Few recognized industry skills extracted");
    result.recommendations.push("Include standard industry terminology, tools, and platforms in your skills section.");
  }
  result.categoryScores.skills = skillsScore;

  // 5. Experience Structure & Dates (15 points)
  let experienceScore = 0;
  // Matches dates: Jan 2021, June 2023 - Present, 2020 - 2023, 06/2023, 2024
  const dateRegex = /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}\b|\b\d{1,2}\/\d{4}\b|\b(?:19|20)\d{2}\s*[-–—to\s]+\s*(?:(?:19|20)\d{2}|present|current)\b|\b(?:19|20)\d{2}\b/ig;
  const dateMatches = rawText.match(dateRegex) || [];

  if (dateMatches.length >= 3) {
    experienceScore = 15;
    result.strengths.push("Chronological timelines and dates are clearly formatted");
  } else if (dateMatches.length > 0) {
    experienceScore = 10;
    result.issues.push("Some experience dates appear missing or inconsistently formatted");
    result.recommendations.push("Use standard date ranges consistently across all jobs (e.g., 'Jun 2023 – Present').");
  } else {
    experienceScore = 5;
    result.issues.push("Could not detect standard dates for experience");
    result.recommendations.push("Add clear start and end dates to your work experience entries.");
  }
  result.categoryScores.experience = experienceScore;

  // 6. Keyword Quality & Action Verbs (15 points)
  let keywordScore = 0;

  // Comprehensive Action Verb Dictionary (Tech, Design, Marketing, Finance, Management)
  const actionVerbs = [
    "architected", "spearheaded", "orchestrated", "engineered", "developed",
    "designed", "implemented", "optimized", "accelerated", "streamlined",
    "transformed", "managed", "led", "directed", "executed", "launched",
    "delivered", "increased", "decreased", "reduced", "generated", "achieved",
    "resolved", "maximized", "pioneered", "mentored", "collaborated", "built",
    "audited", "planned", "published", "created", "analyzed", "scaled",
    "automated", "integrated", "improved", "authored", "formulated"
  ];

  // Quantifiable metrics: %, currency symbols, counts, multipliers, and scales
  const metricRegex = /(?:\b\d+(?:\.\d+)?%\b|\$\s*\d+|\b\d+(?:\.\d+)?k\b|\b\d+(?:\.\d+)?m\b|\b\d+\+\s*(?:users|clients|leads|projects|articles|members|campaigns)?|\b\d+x\b|₹\s*[\d,]+|\brs\.?\s*[\d,]+|\b\d+\s*(?:lakh|crore|million|billion)\b)/gi;
  const metricsFound = rawText.match(metricRegex) || [];

  let verbCount = 0;
  for (const verb of actionVerbs) {
    if (textLower.includes(verb)) verbCount++;
  }

  if (verbCount >= 4 && metricsFound.length >= 3) {
    keywordScore = 15;
    result.strengths.push(`High impact language: ${verbCount} strong action verbs and ${metricsFound.length} measurable metrics detected`);
  } else if (verbCount >= 3) {
    keywordScore = 11;
    if (metricsFound.length < 2) {
      result.issues.push("Missing quantifiable achievements (metrics/numbers)");
      result.recommendations.push("Add measurable numbers to your bullets (e.g., 'Increased click-through rate by 31%', 'Managed monthly budget of ₹8 lakh'). ATS systems and hiring teams heavily prioritize proven results.");
    }
  } else {
    keywordScore = 6;
    result.issues.push("Weak action verbs in bullet points");
    result.recommendations.push("Start your bullet points with high-impact action verbs like 'Engineered', 'Orchestrated', 'Optimized', or 'Spearheaded' instead of passive phrases like 'Responsible for' or 'Helped with'.");
  }
  result.categoryScores.keywordQuality = keywordScore;

  // 7. Formatting / Parsing Safety (10 points)
  let formattingScore = 10;
  const weirdChars = (rawText.match(/[\uFFFD\u0000]/g) || []).length;
  const textWalls = rawText.split(/\n\s*\n/).filter(p => p.length > 700).length;

  if (weirdChars > 3) {
    formattingScore -= 5;
    result.issues.push("Extracted text contains corrupted or unreadable characters");
    result.recommendations.push("Avoid using complex graphics, custom symbols, or nested tables that can corrupt text in ATS parsers.");
  }

  if (textWalls > 1) {
    formattingScore -= 4;
    result.issues.push("Dense paragraphs of text detected (Text Walls)");
    result.recommendations.push("Break large paragraphs into bite-sized bullet points. ATS parsers extract keywords more cleanly from bullet points.");
  }

  result.categoryScores.formatting = Math.max(0, formattingScore);
  if (formattingScore === 10) {
    result.strengths.push("Clean layout: Zero parsing artifacts or dense text walls detected");
  }

  // 8. Text Quality (5 points)
  let textQualityScore = 5;
  const wordCount = rawText.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount < 150) {
    textQualityScore = 2;
    result.issues.push("Resume is very brief (low word count)");
    result.recommendations.push("Add more context to your responsibilities and projects to give ATS keyword matching sufficient content.");
  } else if (wordCount > 1800) {
    textQualityScore = 3;
    result.issues.push("Resume is exceptionally long (over 1,800 words)");
    result.recommendations.push("Aim to keep your resume concise (1-2 pages) to keep your keyword density focused.");
  }
  result.categoryScores.textQuality = textQualityScore;

  result.overallScore =
    result.categoryScores.contactInfo +
    result.categoryScores.structure +
    result.categoryScores.sectionHeadings +
    result.categoryScores.skills +
    result.categoryScores.experience +
    result.categoryScores.keywordQuality +
    result.categoryScores.formatting +
    result.categoryScores.textQuality;

  // Deduplicate strings
  result.strengths = Array.from(new Set(result.strengths));
  result.issues = Array.from(new Set(result.issues));
  result.recommendations = Array.from(new Set(result.recommendations));

  return result;
}
