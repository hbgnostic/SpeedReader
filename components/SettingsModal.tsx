'use client';

import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  prepEnabled: boolean;
  onPrepEnabledChange: (enabled: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onApiKeyChange,
  prepEnabled,
  onPrepEnabledChange,
}: SettingsModalProps) {
  const [localKey, setLocalKey] = useState(apiKey);

  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onApiKeyChange(localKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* AI Prep toggle */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <h3 className="font-medium text-gray-900">AI Reading Prep</h3>
            <p className="text-sm text-gray-500">
              Generate summary & glossary before reading
            </p>
          </div>
          <button
            onClick={() => onPrepEnabledChange(!prepEnabled)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              prepEnabled ? 'bg-red-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                prepEnabled ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow font-mono text-sm"
          />
          <p className="text-xs text-gray-500">
            Required for AI prep. Stored locally in your browser.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
