'use client';

import { useState, useEffect } from 'react';

interface TextAnalysis {
  summary: string;
  keyThemes: string[];
  glossary: { term: string; definition: string }[];
  difficulty: 'easy' | 'moderate' | 'challenging' | 'dense';
  difficultyExplanation: string;
  recommendedWPM: number;
}

interface PrepScreenProps {
  text: string;
  title: string;
  wordCount: number;
  apiKey: string;
  onStartReading: (recommendedWPM?: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  challenging: 'bg-orange-100 text-orange-800 border-orange-200',
  dense: 'bg-red-100 text-red-800 border-red-200',
};

const difficultyLabels = {
  easy: 'Easy',
  moderate: 'Moderate',
  challenging: 'Challenging',
  dense: 'Very Dense',
};

export function PrepScreen({
  text,
  title,
  wordCount,
  apiKey,
  onStartReading,
  onSkip,
  onBack,
}: PrepScreenProps) {
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function analyze() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/analyze-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, apiKey }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Analysis failed');
        }

        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze text');
      } finally {
        setIsLoading(false);
      }
    }

    analyze();
  }, [text, apiKey]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800">Analyzing text...</h2>
          <p className="text-gray-500">Preparing summary and glossary</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Analysis Failed</h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Skip & Read
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-500">{wordCount.toLocaleString()} words</p>
          </div>
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Difficulty badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${difficultyColors[analysis.difficulty]}`}>
          <span className="font-medium">{difficultyLabels[analysis.difficulty]}</span>
          <span className="text-sm opacity-75">for RSVP reading</span>
        </div>

        {analysis.difficulty === 'dense' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> This text is quite dense. You may want to read it traditionally for full comprehension,
              or use a slower speed (200-250 WPM).
            </p>
          </div>
        )}

        {/* Summary */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
        </section>

        {/* Key Themes */}
        {analysis.keyThemes.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Themes</h2>
            <div className="flex flex-wrap gap-2">
              {analysis.keyThemes.map((theme, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {theme}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Glossary */}
        {analysis.glossary.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Terms</h2>
            <dl className="space-y-3">
              {analysis.glossary.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <dt className="font-medium text-red-600 whitespace-nowrap">{item.term}</dt>
                  <dd className="text-gray-600">{item.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Difficulty explanation */}
        {analysis.difficultyExplanation && (
          <section className="bg-gray-50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Reading Notes</h2>
            <p className="text-gray-700 text-sm">{analysis.difficultyExplanation}</p>
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onSkip}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Skip Prep
          </button>
          <button
            onClick={() => onStartReading(analysis.recommendedWPM)}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            Start Reading
            {analysis.recommendedWPM && (
              <span className="ml-2 opacity-75">({analysis.recommendedWPM} WPM)</span>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
