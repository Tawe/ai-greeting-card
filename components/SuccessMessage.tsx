'use client';

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  return (
    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-green-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold">Success</p>
          <p className="mt-1 text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-green-600 hover:text-green-800"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
