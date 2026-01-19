import { ProgressCallback } from './types';

/**
 * Extract text from a plain text file.
 *
 * @param file - Text file to read
 * @param onProgress - Optional progress callback
 * @returns File content as text
 */
export async function extractFromText(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: 'Reading text file...',
  });

  const text = await file.text();

  onProgress?.({
    stage: 'complete',
    progress: 1,
    message: 'Text file loaded',
  });

  return text.trim();
}
