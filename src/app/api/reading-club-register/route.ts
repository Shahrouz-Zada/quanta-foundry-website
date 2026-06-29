import { NextResponse } from 'next/server';

// =============================================================================
// Types
// =============================================================================
interface RCRegistrationBody {
  fullName: string;
  email: string;
  trackInterest: string[]; // multi-select
  preferredParticipation?: string;
  affiliation?: string;
  linkedinGithub?: string;
  pythonLevel?: string;
  motivation?: string;
  gdprConsent: boolean;
  // Honeypot — must be empty
  website?: string;
  // Anti-spam: form open time in ms
  formOpenDuration?: number;
}

// =============================================================================
// Validation
// =============================================================================
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

const VALID_TRACKS = [
  'Applied AI & Machine Learning',
  'Quantitative Finance',
  'Neuroscience & Markets',
  'Quantum Software',
];

const VALID_PARTICIPATION = [
  'Updates only',
  'Live sessions',
  'Notebooks / projects',
  'Future Workspace Q',
];

const VALID_PYTHON_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

function validate(body: RCRegistrationBody): string | null {
  if (!body.fullName?.trim())       return 'Full name is required.';
  if (!body.email?.trim())          return 'Email is required.';
  if (!EMAIL_RE.test(body.email))   return 'Please enter a valid email address.';
  if (!Array.isArray(body.trackInterest) || body.trackInterest.length === 0)
                                    return 'Please select at least one track.';
  if (body.trackInterest.some((t) => !VALID_TRACKS.includes(t)))
                                    return 'Invalid track selection.';
  if (body.preferredParticipation && !VALID_PARTICIPATION.includes(body.preferredParticipation))
                                    return 'Invalid participation preference.';
  if (body.pythonLevel && !VALID_PYTHON_LEVELS.includes(body.pythonLevel))
                                    return 'Invalid Python level selection.';
  if (body.motivation && body.motivation.trim().length > 300)
                                    return 'Motivation must be 300 characters or fewer.';
  if (!body.gdprConsent)            return 'GDPR consent is required.';
  if (body.linkedinGithub && !URL_RE.test(body.linkedinGithub))
                                    return 'LinkedIn/GitHub must be a valid URL (starting with https://).';
  return null;
}

// =============================================================================
// Airtable helpers
// =============================================================================
function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table  = process.env.AIRTABLE_RC_TABLE_NAME ?? 'Reading Club Registrations';

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
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn('Airtable RC duplicate check failed:', res.status);
    return false;
  }

  const data = await res.json();
  return Array.isArray(data.records) && data.records.length > 0;
}

async function createAirtableRecord(body: RCRegistrationBody): Promise<void> {
  const { apiKey, baseId, table } = getAirtableConfig();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;

  const record = {
    fields: {
      'Full Name':               body.fullName.trim(),
      'Email':                   body.email.trim().toLowerCase(),
      'Track Interest':          body.trackInterest.join(', '),
      'Preferred Participation': body.preferredParticipation?.trim() || '',
      'Affiliation':             body.affiliation?.trim() || '',
      'LinkedIn / GitHub':       body.linkedinGithub?.trim() || '',
      'Python Level':            body.pythonLevel?.trim() || '',
      'Motivation':              body.motivation?.trim() || '',
      'GDPR Consent':            true,
      'Status':                  'Registered',
      'Registered At':           new Date().toISOString(),
      'Source':                  'Reading Club Form',
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
    const body: RCRegistrationBody = await req.json();

    // 1. Honeypot
    if (body.website) {
      return NextResponse.json({ success: true });
    }

    // 2. Minimum completion time
    if (body.formOpenDuration !== undefined && body.formOpenDuration < 3000) {
      return NextResponse.json(
        { error: 'Submission too fast. Please try again.' },
        { status: 429 }
      );
    }

    // 3. Validate
    const validationError = validate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // 4. Duplicate check
    const isDuplicate = await checkDuplicate(body.email.trim().toLowerCase());
    if (isDuplicate) {
      // Return success to avoid blocking users on new devices and prevent email enumeration.
      return NextResponse.json({ success: true, message: 'Already registered' });
    }

    // 5. Create record
    await createAirtableRecord(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[reading-club-register] Error:', message);

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
      { error: `Server Error: ${message}` },
      { status: 500 }
    );
  }
}
