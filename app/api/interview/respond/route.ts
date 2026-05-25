import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/ai/router";
import { NextResponse } from "next/server";
import { z } from "zod";

const respondSchema = z.object({
  session_id: z.string().uuid(),
  user_message: z.string().min(1, "Message cannot be empty"),
  system_prompt: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
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
    const parsed = respondSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { session_id, user_message, system_prompt, history } =
      parsed.data;

    // Verify session belongs to this user
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("id, status, user_id")
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
        { error: "Session is no longer active" },
        { status: 400 }
      );
    }

    // Save user message to database
    const { error: userMessageError } = await supabase
      .from("interview_messages")
      .insert({
        session_id,
        role: "user",
        content: user_message,
      });

    if (userMessageError) {
      console.error("User message save error:", userMessageError);
    }

    // Generate AI response with full history for context
    const aiResponse = await generateAIResponse(
      system_prompt,
      user_message,
      history
    );

    // Save AI response to database
    const { error: aiMessageError } = await supabase
      .from("interview_messages")
      .insert({
        session_id,
        role: "assistant",
        content: aiResponse,
      });

    if (aiMessageError) {
      console.error("AI message save error:", aiMessageError);
    }

    return NextResponse.json({
      message: aiResponse,
    });
  } catch (error) {
    console.error("Respond error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate response",
      },
      { status: 500 }
    );
  }
}