"use client";

import { StructuredFeedbackForm } from "./structured-feedback-form";
import { ApprovalFlow } from "./approval-flow";
import { useRouter } from "next/navigation";

interface ClientFeedbackSectionProps {
  projectId: string;
  projectStatus: string;
  userId: string;
  hasPendingRevision: boolean;
}

/**
 * Renders the appropriate feedback/approval component based on project status.
 * Used on the authenticated client project page.
 */
export function ClientFeedbackSection({
  projectId,
  projectStatus,
  userId,
  hasPendingRevision,
}: ClientFeedbackSectionProps) {
  const router = useRouter();

  // Show structured feedback when project is in design phase
  if (projectStatus === "in_progress" && !hasPendingRevision) {
    return (
      <StructuredFeedbackForm
        projectId={projectId}
        userId={userId}
      />
    );
  }

  // Show approval flow when project is completed (ready for review)
  if (projectStatus === "completed" && !hasPendingRevision) {
    return (
      <ApprovalFlow
        projectId={projectId}
        userId={userId}
        onApproved={() => router.refresh()}
        onRevisionRequested={() => router.refresh()}
      />
    );
  }

  return null;
}
