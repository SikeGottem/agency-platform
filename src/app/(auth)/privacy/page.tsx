export const metadata = {
  title: "Privacy Policy — Briefed",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: February 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">1. Information We Collect</h2>
          <p className="mb-3">
            We collect information you provide directly when creating an account and using our services, including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-foreground">Account information:</strong> Your name, email address, and password when you register.</li>
            <li><strong className="text-foreground">Profile data:</strong> Business name, design niche, and brand preferences you provide during onboarding.</li>
            <li><strong className="text-foreground">Brief content:</strong> Questionnaire responses, uploaded files, and project details submitted through briefs.</li>
            <li><strong className="text-foreground">Usage data:</strong> Information about how you interact with Briefed, including pages visited, features used, and time spent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
          <p className="mb-3">We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide, maintain, and improve our creative brief generation services.</li>
            <li>Generate personalized questionnaires tailored to your design niche and project requirements.</li>
            <li>Communicate with you about your account, updates, and product announcements.</li>
            <li>Analyze usage patterns to improve user experience and develop new features.</li>
            <li>Detect, prevent, and address technical issues or security threats.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">3. Data Sharing &amp; Third Parties</h2>
          <p className="mb-3">
            We do not sell your personal information. We may share data with trusted third-party services that help us operate Briefed:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-foreground">Hosting &amp; Infrastructure:</strong> Vercel (hosting), Supabase (database and authentication).</li>
            <li><strong className="text-foreground">Analytics:</strong> Anonymized usage analytics to understand product performance.</li>
            <li><strong className="text-foreground">Communication:</strong> Email service providers for transactional emails and notifications.</li>
          </ul>
          <p className="mt-3">
            All third-party providers are contractually obligated to protect your data and use it only for the purposes we specify.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. All data is encrypted in transit using TLS and at rest using AES-256 encryption. We conduct regular security audits and maintain strict access controls for our team. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">5. Data Retention</h2>
          <p>
            We retain your account information for as long as your account is active. Brief content and project data are retained for 12 months after the last activity on a project, unless you request earlier deletion. You may request deletion of your account and associated data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">6. Your Rights</h2>
          <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Access the personal information we hold about you.</li>
            <li>Request correction of inaccurate or incomplete data.</li>
            <li>Request deletion of your personal information.</li>
            <li>Export your data in a portable format.</li>
            <li>Withdraw consent for data processing where applicable.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">7. Cookies</h2>
          <p>
            We use essential cookies required for authentication and session management. We do not use third-party advertising cookies. Analytics cookies, if used, are anonymized and do not track individual users across websites.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the &ldquo;Last updated&rdquo; date. Your continued use of Briefed after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">9. Contact Us</h2>
          <p>
            If you have questions about this privacy policy or wish to exercise your data rights, please contact us at{" "}
            <a href="mailto:hello@briefed.app" className="text-[#E05252] underline underline-offset-4 hover:text-[#c94545] transition-colors">
              hello@briefed.app
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
