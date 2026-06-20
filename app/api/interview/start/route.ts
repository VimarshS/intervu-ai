import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/ai/router";
import {
  buildInterviewerSystemPrompt,
  buildFirstMessagePrompt,
} from "@/lib/ai/prompts/interviewer";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { InterviewType, ExperienceLevel } from "@/types/database";
import { deductCredit } from "@/lib/credits/deductCredit";

const startSessionSchema = z.object({
  role: z.string().min(1),
  company: z.string().optional().nullable(),
  interview_type: z.enum([
    "behavioral",
    "technical",
    "coding",
    "system_design",
    "mixed",
  ] as const),
  experience_level: z.enum([
    "fresher",
    "junior",
    "mid",
    "senior",
  ] as const),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify auth
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

    // Validate request body
    const body = await request.json();
    const parsed = startSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { role, company, interview_type, experience_level } = parsed.data;

    // Build system prompt from context
    const systemPrompt = buildInterviewerSystemPrompt({
      role,
      company: company ?? null,
      interviewType: interview_type as InterviewType,
      experienceLevel: experience_level as ExperienceLevel,
    });

    // Get first AI message
    const firstMessage = await generateAIResponse(
      systemPrompt,
      buildFirstMessagePrompt(),
      []
    );

    // Create session in database
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: user.id,
        role,
        company: company ?? null,
        interview_type,
        status: "in_progress",
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Save first AI message to interview_messages
    const { error: messageError } = await supabase
      .from("interview_messages")
      .insert({
        session_id: session.id,
        role: "assistant",
        content: firstMessage,
      });

    if (messageError) {
      console.error("Message save error:", messageError);
    }

    return NextResponse.json({
      session_id: session.id,
      message: firstMessage,
      system_prompt: systemPrompt,
    });
  } catch (error) {
    console.error("Start interview error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to start interview",
      },
      { status: 500 }
    );
  }
}