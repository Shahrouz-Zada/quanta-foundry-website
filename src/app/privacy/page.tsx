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
          <p className="text-sm text-gray-400">Last updated: June 24, 2026</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-6 prose prose-slate prose-headings:text-[#0A1929] prose-a:text-[#4A90E2]">

          <h2>1. Introduction</h2>
          <p>
            Quanta Foundry (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website (quantafoundry.com) and related services, including Workspace Q.
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
          <p>We collect different categories of data depending on how you interact with our platform:</p>

          <h3>3a. Website Analytics (Vercel Web Analytics)</h3>
          <p>
            Our website uses <strong>Vercel Web Analytics</strong>, a privacy-friendly analytics tool. It collects aggregated, anonymised data about page views, referral sources, geographic region (country-level), and device type.
          </p>
          <ul>
            <li>Vercel Web Analytics does <strong>not</strong> use tracking cookies.</li>
            <li>It does not collect personal identifiers such as names, email addresses, or persistent device IDs.</li>
            <li>Data is aggregated and cannot be used to identify individual visitors.</li>
            <li>While cookie-free, we still mention it here for full transparency.</li>
            <li>Data is retained by Vercel in accordance with their data processing terms. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel&apos;s Privacy Policy</a> for details.</li>
          </ul>

          <h3>3b. Workspace Q Registration Data</h3>
          <p>
            When you register for Workspace Q, we collect the following personal data:
          </p>
          <ul>
            <li><strong>Full name</strong> — to identify you within the community</li>
            <li><strong>Email address</strong> — to manage access and send relevant communications</li>
            <li><strong>Affiliation</strong> — school, organisation, or independent status</li>
            <li><strong>LinkedIn or GitHub profile URL</strong> — optional, to understand your professional background</li>
            <li><strong>Main area of interest</strong> — to match you with relevant resources and activities</li>
            <li><strong>Short motivation</strong> — to understand your goals and tailor the experience</li>
            <li><strong>GDPR consent record</strong> — timestamp of your explicit consent</li>
            <li><strong>Registration timestamp</strong> — date and time of your registration</li>
          </ul>
          <p>
            This data is stored securely in <strong>Airtable</strong>, a cloud-based database service (see Section 9 for details). It is accessible only to Quanta Foundry administrators and is never published publicly.
          </p>

          <h3>3c. Contact Form and Application Data</h3>
          <ul>
            <li><strong>Identity data:</strong> name, professional title</li>
            <li><strong>Contact data:</strong> email address</li>
            <li><strong>Professional data:</strong> company name, role, background</li>
            <li><strong>Application data:</strong> motivation statements, program preferences</li>
          </ul>

          <h3>3d. AI Chat Assistant</h3>
          <p>
            Our website includes an AI Chat Assistant powered by OpenAI. Conversations are <strong>not stored</strong> beyond what is technically necessary to generate a response in real time. We do not use your chat logs to train AI models.
          </p>

          <h2>4. Why We Collect This Data (Purposes)</h2>
          <ul>
            <li>To manage access to Workspace Q and track participant registrations</li>
            <li>To understand participant interests and tailor the Workspace Q experience</li>
            <li>To communicate with participants about relevant Quanta Foundry activities and updates</li>
            <li>To process and respond to applications, inquiries, and contact form submissions</li>
            <li>To monitor overall website performance and engagement (via anonymised analytics)</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>5. Who Can Access Your Data</h2>
          <ul>
            <li><strong>Quanta Foundry administrators only</strong> — full access to Workspace Q registration records in Airtable</li>
            <li><strong>Instructors / programme facilitators</strong> — may access participant lists (name, affiliation, interest) for cohort management purposes</li>
            <li><strong>Third-party processors</strong> — limited to the services listed in Section 9 (Airtable, Vercel, OpenAI), each under appropriate data processing agreements</li>
            <li>Your data is <strong>never sold, publicly displayed, or shared</strong> with third parties for commercial purposes</li>
          </ul>

          <h2>6. Legal Basis for Processing</h2>
          <p>Under GDPR Article 6, we process your data based on the following legal grounds:</p>
          <ul>
            <li><strong>Consent (Art. 6(1)(a)):</strong> When you explicitly consent via our registration form or other forms (e.g., the GDPR checkbox on the Workspace Q registration).</li>
            <li><strong>Legitimate interest (Art. 6(1)(f)):</strong> To respond to your inquiries and improve our services.</li>
            <li><strong>Legal obligation (Art. 6(1)(c)):</strong> When required by applicable law.</li>
          </ul>

          <h2>7. Data Retention</h2>
          <ul>
            <li><strong>Workspace Q registration data:</strong> retained for the duration of your participation and up to 24 months after inactivity, unless you request earlier deletion</li>
            <li><strong>Contact and application data:</strong> retained for up to 12 months after the last interaction</li>
            <li><strong>Website analytics data:</strong> aggregated, anonymised — retained by Vercel per their standard terms</li>
            <li><strong>AI chat logs:</strong> not retained beyond real-time processing</li>
          </ul>

          <h2>8. Your Rights</h2>
          <p>Under GDPR, you have the following rights:</p>
          <ul>
            <li><strong>Right of access:</strong> Request a copy of your personal data.</li>
            <li><strong>Right to rectification:</strong> Request correction of inaccurate data.</li>
            <li><strong>Right to erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;).</li>
            <li><strong>Right to data portability:</strong> Request your data in a structured, machine-readable format.</li>
            <li><strong>Right to object:</strong> Object to processing based on legitimate interest.</li>
            <li><strong>Right to withdraw consent:</strong> Withdraw your consent at any time without affecting prior processing.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            We will respond within 30 days. You also have the right to lodge a complaint with the French data protection authority (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>).
          </p>

          <h2 id="ai-chat">9. Third-Party Services</h2>
          <p>We use the following third-party services that may process your data:</p>
          <ul>
            <li>
              <strong>Airtable (Formagrid Inc.):</strong> We use Airtable to store Workspace Q registration data. Data may be stored on servers in the United States. Airtable is GDPR-compliant and provides appropriate Standard Contractual Clauses (SCCs). See <a href="https://airtable.com/privacy" target="_blank" rel="noopener noreferrer">Airtable&apos;s Privacy Policy</a>.
            </li>
            <li>
              <strong>Vercel Inc.:</strong> Website hosting and edge network. Vercel Web Analytics collects anonymised, cookie-free traffic data. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel&apos;s Privacy Policy</a>.
            </li>
            <li>
              <strong>OpenAI:</strong> Powers our AI Chat Assistant. Conversations are not retained by us beyond real-time processing. See <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">OpenAI&apos;s Privacy Policy</a>.
            </li>
            <li>
              <strong>Google Fonts:</strong> Typography loaded from Google servers. Minimal technical data (IP address) is transmitted to Google. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
            </li>
          </ul>

          <h2>10. Cookies</h2>
          <p>
            Our website does not use tracking or advertising cookies. Vercel Web Analytics is cookie-free. We may use essential session data (e.g., browser localStorage) strictly to remember your Workspace Q access within your current browser session. This data remains on your device and is not transmitted to our servers.
          </p>

          <h2>11. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal data, including HTTPS encryption, access controls on Airtable (role-based, admin-only), and regular security reviews. We do not store passwords or payment data.
          </p>

          <h2>12. International Transfers</h2>
          <p>
            Some of our service providers (Airtable, Vercel, OpenAI) may process data outside the European Economic Area (EEA). When this occurs, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission.
          </p>

          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our website with a revised &quot;last updated&quot; date.
          </p>

          <h2>14. Contact</h2>
          <p>
            For any questions about this Privacy Policy, to request access or deletion of your data, or to raise a data protection concern, contact us at:<br />
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />
            Quanta Foundry, Paris, France
          </p>
        </div>
      </section>
    </>
  );
}
