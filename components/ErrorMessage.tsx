'use client';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ message, onDismiss, type = 'error' }: ErrorMessageProps) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${styles[type]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold">{type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'}</p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-500 hover:text-gray-700"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
