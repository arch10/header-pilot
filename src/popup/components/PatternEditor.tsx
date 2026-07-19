import { useEffect, useState } from 'react';
import type { UrlPattern } from '../../types';

interface Props {
  patterns: UrlPattern[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<UrlPattern>) => void;
  onDelete: (index: number) => void;
}

export function PatternEditor({ patterns, onAdd, onUpdate, onDelete }: Props) {
  return (
    <div className="pattern-editor">
      {patterns.length === 0 ? (
        <div className="pattern-empty">No patterns yet — requests won't match.</div>
      ) : (
        patterns.map((pattern, index) => (
          <PatternRow
            key={index}
            pattern={pattern}
            onUpdate={(patch) => onUpdate(index, patch)}
            onDelete={() => onDelete(index)}
          />
        ))
      )}
      <button type="button" className="add-pattern-btn" onClick={onAdd}>
        + Add pattern
      </button>
    </div>
  );
}

function PatternRow({
  pattern,
  onUpdate,
  onDelete,
}: {
  pattern: UrlPattern;
  onUpdate: (patch: Partial<UrlPattern>) => void;
  onDelete: () => void;
}) {
  const [local, setLocal] = useState(pattern.value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocal(pattern.value);
  }, [pattern.value]);

  useEffect(() => {
    if (!pattern.isRegex || !local) {
      setError(null);
      return;
    }
    let cancelled = false;
    chrome.declarativeNetRequest
      .isRegexSupported({ regex: local })
      .then((result) => {
        if (cancelled) return;
        setError(result.isSupported ? null : (result.reason ?? 'Unsupported regex'));
      })
      .catch(() => {
        if (!cancelled) setError('Failed to validate regex');
      });
    return () => {
      cancelled = true;
    };
  }, [local, pattern.isRegex]);

  const commit = (value: string) => {
    // Block save on invalid RE2 patterns; the error stays visible until fixed.
    if (pattern.isRegex && error) return;
    onUpdate({ value });
  };

  return (
    <div className="pattern-row">
      <div className="pattern-row-fields">
        <input
          className="pattern-input"
          placeholder={pattern.isRegex ? 'Regex pattern' : 'URL filter (e.g. *://*.example.com/*)'}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
        />
        <label className="pattern-regex-toggle">
          <input
            type="checkbox"
            checked={pattern.isRegex}
            onChange={(e) => onUpdate({ isRegex: e.target.checked })}
          />
          Regex
        </label>
        <button type="button" className="delete-btn" onClick={onDelete} title="Delete pattern">
          ✕
        </button>
      </div>
      {error && <div className="pattern-error">{error}</div>}
    </div>
  );
}
