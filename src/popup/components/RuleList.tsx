import type { HeaderRule, UrlPattern } from '../../types';
import { RuleRow } from './RuleRow';

interface Props {
  rules: HeaderRule[];
  onAddRule: () => void;
  onUpdateRule: (ruleId: string, patch: Partial<HeaderRule>) => void;
  onDeleteRule: (ruleId: string) => void;
  onAddPattern: (ruleId: string) => void;
  onUpdatePattern: (ruleId: string, index: number, patch: Partial<UrlPattern>) => void;
  onDeletePattern: (ruleId: string, index: number) => void;
}

export function RuleList({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onAddPattern,
  onUpdatePattern,
  onDeletePattern,
}: Props) {
  return (
    <div className="rule-list">
      {rules.length === 0 ? (
        <div className="empty-state">No rules yet — Add one</div>
      ) : (
        rules.map((rule) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            onUpdate={(patch) => onUpdateRule(rule.id, patch)}
            onDelete={() => onDeleteRule(rule.id)}
            onAddPattern={() => onAddPattern(rule.id)}
            onUpdatePattern={(index, patch) => onUpdatePattern(rule.id, index, patch)}
            onDeletePattern={(index) => onDeletePattern(rule.id, index)}
          />
        ))
      )}
      <button type="button" className="add-rule-btn" onClick={onAddRule}>
        + Add rule
      </button>
    </div>
  );
}
