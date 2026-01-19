'use client';

import { RSVPConfig, SPEED_PRESETS } from '@/lib/rsvp';

interface RSVPControlsProps {
  /** Whether currently playing */
  isPlaying: boolean;
  /** Current WPM */
  currentWPM: number;
  /** Progress (0-1) */
  progress: number;
  /** Current word index */
  currentIndex: number;
  /** Total words */
  totalWords: number;
  /** Current config */
  config: RSVPConfig;
  /** Play callback */
  onPlay: () => void;
  /** Pause callback */
  onPause: () => void;
  /** Reset callback */
  onReset: () => void;
  /** Seek callback */
  onSeek: (index: number) => void;
  /** Config update callback */
  onConfigChange: (config: Partial<RSVPConfig>) => void;
}

export function RSVPControls({
  isPlaying,
  currentWPM,
  progress,
  currentIndex,
  totalWords,
  config,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onConfigChange,
}: RSVPControlsProps) {
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onSeek(value);
  };

  const handleTargetWPMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onConfigChange({ targetWPM: value });
  };

  const applyPreset = (presetName: keyof typeof SPEED_PRESETS) => {
    onConfigChange(SPEED_PRESETS[presetName]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Word {currentIndex + 1} of {totalWords.toLocaleString()}
          </span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={totalWords - 1}
          value={currentIndex}
          onChange={handleProgressChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Reset"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        <button
          onClick={() => onSeek(Math.max(0, currentIndex - 10))}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Back 10 words"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
            />
          </svg>
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => onSeek(Math.min(totalWords - 1, currentIndex + 10))}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Forward 10 words"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
            />
          </svg>
        </button>
      </div>

      {/* Speed controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Target Speed</span>
          <span className="text-sm font-mono text-gray-600">{config.targetWPM} WPM</span>
        </div>

        <input
          type="range"
          min={100}
          max={800}
          step={25}
          value={config.targetWPM}
          onChange={handleTargetWPMChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
        />

        {/* Speed presets */}
        <div className="flex gap-2 justify-center flex-wrap">
          {(Object.keys(SPEED_PRESETS) as Array<keyof typeof SPEED_PRESETS>).map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                config.targetWPM === SPEED_PRESETS[preset].targetWPM
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current WPM indicator */}
      <div className="text-center text-sm text-gray-500">
        Current: <span className="font-mono font-medium">{currentWPM} WPM</span>
        {currentIndex < config.rampUpWords && (
          <span className="ml-2 text-amber-600">(ramping up...)</span>
        )}
      </div>
    </div>
  );
}
