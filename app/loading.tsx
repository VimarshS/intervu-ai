import { BrainCircuit } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium">Loading...</p>
          <p className="text-xs text-muted-foreground">
            Preparing your interview platform
          </p>
        </div>
      </div>
    </div>
  );
}