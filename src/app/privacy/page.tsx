import type { Metadata } from 'next';
import { CONTACT_EMAIL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Quanta Foundry privacy policy. How we collect, use, and protect your personal data in compliance with GDPR.',
};

export default function PrivacyPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-[#0A1929]">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <div className="h-[3px] w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E0C35C] mx-auto mb-6" />
          <p className="text-sm text-gray-400">Last updated: June 15, 2026</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-6 prose prose-slate prose-headings:text-[#0A1929] prose-a:text-[#4A90E2]">
          <h2>1. Introduction</h2>
          <p>
            Quanta Foundry (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website (quantafoundry.com) and related services.
          </p>
          <p>
            This policy complies with the General Data Protection Regulation (GDPR) — Regulation (EU) 2016/679 — and applicable French data protection law.
          </p>

          <h2>2. Data Controller</h2>
          <p>
            The data controller responsible for your personal data is:<br />
            <strong>Quanta Foundry</strong><br />
            Paris, France<br />
            Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>

          <h2>3. What Data We Collect</h2>
          <p>We may collect the following categories of personal data:</p>
          <ul>
            <li><strong>Identity data:</strong> name, professional title</li>
            <li><strong>Contact data:</strong> email address, LinkedIn profile URL</li>
            <li><strong>Professional data:</strong> company name, role, professional background</li>
            <li><strong>Application data:</strong> motivation statements, program preferences</li>
            <li><strong>Technical data:</strong> IP address, browser type, device information (collected automatically)</li>
            <li><strong>Usage data:</strong> pages visited, time spent, referral source (if analytics are enabled)</li>
          </ul>

          <h2>4. How We Use Your Data</h2>
          <p>We use your personal data for the following purposes:</p>
          <ul>
            <li>To process and respond to your application or inquiry</li>
            <li>To communicate with you about our programs, events, and services</li>
            <li>To send you newsletters and updates (only with your explicit consent)</li>
            <li>To manage our Reading Club and community events</li>
            <li>To improve our website and services</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>5. Legal Basis for Processing</h2>
          <p>
            Under GDPR Article 6, we process your data based on the following legal grounds:
          </p>
          <ul>
            <li><strong>Consent (Art. 6(1)(a)):</strong> When you explicitly consent to data processing via our forms (e.g., newsletter signup, application submission).</li>
            <li><strong>Legitimate interest (Art. 6(1)(f)):</strong> To respond to your inquiries and improve our services.</li>
            <li><strong>Legal obligation (Art. 6(1)(c)):</strong> When required by law.</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary for the purposes for which it was collected:
          </p>
          <ul>
            <li><strong>Application data:</strong> retained for up to 24 months after the last cohort you applied to</li>
            <li><strong>Newsletter subscribers:</strong> retained until you unsubscribe</li>
            <li><strong>Inquiry data:</strong> retained for up to 12 months</li>
            <li><strong>Analytics data:</strong> retained for up to 26 months (if analytics are enabled)</li>
          </ul>

          <h2>7. Your Rights</h2>
          <p>Under GDPR, you have the following rights:</p>
          <ul>
            <li><strong>Right of access:</strong> You can request a copy of your personal data.</li>
            <li><strong>Right to rectification:</strong> You can request correction of inaccurate data.</li>
            <li><strong>Right to erasure:</strong> You can request deletion of your data (&quot;right to be forgotten&quot;).</li>
            <li><strong>Right to data portability:</strong> You can request your data in a structured, machine-readable format.</li>
            <li><strong>Right to object:</strong> You can object to processing based on legitimate interest.</li>
            <li><strong>Right to withdraw consent:</strong> You can withdraw your consent at any time.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            We will respond within 30 days. You also have the right to lodge a complaint with the French data protection authority (CNIL).
          </p>

          <h2>8. Cookies</h2>
          <p>
            Our website may use essential cookies required for the website to function properly. If we implement analytics or tracking tools (e.g., Plausible, Google Analytics), we will provide a cookie consent banner and allow you to opt out. No non-essential cookies are set without your explicit consent.
          </p>

          <h2>9. Third-Party Services</h2>
          <p>We may use the following third-party services that process your data:</p>
          <ul>
            <li><strong>Formspree:</strong> Form submission processing (data is transmitted to Formspree servers in the US; Formspree is GDPR-compliant)</li>
            <li><strong>Vercel:</strong> Website hosting (data may be processed globally via Vercel&apos;s edge network)</li>
            <li><strong>Google Fonts:</strong> Typography (loaded from Google servers)</li>
          </ul>
          <p>
            We ensure that all third-party processors provide adequate data protection guarantees.
          </p>

          <h2>10. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes HTTPS encryption, access controls, and regular security reviews.
          </p>

          <h2>11. International Transfers</h2>
          <p>
            Some of our service providers may process data outside the European Economic Area (EEA). When this occurs, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our website with a revised &quot;last updated&quot; date.
          </p>

          <h2>13. Contact</h2>
          <p>
            For any questions about this Privacy Policy or your personal data, contact us at:<br />
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />
            Quanta Foundry, Paris, France
          </p>
        </div>
      </section>
    </>
  );
}
