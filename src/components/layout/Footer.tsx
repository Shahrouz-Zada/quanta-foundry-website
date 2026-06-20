import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Twitter, Mail, Github } from 'lucide-react';
import { footerSections } from '@/data/navigation';
import { SITE_NAME, CONTACT_EMAIL, SOCIAL_LINKS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-[#0A1929] border-t border-white/5" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.jpg"
                alt="Quanta Foundry"
                width={48}
                height={48}
                className="rounded-lg"
                suppressHydrationWarning
              />
              <span className="text-lg font-bold text-white tracking-tight">
                Quanta<span className="text-[#4A90E2]"> Foundry</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              An independent applied research and project-based learning community exploring AI, quantitative finance, neuroscience and markets, and emerging deep-tech methods.
            </p>
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-500 hover:text-[#4A90E2] transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-gray-500 hover:text-[#4A90E2] transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-gray-500 hover:text-[#4A90E2] transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Email"
                className="text-gray-500 hover:text-[#4A90E2] transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#4A90E2] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-700">·</span>
            <span>Paris, France</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
