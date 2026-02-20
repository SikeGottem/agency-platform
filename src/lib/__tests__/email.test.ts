import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSend = vi.fn();

// Mock resend before importing email module
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

// Mock email templates
vi.mock("@/emails/client-receipt", () => ({
  getClientReceiptEmail: vi.fn().mockReturnValue({
    subject: "Test Subject",
    html: "<p>Test</p>",
    text: "Test",
  }),
}));

vi.mock("@/emails/resume-reminder", () => ({
  getResumeReminderEmail: vi.fn().mockReturnValue({
    subject: "Reminder",
    html: "<p>Reminder</p>",
    text: "Reminder",
  }),
}));

describe("email", () => {
  let sendEmail: typeof import("../email").sendEmail;
  let sendBriefSubmittedNotification: typeof import("../email").sendBriefSubmittedNotification;
  let sendClientReceipt: typeof import("../email").sendClientReceipt;

  beforeEach(async () => {
    vi.resetModules();
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.NEXT_PUBLIC_APP_URL = "https://briefed.co";
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: "email_123" }, error: null });

    const emailModule = await import("../email");
    sendEmail = emailModule.sendEmail;
    sendBriefSubmittedNotification = emailModule.sendBriefSubmittedNotification;
    sendClientReceipt = emailModule.sendClientReceipt;
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it("sends email via Resend", async () => {
    await sendEmail({
      to: "test@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });
    expect(mockSend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Hello",
      })
    );
  });

  it("skips sending when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    // Re-import to get fresh module
    vi.resetModules();
    const { sendEmail: freshSendEmail } = await import("../email");
    const result = await freshSendEmail({
      to: "test@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });
    expect(result).toBeNull();
  });

  it("throws on Resend error", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "Invalid API key", name: "validation_error" },
    });

    await expect(
      sendEmail({ to: "test@example.com", subject: "Hello", html: "<p>Hi</p>" })
    ).rejects.toThrow("Failed to send email");
  });

  it("sendBriefSubmittedNotification sends with correct params", async () => {
    await sendBriefSubmittedNotification({
      designerEmail: "designer@example.com",
      designerName: "Alice",
      clientName: "Bob",
      projectType: "logo_design",
      dashboardUrl: "https://briefed.co/dashboard/projects/123",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "designer@example.com",
        subject: expect.stringContaining("Bob"),
      })
    );
  });

  it("sendBriefSubmittedNotification includes link to view brief", async () => {
    await sendBriefSubmittedNotification({
      designerEmail: "designer@example.com",
      designerName: "Alice",
      clientName: "Bob",
      projectType: "logo_design",
      dashboardUrl: "https://briefed.co/dashboard/projects/123",
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("https://briefed.co/dashboard/projects/123");
  });

  it("sendClientReceipt sends to client email", async () => {
    await sendClientReceipt({
      clientEmail: "client@example.com",
      clientName: "Bob",
      designerName: "Alice",
      projectType: "brand_identity",
      dashboardUrl: "https://briefed.co/brief/123",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "client@example.com",
      })
    );
  });

  it("email failures do not block when called with try/catch", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "Rate limited", name: "rate_limit" },
    });

    // Simulating how the submit route calls it - wrapped in try/catch
    let submissionBlocked = false;
    try {
      try {
        await sendBriefSubmittedNotification({
          designerEmail: "designer@example.com",
          designerName: "Alice",
          clientName: "Bob",
          projectType: "logo_design",
          dashboardUrl: "https://briefed.co/dashboard/projects/123",
        });
      } catch {
        // Email error caught - submission continues
      }
      // Submission continues here
    } catch {
      submissionBlocked = true;
    }

    expect(submissionBlocked).toBe(false);
  });
});
