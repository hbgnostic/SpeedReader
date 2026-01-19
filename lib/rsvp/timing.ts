import { Token, RSVPConfig } from './types';

/**
 * Calculate the effective WPM at a given word index, accounting for ramp-up.
 *
 * Speed increases linearly from startWPM to targetWPM over rampUpWords.
 */
export function getWPMAtIndex(index: number, config: RSVPConfig): number {
  if (index >= config.rampUpWords) {
    return config.targetWPM;
  }

  // Linear interpolation
  const progress = index / config.rampUpWords;
  return Math.round(
    config.startWPM + (config.targetWPM - config.startWPM) * progress
  );
}

/**
 * Calculate display duration for a token at a given WPM.
 *
 * @param token - The token with its delay multiplier
 * @param wpm - Current words per minute
 * @returns Duration in milliseconds
 */
export function getTokenDelay(token: Token, wpm: number): number {
  const baseDelay = 60000 / wpm; // ms per word at this WPM
  return Math.round(baseDelay * token.delayMultiplier);
}

/**
 * Default timing configuration for a comfortable reading experience.
 */
export const DEFAULT_CONFIG: RSVPConfig = {
  startWPM: 200,
  targetWPM: 350,
  rampUpWords: 30,
};

/**
 * Preset speed configurations
 */
export const SPEED_PRESETS = {
  slow: { startWPM: 150, targetWPM: 250, rampUpWords: 40 },
  normal: { startWPM: 200, targetWPM: 350, rampUpWords: 30 },
  fast: { startWPM: 300, targetWPM: 500, rampUpWords: 25 },
  speed: { startWPM: 400, targetWPM: 700, rampUpWords: 20 },
} as const;
