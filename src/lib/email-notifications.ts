import { sendEmail } from "@/lib/email";
import { getProjectStatusChangeEmail } from "@/emails/project-status-change";
import { getNewMessageEmail } from "@/emails/new-message";
import { getRevisionRequestEmail } from "@/emails/revision-request";
import { getDeliverablesReadyEmail } from "@/emails/deliverables-ready";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://briefed.co";

export type EmailNotificationType =
  | "project_status_change"
  | "new_message"
  | "revision_request"
  | "deliverables_ready";

interface BaseProjectData {
  projectId: string;
  projectType: string;
  clientName: string;
  clientEmail: string;
  designerName: string;
  designerEmail: string;
  magicLinkToken?: string;
}

interface StatusChangeData extends BaseProjectData {
  type: "project_status_change";
  newStatus: string;
}

interface NewMessageData extends BaseProjectData {
  type: "new_message";
  senderType: "designer" | "client";
  senderName: string;
  messageContent: string;
}

interface RevisionRequestData extends BaseProjectData {
  type: "revision_request";
  message: string;
}

interface DeliverablesReadyData extends BaseProjectData {
  type: "deliverables_ready";
}

export type NotificationData =
  | StatusChangeData
  | NewMessageData
  | RevisionRequestData
  | DeliverablesReadyData;

function clientProjectUrl(projectId: string, token?: string): string {
  return token
    ? `${APP_URL}/brief/${projectId}?token=${token}`
    : `${APP_URL}/brief/${projectId}`;
}

function designerProjectUrl(projectId: string): string {
  return `${APP_URL}/dashboard/projects/${projectId}`;
}

/**
 * Send an email notification for a project event.
 * Non-throwing — logs errors and returns null on failure.
 */
export async function sendNotification(data: NotificationData) {
  try {
    switch (data.type) {
      case "project_status_change": {
        const { subject, html, text } = getProjectStatusChangeEmail({
          clientName: data.clientName,
          projectType: data.projectType,
          newStatus: data.newStatus,
          designerName: data.designerName,
          projectUrl: clientProjectUrl(data.projectId, data.magicLinkToken),
        });
        return await sendEmail({ to: data.clientEmail, subject, html, text });
      }

      case "new_message": {
        // Email the OTHER party (not the sender)
        const isFromDesigner = data.senderType === "designer";
        const { subject, html, text } = getNewMessageEmail({
          recipientName: isFromDesigner ? data.clientName : data.designerName,
          senderName: data.senderName,
          senderRole: data.senderType,
          messagePreview: data.messageContent,
          projectType: data.projectType,
          projectUrl: isFromDesigner
            ? clientProjectUrl(data.projectId, data.magicLinkToken)
            : designerProjectUrl(data.projectId),
        });
        return await sendEmail({
          to: isFromDesigner ? data.clientEmail : data.designerEmail,
          subject,
          html,
          text,
        });
      }

      case "revision_request": {
        const { subject, html, text } = getRevisionRequestEmail({
          clientName: data.clientName,
          designerName: data.designerName,
          message: data.message,
          projectType: data.projectType,
          projectUrl: clientProjectUrl(data.projectId, data.magicLinkToken),
        });
        return await sendEmail({ to: data.clientEmail, subject, html, text });
      }

      case "deliverables_ready": {
        const { subject, html, text } = getDeliverablesReadyEmail({
          clientName: data.clientName,
          designerName: data.designerName,
          projectType: data.projectType,
          projectUrl: clientProjectUrl(data.projectId, data.magicLinkToken),
        });
        return await sendEmail({ to: data.clientEmail, subject, html, text });
      }

      default:
        console.warn(`[email-notifications] Unknown type: ${(data as NotificationData).type}`);
        return null;
    }
  } catch (error) {
    console.error(`[email-notifications] Failed to send ${data.type}:`, error);
    return null;
  }
}
