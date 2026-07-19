import { useState } from 'react';
import { FiCopy, FiEdit2, FiLayers, FiPlus, FiTrash2 } from 'react-icons/fi';
import type { Profile } from '../../types';

interface Props {
  profiles: Profile[];
  activeProfileId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProfileSelector({
  profiles,
  activeProfileId,
  onSwitch,
  onAdd,
  onRename,
  onDuplicate,
  onDelete,
}: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const startRename = () => {
    if (!activeProfile) return;
    setDraftName(activeProfile.name);
    setRenamingId(activeProfile.id);
  };

  const commitRename = () => {
    if (renamingId && draftName.trim()) {
      onRename(renamingId, draftName.trim());
    }
    setRenamingId(null);
  };

  const cancelRename = () => setRenamingId(null);

  return (
    <div className="profile-selector">
      {renamingId ? (
        <input
          className="profile-rename-input"
          // biome-ignore lint/a11y/noAutofocus: user just clicked "rename"; focus is the expected outcome
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') cancelRename();
          }}
          onBlur={commitRename}
        />
      ) : (
        <div className="profile-select-wrap">
          <FiLayers className="profile-select-icon" />
          <select
            className="profile-select"
            value={activeProfileId}
            onChange={(e) => onSwitch(e.target.value)}
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="profile-actions">
        <button
          type="button"
          title="Rename profile"
          onClick={startRename}
          disabled={renamingId !== null}
        >
          <FiEdit2 />
        </button>
        <button type="button" title="Add profile" onClick={onAdd}>
          <FiPlus />
        </button>
        <button
          type="button"
          title="Duplicate profile"
          onClick={() => onDuplicate(activeProfileId)}
        >
          <FiCopy />
        </button>
        <button
          type="button"
          className="danger"
          title="Delete profile"
          disabled={profiles.length <= 1}
          onClick={() => {
            if (confirm(`Delete profile "${activeProfile?.name}"?`)) {
              onDelete(activeProfileId);
            }
          }}
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
