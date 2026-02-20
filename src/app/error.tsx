"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 bg-gradient-to-b from-[#f5f0eb] via-background to-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-destructive/[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <h2 className="font-display text-3xl font-bold tracking-tight mb-3">
          Something went wrong
        </h2>
        <p className="text-muted-foreground text-base mb-8 max-w-sm mx-auto">
          An unexpected error occurred. Please try again or head back to safety.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} size="lg" className="rounded-xl">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
