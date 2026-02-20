"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">Dashboard Error</h2>
      <p className="text-muted-foreground max-w-md">
        Something went wrong loading this page. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
