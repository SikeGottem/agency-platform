import { escapeHtml } from "@/lib/utils";

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  senderRole: "designer" | "client";
  messagePreview: string;
  projectType: string;
  projectUrl?: string;
}

export function getNewMessageEmail({
  recipientName,
  senderName,
  senderRole,
  messagePreview,
  projectType,
  projectUrl,
}: NewMessageEmailProps) {
  const subject = `You have a new message from your ${senderRole}`;

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
        <h2 style="font-size: 22px; font-weight: 600; color: #111827; margin: 0 0 8px;">New Message</h2>
        <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px; line-height: 1.5;">
          Hi ${escapeHtml(recipientName)}, <strong>${escapeHtml(senderName)}</strong> sent you a message on your <strong>${escapeHtml(projectType.replace(/_/g, " "))}</strong> project.
        </p>
        <div style="background: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 3px solid #E05252;">
          <p style="color: #374151; font-size: 15px; margin: 0; line-height: 1.6; font-style: italic;">
            "${escapeHtml(messagePreview.length > 200 ? messagePreview.slice(0, 200) + "…" : messagePreview)}"
          </p>
        </div>
        ${projectUrl ? `
        <div style="text-align: center;">
          <a href="${encodeURI(projectUrl)}" style="display: inline-block; padding: 14px 32px; background-color: #E05252; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Reply
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

  const text = `Hi ${recipientName}, ${senderName} sent you a message on your ${projectType.replace(/_/g, " ")} project: "${messagePreview.slice(0, 200)}"${projectUrl ? ` Reply here: ${projectUrl}` : ""}`;

  return { subject, html, text };
}
