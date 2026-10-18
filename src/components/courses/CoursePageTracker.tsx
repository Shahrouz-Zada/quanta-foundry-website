'use client';

import { useEffect } from 'react';

const SESSION_KEY = 'qf-courses-visit-counted';

/**
 * Counts one visit to the Courses page per browser tab session (reloading
 * or coming back in the same tab doesn't count again). Runs only in a real
 * browser, so link prefetching and server rendering never count as visits.
 */
export default function CoursePageTracker() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Storage blocked (private mode etc.): count anyway.
    }
    fetch('/api/courses/track', { method: 'POST', keepalive: true }).catch(() => {});
  }, []);

  return null;
}
