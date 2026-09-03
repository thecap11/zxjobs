import { db } from "../db";

export interface AIResponse {
  text: string;
}

export class FallbackRouter {
  
  // Helper to fetch keys that are not exhausted (or were exhausted > 24 hours ago)
  private async getAvailableKeys() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const keys = await db.apiKey.findMany({
      where: {
        OR: [
          { exhaustedAt: null },
          { exhaustedAt: { lt: twentyFourHoursAgo } }
        ]
      },
      orderBy: { updatedAt: 'asc' } // try least recently used first
    });
    
    return keys;
  }

  // Mark a key as exhausted in the DB
  private async markKeyExhausted(id: string) {
    console.warn(`[AI Router] Marking key ID ${id} as exhausted for 24 hours.`);
    await db.apiKey.update({
      where: { id },
      data: { exhaustedAt: new Date() }
    });
  }

  // Generic request handler for OpenAI-compatible endpoints (Groq, OpenRouter)
  private async callOpenAICompatible(key: string, endpoint: string, model: string, prompt: string) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });

    if (res.status === 429 || res.status === 402 || res.status === 403) {
      throw new Error(`RATE_LIMIT`);
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API Error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices[0].message.content as string;
  }

  // Generic request handler for Google Gemini
  private async callGemini(key: string, prompt: string) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (res.status === 429 || res.status === 402 || res.status === 403) {
      throw new Error(`RATE_LIMIT`);
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API Error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.candidates[0].content.parts[0].text as string;
  }

  async generateText(prompt: string): Promise<string> {
    const keys = await this.getAvailableKeys();
    
    if (keys.length === 0) {
      throw new Error("All API keys are exhausted. Please wait 24 hours or add more keys.");
    }

    let lastError = null;

    for (const apiKey of keys) {
      try {
        console.log(`[AI Router] Attempting with ${apiKey.provider} key (ID: ${apiKey.id})...`);
        
        let result = "";
        
        if (apiKey.provider === "GROQ") {
          result = await this.callOpenAICompatible(
            apiKey.key, 
            "https://api.groq.com/openai/v1/chat/completions",
            "llama3-8b-8192", // Fixed Groq model
            prompt
          );
        } else if (apiKey.provider === "OPENROUTER") {
          result = await this.callOpenAICompatible(
            apiKey.key, 
            "https://openrouter.ai/api/v1/chat/completions",
            "google/gemma-2-9b-it:free", // Fixed OpenRouter free model
            prompt
          );
        } else if (apiKey.provider === "GEMINI") {
          // Changed to gemini-1.5-flash-latest
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey.key}`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });

          if (res.status === 429 || res.status === 402 || res.status === 403) {
            throw new Error(`RATE_LIMIT`);
          }

          if (!res.ok) {
            const err = await res.text();
            throw new Error(`API Error ${res.status}: ${err}`);
          }

          const data = await res.json();
          result = data.candidates[0].content.parts[0].text as string;
        } else {
          continue; // unknown provider
        }

        console.log(`[AI Router] Success using ${apiKey.provider}!`);
        return result;

      } catch (err: any) {
        lastError = err;
        if (err.message === "RATE_LIMIT" || err.message.includes("429")) {
          // Exhausted, mark it in the DB and try the next one
          await this.markKeyExhausted(apiKey.id);
        } else {
          // It was a different error, maybe bad prompt, we still log it and move to next key to be safe
          console.warn(`[AI Router] Non-rate-limit error with ${apiKey.provider}:`, err.message);
        }
      }
    }

    throw new Error(`All available keys failed. Last error: ${lastError?.message}`);
  }
}

export const aiRouter = new FallbackRouter();
