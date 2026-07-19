import { useRef } from 'react';
import { FiDownload, FiUpload } from 'react-icons/fi';
import { CURRENT_SCHEMA_VERSION, type Profile } from '../../types';

interface Props {
  profiles: Profile[];
  onImport: (profiles: Profile[]) => void;
}

interface ExportEnvelope {
  schemaVersion: number;
  profiles: Profile[];
}

function isProfileArray(value: unknown): value is Profile[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        p &&
        typeof p === 'object' &&
        typeof (p as Profile).name === 'string' &&
        Array.isArray((p as Profile).rules),
    )
  );
}

function extractProfiles(parsed: unknown): Profile[] | null {
  // Current format: { schemaVersion, profiles: [...] }
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const env = parsed as Partial<ExportEnvelope>;
    if (typeof env.schemaVersion !== 'number') return null;
    if (env.schemaVersion > CURRENT_SCHEMA_VERSION) return null;
    return isProfileArray(env.profiles) ? env.profiles : null;
  }
  // Legacy format: bare Profile[] (pre-schemaVersion exports)
  if (isProfileArray(parsed)) return parsed;
  return null;
}

export function ExportImport({ profiles, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const envelope: ExportEnvelope = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      profiles,
    };
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'header-pilot-profiles.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const imported = extractProfiles(parsed);
      if (!imported) throw new Error('Invalid file');
      onImport(imported);
    } catch {
      alert('Could not import: invalid or unsupported file.');
    }
  };

  return (
    <div className="export-import">
      <button type="button" onClick={handleExport}>
        <FiDownload /> Export
      </button>
      <button type="button" onClick={handleImportClick}>
        <FiUpload /> Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
