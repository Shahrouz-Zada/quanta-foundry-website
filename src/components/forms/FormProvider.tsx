'use client';

import { useForm } from '@formspree/react';
import { ReactNode } from 'react';

// =============================================================================
// Form Provider — Abstraction layer for form submission
// Currently uses Formspree. Can be swapped to HubSpot, Brevo, Supabase, etc.
// by modifying this single file.
// =============================================================================

interface FormProviderProps {
  formId: string;
  children: (props: {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isSubmitting: boolean;
    isSuccess: boolean;
    hasErrors: boolean;
  }) => ReactNode;
}

export default function FormProvider({ formId, children }: FormProviderProps) {
  const [state, handleSubmit] = useForm(formId);

  return (
    <>
      {children({
        handleSubmit,
        isSubmitting: state.submitting,
        isSuccess: state.succeeded,
        hasErrors: Array.isArray(state.errors) ? state.errors.length > 0 : !!state.errors,
      })}
    </>
  );
}
