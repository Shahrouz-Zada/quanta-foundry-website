'use client';

import { useState } from 'react';
import FormProvider from './FormProvider';
import Input from '@/components/ui/Input';
import GDPRConsent from '@/components/ui/GDPRConsent';
import Button from '@/components/ui/Button';
import { FORMSPREE_IDS, COLLABORATION_TYPES } from '@/lib/constants';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function CorporateInquiryForm() {
  const [gdprConsent, setGdprConsent] = useState(false);
  const [gdprError, setGdprError] = useState('');

  return (
    <FormProvider formId={FORMSPREE_IDS.corporateInquiry}>
      {({ handleSubmit, isSubmitting, isSuccess, hasErrors }) => {
        if (isSuccess) {
          return (
            <div className="text-center py-12 px-6">
              <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-[#0A1929] mb-2">Inquiry Received</h3>
              <p className="text-[#2C3E50]">
                Thank you for your interest in partnering with Quanta Foundry. Our team will reach out within 3 business days.
              </p>
            </div>
          );
        }

        const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          if (!gdprConsent) {
            e.preventDefault();
            setGdprError('You must consent to data processing to submit this form.');
            return;
          }
          setGdprError('');
          handleSubmit(e);
        };

        return (
          <form onSubmit={onSubmit} className="space-y-5">
            <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Full Name" name="name" placeholder="Your full name" required />
              <Input label="Organization / Company" name="company" placeholder="Organization or company name" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Role / Affiliation" name="role" placeholder="Your role or affiliation" required />
              <Input label="Email" name="email" type="email" placeholder="you@company.com" required />
            </div>
            <Input
              label="Collaboration Interest"
              name="collaborationType"
              options={[...COLLABORATION_TYPES]}
              required
            />
            <Input label="Timeline (Optional)" name="timeline" placeholder="Expected timeline" />
            <Input
              label="Message"
              name="message"
              textarea
              placeholder="Tell us about your organization, idea, or use case and how you would like to collaborate..."
              required
            />
            <GDPRConsent checked={gdprConsent} onChange={setGdprConsent} error={gdprError} />

            {hasErrors && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                <span>There was an error submitting your form. Please try again.</span>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full" id="corporate-inquiry-submit">
              Submit Inquiry
            </Button>
          </form>
        );
      }}
    </FormProvider>
  );
}
