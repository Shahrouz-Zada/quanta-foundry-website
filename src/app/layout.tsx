import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatAssistant from '@/components/ui/ChatAssistant';
import RouteAwareShell from '@/components/layout/RouteAwareShell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.quantafoundry.com'),
  title: {
    default: 'Quanta Foundry | Applied Research & Project-Based Learning',
    template: '%s | Quanta Foundry',
  },
  description:
    'An independent applied research and project-based learning community bridging academia and industry through Applied AI, Quantitative Finance, and Quantum Software.',
  keywords: [
    'applied research community',
    'project-based learning',
    'quantitative finance',
    'applied AI',
    'quantum software',
    'reading club',
    'deep tech',
    'Paris',
  ],
  authors: [{ name: 'Quanta Foundry' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.quantafoundry.com',
    siteName: 'Quanta Foundry',
    title: 'Quanta Foundry | Applied Research & Project-Based Learning',
    description:
      'An independent applied research and project-based learning community in Applied AI, Quantitative Finance, and Quantum Software.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Quanta Foundry — Applied Research & Project-Based Learning',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quanta Foundry | Applied Research & Project-Based Learning',
    description:
      'An independent applied research and project-based learning community in Applied AI, Quantitative Finance, and Quantum Software.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Quanta Foundry',
                url: 'https://www.quantafoundry.com',
                logo: 'https://www.quantafoundry.com/images/logo.jpg',
                description:
                  'An independent applied research and project-based learning community bridging academia and industry through Applied AI, Quantitative Finance, and Quantum Software.',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Paris',
                  addressCountry: 'FR',
                },
                sameAs: [],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Quanta Foundry',
                alternateName: ["QuantaFoundry", "quantafoundry.com"],
                url: 'https://www.quantafoundry.com',
              },
            ]),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-white text-[#0A1929]`}>
        {/*
          RouteAwareShell conditionally renders Navbar, Footer, and ChatAssistant.
          On /workspace-q/learning-sessions routes these are fully absent from
          the DOM — not just visually hidden — so they remain keyboard-inaccessible.
          The public pages continue to render the full site chrome as before.
        */}
        <RouteAwareShell
          navbar={<Navbar />}
          footer={<Footer />}
          chat={<ChatAssistant />}
        >
          {children}
        </RouteAwareShell>
        <Analytics />
      </body>
    </html>
  );
}
