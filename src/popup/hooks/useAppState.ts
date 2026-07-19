import { useCallback, useEffect, useRef, useState } from 'react';
import { getState, replaceState, subscribe } from '../../storage';
import type { AppState } from '../../types';

/**
 * Loads AppState on mount and keeps it in sync with chrome.storage.local.
 * The popup never keeps state that can diverge from storage: every mutation
 * is applied via `update`, which re-reads storage before writing so writes
 * from the same popup instance never race each other.
 */
export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const pendingWrite = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    getState().then((s) => {
      if (!cancelled) setState(s);
    });
    const unsubscribe = subscribe((newState) => {
      if (!cancelled) setState(newState);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const update = useCallback((updater: (current: AppState) => AppState) => {
    pendingWrite.current = pendingWrite.current
      .then(() => getState())
      .then((current) => replaceState(updater(current)));
  }, []);

  return { state, update };
}
