import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;
function client() {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

export async function callGemini(systemPrompt, userPrompt, { maxTokens = 4096 } = {}) {
  const model = client().getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: maxTokens },
  });

  const result = await model.generateContent(userPrompt);
  const response = result.response;

  // RULE (Phase 9.3): log token counts only, never prompt/response content
  const usage = response.usageMetadata;
  if (usage) {
    console.log(`[gemini] tokens: in=${usage.promptTokenCount} out=${usage.candidatesTokenCount}`);
  }

  return response.text();
}
