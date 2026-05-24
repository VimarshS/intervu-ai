import { Card, CardContent } from "@/components/ui/card";
import { Code2 } from "lucide-react";

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coding Practice</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Solve coding problems with AI-powered hints and review
        </p>
      </div>
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <Code2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Coming in Day 10</p>
            <p className="text-sm text-muted-foreground mt-1">
              Monaco editor and coding interview module coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}