# Content Update Guide — Quanta Foundry Reading Club

This guide explains how to update Reading Club content on the website **without needing developer help**. All edits are made by editing plain text files on GitHub. After you commit, Vercel automatically rebuilds and deploys the site in about 60 seconds.

---

## How to Edit Files on GitHub

1. Go to your repository: **https://github.com/Shahrouz-Zada/quanta-foundry-website**
2. Navigate to the file you want to edit (paths are listed in each section below)
3. Click the **pencil icon** (✏️) in the top-right of the file view
4. Make your changes
5. Scroll down and click **"Commit changes"**
6. Wait ~60 seconds — Vercel will automatically redeploy the site

---

## Content File Locations

| What you want to update | File to edit |
|---|---|
| Reading tracks (Active, Coming Soon) | `src/data/readingClub/tracks.ts` |
| Sessions (dates, papers, status) | `src/data/readingClub/sessions.ts` |
| Reading list (papers, books) | `src/data/readingClub/readingList.ts` |
| Insights / article list | `src/data/insights.ts` |
| Article full text | `src/content/notes/[slug].mdx` |

---

## Task 1 — Add a New Session

**File:** `src/data/readingClub/sessions.ts`

Find the `readingClubSessions` array. Add a new object at the correct position. Copy and paste this template:

```ts
{
  id: 'qf-s5',                          // ← Use the next number: qf-s5, qf-s6, etc.
  trackId: 'quant-finance',             // ← Keep this as-is for the Quant Finance track
  number: 5,                            // ← Session number within the track
  title: 'Your Session Title Here',     // ← The full session title
  theme: 'One sentence describing the session theme.',
  status: 'upcoming',                   // ← 'upcoming' | 'past' | 'planned'
  date: 'TBA',                          // ← Use 'TBA' or a real date like '2026-10-15'
  time: '18:00 CET',
  accessibleReading: {
    title: 'Title of the easy reading',
    authors: 'Author Name',
    url: 'https://link-to-reading.com', // ← Leave '' if no public link
  },
  corePaper: {
    title: 'Title of the core paper',
    authors: 'Author Name (Year)',
    url: 'https://arxiv.org/abs/...',   // ← Leave '' if no public link
  },
  notebookUrl: '',                      // ← Add GitHub notebook URL after the session
  noteSlug: '',                         // ← Add the article slug after publishing notes
  discussionQuestions: [
    'First discussion question?',
    'Second discussion question?',
    'Third discussion question?',
  ],
  miniProject: 'Description of the between-session mini-project.',
  isPublic: true,                       // ← true = show on public page, false = internal only
},
```

**Important:** The first 4 sessions (`qf-s1` through `qf-s4`) are already set to `isPublic: true`. Sessions 5–12 are `isPublic: false` until you are ready to announce them. To make a session public, change `isPublic: false` to `isPublic: true`.

---

## Task 2 — Update a Session Date

**File:** `src/data/readingClub/sessions.ts`

Find the session by its `id` (e.g., `qf-s1`) and change the `date` field:

```ts
// Before:
date: 'TBA',

// After — use YYYY-MM-DD format:
date: '2026-09-10',
```

If the date is not yet confirmed, leave it as `'TBA'`.

---

## Task 3 — Mark a Session as Past

**File:** `src/data/readingClub/sessions.ts`

After a session has taken place, change its `status`:

```ts
// Before:
status: 'upcoming',

// After:
status: 'past',
```

---

## Task 4 — Link a Notebook to a Session

**File:** `src/data/readingClub/sessions.ts`

After uploading the notebook to GitHub, paste its URL into the session's `notebookUrl` field:

```ts
// Before:
notebookUrl: '',

// After:
notebookUrl: 'https://github.com/quanta-foundry/quanta-quant-club/blob/main/notebooks/01_stylized_facts_returns.ipynb',
```

The notebook link will automatically appear on the session card on the website.

---

## Task 5 — Add a Reading List Entry

**File:** `src/data/readingClub/readingList.ts`

Find the `readingList` array and add a new object. Copy and paste this template:

```ts
{
  id: 'author-year',                  // ← Short unique ID, e.g. 'cont-2001'
  title: 'Full Paper or Book Title',
  authors: 'First Author, Second Author',
  year: 2024,
  type: 'paper',                      // ← 'paper' | 'book' | 'chapter' | 'article'
  url: 'https://link-to-paper.com',   // ← Leave '' if no public link
  summary: 'One or two sentences explaining why this reading matters.',
  trackId: 'quant-finance',           // ← Which track this belongs to
  sessionId: 'qf-s5',                 // ← Optional: link to a specific session, or remove this line
  tags: ['tag1', 'tag2'],
  featured: false,                    // ← Set true to show in the highlighted reading list
},
```

Add it anywhere inside the `readingList` array. The website does not care about the order.

---

## Task 6 — Publish a Technical Note (Full Article)

