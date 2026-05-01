export default function Refund() {
  return (
    <div className="fade-in pb-8">
      <div className="px-4 pt-6 pb-4" style={{ background: 'linear-gradient(160deg, #0f172a, #7c2d12)' }}>
        <h1 className="text-white font-black text-2xl">Refund Policy</h1>
        <p className="text-slate-400 text-sm mt-1">Last updated: April 2026</p>
      </div>

      <div className="px-4 py-5 space-y-6">
        <Section title="Overview">
          Karigarr is a marketplace platform that connects consumers with independent service providers. As we do not directly process payments, our refund policy governs the dispute resolution process between consumers and providers. We are committed to ensuring fair outcomes for both parties.
        </Section>

        <Section title="1. When Refunds Apply">
          You may be entitled to a refund or re-service in the following situations:
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li><strong>Provider No-Show:</strong> The provider did not arrive at the scheduled time without prior notice.</li>
            <li><strong>Incomplete Work:</strong> The provider did not complete the agreed scope of work.</li>
            <li><strong>Significantly Different Service:</strong> The service delivered was substantially different from what was booked and agreed upon.</li>
            <li><strong>Pre-payment on Cancelled Order:</strong> If you paid in advance and the order was cancelled by the provider.</li>
            <li><strong>Duplicate Charge:</strong> You were charged more than the agreed amount.</li>
          </ul>
        </Section>

        <Section title="2. Non-Refundable Situations">
          Refunds will generally not apply when:
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>You cancel a booking less than 2 hours before the scheduled appointment without valid reason.</li>
            <li>The service was completed satisfactorily and you confirmed completion on the Platform.</li>
            <li>You provided incorrect information (wrong address, wrong service needed) that caused issues.</li>
            <li>Dissatisfaction based on personal preference rather than failure to deliver the agreed service.</li>
            <li>The issue arose due to circumstances outside the provider's control (power outage, natural disaster, etc.).</li>
          </ul>
        </Section>

        <Section title="3. How to Request a Refund">
          <ol className="list-decimal pl-4 space-y-1">
            <li>Contact the provider directly through the in-app chat to resolve the issue first.</li>
            <li>If unresolved within 24 hours, submit a dispute by emailing <span className="font-semibold text-red-700">disputes@karigarr.pk</span> with your order number and a description of the issue.</li>
            <li>Include any relevant photos, screenshots, or evidence of the problem.</li>
            <li>Our team will review your complaint within 3-5 business days.</li>
            <li>We will contact both parties for their account of events before making a decision.</li>
          </ol>
        </Section>

        <Section title="4. Refund Process">
          Since Karigarr does not directly process payments, refunds work as follows:
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li><strong>Cash Payments:</strong> We will mediate with the provider to return the applicable amount. Providers found at fault risk suspension or removal from the Platform.</li>
            <li><strong>Platform-Facilitated Payments:</strong> If/when Karigarr processes payments, refunds will be returned to the original payment method within 7-10 business days.</li>
            <li>Karigarr may offer platform credits as an alternative resolution in some cases.</li>
          </ul>
        </Section>

        <Section title="5. Provider No-Show Policy">
          If a provider fails to arrive within 30 minutes of the scheduled time without contacting you:
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>You are entitled to cancel the booking without any penalty.</li>
            <li>Any advance payment is fully refundable.</li>
            <li>The provider's account may be penalized or suspended after repeated no-shows.</li>
            <li>We will help you rebook with another available provider at no extra charge.</li>
          </ul>
        </Section>

        <Section title="6. Cancellation by Consumer">
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>More than 2 hours before:</strong> Free cancellation. No charges apply.</li>
            <li><strong>Less than 2 hours before:</strong> A cancellation fee equal to 20% of the quoted price may apply if the provider has already begun travel.</li>
            <li><strong>After work starts:</strong> You are responsible for paying for work already completed.</li>
          </ul>
        </Section>

        <Section title="7. Dispute Resolution">
          Karigarr's decision in refund disputes is final. We aim to be fair to both consumers and providers. If you are unsatisfied with our decision, you may pursue resolution through appropriate consumer protection channels in Pakistan. We are registered under applicable Pakistani business laws and comply with consumer protection regulations.
        </Section>

        <Section title="8. Contact for Refund Queries">
          <span className="font-semibold text-red-700">disputes@karigarr.pk</span><br />
          WhatsApp: +92-300-KARIGAR<br />
          Karigarr Pakistan, Karachi, Pakistan<br />
          Business hours: Monday–Saturday, 9am–6pm PKT
        </Section>
      </div>

      <div className="px-4 pb-4 flex gap-4 text-xs text-slate-400 justify-center">
        <a href="/terms" className="text-green-600 font-semibold">Terms of Service</a>
        <span>•</span>
        <a href="/privacy" className="text-green-600 font-semibold">Privacy Policy</a>
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
