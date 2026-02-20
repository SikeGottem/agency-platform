import { Resend } from "resend";
import { escapeHtml } from "./utils";
import { getClientReceiptEmail } from "@/emails/client-receipt";
import { getResumeReminderEmail } from "@/emails/resume-reminder";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@briefed.co";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Briefed";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email to ${to}: "${subject}"`);
    return null;
  }

  const { data, error } = await getResend().emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });

  if (error) {
    console.error(`[email] Send failed to=${to} subject="${subject}":`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log(`[email] Sent to=${to} subject="${subject}" id=${data?.id}`);
  return data;
}

/**
 * Send onboarding link to a client
 */
export async function sendOnboardingLink({
  clientEmail,
  clientName,
  designerName,
  projectUrl,
}: {
  clientEmail: string;
  clientName: string;
  designerName: string;
  projectUrl: string;
}) {
  return sendEmail({
    to: clientEmail,
    subject: `${designerName} has invited you to share your vision`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${escapeHtml(clientName)}!</h2>
        <p><strong>${escapeHtml(designerName)}</strong> has invited you to share your creative vision for your project.</p>
        <p>It only takes about 15 minutes, and it'll help your designer understand exactly what you're looking for.</p>
        <a href="${encodeURI(projectUrl)}" style="display: inline-block; padding: 12px 24px; background-color: #18181b; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Start Your Brief
        </a>
        <p style="color: #666; font-size: 14px;">You can save your progress and come back anytime using this link.</p>
      </div>
    `,
  });
}

/**
 * Notify designer that a brief has been submitted
 */
export async function sendBriefSubmittedNotification({
  designerEmail,
  designerName,
  clientName,
  projectType,
  dashboardUrl,
}: {
  designerEmail: string;
  designerName: string;
  clientName: string;
  projectType: string;
  dashboardUrl: string;
}) {
  return sendEmail({
    to: designerEmail,
    subject: `New brief submitted by ${clientName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hey ${escapeHtml(designerName)}!</h2>
        <p><strong>${escapeHtml(clientName)}</strong> has completed their ${escapeHtml(projectType)} creative brief.</p>
        <a href="${encodeURI(dashboardUrl)}" style="display: inline-block; padding: 12px 24px; background-color: #18181b; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          View Brief
        </a>
      </div>
    `,
  });
}

/**
 * Send receipt confirmation to client after submission
 */
export async function sendClientReceipt({
  clientEmail,
  clientName,
  designerName,
  projectType,
  dashboardUrl,
}: {
  clientEmail: string;
  clientName: string;
  designerName: string;
  projectType: string;
  dashboardUrl?: string;
}) {
  const { subject, html, text } = getClientReceiptEmail({
    clientName,
    designerName,
    projectType,
    dashboardUrl,
  });

  return sendEmail({ to: clientEmail, subject, html, text });
}

/**
 * Send resume reminder to client with incomplete brief
 */
export async function sendResumeReminder({
  clientEmail,
  clientName,
  designerName,
  projectType,
  resumeUrl,
  progressPercentage,
  lastUpdated,
}: {
  clientEmail: string;
  clientName: string;
  designerName: string;
  projectType: string;
  resumeUrl: string;
  progressPercentage: number;
  lastUpdated: string;
}) {
  const { subject, html, text } = getResumeReminderEmail({
    clientName,
    designerName,
    projectType,
    resumeUrl,
    progressPercentage,
    lastUpdated,
  });

  return sendEmail({ to: clientEmail, subject, html, text });
}
