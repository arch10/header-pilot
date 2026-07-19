import { ensureSeeded, getState, subscribe } from '../storage';
import type { AppState } from '../types';
import { computeEffectiveRules, resyncFromStorage } from './syncRules';

const BADGE_ON_COLOR = '#2e7d32';
const BADGE_OFF_COLOR = '#9aa0a6';

/** Signature of the fields that actually affect which DNR rules should exist. */
function rulesSignature(state: AppState): string {
  return JSON.stringify({
    globalEnabled: state.globalEnabled,
    activeProfileId: state.activeProfileId,
    profiles: state.profiles,
  });
}

async function updateBadge(state: AppState): Promise<void> {
  if (!state.globalEnabled) {
    await chrome.action.setBadgeText({ text: 'OFF' });
    await chrome.action.setBadgeBackgroundColor({ color: BADGE_OFF_COLOR });
    return;
  }
  const count = computeEffectiveRules(state).length;
  await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
  await chrome.action.setBadgeBackgroundColor({ color: BADGE_ON_COLOR });
}

async function runSync(): Promise<void> {
  const state = await getState();
  const synced = await resyncFromStorage(state);
  await updateBadge(synced);
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
    void updateBadge(newState);
    return;
  }
  void runSync();
});
