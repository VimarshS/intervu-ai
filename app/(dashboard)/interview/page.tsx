import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function InterviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mock Interview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-powered interview practice tailored to your role
        </p>
      </div>
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <MessageSquare className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Coming in Day 4</p>
            <p className="text-sm text-muted-foreground mt-1">
              AI mock interview engine is being built next
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}