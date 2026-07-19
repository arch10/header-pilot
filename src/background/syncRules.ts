import { setState } from '../storage';
import type { AppState, HeaderRule } from '../types';

export const ALL_RESOURCE_TYPES: chrome.declarativeNetRequest.ResourceType[] = [
  chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
  chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
  chrome.declarativeNetRequest.ResourceType.STYLESHEET,
  chrome.declarativeNetRequest.ResourceType.SCRIPT,
  chrome.declarativeNetRequest.ResourceType.IMAGE,
  chrome.declarativeNetRequest.ResourceType.FONT,
  chrome.declarativeNetRequest.ResourceType.OBJECT,
  chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
  chrome.declarativeNetRequest.ResourceType.PING,
  chrome.declarativeNetRequest.ResourceType.CSP_REPORT,
  chrome.declarativeNetRequest.ResourceType.MEDIA,
  chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
  chrome.declarativeNetRequest.ResourceType.OTHER,
];

export function computeEffectiveRules(state: AppState): HeaderRule[] {
  if (!state.globalEnabled) return [];
  const activeProfile = state.profiles.find((p) => p.id === state.activeProfileId);
  if (!activeProfile) return [];
  return activeProfile.rules.filter((r) => r.enabled);
}

function buildConditionBase(): Pick<chrome.declarativeNetRequest.RuleCondition, 'resourceTypes'> {
  return { resourceTypes: ALL_RESOURCE_TYPES };
}

/**
 * Builds one DNR rule per pattern (or exactly one for scope === 'all'), allocating
 * fresh integer IDs starting at `startId`. Returns the rules plus the next free ID.
 */
function buildDnrRulesForHeaderRule(
  rule: HeaderRule,
  startId: number,
): { dnrRules: chrome.declarativeNetRequest.Rule[]; nextId: number } {
  const headerInfo: chrome.declarativeNetRequest.ModifyHeaderInfo = {
    header: rule.name,
    operation: rule.operation,
    ...(rule.operation !== 'remove' && { value: rule.value }),
  };

  const action: chrome.declarativeNetRequest.RuleAction = {
    type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
    ...(rule.target === 'request'
      ? { requestHeaders: [headerInfo] }
      : { responseHeaders: [headerInfo] }),
  };

  const conditions: chrome.declarativeNetRequest.RuleCondition[] =
    rule.scope === 'all'
      ? [{ urlFilter: '*', ...buildConditionBase() }]
      : (rule.patterns ?? []).map((pattern) =>
          pattern.isRegex
            ? { regexFilter: pattern.value, ...buildConditionBase() }
            : { urlFilter: pattern.value, ...buildConditionBase() },
        );

  let id = startId;
  const dnrRules: chrome.declarativeNetRequest.Rule[] = conditions.map((condition) => ({
    id: id++,
    priority: 1,
    action,
    condition,
  }));

  return { dnrRules, nextId: id };
}

export interface SyncResult {
  dnrRuleMap: Record<string, number[]>;
  nextDnrRuleId: number;
  lastSyncError: string | null;
}

export async function syncRules(state: AppState): Promise<SyncResult> {
  const effective = computeEffectiveRules(state);

  let nextId = state.nextDnrRuleId;
  const dnrRuleMap: Record<string, number[]> = {};
  const addRules: chrome.declarativeNetRequest.Rule[] = [];

  for (const rule of effective) {
    if (rule.operation !== 'remove' && !rule.value) continue;
    if (rule.scope === 'patterns' && (!rule.patterns || rule.patterns.length === 0)) continue;

    const { dnrRules, nextId: newNextId } = buildDnrRulesForHeaderRule(rule, nextId);
    nextId = newNextId;
    if (dnrRules.length > 0) {
      dnrRuleMap[rule.id] = dnrRules.map((r) => r.id);
      addRules.push(...dnrRules);
    }
  }

  const currentIds = Object.values(state.dnrRuleMap).flat();

  let lastSyncError: string | null = null;
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: currentIds,
      addRules,
    });
  } catch (err) {
    lastSyncError = err instanceof Error ? err.message : String(err);
    // Roll back to the previous mapping/id allocator since the update failed.
    return {
      dnrRuleMap: state.dnrRuleMap,
      nextDnrRuleId: state.nextDnrRuleId,
      lastSyncError,
    };
  }

  return { dnrRuleMap, nextDnrRuleId: nextId, lastSyncError };
}

/**
 * Runs syncRules against the latest persisted state and writes the resulting
 * dnrRuleMap/nextDnrRuleId/lastSyncError back to storage. Safe to call from any
 * trigger (storage change, onStartup, onInstalled) — always re-reads state fresh
 * since the service worker is ephemeral and must not cache state across events.
 */
export async function resyncFromStorage(state: AppState): Promise<AppState> {
  const result = await syncRules(state);
  return setState(result);
}
