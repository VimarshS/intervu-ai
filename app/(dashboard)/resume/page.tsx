import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ResumePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resume Analyzer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get AI feedback on your resume and predicted interview questions
        </p>
      </div>
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Coming in Day 8</p>
            <p className="text-sm text-muted-foreground mt-1">
              Resume upload and AI analysis coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}