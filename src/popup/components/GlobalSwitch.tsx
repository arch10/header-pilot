interface Props {
  enabled: boolean;
  onToggle: () => void;
}

export function GlobalSwitch({ enabled, onToggle }: Props) {
  return (
    <div className="global-switch">
      <label className="switch">
        <input type="checkbox" checked={enabled} onChange={onToggle} />
        <span className="switch-track" />
      </label>
      <span className="global-switch-label">
        Header Pilot is {enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}
