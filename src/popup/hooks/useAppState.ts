import { useCallback, useEffect, useRef, useState } from 'react';
import { getState, replaceState, subscribe } from '../../storage';
import type { AppState } from '../../types';

/**
 * Keeps the popup in sync with chrome.storage.local. The popup never keeps
 * state that can diverge from storage: every mutation is applied via `update`,
 * which re-reads storage before writing so writes from the same popup instance
 * never race each other. Callers pass `initialState` (preloaded in main.tsx)
 * so the first render already has final content — no loading flash.
 */
export function useAppState(initialState: AppState) {
  const [state, setState] = useState<AppState>(initialState);
  const pendingWrite = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const unsubscribe = subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const update = useCallback((updater: (current: AppState) => AppState) => {
    pendingWrite.current = pendingWrite.current
      .then(() => getState())
      .then((current) => replaceState(updater(current)));
  }, []);

  return { state, update };
}
