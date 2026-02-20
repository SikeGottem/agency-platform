"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function BriefError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">Unable to load brief</h2>
      <p className="text-muted-foreground max-w-md">
        There was a problem loading this brief. The link may be invalid or
        expired.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
