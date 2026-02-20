interface ClientReceiptEmailProps {
  clientName: string;
  designerName: string;
  projectType: string;
  dashboardUrl?: string;
}

export function getClientReceiptEmail({
  clientName,
  designerName,
  projectType,
  dashboardUrl,
}: ClientReceiptEmailProps) {
  const subject = `✅ Your ${projectType.replace('_', ' ')} brief has been submitted!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Brief Submitted! ✨</h1>
  </div>

  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${clientName}! 👋</p>

    <p style="font-size: 16px; line-height: 1.8;">
      Thank you for completing your <strong>${projectType.replace('_', ' ')}</strong> brief!
      Your responses have been sent to <strong>${designerName}</strong>.
    </p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h2 style="margin-top: 0; font-size: 18px; color: #374151;">✅ What happens next?</h2>
      <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
        <li style="margin: 10px 0;">${designerName} will review your responses</li>
        <li style="margin: 10px 0;">They'll reach out if they need any clarification</li>
        <li style="margin: 10px 0;">You'll receive your creative deliverables based on the timeline you selected</li>
      </ul>
    </div>

    ${dashboardUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        View Your Brief
      </a>
    </div>
    ` : ''}

    <p style="margin-top: 30px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      If you have any questions, feel free to reach out to ${designerName} directly.
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>Powered by <strong>Briefed</strong> — Better creative briefs in minutes</p>
  </div>
</body>
</html>
  `;

  const text = `
Hi ${clientName}!

Thank you for completing your ${projectType.replace('_', ' ')} brief! Your responses have been sent to ${designerName}.

What happens next?
- ${designerName} will review your responses
- They'll reach out if they need any clarification
- You'll receive your creative deliverables based on the timeline you selected

${dashboardUrl ? `View your brief: ${dashboardUrl}` : ''}

If you have any questions, feel free to reach out to ${designerName} directly.

---
Powered by Briefed — Better creative briefs in minutes
  `.trim();

  return { subject, html, text };
}
