interface ResumeReminderEmailProps {
  clientName: string;
  designerName: string;
  projectType: string;
  resumeUrl: string;
  progressPercentage: number;
  lastUpdated: string;
}

export function getResumeReminderEmail({
  clientName,
  designerName,
  projectType,
  resumeUrl,
  progressPercentage,
  lastUpdated,
}: ResumeReminderEmailProps) {
  const subject = `👋 Your ${projectType.replace('_', ' ')} brief is ${progressPercentage}% complete`;

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
    <h1 style="color: white; margin: 0; font-size: 28px;">Almost There! 🎯</h1>
  </div>

  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${clientName}! 👋</p>

    <p style="font-size: 16px; line-height: 1.8;">
      You're <strong>${progressPercentage}% done</strong> with your ${projectType.replace('_', ' ')} brief for ${designerName}!
    </p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <div style="background: #e5e7eb; height: 8px; border-radius: 999px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${progressPercentage}%; transition: width 0.3s ease;"></div>
      </div>
      <p style="text-align: center; margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
        ${progressPercentage}% Complete
      </p>
    </div>

    <p style="font-size: 16px;">
      It only takes <strong>~10 more minutes</strong> to finish. Your responses will help ${designerName} create exactly what you're envisioning!
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${resumeUrl}" style="display: inline-block; background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
        Continue Where You Left Off →
      </a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #9ca3af; text-align: center;">
      Last updated: ${lastUpdated}
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 30px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>💡 Pro tip:</strong> All your answers are auto-saved, so you can pick up right where you left off!
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>Powered by <strong>Briefed</strong> — Better creative briefs in minutes</p>
    <p style="margin-top: 5px;">Not interested? You can ignore this email.</p>
  </div>
</body>
</html>
  `;

  const text = `
Hi ${clientName}!

You're ${progressPercentage}% done with your ${projectType.replace('_', ' ')} brief for ${designerName}!

It only takes ~10 more minutes to finish. Your responses will help ${designerName} create exactly what you're envisioning!

Continue where you left off: ${resumeUrl}

Last updated: ${lastUpdated}

💡 Pro tip: All your answers are auto-saved, so you can pick up right where you left off!

---
Powered by Briefed — Better creative briefs in minutes
Not interested? You can ignore this email.
  `.trim();

  return { subject, html, text };
}
