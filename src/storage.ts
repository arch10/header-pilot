import type { AppState, Profile } from './types';
import { CURRENT_SCHEMA_VERSION } from './types';

const STORAGE_KEY = 'appState';

function createDefaultProfile(): Profile {
  return {
    id: crypto.randomUUID(),
    name: 'Default',
    rules: [],
  };
}

export function createDefaultState(): AppState {
  const defaultProfile = createDefaultProfile();
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    globalEnabled: true,
    activeProfileId: defaultProfile.id,
    profiles: [defaultProfile],
    dnrRuleMap: {},
    nextDnrRuleId: 1,
    lastSyncError: null,
  };
}

/**
 * Runs in-place migrations from older schema versions. A no-op today, but
 * keeps future model changes from requiring a manual storage wipe.
 */
function migrate(state: AppState): AppState {
  if (state.schemaVersion === CURRENT_SCHEMA_VERSION) return state;
  // No migrations defined yet; adopt the current version.
  return { ...state, schemaVersion: CURRENT_SCHEMA_VERSION };
}

export async function getState(): Promise<AppState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as AppState | undefined;
  if (!stored) return createDefaultState();
  return migrate(stored);
}

export async function setState(partial: Partial<AppState>): Promise<AppState> {
  const current = await getState();
  const next: AppState = { ...current, ...partial };
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

export async function replaceState(next: AppState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
}

export async function ensureSeeded(): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  if (!result[STORAGE_KEY]) {
    await chrome.storage.local.set({ [STORAGE_KEY]: createDefaultState() });
  }
}

export function subscribe(
  cb: (newState: AppState, oldState: AppState | undefined) => void,
): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName !== 'local') return;
    const change = changes[STORAGE_KEY];
    if (!change) return;
    cb(change.newValue as AppState, change.oldValue as AppState | undefined);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
