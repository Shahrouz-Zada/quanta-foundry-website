'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

// =============================================================================
// Field components (inline to keep the form self-contained)
// =============================================================================
function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-[#D4AF37] ml-0.5">*</span>}
    </label>
  );
}

function FieldInput({
  id, name, type = 'text', placeholder, required, value, onChange, maxLength,
}: {
  id: string; name: string; type?: string; placeholder?: string;
  required?: boolean; value: string; onChange: (v: string) => void; maxLength?: number;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2]/50 transition-colors"
    />
  );
}

function FieldSelect({
  id, name, required, value, onChange, options, placeholder,
}: {
  id: string; name: string; required?: boolean; value: string;
  onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  return (
    <select
      id={id}
      name={name}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2]/50 transition-colors text-gray-900"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function FieldTextarea({
  id, name, placeholder, required, value, onChange, maxLength,
}: {
  id: string; name: string; placeholder?: string; required?: boolean;
  value: string; onChange: (v: string) => void; maxLength?: number;
}) {
  return (
    <textarea
      id={id}
      name={name}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      rows={3}
      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2]/50 transition-colors resize-none"
    />
  );
}

// =============================================================================
// WorkspaceQForm
// =============================================================================
interface Props {
  onSuccess: () => void;
}

const INTEREST_OPTIONS = [
  'Applied AI & Machine Learning',
  'Quantitative Finance',
  'Neuroscience & Markets',
  'Quantum Software',
];

export default function WorkspaceQForm({ onSuccess }: Props) {
  // Form state
  const [fullName,      setFullName]      = useState('');
  const [email,         setEmail]         = useState('');
  const [affiliation,   setAffiliation]   = useState('');
  const [linkedinGithub, setLinkedinGithub] = useState('');
  const [mainInterest,  setMainInterest]  = useState('');
  const [motivation,    setMotivation]    = useState('');
  const [gdprConsent,   setGdprConsent]   = useState(false);

  // Anti-spam
  const [honeypot,      setHoneypot]      = useState(''); // must remain empty
  const formOpenedAt = useRef<number>(Date.now());

  // UI state
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [serverError,   setServerError]   = useState('');
  const [fieldErrors,   setFieldErrors]   = useState<Record<string, string>>({});

  useEffect(() => {
    formOpenedAt.current = Date.now();
  }, []);

  // Client-side pre-validation for immediate feedback
  function clientValidate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!fullName.trim())      errs.fullName     = 'Full name is required.';
    if (!email.trim())         errs.email        = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                               errs.email        = 'Please enter a valid email.';
    if (!mainInterest)         errs.mainInterest = 'Please select a main interest.';
    if (motivation.trim().length > 300)
                               errs.motivation   = 'Maximum 300 characters.';
    if (!gdprConsent)          errs.gdpr         = 'You must agree to proceed.';
    if (linkedinGithub && !/^https?:\/\/.+/i.test(linkedinGithub))
                               errs.linkedinGithub = 'Must start with https://';
    return errs;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    // Client-side validation
    const errs = clientValidate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/workspace-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          affiliation,
          linkedinGithub: linkedinGithub || undefined,
          mainInterest,
          motivation,
          gdprConsent,
          website: honeypot, // honeypot field
          formOpenDuration: Date.now() - formOpenedAt.current,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? 'An unexpected error occurred. Please try again.');
        return;
      }

      // Success — unlock dashboard
      onSuccess();
    } catch {
      setServerError('Could not connect to the server. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function err(field: string) {
    return fieldErrors[field] ? (
      <p className="text-xs text-red-400 mt-1">{fieldErrors[field]}</p>
    ) : null;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>

      {/* Honeypot — visually hidden, not accessible to screen readers */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
        <label htmlFor="workspace-hp-website">Website</label>
        <input
          id="workspace-hp-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Row 1: Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="ws-fullName" required>Full Name</Label>
          <FieldInput id="ws-fullName" name="fullName" placeholder="Jean Dupont" required value={fullName} onChange={setFullName} />
          {err('fullName')}
        </div>
        <div>
          <Label htmlFor="ws-email" required>Email Address</Label>
          <FieldInput id="ws-email" name="email" type="email" placeholder="jean@univ-paris.fr" required value={email} onChange={setEmail} />
          {err('email')}
        </div>
      </div>

      {/* Row 2: Affiliation + Main Interest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="ws-affiliation">Affiliation <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
          <FieldInput id="ws-affiliation" name="affiliation" placeholder="University / Company / Independent" value={affiliation} onChange={setAffiliation} />
          {err('affiliation')}
        </div>
        <div>
          <Label htmlFor="ws-interest" required>Main Interest</Label>
          <FieldSelect
            id="ws-interest"
            name="mainInterest"
            required
            value={mainInterest}
            onChange={setMainInterest}
            options={INTEREST_OPTIONS}
            placeholder="Select an area…"
          />
          {err('mainInterest')}
        </div>
      </div>

      {/* LinkedIn / GitHub (optional) */}
      <div>
        <Label htmlFor="ws-linkedin">LinkedIn or GitHub <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
        <FieldInput id="ws-linkedin" name="linkedinGithub" type="url" placeholder="https://linkedin.com/in/yourprofile" value={linkedinGithub} onChange={setLinkedinGithub} />
        {err('linkedinGithub')}
      </div>

      {/* Motivation */}
      <div>
        <Label htmlFor="ws-motivation">Short Motivation <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
        <FieldTextarea
          id="ws-motivation"
          name="motivation"
          placeholder="Tell us briefly what you hope to explore or build in Workspace Q."
          value={motivation}
          onChange={setMotivation}
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {motivation.length}/300
        </p>
        {err('motivation')}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed">
        <p className="mb-2 font-semibold text-gray-900">Privacy Notice</p>
        <p>
          Your information will be used to manage Workspace Q access, understand participant interests, and contact you about relevant Quanta Foundry activities. Your data will not be publicly displayed or shared with third parties without your consent.
        </p>
        <p className="mt-2">
          We store your registration data securely using Airtable. You may request access, correction, or deletion of your data at any time by contacting us.{' '}
          <a href="/privacy" className="text-[#4A90E2] hover:underline inline-flex items-center gap-0.5">
            Privacy Policy <ExternalLink size={10} />
          </a>
        </p>
      </div>

      {/* GDPR Consent checkbox */}
      <div>
        <label
          htmlFor="ws-gdpr"
          className="flex items-start gap-3 cursor-pointer group"
        >
          <div className="relative shrink-0 mt-0.5">
            <input
              id="ws-gdpr"
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                gdprConsent
                  ? 'bg-[#4A90E2] border-[#4A90E2]'
                  : 'border-gray-300 bg-white group-hover:border-gray-400'
              }`}
            >
              {gdprConsent && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-600 leading-relaxed">
            I agree that Quanta Foundry may process my registration information for Workspace Q access and related communications.{' '}
            <span className="text-[#D4AF37]">*</span>
          </span>
        </label>
        {err('gdpr')}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2 text-red-600 text-sm p-3 rounded-lg bg-red-50 border border-red-200" role="alert" id="ws-server-error">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        id="ws-submit-btn"
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Registering…
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            Register for Workspace Q
          </>
        )}
      </button>
    </form>
  );
}
