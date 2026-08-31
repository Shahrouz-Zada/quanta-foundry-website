'use client';
// =============================================================================
// useDebouncedSave — per-key debounced autosave.
//
// Spec section 15 asks for saves ~1500ms after typing stops, not on every
// keystroke. This is keyed (not a single shared timer) on purpose: several
// independent fields can share one hook instance — e.g. handlePrepareAnswer-
// Change covers every prompt in the Prepare stage — and a naive single-timer
// debounce would let typing in field B cancel field A's still-pending save.
// Each `key` (a blockId, or a fixed string for a single-document save like
// the Brief) gets its own independent timer instead.
//
// Local UI state should still update on every keystroke for responsiveness —
// only the network call goes through this hook.
// =============================================================================

import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_DELAY_MS = 1500;

export function useDebouncedSave<Args extends unknown[]>(
  save: (key: string, ...args: Args) => void,
  delayMs: number = DEFAULT_DELAY_MS
): (key: string, ...args: Args) => void {
  // Always call the latest `save` closure even though the timer was set up
  // on an earlier render — avoids needing `save` itself to be stable.
  const saveRef = useRef(save);
  saveRef.current = save;

  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timersAtMount = timers.current;
    return () => {
      timersAtMount.forEach(clearTimeout);
      timersAtMount.clear();
    };
  }, []);

  return useCallback(
    (key: string, ...args: Args) => {
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        timers.current.delete(key);
        saveRef.current(key, ...args);
      }, delayMs);

      timers.current.set(key, timer);
    },
    [delayMs]
  );
}
