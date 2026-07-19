import { ensureSeeded, getState, subscribe } from '../storage';
import type { AppState } from '../types';
import { resyncFromStorage } from './syncRules';

const ICONS_ENABLED = {
  16: 'public/icons/icon-16.png',
  32: 'public/icons/icon-32.png',
  48: 'public/icons/icon-48.png',
  128: 'public/icons/icon-128.png',
};

const ICONS_DISABLED = {
  16: 'public/icons/icon-16-disabled.png',
  32: 'public/icons/icon-32-disabled.png',
  48: 'public/icons/icon-48-disabled.png',
  128: 'public/icons/icon-128-disabled.png',
};

/** Signature of the fields that actually affect which DNR rules should exist. */
function rulesSignature(state: AppState): string {
  return JSON.stringify({
    globalEnabled: state.globalEnabled,
    activeProfileId: state.activeProfileId,
    profiles: state.profiles,
  });
}

async function updateToolbarIcon(state: AppState): Promise<void> {
  await chrome.action.setIcon({ path: state.globalEnabled ? ICONS_ENABLED : ICONS_DISABLED });
}

async function runSync(): Promise<void> {
  const state = await getState();
  const synced = await resyncFromStorage(state);
  await updateToolbarIcon(synced);
}

chrome.runtime.onInstalled.addListener(() => {
  void (async () => {
    await ensureSeeded();
    await runSync();
  })();
});

chrome.runtime.onStartup.addListener(() => {
  void runSync();
});

subscribe((newState, oldState) => {
  // A resync writes dnrRuleMap/nextDnrRuleId/lastSyncError back to storage, which
  // re-fires onChanged. If only those bookkeeping fields changed (not the rules
  // that actually matter), skip re-syncing to avoid looping forever.
  if (oldState && rulesSignature(newState) === rulesSignature(oldState)) {
    void updateToolbarIcon(newState);
    return;
  }
  void runSync();
});
