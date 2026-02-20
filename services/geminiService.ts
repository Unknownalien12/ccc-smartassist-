import { GoogleGenAI } from "@google/genai";
import { Message, KnowledgeItem } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateResponse = async (
  history: Message[],
  userMessage: string,
  knowledgeBase: KnowledgeItem[],
  dynamicApiKey?: string
): Promise<string> => {

  // Prioritize the key from Admin Settings, fall back to Env Var
  const apiKey = dynamicApiKey || process.env.API_KEY || '';

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // Initialize client with the effective key
  const ai = new GoogleGenAI({ apiKey });

  // 1. Construct the context from the Knowledge Base
  // In a real app with many docs, we would use vector search here.
  // For this demo, we simply inject the relevant text or all text if small enough.
  const knowledgeContext = knowledgeBase
    .map((item) => `[Topic: ${item.question}]\n[Content: ${item.answer}]`)
    .join("\n\n");

  const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n\n=== OFFICIAL KNOWLEDGE BASE ===\n${knowledgeContext}`;

  try {
    // 2. Prepare the model
    // Using gemini-2.5-flash for speed/cost.
    const modelId = "gemini-2.5-flash";

    // 3. Format history for the API
    // The API expects 'user' and 'model' roles.
    const contents = history
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // 4. Call the API
    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.7, // Increased for a more "human" and emotive feel
      },
    });

    return response.text || "I apologize, but I couldn't generate a response at the moment.";

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Check for quota or key errors to trigger fallback in UI
    if (error.message?.includes("429") || error.message?.includes("Quota") || error.message?.includes("API key") || !apiKey) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
};