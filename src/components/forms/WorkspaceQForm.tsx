'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import GDPRConsent from '@/components/ui/GDPRConsent';
import Button from '@/components/ui/Button';
import { AlertCircle, Loader2 } from 'lucide-react';

interface WorkspaceQFormProps {
  onSuccess: () => void;
}

export default function WorkspaceQForm({ onSuccess }: WorkspaceQFormProps) {
  const [gdprConsent, setGdprConsent] = useState(false);
  const [gdprError, setGdprError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gdprConsent) {
      setGdprError('You must consent to data processing to register.');
      return;
    }
    setGdprError('');
    setIsSubmitting(true);
    setHasErrors(false);
    
    // Simulate network request to allow instant access
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 800);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
            
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
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Unlocking...
                </>
              ) : (
                'Unlock Workspace Q'
              )}
            </Button>
          </form>
  );
}
