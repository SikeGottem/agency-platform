import { escapeHtml } from "@/lib/utils";

interface ProjectStatusChangeProps {
  clientName: string;
  projectType: string;
  newStatus: string;
  designerName: string;
  projectUrl?: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  in_progress: "In Progress",
  completed: "Completed",
  reviewed: "Reviewed",
};

export function getProjectStatusChangeEmail({
  clientName,
  projectType,
  newStatus,
  designerName,
  projectUrl,
}: ProjectStatusChangeProps) {
  const statusLabel = STATUS_LABELS[newStatus] || newStatus.replace(/_/g, " ");
  const subject = `Your project status has been updated to ${statusLabel}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: 700; color: #E05252; margin: 0;">Briefed</h1>
    </div>
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="height: 4px; background: #E05252;"></div>
      <div style="padding: 32px;">
        <h2 style="font-size: 22px; font-weight: 600; color: #111827; margin: 0 0 8px;">Project Status Updated</h2>
        <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px; line-height: 1.5;">
          Hi ${escapeHtml(clientName)}, your <strong>${escapeHtml(projectType.replace(/_/g, " "))}</strong> project with ${escapeHtml(designerName)} has been updated.
        </p>
        <div style="background: #fafafa; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">New Status</p>
          <p style="font-size: 20px; font-weight: 700; color: #111827; margin: 0;">${escapeHtml(statusLabel)}</p>
        </div>
        ${projectUrl ? `
        <div style="text-align: center;">
          <a href="${encodeURI(projectUrl)}" style="display: inline-block; padding: 14px 32px; background-color: #E05252; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            View Project
          </a>
        </div>` : ""}
      </div>
    </div>
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">Sent by <span style="color: #E05252; font-weight: 600;">Briefed</span></p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${clientName}, your ${projectType.replace(/_/g, " ")} project status has been updated to ${statusLabel}.${projectUrl ? ` View it here: ${projectUrl}` : ""}`;

  return { subject, html, text };
}
