import { ProgressCallback } from './types';

/**
 * Extract text from a DOCX file using mammoth.js.
 *
 * @param file - DOCX file to extract text from
 * @param onProgress - Optional progress callback
 * @returns Extracted text content
 */
export async function extractFromDOCX(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: 'Loading DOCX library...',
  });

  // Dynamic import
  const mammoth = await import('mammoth');

  onProgress?.({
    stage: 'loading',
    progress: 0.2,
    message: 'Reading DOCX file...',
  });

  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({
    stage: 'processing',
    progress: 0.5,
    message: 'Extracting text from document...',
  });

  // Extract raw text (not HTML) for cleaner output
  const result = await mammoth.extractRawText({ arrayBuffer });

  if (result.messages.length > 0) {
    console.warn('DOCX extraction warnings:', result.messages);
  }

  onProgress?.({
    stage: 'complete',
    progress: 1,
    message: 'DOCX extraction complete',
  });

  return result.value.trim();
}
