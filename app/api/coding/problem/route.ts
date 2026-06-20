import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/ai/router";
import { buildCodingProblemPrompt } from "@/lib/ai/prompts/coding";
import { NextResponse } from "next/server";
import { z } from "zod";
import { deductCredit } from "@/lib/credits/deductCredit";

const schema = z.object({
  language: z.string().min(1),
  topic: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

// Credit check — deduct before AI call
const creditResult = await deductCredit(user.id);
if (!creditResult.success) {
  return NextResponse.json(
    {
      error: creditResult.message,
      requiresPayment: creditResult.requiresPayment ?? false,
    },
    { status: 402 }
  );
}

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("target_role, experience_level")
      .eq("id", user.id)
      .single();

    const prompt = buildCodingProblemPrompt({
      role: profile?.target_role ?? null,
      experienceLevel: profile?.experience_level ?? null,
      language: parsed.data.language,
      topic: parsed.data.topic,
    });

    const raw = await generateAIResponse(
      prompt,
      "Generate a coding problem now.",
      []
    );

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const problem = JSON.parse(cleaned);

    // Validate that required LeetCode-style fields exist
    // Provide safe defaults if AI omits them
    const safeProblem = {
      ...problem,
      helper_code: problem.helper_code ?? "",
      starter_code:
        problem.starter_code ?? getDefaultStarterCode(parsed.data.language),
      driver_code: problem.driver_code ?? "",
    };

    return NextResponse.json({ problem: safeProblem });
  } catch (error) {
    console.error("Problem generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate problem" },
      { status: 500 }
    );
  }
}

// Safe fallback if AI forgets to include starter_code
function getDefaultStarterCode(language: string): string {
  const defaults: Record<string, string> = {
    python: "def solution():\n    # Write your solution here\n    pass\n",
    javascript:
      "function solution() {\n    // Write your solution here\n}\n",
    typescript:
      "function solution(): void {\n    // Write your solution here\n}\n",
    java: "class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}\n",
    cpp: "void solution() {\n    // Write your solution here\n}\n",
    c: "void solution() {\n    // Write your solution here\n}\n",
    go: "func solution() {\n    // Write your solution here\n}\n",
    rust: "fn solution() {\n    // Write your solution here\n}\n",
  };
  return defaults[language] ?? "// Write your solution here\n";
}