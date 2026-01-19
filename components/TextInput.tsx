'use client';

import { useState, useCallback } from 'react';

interface TextInputProps {
  /** Called when text is submitted */
  onSubmit: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
}

export function TextInput({ onSubmit, placeholder }: TextInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (text.trim()) {
        onSubmit(text.trim());
      }
    },
    [text, onSubmit]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Allow default paste behavior
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder || 'Paste or type your text here...'}
        className="w-full h-48 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
        spellCheck={false}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {text.trim().split(/\s+/).filter((w) => w).length.toLocaleString()} words
        </span>

        <button
          type="submit"
          disabled={!text.trim()}
          className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Start Reading
        </button>
      </div>
    </form>
  );
}
