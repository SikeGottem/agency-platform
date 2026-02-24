"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, CheckCircle2, Clock, Layers, Copy } from "lucide-react";

interface Deliverable {
  id: string;
  title: string;
  file_url?: string;
  file_type?: string;
}

interface Review {
  rating: number;
  comment?: string;
  created_at: string;
}

interface ProjectCompleteCardProps {
  projectType: string;
  clientName: string;
  createdAt: string;
  deliveredAt?: string;
  totalRounds: number;
  deliverables: Deliverable[];
  review?: Review | null;
  isDesigner?: boolean;
  onCreateSimilar?: () => void;
}

export function ProjectCompleteCard({
  projectType,
  clientName,
  createdAt,
  deliveredAt,
  totalRounds,
  deliverables,
  review,
  isDesigner,
  onCreateSimilar,
}: ProjectCompleteCardProps) {
  const startDate = new Date(createdAt);
  const endDate = deliveredAt ? new Date(deliveredAt) : new Date();
  const durationDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="overflow-hidden">
      {/* Success banner */}
      <div className="bg-green-500/10 border-b border-green-500/20 px-6 py-3 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          Project Completed
        </span>
      </div>

      <CardHeader>
        <CardTitle className="text-lg capitalize">
          {projectType} — {clientName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-semibold">{durationDays}d</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
          <div>
            <Layers className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-semibold">{totalRounds}</p>
            <p className="text-xs text-muted-foreground">Rounds</p>
          </div>
          <div>
            <CheckCircle2 className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-semibold">{deliverables.length}</p>
            <p className="text-xs text-muted-foreground">Files</p>
          </div>
        </div>

        {/* Thumbnail strip */}
        {deliverables.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {deliverables.slice(0, 6).map((d) => (
              <div
                key={d.id}
                className="shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium uppercase overflow-hidden"
                title={d.title}
              >
                {d.file_url &&
                ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(
                  d.file_type?.toLowerCase() || ""
                ) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.file_url}
                    alt={d.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{d.file_type || "?"}</span>
                )}
              </div>
            ))}
            {deliverables.length > 6 && (
              <div className="shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                +{deliverables.length - 6}
              </div>
            )}
          </div>
        )}

        {/* Review */}
        {review && (
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                from {clientName}
              </span>
            </div>
            {review.comment && (
              <p className="text-sm italic text-muted-foreground">
                &ldquo;{review.comment}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Create similar (designer only) */}
        {isDesigner && onCreateSimilar && (
          <Button variant="outline" className="w-full" onClick={onCreateSimilar}>
            <Copy className="h-4 w-4 mr-2" />
            Create Similar Project
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
