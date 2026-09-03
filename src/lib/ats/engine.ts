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
  const first20Percent = rawText.substring(0, Math.floor(rawText.length * 0.2));
  
  // 1. Contact Information (10 points)
  let contactScore = 0;
  const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;
  const portfolioRegex = /(github\.com|behance\.net|dribbble\.com|medium\.com)/i;

  if (emailRegex.test(first20Percent)) {
    contactScore += 4;
  } else if (emailRegex.test(rawText)) {
    contactScore += 2;
    result.issues.push("Email address found, but not at the top");
    result.recommendations.push("Move your email address to the header for better ATS extraction.");
  } else {
    result.issues.push("Missing email address");
    result.recommendations.push("Ensure your email address is listed clearly at the top.");
  }

  if (phoneRegex.test(first20Percent)) {
    contactScore += 4;
  } else if (phoneRegex.test(rawText)) {
    contactScore += 2;
  } else {
    result.issues.push("Missing phone number");
    result.recommendations.push("Add a standard 10-digit phone number to your header.");
  }

  if (linkedinRegex.test(rawText) || portfolioRegex.test(rawText)) {
    contactScore += 2;
  } else {
    result.recommendations.push("Consider adding a LinkedIn or GitHub/Portfolio link to strengthen your profile.");
  }

  result.categoryScores.contactInfo = contactScore;
  if (contactScore >= 8) result.strengths.push("Contact information is perfectly positioned and complete");

  // 2. Section Headings (15 points) - STRICTION: Must be on short lines (likely headers)
  let headingScore = 0;
  const isHeader = (keyword: string) => lines.some(line => line.toLowerCase().includes(keyword) && line.length < 35);
  
  const hasExperience = isHeader("experience") || isHeader("employment") || isHeader("work history");
  const hasEducation = isHeader("education") || isHeader("academic");
  const hasSkills = isHeader("skills") || isHeader("technologies") || isHeader("core competencies");

  if (hasExperience) headingScore += 5;
  if (hasEducation) headingScore += 5;
  if (hasSkills) headingScore += 5;

  result.categoryScores.sectionHeadings = headingScore;
  if (headingScore === 15) {
    result.strengths.push("Clear, standard section headings detected");
  } else {
    if (!hasExperience) {
      result.issues.push("Could not clearly identify an 'Experience' section");
      result.recommendations.push("Ensure your work history is under a dedicated, standalone heading called 'Professional Experience'.");
    }
    if (!hasSkills) {
      result.issues.push("Could not clearly identify a 'Skills' section");
      result.recommendations.push("Create a clearly labeled 'Skills' section so the ATS knows where to find your keywords.");
    }
  }

  // 3. Resume Structure & Bullet Points (15 points)
  let structureScore = 15;
  const bulletCount = (rawText.match(/(?:^|\n)\s*[•\-\*●▪]\s+/g) || []).length;
  
  if (bulletCount >= 10) {
    result.strengths.push("Excellent use of bullet points for readability");
  } else if (bulletCount > 0) {
    structureScore -= 5;
    result.issues.push("Resume uses very few bullet points");
    result.recommendations.push("Convert long paragraphs in your experience section into concise 1-2 line bullet points.");
  } else {
    structureScore -= 10;
    result.issues.push("No standard bullet points detected");
    result.recommendations.push("ATS systems and recruiters prefer bulleted lists over paragraphs for work experience.");
  }
  result.categoryScores.structure = Math.max(0, structureScore);

  // 4. Skills Section (15 points)
  let skillsScore = 0;
  const extractedSkills = extractSkillsFromText(rawText);
  
  if (extractedSkills.length > 40) {
    skillsScore = 10; // Keyword stuffing penalty
    result.issues.push("Extremely high skill count detected (Potential keyword stuffing)");
    result.recommendations.push("Limit your skills section to the 15-25 most relevant and strongest technologies to avoid looking like spam to the ATS.");
  } else if (extractedSkills.length >= 8) {
    skillsScore = 15;
    result.strengths.push(`Strong, recognizable technical skills detected (${extractedSkills.length} found)`);
  } else if (extractedSkills.length > 3) {
    skillsScore = 10;
  } else {
    skillsScore = 5;
    result.issues.push("Very few industry-standard skills extracted");
    result.recommendations.push("Ensure you are using standard terminology for your tools (e.g., 'Node.js', 'Figma', 'AWS').");
  }
  result.categoryScores.skills = skillsScore;

  // 5. Experience Structure & Dates (15 points)
  let experienceScore = 0;
  const dateRegex = /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}\b|\b\d{1,2}\/\d{4}\b|\b(?:201\d|202\d)\b/ig;
  const dateMatches = rawText.match(dateRegex) || [];
  
  if (dateMatches.length >= 4) {
    experienceScore = 15;
    result.strengths.push("Chronological dates are clearly formatted");
  } else if (dateMatches.length > 0) {
    experienceScore = 8;
    result.issues.push("Experience dates are missing or inconsistently formatted");
    result.recommendations.push("Use standard date formats consistently across all jobs (e.g., 'Jan 2021 – Present').");
  } else {
    result.issues.push("Could not detect standard dates for experience");
    result.recommendations.push("Add clear start and end dates to your work experience entries.");
  }
  result.categoryScores.experience = experienceScore;

  // 6. Keyword Quality & Action Verbs (15 points)
  let keywordScore = 0;
  
  // Deep Action Verb Dictionary
  const actionVerbs = [
    "architected", "spearheaded", "orchestrated", "engineered", "developed", 
    "designed", "implemented", "optimized", "accelerated", "streamlined", 
    "transformed", "managed", "led", "directed", "executed", "launched", 
    "delivered", "increased", "decreased", "reduced", "generated", "achieved",
    "resolved", "maximized", "pioneered", "mentored"
  ];
  const metrics = ["%", "$", "k", "m", "billion", "million"];
  
  let verbCount = 0;
  let metricCount = 0;
  
  for (const verb of actionVerbs) {
    if (textLower.includes(verb)) verbCount++;
  }
  for (const metric of metrics) {
    if (textLower.includes(metric)) metricCount++;
  }

  if (verbCount >= 5 && metricCount >= 3) {
    keywordScore = 15;
    result.strengths.push("Excellent use of strong action verbs and measurable metrics");
  } else if (verbCount >= 3) {
    keywordScore = 10;
    if (metricCount < 2) {
      result.issues.push("Missing measurable outcomes");
      result.recommendations.push("Add numbers to your bullets (e.g., 'Increased revenue by 15%', 'Managed a team of 5'). ATS systems rank measurable impact higher.");
    }
  } else {
    keywordScore = 5;
    result.issues.push("Weak action verbs");
    result.recommendations.push("Start your bullet points with strong action verbs like 'Engineered', 'Orchestrated', or 'Spearheaded' instead of 'Worked on' or 'Responsible for'.");
  }
  result.categoryScores.keywordQuality = keywordScore;

  // 7. Formatting / Parsing Safety (10 points)
  let formattingScore = 10;
  const weirdChars = (rawText.match(/[\uFFFD\u0000]/g) || []).length;
  const textWalls = rawText.split(/\n\s*\n/).filter(p => p.length > 600).length;

  if (weirdChars > 5) {
    formattingScore -= 5;
    result.issues.push("Extracted text contains corrupted or unreadable characters");
    result.recommendations.push("Avoid using complex icons, tables, or non-standard fonts. Use standard bullet points.");
  }
  
  if (textWalls > 1) {
    formattingScore -= 5;
    result.issues.push("Massive blocks of text detected (Text Walls)");
    result.recommendations.push("Break down large paragraphs into smaller, readable bullet points. ATS parsers struggle with massive text blocks.");
  }

  result.categoryScores.formatting = Math.max(0, formattingScore);
  if (formattingScore === 10) result.strengths.push("Formatting is clean and ATS-parser safe");

  // 8. Text Quality (5 points)
  let textQualityScore = 5;
  if (rawText.length < 600) {
    textQualityScore = 2;
    result.issues.push("Resume is extremely short");
    result.recommendations.push("Expand on your experience. A standard professional resume should have enough text to convey deep expertise.");
  } else if (rawText.length > 8000) {
    textQualityScore = 3;
    result.issues.push("Resume is extremely long");
    result.recommendations.push("Consider condensing your resume to the most relevant 1-2 pages. Overly long resumes can dilute your keyword relevance.");
  }
  result.categoryScores.textQuality = textQualityScore;

  result.overallScore = 
    contactScore + structureScore + headingScore + skillsScore + 
    experienceScore + keywordScore + formattingScore + textQualityScore;

  // Deduplicate strings just in case
  result.strengths = Array.from(new Set(result.strengths));
  result.issues = Array.from(new Set(result.issues));
  result.recommendations = Array.from(new Set(result.recommendations));

  return result;
}
