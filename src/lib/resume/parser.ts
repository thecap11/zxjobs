import { extractSkillsFromText, detectRoles } from "../skills/normalizer";
import { aiRouter } from "../ai/fallback-router";
import PDFParser from "pdf2json";

export interface ParsedResume {
  rawText: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  experienceYears: number | null;
  education: string | null;
  location: string | null;
  suggestedRoles: string[];
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    try {
      const pdfParser = new (PDFParser as any)(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF Parsing Error:", errData.parserError);
        pdfParser.destroy();
        resolve("");
      });
      
      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent() || "";
        pdfParser.destroy();
        resolve(text.replace(/\r\n/g, "\n"));
      });
      
      pdfParser.parseBuffer(buffer);
    } catch (err) {
      console.error("PDF2JSON init error:", err);
      resolve("");
    }
  });
}

export async function parsePdfBuffer(buffer: Buffer): Promise<ParsedResume> {
  const text = await extractTextFromPdf(buffer);

  if (!text || text.trim().length === 0) {
    return {
      rawText: "", name: null, email: null, phone: null, skills: [],
      experienceYears: null, education: null, location: null, suggestedRoles: []
    };
  }

  // --- AI PARSING ATTEMPT ---
  try {
    console.log("[Parser] Attempting AI extraction...");
    const prompt = `You are an expert ATS (Applicant Tracking System). Extract the following information from the resume text below.
    Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    Schema required:
    {
      "name": "Full name or null",
      "email": "Email address or null",
      "phone": "Phone number or null",
      "skills": ["skill1", "skill2"],
      "experienceYears": 5.5 (as a number) or null,
      "education": "Highest degree or null",
      "location": "City or null",
      "suggestedRoles": ["role1", "role2"]
    }
    Resume Text:
    ${text.substring(0, 4000)} // limit context to avoid massive token usage
    `;
    
    const aiResponse = await aiRouter.generateText(prompt);
    
    // Clean JSON markdown if any
    const jsonString = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    const aiParsed = JSON.parse(jsonString);

    console.log("[Parser] AI extraction successful!");
    return {
      rawText: text,
      name: aiParsed.name || null,
      email: aiParsed.email || null,
      phone: aiParsed.phone || null,
      skills: Array.isArray(aiParsed.skills) ? aiParsed.skills : [],
      experienceYears: typeof aiParsed.experienceYears === 'number' ? aiParsed.experienceYears : null,
      education: aiParsed.education || null,
      location: aiParsed.location || null,
      suggestedRoles: Array.isArray(aiParsed.suggestedRoles) ? aiParsed.suggestedRoles : [],
    };
  } catch (err) {
    console.warn("[Parser] AI extraction failed or rate limited, falling back to heuristics:", err);
  }

  // --- FALLBACK HEURISTICS (If AI Fails) ---
  console.log("[Parser] Using heuristic extraction fallback...");
  
  // 1. Email extraction
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  const email = emailMatch ? emailMatch[1] : null;

  // 2. Phone extraction (basic + international codes)
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  // 3. Name extraction
  const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
  let name = null;
  for (const line of lines.slice(0, 5)) {
    if (line.split(' ').length <= 4 && !line.includes('@') && !/\d/.test(line) && !/resume|cv|curriculum vitae/i.test(line)) {
      name = line;
      break;
    }
  }

  // 4. Skills extraction
  const skills = extractSkillsFromText(text);

  // 5. Roles detection
  const suggestedRoles = detectRoles(skills);

  // 6. Experience extraction (Enhanced)
  let experienceYears = null;
  const expRegexes = [
    /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:total\s+)?(?:experience|exp)/i,
    /(?:total\s+)?(?:experience|exp)[\s:|-]+(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i,
    /(?:over|more than)\s+(\d+(?:\.\d+)?)\s*(?:years?|yrs?)(?:\s*of)?\s*(?:experience|exp)/i,
  ];
  for (const regex of expRegexes) {
    const match = text.match(regex);
    if (match) {
      experienceYears = parseFloat(match[1]);
      break;
    }
  }

  // 7. Education extraction (Heuristic)
  let education = null;
  const eduKeywords = [
    "B.Tech", "M.Tech", "B.E", "B.E.", "BTech", "MTech", "BCA", "MCA", 
    "B.Sc", "M.Sc", "BSc", "MSc", "MBA", "BBA", "Ph.D", "PhD",
    "Bachelor of", "Master of", "Diploma"
  ];
  const eduRegex = new RegExp(`\\b(${eduKeywords.join("|").replace(/\./g, "\\.")})\\b`, "i");
  const eduMatch = text.match(eduRegex);
  if (eduMatch) {
    const matchedKeyword = eduMatch[1];
    const eduLine = lines.find((l: string) => l.toLowerCase().includes(matchedKeyword.toLowerCase()));
    education = eduLine ? eduLine.substring(0, 100) : matchedKeyword;
  }

  // 8. Location extraction
  const cities = [
    "Hyderabad", "Bangalore", "Bengaluru", "Pune", "Mumbai", "Delhi", "New Delhi", "Chennai", "Kolkata", "Noida", "Gurugram", "Gurgaon", "Ahmedabad", "Jaipur", "Chandigarh", "Kochi", "Trivandrum", "Indore", "Coimbatore", "Lucknow", "Bhubaneswar",
    "San Francisco", "New York", "London", "Toronto", "Singapore", "Dubai", "Remote"
  ];
  let location = null;
  const textLower = text.toLowerCase();
  for (const city of cities) {
    if (new RegExp(`\\b${city.toLowerCase()}\\b`).test(textLower)) {
      location = city;
      break;
    }
  }

  return {
    rawText: text,
    name,
    email,
    phone,
    skills,
    experienceYears,
    education,
    location,
    suggestedRoles,
  };
}
