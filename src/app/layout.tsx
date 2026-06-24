import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatAssistant from '@/components/ui/ChatAssistant';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://quantafoundry.com'),
  title: {
    default: 'Quanta Foundry | Applied Research & Project-Based Learning Community',
    template: '%s | Quanta Foundry',
  },
  description:
    'An independent applied research and project-based learning community bridging academia and industry through Applied AI, Quantitative Finance, and Quantum Software.',
  keywords: [
    'AI training',
    'machine learning',
    'quantitative finance',
    'quantum computing',
    'project-based learning',
    'deep tech',
    'applied research',
    'Paris',
  ],
  authors: [{ name: 'Quanta Foundry' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quantafoundry.com',
    siteName: 'Quanta Foundry',
    title: 'Quanta Foundry | Applied Research & Project-Based Learning',
    description:
      'An independent applied research and project-based learning community in Applied AI, Quantitative Finance, and Quantum Software.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
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
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Quanta Foundry',
              url: 'https://quantafoundry.com',
              logo: 'https://quantafoundry.com/images/logo.jpg',
              description:
                'Deep-tech talent foundry bridging academia and industry through applied AI, quantitative finance, project-based learning, and proprietary educational tools.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Paris',
                addressCountry: 'FR',
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-white text-[#0A1929]`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatAssistant />
        <Analytics />
      </body>
    </html>
  );
}
