export default function Privacy() {
  return (
    <div className="fade-in pb-8">
      <div className="px-4 pt-6 pb-4" style={{ background: 'linear-gradient(160deg, #0f172a, #1e3a5f)' }}>
        <h1 className="text-white font-black text-2xl">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mt-1">Last updated: April 2026</p>
      </div>

      <div className="px-4 py-5 space-y-6">
        <Section title="1. Introduction">
          Karigarr ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Platform. By using Karigarr, you agree to the practices described in this policy.
        </Section>

        <Section title="2. Information We Collect">
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Account Information:</strong> Name, email address, phone number, and password (encrypted).</li>
            <li><strong>Profile Information:</strong> For providers — service type, experience, location, and hourly rate.</li>
            <li><strong>Transaction Data:</strong> Booking details, service descriptions, and order history.</li>
            <li><strong>Communication Data:</strong> Messages sent through our in-app chat system.</li>
            <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers for security purposes.</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, and time spent on the Platform.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-4 space-y-1">
            <li>To create and manage your account.</li>
            <li>To facilitate bookings and connect consumers with providers.</li>
            <li>To process and display reviews and ratings.</li>
            <li>To send service updates, booking confirmations, and support messages.</li>
            <li>To improve our Platform and develop new features.</li>
            <li>To detect and prevent fraud or abuse.</li>
            <li>To comply with legal obligations under Pakistani law.</li>
          </ul>
        </Section>

        <Section title="4. Sharing Your Information">
          We share your information only as necessary:
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li><strong>With Providers:</strong> When you book a service, your name, phone number, and address are shared with the assigned provider.</li>
            <li><strong>With Consumers:</strong> Providers' names, ratings, and contact details are visible to consumers browsing the platform.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by Pakistani law or a court order.</li>
            <li>We do not sell your personal data to third parties.</li>
          </ul>
        </Section>

        <Section title="5. Data Security">
          We implement industry-standard security measures including password hashing, HTTPS encryption, and access controls. However, no system is completely secure. You are responsible for keeping your login credentials confidential. Report suspected unauthorized access to support@karigarr.pk immediately.
        </Section>

        <Section title="6. Data Retention">
          We retain your personal data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.
        </Section>

        <Section title="7. Your Rights">
          Under applicable Pakistani data protection principles, you have the right to:
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate or incomplete data.</li>
            <li>Request deletion of your personal data.</li>
            <li>Withdraw consent for marketing communications.</li>
          </ul>
          To exercise these rights, contact us at support@karigarr.pk.
        </Section>

        <Section title="8. Cookies">
          We use localStorage and session storage for authentication tokens. We do not currently use advertising cookies or third-party tracking scripts.
        </Section>

        <Section title="9. Children's Privacy">
          Karigarr is not intended for users under the age of 18. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us so we can delete it.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of material changes through the app or by email. Continued use of the Platform after changes constitutes acceptance.
        </Section>

        <Section title="11. Contact Us">
          For privacy concerns or data requests:<br />
          <span className="font-semibold text-blue-700">privacy@karigarr.pk</span><br />
          Karigarr Pakistan, Karachi, Pakistan
        </Section>
      </div>

      <div className="px-4 pb-4 flex gap-4 text-xs text-slate-400 justify-center">
        <a href="/terms" className="text-green-600 font-semibold">Terms of Service</a>
        <span>•</span>
        <a href="/refund" className="text-green-600 font-semibold">Refund Policy</a>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card">
      <h2 className="font-bold text-slate-900 text-[15px] mb-2">{title}</h2>
      <p className="text-slate-600 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
