'use client';

import { useEffect, useCallback } from 'react';
import { useRSVP } from '@/hooks/useRSVP';
import { WordDisplay } from './WordDisplay';
import { RSVPControls } from './RSVPControls';

interface RSVPReaderProps {
  /** Text content to read */
  text: string;
  /** Called when user wants to load new content */
  onClose?: () => void;
  /** Initial target WPM from AI recommendation */
  initialWPM?: number;
}

export function RSVPReader({ text, onClose, initialWPM }: RSVPReaderProps) {
  const rsvp = useRSVP(text, {
    config: initialWPM ? { targetWPM: initialWPM } : undefined,
  });

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          rsvp.toggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          rsvp.seekTo(Math.max(0, rsvp.currentIndex - (e.shiftKey ? 50 : 10)));
          break;
        case 'ArrowRight':
          e.preventDefault();
          rsvp.seekTo(Math.min(rsvp.totalWords - 1, rsvp.currentIndex + (e.shiftKey ? 50 : 10)));
          break;
        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            rsvp.reset();
          }
          break;
        case 'Escape':
          e.preventDefault();
          rsvp.pause();
          onClose?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rsvp.updateConfig({ targetWPM: Math.min(800, rsvp.config.targetWPM + 25) });
          break;
        case 'ArrowDown':
          e.preventDefault();
          rsvp.updateConfig({ targetWPM: Math.max(100, rsvp.config.targetWPM - 25) });
          break;
      }
    },
    [rsvp, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Close button */}
      {onClose && (
        <button
          onClick={() => {
            rsvp.pause();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close (Esc)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Word display area */}
      <div className="w-full max-w-3xl px-4">
        <div className="bg-cream rounded-2xl p-8 shadow-sm border border-gray-100">
          {rsvp.currentToken ? (
            <WordDisplay word={rsvp.currentToken.word} />
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400">
              Press play to start reading
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <RSVPControls
        isPlaying={rsvp.isPlaying}
        currentWPM={rsvp.currentWPM}
        progress={rsvp.progress}
        currentIndex={rsvp.currentIndex}
        totalWords={rsvp.totalWords}
        config={rsvp.config}
        onPlay={rsvp.play}
        onPause={rsvp.pause}
        onReset={rsvp.reset}
        onSeek={rsvp.seekTo}
        onConfigChange={rsvp.updateConfig}
      />

      {/* Keyboard shortcuts hint */}
      <div className="text-center text-xs text-gray-400 space-y-1">
        <p>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Space</kbd> Play/Pause
          {' | '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">→</kbd> Skip 10 words
          {' | '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">↑</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">↓</kbd> Speed
        </p>
        <p>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Shift</kbd>+Arrow for 50 words
          {' | '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">R</kbd> Reset
          {' | '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Esc</kbd> Close
        </p>
      </div>
    </div>
  );
}
