import { createClient } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/ai/router";
import { buildResumeAnalysisPrompt } from "@/lib/ai/prompts/resume";
import { NextResponse } from "next/server";
import { deductCredit } from "@/lib/credits/deductCredit";

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

    // Get form data — file upload
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    const extractedText = formData.get("extracted_text") as string | null;

    if (!file || !extractedText) {
      return NextResponse.json(
        { error: "Resume file and extracted text are required" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("target_role, target_company, experience_level")
      .eq("id", user.id)
      .single();

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload resume" },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(uploadData.path);

    const fileUrl = urlData.publicUrl;

    // Build analysis prompt with profile context
    const analysisPrompt = buildResumeAnalysisPrompt({
      resumeText: extractedText,
      targetRole: profile?.target_role ?? null,
      targetCompany: profile?.target_company ?? null,
      experienceLevel: profile?.experience_level ?? null,
    });

    // Generate AI analysis
    const rawAnalysis = await generateAIResponse(
      analysisPrompt,
      "Analyze this resume now.",
      []
    );

    // Parse JSON response safely
    let analysisData: {
      ats_score: number;
      strengths: string[];
      weaknesses: string[];
      gap_analysis: string;
      predicted_questions: string[];
    };

    try {
      const cleaned = rawAnalysis
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      analysisData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse analysis JSON:", rawAnalysis);
      return NextResponse.json(
        { error: "Failed to parse AI analysis. Please try again." },
        { status: 500 }
      );
    }

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("resume_analyses")
      .insert({
        user_id: user.id,
        file_url: fileUrl,
        extracted_text: extractedText,
        gap_analysis: analysisData.gap_analysis,
        strengths: analysisData.strengths,
        weaknesses: analysisData.weaknesses,
        predicted_questions: analysisData.predicted_questions,
        ats_score: analysisData.ats_score,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Database save error:", saveError);
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis: savedAnalysis });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze resume",
      },
      { status: 500 }
    );
  }
}