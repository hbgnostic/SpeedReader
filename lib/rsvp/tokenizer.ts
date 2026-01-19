import { Token } from './types';
import { calculateORP } from './orp';

// Punctuation patterns for timing adjustments
const LONG_PAUSE = /[.!?]/; // End of sentence - longest pause
const MEDIUM_PAUSE = /[;:—–]/; // Semicolon, colon, em-dash
const SHORT_PAUSE = /[,]/; // Comma - brief pause

// Pattern for detecting URLs (to give them extra time)
const URL_PATTERN = /^https?:\/\/\S+$/i;

// Pattern for hyphenated words
const HYPHENATED = /^\w+(-\w+)+$/;

/**
 * Pre-process text to protect special patterns from being split incorrectly.
 */
function preprocessText(text: string): string {
  let processed = text;

  // Normalize line endings
  processed = processed.replace(/\r\n/g, '\n');

  // Protect numbers with commas (1,234 -> 1__COMMA__234)
  processed = processed.replace(/(\d),(\d)/g, '$1__COMMA__$2');

  // Protect decimal numbers (1.5 -> 1__DECIMAL__5)
  processed = processed.replace(/(\d)\.(\d)/g, '$1__DECIMAL__$2');

  // Protect abbreviations like U.S.A. (simple heuristic)
  processed = processed.replace(/([A-Z])\.([A-Z])/g, '$1__DOT__$2');

  return processed;
}

/**
 * Restore protected patterns in a word.
 */
function restoreWord(word: string): string {
  return word
    .replace(/__COMMA__/g, ',')
    .replace(/__DECIMAL__/g, '.')
    .replace(/__DOT__/g, '.');
}

/**
 * Calculate delay multiplier for a word based on its characteristics.
 */
function calculateDelayMultiplier(word: string): number {
  let multiplier = 1.0;

  // Check punctuation at end of word
  const lastChar = word.slice(-1);

  if (LONG_PAUSE.test(lastChar)) {
    multiplier = 2.5; // Sentence end - significant pause
  } else if (MEDIUM_PAUSE.test(lastChar)) {
    multiplier = 1.8; // Semi-pause
  } else if (SHORT_PAUSE.test(lastChar)) {
    multiplier = 1.3; // Brief pause for comma
  }

  // Long words need more processing time
  const wordLength = [...word].length; // Unicode-safe length
  if (wordLength > 12) {
    multiplier *= 1.3;
  } else if (wordLength > 8) {
    multiplier *= 1.15;
  }

  // Hyphenated compound words
  if (HYPHENATED.test(word)) {
    multiplier *= 1.15;
  }

  // URLs get extra time (they're hard to read in RSVP)
  if (URL_PATTERN.test(word)) {
    multiplier = 3.0;
  }

  return multiplier;
}

/**
 * Tokenize text into an array of tokens with timing metadata.
 *
 * @param text - Raw text to tokenize
 * @returns Array of tokens ready for RSVP display
 */
export function tokenize(text: string): Token[] {
  if (!text || !text.trim()) {
    return [];
  }

  const processed = preprocessText(text);

  // Split into paragraphs (double newline or more)
  const paragraphs = processed
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const tokens: Token[] = [];

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const paragraph = paragraphs[pIdx];

    // Split paragraph into words (any whitespace)
    const words = paragraph.split(/\s+/).filter((w) => w.length > 0);

    for (let wIdx = 0; wIdx < words.length; wIdx++) {
      const rawWord = words[wIdx];
      const word = restoreWord(rawWord);

      const isLastInParagraph = wIdx === words.length - 1;
      const isLastParagraph = pIdx === paragraphs.length - 1;
      const lastChar = word.slice(-1);

      let delayMultiplier = calculateDelayMultiplier(word);

      // Extra pause at end of paragraphs
      if (isLastInParagraph && !isLastParagraph) {
        delayMultiplier = Math.max(delayMultiplier, 2.0);
      }

      tokens.push({
        word,
        orpIndex: calculateORP(word),
        delayMultiplier,
        isEndOfSentence: LONG_PAUSE.test(lastChar),
        isEndOfParagraph: isLastInParagraph && !isLastParagraph,
      });
    }
  }

  return tokens;
}

/**
 * Get word count from tokens (for display purposes).
 */
export function getWordCount(tokens: Token[]): number {
  return tokens.length;
}

/**
 * Estimate reading time at a given WPM.
 */
export function estimateReadingTime(tokens: Token[], wpm: number): number {
  // Account for delay multipliers
  const totalDelayUnits = tokens.reduce((sum, t) => sum + t.delayMultiplier, 0);
  const averageMultiplier = totalDelayUnits / tokens.length;

  const effectiveWPM = wpm / averageMultiplier;
  const minutes = tokens.length / effectiveWPM;

  return Math.ceil(minutes);
}
