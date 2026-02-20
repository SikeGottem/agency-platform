export const metadata = {
  title: "Terms of Service — Briefed",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: February 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Briefed (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform. These terms apply to all users, including designers, clients, and visitors.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">2. Description of Service</h2>
          <p>
            Briefed provides a creative brief management platform that enables designers to create structured questionnaires, share them with clients via unique links, and collect organized project requirements. The Service includes brief creation tools, client-facing forms, file uploads, and project management features.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">3. Account Registration</h2>
          <p className="mb-3">
            To access certain features, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide accurate and complete registration information.</li>
            <li>Maintain the security of your password and account credentials.</li>
            <li>Notify us immediately of any unauthorized access to your account.</li>
            <li>Accept responsibility for all activity that occurs under your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">4. User Content &amp; Intellectual Property</h2>
          <p className="mb-3">
            You retain full ownership of all content you submit to Briefed, including questionnaire responses, uploaded files, brand assets, and project descriptions. By using the Service, you grant Briefed a limited, non-exclusive license to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Store and process your content as necessary to provide the Service.</li>
            <li>Display your content to authorized users (e.g., designers viewing client briefs).</li>
            <li>Create anonymized, aggregated data for service improvement purposes.</li>
          </ul>
          <p className="mt-3">
            This license terminates when you delete your content or close your account.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">5. Acceptable Use</h2>
          <p className="mb-3">You agree not to use Briefed to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Upload or share content that is illegal, harmful, threatening, or otherwise objectionable.</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation.</li>
            <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts.</li>
            <li>Use the Service for any purpose other than its intended creative brief management function.</li>
            <li>Interfere with or disrupt the Service or its infrastructure.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">6. Pricing &amp; Billing</h2>
          <p>
            Briefed offers both free and paid plans. Paid features are billed in advance on a monthly or annual basis. Prices are subject to change with 30 days&apos; notice. Refunds are available within 14 days of purchase for annual plans if you have not substantially used the paid features.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
          <p>
            Briefed is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied. To the maximum extent permitted by law, Briefed shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of or inability to use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">8. Termination</h2>
          <p>
            You may close your account at any time. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your right to use the Service ceases immediately. We will retain your data for 30 days following termination, after which it will be permanently deleted unless otherwise required by law.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">9. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of Australia. Any disputes arising from these terms shall be resolved in the courts of New South Wales, Australia.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">10. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Material changes will be communicated via email or an in-app notification at least 14 days before they take effect. Your continued use of Briefed after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">11. Contact</h2>
          <p>
            Questions about these terms? Reach out at{" "}
            <a href="mailto:hello@briefed.app" className="text-[#E05252] underline underline-offset-4 hover:text-[#c94545] transition-colors">
              hello@briefed.app
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
