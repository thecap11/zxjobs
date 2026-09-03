import fs from 'fs';
import { db } from './src/lib/db';

async function testGeminiPdf() {
  try {
    // Get a gemini key
    const apiKeyData = await db.apiKey.findFirst({ where: { provider: 'GEMINI' } });
    if (!apiKeyData) throw new Error("No Gemini key");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKeyData.key}`;
    
    // Create a dummy pdf buffer
    const buffer = Buffer.from("%PDF-1.4\n1 0 obj\n<<\n/Title (Dummy)\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF");
    const base64 = buffer.toString('base64');

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "What is the title of this PDF?" },
            { inlineData: { mimeType: "application/pdf", data: base64 } }
          ]
        }]
      })
    });

    console.log(res.status);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
testGeminiPdf();
