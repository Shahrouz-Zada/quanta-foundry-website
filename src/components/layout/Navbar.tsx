'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { mainNavItems } from '@/data/navigation';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-[#0A1929]/90 backdrop-blur-xl shadow-lg shadow-black/10'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group" id="nav-logo">
          <Image
            src="/images/logo.jpg"
            alt="Quanta Foundry"
            width={56}
            height={56}
            className="rounded-lg transition-transform duration-300 group-hover:scale-105"
            priority
            suppressHydrationWarning
          />
          <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
            Quanta<span className="text-[#4A90E2]"> Foundry</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.href.slice(1)}`}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#4A90E2] after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/workspace-q"
            id="nav-workspace-cta"
            className="ml-2 px-5 py-2.5 bg-[#4A90E2] text-white text-sm font-semibold rounded-lg hover:bg-[#6BA4E8] transition-all duration-200 hover:shadow-lg hover:shadow-[#4A90E2]/25"
          >
            Workspace Q
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          id="nav-mobile-toggle"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0A1929] border-l border-white/10 transition-transform duration-300 ease-out lg:hidden z-50',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-8">
          <div className="flex flex-col gap-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-8 px-4">
            <Link
              href="/workspace-q"
              onClick={() => setIsMobileOpen(false)}
              className="block w-full text-center px-6 py-3 bg-[#4A90E2] text-white font-semibold rounded-lg hover:bg-[#6BA4E8] transition-colors"
            >
              Workspace Q
            </Link>
          </div>
          <div className="mt-auto px-4 text-sm text-gray-500">
            © {new Date().getFullYear()} Quanta Foundry
          </div>
        </div>
      </div>
    </header>
  );
}
