import { NextResponse } from 'next/server';

// =============================================================================
// Types
// =============================================================================
interface RegistrationBody {
  fullName: string;
  email: string;
  affiliation?: string;
  linkedinGithub?: string;
  mainInterest: string;
  motivation?: string;
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
const URL_RE = /^https?:\/\/.+/i;

const VALID_INTERESTS = [
  'Applied AI & Machine Learning',
  'Quantitative Finance',
  'Neuroscience & Markets',
  'Quantum Software',
];

function validate(body: RegistrationBody): string | null {
  if (!body.fullName?.trim())          return 'Full name is required.';
  if (!body.email?.trim())             return 'Email is required.';
  if (!EMAIL_RE.test(body.email))      return 'Please enter a valid email address.';
  if (!body.mainInterest?.trim())      return 'Please select a main interest.';
  if (!VALID_INTERESTS.includes(body.mainInterest))
                                       return 'Invalid interest selection.';
  if (body.motivation && body.motivation.trim().length > 300)
                                       return 'Motivation must be 300 characters or fewer.';
  if (!body.gdprConsent)               return 'GDPR consent is required.';
  if (body.linkedinGithub && !URL_RE.test(body.linkedinGithub))
                                       return 'LinkedIn/GitHub must be a valid URL (starting with https://).';
  return null;
}

// =============================================================================
// Airtable helpers
// =============================================================================
function getAirtableConfig() {
  const apiKey   = process.env.AIRTABLE_API_KEY;
  const baseId   = process.env.AIRTABLE_BASE_ID;
  const table    = process.env.AIRTABLE_TABLE_NAME ?? 'Workspace Q Registrations';

  if (!apiKey || !baseId) {
    throw new Error('AIRTABLE_API_KEY or AIRTABLE_BASE_ID environment variable is missing.');
  }
  return { apiKey, baseId, table };
}

async function checkDuplicate(email: string): Promise<boolean> {
  const { apiKey, baseId, table } = getAirtableConfig();
  const filter = encodeURIComponent(`{Email} = "${email}"`);
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?filterByFormula=${filter}&maxRecords=1`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    // Cache: no-store so we always get fresh data
    cache: 'no-store',
  });

  if (!res.ok) {
    // If we can't check, allow through (fail open) — we mark duplicates in a later step
    console.warn('Airtable duplicate check failed:', res.status);
    return false;
  }

  const data = await res.json();
  return Array.isArray(data.records) && data.records.length > 0;
}

async function createAirtableRecord(body: RegistrationBody): Promise<void> {
  const { apiKey, baseId, table } = getAirtableConfig();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;

  const record = {
    fields: {
      'Full Name':        body.fullName.trim(),
      'Email':            body.email.trim().toLowerCase(),
      'Affiliation':      body.affiliation?.trim() || '',
      'LinkedIn / GitHub': body.linkedinGithub?.trim() || '',
      'Main Interest':    body.mainInterest,
      'Motivation':       body.motivation?.trim() || '',
      'GDPR Consent':     true,
      'Status':           'Pending Review',
      'Registered At':    new Date().toISOString(),
      'Source':           'Workspace Q Form',
      'Cohort':           '',
      'Invitation Code':  '',
      'Notes':            '',
    },
    typecast: true,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable create failed: ${res.status} — ${err}`);
  }
}

// =============================================================================
// Route handler
// =============================================================================
export async function POST(req: Request) {
  try {
    const body: RegistrationBody = await req.json();

    // 1. Honeypot — bots fill this hidden field; real users leave it empty
    if (body.website) {
      // Return 200 so bots think they succeeded
      return NextResponse.json({ success: true });
    }

    // 2. Minimum form completion time (< 3 seconds = likely bot)
    if (body.formOpenDuration !== undefined && body.formOpenDuration < 3000) {
      return NextResponse.json(
        { error: 'Submission too fast. Please try again.' },
        { status: 429 }
      );
    }

    // 3. Server-side field validation
    const validationError = validate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 4. Duplicate email check
    const isDuplicate = await checkDuplicate(body.email.trim().toLowerCase());
    if (isDuplicate) {
      return NextResponse.json(
        {
          error:
            'An account with this email address is already registered. If you believe this is an error, please contact us.',
        },
        { status: 409 }
      );
    }

    // 5. Create Airtable record
    await createAirtableRecord(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Log server-side (visible in Vercel function logs, never sent to browser)
    console.error('[workspace-register] Error:', message);

    // Check for missing env vars
    if (message.includes('environment variable is missing')) {
      return NextResponse.json(
        {
          error:
            'Registration service is temporarily unavailable. Please try again later or contact us directly.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: `Server Error: ${message}`,
      },
      { status: 500 }
    );
  }
}
