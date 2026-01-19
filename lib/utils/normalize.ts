/**
 * Text normalization utilities for cleaning extracted text before tokenization.
 */

/**
 * Normalize whitespace in text.
 * - Converts all whitespace sequences to single spaces
 * - Preserves paragraph breaks (double newlines)
 * - Trims leading/trailing whitespace
 */
export function normalizeWhitespace(text: string): string {
  return text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Preserve paragraph breaks
    .replace(/\n{3,}/g, '\n\n')
    // Convert other whitespace to single spaces
    .replace(/[^\S\n]+/g, ' ')
    // Clean up space around newlines
    .replace(/ *\n */g, '\n')
    .trim();
}

/**
 * Remove common artifacts from PDF extraction.
 */
export function cleanPDFArtifacts(text: string): string {
  return text
    // Remove page numbers (common patterns)
    .replace(/^\s*\d+\s*$/gm, '')
    // Remove headers/footers that appear on every page (heuristic)
    .replace(/^.{0,50}Page \d+ of \d+.{0,50}$/gm, '')
    // Remove excessive dashes (often used as separators)
    .replace(/-{5,}/g, '')
    // Clean up bullet points
    .replace(/^[•◦▪▸►]\s*/gm, '');
}

/**
 * Fix common OCR errors.
 */
export function fixOCRErrors(text: string): string {
  return text
    // Common substitutions
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    // Fix common misreadings
    .replace(/\bl\b/g, 'I') // Standalone 'l' is usually 'I'
    .replace(/\brn\b/g, 'm') // 'rn' often misread for 'm'
    // Remove noise characters
    .replace(/[|¦]/g, '');
}

/**
 * Smart quote normalization - convert fancy quotes to standard.
 */
export function normalizeQuotes(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // Single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // Double quotes
    .replace(/[\u2032]/g, "'") // Prime
    .replace(/[\u2033]/g, '"'); // Double prime
}

/**
 * Remove or normalize special characters that may cause issues.
 */
export function normalizeSpecialChars(text: string): string {
  return text
    // Normalize dashes
    .replace(/[\u2013\u2014]/g, '-') // En-dash, em-dash
    // Normalize ellipsis
    .replace(/\u2026/g, '...')
    // Remove zero-width characters
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
}

/**
 * Full normalization pipeline.
 */
export function normalizeText(text: string, options: { isOCR?: boolean; isPDF?: boolean } = {}): string {
  let result = text;

  result = normalizeQuotes(result);
  result = normalizeSpecialChars(result);

  if (options.isPDF) {
    result = cleanPDFArtifacts(result);
  }

  if (options.isOCR) {
    result = fixOCRErrors(result);
  }

  result = normalizeWhitespace(result);

  return result;
}
