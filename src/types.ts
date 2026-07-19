export interface UrlPattern {
  value: string; // urlFilter syntax OR RE2 regex
  isRegex: boolean;
}

export type HeaderTarget = 'request' | 'response';
export type HeaderOperation = 'set' | 'append' | 'remove';
export type RuleScope = 'all' | 'patterns';

export interface HeaderRule {
  id: string; // uuid, app-level ID (NOT the DNR rule id)
  enabled: boolean; // per-header checkbox
  target: HeaderTarget;
  operation: HeaderOperation;
  name: string; // header name
  value?: string; // required unless operation === 'remove'
  scope: RuleScope;
  patterns?: UrlPattern[]; // used when scope === 'patterns'
}

export interface Profile {
  id: string; // uuid
  name: string; // user-editable
  rules: HeaderRule[];
}

export interface AppState {
  schemaVersion: number;
  globalEnabled: boolean;
  activeProfileId: string;
  profiles: Profile[];
  // Maps app rule id -> DNR rule ids created for it (one per pattern).
  // Maintained by the sync engine; persisted so cleanup survives worker restarts.
  dnrRuleMap: Record<string, number[]>;
  nextDnrRuleId: number; // monotonically increasing integer allocator for DNR ids
  lastSyncError: string | null;
}

export const CURRENT_SCHEMA_VERSION = 1;
