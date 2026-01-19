import { ORPWord } from './types';

/**
 * Calculate the Optimal Recognition Point (ORP) index for a word.
 *
 * The ORP is where the eye naturally focuses for fastest word recognition.
 * Research suggests this is approximately 25-35% into the word, slightly
 * left of center.
 *
 * Rules:
 * - 1 char: position 0 (the only character)
 * - 2-5 chars: position 1 (second character)
 * - 6-9 chars: position 2 (third character)
 * - 10-13 chars: position 3 (fourth character)
 * - 14+ chars: position 4 (fifth character)
 */
export function calculateORP(word: string): number {
  // Use spread to handle unicode correctly (emoji, accented chars)
  const chars = [...word];
  const len = chars.length;

  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

/**
 * Split a word into three parts for rendering with ORP highlight.
 *
 * @param word - The word to split
 * @returns Object with before, orp (highlighted char), and after
 */
export function splitWordAtORP(word: string): ORPWord {
  // Handle unicode correctly
  const chars = [...word];
  const orpIndex = calculateORP(word);

  return {
    before: chars.slice(0, orpIndex).join(''),
    orp: chars[orpIndex] || '',
    after: chars.slice(orpIndex + 1).join(''),
  };
}
