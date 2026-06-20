# Quanta Foundry — Website

A professional website for **Quanta Foundry**, a deep-tech education and applied research initiative focused on executive training in Applied AI, Quantitative Finance, and Quantum Software.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first config)
- **Forms**: Formspree (swappable)
- **Icons**: Lucide React
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages
│   ├── page.tsx         # Home
│   ├── programs/        # Programs page
│   ├── companies/       # For Companies page
│   ├── community/       # Community / Reading Club
│   ├── insights/        # Research & Insights
│   ├── about/           # About page
│   ├── apply/           # Apply / Contact page
│   └── privacy/         # Privacy Policy (GDPR)
├── components/
│   ├── layout/          # Navbar, Footer
│   ├── ui/              # Button, Card, Badge, Input, etc.
│   ├── sections/        # Home page sections
│   └── forms/           # Form components (Formspree)
├── data/                # Content data files (CMS-ready)
├── lib/                 # Utils, constants
└── types/               # TypeScript type definitions
```

## Content Management

All content is stored in `src/data/` files with TypeScript types. This structure is designed to migrate to Sanity.io CMS collections:

| Data File | Future CMS Collection |
|-----------|----------------------|
| `programs.ts` | Programs |
| `insights.ts` | Insights / Blog |
| `team.ts` | Team Members |
| `events.ts` | Events |
| `faqs.ts` | FAQs |
| `navigation.ts` | Navigation |

### Updating Content

1. Open the relevant file in `src/data/`
2. Edit the data (all fields are typed)
3. Save and the dev server will hot-reload

## Forms

Forms use **Formspree** via an abstraction layer (`FormProvider.tsx`). To switch to another provider (HubSpot, Brevo, Supabase):

1. Edit `src/components/forms/FormProvider.tsx`
2. Replace the Formspree hook with your new provider
3. No changes needed in individual form components

### Setting Up Formspree

1. Create a free account at [formspree.io](https://formspree.io)
2. Create forms for: Student Application, Corporate Inquiry, Newsletter, Reading Club
3. Update form IDs in `src/lib/constants.ts`

## Deployment (Vercel)

1. Push to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Deploy automatically

## Environment Variables

No environment variables are required for the MVP. Future integrations may need:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=   # Phase 2: Sanity CMS
NEXT_PUBLIC_SANITY_DATASET=      # Phase 2: Sanity CMS
```

## License

Private. All rights reserved.
