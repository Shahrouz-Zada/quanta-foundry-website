'use client';

import { useState } from 'react';
import FormProvider from './FormProvider';
import Input from '@/components/ui/Input';
import GDPRConsent from '@/components/ui/GDPRConsent';
import Button from '@/components/ui/Button';
import { FORMSPREE_IDS } from '@/lib/constants';
import { focusAreas } from '@/data/focusAreas';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function StudentApplicationForm() {
  const [gdprConsent, setGdprConsent] = useState(false);
  const [gdprError, setGdprError] = useState('');

  const focusAreaOptions = focusAreas.map((p) => p.title);

  return (
    <FormProvider formId={FORMSPREE_IDS.studentApplication}>
      {({ handleSubmit, isSubmitting, isSuccess, hasErrors }) => {
        if (isSuccess) {
          return (
            <div className="text-center py-12 px-6">
              <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-[#0A1929] mb-2">Application Received</h3>
              <p className="text-[#2C3E50]">
                Thank you for your application! We will review your submission and contact you within 5 business days.
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
            {/* Honeypot */}
            <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Full Name" name="name" placeholder="Your full name" required />
              <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <Input label="LinkedIn Profile" name="linkedIn" type="url" placeholder="https://linkedin.com/in/..." />
            <Input
              label="Domain of Interest"
              name="domainOfInterest"
              options={focusAreaOptions}
              required
            />
            <Input
              label="Professional Background"
              name="background"
              textarea
              placeholder="Briefly describe your current role, experience, and technical background..."
              required
            />
            <Input
              label="Motivation"
              name="motivation"
              textarea
              placeholder="Why are you interested in this domain? What do you hope to achieve?"
              required
            />
            <GDPRConsent checked={gdprConsent} onChange={setGdprConsent} error={gdprError} />

            {hasErrors && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                <span>There was an error submitting your form. Please try again.</span>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full" id="student-application-submit">
              Submit Application
            </Button>
          </form>
        );
      }}
    </FormProvider>
  );
}
