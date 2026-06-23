import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useInterviewStore,
  type InterviewConfig,
  type Message,
} from "@/store/interviewStore";

export function useInterview() {
  const router = useRouter();
  const store = useInterviewStore();

  // Timer — increments elapsed every second while interview is active
  useEffect(() => {
    if (store.interviewState !== "active" || !store.startTime) return;

    const interval = setInterval(() => {
      store.setElapsed(
        Math.floor((Date.now() - store.startTime!.getTime()) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [store.interviewState, store.startTime]);

  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const startInterview = useCallback(
  async (config: InterviewConfig) => {
    store.setConfig(config);

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      // Return 402 so the page can show upgrade modal
      if (response.status === 402) {
        return { requiresPayment: true };
      }

      if (!response.ok) {
        toast.error(result.error ?? "Failed to start interview");
        return { success: false };
      }

      store.setSessionId(result.session_id);
      store.setSystemPrompt(result.system_prompt);
      store.setMessages([
        { role: "assistant", content: result.message },
      ]);
      store.setStartTime(new Date());
      store.setInterviewState("active");
      return { success: true };
    } catch {
      toast.error("Failed to connect. Please try again.");
      return { success: false };
    }
  },
  [store]
);
  const sendMessage = useCallback(
    async (userInput: string) => {
      const trimmed = userInput.trim();
      if (!trimmed || store.isAiTyping || !store.sessionId) return false;

      const newMessage: Message = { role: "user", content: trimmed };
      const updatedMessages = [...store.messages, newMessage];

      store.addMessage(newMessage);
      store.setIsAiTyping(true);

      try {
        const response = await fetch("/api/interview/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: store.sessionId,
            user_message: trimmed,
            system_prompt: store.systemPrompt,
            history: store.messages,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
  const errorMessage = result.error ?? "Failed to get response";

  // Session no longer exists — reset to idle so user can start fresh
  if (
    response.status === 404 ||
    errorMessage.toLowerCase().includes("session") ||
    errorMessage.toLowerCase().includes("no longer") ||
    errorMessage.toLowerCase().includes("not found")
  ) {
    toast.error("Interview session ended. Please start a new interview.");
    store.resetSession();
    return false;
  }

  toast.error(errorMessage);
  return false;
}

        store.addMessage({
          role: "assistant",
          content: result.message,
        });

        return true;
      } catch {
        toast.error("Connection error. Please try again.");
        return false;
      } finally {
        store.setIsAiTyping(false);
      }
    },
    [store]
  );

  const endInterview = useCallback(async () => {
    if (!store.sessionId) return false;

   // If no user messages sent — only the AI greeting exists
// Skip feedback API and reset immediately
const userMessages = store.messages.filter((m) => m.role === "user");
if (userMessages.length === 0) {
  store.resetSession();
  return true;
}

    store.setInterviewState("ending");

    try {
      const response = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: store.sessionId,
          duration_seconds: store.elapsed,
        }),
      });

      const result = await response.json();

     if (!response.ok) {
  const errorMessage = result.error ?? "Failed to generate feedback";

  if (
    response.status === 404 ||
    errorMessage.toLowerCase().includes("session") ||
    errorMessage.toLowerCase().includes("no longer")
  ) {
    toast.error("Session expired. Redirecting to start page.");
    store.resetSession();
    return false;
  }

  toast.error(errorMessage);
  store.setInterviewState("active");
  return false;
}

      store.setFeedback(result.feedback);
      store.setInterviewState("feedback");
      return true;
    } catch {
      toast.error("Failed to end interview. Please try again.");
      store.setInterviewState("active");
      return false;
    }
  }, [store]);

  const resetInterview = useCallback(() => {
    store.resetSession();
  }, [store]);

  return {
    // State
    interviewState: store.interviewState,
    messages: store.messages,
    feedback: store.feedback,
    config: store.config,
    isAiTyping: store.isAiTyping,
    elapsed: store.elapsed,
    sessionId: store.sessionId,

    // Helpers
    formatTime,

    // Actions
    startInterview,
    sendMessage,
    endInterview,
    resetInterview,
  };
}