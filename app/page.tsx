'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileUploader, TextInput, URLInput, RSVPReader, PrepScreen, SettingsModal } from '@/components';
import { useFileExtractor } from '@/hooks';
import { estimateReadingTime, tokenize } from '@/lib/rsvp';

type InputMode = 'file' | 'text' | 'url';
type AppState = 'input' | 'prep' | 'reading';

// Local storage keys
const STORAGE_KEYS = {
  apiKey: 'speedreader_openai_key',
  prepEnabled: 'speedreader_prep_enabled',
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input');
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [text, setText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [recommendedWPM, setRecommendedWPM] = useState<number | undefined>();

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [prepEnabled, setPrepEnabled] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEYS.apiKey) || '';
    const savedPrepEnabled = localStorage.getItem(STORAGE_KEYS.prepEnabled);
    setApiKey(savedKey);
    setPrepEnabled(savedPrepEnabled !== 'false');
  }, []);

  // Save settings to localStorage
  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem(STORAGE_KEYS.apiKey, key);
  }, []);

  const handlePrepEnabledChange = useCallback((enabled: boolean) => {
    setPrepEnabled(enabled);
    localStorage.setItem(STORAGE_KEYS.prepEnabled, String(enabled));
  }, []);

  const { extract, isExtracting, progress, error, clear } = useFileExtractor();

  // After content is loaded, decide whether to show prep or go straight to reading
  const handleContentReady = useCallback((contentText: string, contentTitle: string) => {
    setText(contentText);
    setFileName(contentTitle);

    if (prepEnabled && apiKey) {
      setAppState('prep');
    } else {
      setAppState('reading');
    }
  }, [prepEnabled, apiKey]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const result = await extract(file);
      if (result) {
        handleContentReady(result.text, result.fileName);
      }
    },
    [extract, handleContentReady]
  );

  const handleTextSubmit = useCallback((submittedText: string) => {
    handleContentReady(submittedText, 'Pasted text');
  }, [handleContentReady]);

  const handleURLSubmit = useCallback((extractedText: string, title: string) => {
    handleContentReady(extractedText, title);
  }, [handleContentReady]);

  const handleStartReading = useCallback((wpm?: number) => {
    setRecommendedWPM(wpm);
    setAppState('reading');
  }, []);

  const handleClose = useCallback(() => {
    setAppState('input');
    setText('');
    setFileName('');
    setRecommendedWPM(undefined);
    clear();
  }, [clear]);

  // Prep screen
  if (appState === 'prep' && text) {
    const tokens = tokenize(text);
    return (
      <PrepScreen
        text={text}
        title={fileName}
        wordCount={tokens.length}
        apiKey={apiKey}
        onStartReading={handleStartReading}
        onSkip={() => setAppState('reading')}
        onBack={handleClose}
      />
    );
  }

  // Reading view
  if (appState === 'reading' && text) {
    const tokens = tokenize(text);
    const readingTime = estimateReadingTime(tokens, recommendedWPM || 300);

    return (
      <main className="relative min-h-screen py-8 px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{fileName}</h1>
              <p className="text-sm text-gray-500">
                {tokens.length.toLocaleString()} words · ~{readingTime} min at {recommendedWPM || 300} WPM
              </p>
            </div>
          </div>
        </div>

        {/* Reader */}
        <RSVPReader
          text={text}
          onClose={handleClose}
          initialWPM={recommendedWPM}
        />
      </main>
    );
  }

  // Input view
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900">SpeedReader</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <p className="text-lg text-gray-600">
            Read faster with RSVP (Rapid Serial Visual Presentation)
          </p>
          {prepEnabled && apiKey && (
            <p className="text-sm text-green-600 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AI prep enabled
            </p>
          )}
          {prepEnabled && !apiKey && (
            <p className="text-sm text-amber-600 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Add OpenAI key in settings for AI prep
            </p>
          )}
        </div>

        {/* Mode tabs */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setInputMode('file')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                inputMode === 'file'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setInputMode('url')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                inputMode === 'url'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              From URL
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                inputMode === 'text'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        {/* Input area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {inputMode === 'file' && (
            <FileUploader
              onFileSelect={handleFileSelect}
              isLoading={isExtracting}
              progressMessage={progress?.message}
            />
          )}
          {inputMode === 'url' && (
            <URLInput onSubmit={handleURLSubmit} />
          )}
          {inputMode === 'text' && (
            <TextInput
              onSubmit={handleTextSubmit}
              placeholder="Paste or type the text you want to speed read..."
            />
          )}

          {/* Error display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold">ORP Highlighting</h3>
            <p className="text-sm text-gray-500">
              Optimal Recognition Point helps your eyes focus faster
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="font-semibold">AI Reading Prep</h3>
            <p className="text-sm text-gray-500">
              Get summaries & glossaries before reading
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h3 className="font-semibold">Multiple Sources</h3>
            <p className="text-sm text-gray-500">
              PDF, DOCX, EPUB, URLs, images, and text
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-400 pt-8">
          <p>
            Built with{' '}
            <a
              href="https://nextjs.org"
              className="underline hover:text-gray-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js
            </a>
            {' · '}
            <a
              href="https://github.com/mozilla/pdf.js"
              className="underline hover:text-gray-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              pdf.js
            </a>
            {' · '}
            <a
              href="https://github.com/nicolo-ribaudo/@mozilla/readability"
              className="underline hover:text-gray-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Readability
            </a>
          </p>
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        prepEnabled={prepEnabled}
        onPrepEnabledChange={handlePrepEnabledChange}
      />
    </main>
  );
}
