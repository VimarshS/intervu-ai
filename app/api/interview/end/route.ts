import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/ai/router";
import { buildFeedbackPrompt } from "@/lib/ai/prompts/feedback";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { InterviewType, ExperienceLevel } from "@/types/database";

const endSessionSchema = z.object({
  session_id: z.string().uuid(),
  duration_seconds: z.number().int().positive(),
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

    // Validate request body
    const body = await request.json();
    const parsed = endSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { session_id, duration_seconds } = parsed.data;

    // Fetch session with full details
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", session_id)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "in_progress") {
      return NextResponse.json(
        { error: "Session is already ended" },
        { status: 400 }
      );
    }

    // Fetch all messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from("interview_messages")
      .select("role, content")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true });

    if (messagesError || !messages || messages.length < 2) {
      // Not enough messages to generate meaningful feedback
      // Mark as abandoned instead
      await supabase
        .from("interview_sessions")
        .update({
          status: "abandoned",
          duration_seconds,
          completed_at: new Date().toISOString(),
        })
        .eq("id", session_id);

      return NextResponse.json(
        { error: "Not enough conversation to generate feedback" },
        { status: 400 }
      );
    }

    // Build feedback prompt with full conversation
    const feedbackPrompt = buildFeedbackPrompt({
      role: session.role,
      company: session.company,
      interviewType: session.interview_type as InterviewType,
      experienceLevel: session.experience_level as ExperienceLevel ?? "fresher",
      conversation: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // Generate feedback from AI
    // We use a single prompt here — not a chat — so history is empty
    const rawFeedback = await generateAIResponse(
      feedbackPrompt,
      "Generate the feedback report now.",
      []
    );

    // Parse JSON response safely
    let feedbackData: {
      overall_score: number;
      technical_score: number;
      communication_score: number;
      problem_solving_score: number;
      strengths: string[];
      improvements: string[];
      detailed_feedback: string;
    };

    try {
      // Strip markdown code fences if present despite instructions
      const cleaned = rawFeedback
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      feedbackData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse feedback JSON:", rawFeedback);
      return NextResponse.json(
        { error: "Failed to parse AI feedback. Please try again." },
        { status: 500 }
      );
    }

    // Save feedback report to database
    const { data: feedbackReport, error: feedbackError } = await supabase
      .from("feedback_reports")
      .insert({
        session_id,
        user_id: user.id,
        technical_score: feedbackData.technical_score,
        communication_score: feedbackData.communication_score,
        problem_solving_score: feedbackData.problem_solving_score,
        overall_score: feedbackData.overall_score,
        strengths: feedbackData.strengths,
        improvements: feedbackData.improvements,
        detailed_feedback: feedbackData.detailed_feedback,
      })
      .select()
      .single();

    if (feedbackError) {
      console.error("Feedback save error:", feedbackError);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    // Update session status to completed
    await supabase
      .from("interview_sessions")
      .update({
        status: "completed",
        total_score: feedbackData.overall_score,
        duration_seconds,
        completed_at: new Date().toISOString(),
      })
      .eq("id", session_id);

    return NextResponse.json({
      feedback: feedbackReport,
    });
  } catch (error) {
    console.error("End interview error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to end interview",
      },
      { status: 500 }
    );
  }
}