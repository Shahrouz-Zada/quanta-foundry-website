'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GDPRConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  compact?: boolean;
}

export default function GDPRConsent({ checked, onChange, error, compact = false }: GDPRConsentProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-start gap-3 cursor-pointer group" id="gdpr-consent-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-gray-300 text-[#4A90E2] focus:ring-[#4A90E2] cursor-pointer',
            error && 'border-red-400'
          )}
          required
          id="gdpr-consent-checkbox"
          name="gdprConsent"
        />
        <span className={cn('text-[#2C3E50] leading-relaxed', compact ? 'text-xs' : 'text-sm')}>
          I consent to Quanta Foundry processing my data as described in the{' '}
          <Link href="/privacy" className="text-[#4A90E2] hover:underline" target="_blank">
            Privacy Policy
          </Link>
          . My data will be used solely to respond to my inquiry and will not be shared with third parties.
          <span className="text-red-500 ml-1">*</span>
        </span>
      </label>
      {error && (
        <p className="text-sm text-red-500 ml-7" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
