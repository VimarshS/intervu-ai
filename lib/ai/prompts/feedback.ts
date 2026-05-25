import type { InterviewType, ExperienceLevel } from "@/types/database";

export interface FeedbackContext {
  role: string;
  company: string | null;
  interviewType: InterviewType;
  experienceLevel: ExperienceLevel;
  conversation: { role: "user" | "assistant"; content: string }[];
}

export function buildFeedbackPrompt(context: FeedbackContext): string {
  const conversationText = context.conversation
    .map((msg) => {
      const speaker =
        msg.role === "assistant" ? "Interviewer" : "Candidate";
      return `${speaker}: ${msg.content}`;
    })
    .join("\n\n");

  return `
You are an expert interview coach evaluating a ${context.interviewType} interview.

INTERVIEW DETAILS:
- Role: ${context.role}
- Company: ${context.company ?? "General"}
- Candidate Level: ${context.experienceLevel}
- Interview Type: ${context.interviewType}

FULL INTERVIEW TRANSCRIPT:
${conversationText}

EVALUATION TASK:
Analyze the candidate's performance across the entire interview transcript above.
You must respond with ONLY a valid JSON object — no markdown, no backticks, no explanation outside the JSON.

Evaluate and return this exact JSON structure:

{
  "overall_score": <integer 0-10>,
  "technical_score": <integer 0-10>,
  "communication_score": <integer 0-10>,
  "problem_solving_score": <integer 0-10>,
  "strengths": [
    "<specific strength observed in the interview>",
    "<specific strength observed in the interview>",
    "<specific strength observed in the interview>"
  ],
  "improvements": [
    "<specific area to improve with actionable advice>",
    "<specific area to improve with actionable advice>",
    "<specific area to improve with actionable advice>"
  ],
  "detailed_feedback": "<3-4 paragraph honest, constructive, specific feedback referencing actual moments from the interview. Mention what the candidate said and how they could have answered better. End with an encouraging closing note.>"
}

SCORING GUIDELINES:
- 9-10: Exceptional — would strongly recommend hiring
- 7-8: Strong — would recommend with minor reservations
- 5-6: Average — needs improvement in key areas
- 3-4: Below average — significant gaps identified
- 1-2: Poor — not ready for this level of interview

IMPORTANT RULES:
- Base ALL feedback on the actual transcript — never invent examples
- Be honest but constructive — identify real gaps without being harsh
- Strengths and improvements must be SPECIFIC to what was said
- detailed_feedback must reference actual moments from the conversation
- Return ONLY the JSON object — nothing else
  `.trim();
}