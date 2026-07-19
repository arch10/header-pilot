import { useRef } from 'react';
import { FiDownload, FiUpload } from 'react-icons/fi';
import type { Profile } from '../../types';

interface Props {
  profiles: Profile[];
  onImport: (profiles: Profile[]) => void;
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

export function ExportImport({ profiles, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' });
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
      if (!isProfileArray(parsed)) throw new Error('Invalid file');
      onImport(parsed);
    } catch {
      alert('Could not import: invalid JSON file.');
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
