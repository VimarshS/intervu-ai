import { create } from "zustand";

export type InterviewState = "idle" | "setup" | "active" | "ending" | "feedback";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type FeedbackReport = {
  id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  strengths: string[];
  improvements: string[];
  detailed_feedback: string;
};

export type InterviewConfig = {
  role: string;
  company: string | null;
  interview_type:
    | "behavioral"
    | "technical"
    | "coding"
    | "system_design"
    | "mixed";
  experience_level: "fresher" | "junior" | "mid" | "senior";
};

interface InterviewStore {
  // State
  interviewState: InterviewState;
  sessionId: string | null;
  systemPrompt: string;
  messages: Message[];
  feedback: FeedbackReport | null;
  config: InterviewConfig | null;
  startTime: Date | null;
  elapsed: number;
  isAiTyping: boolean;

  // Actions
  setInterviewState: (state: InterviewState) => void;
  setSessionId: (id: string) => void;
  setSystemPrompt: (prompt: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setFeedback: (feedback: FeedbackReport) => void;
  setConfig: (config: InterviewConfig) => void;
  setStartTime: (date: Date) => void;
  setElapsed: (seconds: number) => void;
  setIsAiTyping: (typing: boolean) => void;
  resetSession: () => void;
}

const initialState = {
  interviewState: "setup" as InterviewState,
  sessionId: null,
  systemPrompt: "",
  messages: [],
  feedback: null,
  config: null,
  startTime: null,
  elapsed: 0,
  isAiTyping: false,
};

export const useInterviewStore = create<InterviewStore>((set) => ({
  ...initialState,

  setInterviewState: (state) => set({ interviewState: state }),
  setSessionId: (id) => set({ sessionId: id }),
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setFeedback: (feedback) => set({ feedback }),
  setConfig: (config) => set({ config }),
  setStartTime: (date) => set({ startTime: date }),
  setElapsed: (seconds) => set({ elapsed: seconds }),
  setIsAiTyping: (typing) => set({ isAiTyping: typing }),
  resetSession: () => set(initialState),
}));