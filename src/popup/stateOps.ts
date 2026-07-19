import type { AppState, HeaderRule, Profile, UrlPattern } from '../types';

function newRule(): HeaderRule {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    target: 'request',
    operation: 'set',
    name: '',
    value: '',
    scope: 'all',
  };
}

export function getActiveProfile(state: AppState): Profile | undefined {
  return state.profiles.find((p) => p.id === state.activeProfileId);
}

function updateActiveProfile(state: AppState, fn: (p: Profile) => Profile): AppState {
  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === state.activeProfileId ? fn(p) : p)),
  };
}

function updateRuleWith(
  state: AppState,
  ruleId: string,
  fn: (r: HeaderRule) => HeaderRule,
): AppState {
  return updateActiveProfile(state, (p) => ({
    ...p,
    rules: p.rules.map((r) => (r.id === ruleId ? fn(r) : r)),
  }));
}

export function addRule(state: AppState): { state: AppState; ruleId: string } {
  const rule = newRule();
  return {
    state: updateActiveProfile(state, (p) => ({ ...p, rules: [...p.rules, rule] })),
    ruleId: rule.id,
  };
}

export function updateRule(state: AppState, ruleId: string, patch: Partial<HeaderRule>): AppState {
  return updateRuleWith(state, ruleId, (r) => ({ ...r, ...patch }));
}

export function deleteRule(state: AppState, ruleId: string): AppState {
  return updateActiveProfile(state, (p) => ({
    ...p,
    rules: p.rules.filter((r) => r.id !== ruleId),
  }));
}

export function addPattern(state: AppState, ruleId: string): AppState {
  return updateRuleWith(state, ruleId, (r) => ({
    ...r,
    patterns: [...(r.patterns ?? []), { value: '', isRegex: false }],
  }));
}

export function updatePattern(
  state: AppState,
  ruleId: string,
  index: number,
  patch: Partial<UrlPattern>,
): AppState {
  return updateRuleWith(state, ruleId, (r) => ({
    ...r,
    patterns: (r.patterns ?? []).map((pat, i) => (i === index ? { ...pat, ...patch } : pat)),
  }));
}

export function deletePattern(state: AppState, ruleId: string, index: number): AppState {
  return updateRuleWith(state, ruleId, (r) => ({
    ...r,
    patterns: (r.patterns ?? []).filter((_, i) => i !== index),
  }));
}

export function addProfile(state: AppState): { state: AppState; profileId: string } {
  const profile: Profile = { id: crypto.randomUUID(), name: 'New Profile', rules: [] };
  return {
    state: { ...state, profiles: [...state.profiles, profile], activeProfileId: profile.id },
    profileId: profile.id,
  };
}

export function renameProfile(state: AppState, profileId: string, name: string): AppState {
  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === profileId ? { ...p, name } : p)),
  };
}

export function duplicateProfile(state: AppState, profileId: string): AppState {
  const source = state.profiles.find((p) => p.id === profileId);
  if (!source) return state;
  const copy: Profile = {
    id: crypto.randomUUID(),
    name: `${source.name} copy`,
    rules: source.rules.map((r) => ({
      ...r,
      id: crypto.randomUUID(),
      patterns: r.patterns?.map((p) => ({ ...p })),
    })),
  };
  const index = state.profiles.findIndex((p) => p.id === profileId);
  const profiles = [...state.profiles];
  profiles.splice(index + 1, 0, copy);
  return { ...state, profiles, activeProfileId: copy.id };
}

export function deleteProfile(state: AppState, profileId: string): AppState {
  if (state.profiles.length <= 1) return state; // cannot delete the last profile
  const profiles = state.profiles.filter((p) => p.id !== profileId);
  const activeProfileId =
    state.activeProfileId === profileId ? profiles[0].id : state.activeProfileId;
  return { ...state, profiles, activeProfileId };
}

export function switchProfile(state: AppState, profileId: string): AppState {
  return { ...state, activeProfileId: profileId };
}

export function toggleGlobalEnabled(state: AppState): AppState {
  return { ...state, globalEnabled: !state.globalEnabled };
}

export function importProfiles(state: AppState, imported: Profile[]): AppState {
  const withFreshIds = imported.map((p) => ({
    ...p,
    id: crypto.randomUUID(),
    rules: p.rules.map((r) => ({ ...r, id: crypto.randomUUID() })),
  }));
  if (withFreshIds.length === 0) return state;
  return {
    ...state,
    profiles: [...state.profiles, ...withFreshIds],
    activeProfileId: withFreshIds[0].id,
  };
}
