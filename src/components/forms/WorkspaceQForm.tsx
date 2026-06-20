'use client';

import { useState, useEffect } from 'react';
import FormProvider from './FormProvider';
import Input from '@/components/ui/Input';
import GDPRConsent from '@/components/ui/GDPRConsent';
import Button from '@/components/ui/Button';
import { FORMSPREE_IDS } from '@/lib/constants';
import { AlertCircle } from 'lucide-react';

interface WorkspaceQFormProps {
  onSuccess: () => void;
}

export default function WorkspaceQForm({ onSuccess }: WorkspaceQFormProps) {
  const [gdprConsent, setGdprConsent] = useState(false);
  const [gdprError, setGdprError] = useState('');

  return (
    <FormProvider formId={FORMSPREE_IDS.workspaceQ}>
      {({ handleSubmit, isSubmitting, isSuccess, hasErrors }) => {
        // Trigger onSuccess callback once form submission completes successfully
        // We do this in a useEffect to avoid setting state during render
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (isSuccess) {
            onSuccess();
          }
        }, [isSuccess]);

        const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          if (!gdprConsent) {
            e.preventDefault();
            setGdprError('You must consent to data processing to register.');
            return;
          }
          setGdprError('');
          handleSubmit(e);
        };

        return (
          <form onSubmit={onSubmit} className="space-y-5">
            <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="_off" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                name="name"
                placeholder="Jean Dupont"
                required
                id="workspace-reg-name"
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="jean.dupont@univ-paris.fr"
                required
                id="workspace-reg-email"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="School / University"
                name="school"
                placeholder="Sorbonne, Polytechnique, etc."
                required
                id="workspace-reg-school"
              />
              <Input
                label="Course of Interest"
                name="courseInterest"
                options={[
                  'Applied AI & Machine Learning',
                  'Quantitative Finance & Data-Driven Strategies',
                  'Quantum Software Engineering',
                  'Other / Self-Learner',
                ]}
                required
                id="workspace-reg-course"
              />
            </div>

            <GDPRConsent
              checked={gdprConsent}
              onChange={setGdprConsent}
              error={gdprError}
            />

            {hasErrors && (
              <div className="flex items-center gap-2 text-red-500 text-sm" id="workspace-reg-error">
                <AlertCircle size={16} />
                <span>There was an error submitting your registration. Please try again.</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="w-full justify-center"
              id="workspace-reg-submit"
            >
              Unlock Workspace Q
            </Button>
          </form>
        );
      }}
    </FormProvider>
  );
}
