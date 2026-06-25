import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Home, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">Intervu AI</span>
        </div>

        <Card>
          <CardContent className="py-12 space-y-4">
            {/* 404 */}
            <p className="text-8xl font-bold text-primary/20">404</p>

            <div className="space-y-2">
              <p className="text-xl font-semibold">Page not found</p>
              <p className="text-sm text-muted-foreground">
                The page you are looking for doesn&apos;t exist or
                has been moved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}