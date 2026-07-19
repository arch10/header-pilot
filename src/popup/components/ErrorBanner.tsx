import { FiX } from 'react-icons/fi';

interface Props {
  error: string | null;
  onDismiss: () => void;
}

export function ErrorBanner({ error, onDismiss }: Props) {
  if (!error) return null;
  return (
    <div className="error-banner">
      <span>{error}</span>
      <button type="button" onClick={onDismiss} title="Dismiss">
        <FiX />
      </button>
    </div>
  );
}
