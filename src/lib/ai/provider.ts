import { GoogleGenerativeAI } from "@google/generative-ai";

export type LLMProvider = "gemini" | "claude" | "openai";

const DEFAULT_MODEL = "gemini-2.0-flash";

/**
 * Generate text using the configured LLM provider.
 * For now only Gemini is implemented via @google/generative-ai.
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const provider = (process.env.LLM_PROVIDER as LLMProvider) || "gemini";

  switch (provider) {
    case "gemini": {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
        systemInstruction: systemPrompt,
      });
      const result = await model.generateContent(userPrompt);
      const text = result.response.text();
      return text;
    }
    case "claude":
      throw new Error("Claude provider not implemented. Set LLM_PROVIDER=gemini.");
    case "openai":
      throw new Error("OpenAI provider not implemented. Set LLM_PROVIDER=gemini.");
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${provider}. Use gemini, claude, or openai.`);
  }
}
