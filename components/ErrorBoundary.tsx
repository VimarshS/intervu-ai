"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Card>
      <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message || "This section failed to load. Try refreshing."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetError}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Safe wrapper — catches async errors in client components
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    function handleError(event: ErrorEvent) {
      setError(event.error);
    }
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (error) {
    if (fallback) return <>{fallback}</>;
    return (
      <ErrorFallback
        error={error}
        resetError={() => setError(null)}
      />
    );
  }

  return <>{children}</>;
}

// HOC wrapper for quick component protection
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}