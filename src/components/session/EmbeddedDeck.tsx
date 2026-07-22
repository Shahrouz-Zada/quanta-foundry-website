'use client';
// =============================================================================
// EmbeddedDeck — Learning Sessions Prototype
// Client component: responsive 16:9 iframe, fullscreen support.
// SECURITY: Only accepts same-domain relative paths (/courses/...).
// =============================================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { Maximize2, Minimize2, AlertCircle, Presentation } from 'lucide-react';

interface Props {
  /** Must be a same-domain relative path starting with "/" or undefined */
  src?: string;
  title: string;
}

function isSameDomain(src: string): boolean {
  return src.startsWith('/') && !src.startsWith('//');
}

export default function EmbeddedDeck({ src, title }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeSrc = src && isSameDomain(src) ? src : undefined;

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported — silently ignore
    }
  }, []);

  // Sync fullscreen state with browser ESC key
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-white/10 bg-[#011510] overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A1929] border-b border-white/10">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Presentation size={13} className="text-[#D4AF37]" />
          <span className="text-gray-300 font-medium">{title}</span>
          {!safeSrc && (
            <span className="ml-2 px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
              Placeholder — deck not yet uploaded
            </span>
          )}
        </div>
        {safeSrc && (
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
        )}
      </div>

      {/* 16:9 iframe container */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {safeSrc && !hasError ? (
          <iframe
            src={`${safeSrc}?embed=true`}
            title={title}
            allowFullScreen
            onError={() => setHasError(true)}
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-presentation"
          />
        ) : (
          /* Placeholder / error state */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#011510]">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              {hasError ? (
                <AlertCircle size={28} className="text-amber-400" />
              ) : (
                <Presentation size={28} className="text-[#D4AF37]" />
              )}
            </div>
            <div className="text-center px-8">
              <p className="text-white font-semibold text-sm mb-1">
                {hasError ? 'Unable to load deck' : 'Teaching deck not yet uploaded'}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                {hasError
                  ? 'The deck file could not be loaded. Please check the file path.'
                  : 'Place the HTML presentation at /public/courses/finance-data-ai/session-01/deck.html and it will appear here automatically.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
