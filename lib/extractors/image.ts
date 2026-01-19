import { ProgressCallback } from './types';

/**
 * Extract text from an image using Tesseract.js OCR.
 *
 * @param file - Image file to perform OCR on
 * @param onProgress - Optional progress callback
 * @param language - OCR language (default: 'eng')
 * @returns Extracted text content
 */
export async function extractFromImage(
  file: File,
  onProgress?: ProgressCallback,
  language: string = 'eng'
): Promise<string> {
  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: 'Loading OCR engine...',
  });

  // Dynamic import
  const Tesseract = await import('tesseract.js');

  onProgress?.({
    stage: 'loading',
    progress: 0.1,
    message: 'Initializing OCR (downloading language data if needed)...',
  });

  const result = await Tesseract.recognize(file, language, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress?.({
          stage: 'processing',
          progress: 0.2 + m.progress * 0.7,
          message: `Recognizing text: ${Math.round(m.progress * 100)}%`,
        });
      } else if (m.status === 'loading language traineddata') {
        onProgress?.({
          stage: 'loading',
          progress: 0.1 + m.progress * 0.1,
          message: 'Downloading language data...',
        });
      }
    },
  });

  onProgress?.({
    stage: 'complete',
    progress: 1,
    message: 'OCR complete',
  });

  return result.data.text.trim();
}
