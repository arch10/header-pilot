import { useEffect, useState } from 'react';
import { FiGlobe, FiPlus, FiX } from 'react-icons/fi';
import type { UrlPattern } from '../../types';

interface Props {
  patterns: UrlPattern[];
  onAdd: (value?: string) => void;
  onUpdate: (index: number, patch: Partial<UrlPattern>) => void;
  onDelete: (index: number) => void;
}

/** Convert a tab URL into a DNR-friendly urlFilter that matches the whole origin. */
function urlToOriginPattern(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return `|${u.protocol}//${u.host}/*`;
  } catch {
    return null;
  }
}

/**
 * Heuristic: does this string look like a regex rather than a DNR urlFilter?
 * urlFilter only uses `*` `|` `^` as specials; regex-only metacharacters are
 * a strong signal the user typed a regex.
 */
function looksLikeRegex(pattern: string): boolean {
  return /[\\()[\]{}+?]/.test(pattern);
}

export function PatternEditor({ patterns, onAdd, onUpdate, onDelete }: Props) {
  const handleAddCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const pattern = tab?.url ? urlToOriginPattern(tab.url) : null;
    if (!pattern) {
      alert("Can't use this tab's URL as a pattern.");
      return;
    }
    onAdd(pattern);
  };

  return (
    <div className="pattern-editor">
      {patterns.length === 0 ? (
        <div className="pattern-empty">No patterns yet — requests won't match.</div>
      ) : (
        patterns.map((pattern, index) => (
          <PatternRow
            // biome-ignore lint/suspicious/noArrayIndexKey: patterns have no stable id in the data model
            key={index}
            pattern={pattern}
            onUpdate={(patch) => onUpdate(index, patch)}
            onDelete={() => onDelete(index)}
          />
        ))
      )}
      <div className="pattern-editor-actions">
        <button type="button" className="add-pattern-btn" onClick={() => onAdd()}>
          <FiPlus /> Add pattern
        </button>
        <button type="button" className="add-pattern-btn" onClick={handleAddCurrentTab}>
          <FiGlobe /> Use current tab
        </button>
      </div>
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
  const detectedRegex = looksLikeRegex(local);

  useEffect(() => {
    setLocal(pattern.value);
  }, [pattern.value]);

  useEffect(() => {
    if (!detectedRegex || !local) {
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
  }, [local, detectedRegex]);

  const commit = (value: string) => {
    const isRegex = looksLikeRegex(value);
    // Block save on invalid RE2 patterns; the error stays visible until fixed.
    if (isRegex && error) return;
    onUpdate({ value, isRegex });
  };

  return (
    <div className="pattern-row">
      <div className="pattern-row-fields">
        <input
          className="pattern-input"
          placeholder="URL filter or regex (e.g. *://*.example.com/*)"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
        />
        <button type="button" className="delete-btn" onClick={onDelete} title="Delete pattern">
          <FiX />
        </button>
      </div>
      {error && <div className="pattern-error">{error}</div>}
    </div>
  );
}
