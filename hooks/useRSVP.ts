'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Token, RSVPConfig, RSVPState, tokenize, getWPMAtIndex, getTokenDelay, DEFAULT_CONFIG } from '@/lib/rsvp';

interface UseRSVPOptions {
  /** Initial RSVP configuration */
  config?: Partial<RSVPConfig>;
  /** Callback when playback ends */
  onComplete?: () => void;
}

interface UseRSVPReturn extends RSVPState {
  /** Total number of words/tokens */
  totalWords: number;
  /** All tokens (for seeking, etc.) */
  tokens: Token[];
  /** Current configuration */
  config: RSVPConfig;
  /** Start/resume playback */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Reset to beginning */
  reset: () => void;
  /** Toggle play/pause */
  toggle: () => void;
  /** Seek to a specific word index */
  seekTo: (index: number) => void;
  /** Update WPM settings on the fly */
  updateConfig: (newConfig: Partial<RSVPConfig>) => void;
  /** Update the text content */
  setText: (text: string) => void;
}

export function useRSVP(initialText: string, options: UseRSVPOptions = {}): UseRSVPReturn {
  // Merge config with defaults
  const [config, setConfig] = useState<RSVPConfig>({
    ...DEFAULT_CONFIG,
    ...options.config,
  });

  // Tokenize text
  const [tokens, setTokens] = useState<Token[]>(() => tokenize(initialText));

  // Playback state
  const [state, setState] = useState<RSVPState>({
    currentToken: tokens[0] || null,
    currentIndex: 0,
    isPlaying: false,
    currentWPM: config.startWPM,
    progress: 0,
  });

  // Refs for timer management
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);
  const configRef = useRef(config);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Clear any existing timeout
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Advance to next word
  const advance = useCallback(() => {
    const nextIndex = indexRef.current + 1;

    if (nextIndex >= tokens.length) {
      // Reached the end
      setState((prev) => ({
        ...prev,
        isPlaying: false,
      }));
      options.onComplete?.();
      return;
    }

    indexRef.current = nextIndex;
    const nextToken = tokens[nextIndex];
    const wpm = getWPMAtIndex(nextIndex, configRef.current);

    setState({
      currentToken: nextToken,
      currentIndex: nextIndex,
      isPlaying: true,
      currentWPM: wpm,
      progress: nextIndex / tokens.length,
    });

    // Schedule next word
    const delay = getTokenDelay(nextToken, wpm);
    timeoutRef.current = setTimeout(advance, delay);
  }, [tokens, options]);

  // Play/resume
  const play = useCallback(() => {
    if (tokens.length === 0) return;

    // Reset if at end
    if (indexRef.current >= tokens.length - 1) {
      indexRef.current = 0;
    }

    const token = tokens[indexRef.current];
    const wpm = getWPMAtIndex(indexRef.current, configRef.current);

    setState((prev) => ({
      ...prev,
      currentToken: token,
      currentIndex: indexRef.current,
      isPlaying: true,
      currentWPM: wpm,
      progress: indexRef.current / tokens.length,
    }));

    const delay = getTokenDelay(token, wpm);
    timeoutRef.current = setTimeout(advance, delay);
  }, [tokens, advance]);

  // Pause
  const pause = useCallback(() => {
    clearTimer();
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, [clearTimer]);

  // Reset to beginning
  const reset = useCallback(() => {
    clearTimer();
    indexRef.current = 0;
    setState({
      currentToken: tokens[0] || null,
      currentIndex: 0,
      isPlaying: false,
      currentWPM: configRef.current.startWPM,
      progress: 0,
    });
  }, [tokens, clearTimer]);

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  // Seek to specific index
  const seekTo = useCallback(
    (index: number) => {
      const wasPlaying = state.isPlaying;
      clearTimer();

      const clampedIndex = Math.max(0, Math.min(index, tokens.length - 1));
      indexRef.current = clampedIndex;

      const token = tokens[clampedIndex];
      const wpm = getWPMAtIndex(clampedIndex, configRef.current);

      setState({
        currentToken: token || null,
        currentIndex: clampedIndex,
        isPlaying: false,
        currentWPM: wpm,
        progress: tokens.length > 0 ? clampedIndex / tokens.length : 0,
      });

      if (wasPlaying && token) {
        // Resume playback from new position
        const delay = getTokenDelay(token, wpm);
        setState((prev) => ({ ...prev, isPlaying: true }));
        timeoutRef.current = setTimeout(advance, delay);
      }
    },
    [tokens, state.isPlaying, clearTimer, advance]
  );

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<RSVPConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Update text content
  const setText = useCallback((text: string) => {
    clearTimer();
    const newTokens = tokenize(text);
    setTokens(newTokens);
    indexRef.current = 0;
    setState({
      currentToken: newTokens[0] || null,
      currentIndex: 0,
      isPlaying: false,
      currentWPM: configRef.current.startWPM,
      progress: 0,
    });
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // Re-tokenize if initial text changes (from parent)
  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText, setText]);

  return {
    ...state,
    totalWords: tokens.length,
    tokens,
    config,
    play,
    pause,
    reset,
    toggle,
    seekTo,
    updateConfig,
    setText,
  };
}
