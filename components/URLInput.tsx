'use client';

import { useState, useCallback } from 'react';

interface URLInputProps {
  onSubmit: (text: string, title: string) => void;
}

interface ExtractedArticle {
  title: string;
  text: string;
  wordCount: number;
  siteName: string;
  excerpt: string;
}

export function URLInput({ onSubmit }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedUrl = url.trim();
      if (!trimmedUrl) return;

      // Add https:// if missing
      let normalizedUrl = trimmedUrl;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/extract-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: normalizedUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract content');
        }

        const article = data as ExtractedArticle;
        onSubmit(article.text, article.title);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch URL');
      } finally {
        setIsLoading(false);
      }
    },
    [url, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="url-input" className="block text-sm font-medium text-gray-700">
          Article URL
        </label>
        <div className="flex gap-2">
          <input
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Fetching...
              </span>
            ) : (
              'Fetch Article'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-500">
        Works best with blogs, Substack, Medium, and sites without paywalls.
        Most major news sites (Reuters, NYT, WSJ) block extraction.
      </p>
    </form>
  );
}
