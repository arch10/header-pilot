import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface Props {
  error: string | null;
  onDismiss: () => void;
}

export function ErrorBanner({ error, onDismiss }: Props) {
  if (!error) return null;
  return (
    <div className="error-banner">
      <FiAlertTriangle className="error-banner-icon" />
      <span className="error-banner-text">{error}</span>
      <button type="button" onClick={onDismiss} title="Dismiss">
        <FiX />
      </button>
    </div>
  );
}
