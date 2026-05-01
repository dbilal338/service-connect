import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="fade-in pb-8">
      <div className="px-4 pt-6 pb-4" style={{ background: 'linear-gradient(160deg, #0f172a, #14532d)' }}>
        <h1 className="text-white font-black text-2xl">Terms of Service</h1>
        <p className="text-slate-400 text-sm mt-1">Last updated: April 2026</p>
      </div>

      <div className="px-4 py-5 space-y-6">
        <Section title="1. Acceptance of Terms">
          By accessing or using Karigarr ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. These terms apply to all users including consumers, service providers, and visitors.
        </Section>

        <Section title="2. About Karigarr">
          Karigarr is an online marketplace that connects consumers with local service professionals ("Providers") in Pakistan. We provide the technology platform but are not a party to any service agreement between consumers and providers. Karigarr does not employ service providers directly.
        </Section>

        <Section title="3. User Accounts">
          <ul className="list-disc pl-4 space-y-1">
            <li>You must be at least 18 years old to create an account.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree to provide accurate, complete, and up-to-date information during registration.</li>
            <li>One person may not maintain more than one active account.</li>
            <li>Karigarr reserves the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </Section>

        <Section title="4. Bookings & Payments">
          <ul className="list-disc pl-4 space-y-1">
            <li>All bookings are subject to provider availability and acceptance.</li>
            <li>Prices quoted by providers are in Pakistani Rupees (PKR).</li>
            <li>Payment terms are agreed between the consumer and provider; Karigarr does not currently process payments.</li>
            <li>Consumers are responsible for paying the agreed amount directly to the provider upon service completion.</li>
            <li>Any changes to booking details must be agreed upon by both parties through the Platform.</li>
          </ul>
        </Section>

        <Section title="5. Provider Standards">
          <ul className="list-disc pl-4 space-y-1">
            <li>Providers must be legally entitled to work in Pakistan.</li>
            <li>Providers must accurately represent their skills, experience, and qualifications.</li>
            <li>Providers must complete booked services to a professional standard.</li>
            <li>Karigarr may verify provider credentials but does not guarantee the quality of services.</li>
            <li>Providers found engaging in fraudulent activity will be permanently banned.</li>
          </ul>
        </Section>

        <Section title="6. Prohibited Conduct">
          You may not use the Platform to:
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>Post false, misleading, or fraudulent information.</li>
            <li>Harass, threaten, or intimidate any user.</li>
            <li>Solicit services or payments outside the Platform to avoid fees.</li>
            <li>Reverse-engineer, scrape, or misuse the Platform's technology.</li>
            <li>Violate any applicable Pakistani law or regulation.</li>
          </ul>
        </Section>

        <Section title="7. Reviews & Ratings">
          Reviews must be honest, based on actual experiences, and free from offensive language. Karigarr reserves the right to remove reviews that violate these guidelines. Providers may not offer incentives for positive reviews.
        </Section>

        <Section title="8. Limitation of Liability">
          Karigarr is not liable for any direct, indirect, or consequential damages arising from your use of the Platform or the services of any Provider. Our maximum liability to you shall not exceed PKR 10,000 in any circumstance. We do not warrant that the Platform will be uninterrupted, error-free, or secure.
        </Section>

        <Section title="9. Governing Law">
          These Terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of courts in Karachi, Pakistan.
        </Section>

        <Section title="10. Changes to Terms">
          Karigarr reserves the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms. We will notify users of significant changes via the app or registered email.
        </Section>

        <Section title="11. Contact Us">
          For questions about these Terms, please contact us at:<br />
          <span className="font-semibold text-green-700">support@karigarr.pk</span><br />
          Karigarr Pakistan, Karachi, Pakistan
        </Section>
      </div>

      <div className="px-4 pb-4 flex gap-4 text-xs text-slate-400 justify-center">
        <Link to="/privacy" className="text-green-600 font-semibold">Privacy Policy</Link>
        <span>•</span>
        <Link to="/refund" className="text-green-600 font-semibold">Refund Policy</Link>
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
