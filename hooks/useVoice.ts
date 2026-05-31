"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useEffect, useRef, useCallback } from "react";

export interface VoiceState {
  isSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  fillerWordCount: number;
  error: string | null;
}

export interface UseVoiceReturn extends VoiceState {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  resetTranscript: () => void;
  resetFillerCount: () => void;
}

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically",
  "actually", "literally", "so", "right", "okay",
];

function countFillerWords(text: string): number {
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

export function useVoice(): UseVoiceReturn {
  const [state, setState] = useState<VoiceState>({
    isSupported: false,
    isListening: false,
    isSpeaking: false,
    transcript: "",
    interimTranscript: "",
    fillerWordCount: 0,
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported =
      !!SpeechRecognitionAPI && !!window.speechSynthesis;

    setState((prev) => ({ ...prev, isSupported }));

    if (isSupported) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setState((prev) => ({
        ...prev,
        error: "Speech recognition not supported in this browser",
      }));
      return;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: null,
        interimTranscript: "",
      }));
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setState((prev) => {
        const newTranscript = prev.transcript + final;
        const newFillerCount =
          prev.fillerWordCount + countFillerWords(final);

        return {
          ...prev,
          transcript: newTranscript,
          interimTranscript: interim,
          fillerWordCount: newFillerCount,
        };
      });
    };

    recognition.onerror = (event: any) => {
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: `Speech error: ${event.error}`,
      }));
    };

    recognition.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
        interimTranscript: "",
      }));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isListening: false,
      interimTranscript: "",
    }));
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!synthRef.current) return;

      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Google") ||
          v.name.includes("Natural") ||
          v.name.includes("Neural")
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isSpeaking: true }));
      };

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
        onEnd?.();
      };

      utterance.onerror = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
        onEnd?.();
      };

      synthRef.current.speak(utterance);
    },
    []
  );

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: "",
      interimTranscript: "",
    }));
  }, []);

  const resetFillerCount = useCallback(() => {
    setState((prev) => ({ ...prev, fillerWordCount: 0 }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
    resetFillerCount,
  };
}