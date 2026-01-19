export interface Token {
  /** The word to display */
  word: string;
  /** Index of the ORP character within the word */
  orpIndex: number;
  /** Multiplier for display duration (1.0 = normal) */
  delayMultiplier: number;
  /** Whether this word ends a sentence */
  isEndOfSentence: boolean;
  /** Whether this word ends a paragraph */
  isEndOfParagraph: boolean;
}

export interface ORPWord {
  /** Characters before the ORP */
  before: string;
  /** The ORP character (to be highlighted) */
  orp: string;
  /** Characters after the ORP */
  after: string;
}

export interface RSVPConfig {
  /** Starting words per minute */
  startWPM: number;
  /** Target words per minute after ramp-up */
  targetWPM: number;
  /** Number of words over which to ramp up speed */
  rampUpWords: number;
}

export interface RSVPState {
  /** Currently displayed token */
  currentToken: Token | null;
  /** Index in the token array */
  currentIndex: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Current effective WPM */
  currentWPM: number;
  /** Progress through text (0-1) */
  progress: number;
}
