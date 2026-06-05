export type ExperienceLevel = "fresher" | "junior" | "mid" | "senior";
export type InterviewType =
  | "behavioral"
  | "technical"
  | "coding"
  | "system_design"
  | "mixed";
export type InterviewStatus = "in_progress" | "completed" | "abandoned";
export type MessageRole = "user" | "assistant";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  target_role: string | null;
  target_company: string | null;
  experience_level: ExperienceLevel | null;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
  // New fields
  linkedin_url: string | null;
  github_url: string | null;
  bio: string | null;
  skills: string[] | null;
  interview_goal: string | null;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  role: string;
  company: string | null;
  interview_type: InterviewType;
  status: InterviewStatus;
  total_score: number | null;
  duration_seconds: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface InterviewMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface FeedbackReport {
  id: string;
  session_id: string;
  user_id: string;
  technical_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
  overall_score: number | null;
  strengths: string[] | null;
  improvements: string[] | null;
  detailed_feedback: string | null;
  created_at: string;
}

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  file_url: string;
  extracted_text: string | null;
  gap_analysis: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  predicted_questions: string[] | null;
  ats_score: number | null;
  created_at: string;
}

// Joined types for common queries
export interface SessionWithFeedback extends InterviewSession {
  feedback_reports: FeedbackReport | null;
}

export interface SessionWithMessages extends InterviewSession {
  interview_messages: InterviewMessage[];
}