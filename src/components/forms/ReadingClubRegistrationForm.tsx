'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle, AlertCircle, ExternalLink, ChevronDown } from 'lucide-react';

// =============================================================================
// Sub-components
// =============================================================================
function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-[#D4AF37] ml-0.5">*</span>}
    </label>
  );
}

function FieldInput({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  maxLength,
}: {
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  maxLength?: number;
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
  id,
  name,
  placeholder,
  options,
  value,
  onChange,
  required,
}: {
  id: string;
  name: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
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
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function FieldTextarea({
  id,
  name,
  placeholder,
  value,
  onChange,
  maxLength,
}: {
  id: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}) {
  return (
    <textarea
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      rows={3}
      className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2]/50 transition-colors resize-none"
    />
  );
}

// Multi-select track checkboxes
const TRACK_OPTIONS = [
  { id: 'track-qf', value: 'Quantitative Finance', label: 'Quantitative Finance', badge: 'Active — Season 1' },
  { id: 'track-ai', value: 'Applied AI & Machine Learning', label: 'Applied AI & Machine Learning', badge: 'Coming Soon' },
  { id: 'track-neuro', value: 'Neuroscience & Markets', label: 'Neuroscience & Markets', badge: 'Coming Soon' },
  { id: 'track-quantum', value: 'Quantum Software', label: 'Quantum Software', badge: 'Coming Soon' },
];

const PARTICIPATION_OPTIONS = [
  'Updates only',
  'Live sessions',
  'Notebooks / projects',
  'Future Workspace Q',
];

const PYTHON_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

// =============================================================================
// Main Form
// =============================================================================
export default function ReadingClubRegistrationForm() {
  const formOpenTime = useRef<number>(Date.now());

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [trackInterest, setTrackInterest] = useState<string[]>([]);
  const [preferredParticipation, setPreferredParticipation] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [linkedinGithub, setLinkedinGithub] = useState('');
  const [pythonLevel, setPythonLevel] = useState('');
  const [motivation, setMotivation] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  useEffect(() => {
    formOpenTime.current = Date.now();
  }, []);

  function toggleTrack(value: string) {
    setTrackInterest((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  function err(field: string) {
    return errors[field] ? <FieldError message={errors[field]} /> : null;
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email.';
    if (trackInterest.length === 0) errs.trackInterest = 'Please select at least one track.';
    if (motivation.trim().length > 300) errs.motivation = 'Maximum 300 characters.';
    if (linkedinGithub && !/^https?:\/\/.+/i.test(linkedinGithub))
      errs.linkedinGithub = 'Please enter a valid URL (starting with https://).';
    if (!gdprConsent) errs.gdpr = 'You must agree to proceed.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await fetch('/api/reading-club-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          trackInterest,
          preferredParticipation: preferredParticipation || undefined,
          affiliation: affiliation || undefined,
          linkedinGithub: linkedinGithub || undefined,
          pythonLevel: pythonLevel || undefined,
          motivation: motivation || undefined,
          gdprConsent,
          website: honeypot,
          formOpenDuration: Date.now() - formOpenTime.current,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Something went wrong. Please try again.');
      } else {
        setIsSuccess(true);
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="text-center py-10 px-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-emerald-500" size={36} />
        </div>
        <h3 className="text-xl font-bold text-[#0A1929] mb-2">You&apos;re registered!</h3>
        <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">
          Thank you for registering. We&apos;ll be in touch with session dates, reading materials, and updates for the tracks you selected.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Row 1: Full Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="rc-fullname" required>Full Name</Label>
          <FieldInput
            id="rc-fullname"
            name="fullName"
            placeholder="Jean Dupont"
            required
            value={fullName}
            onChange={setFullName}
          />
          {err('fullName')}
        </div>
        <div>
          <Label htmlFor="rc-email" required>Email Address</Label>
          <FieldInput
            id="rc-email"
            name="email"
            type="email"
            placeholder="jean@example.com"
            required
            value={email}
            onChange={setEmail}
          />
          {err('email')}
        </div>
      </div>

      {/* Track Interest — multi-select checkboxes */}
      <div>
        <Label htmlFor="rc-track" required>Track Interest</Label>
        <p className="text-xs text-gray-500 mb-3">Select all that interest you.</p>
        <div className="space-y-2.5">
          {TRACK_OPTIONS.map((track) => (
            <label
              key={track.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:border-[#4A90E2]/40 hover:bg-blue-50/30 cursor-pointer transition-colors group"
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  trackInterest.includes(track.value)
                    ? 'bg-[#4A90E2] border-[#4A90E2]'
                    : 'border-gray-300 bg-white group-hover:border-[#4A90E2]/60'
                }`}
                onClick={() => toggleTrack(track.value)}
              >
                {trackInterest.includes(track.value) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className="text-sm text-gray-800 font-medium flex-1"
                onClick={() => toggleTrack(track.value)}
              >
                {track.label}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  track.badge === 'Active — Season 1'
                    ? 'bg-[#D4AF37]/15 text-[#8B6914]'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {track.badge}
              </span>
            </label>
          ))}
        </div>
        {err('trackInterest')}
      </div>

      {/* Optional fields toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="flex items-center gap-1.5 text-sm text-[#4A90E2] font-medium hover:text-[#6BA4E8] transition-colors"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${showOptional ? 'rotate-180' : ''}`}
          />
          {showOptional ? 'Hide optional fields' : 'Add optional details (affiliation, Python level, etc.)'}
        </button>
      </div>

      {showOptional && (
        <div className="space-y-5 pt-1">
          {/* Row: Preferred Participation + Python Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="rc-participation">
                Preferred Participation <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </Label>
              <FieldSelect
                id="rc-participation"
                name="preferredParticipation"
                placeholder="Select..."
                options={PARTICIPATION_OPTIONS}
                value={preferredParticipation}
                onChange={setPreferredParticipation}
              />
            </div>
            <div>
              <Label htmlFor="rc-python">
                Python Level <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </Label>
              <FieldSelect
                id="rc-python"
                name="pythonLevel"
                placeholder="Select..."
                options={PYTHON_LEVELS}
                value={pythonLevel}
                onChange={setPythonLevel}
              />
            </div>
          </div>

          {/* Affiliation */}
          <div>
            <Label htmlFor="rc-affiliation">
              Affiliation <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </Label>
            <FieldInput
              id="rc-affiliation"
              name="affiliation"
              placeholder="University / Company / Independent"
              value={affiliation}
              onChange={setAffiliation}
            />
          </div>

          {/* LinkedIn / GitHub */}
          <div>
            <Label htmlFor="rc-linkedin">
              LinkedIn or GitHub <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </Label>
            <FieldInput
              id="rc-linkedin"
              name="linkedinGithub"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedinGithub}
              onChange={setLinkedinGithub}
            />
            {err('linkedinGithub')}
          </div>

          {/* Short Motivation */}
          <div>
            <Label htmlFor="rc-motivation">
              Short Motivation <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </Label>
            <FieldTextarea
              id="rc-motivation"
              name="motivation"
              placeholder="Tell us briefly what you hope to explore or build through the Reading Club."
              value={motivation}
              onChange={setMotivation}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{motivation.length}/300</p>
            {err('motivation')}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed">
        <p className="mb-2 font-semibold text-gray-900">Privacy Notice</p>
        <p>
          Your information will be used to send you Reading Club updates, session invitations, and relevant Quanta Foundry communications. Your data will not be shared with third parties without your consent.
        </p>
        <p className="mt-2">
          We store your registration data securely using Airtable. You may request access, correction, or deletion of your data at any time by contacting us.{' '}
          <a href="/privacy" className="text-[#4A90E2] hover:underline inline-flex items-center gap-0.5">
            Privacy Policy <ExternalLink size={10} />
          </a>
        </p>
      </div>

      {/* GDPR Consent */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="flex-shrink-0 mt-0.5">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                gdprConsent
                  ? 'bg-[#4A90E2] border-[#4A90E2]'
                  : 'border-gray-300 bg-white group-hover:border-gray-400'
              }`}
              onClick={() => setGdprConsent(!gdprConsent)}
            >
              {gdprConsent && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-600 leading-relaxed" onClick={() => setGdprConsent(!gdprConsent)}>
            I agree that Quanta Foundry may process my registration information to send Reading Club updates and related communications.{' '}
            <span className="text-[#D4AF37]">*</span>
          </span>
        </label>
        {err('gdpr')}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2 text-red-600 text-sm p-3 rounded-lg bg-red-50 border border-red-200" role="alert">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        id="rc-submit"
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white font-semibold rounded-xl hover:from-[#357ABD] hover:to-[#2A6099] transition-all duration-200 shadow-lg shadow-[#4A90E2]/25 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Registering...
          </>
        ) : (
          'Register for Reading Club Updates'
        )}
      </button>
    </form>
  );
}
