import { escapeHtml } from "@/lib/utils";

interface BriefNotificationParams {
  designerName: string;
  summary: {
    clientName: string;
    projectType: string;
    businessName?: string;
    industry?: string;
    timeline?: string;
    budget?: string;
  };
  dashboardUrl: string;
}

export function getBriefNotificationEmail({ designerName, summary, dashboardUrl }: BriefNotificationParams) {
  const summaryRows = [
    { label: "Client", value: summary.clientName },
    { label: "Project Type", value: summary.projectType },
    summary.businessName ? { label: "Business", value: summary.businessName } : null,
    summary.industry ? { label: "Industry", value: summary.industry } : null,
    summary.timeline ? { label: "Timeline", value: summary.timeline } : null,
    summary.budget ? { label: "Budget", value: summary.budget } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const summaryHtml = summaryRows
    .map(
      (row) => `
        <tr>
          <td style="padding: 8px 12px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(row.label)}</td>
          <td style="padding: 8px 12px; font-size: 14px; font-weight: 500; border-bottom: 1px solid #f3f4f6;">${escapeHtml(row.value)}</td>
        </tr>`
    )
    .join("");

  const subject = `New brief submitted by ${summary.clientName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Source Serif 4', Georgia, serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-family: 'Source Serif 4', Georgia, serif; font-size: 28px; font-weight: 700; color: #E05252; margin: 0;">Briefed</h1>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <!-- Accent Bar -->
      <div style="height: 4px; background: #E05252;"></div>

      <div style="padding: 32px;">
        <h2 style="font-family: 'Source Serif 4', Georgia, serif; font-size: 22px; font-weight: 600; color: #111827; margin: 0 0 8px;">
          New Brief Submitted
        </h2>
        <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px; line-height: 1.5;">
          Hey ${escapeHtml(designerName)}, <strong>${escapeHtml(summary.clientName)}</strong> has completed their creative brief. Here's a quick summary:
        </p>

        <!-- Summary Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #fafafa; border-radius: 8px; overflow: hidden;">
          ${summaryHtml}
        </table>

        <!-- CTA Button -->
        <div style="text-align: center;">
          <a href="${encodeURI(dashboardUrl)}" style="display: inline-block; padding: 14px 32px; background-color: #E05252; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; font-family: 'Source Serif 4', Georgia, serif;">
            View Full Brief
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
        Sent by <span style="color: #E05252; font-weight: 600;">Briefed</span> — Creative briefs, beautifully organized.
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hey ${designerName}, ${summary.clientName} has completed their ${summary.projectType} creative brief. View it here: ${dashboardUrl}`;

  return { subject, html, text };
}