Publishing a full technical note requires two steps:

### Step 6a — Create the MDX article file

**Folder:** `src/content/notes/`

Create a new file named `[your-slug].mdx`. The filename must exactly match the `slug` field in `insights.ts`.

**Example filename:** `qf-session-1-stylized-facts.mdx`

Write the article in standard Markdown. You can use:
- `# Heading 1`, `## Heading 2`, `### Heading 3`
- `**bold**`, `*italic*`
- `- bullet points`
- `1. numbered lists`
- `` `inline code` ``
- Code blocks with triple backticks and a language name:
  ````
  ```python
  import pandas as pd
  ```
  ````
- Math equations: `$inline math$` and `$$display math$$`
- Horizontal rules: `---`
- Blockquotes: `> Quote text`

**Template to copy:**

```mdx
# Your Article Title

Brief introduction paragraph explaining what this article covers.

---

## Section 1 — Background

Your content here...

## Section 2 — Key Findings

Your content here...

## Key Takeaways

1. First takeaway
2. Second takeaway
3. Third takeaway

---

*These notes were compiled from our [Month Year] reading session.*
```

### Step 6b — Add metadata to the insights list

**File:** `src/data/insights.ts`

Add a new entry to the `insights` array:

```ts
{
  id: 'qf-session-1-stylized-facts',
  slug: 'qf-session-1-stylized-facts',   // ← Must match your .mdx filename (without .mdx)
  title: 'Reading Club Notes: Stylized Facts of Financial Returns',
  excerpt: 'Session 1 notes covering log-returns, fat tails, volatility clustering, and the leverage effect.',
  author: 'Quanta Foundry',
  date: '2026-09-10',                     // ← Publication date in YYYY-MM-DD format
  readTime: '8 min read',
  category: 'quantitative-finance',       // ← Category from the list below
  tags: ['reading club', 'stylized facts', 'quantitative finance'],
  featured: false,
},
```

Available categories: `'ai-ml'`, `'quantitative-finance'`, `'quantum-software'`, `'neuroscience-markets'`, `'complex-systems'`, `'research'`

### Step 6c — Link the note to its session (optional)

**File:** `src/data/readingClub/sessions.ts`

Find the session and paste the article slug into `noteSlug`:

```ts
noteSlug: 'qf-session-1-stylized-facts',
```

A "Read Session Notes →" link will automatically appear on the session card.

---

## Task 7 — Add a New Track

**File:** `src/data/readingClub/tracks.ts`

Add a new object to the `readingTracks` array:

```ts
{
  id: 'new-track-id',
  title: 'Full Track Title',
  shortTitle: 'Short Title',
  subtitle: 'Season X — Upcoming',
  status: 'coming-soon',              // ← Start as 'coming-soon', change to 'active' at launch
  description: 'One sentence describing the track.',
  longDescription: 'Two or three sentences with more detail.',
  accent: '#4A90E2',                  // ← Hex color for the track accent
  icon: 'Brain',                      // ← Lucide icon name: 'Brain' | 'TrendingUp' | 'Activity' | 'Cpu'
  prerequisites: [
    'Prerequisite 1',
    'Prerequisite 2',
  ],
  format: {
    cadence: 'Biweekly',
    duration: '90 minutes per session',
    location: 'Online (Zoom)',
    cohortSize: 'TBA',
  },
  order: 5,                           // ← Display order (higher number = shown later)
},
```

To make a track active, change `status: 'coming-soon'` to `status: 'active'`. The first active track becomes the "Featured Track" automatically.

---

## Task 8 — Make Sessions 5–12 Public (After Session 4)

**File:** `src/data/readingClub/sessions.ts`

After collecting feedback from Session 4, announce Sessions 5–8 by changing their `isPublic` field:

```ts
// Before:
isPublic: false,

// After:
isPublic: true,
```

Also change their `status` from `'planned'` to `'upcoming'` to show the correct badge.

---

## Quick Reference — Status Values

| Status | Meaning | What it shows on the website |
|---|---|---|
| `'upcoming'` | Session announced, date TBA or confirmed | "Date TBA" or actual date badge |
| `'past'` | Session has taken place | "Past" badge |
| `'planned'` | Session is planned but not yet announced | Not shown (only if `isPublic: false`) |

---

## Troubleshooting

**My changes aren't showing on the website.**
→ Wait 60–90 seconds after committing. Vercel needs time to rebuild.

**I get an error after committing.**
→ Check for missing commas between objects in arrays, or unclosed brackets. TypeScript is strict — every object needs a comma after it except the last one.

**The article page shows "Full article content coming soon" even though I created the .mdx file.**
→ Make sure the filename matches the `slug` field in `insights.ts` exactly (case-sensitive, no spaces, must end with `.mdx`).

**I want to temporarily hide a session.**
→ Change `isPublic: true` to `isPublic: false`. The session data is still saved but won't appear on the public page.
