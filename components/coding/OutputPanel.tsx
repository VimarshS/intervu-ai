"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface OutputPanelProps {
  output: string | null;
  error: string | null;
  isRunning: boolean;
  executionTime?: number | null;
  language?: string;
}

export function OutputPanel({
  output,
  error,
  isRunning,
  executionTime,
  language,
}: OutputPanelProps) {
  const hasOutput = output !== null && output.length > 0;
  const hasError = error !== null && error.length > 0;
  const isEmpty = !isRunning && !hasOutput && !hasError;

  return (
    <div className="flex flex-col h-full rounded-lg border overflow-hidden">
      {/* Output Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Output</span>
          {language && (
            <Badge variant="outline" className="text-xs capitalize">
              {language}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Running...
            </div>
          )}
          {!isRunning && hasOutput && !hasError && (
            <div className="flex items-center gap-1.5 text-xs text-green-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Success
            </div>
          )}
          {!isRunning && hasError && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <XCircle className="h-3.5 w-3.5" />
              Error
            </div>
          )}
          {executionTime !== null && executionTime !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {executionTime}ms
            </Badge>
          )}
        </div>
      </div>

      {/* Output Content */}
      <div
        className={cn(
          "flex-1 p-4 font-mono text-sm overflow-auto bg-zinc-950",
          "min-h-[120px]"
        )}
      >
        {isEmpty && (
          <p className="text-muted-foreground text-xs">
            Run your code to see output here...
          </p>
        )}

        {isRunning && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Executing code...
          </div>
        )}

        {!isRunning && hasOutput && (
          <pre
            className={cn(
              "whitespace-pre-wrap break-words text-xs leading-relaxed",
              hasError ? "text-red-400" : "text-green-400"
            )}
          >
            {output}
          </pre>
        )}

        {!isRunning && !hasOutput && hasError && (
          <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-red-400">
            {error}
          </pre>
        )}
      </div>
    </div>
  );
}