export interface ResumeAnalysisContext {
  resumeText: string;
  targetRole: string | null;
  targetCompany: string | null;
  experienceLevel: string | null;
}

export function buildResumeAnalysisPrompt(
  context: ResumeAnalysisContext
): string {
  const roleContext = context.targetRole
    ? `The candidate is targeting the role: ${context.targetRole}.`
    : "No specific target role provided — give general analysis.";

  const companyContext = context.targetCompany
    ? `Their target company is: ${context.targetCompany}. Consider this company's known hiring bar.`
    : "";

  const levelContext = context.experienceLevel
    ? `Their experience level is: ${context.experienceLevel}.`
    : "";

  return `
You are an expert technical recruiter and career coach analyzing a candidate's resume.

CANDIDATE CONTEXT:
${roleContext}
${companyContext}
${levelContext}

RESUME TEXT:
${context.resumeText}

ANALYSIS TASK:
Analyze this resume thoroughly and return ONLY a valid JSON object.
No markdown, no backticks, no explanation outside the JSON.

Return exactly this structure:

{
  "ats_score": <integer 0-100>,
  "strengths": [
    "<specific strength from the resume>",
    "<specific strength from the resume>",
    "<specific strength from the resume>"
  ],
  "weaknesses": [
    "<specific gap or weakness in the resume>",
    "<specific gap or weakness in the resume>",
    "<specific gap or weakness in the resume>"
  ],
  "gap_analysis": "<2-3 paragraphs analyzing gaps between the resume and target role requirements. Be specific about missing skills, experiences, or keywords. Reference actual content from the resume.>",
  "predicted_questions": [
    "<interview question likely to be asked based on this specific resume>",
    "<interview question likely to be asked based on this specific resume>",
    "<interview question likely to be asked based on this specific resume>",
    "<interview question likely to be asked based on this specific resume>",
    "<interview question likely to be asked based on this specific resume>"
  ]
}

ATS SCORE GUIDELINES:
- 85-100: Excellent — well-formatted, keyword-rich, ATS friendly
- 70-84: Good — minor improvements needed
- 50-69: Average — significant gaps in keywords or formatting
- 30-49: Below average — major issues with structure or relevance
- 0-29: Poor — unlikely to pass ATS screening

IMPORTANT RULES:
- Base ALL analysis on the actual resume text provided
- Predicted questions must be specific to THIS resume — not generic
- Strengths and weaknesses must reference actual content
- Gap analysis must mention specific missing skills for the target role
- Return ONLY the JSON — nothing else
  `.trim();
}