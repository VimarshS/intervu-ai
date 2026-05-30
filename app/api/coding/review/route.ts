import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/ai/router";
import { buildCodeReviewPrompt } from "@/lib/ai/prompts/coding";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  problem: z.string().min(1),
  code: z.string().min(1),
  language: z.string().min(1),
  output: z.string(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { problem, code, language, output } = parsed.data;

    const prompt = buildCodeReviewPrompt(problem, code, language, output);
    const raw = await generateAIResponse(prompt, "Review this solution now.", []);
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const review = JSON.parse(cleaned);

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Code review error:", error);
    return NextResponse.json({ error: "Failed to generate review" }, { status: 500 });
  }
}