'use client';

import { useState, useRef, useEffect } from 'react';
import Input from '@/components/ui/Input';
import GDPRConsent from '@/components/ui/GDPRConsent';
import Button from '@/components/ui/Button';
import { COLLABORATION_TYPES } from '@/lib/constants';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function CorporateInquiryForm() {
  const formOpenTime = useRef<number>(Date.now());

  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [collaborationInterest, setCollaborationInterest] = useState('');
  const [timeline, setTimeline] = useState('');
  const [message, setMessage] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    formOpenTime.current = Date.now();
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Required';
    if (!organization.trim()) errs.organization = 'Required';
    if (!role.trim()) errs.role = 'Required';
    if (!email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email';
    if (!collaborationInterest) errs.collaborationInterest = 'Required';
    if (!message.trim()) errs.message = 'Required';
    if (!gdprConsent) errs.gdpr = 'You must consent to data processing to submit this form.';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await fetch('/api/corporate-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          organization,
          role,
          email,
          collaborationInterest,
          timeline,
          message,
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

  if (isSuccess) {
    return (
      <div className="text-center py-12 px-6">
        <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-[#0A1929] mb-2">Message Received</h3>
        <p className="text-[#2C3E50]">
          Thank you for reaching out to Quanta Foundry. We will get back to you within 3 business days.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Full Name"
          name="name"
          placeholder="Your full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />
        <Input
          label="Company / University / Organization"
          name="company"
          placeholder="Your company, university, or organization"
          required
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          error={errors.organization}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Role / Affiliation"
          name="role"
          placeholder="Your role or affiliation"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          error={errors.role}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="your.email@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
      </div>
      
      <Input
        label="Collaboration Interest"
        name="collaborationType"
        options={COLLABORATION_TYPES}
        required
        value={collaborationInterest}
        onChange={(e) => setCollaborationInterest(e.target.value)}
        error={errors.collaborationInterest}
      />
      
      <Input
        label="Timeline (Optional)"
        name="timeline"
        placeholder="Expected timeline"
        value={timeline}
        onChange={(e) => setTimeline(e.target.value)}
      />
      
      <Input
        label="Message"
        name="message"
        textarea
        placeholder="Tell us about your organization, idea, or use case and how you would like to collaborate..."
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={errors.message}
      />
      
      <GDPRConsent
        checked={gdprConsent}
        onChange={setGdprConsent}
        error={errors.gdpr}
      />

      {serverError && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle size={16} />
          <span>{serverError}</span>
        </div>
      )}

      <Button
        type="submit"
        loading={isSubmitting}
        className="w-full"
        id="corporate-inquiry-submit"
      >
        Submit Inquiry
      </Button>
    </form>
  );
}
