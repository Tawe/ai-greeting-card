'use client';

interface MessageInputProps {
  message: string;
  onMessageChange: (message: string) => void;
}

export default function MessageInput({ message, onMessageChange }: MessageInputProps) {
  return (
    <div className="space-y-2">
      <textarea
        id="message"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Write your holiday message here. Don't worry about perfect grammar or formatting—just share what's on your heart."
        rows={6}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
      />
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {message.length} characters
        </p>
        <p className="text-xs text-gray-400">
          {message.length < 3 ? 'At least 3 characters' : message.length > 5000 ? 'Maximum 5000 characters' : ''}
        </p>
      </div>
    </div>
  );
}
