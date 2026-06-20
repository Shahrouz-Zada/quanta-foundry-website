'use client';

import { useState } from 'react';
import FormProvider from './FormProvider';
import Input from '@/components/ui/Input';
import GDPRConsent from '@/components/ui/GDPRConsent';
import Button from '@/components/ui/Button';
import { FORMSPREE_IDS, TOPIC_INTERESTS } from '@/lib/constants';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ReadingClubForm() {
  const [gdprConsent, setGdprConsent] = useState(false);
  const [gdprError, setGdprError] = useState('');

  return (
    <FormProvider formId={FORMSPREE_IDS.readingClub}>
      {({ handleSubmit, isSubmitting, isSuccess, hasErrors }) => {
        if (isSuccess) {
          return (
            <div className="text-center py-12 px-6">
              <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-[#0A1929] mb-2">Welcome to the Reading Club!</h3>
              <p className="text-[#2C3E50]">
                You&apos;ll receive details about upcoming sessions via email. We look forward to exploring ideas together.
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
              <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <Input label="LinkedIn Profile (Optional)" name="linkedIn" type="url" placeholder="https://linkedin.com/in/yourprofile" />
            <Input
              label="Areas of Interest (Optional)"
              name="topicInterest"
              options={[...TOPIC_INTERESTS]}
            />
            <GDPRConsent checked={gdprConsent} onChange={setGdprConsent} error={gdprError} />

            {hasErrors && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                <span>There was an error. Please try again.</span>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full" id="reading-club-submit">
              Join the Reading Club
            </Button>
          </form>
        );
      }}
    </FormProvider>
  );
}
