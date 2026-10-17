import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import SectionHeading from '@/components/ui/SectionHeading';

// Temporary, unlisted course-deck download page. Not linked from the main
// nav on purpose — reachable only via direct URL (/courses) while we need a
// quick way to hand students their slide decks. Intentionally excluded from
// search indexing below (robots: noindex, nofollow) to keep it unlisted.
export const metadata: Metadata = {
  title: 'Course Decks',
  description: 'Download course session decks.',
  robots: { index: false, follow: false },
};

interface Deck {
  filename: string;
  title: string;
  sizeKB: number;
}

// Reads whatever .html files currently sit in public/decks and lists them.
// Drop a new deck file into that folder and redeploy — no code change, no
// database, nothing else to touch. (Vercel's filesystem is read-only at
// request time, so this only picks up files that were present at deploy
// time — there's no "upload" step here, just redeploy after adding files.)
function getDecks(): Deck[] {
  const decksDir = path.join(process.cwd(), 'public', 'decks');
  if (!fs.existsSync(decksDir)) return [];

  return fs
    .readdirSync(decksDir)
    .filter((filename) => filename.toLowerCase().endsWith('.html'))
    .map((filename) => {
      const { size } = fs.statSync(path.join(decksDir, filename));
      const title = filename
        .replace(/\.html$/i, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { filename, title, sizeKB: Math.max(1, Math.round(size / 1024)) };
    })
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

export default function CoursesPage() {
  const decks = getDecks();

  return (
    <main className="min-h-screen pt-24 pb-24 bg-[#F5F7FA]">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          title="Course Decks"
          subtitle="Download the slide decks for your sessions below."
        />

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 md:p-8">
          {decks.length === 0 ? (
            <p className="text-[#2C3E50]/70 italic text-center py-8">
              No decks are available yet. Check back soon.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {decks.map((deck) => (
                <li
                  key={deck.filename}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="font-semibold text-[#0A1929]">{deck.title}</div>
                    <div className="text-sm text-[#2C3E50]/60">{deck.sizeKB} KB</div>
                  </div>
                  <a
                    href={`/decks/${deck.filename}`}
                    download
                    className="shrink-0 rounded-lg bg-[#0A1929] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0D2137]"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
