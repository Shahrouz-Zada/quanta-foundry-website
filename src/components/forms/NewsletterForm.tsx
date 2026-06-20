'use client';

import { useState } from 'react';
import FormProvider from './FormProvider';
import GDPRConsent from '@/components/ui/GDPRConsent';
import Button from '@/components/ui/Button';
import { FORMSPREE_IDS } from '@/lib/constants';
import { CheckCircle, Mail } from 'lucide-react';

export default function NewsletterForm() {
  const [gdprConsent, setGdprConsent] = useState(false);
  const [gdprError, setGdprError] = useState('');

  return (
    <FormProvider formId={FORMSPREE_IDS.newsletter}>
      {({ handleSubmit, isSubmitting, isSuccess }) => {
        if (isSuccess) {
          return (
            <div className="flex items-center gap-3 py-3">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <p className="text-sm text-emerald-400">You&apos;re subscribed! Welcome to the Quanta Foundry community.</p>
            </div>
          );
        }

        const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          if (!gdprConsent) {
            e.preventDefault();
            setGdprError('Consent required.');
            return;
          }
          setGdprError('');
          handleSubmit(e);
        };

        return (
          <form onSubmit={onSubmit} className="space-y-3">
            <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] transition-all"
                  id="newsletter-email"
                />
              </div>
              <Button type="submit" size="sm" loading={isSubmitting} id="newsletter-submit">
                Subscribe
              </Button>
            </div>
            <GDPRConsent checked={gdprConsent} onChange={setGdprConsent} error={gdprError} compact />
          </form>
        );
      }}
    </FormProvider>
  );
}
