import { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import type { HeaderRule, UrlPattern } from '../../types';
import { PatternEditor } from './PatternEditor';

interface Props {
  rule: HeaderRule;
  onUpdate: (patch: Partial<HeaderRule>) => void;
  onDelete: () => void;
  onAddPattern: () => void;
  onUpdatePattern: (index: number, patch: Partial<UrlPattern>) => void;
  onDeletePattern: (index: number) => void;
}

function useDebouncedField(externalValue: string, commit: (value: string) => void, delay = 300) {
  const [local, setLocal] = useState(externalValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitRef = useRef(commit);
  commitRef.current = commit;

  useEffect(() => {
    setLocal(externalValue);
  }, [externalValue]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onChange = (value: string) => {
    setLocal(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commitRef.current(value), delay);
  };

  const flush = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    commitRef.current(local);
  };

  return { local, onChange, flush };
}

export function RuleRow({
  rule,
  onUpdate,
  onDelete,
  onAddPattern,
  onUpdatePattern,
  onDeletePattern,
}: Props) {
  const name = useDebouncedField(rule.name, (v) => onUpdate({ name: v }));
  const value = useDebouncedField(rule.value ?? '', (v) => onUpdate({ value: v }));

  return (
    <div className={`rule-row ${rule.enabled ? '' : 'rule-row-disabled'}`}>
      <div className="rule-row-main">
        <input
          type="checkbox"
          checked={rule.enabled}
          onChange={(e) => onUpdate({ enabled: e.target.checked })}
          title="Enable this rule"
        />
        <button
          type="button"
          className="target-badge"
          onClick={() => onUpdate({ target: rule.target === 'request' ? 'response' : 'request' })}
          title="Toggle request/response"
        >
          {rule.target === 'request' ? 'REQ' : 'RES'}
        </button>
        <select
          className="operation-select"
          value={rule.operation}
          onChange={(e) => onUpdate({ operation: e.target.value as HeaderRule['operation'] })}
        >
          <option value="set">set</option>
          <option value="append">append</option>
          <option value="remove">remove</option>
        </select>
        <input
          className="header-name-input"
          placeholder="Header name"
          value={name.local}
          onChange={(e) => name.onChange(e.target.value)}
          onBlur={name.flush}
        />
        {rule.operation !== 'remove' && (
          <input
            className="header-value-input"
            placeholder="Value"
            value={value.local}
            onChange={(e) => value.onChange(e.target.value)}
            onBlur={value.flush}
          />
        )}
        <button type="button" className="delete-btn" onClick={onDelete} title="Delete rule">
          <FiX />
        </button>
      </div>
      <div className="rule-row-scope">
        <label>
          <input
            type="radio"
            name={`scope-${rule.id}`}
            checked={rule.scope === 'all'}
            onChange={() => onUpdate({ scope: 'all' })}
          />
          All URLs
        </label>
        <label>
          <input
            type="radio"
            name={`scope-${rule.id}`}
            checked={rule.scope === 'patterns'}
            onChange={() => onUpdate({ scope: 'patterns' })}
          />
          Patterns
        </label>
      </div>
      {rule.scope === 'patterns' && (
        <PatternEditor
          patterns={rule.patterns ?? []}
          onAdd={onAddPattern}
          onUpdate={onUpdatePattern}
          onDelete={onDeletePattern}
        />
      )}
    </div>
  );
}
