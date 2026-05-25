import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  console.warn(
    "GROQ_API_KEY is not set — Groq fallback will not be available"
  );
}

const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

export async function generateWithGroq(
  systemPrompt: string,
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  if (!groqClient) {
    throw new Error(
      "Groq client is not initialized — GROQ_API_KEY is missing"
    );
  }

  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ];

  const completion = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.8,
    max_tokens: 1024,
  });

  const response = completion.choices[0]?.message?.content;

  if (!response) {
    throw new Error("Empty response from Groq");
  }

  return response;
}