import { NextResponse } from 'next/server';
import { COLLABORATION_TYPES } from '@/lib/constants';

// =============================================================================
// Types
// =============================================================================
interface InquiryBody {
  fullName: string;
  organization: string;
  role: string;
  email: string;
  collaborationInterest: string;
  timeline?: string;
  message: string;
  gdprConsent: boolean;
  // Honeypot — must be empty
  website?: string;
  // Anti-spam: form open time in ms (sent by client)
  formOpenDuration?: number;
}

// =============================================================================
// Validation helpers
// =============================================================================
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: InquiryBody): string | null {
  if (!body.fullName?.trim()) return 'Full name is required.';
  if (!body.organization?.trim()) return 'Organization or company name is required.';
  if (!body.role?.trim()) return 'Role or affiliation is required.';
  if (!body.email?.trim()) return 'Email is required.';
  if (!EMAIL_RE.test(body.email)) return 'Please enter a valid email address.';
  if (!body.collaborationInterest?.trim()) return 'Please select a collaboration interest.';
  
  // Validate collaboration interest against predefined types
  if (!(COLLABORATION_TYPES as readonly string[]).includes(body.collaborationInterest)) {
    return 'Invalid collaboration interest selection.';
  }

  if (!body.message?.trim()) return 'Message is required.';
  if (!body.gdprConsent) return 'GDPR consent is required.';

  return null;
}

// =============================================================================
// Airtable helpers
// =============================================================================
function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_CORPORATE_TABLE_NAME ?? 'Corporate Inquiries';

  if (!apiKey || !baseId) {
    throw new Error('AIRTABLE_API_KEY or AIRTABLE_BASE_ID environment variable is missing.');
  }
  return { apiKey, baseId, table };
}

async function createAirtableRecord(body: InquiryBody): Promise<void> {
  const { apiKey, baseId, table } = getAirtableConfig();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;

  const record = {
    fields: {
      'Full Name': body.fullName.trim(),
      'Organization / Company': body.organization.trim(),
      'Role / Affiliation': body.role.trim(),
      'Email': body.email.trim().toLowerCase(),
      'Collaboration Interest': body.collaborationInterest,
      'Timeline': body.timeline?.trim() || '',
      'Message': body.message.trim(),
      'GDPR Consent': true,
      'Status': 'New Inquiry',
      'Submitted At': new Date().toISOString(),
      'Source': 'Partners Page Form',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [record] }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Airtable insertion failed:', res.status, errorText);
    throw new Error(`Airtable API error: ${res.status}`);
  }
}

// =============================================================================
// POST Handler
// =============================================================================
export async function POST(request: Request) {
  try {
    const body: InquiryBody = await request.json();

    // 1. Bot check: honeypot field
    if (body.website && body.website.length > 0) {
      console.warn('Honeypot filled. Rejecting silently.');
      return NextResponse.json({ success: true });
    }

    // 2. Bot check: form submitted too fast (under 3 seconds)
    if (body.formOpenDuration && body.formOpenDuration < 3000) {
      console.warn(`Form submitted too fast (${body.formOpenDuration}ms). Rejecting silently.`);
      return NextResponse.json({ success: true });
    }

    // 3. Validation
    const validationError = validate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 4. Save to Airtable
    try {
      await createAirtableRecord(body);
    } catch (dbError: unknown) {
      const message = dbError instanceof Error ? dbError.message : 'Unknown error';
      console.error('Database Error:', message);
      return NextResponse.json(
        { error: 'Internal server error while saving data.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Registration handler error:', message);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
