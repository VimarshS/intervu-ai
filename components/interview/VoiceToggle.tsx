"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceToggleProps {
  isSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isVoiceMode: boolean;
  fillerWordCount: number;
  onToggleVoiceMode: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
}

export function VoiceToggle({
  isSupported,
  isListening,
  isSpeaking,
  isVoiceMode,
  fillerWordCount,
  onToggleVoiceMode,
  onStartListening,
  onStopListening,
  onStopSpeaking,
}: VoiceToggleProps) {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
        <span>Voice mode requires Chrome or Edge</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Voice mode toggle */}
      <Button
        variant={isVoiceMode ? "default" : "outline"}
        size="sm"
        onClick={onToggleVoiceMode}
        className={cn(
          "gap-1.5 text-xs",
          isVoiceMode && "bg-primary text-primary-foreground"
        )}
      >
        {isVoiceMode ? (
          <Volume2 className="h-3.5 w-3.5" />
        ) : (
          <VolumeX className="h-3.5 w-3.5" />
        )}
        {isVoiceMode ? "Voice On" : "Voice Off"}
      </Button>

      {/* Mic button — only shown in voice mode */}
      {isVoiceMode && (
        <>
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            onClick={isListening ? onStopListening : onStartListening}
            disabled={isSpeaking}
            className="gap-1.5 text-xs"
          >
            {isListening ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" />
                Speak
              </>
            )}
          </Button>

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <div className="flex gap-0.5">
                <div className="h-3 w-0.5 bg-primary rounded animate-bounce [animation-delay:0ms]" />
                <div className="h-3 w-0.5 bg-primary rounded animate-bounce [animation-delay:100ms]" />
                <div className="h-3 w-0.5 bg-primary rounded animate-bounce [animation-delay:200ms]" />
              </div>
              <span>AI speaking...</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onStopSpeaking}
                className="h-6 px-2 text-xs"
              >
                Stop
              </Button>
            </div>
          )}

          {/* Listening indicator */}
          {isListening && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span>Listening...</span>
            </div>
          )}

          {/* Filler word counter */}
          {fillerWordCount > 0 && (
            <Badge
              variant="outline"
              className="text-xs gap-1 text-yellow-600 border-yellow-400"
            >
              <AlertTriangle className="h-3 w-3" />
              {fillerWordCount} filler{" "}
              {fillerWordCount === 1 ? "word" : "words"}
            </Badge>
          )}
        </>
      )}
    </div>
  );
}