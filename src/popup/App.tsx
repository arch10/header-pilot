import { useAppState } from './hooks/useAppState';
import { GlobalSwitch } from './components/GlobalSwitch';
import { ProfileSelector } from './components/ProfileSelector';
import { RuleList } from './components/RuleList';
import { ErrorBanner } from './components/ErrorBanner';
import { ExportImport } from './components/ExportImport';
import * as ops from './stateOps';

export default function App() {
  const { state, update } = useAppState();

  if (!state) {
    return <div className="popup popup-loading">Loading…</div>;
  }

  const activeProfile = ops.getActiveProfile(state);

  return (
    <div className="popup">
      <ErrorBanner
        error={state.lastSyncError}
        onDismiss={() => update((s) => ({ ...s, lastSyncError: null }))}
      />
      <GlobalSwitch enabled={state.globalEnabled} onToggle={() => update(ops.toggleGlobalEnabled)} />
      <ProfileSelector
        profiles={state.profiles}
        activeProfileId={state.activeProfileId}
        onSwitch={(id) => update((s) => ops.switchProfile(s, id))}
        onAdd={() => update((s) => ops.addProfile(s).state)}
        onRename={(id, name) => update((s) => ops.renameProfile(s, id, name))}
        onDuplicate={(id) => update((s) => ops.duplicateProfile(s, id))}
        onDelete={(id) => update((s) => ops.deleteProfile(s, id))}
      />
      {activeProfile && (
        <RuleList
          rules={activeProfile.rules}
          onAddRule={() => update((s) => ops.addRule(s).state)}
          onUpdateRule={(ruleId, patch) => update((s) => ops.updateRule(s, ruleId, patch))}
          onDeleteRule={(ruleId) => update((s) => ops.deleteRule(s, ruleId))}
          onAddPattern={(ruleId) => update((s) => ops.addPattern(s, ruleId))}
          onUpdatePattern={(ruleId, index, patch) =>
            update((s) => ops.updatePattern(s, ruleId, index, patch))
          }
          onDeletePattern={(ruleId, index) => update((s) => ops.deletePattern(s, ruleId, index))}
        />
      )}
      <ExportImport
        profiles={state.profiles}
        onImport={(profiles) => update((s) => ops.importProfiles(s, profiles))}
      />
    </div>
  );
}
