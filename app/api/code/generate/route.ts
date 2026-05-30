import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/ai/router";
import { NextResponse } from "next/server";
import { z } from "zod";

const generateSchema = z.object({
  prompt: z.string().min(1),
  language: z.string().min(1),
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

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { prompt } = parsed.data;

    const content = await generateAIResponse(
      prompt,
      "Generate the response now.",
      []
    );

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Code generate error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 }
    );
  }
}