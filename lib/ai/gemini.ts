import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });
}

export async function generateWithGemini(
  systemPrompt: string,
  userMessage: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[] = []
): Promise<string> {
  const model = getGeminiModel();

  const chat = model.startChat({
    history: [
      // Inject system prompt as first user+model exchange
      // Gemini does not have a native system role in chat —
      // this is the correct pattern for persistent instructions
      {
        role: "user",
        parts: [{ text: `Instructions: ${systemPrompt}` }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I will follow these instructions for our conversation.",
          },
        ],
      },
      ...history,
    ],
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response.text();

  if (!response) {
    throw new Error("Empty response from Gemini");
  }

  return response;
}