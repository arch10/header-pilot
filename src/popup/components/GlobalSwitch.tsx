import { Logo } from './Logo';

interface Props {
  enabled: boolean;
  onToggle: () => void;
}

export function GlobalSwitch({ enabled, onToggle }: Props) {
  return (
    <div className="topbar">
      <div className="brand">
        <span className="brand-icon">
          <Logo />
        </span>
        <div className="brand-text">
          <span className="brand-title">Header Pilot</span>
          <span className={`brand-status ${enabled ? 'is-on' : 'is-off'}`}>
            {enabled ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>
      <label className="switch" title={enabled ? 'Turn off' : 'Turn on'}>
        <input type="checkbox" checked={enabled} onChange={onToggle} />
        <span className="switch-track" />
      </label>
    </div>
  );
}
