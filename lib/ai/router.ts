import { generateWithGemini } from "./gemini";
import { generateWithGroq } from "./groq";

export type MessageHistory = {
  role: "user" | "assistant";
  content: string;
}[];

// Convert neutral history format to Gemini format
function toGeminiHistory(
  history: MessageHistory
): { role: "user" | "model"; parts: { text: string }[] }[] {
  return history.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}

// Convert neutral history format to Groq format (already compatible)
function toGroqHistory(
  history: MessageHistory
): { role: "user" | "assistant"; content: string }[] {
  return history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

export async function generateAIResponse(
  systemPrompt: string,
  userMessage: string,
  history: MessageHistory = []
): Promise<string> {
  // Always try Gemini first
  try {
    const response = await generateWithGemini(
      systemPrompt,
      userMessage,
      toGeminiHistory(history)
    );
    return response;
  } catch (geminiError) {
    console.warn(
      "Gemini failed, attempting Groq fallback:",
      geminiError instanceof Error ? geminiError.message : geminiError
    );

    // Fallback to Groq
    try {
      const response = await generateWithGroq(
        systemPrompt,
        userMessage,
        toGroqHistory(history)
      );
      return response;
    } catch (groqError) {
      console.error(
        "Both Gemini and Groq failed:",
        groqError instanceof Error ? groqError.message : groqError
      );
      throw new Error(
        "AI service is temporarily unavailable. Please try again."
      );
    }
  }
}