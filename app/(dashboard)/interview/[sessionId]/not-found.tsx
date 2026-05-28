import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SessionNotFound() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <FileQuestion className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">Session Not Found</p>
            <p className="text-sm text-muted-foreground mt-1">
              This interview session doesn&apos;t exist or you
              don&apos;t have access to it.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/history">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}